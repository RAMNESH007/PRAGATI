import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { Train } from '../types';
import { 
  Train as TrainIcon, 
  Search, 
  MapPin, 
  ArrowRight, 
  X
} from 'lucide-react';

export const TrainsPage: React.FC = () => {
  const { trains, executeManualHold, executeManualRelease, executePlatformChange } = useRailway();
  const { user, selectedZone } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const isOperator = user?.role === 'OPERATOR';
  const displayedZone = selectedZone || user?.assignedZone || 'Northern Railway';

  const filteredTrains = trains.filter((train: Train) => {
    if (isOperator && train.zone !== displayedZone && train.zone !== 'Northern Railway') {
      return false;
    }

    const matchesSearch = 
      train.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.currentStation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || train.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || train.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Train Traffic Management
            </h1>
            {isOperator && (
              <span className="bg-[#063B7A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {displayedZone}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time telemetry, track occupancy, speed limits & timetable adherence
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-soft">
            Tracking <strong>{filteredTrains.length}</strong> active rakes
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-soft flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by train no, name, station, origin..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { label: 'All Status', value: 'ALL' },
            { label: 'On Time', value: 'ON_TIME' },
            { label: 'Delayed', value: 'DELAYED' },
            { label: 'Hold', value: 'HOLD' },
            { label: 'Maintenance', value: 'MAINTENANCE' }
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === st.value
                  ? 'bg-[#063B7A] text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Train Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="ALL">All Train Types</option>
          <option value="VANDE_BHARAT">Vande Bharat Express</option>
          <option value="RAJDHANI">Rajdhani Express</option>
          <option value="SHATABDI">Shatabdi Express</option>
          <option value="SUPERFAST">Superfast Express</option>
          <option value="MAIL_EXPRESS">Mail / Express</option>
          <option value="FREIGHT">Freight / Goods</option>
        </select>

      </div>

      {/* Main Trains Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <th className="py-3 px-3">Train Number & Name</th>
                <th className="py-3 px-3">Route (Origin → Destination)</th>
                <th className="py-3 px-3">Current Section</th>
                <th className="py-3 px-2 text-center">Speed</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-2 text-center">Delay</th>
                <th className="py-3 px-2 text-center">Platform / Track</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrains.map((train: Train) => (
                <tr key={train.id} className="hover:bg-slate-50/80 transition">
                  {/* Train Identity */}
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl text-white ${
                        train.type === 'VANDE_BHARAT' ? 'bg-[#FF6B00]' :
                        train.type === 'RAJDHANI' ? 'bg-[#063B7A]' :
                        train.type === 'FREIGHT' ? 'bg-amber-600' :
                        'bg-blue-600'
                      }`}>
                        <TrainIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold font-mono text-slate-900 block text-xs">
                          {train.number}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[140px] block">
                          {train.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-3 px-3 text-slate-600">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <span className="truncate max-w-[120px]">{train.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">{train.destination}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      ETA: {train.eta}
                    </span>
                  </td>

                  {/* Current Section & Progress */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#FF6B00]" />
                      <span>{train.currentStation}</span>
                    </div>
                    <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-[#FF6B00] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${train.routeProgress}%` }}
                      />
                    </div>
                  </td>

                  {/* Speed */}
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">
                    {train.speedKmH} <span className="text-[10px] text-slate-400 font-sans">km/h</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      train.status === 'ON_TIME' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      train.status === 'DELAYED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      train.status === 'HOLD' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {train.status}
                    </span>
                  </td>

                  {/* Delay */}
                  <td className="py-3 px-2 text-center font-mono font-bold">
                    {train.delayMinutes === 0 ? (
                      <span className="text-emerald-600 font-bold">0 min</span>
                    ) : (
                      <span className="text-amber-600">+{train.delayMinutes} min</span>
                    )}
                  </td>

                  {/* Platform & Track */}
                  <td className="py-3 px-2 text-center">
                    <span className="font-bold text-slate-800 block">PF {train.platform}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{train.trackId}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedTrain(train)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#063B7A] hover:text-white text-slate-700 rounded-xl font-bold text-xs transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train Detail Drawer / Inspection Modal */}
      {selectedTrain && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#063B7A] text-white">
                  <TrainIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {selectedTrain.number} • {selectedTrain.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{selectedTrain.type}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTrain(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Location</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedTrain.currentStation}</span>
                <span className="text-[10px] text-slate-500">Next: {selectedTrain.nextStation}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Telemetry</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedTrain.speedKmH} km/h</span>
                <span className="text-[10px] text-emerald-600 font-bold">GPS Verified</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Platform & Track</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">Platform {selectedTrain.platform}</span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedTrain.trackId}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Schedule Punctuality</span>
                <span className={`font-bold text-sm mt-0.5 block ${selectedTrain.delayMinutes === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedTrain.delayMinutes === 0 ? 'On Time' : `+${selectedTrain.delayMinutes} min delay`}
                </span>
                <span className="text-[10px] text-slate-500">ETA: {selectedTrain.eta}</span>
              </div>
            </div>

            {/* Quick Dispatch Action Buttons */}
            <div className="border-t pt-3 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Manual Dispatch Controls:</span>
              <div className="grid grid-cols-2 gap-2">
                {selectedTrain.status === 'HOLD' ? (
                  <button
                    onClick={() => {
                      executeManualRelease(selectedTrain.number, 'Signal cleared by operator');
                      setSelectedTrain(null);
                    }}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition"
                  >
                    Release Signal (Green)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      executeManualHold(selectedTrain.number, 5, 'Manual hold applied from train inspector');
                      setSelectedTrain(null);
                    }}
                    className="py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition"
                  >
                    Hold Train (5 min)
                  </button>
                )}

                <button
                  onClick={() => {
                    const newPf = prompt('Enter new platform number:', String(selectedTrain.platform));
                    if (newPf) {
                      executePlatformChange(selectedTrain.number, selectedTrain.currentStation, newPf, 'Platform adjustment from inspector');
                      setSelectedTrain(null);
                    }
                  }}
                  className="py-2 bg-[#063B7A] hover:bg-[#052B5F] text-white rounded-xl font-bold transition"
                >
                  Change Platform
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
