import { Router } from 'express';
import { db } from '../database/db';

export const trainsRouter = Router();

// Get all trains or filter by zone / status
trainsRouter.get('/', (req, res) => {
  const { zone, status } = req.query;
  let trains = db.getTrains();

  if (zone && zone !== 'All Zones') {
    trains = trains.filter(t => t.zone.toLowerCase() === (zone as string).toLowerCase());
  }

  if (status) {
    trains = trains.filter(t => t.status === status);
  }

  return res.json({ success: true, count: trains.length, trains });
});

// Get specific train
trainsRouter.get('/:id', (req, res) => {
  const train = db.getTrainByNumber(req.params.id);
  if (!train) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }
  return res.json({ success: true, train });
});

// Manual controller override (platform change, hold, speed regulation, etc.)
// Matches the frontend's RailwayApi.overrideTrain() call.
trainsRouter.post('/:id/override', (req, res) => {
  const { platform, stationCode, reason, status, speedKmH, operatorName } = req.body;

  const updates: Record<string, any> = {};
  if (platform !== undefined) updates.platform = platform;
  if (status !== undefined) updates.status = status;
  if (speedKmH !== undefined) updates.speedKmH = speedKmH;

  const updated = db.updateTrain(req.params.id, updates);

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }

  db.addAuditLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    operatorId: 'operator-1',
    operatorName: operatorName || 'Suresh Verma',
    role: 'OPERATOR',
    action: 'MANUAL_OVERRIDE',
    trainNumber: req.params.id,
    decision: platform !== undefined
      ? `Reassigned to Platform ${platform} at ${stationCode || 'Station'}`
      : `Manual override applied: ${JSON.stringify(updates)}`,
    reason: reason || 'Operational adjustment',
    zone: updated.zone,
    status: 'SUCCESS'
  });

  return res.json({ success: true, train: updated });
});

// Keep the old platform-only path as an alias for backward compatibility
trainsRouter.post('/:id/platform', (req, res) => {
  const { platform, stationCode, reason } = req.body;
  const updated = db.updateTrainPlatform(req.params.id, platform);

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }

  db.addAuditLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    operatorId: 'operator-1',
    operatorName: 'Suresh Verma',
    role: 'OPERATOR',
    action: 'PLATFORM_REASSIGNMENT',
    trainNumber: req.params.id,
    decision: `Reassigned to Platform ${platform} at ${stationCode || 'Station'}`,
    reason: reason || 'Operational adjustment',
    zone: updated.zone,
    status: 'SUCCESS'
  });

  return res.json({ success: true, train: updated });
});
