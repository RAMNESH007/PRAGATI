import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Train, 
  RailwayZone, 
  AIRecommendation, 
  RailwayAlert, 
  StationNode, 
  User, 
  AuditLog, 
  WhatIfScenario,
  TrainPriority
} from '../types';
import { 
  interpolateGPSAlongPath, 
  MAIN_TRUNK_CORRIDOR_WAYPOINTS, 
  WESTERN_CORRIDOR_WAYPOINTS 
} from '../services/railwayApiService';
import { 
  RailwayApi, 
  initRailwayWebSocket 
} from '../services/api';
import { 
  INITIAL_TRAINS, 
  INITIAL_ZONES, 
  INITIAL_RECOMMENDATIONS, 
  INITIAL_ALERTS, 
  INITIAL_STATIONS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_WHATIF_SCENARIO 
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
}

interface RailwayContextType {
  trains: Train[];
  zones: RailwayZone[];
  recommendations: AIRecommendation[];
  alerts: RailwayAlert[];
  stations: StationNode[];
  auditLogs: AuditLog[];
  whatIfScenario: WhatIfScenario;
  lastUpdated: string;
  isLiveActive: boolean;
  setIsLiveActive: (active: boolean) => void;
  emergencyMode: boolean;
  emergencyDetails: { section: string; reason: string; timestamp: string } | null;
  resolveEmergencyPermanently: (resolutionNotes?: string) => void;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  
  // Human-in-the-loop workflows
  approveRecommendation: (recId: string, notes?: string) => void;
  rejectRecommendation: (recId: string, reason: string) => void;
  modifyRecommendation: (recId: string, modifications: {
    holdDurationMinutes?: number;
    assignedPlatform?: string | number;
    alternateRoute?: string;
    speedRestriction?: number;
    revisedPriority?: TrainPriority;
    notes?: string;
  }) => void;

  // Manual Controls
  executeManualHold: (trainNumber: string, durationMinutes: number, reason: string) => void;
  executeManualRelease: (trainNumber: string, reason: string) => void;
  executePlatformChange: (trainNumber: string, stationCode: string, newPlatform: number | string, reason: string) => void;
  executeSpeedRestriction: (trainNumber: string, speedKmH: number, section: string, reason: string) => void;
  triggerEmergencyCorridorBlock: (section: string, reason: string) => void;
  
  // What-If Simulation
  runWhatIfSimulation: (trainNumber: string, delayMins: number, trackBlock?: string) => WhatIfScenario;
  
  // Alert management
  resolveAlert: (alertId: string) => void;
  addAlert: (alert: Omit<RailwayAlert, 'id' | 'timestamp'>) => void;
}

const RailwayContext = createContext<RailwayContextType | undefined>(undefined);

export const RailwayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, selectedZone } = useAuth();
  
  // 1. Persistent State Initializers from LocalStorage across refresh
  const [trains, setTrains] = useState<Train[]>(() => {
    const saved = localStorage.getItem('pragati_trains');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TRAINS;
  });

  const [zones, setZones] = useState<RailwayZone[]>(INITIAL_ZONES);

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(() => {
    const saved = localStorage.getItem('pragati_recommendations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_RECOMMENDATIONS;
  });

  const [alerts, setAlerts] = useState<RailwayAlert[]>(() => {
    const saved = localStorage.getItem('pragati_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ALERTS;
  });

  const [stations, setStations] = useState<StationNode[]>(INITIAL_STATIONS);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('pragati_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [whatIfScenario, setWhatIfScenario] = useState<WhatIfScenario>(INITIAL_WHATIF_SCENARIO);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  
  // Persistent Emergency State across page refreshes
  const [emergencyMode, setEmergencyMode] = useState<boolean>(() => {
    return localStorage.getItem('pragati_emergency_mode') === 'true';
  });
  const [emergencyDetails, setEmergencyDetails] = useState<{ section: string; reason: string; timestamp: string } | null>(() => {
    const saved = localStorage.getItem('pragati_emergency_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // LocalStorage Sync Effects
  useEffect(() => {
    localStorage.setItem('pragati_trains', JSON.stringify(trains));
  }, [trains]);

  useEffect(() => {
    localStorage.setItem('pragati_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem('pragati_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('pragati_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Helper to add safety audit log
  const addAuditEntry = useCallback((
    action: string, 
    decision: string, 
    reason: string, 
    trainNumber?: string, 
    status: 'SUCCESS' | 'WARNING' | 'EMERGENCY' = 'SUCCESS',
    zoneName?: string
  ) => {
    const newEntry: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      operatorId: user?.id === 'user-admin' ? 'ADM-001' : (user?.id === 'user-operator' ? 'OP-102' : (user?.username || 'OP-SYS')),
      operatorName: user?.name || 'Authorized Operator',
      role: user?.role || 'OPERATOR',
      action,
      trainNumber,
      decision,
      reason,
      zone: zoneName || user?.assignedZone || selectedZone || 'Northern Railway',
      status
    };
    setAuditLogs(prev => [newEntry, ...prev]);

    // Async persist to backend database
    RailwayApi.createAuditLog(newEntry);
  }, [user, selectedZone]);

  // Initial Database Hydration & WebSocket Subscription
  useEffect(() => {
    // 1. Fetch initial state from persistent backend database
    Promise.all([
      RailwayApi.getZones(),
      RailwayApi.getTrains(),
      RailwayApi.getRecommendations(),
      RailwayApi.getAlerts(),
      RailwayApi.getAuditLogs(),
      RailwayApi.getEmergencyState()
    ]).then(([zonesRes, trainsRes, recsRes, alertsRes, logsRes, emgRes]) => {
      if (zonesRes?.zones && zonesRes.zones.length > 0) setZones(zonesRes.zones);
      if (trainsRes?.trains && trainsRes.trains.length > 0) setTrains(trainsRes.trains);
      if (recsRes?.recommendations && recsRes.recommendations.length > 0) setRecommendations(recsRes.recommendations);
      if (alertsRes?.alerts && alertsRes.alerts.length > 0) setAlerts(alertsRes.alerts);
      if (logsRes?.auditLogs && logsRes.auditLogs.length > 0) setAuditLogs(logsRes.auditLogs);
      if (emgRes?.emergency) {
        setEmergencyMode(emgRes.emergency.isEmergencyActive);
        setEmergencyDetails(emgRes.emergency.emergencyDetails);
      }
    });

    // 2. Connect to live WebSocket stream
    const unsubscribe = initRailwayWebSocket((payload) => {
      if (payload.type === 'LIVE_TELEMETRY' && payload.trains) {
        setTrains(payload.trains);
        setLastUpdated(payload.timestamp || new Date().toLocaleTimeString('en-IN'));
      } else if (payload.type === 'EMERGENCY_TRIGGERED') {
        setEmergencyMode(true);
        setEmergencyDetails(payload.emergencyState?.emergencyDetails || null);
        if (payload.trains) setTrains(payload.trains);
      } else if (payload.type === 'EMERGENCY_RESOLVED') {
        setEmergencyMode(false);
        setEmergencyDetails(null);
        if (payload.trains) setTrains(payload.trains);
      } else if (payload.type === 'RECOMMENDATION_APPROVED' || payload.type === 'RECOMMENDATION_REJECTED') {
        if (payload.recommendation) {
          setRecommendations(prev => prev.map(r => r.id === payload.recommendation.id ? payload.recommendation : r));
        }
        if (payload.trains) setTrains(payload.trains);
      } else if (payload.type === 'NEW_ALERT' && payload.alert) {
        setAlerts(prev => [payload.alert, ...prev]);
        addToast(payload.alert.title, payload.alert.message, payload.alert.severity === 'CRITICAL' ? 'error' : 'warning');
      }
    });

    return () => unsubscribe();
  }, [addToast]);

  // 3. Periodic Real-Time Railway Bulletins & Notification Engine (Every 20 seconds)
  useEffect(() => {
    const operationalBulletins = [
      {
        title: 'Signal Headway Spacing Nominal',
        message: 'Train #22436 Vande Bharat approaching Automatic Signal Block 38. Safe 4-minute block headway maintained.',
        severity: 'INFO' as const,
        category: 'TRAIN_DELAY' as const,
        toastType: 'info' as const,
        section: 'Ghaziabad – Aligarh Quad Track',
        zone: 'Northern Railway',
        trains: ['22436']
      },
      {
        title: 'Platform Dwell Alert',
        message: 'Platform 3 at Kanpur Central (CNB) dwell time exceeded 4 mins for Train #12951. Section Controller notified.',
        severity: 'WARNING' as const,
        category: 'PLATFORM_CONFLICT' as const,
        toastType: 'warning' as const,
        section: 'Kanpur Central Yard',
        zone: 'Northern Railway',
        trains: ['12951']
      },
      {
        title: 'OHE Traction Power Nominal',
        message: 'Section Aligarh – Hathras reports stable 25kV OHE traction voltage. Speed profile permitted up to 130 km/h.',
        severity: 'INFO' as const,
        category: 'CONGESTION' as const,
        toastType: 'success' as const,
        section: 'Aligarh – Hathras Main Line',
        zone: 'Northern Railway',
        trains: ['12424', '12951']
      },
      {
        title: 'Freight Shunting Clearance',
        message: 'BOXN Freight rake safely shunted onto Loop Line 4 at Tundla Junction (TDL). Up Fast corridor cleared.',
        severity: 'INFO' as const,
        category: 'TRACK_MAINTENANCE' as const,
        toastType: 'info' as const,
        section: 'Tundla Junction Outer',
        zone: 'Northern Railway',
        trains: ['CONT-90421']
      },
      {
        title: 'Visibility & Fog Advisory',
        message: 'Early morning fog caution active between Tundla and Etawah. Automatic Cab Signalling (KAVACH) in supervision mode.',
        severity: 'WARNING' as const,
        category: 'WEATHER' as const,
        toastType: 'warning' as const,
        section: 'Tundla – Etawah Section',
        zone: 'Northern Railway',
        trains: ['18102', '12417']
      },
      {
        title: 'Level Crossing Interlock Verified',
        message: 'Interlocked Gate LC-112 on Kanpur – Prayagraj line locked and signal cleared for Express rake passage.',
        severity: 'INFO' as const,
        category: 'SIGNAL_FAILURE' as const,
        toastType: 'info' as const,
        section: 'Kanpur – Prayagraj Line',
        zone: 'Northern Railway',
        trains: ['12309']
      },
      {
        title: 'AI Traffic Optimizer Alert',
        message: 'AI Dispatcher recommends Platform 5 allocation at Kanpur Central for Train 18102 to avert 6m turnaround delay.',
        severity: 'WARNING' as const,
        category: 'PLATFORM_CONFLICT' as const,
        toastType: 'warning' as const,
        section: 'Kanpur Central (CNB)',
        zone: 'Northern Railway',
        trains: ['18102']
      },
      {
        title: 'Automatic Signal Route Locked',
        message: 'Pt. Deen Dayal Upadhyaya (DDU) Junction East cabin reports all 8 crossover switches locked and green.',
        severity: 'INFO' as const,
        category: 'CONGESTION' as const,
        toastType: 'success' as const,
        section: 'Pt. Deen Dayal Upadhyaya Yard',
        zone: 'East Central Railway',
        trains: ['12424', '12309']
      }
    ];

    let bulletinIndex = 0;

    // Initial alert after 5 seconds
    const initialTimeout = setTimeout(() => {
      const bulletin = operationalBulletins[0];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const newAlert: RailwayAlert = {
        id: `alert-dyn-${Date.now()}`,
        title: bulletin.title,
        message: bulletin.message,
        section: bulletin.section,
        zone: bulletin.zone,
        severity: bulletin.severity,
        category: bulletin.category,
        timestamp,
        affectedTrains: bulletin.trains,
        isResolved: false
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 15)]);
      addToast(bulletin.title, bulletin.message, bulletin.toastType);
      bulletinIndex = 1;
    }, 5000);

    // Periodic interval every 20 seconds
    const interval = setInterval(() => {
      const bulletin = operationalBulletins[bulletinIndex % operationalBulletins.length];
      bulletinIndex++;

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const newAlert: RailwayAlert = {
        id: `alert-dyn-${Date.now()}`,
        title: bulletin.title,
        message: bulletin.message,
        section: bulletin.section,
        zone: bulletin.zone,
        severity: bulletin.severity,
        category: bulletin.category,
        timestamp,
        affectedTrains: bulletin.trains,
        isResolved: false
      };

      setAlerts(prev => [newAlert, ...prev.slice(0, 15)]);
      addToast(bulletin.title, bulletin.message, bulletin.toastType);
    }, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [addToast]);

  // Human-in-the-loop: Approve AI Recommendation
  const approveRecommendation = (recId: string, notes?: string) => {
    const rec = recommendations.find(r => r.id === recId);
    if (!rec) return;

    setRecommendations(prev => prev.map(r => {
      if (r.id === recId) {
        return {
          ...r,
          status: 'APPROVED',
          reviewedBy: user?.name || 'Operator',
          reviewedAt: new Date().toLocaleTimeString()
        };
      }
      return r;
    }));

    // Update target train state accordingly
    setTrains(prev => prev.map(train => {
      if (train.number === rec.trainNumber) {
        if (rec.type === 'HOLD_TRAIN') {
          return { ...train, status: 'HOLD', speedKmH: 0 };
        } else if (rec.type === 'ALLOW_TRAIN') {
          return { ...train, status: 'ON_TIME', delayMinutes: 0, speedKmH: 125 };
        } else if (rec.type === 'CHANGE_PLATFORM') {
          return { ...train, platform: rec.actionDetails?.assignedPlatform || train.platform };
        }
      }
      return train;
    }));

    addAuditEntry(
      'Approved AI Recommendation',
      `Executed ${rec.recommendation}`,
      notes || rec.reason,
      rec.trainNumber,
      'SUCCESS',
      rec.zone
    );

    addToast(
      'Recommendation Approved',
      `Train ${rec.trainNumber} (${rec.trainName}) updated. Action: ${rec.recommendation}`,
      'success'
    );

    // Sync with backend API
    RailwayApi.approveRecommendation(recId, {
      operatorName: user?.name,
      notes
    });
  };

  // Human-in-the-loop: Reject AI Recommendation
  const rejectRecommendation = (recId: string, reason: string) => {
    const rec = recommendations.find(r => r.id === recId);
    if (!rec) return;

    setRecommendations(prev => prev.map(r => {
      if (r.id === recId) {
        return {
          ...r,
          status: 'REJECTED',
          reviewedBy: user?.name || 'Operator',
          reviewedAt: new Date().toLocaleTimeString()
        };
      }
      return r;
    }));

    addAuditEntry(
      'Rejected AI Recommendation',
      `Manual Override: Kept existing timetable schedule for Train ${rec.trainNumber}`,
      `Operator Override Reason: ${reason}`,
      rec.trainNumber,
      'WARNING',
      rec.zone
    );

    addToast(
      'Recommendation Rejected',
      `AI recommendation for Train ${rec.trainNumber} rejected with reason: ${reason}`,
      'warning'
    );

    // Sync with backend API
    RailwayApi.rejectRecommendation(recId, {
      operatorName: user?.name,
      reason
    });
  };

  // Human-in-the-loop: Modify AI Recommendation
  const modifyRecommendation = (recId: string, modifications: {
    holdDurationMinutes?: number;
    assignedPlatform?: string | number;
    alternateRoute?: string;
    speedRestriction?: number;
    revisedPriority?: TrainPriority;
    notes?: string;
  }) => {
    const rec = recommendations.find(r => r.id === recId);
    if (!rec) return;

    setRecommendations(prev => prev.map(r => {
      if (r.id === recId) {
        return {
          ...r,
          status: 'MODIFIED',
          reviewedBy: user?.name || 'Operator',
          reviewedAt: new Date().toLocaleTimeString(),
          actionDetails: {
            ...r.actionDetails,
            ...modifications
          }
        };
      }
      return r;
    }));

    // Apply modifications to train
    setTrains(prev => prev.map(train => {
      if (train.number === rec.trainNumber) {
        return {
          ...train,
          ...(modifications.assignedPlatform && { platform: modifications.assignedPlatform }),
          ...(modifications.speedRestriction && { speedKmH: modifications.speedRestriction }),
          ...(modifications.revisedPriority && { priority: modifications.revisedPriority })
        };
      }
      return train;
    }));

    addAuditEntry(
      'Modified AI Recommendation',
      `Operator customized dispatch parameters for Train ${rec.trainNumber}`,
      modifications.notes || 'Parameter custom adjustments',
      rec.trainNumber,
      'SUCCESS',
      rec.zone
    );

    addToast(
      'Recommendation Modified & Applied',
      `Train ${rec.trainNumber} updated with custom dispatch values.`,
      'info'
    );
  };

  // Manual Controls
  const executeManualHold = (trainNumber: string, durationMinutes: number, reason: string) => {
    setTrains(prev => prev.map(t => {
      if (t.number === trainNumber) {
        return { ...t, status: 'HOLD', speedKmH: 0 };
      }
      return t;
    }));

    addAuditEntry(
      'Manual Signal Hold Imposed',
      `Held Train ${trainNumber} for ${durationMinutes} mins`,
      reason,
      trainNumber,
      'WARNING'
    );

    addToast('Signal Hold Active', `Train ${trainNumber} held at red aspect.`, 'warning');

    RailwayApi.overrideTrain(trainNumber, {
      status: 'HOLD',
      speedKmH: 0,
      operatorName: user?.name,
      reason
    });
  };

  const executeManualRelease = (trainNumber: string, reason: string) => {
    setTrains(prev => prev.map(t => {
      if (t.number === trainNumber) {
        return { ...t, status: 'ON_TIME', speedKmH: 110 };
      }
      return t;
    }));

    addAuditEntry(
      'Manual Track Release Executed',
      `Authorized Green Signal for Train ${trainNumber}`,
      reason,
      trainNumber,
      'SUCCESS'
    );

    addToast('Signal Released', `Train ${trainNumber} cleared for immediate transit.`, 'success');

    RailwayApi.overrideTrain(trainNumber, {
      status: 'ON_TIME',
      speedKmH: 110,
      operatorName: user?.name,
      reason
    });
  };

  const executePlatformChange = (trainNumber: string, stationCode: string, newPlatform: number | string, reason: string) => {
    setTrains(prev => prev.map(t => {
      if (t.number === trainNumber) {
        return { ...t, platform: newPlatform };
      }
      return t;
    }));

    addAuditEntry(
      'Manual Platform Reallocation',
      `Rerouted Train ${trainNumber} at ${stationCode} to Platform ${newPlatform}`,
      reason,
      trainNumber,
      'SUCCESS'
    );

    addToast('Platform Updated', `Train ${trainNumber} routed to Platform ${newPlatform} at ${stationCode}`, 'info');

    RailwayApi.overrideTrain(trainNumber, {
      platform: newPlatform,
      operatorName: user?.name,
      reason
    });
  };

  const executeSpeedRestriction = (trainNumber: string, speedKmH: number, section: string, reason: string) => {
    setTrains(prev => prev.map(t => {
      if (t.number === trainNumber) {
        return { ...t, speedKmH };
      }
      return t;
    }));

    addAuditEntry(
      'Speed Restriction Order',
      `Imposed ${speedKmH} km/h restriction on Train ${trainNumber} in ${section}`,
      reason,
      trainNumber,
      'WARNING'
    );

    addToast('Speed Restriction Imposed', `Caution order (${speedKmH} km/h) dispatched to driver.`, 'warning');

    RailwayApi.overrideTrain(trainNumber, {
      speedKmH,
      operatorName: user?.name,
      reason
    });
  };

  const triggerEmergencyCorridorBlock = (section: string, reason: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const details = { section, reason, timestamp };
    
    setEmergencyMode(true);
    setEmergencyDetails(details);
    localStorage.setItem('pragati_emergency_mode', 'true');
    localStorage.setItem('pragati_emergency_details', JSON.stringify(details));
    
    // Set all trains in section to HOLD
    setTrains(prev => prev.map(t => {
      if (t.currentStation.includes('Kanpur') || t.currentStation.includes('Tundla')) {
        return { ...t, status: 'HOLD', speedKmH: 0 };
      }
      return t;
    }));

    const alert: RailwayAlert = {
      id: 'em-alert-' + Date.now(),
      title: 'EMERGENCY SECTION LOCKDOWN',
      message: `Emergency red signal lock activated on section ${section}. All train movements halted.`,
      section,
      zone: selectedZone || 'Northern Railway',
      severity: 'CRITICAL',
      category: 'EMERGENCY',
      timestamp,
      affectedTrains: ['12951', '12424', 'CONT-90421']
    };

    setAlerts(prev => [alert, ...prev]);

    addAuditEntry(
      'EMERGENCY CORRIDOR LOCKDOWN TRIGGERED',
      `Halted all train movements on section ${section}`,
      reason,
      undefined,
      'EMERGENCY'
    );

    addToast('EMERGENCY SECTION HALT', `Section ${section} locked. Emergency signals dispatched.`, 'error');

    // Sync with backend API
    RailwayApi.triggerEmergency({
      section,
      reason,
      operatorName: user?.name
    });
  };

  // Permanent Resolution Protocol for Emergency Mode
  const resolveEmergencyPermanently = (resolutionNotes?: string) => {
    // 1. Clear State and LocalStorage
    setEmergencyMode(false);
    setEmergencyDetails(null);
    localStorage.removeItem('pragati_emergency_mode');
    localStorage.removeItem('pragati_emergency_details');

    // 2. Restore all held trains to normal active running speed
    setTrains(prev => prev.map(t => {
      if (t.status === 'HOLD') {
        const standardSpeed = t.type === 'VANDE_BHARAT' ? 130 : (t.type === 'RAJDHANI' ? 120 : (t.type === 'SHATABDI' ? 115 : 85));
        return {
          ...t,
          status: 'ON_TIME',
          speedKmH: standardSpeed
        };
      }
      return t;
    }));

    // 3. Clear Emergency Alerts
    setAlerts(prev => prev.filter(a => !a.title.includes('EMERGENCY')));

    // 4. Log Official Safety Clearance in Audit Trail
    addAuditEntry(
      'Emergency Corridor Lock Resolved',
      'Restored nominal automatic block signaling & cleared track blocks',
      resolutionNotes || 'Section engineer verified track clearance. All interlocks returned to automatic operation.',
      undefined,
      'SUCCESS'
    );

    // 5. User Notification
    addToast(
      'Emergency Resolved Permanently',
      'Normal traffic restored. Track locks cleared and logged to safety audit trail.',
      'success'
    );

    // 6. Sync with backend API
    RailwayApi.resolveEmergency({
      notes: resolutionNotes,
      operatorName: user?.name
    });
  };

  // What-If Simulation Engine
  const runWhatIfSimulation = (trainNumber: string, delayMins: number, trackBlock?: string): WhatIfScenario => {
    const scenario: WhatIfScenario = {
      id: 'scen-' + Date.now(),
      title: `Simulated +${delayMins}m delay on Train ${trainNumber}`,
      targetTrainNumber: trainNumber,
      delayInjectedMinutes: delayMins,
      trackBlockSection: trackBlock,
      baseline: {
        totalNetworkDelay: 42 + delayMins * 2,
        throughputPercentage: 88.5 - delayMins * 0.4,
        conflictsPredicted: delayMins > 10 ? 3 : 1,
        cascadingDelaysCount: delayMins > 15 ? 4 : (delayMins > 5 ? 2 : 0)
      },
      optimized: {
        totalNetworkDelay: 28 + Math.round(delayMins * 0.8),
        throughputPercentage: 92.8,
        conflictsPredicted: 0,
        cascadingDelaysCount: 0,
        avoidedConflictsCount: delayMins > 10 ? 3 : 1
      },
      aiRecommendations: [
        `Prioritize Train #${trainNumber} on Loop line clearance`,
        `Dynamic headway regulation to avoid trailing express bunching`
      ]
    };

    setWhatIfScenario(scenario);
    return scenario;
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isResolved: true } : a));
    addToast('Alert Marked Resolved', 'The operational alert has been acknowledged and marked as resolved.', 'success');
    RailwayApi.resolveAlert(alertId, { operatorName: user?.name });
  };

  const addAlert = (alert: Omit<RailwayAlert, 'id' | 'timestamp'>) => {
    const newAlert: RailwayAlert = {
      ...alert,
      id: 'alert-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAlerts(prev => [newAlert, ...prev]);
    addToast(alert.title, alert.message, alert.severity === 'CRITICAL' ? 'error' : 'warning');
    
    // Sync with backend API
    RailwayApi.createAlert(newAlert);
  };

  return (
    <RailwayContext.Provider
      value={{
        trains,
        zones,
        recommendations,
        alerts,
        stations,
        auditLogs,
        whatIfScenario,
        lastUpdated,
        isLiveActive,
        setIsLiveActive,
        emergencyMode,
        emergencyDetails,
        resolveEmergencyPermanently,
        toasts,
        dismissToast,
        approveRecommendation,
        rejectRecommendation,
        modifyRecommendation,
        executeManualHold,
        executeManualRelease,
        executePlatformChange,
        executeSpeedRestriction,
        triggerEmergencyCorridorBlock,
        runWhatIfSimulation,
        resolveAlert,
        addAlert
      }}
    >
      {children}
    </RailwayContext.Provider>
  );
};

export const useRailway = (): RailwayContextType => {
  const context = useContext(RailwayContext);
  if (!context) {
    throw new Error('useRailway must be used within a RailwayProvider');
  }
  return context;
};
