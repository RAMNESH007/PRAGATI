import { Router } from 'express';
import { db } from '../database/db';
import { telemetryWorker } from '../services/telemetryWorker';

export const emergencyRouter = Router();

// Get current emergency status
emergencyRouter.get('/', (req, res) => {
  const state = db.getEmergencyState();
  return res.json({ success: true, emergency: state });
});

// Trigger emergency block
emergencyRouter.post('/trigger', (req, res) => {
  const { section, reason, operatorName } = req.body;

  const targetSection = section || 'Kanpur – Tundla Quad Section';
  const targetReason = reason || 'Emergency Section Interlocking Interruption';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const emergencyDetails = {
    section: targetSection,
    reason: targetReason,
    timestamp,
    declaredBy: operatorName || 'Authorized Controller',
    lockedTracks: ['MAIN_UP', 'MAIN_DN', 'LOOP_1', 'LOOP_2']
  };

  db.setEmergencyState({
    isEmergencyActive: true,
    emergencyDetails
  });

  // Hold trains in this section and halt them
  const currentTrains = db.getTrains();
  const updatedTrains = currentTrains.map(t => {
    if (t.currentStation.includes('Kanpur') || t.currentStation.includes('Tundla') || targetSection.includes(t.currentStation)) {
      return {
        ...t,
        status: 'HOLD' as const,
        speedKmH: 0
      };
    }
    return t;
  });
  db.setTrains(updatedTrains);

  // Add critical alert
  db.addAlert({
    id: 'alert-emergency-' + Date.now(),
    title: `EMERGENCY TRACK BLOCK: ${targetSection}`,
    description: `All train movements halted due to: ${targetReason}`,
    severity: 'CRITICAL',
    zone: 'Northern Railway',
    section: targetSection,
    timestamp,
    acknowledged: false,
    actionRequired: 'Awaiting section safety clearance by Section Engineer / Controller'
  });

  // Add audit log
  db.addAuditLog({
    id: 'log-emg-' + Date.now(),
    timestamp,
    operatorId: 'OP-102',
    operatorName: operatorName || 'Authorized Controller',
    role: 'OPERATOR',
    action: 'Declared Emergency Section Block',
    decision: `Imposed Section Block on ${targetSection}`,
    reason: targetReason,
    zone: 'Northern Railway',
    status: 'EMERGENCY'
  });

  // Broadcast WebSocket event to all connected Admins & Operators
  telemetryWorker.broadcast({
    type: 'EMERGENCY_TRIGGERED',
    emergencyState: { isEmergencyActive: true, emergencyDetails },
    trains: updatedTrains
  });

  return res.json({ success: true, emergency: { isEmergencyActive: true, emergencyDetails } });
});

// Resolve emergency permanently & restore traffic
emergencyRouter.post('/resolve', (req, res) => {
  const { notes, operatorName } = req.body;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const prevState = db.getEmergencyState();
  const targetSection = prevState.emergencyDetails?.section || 'Kanpur – Tundla';

  db.setEmergencyState({
    isEmergencyActive: false,
    emergencyDetails: null
  });

  // Restore trains to active running state
  const currentTrains = db.getTrains();
  const updatedTrains = currentTrains.map(t => {
    if (t.status === 'HOLD') {
      return {
        ...t,
        status: 'ON_TIME' as const,
        speedKmH: t.type === 'VANDE_BHARAT' ? 130 : (t.type === 'RAJDHANI' ? 120 : 85)
      };
    }
    return t;
  });
  db.setTrains(updatedTrains);

  // Record safety resolution in audit log
  db.addAuditLog({
    id: 'log-res-' + Date.now(),
    timestamp,
    operatorId: 'OP-102',
    operatorName: operatorName || 'Authorized Controller',
    role: 'OPERATOR',
    action: 'Resolved Emergency Block Permanently',
    decision: `Cleared Emergency Lock & Restored Nominal Traffic on ${targetSection}`,
    reason: notes || 'Track inspection verified clear. Normal signaling restored.',
    zone: 'Northern Railway',
    status: 'SUCCESS'
  });

  // Broadcast WebSocket event
  telemetryWorker.broadcast({
    type: 'EMERGENCY_RESOLVED',
    emergencyState: { isEmergencyActive: false, emergencyDetails: null },
    trains: updatedTrains
  });

  return res.json({ success: true, message: 'Emergency block permanently resolved. Nominal traffic restored.' });
});
