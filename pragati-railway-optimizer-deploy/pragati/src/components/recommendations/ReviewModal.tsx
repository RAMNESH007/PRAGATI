import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AIRecommendation, TrainPriority } from '../../types';
import { useRailway } from '../../context/RailwayContext';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  X, 
  ArrowRight
} from 'lucide-react';

interface ReviewModalProps {
  recommendation: AIRecommendation | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ recommendation, onClose }) => {
  const { trains, approveRecommendation, rejectRecommendation, modifyRecommendation } = useRailway();

  const [mode, setMode] = useState<'VIEW' | 'REJECT_CONFIRM' | 'MODIFY'>('VIEW');
  const [rejectReason, setRejectReason] = useState('Manual timetable preference based on ground signal controller report');
  
  // Modification Form State with safe defaults
  const [holdDuration, setHoldDuration] = useState<number>(
    recommendation?.actionDetails?.holdDurationMinutes || 5
  );
  const [assignedPlatform, setAssignedPlatform] = useState<string | number>(
    recommendation?.actionDetails?.assignedPlatform || 1
  );
  const [alternateRoute, setAlternateRoute] = useState<string>(
    recommendation?.actionDetails?.alternateRoute || 'Main Up Fast Track'
  );
  const [speedRestriction, setSpeedRestriction] = useState<number>(
    recommendation?.actionDetails?.speedRestriction || 110
  );
  const [revisedPriority, setRevisedPriority] = useState<TrainPriority>(
    recommendation?.priority || 'HIGH'
  );
  const [modNotes, setModNotes] = useState<string>(
    'Adjusted parameters following line clearance verification'
  );

  if (!recommendation) return null;

  // Real train lookup fallback
  const matchingTrain = trains.find(t => t.number === recommendation.trainNumber || t.id.includes(recommendation.trainNumber));

  const delayReduction = recommendation.expectedDelayReductionMinutes || (recommendation as any).impactMinutesSaved || 8;
  const throughputGain = recommendation.expectedThroughputImprovementPercent || (recommendation as any).throughputGain || 11;
  const fromStation = recommendation.from || matchingTrain?.origin || 'Mumbai Central (MMCT)';
  const toStation = recommendation.to || recommendation.destination || matchingTrain?.destination || 'New Delhi (NDLS)';
  const location = recommendation.currentLocation || matchingTrain?.currentStation || (recommendation as any).section || 'Kanpur Central (CNB)';
  const trainName = recommendation.trainName || matchingTrain?.name || 'Express';

  const handleApprove = () => {
    approveRecommendation(recommendation.id);
    onClose();
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    rejectRecommendation(recommendation.id, rejectReason);
    onClose();
  };

  const handleConfirmModify = () => {
    modifyRecommendation(recommendation.id, {
      holdDurationMinutes: holdDuration,
      assignedPlatform,
      alternateRoute,
      speedRestriction,
      revisedPriority,
      notes: modNotes
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Clean Modern Header (No heavy blue) */}
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-orange-100 text-[#FF6B00] p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                Review AI Recommendation
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Train #{recommendation.trainNumber} • {location}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Compact) */}
        <div className="p-4 space-y-3 text-xs">
          
          {/* Train Identity Strip */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="font-extrabold text-slate-900 text-xs truncate">
                {recommendation.trainNumber} • {trainName}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center">
                <span>{fromStation}</span>
                <ArrowRight className="inline w-3 h-3 text-slate-400 mx-1 flex-shrink-0" />
                <span>{toStation}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md block">
                {recommendation.confidenceScore}% Conf
              </span>
            </div>
          </div>

          {mode === 'VIEW' && (
            <>
              {/* Proposed Decision Action */}
              <div className="border border-orange-200 bg-orange-50/60 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#F45100] uppercase tracking-wider">
                    Proposed Decision
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                    recommendation.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {recommendation.priority} Priority
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  {recommendation.recommendation}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium pt-0.5">
                  {recommendation.reason}
                </p>
              </div>

              {/* Compact KPI Impact Badges */}
              <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <span className="text-[10px] text-emerald-700 font-bold block">Delay Reduction</span>
                  <span className="text-xs font-black text-emerald-900">-{delayReduction} min saved</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <span className="text-[10px] text-blue-700 font-bold block">Throughput Gain</span>
                  <span className="text-xs font-black text-blue-900">+{throughputGain}% efficiency</span>
                </div>
              </div>
            </>
          )}

          {/* REJECT CONFIRMATION MODE */}
          {mode === 'REJECT_CONFIRM' && (
            <div className="space-y-2.5 py-1">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-900 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Reject AI Recommendation</span>
                </div>
                <p className="text-[11px] text-red-700">
                  Maintains Train {recommendation.trainNumber} on nominal physical timetable.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Rejection Reason / Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Enter reason..."
                />
              </div>
            </div>
          )}

          {/* MODIFY PARAMETERS MODE */}
          {mode === 'MODIFY' && (
            <div className="space-y-2.5 py-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Hold Duration (mins)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={holdDuration}
                    onChange={(e) => setHoldDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Platform Reassignment</label>
                  <input
                    type="text"
                    value={assignedPlatform}
                    onChange={(e) => setAssignedPlatform(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Speed Restriction (km/h)</label>
                <input
                  type="number"
                  value={speedRestriction}
                  onChange={(e) => setSpeedRestriction(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Revision Notes</label>
                <input
                  type="text"
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>
            </div>
          )}

        </div>

        {/* Compact Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-2">
          {mode === 'VIEW' ? (
            <>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setMode('REJECT_CONFIRM')}
                  className="px-2.5 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-xs transition cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => setMode('MODIFY')}
                  className="px-2.5 py-1.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition cursor-pointer"
                >
                  Modify
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center space-x-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Dispatch</span>
                </button>
              </div>
            </>
          ) : mode === 'REJECT_CONFIRM' ? (
            <>
              <button
                onClick={() => setMode('VIEW')}
                className="px-3 py-1.5 text-slate-600 font-semibold text-xs hover:text-slate-900 cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center space-x-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode('VIEW')}
                className="px-3 py-1.5 text-slate-600 font-semibold text-xs hover:text-slate-900 cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirmModify}
                className="px-4 py-1.5 bg-[#0878F9] hover:bg-blue-600 text-white rounded-lg font-bold text-xs shadow transition flex items-center space-x-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Custom Dispatch</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
