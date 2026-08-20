import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { AlertSeverity, AlertCategory, RailwayAlert } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  MapPin, 
  Train as TrainIcon,
  Plus,
  Archive,
  BellRing
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, resolveAlert, addAlert } = useRailway();
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'RESOLVED' | 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ACTIVE');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSection, setNewSection] = useState('Kanpur Central – Tundla');
  const [newSeverity, setNewSeverity] = useState<AlertSeverity>('WARNING');
  const [newCategory, setNewCategory] = useState<AlertCategory>('SIGNAL_FAILURE');

  const activeAlertsCount = alerts.filter(a => !a.isResolved).length;
  const resolvedAlertsCount = alerts.filter(a => a.isResolved).length;

  const filteredAlerts = alerts.filter((a: RailwayAlert) => {
    if (filterTab === 'ACTIVE') return !a.isResolved;
    if (filterTab === 'RESOLVED') return a.isResolved;
    if (filterTab === 'ALL') return true;
    if (filterTab === 'CRITICAL') return a.severity === 'CRITICAL' && !a.isResolved;
    if (filterTab === 'WARNING') return a.severity === 'WARNING' && !a.isResolved;
    if (filterTab === 'INFO') return a.severity === 'INFO' && !a.isResolved;
    return true;
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addAlert({
      title: newTitle,
      message: newMessage,
      section: newSection,
      zone: 'Northern Railway',
      severity: newSeverity,
      category: newCategory,
      affectedTrains: ['12951', '12424'],
      recommendedAction: 'Apply caution speed restriction & check track circuits.'
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewMessage('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Operational Alerts & Signal Notifications
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time track warnings, temporary speed restrictions, signal faults & safety bulletins
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#063B7A] hover:bg-[#052B5F] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Bulletin</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { label: `Active Alerts (${activeAlertsCount})`, value: 'ACTIVE', icon: BellRing },
            { label: `Resolved (${resolvedAlertsCount})`, value: 'RESOLVED', icon: Archive },
            { label: 'All Bulletins', value: 'ALL' },
            { label: 'Critical Only', value: 'CRITICAL', color: 'text-red-600' },
            { label: 'Warnings', value: 'WARNING', color: 'text-amber-600' },
            { label: 'Information', value: 'INFO', color: 'text-blue-600' }
          ].map((f: any) => (
            <button
              key={f.value}
              onClick={() => setFilterTab(f.value)}
              className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
                filterTab === f.value
                  ? 'bg-[#063B7A] text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.icon && <f.icon className="w-3.5 h-3.5" />}
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-500 font-mono font-medium">
          Showing {filteredAlerts.length} Bulletins
        </span>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-soft">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Alerts in this Category</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All signals and block sections operating within normal RDSO safety parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert: RailwayAlert) => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl border transition shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.isResolved ? 'bg-slate-50 border-slate-200' :
                alert.severity === 'CRITICAL' ? 'bg-red-50/70 border-red-200' :
                alert.severity === 'WARNING' ? 'bg-amber-50/70 border-amber-200' :
                'bg-blue-50/70 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                <div className={`p-2.5 rounded-xl text-white mt-0.5 flex-shrink-0 ${
                  alert.isResolved ? 'bg-emerald-600' :
                  alert.severity === 'CRITICAL' ? 'bg-red-600' :
                  alert.severity === 'WARNING' ? 'bg-amber-500' :
                  'bg-blue-600'
                }`}>
                  {alert.isResolved ? <CheckCircle2 className="w-5 h-5" /> :
                   alert.severity === 'CRITICAL' ? <ShieldAlert className="w-5 h-5" /> :
                   alert.severity === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
                   <Info className="w-5 h-5" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alert.isResolved ? 'bg-emerald-100 text-emerald-800' :
                      alert.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' :
                      alert.severity === 'WARNING' ? 'bg-amber-200 text-amber-900' :
                      'bg-blue-200 text-blue-900'
                    }`}>
                      {alert.severity} • {alert.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{alert.timestamp}</span>
                    {alert.isResolved && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>RESOLVED & ARCHIVED</span>
                      </span>
                    )}
                  </div>

                  <h3 className={`font-extrabold text-sm sm:text-base ${alert.isResolved ? 'text-slate-700' : 'text-slate-900'}`}>
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {alert.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span className="font-bold text-slate-700">{alert.section}</span>
                    </span>
                    {alert.affectedTrains && alert.affectedTrains.length > 0 && (
                      <span className="flex items-center space-x-1">
                        <TrainIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Affected Rakes: <strong className="text-slate-800">{alert.affectedTrains.join(', ')}</strong></span>
                      </span>
                    )}
                  </div>

                  {alert.recommendedAction && (
                    <div className="mt-2 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-semibold">
                      <span className="text-[#FF6B00] font-bold">Recommended Mitigation: </span>
                      {alert.recommendedAction}
                    </div>
                  )}
                </div>
              </div>

              {/* Resolve button */}
              {!alert.isResolved ? (
                <div className="flex items-center space-x-2 md:flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl font-bold text-xs shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              ) : (
                <div className="text-right md:flex-shrink-0 self-end md:self-center">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl inline-flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resolved</span>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-slate-900">Dispatch Operational Bulletin</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bulletin Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Signal Aspect Flashing Amber: #S-42"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#063B7A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Section Location</label>
                <input
                  type="text"
                  required
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="e.g. Kanpur Outer (KM 1014/12)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#063B7A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as AlertSeverity)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#063B7A]"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AlertCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#063B7A]"
                  >
                    <option value="SIGNAL_FAILURE">Signal Failure</option>
                    <option value="CONGESTION">Congestion</option>
                    <option value="TRAIN_DELAY">Train Delay</option>
                    <option value="TRACK_MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Operational details and instructions..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#063B7A] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#063B7A] text-white rounded-xl font-bold hover:bg-[#052B5F] shadow"
                >
                  Dispatch Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
