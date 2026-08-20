import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { authRouter } from './routes/auth';
import { zonesRouter } from './routes/zones';
import { trainsRouter } from './routes/trains';
import { recommendationsRouter } from './routes/recommendations';
import { alertsRouter } from './routes/alerts';
import { emergencyRouter } from './routes/emergency';
import { auditLogsRouter } from './routes/auditLogs';
import { simulationRouter } from './routes/simulation';
import { railradarRouter } from './routes/railradar';
import { telemetryWorker } from './services/telemetryWorker';
import { db } from './database/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

import { supabaseDb, SUPABASE_SQL_SCHEMA } from './database/supabaseClient';

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'PRAGATI Railway Optimizer Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: supabaseDb.getStatus(),
    zonesConnected: db.getZones().length,
    activeTrains: db.getTrains().length,
    emergencyActive: db.getEmergencyState().isEmergencyActive
  });
});

// Database & Schema Inspection Endpoint
app.get('/api/database/status', (req, res) => {
  res.json({
    success: true,
    database: supabaseDb.getStatus(),
    schemaSql: SUPABASE_SQL_SCHEMA,
    stats: {
      zones: db.getZones().length,
      trains: db.getTrains().length,
      recommendations: db.getRecommendations().length,
      alerts: db.getAlerts().length,
      auditLogs: db.getAuditLogs().length,
      emergencyActive: db.getEmergencyState().isEmergencyActive
    }
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/trains', trainsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/railradar', railradarRouter);

// Serve the built frontend (dist/) in production so the whole app runs as
// ONE deployable service — no separate frontend host needed.
// `npm run build` (tsc && vite build) must be run first so dist/ exists.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));

  // SPA fallback: any non-API route serves index.html so React Router
  // can handle client-side routes like /admin/dashboard on a hard refresh.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Create HTTP Server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('🔌 New client connected to live PRAGATI WebSocket feed');
  telemetryWorker.registerClient(ws);
});

// Start background telemetry GPS worker
telemetryWorker.start();

// Listen
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 PRAGATI Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Live Stream ready at ws://localhost:${PORT}/ws`);
  console.log(`💾 Database: SQLite (pragati.db.json) initialized`);
  console.log(`====================================================`);
});
