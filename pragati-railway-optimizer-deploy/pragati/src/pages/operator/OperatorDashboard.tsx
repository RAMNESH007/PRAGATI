import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRailway } from '../../context/RailwayContext';
import { SchematicNetworkMap } from '../../components/network/SchematicNetworkMap';
import { ReviewModal } from '../../components/recommendations/ReviewModal';
import { AIRecommendation, Train } from '../../types';
import { 
  Train as TrainIcon, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  Radio, 
  ShieldAlert, 
  Bell, 
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const OperatorDashboard: React.FC = () => {
  const { user, selectedZone } = useAuth();
  const { trains, recommendations, alerts, executeManualHold, executeManualRelease, triggerEmergencyCorridorBlock } = useRailway();
  
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTrainNumber, setOverrideTrainNumber] = useState('12951');
  const [overrideAction, setOverrideAction] = useState<'HOLD' | 'RELEASE'>('HOLD');
  const [overrideDuration, setOverrideDuration] = useState(5);
  const [overrideReason, setOverrideReason] = useState('Local track clearance buffer');

  const navigate = useNavigate();

  // Zone scoped data
  const zoneName = selectedZone || user?.assignedZone || 'Northern Railway';
  const zoneTrains = trains.filter(t => t.zone === zoneName || t.zone === 'Northern Railway');
  const zoneRecs = recommendations.filter(r => r.zone === zoneName || r.zone === 'Northern Railway');
  const zoneAlerts = alerts.filter(a => !a.isResolved && (a.zone === zoneName || a.zone === 'Northern Railway' || a.zone === 'Eastern Railway'));

  // KPI Calculations
  const activeTrainsCount = 312;
  const onTimePercentage = 72;
  const avgDelayMinutes = 18.3;
  const sectionThroughput = 89.7;

  const handleQuickOverrideConfirm = () => {
    if (overrideAction === 'HOLD') {
      executeManualHold(overrideTrainNumber, overrideDuration, overrideReason);
    } else {
      executeManualRelease(overrideTrainNumber, overrideReason);
    }
    setShowOverrideModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Bar matching bottom-right view in reference image */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Operator Dashboard
            </h1>
            <span className="bg-[#063B7A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              Zone: {zoneName}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Zone-wise operations & real-time traffic decision support
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/manual-control')}
            className="bg-[#063B7A] hover:bg-[#052B5F] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Manual Dispatch Console</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards matching reference image layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Active Trains in My Zone */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Trains</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#0878F9]">
              <TrainIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{activeTrainsCount}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">In My Zone</p>
        </div>

        {/* On Time Trains */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">On Time Trains</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{onTimePercentage}%</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> ↑ 6% vs yesterday
          </p>
        </div>

        {/* Avg Delay */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Delay</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{avgDelayMinutes} min</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center">
            <TrendingDown className="w-3 h-3 mr-0.5 inline" /> ↓ 2.4 min vs yesterday
          </p>
        </div>

        {/* Section Throughput */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Section Throughput</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-[#FF6B00]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#FF6B00]">{sectionThroughput}%</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> ↑ 4.8% vs yesterday
          </p>
        </div>

      </div>

      {/* Row 2: AI Recommendations Table (Left 6 Cols) + My Zone Live Map (Right 6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* AI Recommendations — My Zone Table (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>AI Recommendations — My Zone</span>
              </h3>
              <span className="text-[10px] bg-orange-100 text-[#F45100] px-2 py-0.5 rounded-full font-extrabold uppercase">
                Human Review Required
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-2.5">Train No.</th>
                    <th className="py-2 px-2.5">From – To</th>
                    <th className="py-2 px-2.5">Recommendation</th>
                    <th className="py-2 px-2 text-center">Priority</th>
                    <th className="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {zoneRecs.slice(0, 5).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-2.5">
                        <span className="font-extrabold font-mono text-[#063B7A] block">{rec.trainNumber}</span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[90px]">{rec.trainName}</span>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-600 font-medium">
                        <span className="block truncate max-w-[110px]">{rec.from}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">→ {rec.to}</span>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className="font-bold text-slate-800 block text-xs">{rec.recommendation}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Conf: {rec.confidenceScore}%</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        {rec.status === 'PENDING' ? (
                          <button
                            onClick={() => setSelectedRec(rec)}
                            className="px-3 py-1 bg-[#0878F9] hover:bg-blue-600 text-white rounded-lg font-bold text-xs shadow-sm transition inline-flex items-center space-x-1"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                            rec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            rec.status === 'MODIFIED' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {rec.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">AI recommendations update in real-time</span>
            <Link to="/ai-recommendations" className="text-[#FF6B00] font-bold hover:underline">
              View All Recommendations →
            </Link>
          </div>
        </div>

        {/* My Zone Live Map (6 Cols) */}
        <div className="lg:col-span-6">
          <SchematicNetworkMap />
        </div>

      </div>

      {/* Row 3: Recent Alerts & Quick Action Buttons matching reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recent Alerts (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Recent Alerts</span>
            </h3>
            <Link to="/alerts" className="text-xs text-[#0878F9] font-bold hover:underline">
              View All Alerts →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {zoneAlerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50/60 border-red-200 text-red-900' :
                  alert.severity === 'WARNING' ? 'bg-amber-50/60 border-amber-200 text-amber-900' :
                  'bg-blue-50/60 border-blue-200 text-blue-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      alert.severity === 'WARNING' ? 'bg-amber-500 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold mt-1 line-clamp-1">{alert.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{alert.section}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#063B7A]" />
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setOverrideAction('HOLD');
                  setShowOverrideModal(true);
                }}
                className="p-3 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200 rounded-xl text-left transition group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#FF6B00] block">
                  Add Manual Override
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Hold or release signal</span>
              </button>

              <button
                onClick={() => navigate('/operator/trains')}
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left transition group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#0878F9] block">
                  Update Train Status
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Platform & speed adjustment</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Initiate Emergency Section Lockdown confirmation?')) {
                    triggerEmergencyCorridorBlock('Kanpur Central – Tundla', 'Operator Quick Lockdown Trigger');
                  }
                }}
                className="p-3 bg-red-50 hover:bg-red-100 hover:border-red-300 border border-red-200 rounded-xl text-left transition text-red-800"
              >
                <span className="text-xs font-bold block">
                  Emergency Block
                </span>
                <span className="text-[10px] text-red-600 block mt-0.5">Halt section movement</span>
              </button>

              <button
                onClick={() => alert('Broadcast sent to Divisional Control Center (Northern Railway).')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">
                  Notify Control
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Divisional dispatch radio</span>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Operator ID: OP-102 (Northern Zone)</span>
            <span className="font-mono text-emerald-600 font-bold">● Network Sync Active</span>
          </div>
        </div>

      </div>

      {/* Review Modal */}
      {selectedRec && (
        <ReviewModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}

      {/* Manual Override Quick Dialog */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-slate-900">Add Manual Override</h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Train</label>
                <select
                  value={overrideTrainNumber}
                  onChange={(e) => setOverrideTrainNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                >
                  {zoneTrains.map(t => (
                    <option key={t.id} value={t.number}>{t.number} • {t.name} ({t.currentStation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideAction('HOLD')}
                    className={`py-2 rounded-lg font-bold ${overrideAction === 'HOLD' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Hold Train
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideAction('RELEASE')}
                    className={`py-2 rounded-lg font-bold ${overrideAction === 'RELEASE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Release Signal
                  </button>
                </div>
              </div>

              {overrideAction === 'HOLD' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hold Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={overrideDuration}
                    onChange={(e) => setOverrideDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Override</label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-800 text-[11px]">
                Note: This override will be recorded into the Northern Railway divisional audit trail.
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="flex-1 py-2 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickOverrideConfirm}
                className="flex-1 py-2 bg-[#FF6B00] hover:bg-[#F45100] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/30"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal for AI Recommendation */}
      {selectedRec && (
        <ReviewModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}

    </div>
  );
};
