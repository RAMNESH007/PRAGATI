import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { IndiaZoneMap } from '../components/network/IndiaZoneMap';
import { SchematicNetworkMap } from '../components/network/SchematicNetworkMap';
import { RailwayZone, Train } from '../types';
import { 
  Search, 
  ChevronRight,
  MapPin,
  Train as TrainIcon,
  Clock,
  TrendingUp,
  ShieldAlert,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ZonesPage: React.FC = () => {
  const { zones, trains, alerts } = useRailway();
  const { user, selectedZone } = useAuth();
  const navigate = useNavigate();

  const isOperator = user?.role === 'OPERATOR';
  const assignedZoneName = user?.assignedZone || selectedZone || 'Northern Railway';

  const [activeTab, setActiveTab] = useState<'MY_ZONE' | 'ALL_ZONES'>(isOperator ? 'MY_ZONE' : 'ALL_ZONES');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZoneObj, setSelectedZoneObj] = useState<RailwayZone | null>(() => {
    return zones.find(z => z.name === assignedZoneName || assignedZoneName.includes(z.name)) || zones[0];
  });

  const myZoneData = zones.find(z => z.name === assignedZoneName || assignedZoneName.includes(z.name)) || zones[0];
  const myZoneTrains = trains.filter(t => t.currentStation.includes('Delhi') || t.currentStation.includes('Kanpur') || t.currentStation.includes('Tundla') || true).slice(0, 6);
  const myZoneAlerts = alerts.filter(a => a.zone === myZoneData.name || a.section.includes('Kanpur') || a.section.includes('Delhi'));

  // Northern Railway Divisional breakdown
  const divisions = [
    { name: 'Delhi Division (DLI)', hq: 'New Delhi', activeTrains: 118, throughput: 91.2, punctuality: 74, status: 'Active' },
    { name: 'Ambala Division (UMB)', hq: 'Ambala Cantt', activeTrains: 64, throughput: 88.5, punctuality: 71, status: 'Active' },
    { name: 'Lucknow Division (LKO)', hq: 'Lucknow NR', activeTrains: 58, throughput: 87.9, punctuality: 69, status: 'Active' },
    { name: 'Moradabad Division (MB)', hq: 'Moradabad', activeTrains: 42, throughput: 89.4, punctuality: 73, status: 'Active' },
    { name: 'Firozpur Division (FZR)', hq: 'Firozpur Cantt', activeTrains: 30, throughput: 90.1, punctuality: 76, status: 'Active' }
  ];

  const filteredZones = zones.filter((z: RailwayZone) => 
    z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    z.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    z.headquarters.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'MY_ZONE' ? `My Zone Overview — ${myZoneData.name}` : 'Indian Railway Zones Directory'}
            </h1>
            <span className="bg-[#063B7A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {activeTab === 'MY_ZONE' ? `${myZoneData.code} Scoped` : '17 Zones Connected'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {activeTab === 'MY_ZONE'
              ? `Operational status, divisional throughput & active rakes for ${myZoneData.name} (HQ: ${myZoneData.headquarters})`
              : 'Operational status, section throughput, and active train manifests across all 17 railway zones'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('MY_ZONE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'MY_ZONE'
                ? 'bg-[#063B7A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Zone ({myZoneData.code})
          </button>
          <button
            onClick={() => setActiveTab('ALL_ZONES')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ALL_ZONES'
                ? 'bg-[#063B7A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 17 Zones
          </button>
        </div>
      </div>

      {activeTab === 'MY_ZONE' ? (
        /* ================= MY ZONE OPERATOR OVERVIEW ================= */
        <div className="space-y-5">
          
          {/* 4 My Zone KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Trains</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-[#0878F9]">
                  <TrainIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{myZoneData.activeTrains}</div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Running in {myZoneData.code}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Section Throughput</span>
                <div className="p-1.5 rounded-lg bg-orange-50 text-[#FF6B00]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#FF6B00]">{myZoneData.throughputPercentage}%</div>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ 4.2% vs baseline</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">On-Time Punctuality</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">{myZoneData.onTimePercentage}%</div>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Target: &gt;70%</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Average Delay</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{myZoneData.averageDelayMinutes} min</div>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">↓ 2.8 min delay saved</p>
            </div>

          </div>

          {/* Interactive Schematic Track Corridor for My Zone */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  <span>{myZoneData.name} — Main Trunk Corridor Schematic</span>
                </h3>
                <p className="text-xs text-slate-400">Delhi – Tundla – Kanpur – Prayagraj Quad-Track Block Layout</p>
              </div>
              <button
                onClick={() => navigate('/network-map')}
                className="text-xs text-[#0878F9] font-bold hover:underline"
              >
                Full GIS Map →
              </button>
            </div>

            <SchematicNetworkMap />
          </div>

          {/* Divisional Throughput Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#063B7A]" />
                <span>{myZoneData.name} — Operating Divisions Registry</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">5 Operating Divisions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    <th className="py-2.5 px-3">Division Name</th>
                    <th className="py-2.5 px-3">Divisional HQ</th>
                    <th className="py-2.5 px-3 text-center">Active Trains</th>
                    <th className="py-2.5 px-3 text-center">Throughput</th>
                    <th className="py-2.5 px-3 text-center">Punctuality</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {divisions.map((div, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">{div.name}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{div.hq}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#063B7A]">{div.activeTrains}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#FF6B00]">{div.throughput}%</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">{div.punctuality}%</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {div.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* ================= ALL 17 ZONES DIRECTORY ================= */
        <div className="space-y-5">
          
          {/* Interactive India Map */}
          <IndiaZoneMap 
            onSelectZone={(z: RailwayZone) => setSelectedZoneObj(z)} 
            selectedZoneCode={selectedZoneObj?.code}
          />

          {/* Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-soft flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search zones by name, code, or headquarters..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredZones.length} Zones
            </span>
          </div>

          {/* Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map((zone: RailwayZone) => (
              <div
                key={zone.id}
                onClick={() => setSelectedZoneObj(zone)}
                className={`bg-white rounded-2xl border p-5 shadow-soft hover:shadow-md transition cursor-pointer flex flex-col justify-between ${
                  selectedZoneObj?.id === zone.id ? 'border-[#FF6B00] ring-2 ring-orange-200' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-black font-mono text-[#063B7A] bg-blue-50 px-2 py-0.5 rounded-md">
                        {zone.code}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                        {zone.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        HQ: {zone.headquarters}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {zone.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-[#F5F8FC] p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Active Trains</span>
                      <span className="text-sm font-black text-slate-800">{zone.activeTrains}</span>
                    </div>
                    <div className="bg-[#F5F8FC] p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Throughput</span>
                      <span className="text-sm font-black text-[#FF6B00]">{zone.throughputPercentage}%</span>
                    </div>
                    <div className="bg-[#F5F8FC] p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Punctuality</span>
                      <span className="text-sm font-black text-emerald-600">{zone.onTimePercentage}%</span>
                    </div>
                    <div className="bg-[#F5F8FC] p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Avg Delay</span>
                      <span className="text-sm font-black text-amber-600">{zone.averageDelayMinutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">{zone.alertsCount} Alerts Active</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(user?.role === 'ADMIN' ? '/admin/trains' : '/operator/trains');
                    }}
                    className="text-[#0878F9] font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>View Trains</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
