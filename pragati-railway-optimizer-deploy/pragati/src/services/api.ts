/**
 * PRAGATI Frontend Backend API Client & WebSocket Gateway
 */

import { Train, RailwayZone, AIRecommendation, RailwayAlert, AuditLog } from '../types';

// Resolve the backend origin at build/runtime instead of hardcoding localhost.
// - In dev, VITE_API_URL is unset, so we fall back to localhost:5000 (the `npm run server` port).
// - In production (single-service deploy), the frontend is served BY the same Express
//   server, so we default to same-origin (window.location.origin) and just append /api.
// - If frontend and backend are deployed separately (e.g. Vercel + Render), set
//   VITE_API_URL to the backend's full origin, e.g. https://pragati-api.onrender.com
const RUNTIME_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
const isLocalDev = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

const CONFIGURED_API_URL = import.meta.env.VITE_API_URL as string | undefined;

const API_ORIGIN = CONFIGURED_API_URL
  ? CONFIGURED_API_URL.replace(/\/$/, '')
  : (isLocalDev ? 'http://localhost:5000' : RUNTIME_ORIGIN);

const API_BASE_URL = `${API_ORIGIN}/api`;
const WS_BASE_URL = API_ORIGIN.replace(/^http/, 'ws') + '/ws';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!res.ok) {
      console.warn(`API Error ${res.status} on ${endpoint}`);
      return null;
    }

    return await res.json() as T;
  } catch (err) {
    console.warn(`Backend connection notice on ${endpoint} (using local state fallback):`, err);
    return null;
  }
}

export const RailwayApi = {
  // Health
  checkHealth: () => apiFetch<{ status: string }>('/health'),

  // Zones
  getZones: () => apiFetch<{ success: boolean; zones: RailwayZone[] }>('/zones'),

  // Trains
  getTrains: (zone?: string) => apiFetch<{ success: boolean; trains: Train[] }>(`/trains${zone ? `?zone=${encodeURIComponent(zone)}` : ''}`),
  overrideTrain: (id: string, data: any) => apiFetch<{ success: boolean; train: Train }>(`/trains/${id}/override`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Recommendations
  getRecommendations: () => apiFetch<{ success: boolean; recommendations: AIRecommendation[] }>('/recommendations'),
  approveRecommendation: (id: string, data: { operatorName?: string; notes?: string }) => 
    apiFetch<{ success: boolean; recommendation: AIRecommendation }>(`/recommendations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  rejectRecommendation: (id: string, data: { operatorName?: string; reason?: string }) => 
    apiFetch<{ success: boolean; recommendation: AIRecommendation }>(`/recommendations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Alerts
  getAlerts: () => apiFetch<{ success: boolean; alerts: RailwayAlert[] }>('/alerts'),
  resolveAlert: (id: string, data?: { operatorName?: string }) => apiFetch<{ success: boolean; alert: RailwayAlert }>(`/alerts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data || {})
  }),
  createAlert: (data: any) => apiFetch<{ success: boolean; alert: RailwayAlert }>('/alerts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Emergency
  getEmergencyState: () => apiFetch<{ success: boolean; emergency: any }>('/emergency'),
  triggerEmergency: (data: { section?: string; reason?: string; operatorName?: string }) =>
    apiFetch<{ success: boolean; emergency: any }>('/emergency/trigger', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  resolveEmergency: (data: { notes?: string; operatorName?: string }) =>
    apiFetch<{ success: boolean; message: string }>('/emergency/resolve', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Audit Logs
  getAuditLogs: (zone?: string) => apiFetch<{ success: boolean; auditLogs: AuditLog[] }>(`/audit-logs${zone ? `?zone=${encodeURIComponent(zone)}` : ''}`),
  createAuditLog: (data: any) => apiFetch<{ success: boolean; log: AuditLog }>('/audit-logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Simulation
  evaluateWhatIf: (data: any) => apiFetch<{ success: boolean; result: any }>('/simulation/what-if', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Real-Time WebSocket Gateway with Automatic Reconnection
export function initRailwayWebSocket(
  onMessage: (data: any) => void,
  onStatusChange?: (isConnected: boolean) => void
) {
  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;

  function connect() {
    try {
      ws = new WebSocket(WS_BASE_URL);

      ws.onopen = () => {
        console.log('✅ Connected to PRAGATI live WebSocket server');
        if (onStatusChange) onStatusChange(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          onMessage(payload);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        console.warn('⚠️ WebSocket disconnected, attempting reconnect in 3s...');
        if (onStatusChange) onStatusChange(false);
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection notice:', err);
        ws?.close();
      };
    } catch (e) {
      console.warn('WebSocket creation notice:', e);
      reconnectTimer = setTimeout(connect, 3000);
    }
  }

  connect();

  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
  };
}
