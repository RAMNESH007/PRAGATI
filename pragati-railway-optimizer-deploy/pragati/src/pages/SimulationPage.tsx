import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { WhatIfScenario, Train } from '../types';
import { 
  FlaskConical, 
  Play, 
  Sparkles, 
  ShieldCheck,
  Zap
} from 'lucide-react';

export const SimulationPage: React.FC = () => {
  const { trains, whatIfScenario, runWhatIfSimulation } = useRailway();

  const [selectedTrain, setSelectedTrain] = useState('12951');
  const [injectedDelay, setInjectedDelay] = useState(15);
  const [trackBlock, setTrackBlock] = useState('None');
  const [currentScenario, setCurrentScenario] = useState<WhatIfScenario>(whatIfScenario);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setTimeout(() => {
      const res = runWhatIfSimulation(selectedTrain, injectedDelay, trackBlock);
      setCurrentScenario(res);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              What-If Traffic Simulator
            </h1>
            <span className="bg-purple-100 text-purple-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
              Sandbox Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Test hypothetical delay scenarios & maintenance blocks without affecting live operations
          </p>
        </div>

        {/* Clear Simulation Warning Pill matching requirement 35 */}
        <div className="bg-purple-50 border border-purple-200 text-purple-900 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center space-x-1.5 shadow-sm">
          <FlaskConical className="w-4 h-4 text-purple-600" />
          <span>SIMULATION — NO LIVE ACTION TAKEN</span>
        </div>
      </div>

      {/* Scenario Injection Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#FF6B00]" />
          <span>Configure Hypothetical Scenario</span>
        </h3>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Train</label>
            <select
              value={selectedTrain}
              onChange={(e) => setSelectedTrain(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {trains.map((t: Train) => (
                <option key={t.id} value={t.number}>{t.number} • {t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Inject Delay: <span className="font-mono text-[#FF6B00] font-black">{injectedDelay} Minutes</span>
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={injectedDelay}
              onChange={(e) => setInjectedDelay(Number(e.target.value))}
              className="w-full accent-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Track Maintenance Block</label>
            <select
              value={trackBlock}
              onChange={(e) => setTrackBlock(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
            >
              <option value="None">None (Clear Tracks)</option>
              <option value="Kanpur Down Loop Line #2">Kanpur Down Loop Line #2</option>
              <option value="Tundla Chord Junction Switch">Tundla Chord Junction Switch</option>
              <option value="Prayagraj Platform 3 Siding">Prayagraj Platform 3 Siding</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#F45100] hover:opacity-95 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/30 transition flex items-center justify-center space-x-2"
            >
              {isSimulating ? (
                <span>Solving Constraints...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run AI Optimization Simulation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Side-by-Side Comparison: Current Plan vs AI Optimized Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Baseline / Unoptimized Plan */}
        <div className="bg-red-50/50 border-2 border-red-200 rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-red-200 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-600">Without AI Support</span>
              <h3 className="text-base font-black text-slate-900">Baseline Cascading Plan</h3>
            </div>
            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
              Severe Bottleneck
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-red-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Cascading Delay</span>
              <span className="text-xl font-black text-red-600">{currentScenario.baseline.totalNetworkDelay} min</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-red-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Section Throughput</span>
              <span className="text-xl font-black text-red-600">{currentScenario.baseline.throughputPercentage}%</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-red-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Predicted Conflicts</span>
              <span className="text-xl font-black text-red-600">{currentScenario.baseline.conflictsPredicted} Blockages</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-red-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Affected Downstream Trains</span>
              <span className="text-xl font-black text-red-600">{currentScenario.baseline.cascadingDelaysCount} Trains</span>
            </div>
          </div>
        </div>

        {/* AI Optimized Plan */}
        <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600">PRAGATI Solution</span>
              <h3 className="text-base font-black text-slate-900">AI-Optimized Dynamic Plan</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Optimized Flow</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Cascading Delay</span>
              <span className="text-xl font-black text-emerald-600">{currentScenario.optimized.totalNetworkDelay} min</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                Save {currentScenario.baseline.totalNetworkDelay - currentScenario.optimized.totalNetworkDelay} min delay
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Section Throughput</span>
              <span className="text-xl font-black text-emerald-600">{currentScenario.optimized.throughputPercentage}%</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                +{(currentScenario.optimized.throughputPercentage - currentScenario.baseline.throughputPercentage).toFixed(1)}% recovery
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Avoided Conflicts</span>
              <span className="text-xl font-black text-emerald-600">{currentScenario.optimized.avoidedConflictsCount} Averted</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Zero collision risk</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Cascading Impact</span>
              <span className="text-xl font-black text-emerald-600">{currentScenario.optimized.cascadingDelaysCount} Trains</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Contained to single block</span>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated AI Decision Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#063B7A]" />
          <span>Simulated AI Mitigation Strategy:</span>
        </h4>
        <div className="space-y-2 text-xs">
          {currentScenario.aiRecommendations.map((rec: string, i: number) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-slate-800 font-medium">{rec}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
