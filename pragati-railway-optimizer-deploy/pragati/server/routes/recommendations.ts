import { Router } from 'express';
import { db } from '../database/db';
import { telemetryWorker } from '../services/telemetryWorker';

export const recommendationsRouter = Router();

// Get all AI recommendations
recommendationsRouter.get('/', (req, res) => {
  const { status, zone } = req.query;
  let recs = db.getRecommendations();

  if (status) {
    recs = recs.filter(r => r.status === status);
  }

  if (zone && zone !== 'All Zones') {
    recs = recs.filter(r => r.zone.toLowerCase().includes(String(zone).toLowerCase()));
  }

  return res.json({ success: true, count: recs.length, recommendations: recs });
});

// Approve recommendation (Human-in-the-loop)
recommendationsRouter.post('/:id/approve', (req, res) => {
  const { id } = req.params;
  const { operatorName, notes } = req.body;

  const rec = db.getRecommendations().find(r => r.id === id);
  if (!rec) {
    return res.status(404).json({ success: false, message: 'Recommendation not found' });
  }

  const updatedRec = db.updateRecommendation(id, {
    status: 'APPROVED',
    reviewedBy: operatorName || 'Authorized Operator',
    reviewedAt: new Date().toLocaleTimeString()
  });

  // Apply changes to target train in database
  if (rec.type === 'HOLD_TRAIN') {
    db.updateTrain(rec.trainNumber, { status: 'HOLD', speedKmH: 0 });
  } else if (rec.type === 'ALLOW_TRAIN') {
    db.updateTrain(rec.trainNumber, { status: 'ON_TIME', delayMinutes: 0, speedKmH: 125 });
  } else if (rec.type === 'CHANGE_PLATFORM' && rec.actionDetails?.assignedPlatform) {
    db.updateTrain(rec.trainNumber, { platform: rec.actionDetails.assignedPlatform });
  }

  // Record audit log
  db.addAuditLog({
    id: 'log-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    operatorId: 'OP-102',
    operatorName: operatorName || 'Authorized Operator',
    role: 'OPERATOR',
    action: 'Approved AI Recommendation',
    trainNumber: rec.trainNumber,
    decision: `Executed: ${rec.recommendation}`,
    reason: notes || rec.reason,
    zone: rec.zone,
    status: 'SUCCESS'
  });

  // Broadcast WebSocket update
  telemetryWorker.broadcast({
    type: 'RECOMMENDATION_APPROVED',
    recommendation: updatedRec,
    trains: db.getTrains()
  });

  return res.json({ success: true, recommendation: updatedRec, message: 'Recommendation approved & executed' });
});

// Reject recommendation
recommendationsRouter.post('/:id/reject', (req, res) => {
  const { id } = req.params;
  const { operatorName, reason } = req.body;

  const rec = db.getRecommendations().find(r => r.id === id);
  if (!rec) {
    return res.status(404).json({ success: false, message: 'Recommendation not found' });
  }

  const updatedRec = db.updateRecommendation(id, {
    status: 'REJECTED',
    reviewedBy: operatorName || 'Authorized Operator',
    reviewedAt: new Date().toLocaleTimeString()
  });

  db.addAuditLog({
    id: 'log-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    operatorId: 'OP-102',
    operatorName: operatorName || 'Authorized Operator',
    role: 'OPERATOR',
    action: 'Rejected AI Recommendation',
    trainNumber: rec.trainNumber,
    decision: 'Rejected AI Proposal',
    reason: reason || 'Operator manual judgment override',
    zone: rec.zone,
    status: 'WARNING'
  });

  telemetryWorker.broadcast({
    type: 'RECOMMENDATION_REJECTED',
    recommendation: updatedRec
  });

  return res.json({ success: true, recommendation: updatedRec });
});
