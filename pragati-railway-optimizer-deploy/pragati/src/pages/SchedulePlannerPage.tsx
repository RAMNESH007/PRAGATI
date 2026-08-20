import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { 
  AlertTriangle, 
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Clock,
  MapPin,
  Train as TrainIcon,
  Layers,
  Activity
} from 'lucide-react';

interface TrainScheduleBlock {
  number: string;
  name: string;
  start: number;
  duration: number;
  status: string;
  type: string;
  conflictNote?: string;
  aiHold?: string;
}

interface PlatformSchedule {
  platform: string;
  trains: TrainScheduleBlock[];
}

interface StationGanttData {
  hasConflict: boolean;
  conflictDetails?: {
    platform: string;
    title: string;
    description: string;
    trainNumber: string;
    recommendedPlatform: number;
  };
  resolvedDetails?: {
    title: string;
    description: string;
    throughputGain: string;
  };
  schedules: (isResolved: boolean) => PlatformSchedule[];
}

export const SchedulePlannerPage: React.FC = () => {
  const { executePlatformChange, executeManualRelease } = useRailway();
  const { selectedZone } = useAuth();
  
  const [selectedStation, setSelectedStation] = useState<string>('Kanpur Central (CNB)');
  const [isConflictResolved, setIsConflictResolved] = useState<boolean>(() => {
    return localStorage.getItem('pragati_platform_conflict_resolved') === 'true';
  });

  const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

  const handleAutoResolve = () => {
    setIsConflictResolved(true);
    localStorage.setItem('pragati_platform_conflict_resolved', 'true');
    executePlatformChange('18102', 'CNB', 5, 'AI Automated Platform Conflict Resolution');
    executeManualRelease('12951', 'AI Timetable clearance buffer achieved');
  };

  const handleResetConflict = () => {
    setIsConflictResolved(false);
    localStorage.removeItem('pragati_platform_conflict_resolved');
    executePlatformChange('18102', 'CNB', 3, 'Simulation reset');
  };

  // Station-specific Gantt Schedules & Conflict Data
  const STATION_SCHEDULES: Record<string, StationGanttData> = {
    'Kanpur Central (CNB)': {
      hasConflict: true,
      conflictDetails: {
        platform: 'PF 3',
        title: '1 Platform Conflict Detected on PF 3',
        description: 'Tata Express (18102) turnaround exceeds platform slot by 14 minutes. AI recommends rerouting to Platform 5.',
        trainNumber: '18102',
        recommendedPlatform: 5
      },
      resolvedDetails: {
        title: 'All Platform Conflicts Resolved (Zero Overlaps)',
        description: 'Tata Express (18102) reallocated to Platform 5. Platform 3 clear for through traffic.',
        throughputGain: '+9.4%'
      },
      schedules: (resolved) => [
        {
          platform: 'Platform 1 (Main Up)',
          trains: [
            { number: '22436', name: 'Vande Bharat', start: 0.1, duration: 0.25, status: 'ON_TIME', type: 'VANDE_BHARAT' },
            { number: '12424', name: 'Dibrugarh Rajdhani', start: 0.45, duration: 0.3, status: 'DELAYED', type: 'RAJDHANI' },
            { number: '12417', name: 'Prayagraj Exp', start: 0.8, duration: 0.2, status: 'ON_TIME', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'Platform 2 (Main Down)',
          trains: [
            { number: '12309', name: 'Patna Rajdhani', start: 0.25, duration: 0.28, status: 'ON_TIME', type: 'RAJDHANI' },
            { number: '12627', name: 'Karnataka Exp', start: 0.65, duration: 0.25, status: 'DELAYED', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'Platform 3 (Loop 1)',
          trains: resolved ? [] : [
            { number: '18102', name: 'Tata Muri Exp', start: 0.35, duration: 0.35, status: 'CONFLICT', type: 'MAIL_EXPRESS', conflictNote: 'Overdue departure block' }
          ]
        },
        {
          platform: 'Platform 4 (Loop 2)',
          trains: [
            { 
              number: '12951', 
              name: 'Mumbai Rajdhani', 
              start: 0.4, 
              duration: 0.32, 
              status: resolved ? 'ON_TIME' : 'HOLD', 
              type: 'RAJDHANI', 
              aiHold: resolved ? undefined : 'AI 6-min hold active' 
            }
          ]
        },
        {
          platform: 'Platform 5 (Loop 3)',
          trains: resolved ? [
            { 
              number: '18102', 
              name: 'Tata Muri Exp (Rerouted)', 
              start: 0.35, 
              duration: 0.35, 
              status: 'ON_TIME', 
              type: 'MAIL_EXPRESS' 
            }
          ] : []
        },
        {
          platform: 'Goods Line G1 (Freight)',
          trains: [
            { number: 'CONT-90421', name: 'Container Freight', start: 0.1, duration: 0.7, status: 'MAINTENANCE', type: 'FREIGHT' }
          ]
        }
      ]
    },

    'New Delhi (NDLS)': {
      hasConflict: false,
      resolvedDetails: {
        title: 'Nominal Timetable Schedule Active (16 Platforms Synchronized)',
        description: 'Automatic Electronic Interlocking active. Headways optimized for high-density Rajdhani & Vande Bharat departures.',
        throughputGain: '+12.1%'
      },
      schedules: () => [
        {
          platform: 'Platform 1 (Ajmeri Gate)',
          trains: [
            { number: '12004', name: 'Lucknow Shatabdi', start: 0.05, duration: 0.3, status: 'ON_TIME', type: 'SHATABDI' },
            { number: '22436', name: 'Vande Bharat', start: 0.65, duration: 0.3, status: 'ON_TIME', type: 'VANDE_BHARAT' }
          ]
        },
        {
          platform: 'Platform 2 (Main Line)',
          trains: [
            { number: '12424', name: 'Dibrugarh Rajdhani', start: 0.2, duration: 0.35, status: 'DELAYED', type: 'RAJDHANI' },
            { number: '12417', name: 'Prayagraj Exp', start: 0.7, duration: 0.25, status: 'ON_TIME', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'Platform 3 (Fast Track)',
          trains: [
            { number: '12309', name: 'Patna Rajdhani', start: 0.15, duration: 0.3, status: 'ON_TIME', type: 'RAJDHANI' },
            { number: '12627', name: 'Karnataka Exp', start: 0.55, duration: 0.35, status: 'DELAYED', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'Platform 4 (Southbound Trunk)',
          trains: [
            { number: '12951', name: 'Mumbai Rajdhani', start: 0.3, duration: 0.35, status: 'ON_TIME', type: 'RAJDHANI' }
          ]
        },
        {
          platform: 'Platform 5 (East Coast Loop)',
          trains: [
            { number: '12259', name: 'Sealdah Duronto', start: 0.4, duration: 0.45, status: 'MAINTENANCE', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'Platform 16 (Paharganj Side)',
          trains: [
            { number: 'CONT-90421', name: 'DFC Express Freight', start: 0.05, duration: 0.6, status: 'HOLD', type: 'FREIGHT' }
          ]
        }
      ]
    },

    'Prayagraj Junction (PRYJ)': {
      hasConflict: false,
      resolvedDetails: {
        title: 'Prayagraj Junction — Quad-Track Dynamic Flow Active',
        description: 'Electronic Interlocking synchronized with NCR Zonal Dispatch Control with automatic loop line clearance.',
        throughputGain: '+8.7%'
      },
      schedules: () => [
        {
          platform: 'Platform 1 (Civil Lines)',
          trains: [
            { number: '12417', name: 'Prayagraj Express', start: 0.05, duration: 0.35, status: 'ON_TIME', type: 'SUPERFAST' },
            { number: '12309', name: 'Patna Rajdhani', start: 0.55, duration: 0.28, status: 'ON_TIME', type: 'RAJDHANI' }
          ]
        },
        {
          platform: 'Platform 2 (Main Up)',
          trains: [
            { number: '22436', name: 'Vande Bharat', start: 0.2, duration: 0.25, status: 'ON_TIME', type: 'VANDE_BHARAT' },
            { number: '12627', name: 'Karnataka Exp', start: 0.65, duration: 0.3, status: 'DELAYED', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'Platform 3 (Main Down)',
          trains: [
            { number: '12424', name: 'Dibrugarh Rajdhani', start: 0.3, duration: 0.3, status: 'DELAYED', type: 'RAJDHANI' }
          ]
        },
        {
          platform: 'Platform 4 (City Side Loop)',
          trains: [
            { number: '18102', name: 'Tata Muri Exp', start: 0.1, duration: 0.35, status: 'ON_TIME', type: 'MAIL_EXPRESS' },
            { number: '12951', name: 'Mumbai Rajdhani', start: 0.5, duration: 0.35, status: 'ON_TIME', type: 'RAJDHANI' }
          ]
        },
        {
          platform: 'Goods Line (Subedarganj Bypass)',
          trains: [
            { number: 'CONT-90421', name: 'Dadri DFC Freight', start: 0.05, duration: 0.8, status: 'HOLD', type: 'FREIGHT' }
          ]
        }
      ]
    },

    'Pt. Deen Dayal Upadhyaya (DDU)': {
      hasConflict: false,
      resolvedDetails: {
        title: 'DDU Grand Chord Junction — Heavy Freight & Passenger Balance',
        description: 'Freight bypass loops operational. Automatic signal blocks maintain 130 km/h express line speeds.',
        throughputGain: '+14.3%'
      },
      schedules: () => [
        {
          platform: 'Platform 1 (Main Up Grand Chord)',
          trains: [
            { number: '12309', name: 'Patna Rajdhani', start: 0.05, duration: 0.3, status: 'ON_TIME', type: 'RAJDHANI' },
            { number: '12424', name: 'Dibrugarh Rajdhani', start: 0.5, duration: 0.35, status: 'DELAYED', type: 'RAJDHANI' }
          ]
        },
        {
          platform: 'Platform 2 (Main Down)',
          trains: [
            { number: '22436', name: 'Vande Bharat', start: 0.35, duration: 0.25, status: 'ON_TIME', type: 'VANDE_BHARAT' },
            { number: '12417', name: 'Prayagraj Exp', start: 0.7, duration: 0.25, status: 'ON_TIME', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'Platform 3 (Loop Up)',
          trains: [
            { number: '18102', name: 'Tata Muri Exp', start: 0.25, duration: 0.35, status: 'ON_TIME', type: 'MAIL_EXPRESS' }
          ]
        },
        {
          platform: 'Platform 4 (Loop Down)',
          trains: [
            { number: '12259', name: 'Sealdah Duronto', start: 0.15, duration: 0.45, status: 'DELAYED', type: 'SUPERFAST' }
          ]
        },
        {
          platform: 'DDU Marshalling Yard (Freight Track 1)',
          trains: [
            { number: 'CONT-90421', name: 'Heavy Mineral Freight', start: 0.05, duration: 0.9, status: 'ON_TIME', type: 'FREIGHT' }
          ]
        }
      ]
    }
  };

  const currentStationData = STATION_SCHEDULES[selectedStation] || STATION_SCHEDULES['Kanpur Central (CNB)'];
  const activeSchedules = currentStationData.schedules(isConflictResolved);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Schedule Planner & Corridor Gantt
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Platform occupancy schedules, conflict detection Gantt charts & timetable slots
          </p>
        </div>

        {/* Station Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-800 shadow-soft focus:ring-2 focus:ring-[#063B7A] focus:outline-none cursor-pointer"
            >
              <option value="Kanpur Central (CNB)">Kanpur Central (CNB)</option>
              <option value="New Delhi (NDLS)">New Delhi (NDLS)</option>
              <option value="Prayagraj Junction (PRYJ)">Prayagraj Junction (PRYJ)</option>
              <option value="Pt. Deen Dayal Upadhyaya (DDU)">Pt. Deen Dayal Upadhyaya (DDU)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Conflict Status / Resolution Banner */}
      {currentStationData.hasConflict && !isConflictResolved ? (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-soft animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-amber-800 text-sm block">{currentStationData.conflictDetails?.title}</span>
              <p className="text-amber-700 text-[11px] mt-0.5">
                {currentStationData.conflictDetails?.description}
              </p>
            </div>
          </div>

          <button 
            onClick={handleAutoResolve}
            className="bg-gradient-to-r from-[#FF6B00] to-[#F45100] hover:opacity-95 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-orange-600/20 flex items-center space-x-1.5 flex-shrink-0 cursor-pointer transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Resolve Conflict</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-soft animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-emerald-900 text-sm block">
                {currentStationData.resolvedDetails?.title || 'Optimal Platform Headways Synchronized'}
              </span>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                {currentStationData.resolvedDetails?.description} <strong className="text-emerald-900">Throughput Gain: {currentStationData.resolvedDetails?.throughputGain || '+9.4%'}</strong>
              </p>
            </div>
          </div>

          {currentStationData.hasConflict && (
            <button 
              onClick={handleResetConflict}
              className="bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm flex items-center space-x-1.5 flex-shrink-0 cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Simulate Conflict</span>
            </button>
          )}
        </div>
      )}

      {/* Main Gantt Timeline Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {selectedStation} — Live Platform Allocation Timeline
            </h3>
          </div>
          
          <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>On Time</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Delayed</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Conflict / Hold</span>
            </span>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="grid grid-cols-12 text-xs font-mono font-bold text-slate-400 border-b pb-2">
          <div className="col-span-3">Platform / Track</div>
          <div className="col-span-9 grid grid-cols-6 text-center">
            {timeSlots.map((ts, idx) => (
              <span key={idx}>{ts}</span>
            ))}
          </div>
        </div>

        {/* Gantt Rows */}
        <div className="space-y-3 pt-2">
          {activeSchedules.map((row: PlatformSchedule, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center text-xs py-1.5 border-b border-slate-100 last:border-0">
              
              {/* Platform Label */}
              <div className="col-span-3 font-extrabold text-slate-800 pr-2 truncate flex items-center justify-between">
                <span>{row.platform}</span>
                {row.trains.length === 0 && (
                  <span className="text-[10px] text-slate-400 font-normal italic pr-2">Clear</span>
                )}
              </div>

              {/* Timeline Bar Track */}
              <div className="col-span-9 relative h-10 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                {/* Vertical grid lines */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute top-0 bottom-0 border-r border-slate-200 border-dashed"
                    style={{ left: `${((i + 1) / 6) * 100}%` }}
                  />
                ))}

                {/* Train Blocks on Timeline */}
                {row.trains.map((train: TrainScheduleBlock, tIdx) => {
                  const leftPct = train.start * 100;
                  const widthPct = train.duration * 100;

                  const blockColor = 
                    train.status === 'ON_TIME' ? 'bg-emerald-600 text-white border-emerald-700' :
                    train.status === 'DELAYED' ? 'bg-amber-500 text-white border-amber-600' :
                    train.status === 'HOLD' ? 'bg-red-600 text-white border-red-700' :
                    train.status === 'CONFLICT' ? 'bg-red-500 text-white border-red-700 animate-pulse' :
                    'bg-purple-600 text-white border-purple-700';

                  return (
                    <div
                      key={tIdx}
                      className={`absolute top-1.5 bottom-1.5 rounded-lg px-2 flex items-center justify-between border shadow-sm transition-all duration-300 ${blockColor}`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={`${train.number} ${train.name} (${train.status})`}
                    >
                      <div className="truncate text-[10px] font-extrabold flex items-center space-x-1">
                        <span>{train.number}</span>
                        <span className="hidden sm:inline font-normal opacity-90">{train.name}</span>
                      </div>
                      {train.aiHold && (
                        <span className="text-[9px] bg-black/30 px-1 rounded font-mono hidden md:inline">
                          HOLD
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
