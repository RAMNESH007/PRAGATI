import React from 'react';
import { useRailway } from '../../context/RailwayContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useRailway();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start space-x-3 p-3 rounded-xl shadow-2xl border transition-all animate-in slide-in-from-right duration-300 ${
            toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/50 backdrop-blur-md' :
            toast.type === 'warning' ? 'bg-amber-950/90 text-amber-100 border-amber-500/50 backdrop-blur-md' :
            toast.type === 'error' ? 'bg-red-950/90 text-red-100 border-red-500/50 backdrop-blur-md' :
            'bg-slate-900/90 text-slate-100 border-slate-700 backdrop-blur-md'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white leading-tight">{toast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            <span className="text-[9px] text-slate-400 font-mono mt-1 block">{toast.timestamp}</span>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
