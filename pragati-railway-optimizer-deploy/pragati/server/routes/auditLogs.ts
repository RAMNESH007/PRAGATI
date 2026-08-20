import { Router } from 'express';
import { db } from '../database/db';

export const auditLogsRouter = Router();

// Get audit logs
auditLogsRouter.get('/', (req, res) => {
  const { zone, search } = req.query;
  let logs = db.getAuditLogs();

  if (zone && zone !== 'All Zones') {
    logs = logs.filter(l => l.zone.toLowerCase().includes(String(zone).toLowerCase()));
  }

  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(l => 
      l.action.toLowerCase().includes(q) ||
      l.decision.toLowerCase().includes(q) ||
      l.reason.toLowerCase().includes(q) ||
      (l.trainNumber && l.trainNumber.includes(q)) ||
      l.operatorName.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, count: logs.length, auditLogs: logs });
});

// Record audit log entry
auditLogsRouter.post('/', (req, res) => {
  const { action, decision, reason, trainNumber, operatorName, role, zone, status } = req.body;

  const newLog = {
    id: 'log-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    operatorId: 'OP-102',
    operatorName: operatorName || 'Authorized Operator',
    role: role || 'OPERATOR',
    action: action || 'Operational Decision Logged',
    trainNumber,
    decision: decision || '',
    reason: reason || '',
    zone: zone || 'Northern Railway',
    status: status || 'SUCCESS'
  };

  db.addAuditLog(newLog);

  return res.json({ success: true, log: newLog });
});
