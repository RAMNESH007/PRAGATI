import fs from 'fs';
import path from 'path';

export interface UserEntity {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
  assignedZone?: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  avatar?: string;
}

export interface ZoneEntity {
  id: string;
  code: string;
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

export interface TrainEntity {
  id: string;
  number: string;
  name: string;
  type: string;
  zone: string;
  origin: string;
  destination: string;
  currentStation: string;
  nextStation: string;
  status: 'ON_TIME' | 'DELAYED' | 'CRITICAL' | 'HOLD' | 'MAINTENANCE' | 'ARRIVED';
  delayMinutes: number;
  scheduledArrival: string;
  actualArrival: string;
  eta: string;
  speedKmH: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'EMERGENCY';
  trackId: string;
  platform: number | string;
  routeProgress: number;
  coordinates: [number, number];
  corridor: string;
}

export interface RecommendationEntity {
  id: string;
  trainNumber: string;
  trainName: string;
  zone: string;
  section: string;
  type: 'HOLD_TRAIN' | 'ALLOW_TRAIN' | 'CHANGE_PLATFORM' | 'REROUTE_LOOP' | 'SPEED_REGULATION';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidenceScore: number;
  recommendation: string;
  reason: string;
  impactMinutesSaved: number;
  throughputGain: number;
  safetyScore: number;
  actionDetails?: any;
  precedenceOrder?: string[];
  suggestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AlertEntity {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  zone: string;
  section: string;
  timestamp: string;
  acknowledged: boolean;
  isResolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  actionRequired?: string;
}

export interface AuditLogEntity {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  role: string;
  action: string;
  trainNumber?: string;
  decision: string;
  reason: string;
  zone: string;
  status: 'SUCCESS' | 'WARNING' | 'EMERGENCY';
}

export interface EmergencyStateEntity {
  isEmergencyActive: boolean;
  emergencyDetails: {
    section: string;
    reason: string;
    timestamp: string;
    declaredBy: string;
    lockedTracks?: string[];
  } | null;
}

export interface DatabaseSchema {
  users: UserEntity[];
  zones: ZoneEntity[];
  trains: TrainEntity[];
  recommendations: RecommendationEntity[];
  alerts: AlertEntity[];
  auditLogs: AuditLogEntity[];
  emergencyState: EmergencyStateEntity;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'server', 'database', 'pragati.db.json');

// Initial seed data
const SEED_DATA: DatabaseSchema = {
  users: [
    {
      id: 'user-admin',
      username: 'admin',
      name: 'Priyanka Sharma',
      role: 'ADMIN',
      email: 'p.sharma@railnet.gov.in',
      status: 'ACTIVE',
      lastLogin: '2026-08-20 02:40 AM',
      avatar: '/images/avatar-operator.png'
    },
    {
      id: 'user-operator',
      username: 'operator',
      name: 'Suresh Verma',
      role: 'OPERATOR',
      assignedZone: 'Northern Railway',
      email: 's.verma.nr@railnet.gov.in',
      status: 'ACTIVE',
      lastLogin: '2026-08-20 02:45 AM',
      avatar: '/images/avatar-operator.png'
    }
  ],
  zones: [
    {
      id: 'zone-nr',
      code: 'NR',
      name: 'Northern Railway',
      headquarters: 'New Delhi',
      status: 'Active',
      activeTrains: 312,
      onTimePercentage: 72,
      averageDelayMinutes: 18.3,
      throughputPercentage: 89.7,
      alertsCount: 4,
      coordinates: { x: 38, y: 28, lat: 28.6139, lng: 77.2090 }
    },
    {
      id: 'zone-ner',
      code: 'NER',
      name: 'North Eastern Railway',
      headquarters: 'Gorakhpur',
      status: 'Active',
      activeTrains: 168,
      onTimePercentage: 69,
      averageDelayMinutes: 22.1,
      throughputPercentage: 88.2,
      alertsCount: 2,
      coordinates: { x: 52, y: 34, lat: 26.7606, lng: 83.3732 }
    },
    {
      id: 'zone-er',
      code: 'ER',
      name: 'Eastern Railway',
      headquarters: 'Kolkata',
      status: 'Active',
      activeTrains: 245,
      onTimePercentage: 66,
      averageDelayMinutes: 26.4,
      throughputPercentage: 91.5,
      alertsCount: 5,
      coordinates: { x: 72, y: 48, lat: 22.5726, lng: 88.3639 }
    },
    {
      id: 'zone-ser',
      code: 'SER',
      name: 'South Eastern Railway',
      headquarters: 'Garden Reach, Kolkata',
      status: 'Active',
      activeTrains: 198,
      onTimePercentage: 71,
      averageDelayMinutes: 21.0,
      throughputPercentage: 93.1,
      alertsCount: 3,
      coordinates: { x: 68, y: 54, lat: 22.5400, lng: 88.3100 }
    },
    {
      id: 'zone-sr',
      code: 'SR',
      name: 'Southern Railway',
      headquarters: 'Chennai',
      status: 'Active',
      activeTrains: 264,
      onTimePercentage: 75,
      averageDelayMinutes: 16.2,
      throughputPercentage: 94.0,
      alertsCount: 2,
      coordinates: { x: 46, y: 82, lat: 13.0827, lng: 80.2707 }
    },
    {
      id: 'zone-swr',
      code: 'SWR',
      name: 'South Western Railway',
      headquarters: 'Hubballi',
      status: 'Active',
      activeTrains: 172,
      onTimePercentage: 78,
      averageDelayMinutes: 14.5,
      throughputPercentage: 95.2,
      alertsCount: 1,
      coordinates: { x: 38, y: 76, lat: 15.3647, lng: 75.1240 }
    },
    {
      id: 'zone-wr',
      code: 'WR',
      name: 'Western Railway',
      headquarters: 'Mumbai (Churchgate)',
      status: 'Active',
      activeTrains: 280,
      onTimePercentage: 70,
      averageDelayMinutes: 19.8,
      throughputPercentage: 92.3,
      alertsCount: 3,
      coordinates: { x: 26, y: 54, lat: 18.9322, lng: 72.8264 }
    },
    {
      id: 'zone-cr',
      code: 'CR',
      name: 'Central Railway',
      headquarters: 'Mumbai (CSMT)',
      status: 'Active',
      activeTrains: 295,
      onTimePercentage: 67,
      averageDelayMinutes: 25.8,
      throughputPercentage: 91.8,
      alertsCount: 4,
      coordinates: { x: 36, y: 56, lat: 18.9402, lng: 72.8356 }
    },
    {
      id: 'zone-ecr',
      code: 'ECR',
      name: 'East Central Railway',
      headquarters: 'Hajipur',
      status: 'Active',
      activeTrains: 185,
      onTimePercentage: 64,
      averageDelayMinutes: 28.2,
      throughputPercentage: 87.4,
      alertsCount: 4,
      coordinates: { x: 62, y: 40, lat: 25.6858, lng: 85.2146 }
    },
    {
      id: 'zone-ncr',
      code: 'NCR',
      name: 'North Central Railway',
      headquarters: 'Prayagraj',
      status: 'Active',
      activeTrains: 210,
      onTimePercentage: 65,
      averageDelayMinutes: 27.5,
      throughputPercentage: 93.6,
      alertsCount: 5,
      coordinates: { x: 48, y: 42, lat: 25.4358, lng: 81.8463 }
    },
    {
      id: 'zone-nfr',
      code: 'NFR',
      name: 'Northeast Frontier Railway',
      headquarters: 'Maligaon, Guwahati',
      status: 'Active',
      activeTrains: 110,
      onTimePercentage: 68,
      averageDelayMinutes: 23.4,
      throughputPercentage: 86.9,
      alertsCount: 2,
      coordinates: { x: 86, y: 36, lat: 26.1584, lng: 91.7001 }
    },
    {
      id: 'zone-nwr',
      code: 'NWR',
      name: 'North Western Railway',
      headquarters: 'Jaipur',
      status: 'Active',
      activeTrains: 175,
      onTimePercentage: 73,
      averageDelayMinutes: 19.1,
      throughputPercentage: 91.0,
      alertsCount: 1,
      coordinates: { x: 28, y: 38, lat: 26.9124, lng: 75.7873 }
    },
    {
      id: 'zone-wcr',
      code: 'WCR',
      name: 'West Central Railway',
      headquarters: 'Jabalpur',
      status: 'Active',
      activeTrains: 160,
      onTimePercentage: 71,
      averageDelayMinutes: 20.4,
      throughputPercentage: 90.8,
      alertsCount: 2,
      coordinates: { x: 45, y: 50, lat: 23.1815, lng: 79.9864 }
    },
    {
      id: 'zone-secr',
      code: 'SECR',
      name: 'South East Central Railway',
      headquarters: 'Bilaspur',
      status: 'Active',
      activeTrains: 130,
      onTimePercentage: 82,
      averageDelayMinutes: 11.2,
      throughputPercentage: 96.7,
      alertsCount: 1,
      coordinates: { x: 55, y: 55, lat: 22.0797, lng: 82.1409 }
    },
    {
      id: 'zone-ecor',
      code: 'ECoR',
      name: 'East Coast Railway',
      headquarters: 'Bhubaneswar',
      status: 'Active',
      activeTrains: 145,
      onTimePercentage: 76,
      averageDelayMinutes: 15.6,
      throughputPercentage: 93.7,
      alertsCount: 2,
      coordinates: { x: 64, y: 60, lat: 20.2961, lng: 85.8245 }
    },
    {
      id: 'zone-scr',
      code: 'SCR',
      name: 'South Central Railway',
      headquarters: 'Secunderabad',
      status: 'Active',
      activeTrains: 235,
      onTimePercentage: 74,
      averageDelayMinutes: 18.0,
      throughputPercentage: 94.5,
      alertsCount: 3,
      coordinates: { x: 44, y: 64, lat: 17.4399, lng: 78.4983 }
    },
    {
      id: 'zone-metro',
      code: 'METRO',
      name: 'Metro Railway Kolkata',
      headquarters: 'Kolkata',
      status: 'Active',
      activeTrains: 42,
      onTimePercentage: 96,
      averageDelayMinutes: 2.1,
      throughputPercentage: 98.7,
      alertsCount: 0,
      coordinates: { x: 73, y: 49, lat: 22.5600, lng: 88.3500 }
    }
  ],
  trains: [
    {
      id: 'train-12951',
      number: '12951',
      name: 'Mumbai Rajdhani Express',
      type: 'RAJDHANI',
      zone: 'Northern Railway',
      origin: 'Mumbai Central (MMCT)',
      destination: 'New Delhi (NDLS)',
      currentStation: 'Kanpur Central (CNB)',
      nextStation: 'Tundla Junction (TDL)',
      status: 'HOLD',
      delayMinutes: 8,
      scheduledArrival: '11:40 AM',
      actualArrival: '11:48 AM',
      eta: '12:35 PM',
      speedKmH: 0,
      priority: 'HIGH',
      trackId: 'CNB-DN-LOOP-2',
      platform: 4,
      routeProgress: 68,
      coordinates: [26.4542, 80.3507],
      corridor: 'NDLS-CNB-DDU'
    },
    {
      id: 'train-12424',
      number: '12424',
      name: 'Dibrugarh Rajdhani Express',
      type: 'RAJDHANI',
      zone: 'Northern Railway',
      origin: 'New Delhi (NDLS)',
      destination: 'Dibrugarh (DBRG)',
      currentStation: 'New Delhi (NDLS)',
      nextStation: 'Kanpur Central (CNB)',
      status: 'DELAYED',
      delayMinutes: 15,
      scheduledArrival: '11:30 AM',
      actualArrival: '11:45 AM',
      eta: '04:10 PM',
      speedKmH: 110,
      priority: 'HIGH',
      trackId: 'NDLS-MAIN-UP',
      platform: 1,
      routeProgress: 18,
      coordinates: [28.6143, 77.2188],
      corridor: 'NDLS-CNB-DDU'
    },
    {
      id: 'train-18102',
      number: '18102',
      name: 'Tata Muri Express',
      type: 'MAIL_EXPRESS',
      zone: 'Northern Railway',
      origin: 'Tatanagar (TATA)',
      destination: 'Patna Junction (PNBE)',
      currentStation: 'Prayagraj (PRYJ)',
      nextStation: 'Varanasi (BSB)',
      status: 'DELAYED',
      delayMinutes: 24,
      scheduledArrival: '11:15 AM',
      actualArrival: '11:39 AM',
      eta: '01:50 PM',
      speedKmH: 75,
      priority: 'MEDIUM',
      trackId: 'PRYJ-MAIN-3',
      platform: 3,
      routeProgress: 52,
      coordinates: [25.4497, 81.8260],
      corridor: 'CNB-PRYJ-BSB'
    },
    {
      id: 'train-12309',
      number: '12309',
      name: 'Patna Rajdhani Express',
      type: 'RAJDHANI',
      zone: 'East Central Railway',
      origin: 'Rajendra Nagar (RJPB)',
      destination: 'New Delhi (NDLS)',
      currentStation: 'Pt. Deen Dayal Upadhyaya (DDU)',
      nextStation: 'Prayagraj (PRYJ)',
      status: 'ON_TIME',
      delayMinutes: 2,
      scheduledArrival: '11:55 AM',
      actualArrival: '11:57 AM',
      eta: '01:10 PM',
      speedKmH: 125,
      priority: 'HIGH',
      trackId: 'DDU-UP-MAIN',
      platform: 2,
      routeProgress: 44,
      coordinates: [25.2818, 83.1186],
      corridor: 'NDLS-CNB-DDU'
    },
    {
      id: 'train-22436',
      number: '22436',
      name: 'Vande Bharat Express',
      type: 'VANDE_BHARAT',
      zone: 'Northern Railway',
      origin: 'New Delhi (NDLS)',
      destination: 'Varanasi (BSB)',
      currentStation: 'Aligarh Junction (ALJN)',
      nextStation: 'Kanpur Central (CNB)',
      status: 'ON_TIME',
      delayMinutes: 0,
      scheduledArrival: '12:10 PM',
      actualArrival: '12:10 PM',
      eta: '02:00 PM',
      speedKmH: 130,
      priority: 'HIGH',
      trackId: 'ALJN-UP-MAIN',
      platform: 1,
      routeProgress: 32,
      coordinates: [27.8974, 78.0880],
      corridor: 'NDLS-CNB-DDU'
    },
    {
      id: 'train-BOXN-8842',
      number: 'BOXN-8842',
      name: 'Freight Coal Rake #8842',
      type: 'FREIGHT',
      zone: 'North Central Railway',
      origin: 'Dhanbad (DHN)',
      destination: 'Dadri (DER)',
      currentStation: 'Fatehpur (FTP)',
      nextStation: 'Kanpur Central (CNB)',
      status: 'HOLD',
      delayMinutes: 45,
      scheduledArrival: '10:30 AM',
      actualArrival: '11:15 AM',
      eta: '03:30 PM',
      speedKmH: 0,
      priority: 'LOW',
      trackId: 'FTP-LOOP-1',
      platform: 'G1',
      routeProgress: 58,
      coordinates: [25.9284, 80.8128],
      corridor: 'NDLS-CNB-DDU'
    }
  ],
  recommendations: [
    {
      id: 'rec-001',
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      zone: 'Northern Railway',
      section: 'Kanpur – Tundla Quad Section',
      type: 'HOLD_TRAIN',
      status: 'PENDING',
      priority: 'HIGH',
      confidenceScore: 94.2,
      recommendation: 'Hold at Loop Line 2 (CNB) for 6 minutes',
      reason: 'Allows high-priority Vande Bharat Express (22436) to overtake without deceleration penalty on Main Up Track.',
      impactMinutesSaved: 14.5,
      throughputGain: 8.2,
      safetyScore: 99.1,
      actionDetails: {
        holdStation: 'Kanpur Central (CNB)',
        holdTrack: 'CNB-DN-LOOP-2',
        holdDurationMinutes: 6,
        overtakingTrain: '22436 (Vande Bharat)'
      },
      precedenceOrder: ['22436', '12951', '18102'],
      suggestedAt: '11:42 AM'
    },
    {
      id: 'rec-002',
      trainNumber: '18102',
      trainName: 'Tata Muri Express',
      zone: 'Northern Railway',
      section: 'Prayagraj – Varanasi Section',
      type: 'CHANGE_PLATFORM',
      status: 'PENDING',
      priority: 'MEDIUM',
      confidenceScore: 89.6,
      recommendation: 'Divert Platform 3 to Platform 5 at PRYJ',
      reason: 'Resolves head-on platform occupancy clash with arriving Patna Rajdhani (12309).',
      impactMinutesSaved: 9.0,
      throughputGain: 5.4,
      safetyScore: 98.4,
      actionDetails: {
        originalPlatform: 3,
        assignedPlatform: 5,
        station: 'Prayagraj Junction (PRYJ)'
      },
      suggestedAt: '11:38 AM'
    }
  ],
  alerts: [
    {
      id: 'alert-001',
      title: 'Signal Aspect Flashing Amber: Signal #S-42',
      description: 'Automatic block signal approaching Kanpur Outer showing intermittent circuit latency. Maintenance team alerted.',
      severity: 'WARNING',
      zone: 'North Central Railway',
      section: 'Kanpur Outer (KM 1014/12)',
      timestamp: '11:35 AM',
      acknowledged: false,
      actionRequired: 'Impose temporary 75 km/h caution order on Block Section 4'
    },
    {
      id: 'alert-002',
      title: 'High Track Density Warning: Delhi – Ghaziabad',
      description: 'Section capacity utilization reached 94.8% due to bunched suburban and mail rake arrivals.',
      severity: 'CRITICAL',
      zone: 'Northern Railway',
      section: 'NDLS – GZB Corridor',
      timestamp: '11:28 AM',
      acknowledged: true,
      actionRequired: 'Apply AI dynamic speed regulation to trailing express trains'
    }
  ],
  auditLogs: [
    {
      id: 'log-101',
      timestamp: '11:40 AM',
      operatorId: 'OP-102',
      operatorName: 'Suresh Verma',
      role: 'OPERATOR',
      action: 'Held Train at Signal',
      trainNumber: '12951',
      decision: 'Hold Train on Loop 2',
      reason: 'AI Precedence Recommendation accepted for Vande Bharat 22436 overtake',
      zone: 'Northern Railway',
      status: 'SUCCESS'
    }
  ],
  emergencyState: {
    isEmergencyActive: false,
    emergencyDetails: null
  }
};

export class DatabaseManager {
  private static instance: DatabaseManager;
  private data: DatabaseSchema;

  private constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private ensureDirectory() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing pragati.db.json, re-seeding:', err);
    }
    this.saveData(SEED_DATA);
    return SEED_DATA;
  }

  public saveData(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Getters & Mutators
  public getUsers(): UserEntity[] {
    return this.data.users;
  }

  public getZones(): ZoneEntity[] {
    return this.data.zones;
  }

  public getTrains(): TrainEntity[] {
    return this.data.trains;
  }

  public setTrains(trains: TrainEntity[]) {
    this.data.trains = trains;
    this.saveData(this.data);
  }

  public updateTrain(id: string, updates: Partial<TrainEntity>): TrainEntity | null {
    const idx = this.data.trains.findIndex(t => t.id === id || t.number === id);
    if (idx === -1) return null;
    this.data.trains[idx] = { ...this.data.trains[idx], ...updates };
    this.saveData(this.data);
    return this.data.trains[idx];
  }

  public getTrainByNumber(idOrNumber: string): TrainEntity | null {
    const train = this.data.trains.find(t => t.id === idOrNumber || t.number === idOrNumber);
    return train || null;
  }

  public updateTrainPlatform(idOrNumber: string, platform: number | string): TrainEntity | null {
    return this.updateTrain(idOrNumber, { platform });
  }

  public getRecommendations(): RecommendationEntity[] {
    return this.data.recommendations;
  }

  public updateRecommendation(id: string, updates: Partial<RecommendationEntity>): RecommendationEntity | null {
    const idx = this.data.recommendations.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.recommendations[idx] = { ...this.data.recommendations[idx], ...updates };
    this.saveData(this.data);
    return this.data.recommendations[idx];
  }

  public getAlerts(): AlertEntity[] {
    return this.data.alerts;
  }

  public setAlerts(alerts: AlertEntity[]) {
    this.data.alerts = alerts;
    this.saveData(this.data);
  }

  public updateAlert(id: string, updates: Partial<AlertEntity>): AlertEntity | null {
    const idx = this.data.alerts.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.alerts[idx] = { ...this.data.alerts[idx], ...updates };
    this.saveData(this.data);
    return this.data.alerts[idx];
  }

  public addAlert(alert: AlertEntity) {
    this.data.alerts.unshift(alert);
    this.saveData(this.data);
  }

  public getAuditLogs(): AuditLogEntity[] {
    return this.data.auditLogs;
  }

  public addAuditLog(log: AuditLogEntity) {
    this.data.auditLogs.unshift(log);
    this.saveData(this.data);
  }

  public getEmergencyState(): EmergencyStateEntity {
    return this.data.emergencyState;
  }

  public setEmergencyState(state: EmergencyStateEntity) {
    this.data.emergencyState = state;
    this.saveData(this.data);
  }
}

export const db = DatabaseManager.getInstance();
