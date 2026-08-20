/**
 * RailRadar API (https://railradar.in/docs) Integration & Smooth Marker Animator
 * Provides live train position, route geometry, search, and 60 FPS coordinate interpolation.
 */

import { apiFetch } from './api';
import { Train } from '../types';

export interface RailRadarStatus {
  success: boolean;
  provider: string;
  isKeyConfigured: boolean;
  pollIntervalSeconds: number;
  rateLimitGuard: string;
  fallbackEngine: string;
  timestamp: string;
}

export interface RailRadarLiveTrain {
  trainNumber: string;
  trainName: string;
  type: string;
  zone: string;
  origin: string;
  destination: string;
  currentStation: string;
  nextStation: string;
  status: string;
  delayMinutes: number;
  scheduledArrival: string;
  actualArrival: string;
  eta: string;
  speedKmH: number;
  coordinates: [number, number];
  platform: number | string;
  routeProgress: number;
  lastPing: string;
}

export interface RailRadarRoute {
  success: boolean;
  trainNumber: string;
  polyline: [number, number][];
  stationsCount: number;
}

export class RailRadarService {
  /**
   * Check RailRadar API key configuration and status
   */
  public static async getStatus(): Promise<RailRadarStatus | null> {
    return apiFetch<RailRadarStatus>('/railradar/status');
  }

  /**
   * Fetch live train status and GPS position by train number
   */
  public static async getLiveTrain(trainNo: string): Promise<{ success: boolean; source: string; train: RailRadarLiveTrain } | null> {
    return apiFetch<{ success: boolean; source: string; train: RailRadarLiveTrain }>(`/railradar/live/${trainNo}`);
  }

  /**
   * Fetch authentic route polyline for a given train
   */
  public static async getRouteGeometry(trainNo: string): Promise<RailRadarRoute | null> {
    return apiFetch<RailRadarRoute>(`/railradar/route/${trainNo}`);
  }

  /**
   * Search trains running between two stations (e.g. from=NDLS&to=CNB)
   */
  public static async searchTrainsBetween(from: string, to: string): Promise<{ success: boolean; count: number; trains: Train[] } | null> {
    return apiFetch<{ success: boolean; count: number; trains: Train[] }>(`/railradar/between?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  }
}

/**
 * 60 FPS Smooth GPS Coordinate Animator
 * Animates a train marker smoothly from current coordinates to next polled coordinates
 * so the train glides along the map without jumping.
 */
export class SmoothMarkerAnimator {
  private currentLat: number;
  private currentLng: number;
  private targetLat: number;
  private targetLng: number;
  private startTime: number = 0;
  private durationMs: number = 2000; // 2-second smooth transition
  private animFrameId: number | null = null;
  private onUpdate: (coords: [number, number]) => void;

  constructor(initialCoords: [number, number], onUpdate: (coords: [number, number]) => void) {
    this.currentLat = initialCoords[0];
    this.currentLng = initialCoords[1];
    this.targetLat = initialCoords[0];
    this.targetLng = initialCoords[1];
    this.onUpdate = onUpdate;
  }

  public animateTo(nextCoords: [number, number], durationMs: number = 2000) {
    if (this.currentLat === nextCoords[0] && this.currentLng === nextCoords[1]) {
      return;
    }

    this.targetLat = nextCoords[0];
    this.targetLng = nextCoords[1];
    this.durationMs = durationMs;
    this.startTime = performance.now();

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    const step = (now: number) => {
      const elapsed = now - this.startTime;
      const progress = Math.min(1, elapsed / this.durationMs);

      // Smooth easeInOutQuad easing
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const lat = this.currentLat + (this.targetLat - this.currentLat) * eased;
      const lng = this.currentLng + (this.targetLng - this.currentLng) * eased;

      this.onUpdate([lat, lng]);

      if (progress < 1) {
        this.animFrameId = requestAnimationFrame(step);
      } else {
        this.currentLat = this.targetLat;
        this.currentLng = this.targetLng;
        this.animFrameId = null;
      }
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
