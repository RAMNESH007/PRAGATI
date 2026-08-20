import { Router } from 'express';
import { db } from '../database/db';
import { telemetryWorker } from '../services/telemetryWorker';

export const alertsRouter = Router();

// Get all alerts (both active & resolved)
alertsRouter.get('/', (req, res) => {
  const { zone, status } = req.query;
  let alerts = db.getAlerts();

  if (zone && zone !== 'All Zones') {
    alerts = alerts.filter(a => a.zone.toLowerCase().includes(String(zone).toLowerCase()));
  }

  if (status === 'ACTIVE') {
    alerts = alerts.filter(a => !a.isResolved);
  } else if (status === 'RESOLVED') {
    alerts = alerts.filter(a => a.isResolved);
  }

  return res.json({ success: true, count: alerts.length, alerts });
});

// Mark alert as resolved
alertsRouter.post('/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { operatorName } = req.body;

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const updated = db.updateAlert(id, {
    isResolved: true,
    acknowledged: true,
    resolvedAt: timestamp,
    resolvedBy: operatorName || 'Authorized Operator'
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  telemetryWorker.broadcast({
    type: 'ALERT_RESOLVED',
    alert: updated
  });

  return res.json({ success: true, alert: updated, message: 'Alert marked as resolved' });
});

// Create new alert
alertsRouter.post('/', (req, res) => {
  const { title, description, message, severity, category, zone, section, actionRequired, affectedTrains } = req.body;

  const newAlert = {
    id: 'alert-' + Date.now(),
    title: title || 'Operational Safety Notice',
    description: description || message || '',
    severity: severity || 'WARNING',
    category: category || 'SIGNAL_FAILURE',
    zone: zone || 'Northern Railway',
    section: section || 'Main Trunk',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    acknowledged: false,
    isResolved: false,
    actionRequired,
    affectedTrains: affectedTrains || []
  };

  db.addAlert(newAlert);

  telemetryWorker.broadcast({
    type: 'NEW_ALERT',
    alert: newAlert
  });

  return res.json({ success: true, alert: newAlert });
});
