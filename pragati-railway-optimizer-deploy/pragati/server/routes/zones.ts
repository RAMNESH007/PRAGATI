import { Router } from 'express';
import { db } from '../database/db';

export const zonesRouter = Router();

// Get all 17 railway zones
zonesRouter.get('/', (req, res) => {
  const zones = db.getZones();
  return res.json({ success: true, count: zones.length, zones });
});

// Get specific zone by code or name
zonesRouter.get('/:identifier', (req, res) => {
  const { identifier } = req.params;
  const zones = db.getZones();
  const zone = zones.find(z => 
    z.code.toLowerCase() === identifier.toLowerCase() ||
    z.name.toLowerCase().includes(identifier.toLowerCase()) ||
    z.id.toLowerCase() === identifier.toLowerCase()
  );

  if (!zone) {
    return res.status(404).json({ success: false, message: 'Railway Zone not found' });
  }

  return res.json({ success: true, zone });
});
