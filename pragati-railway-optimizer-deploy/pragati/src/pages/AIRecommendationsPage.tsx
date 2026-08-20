import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from '../components/recommendations/ReviewModal';
import { AIRecommendation } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

export const AIRecommendationsPage: React.FC = () => {
  const { recommendations } = useRailway();
  const { user, selectedZone } = useAuth();

  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [headwayBuffer, setHeadwayBuffer] = useState<number>(3); // minutes
  const [throughputWeight, setThroughputWeight] = useState<number>(85); // percent

  const isOperator = user?.role === 'OPERATOR';
  const displayedZone = selectedZone || user?.assignedZone || 'Northern Railway';

  const filteredRecs = recommendations.filter((rec: AIRecommendation) => {
    if (isOperator && rec.zone !== displayedZone && rec.zone !== 'Northern Railway') {
      return false;
    }
    if (statusFilter === 'ALL') return true;
    return rec.status === statusFilter;
  });

  const pendingCount = recommendations.filter(r => r.status === 'PENDING').length;
  const approvedCount = recommendations.filter(r => r.status === 'APPROVED').length;
  const modifiedCount = recommendations.filter(r => r.status === 'MODIFIED').length;
  const rejectedCount = recommendations.filter(r => r.status === 'REJECTED').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              AI Decision & Optimization Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Predictive train scheduling, conflict resolution & throughput maximization recommendations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Human-In-The-Loop Active</span>
          </div>
        </div>
      </div>

      {/* Optimization Engine Rule Parameters Bar */}
      <div className="bg-gradient-to-r from-[#063B7A] to-[#052B5F] text-white rounded-2xl p-4 sm:p-5 shadow-elevated">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold">OR-Tools Optimization Parameters</h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Active constraint solver balances headway safety buffers with section line throughput maximization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15">
              <label className="text-[10px] text-slate-300 block font-medium">Headway Buffer</label>
              <div className="flex items-center space-x-2 mt-0.5">
                <input 
                  type="range" 
                  min="2" 
                  max="6" 
                  value={headwayBuffer} 
                  onChange={(e) => setHeadwayBuffer(Number(e.target.value))}
                  className="w-20 accent-orange-400"
                />
                <span className="font-mono font-bold text-orange-300">{headwayBuffer}m</span>
              </div>
            </div>

            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15">
              <label className="text-[10px] text-slate-300 block font-medium">Throughput Priority Weight</label>
              <div className="flex items-center space-x-2 mt-0.5">
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={throughputWeight} 
                  onChange={(e) => setThroughputWeight(Number(e.target.value))}
                  className="w-20 accent-emerald-400"
                />
                <span className="font-mono font-bold text-emerald-300">{throughputWeight}%</span>
              </div>
            </div>

            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15 text-center">
              <span className="text-[10px] text-slate-300 block font-medium">AI Model State</span>
              <span className="font-bold text-emerald-400">● 15m Continuous Cycle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-semibold">
          {[
            { label: `Pending Review (${pendingCount})`, value: 'PENDING' },
            { label: `Approved (${approvedCount})`, value: 'APPROVED' },
            { label: `Modified (${modifiedCount})`, value: 'MODIFIED' },
            { label: `Rejected (${rejectedCount})`, value: 'REJECTED' },
            { label: `All (${recommendations.length})`, value: 'ALL' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === tab.value
                  ? 'bg-[#063B7A] text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Showing {filteredRecs.length} recommendations
        </span>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec: AIRecommendation) => (
          <div 
            key={rec.id} 
            className="bg-white rounded-2xl border border-slate-200 shadow-soft hover:shadow-md transition p-4 sm:p-5 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {rec.trainNumber} • {rec.trainName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {rec.from} → {rec.to} | Location: <span className="font-bold text-slate-700">{rec.currentLocation}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{rec.timestamp}</span>
                </div>
              </div>

              {/* Proposed Action Box */}
              <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-3.5 mb-3">
                <span className="text-[10px] font-extrabold text-[#F45100] uppercase tracking-wider block">
                  AI Recommendation
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {rec.recommendation}
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              {/* KPI Impact Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                  <span className="text-[9px] text-emerald-700 block font-bold uppercase">Delay Reduction</span>
                  <span className="font-extrabold text-emerald-900">-{rec.expectedDelayReductionMinutes}m</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl">
                  <span className="text-[9px] text-blue-700 block font-bold uppercase">Throughput Gain</span>
                  <span className="font-extrabold text-blue-900">+{rec.expectedThroughputImprovementPercent}%</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-2 rounded-xl">
                  <span className="text-[9px] text-purple-700 block font-bold uppercase">Confidence</span>
                  <span className="font-extrabold text-purple-900">{rec.confidenceScore}%</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                rec.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                rec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                rec.status === 'MODIFIED' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                ● {rec.status}
              </span>

              <button
                onClick={() => setSelectedRec(rec)}
                className="px-4 py-1.5 bg-[#0878F9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
              >
                <span>{rec.status === 'PENDING' ? 'Review & Decide' : 'Inspect Audit Details'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedRec && (
        <ReviewModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}

    </div>
  );
};
