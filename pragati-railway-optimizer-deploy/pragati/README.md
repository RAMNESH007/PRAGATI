# PRAGATI — AI-Powered Indian Railway Traffic Optimizer & Decision Support System
### Smart India Hackathon Problem Statement: **25022 — Maximizing Section Throughput Using AI-Powered Precise Train Traffic Control**
### Ministry of Railways • Government of India

---

## 🌟 Executive Summary

**PRAGATI** (*Predictive Railway Analytics & Growth Acceleration through Traffic Intelligence*) is an enterprise-grade full-stack AI decision-support platform engineered to maximize Indian Railways' section throughput, mitigate bottleneck congestion, prevent cascading delays, and ensure 100% safety with **Human-in-the-Loop manual control** and **ISRO Bhuvan Satellite GIS train tracking**.

---

## 🎯 Full-Stack Architecture

```
                               ┌────────────────────────┐
                               │     React Frontend     │
                               │  (Vite + TailwindCSS)  │
                               └───────────┬────────────┘
                                           │ (HTTP REST / WebSocket)
                                           ▼
                               ┌────────────────────────┐
                               │ Express Backend Server │
                               │  (Node.js + TypeScript)│
                               └───────────┬────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       ┌────────────────────────┐                   ┌────────────────────────┐
       │  Supabase (PostgreSQL) │                   │     RailRadar API      │
       │   Database & Storage   │                   │ (Live NTES GPS Feeds)  │
       └────────────────────────┘                   └────────────────────────┘
```

1. **Frontend**: React 18, TypeScript, TailwindCSS, Lucide Icons, Leaflet GIS (`react-leaflet`).
2. **Backend**: Express.js, TypeScript (`tsx`), WebSockets (`ws`), CORS, Dotenv.
3. **Database**: Supabase (PostgreSQL) with hybrid persistent adapter storage (`server/database/pragati.db.json`).
4. **Live GIS & Maps**: ISRO Bhuvan Satellite WMS with 3s OpenStreetMap auto-fallback, OpenRailwayMap infrastructure layers, and RailRadar live telemetry proxy.

---

## 🔑 Access Credentials

| Role | Username | Password | Default Scope | Portal URL |
| :--- | :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin` | `admin123` | **All 17 Railway Zones** | `/admin/dashboard` |
| **Zone Operator** | `operator` | `operator123` | **Northern Railway** | `/operator/dashboard` |

---

## 🚀 Quick Start & Local Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `RAILRADAR_API_KEY` or `SUPABASE_URL` if connecting to cloud instances; otherwise, the built-in persistent local database and NTES simulation run immediately out of the box).*

### 3. Run the Full-Stack Application
In two terminal tabs:

**Terminal 1 (Backend Server & WebSockets - Port 5000):**
```bash
npm run server
```

**Terminal 2 (Frontend Dev Server - Port 5173):**
```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📦 Deployment Instructions

### Option A: 1-Click Platform Deployment (Render / Railway / Heroku)
1. Push this repository to GitHub or upload the provided `.zip` archive.
2. Create a Web Service:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run server`
   - **Environment Variables**: `PORT=5000`, `NODE_ENV=production`

### Option B: Frontend (Vercel / Netlify) + Backend (Render / Railway)
1. **Frontend**: Deploy with Root Directory `./` and Output Directory `dist/`.
   - Build command: `npm run build`
2. **Backend**: Deploy `server/` on Render/Railway.
   - Set `VITE_API_URL` to your backend URL.

### Option C: Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "server"]
```

---

## 🛡️ RDSO Safety & Compliance

* **Human-in-the-Loop**: Authorized controllers review, approve, reject (with engineering justification), or customize all AI recommendations before signal interlocking execution.
* **Audit Trail**: Every signal hold, platform shift, and emergency lockdown is logged to an immutable RDSO-compliant audit log.
* **Emergency Protocol**: Two-stage confirmation emergency block and permanent clearance protocol.

---
*PRAGATI • Developed for Smart India Hackathon • Ministry of Railways, Government of India*
