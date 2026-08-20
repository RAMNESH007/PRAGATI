export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  assignedZone?: string; // e.g. 'Northern Railway', 'Western Railway'
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  avatar?: string;
}

export type TrainStatus = 'ON_TIME' | 'DELAYED' | 'CRITICAL' | 'HOLD' | 'MAINTENANCE' | 'ARRIVED';
export type TrainPriority = 'HIGH' | 'MEDIUM' | 'LOW' | 'EMERGENCY';
export type TrainType = 'VANDE_BHARAT' | 'RAJDHANI' | 'SHATABDI' | 'SUPERFAST' | 'MAIL_EXPRESS' | 'FREIGHT' | 'SPECIAL';

export interface Train {
  id: string;
  number: string;
  name: string;
  type: TrainType;
  zone: string;
  origin: string;
  destination: string;
  currentStation: string;
  nextStation: string;
  status: TrainStatus;
  delayMinutes: number;
  scheduledArrival: string;
  actualArrival: string;
  eta: string;
  speedKmH: number;
  priority: TrainPriority;
  trackId: string;
  platform: number | string;
  routeProgress: number; // 0 - 100 percentage along current corridor
  coordinates: [number, number]; // [lat, lng]
  corridor: string; // e.g. "NDLS-CNB-DDU"
}

export interface RailwayZone {
  id: string;
  code: string; // NR, WR, CR, ER, etc.
  name: string;
  headquarters: string;
  status: 'Active' | 'Congested' | 'Maintenance' | 'Alert';
  activeTrains: number;
  onTimePercentage: number;
  averageDelayMinutes: number;
  throughputPercentage: number;
  alertsCount: number;
  coordinates: { x: number; y: number; lat: number; lng: number };
}

export type RecommendationType = 
  | 'HOLD_TRAIN'
  | 'ALLOW_TRAIN'
  | 'CHANGE_PLATFORM'
  | 'CHANGE_ROUTE'
  | 'DELAY_DEPARTURE'
  | 'PRIORITIZE_TRAIN'
  | 'CLEAR_SECTION'
  | 'RELEASE_TRACK'
  | 'AVOID_CONFLICT';

export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';

export interface AIRecommendation {
  id: string;
  trainNumber: string;
  trainName: string;
  zone: string;
  from: string;
  to: string;
  currentLocation: string;
  destination: string;
  type: RecommendationType;
  recommendation: string;
  reason: string;
  detailedReasons?: string[];
  priority: TrainPriority;
  confidenceScore: number; // e.g. 94
  expectedDelayReductionMinutes: number; // e.g. 8
  expectedThroughputImprovementPercent: number; // e.g. 11
  timestamp: string;
  status: RecommendationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  actionDetails?: {
    holdDurationMinutes?: number;
    assignedPlatform?: string | number;
    alternateRoute?: string;
    speedRestriction?: number;
    revisedPriority?: TrainPriority;
    notes?: string;
  };
  conflictDetails?: {
    conflictingTrainNumber: string;
    conflictingTrainName: string;
    location: string;
    projectedConflictTime: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertCategory = 
  | 'CONGESTION' 
  | 'SIGNAL_FAILURE' 
  | 'TRAIN_DELAY' 
  | 'TRACK_MAINTENANCE' 
  | 'PLATFORM_CONFLICT' 
  | 'WEATHER' 
  | 'EMERGENCY';

export interface RailwayAlert {
  id: string;
  title: string;
  message: string;
  section: string;
  zone: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: string;
  affectedTrains: string[];
  recommendedAction?: string;
  isResolved?: boolean;
}

export interface StationNode {
  id: string;
  code: string;
  name: string;
  zone: string;
  platforms: number;
  occupiedPlatforms: number[];
  coordinates: { x: number; y: number; lat: number; lng: number };
  signals: {
    upLine: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
    downLine: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
  };
  junction: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  role: UserRole;
  action: string;
  trainNumber?: string;
  decision: string;
  reason: string;
  zone: string;
  status: 'SUCCESS' | 'WARNING' | 'EMERGENCY';
}

export interface WhatIfScenario {
  id: string;
  title: string;
  targetTrainNumber: string;
  delayInjectedMinutes: number;
  trackBlockSection?: string;
  platformClosureStation?: string;
  platformNumber?: number;
  baseline: {
    totalNetworkDelay: number;
    throughputPercentage: number;
    conflictsPredicted: number;
    cascadingDelaysCount: number;
  };
  optimized: {
    totalNetworkDelay: number;
    throughputPercentage: number;
    conflictsPredicted: number;
    cascadingDelaysCount: number;
    avoidedConflictsCount: number;
  };
  aiRecommendations: string[];
}
