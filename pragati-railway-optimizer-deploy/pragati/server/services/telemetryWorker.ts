import { db, TrainEntity } from '../database/db';
import { WebSocket } from 'ws';

// Real-world Indian Railways coordinates for Main Trunk Corridors
export const MAIN_TRUNK_WAYPOINTS: [number, number][] = [
  [28.6143, 77.2188], // New Delhi (NDLS)
  [28.6678, 77.4498], // Ghaziabad (GZB)
  [27.8974, 78.0880], // Aligarh (ALJN)
  [27.2090, 78.2415], // Tundla (TDL)
  [26.7500, 79.0200], // Etawah
  [26.4542, 80.3507], // Kanpur Central (CNB)
  [25.9284, 80.8128], // Fatehpur (FTP)
  [25.4497, 81.8260], // Prayagraj (PRYJ)
  [25.1337, 82.5644], // Mirzapur (MZP)
  [25.2818, 83.1186], // Pt. Deen Dayal Upadhyaya (DDU)
  [25.3283, 82.9868], // Varanasi (BSB)
  [24.9500, 84.0000], // Sasaram
  [24.7955, 84.9994], // Gaya Jn (GAYA)
  [25.6022, 85.1376], // Patna Jn (PNBE)
  [22.5839, 88.3426]  // Howrah (HWH)
];

export const WESTERN_WAYPOINTS: [number, number][] = [
  [28.6143, 77.2188], // New Delhi
  [27.4924, 77.6737], // Mathura
  [26.9221, 75.7789], // Jaipur
  [25.2138, 75.8648], // Kota
  [23.3315, 75.0367], // Ratlam
  [22.3072, 73.1812], // Vadodara
  [21.1702, 72.8311], // Surat
  [18.9696, 72.8194]  // Mumbai Central
];

function interpolateCoords(waypoints: [number, number][], progressPercent: number): [number, number] {
  if (!waypoints || waypoints.length === 0) return [28.6143, 77.2188];
  if (waypoints.length === 1) return waypoints[0];

  const clamped = Math.max(0, Math.min(100, progressPercent));
  const totalSegments = waypoints.length - 1;
  const rawIndex = (clamped / 100) * totalSegments;
  const segmentIndex = Math.min(Math.floor(rawIndex), totalSegments - 1);
  const segmentProgress = rawIndex - segmentIndex;

  const p1 = waypoints[segmentIndex];
  const p2 = waypoints[segmentIndex + 1];

  const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
  const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;

  return [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
}

export class TelemetryWorker {
  private static instance: TelemetryWorker;
  private intervalTimer: NodeJS.Timeout | null = null;
  private wsClients: Set<WebSocket> = new Set();

  private constructor() {}

  public static getInstance(): TelemetryWorker {
    if (!TelemetryWorker.instance) {
      TelemetryWorker.instance = new TelemetryWorker();
    }
    return TelemetryWorker.instance;
  }

  public registerClient(ws: WebSocket) {
    this.wsClients.add(ws);
    // Send initial handshake state
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      data: {
        trains: db.getTrains(),
        zones: db.getZones(),
        emergencyState: db.getEmergencyState(),
        timestamp: new Date().toISOString()
      }
    }));

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  public broadcast(message: object) {
    const raw = JSON.stringify(message);
    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  }

  public start() {
    if (this.intervalTimer) return;

    console.log('🚄 Telemetry background worker started (2s cycle)...');

    this.intervalTimer = setInterval(() => {
      const emergency = db.getEmergencyState();
      const currentTrains = db.getTrains();

      const updatedTrains: TrainEntity[] = currentTrains.map(train => {
        // If emergency is active or train is on HOLD, keep stationary
        if (emergency.isEmergencyActive && emergency.emergencyDetails?.section.includes(train.currentStation)) {
          return {
            ...train,
            speedKmH: 0,
            status: 'HOLD'
          };
        }

        if (train.status === 'HOLD' || train.status === 'MAINTENANCE') {
          return train;
        }

        let newProgress = train.routeProgress + 0.4;
        if (newProgress > 100) newProgress = 2;

        const speedDelta = (Math.random() - 0.5) * 3;
        const newSpeed = Math.max(40, Math.min(135, Math.round(train.speedKmH + speedDelta)));

        const waypoints = (train.number === '12951' || train.number === '12952')
          ? WESTERN_WAYPOINTS
          : MAIN_TRUNK_WAYPOINTS;

        const newCoordinates = interpolateCoords(waypoints, newProgress);

        return {
          ...train,
          routeProgress: parseFloat(newProgress.toFixed(1)),
          speedKmH: newSpeed,
          coordinates: newCoordinates
        };
      });

      db.setTrains(updatedTrains);

      // Broadcast live telemetry packet over WebSocket
      this.broadcast({
        type: 'LIVE_TELEMETRY',
        trains: updatedTrains,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }, 2000);
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
}

export const telemetryWorker = TelemetryWorker.getInstance();
