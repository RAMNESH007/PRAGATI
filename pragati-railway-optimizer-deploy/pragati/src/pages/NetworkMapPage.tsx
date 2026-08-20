import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { SchematicNetworkMap } from '../components/network/SchematicNetworkMap';
import { StationNode } from '../types';
import { 
  MapPin, 
  Activity, 
  Radio
} from 'lucide-react';

export const NetworkMapPage: React.FC = () => {
  const { stations } = useRailway();
  const [activeLayer, setActiveLayer] = useState<'SCHEMATIC' | 'CAPACITY_HEATMAP' | 'SIGNALS'>('SCHEMATIC');
  const [selectedStation, setSelectedStation] = useState<StationNode | null>(stations[3] || null);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Interactive Railway Network Map
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Geospatial & schematic corridor telemetry, block section occupancies, and signal interlocking
          </p>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-soft text-xs font-bold">
          <button
            onClick={() => setActiveLayer('SCHEMATIC')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeLayer === 'SCHEMATIC' ? 'bg-[#063B7A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Schematic Track View
          </button>
          <button
            onClick={() => setActiveLayer('CAPACITY_HEATMAP')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeLayer === 'CAPACITY_HEATMAP' ? 'bg-[#FF6B00] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Congestion Heatmap
          </button>
          <button
            onClick={() => setActiveLayer('SIGNALS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeLayer === 'SIGNALS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Signal Interlocking
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-4 sm:p-5">
        <SchematicNetworkMap />
      </div>

      {/* Section Capacity Heatmap Cards if Heatmap Layer is active */}
      {activeLayer === 'CAPACITY_HEATMAP' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#FF6B00]" />
              <span>Block Section Capacity & Line Utilization Index</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Benchmark: 100% = Theoretical Saturation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              { section: 'Howrah – Bardhaman', load: 96, status: 'CONGESTED', color: 'bg-red-500 text-white', desc: 'EMU suburban + trunk mix' },
              { section: 'Kanpur – Tundla', load: 88, status: 'HIGH LOAD', color: 'bg-amber-500 text-white', desc: 'Heavy freight & Rajdhani trunk' },
              { section: 'New Delhi – Ghaziabad', load: 92, status: 'HIGH LOAD', color: 'bg-amber-500 text-white', desc: 'Multi-junction bottleneck' },
              { section: 'Prayagraj – DDU', load: 74, status: 'OPTIMAL', color: 'bg-emerald-500 text-white', desc: 'Clear high-speed corridor' }
            ].map((sec, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{sec.section}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${sec.color}`}>
                    {sec.load}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${sec.load > 90 ? 'bg-red-500' : sec.load > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${sec.load}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station & Signal Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Station Platform Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#063B7A]" />
              <span>Junction & Station Platform Matrix</span>
            </h3>
            <select
              value={selectedStation?.id}
              onChange={(e) => {
                const st = stations.find(s => s.id === e.target.value);
                if (st) setSelectedStation(st);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {stations.map((st: StationNode) => (
                <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
              ))}
            </select>
          </div>

          {selectedStation && (
            <div className="space-y-4 text-xs">
              <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-[#063B7A]">{selectedStation.name} ({selectedStation.code})</h4>
                  <p className="text-slate-500 text-[11px] font-medium">
                    {selectedStation.zone} • {selectedStation.junction ? 'Major Junction' : 'Intermediate Terminal'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Platform Occupancy</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {selectedStation.occupiedPlatforms.length} / {selectedStation.platforms} Occupied
                  </span>
                </div>
              </div>

              {/* Platform Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: selectedStation.platforms }).map((_, i) => {
                  const pfNum = i + 1;
                  const isOccupied = selectedStation.occupiedPlatforms.includes(pfNum);
                  return (
                    <div
                      key={pfNum}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        isOccupied 
                          ? 'bg-red-50 border-red-300 text-red-900 font-bold' 
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                      }`}
                    >
                      <span className="text-[10px] uppercase block opacity-70">PF</span>
                      <span className="text-sm font-black block">{pfNum}</span>
                      <span className="text-[9px] block mt-0.5">{isOccupied ? 'BUSY' : 'FREE'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Signal Aspect Real-Time Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>Automatic Block Signals</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { signal: 'Signal S-104 (Up Main Trunk)', aspect: 'GREEN', location: 'Kanpur Outer', speedLimit: '130 km/h' },
              { signal: 'Signal S-106 (Loop Diversion 2)', aspect: 'YELLOW', location: 'Kanpur Yard', speedLimit: '30 km/h' },
              { signal: 'Signal S-42 (Kanpur-Tundla Block)', aspect: 'DOUBLE_YELLOW', location: 'Section Block 04', speedLimit: '75 km/h' },
              { signal: 'Signal S-88 (Platform 3 Starter)', aspect: 'RED', location: 'Prayagraj Junction', speedLimit: '0 km/h (Hold)' }
            ].map((sig, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">{sig.signal}</span>
                  <span className="text-[11px] text-slate-500">{sig.location} • Limit: {sig.speedLimit}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-3 h-3 rounded-full ${
                    sig.aspect === 'GREEN' ? 'bg-emerald-500 animate-pulse' :
                    sig.aspect === 'YELLOW' ? 'bg-amber-400' :
                    sig.aspect === 'DOUBLE_YELLOW' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-[10px] font-black font-mono uppercase text-slate-700">{sig.aspect}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
