import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Bell, 
  Radio, 
  Database, 
  CheckCircle2, 
  Sliders, 
  Lock
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const [headwayMargin, setHeadwayMargin] = useState(3.0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [refreshInterval, setRefreshInterval] = useState(3);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [rdsoComplianceMode, setRdsoComplianceMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              System Settings & AI Optimization Tuning
            </h1>
            <span className="bg-[#FF6B00] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              RDSO Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure safety headway margins, constraint solver weights, telemetry intervals & audio dispatch rules
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Parameters Successfully Synced to Controller Engine</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
        
        {/* Section 1: AI & Optimization Engine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase">
            <Cpu className="w-4 h-4 text-[#0878F9]" />
            <span>AI Optimization & Constraint Solver</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800">
                Minimum Safety Headway Margin: <span className="font-mono text-[#FF6B00]">{headwayMargin} min</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Minimum temporal buffer enforced between consecutive train arrivals across automatic block signals.
              </p>
              <input
                type="range"
                min="2.0"
                max="6.0"
                step="0.5"
                value={headwayMargin}
                onChange={(e) => setHeadwayMargin(Number(e.target.value))}
                className="w-full accent-[#FF6B00]"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800">
                Recommendation Confidence Cutoff: <span className="font-mono text-emerald-600">{confidenceThreshold}%</span>
              </label>
              <p className="text-[11px] text-slate-500">
                AI recommendations below this confidence score will be held for divisional engineering review.
              </p>
              <input
                type="range"
                min="70"
                max="98"
                step="1"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Telemetry & Safety Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase">
            <ShieldCheck className="w-4 h-4 text-[#063B7A]" />
            <span>Telemetry & Safety Compliance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">RDSO Safety Protocol Mode</span>
                <span className="text-[10px] text-slate-500">Strict Indian Railways safety norms</span>
              </div>
              <input
                type="checkbox"
                checked={rdsoComplianceMode}
                onChange={(e) => setRdsoComplianceMode(e.target.checked)}
                className="w-5 h-5 accent-[#063B7A] rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Audible Emergency Alarms</span>
                <span className="text-[10px] text-slate-500">Play alert tones on critical warnings</span>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#FF6B00] rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Telemetry Polling Interval</span>
                <span className="text-[10px] text-slate-500">Currently: {refreshInterval}s live sync</span>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
              >
                <option value={2}>2 Seconds</option>
                <option value={3}>3.5 Seconds (Default)</option>
                <option value={5}>5 Seconds</option>
              </select>
            </div>

          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#063B7A] hover:bg-[#052B5F] text-white rounded-xl font-bold shadow-md shadow-blue-900/20 transition text-xs"
          >
            Save & Deploy System Configuration
          </button>
        </div>

      </form>

    </div>
  );
};
