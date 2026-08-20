import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sliders, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Gauge
} from 'lucide-react';
import { Train } from '../types';

export const ManualControlPage: React.FC = () => {
  const { 
    trains, 
    executeManualHold, 
    executeManualRelease, 
    executePlatformChange, 
    executeSpeedRestriction, 
    triggerEmergencyCorridorBlock,
    emergencyMode
  } = useRailway();
  const { user } = useAuth();

  // Form states
  const [targetTrain, setTargetTrain] = useState('12951');
  const [holdDuration, setHoldDuration] = useState(5);
  const [holdReason, setHoldReason] = useState('Downstream block safety spacing buffer');

  const [platformTrain, setPlatformTrain] = useState('18102');
  const [newPlatform, setNewPlatform] = useState('5');
  const [platformReason, setPlatformReason] = useState('Platform 3 occupied by delayed rake');

  const [speedTrain, setSpeedTrain] = useState('CONT-90421');
  const [speedLimit, setSpeedLimit] = useState(30);
  const [speedSection, setSpeedSection] = useState('Kanpur Central – Tundla');
  const [speedReason, setSpeedReason] = useState('Track maintenance warning / caution order');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    actionType: string;
    details: string;
    reason: string;
    onConfirm: () => void;
  } | null>(null);

  const handleHoldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: 'CONFIRM MANUAL SIGNAL HOLD',
      actionType: 'Hold Train',
      details: `Hold Train ${targetTrain} for ${holdDuration} minutes`,
      reason: holdReason,
      onConfirm: () => {
        executeManualHold(targetTrain, holdDuration, holdReason);
        setConfirmModal(null);
      }
    });
  };

  const handleReleaseSubmit = (trainNo: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'CONFIRM SIGNAL RELEASE (GREEN)',
      actionType: 'Clear Signal',
      details: `Release Train ${trainNo} for immediate transit`,
      reason: 'Manual clearance authorized by operator',
      onConfirm: () => {
        executeManualRelease(trainNo, 'Manual clearance authorized by operator');
        setConfirmModal(null);
      }
    });
  };

  const handlePlatformSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: 'CONFIRM PLATFORM REASSIGNMENT',
      actionType: 'Platform Change',
      details: `Reassign Train ${platformTrain} to Platform ${newPlatform}`,
      reason: platformReason,
      onConfirm: () => {
        executePlatformChange(platformTrain, 'Current Station', newPlatform, platformReason);
        setConfirmModal(null);
      }
    });
  };

  const handleSpeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: 'CONFIRM CAUTION ORDER / SPEED RESTRICTION',
      actionType: 'Speed Restriction',
      details: `Impose ${speedLimit} km/h limit on Train ${speedTrain} in ${speedSection}`,
      reason: speedReason,
      onConfirm: () => {
        executeSpeedRestriction(speedTrain, speedLimit, speedSection, speedReason);
        setConfirmModal(null);
      }
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manual Control & Dispatch Console
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Direct manual railway traffic intervention, signal overrides & emergency management
          </p>
        </div>

        {/* Emergency Mode Status */}
        <div className="flex items-center space-x-2">
          {emergencyMode ? (
            <div className="bg-red-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold animate-pulse flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>EMERGENCY PROTOCOL ACTIVE</span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (confirm('Trigger Emergency Corridor Lockdown? All signals on designated block will turn RED.')) {
                  triggerEmergencyCorridorBlock('Kanpur Central – Tundla', 'Manual Emergency Console Activation');
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency Lockdown Trigger</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-blue-900">
        <ShieldAlert className="w-5 h-5 text-[#063B7A] flex-shrink-0" />
        <div className="leading-relaxed">
          <strong>Operational Safety Guideline:</strong> All manual overrides bypass automated AI schedule proposals and are recorded with operator credentials in the immutable audit trail.
        </div>
      </div>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Panel 1: Hold / Release Train */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm uppercase mb-3">
              <Clock className="w-4 h-4 text-[#FF6B00]" />
              <span>Manual Signal Hold / Release</span>
            </div>

            <form onSubmit={handleHoldSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Train</label>
                <select
                  value={targetTrain}
                  onChange={(e) => setTargetTrain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  {trains.map((t: Train) => (
                    <option key={t.id} value={t.number}>{t.number} • {t.name} ({t.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hold Duration (Minutes)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={holdDuration}
                    onChange={(e) => setHoldDuration(Number(e.target.value))}
                    className="flex-1 accent-[#FF6B00]"
                  />
                  <span className="font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg border text-xs">
                    {holdDuration} min
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Hold</label>
                <input
                  type="text"
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Apply Signal Hold
                </button>
                <button
                  type="button"
                  onClick={() => handleReleaseSubmit(targetTrain)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Release Signal
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panel 2: Platform Reallocation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm uppercase mb-3">
              <Sliders className="w-4 h-4 text-[#0878F9]" />
              <span>Platform Reallocation</span>
            </div>

            <form onSubmit={handlePlatformSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Train</label>
                <select
                  value={platformTrain}
                  onChange={(e) => setPlatformTrain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  {trains.map((t: Train) => (
                    <option key={t.id} value={t.number}>{t.number} • {t.name} (Cur PF: {t.platform})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign New Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(pf => (
                    <option key={pf} value={pf}>Platform {pf}</option>
                  ))}
                  <option value="Loop 1">Loop Line 1</option>
                  <option value="Loop 2">Loop Line 2</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Switch</label>
                <input
                  type="text"
                  value={platformReason}
                  onChange={(e) => setPlatformReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#063B7A] hover:bg-[#052B5F] text-white rounded-xl font-bold transition shadow-sm"
                >
                  Confirm Platform Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panel 3: Speed Restriction / Caution Order */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm uppercase mb-3">
              <Gauge className="w-4 h-4 text-purple-600" />
              <span>Impose Caution Order (Speed Limit)</span>
            </div>

            <form onSubmit={handleSpeedSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Train</label>
                <select
                  value={speedTrain}
                  onChange={(e) => setSpeedTrain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  {trains.map((t: Train) => (
                    <option key={t.id} value={t.number}>{t.number} • {t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caution Speed Limit</label>
                <select
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  <option value={15}>15 km/h (Dead Slow / Track Repair)</option>
                  <option value={30}>30 km/h (Caution Order)</option>
                  <option value={50}>50 km/h (Fog / Weather Limit)</option>
                  <option value={75}>75 km/h (Loop Diversion Limit)</option>
                  <option value={110}>110 km/h (Normal Express Limit)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Restricted Section</label>
                <input
                  type="text"
                  value={speedSection}
                  onChange={(e) => setSpeedSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Dispatch Caution Order
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Confirmation Modal matching requirement 21 */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-slate-900 border-b pb-3">
              <ShieldAlert className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="font-black text-base">{confirmModal.title}</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F5F8FC] p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Action</span>
                <p className="font-extrabold text-slate-900 text-sm">{confirmModal.details}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Engineering Justification</span>
                <p className="text-slate-700 font-medium mt-0.5">{confirmModal.reason}</p>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-800 text-[11px]">
                This action will be recorded in the operational audit log under operator ID <strong>{user?.name}</strong>.
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 bg-[#FF6B00] hover:bg-[#F45100] text-white rounded-xl font-bold transition text-xs shadow-md shadow-orange-600/30"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
