import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { AuditLog } from '../types';
import { 
  Search, 
  Download,
  FileSpreadsheet,
  FileCode2
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useRailway();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log: AuditLog) => {
    const term = searchTerm.toLowerCase();
    return (
      log.operatorName.toLowerCase().includes(term) ||
      log.operatorId.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.decision.toLowerCase().includes(term) ||
      (log.trainNumber && log.trainNumber.toLowerCase().includes(term))
    );
  });

  const handleExportCSV = () => {
    const now = new Date();
    const headers = [
      'Log ID',
      'Timestamp',
      'Operator ID',
      'Operator Name',
      'Role',
      'Action Taken',
      'Train Number',
      'Decision Details',
      'Engineering Reason',
      'Zone Scope',
      'Operational Status'
    ];

    const rows = auditLogs.map((l: AuditLog) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.operatorId}"`,
      `"${l.operatorName}"`,
      `"${l.role}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.trainNumber || 'N/A'}"`,
      `"${l.decision.replace(/"/g, '""')}"`,
      `"${l.reason.replace(/"/g, '""')}"`,
      `"${l.zone}"`,
      `"${l.status}"`
    ]);

    const csvContent = [
      '# ==========================================================================',
      '# MINISTRY OF RAILWAYS - GOVERNMENT OF INDIA',
      '# PRAGATI: REGULATORY OPERATIONAL AUDIT LOG',
      `# Generated On: ${now.toLocaleString('en-IN')}`,
      '# ==========================================================================',
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRAGATI_Audit_Log_${now.toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PRAGATI_Audit_Trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Operational Audit Trail
            </h1>
            <span className="bg-[#063B7A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Tamper-Evident Record
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Immutable log of all human operator approvals, rejections, manual overrides & safety actions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-soft transition flex items-center space-x-1.5"
            title="Download CSV log"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="bg-[#063B7A] hover:bg-[#052B5F] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
            title="Download JSON log"
          >
            <FileCode2 className="w-4 h-4 text-orange-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Search & Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by operator, train number, action type..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
          />
        </div>

        <span className="text-xs font-bold text-slate-600">
          Total Logged Actions: <strong className="text-[#063B7A]">{auditLogs.length}</strong>
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Operator & ID</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-2 text-center">Train No.</th>
                <th className="py-3 px-3">Decision / Override Details</th>
                <th className="py-3 px-3">Engineering Reason</th>
                <th className="py-3 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  
                  {/* Timestamp */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  {/* Operator */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{log.operatorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.operatorId} • {log.role}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-[#063B7A] block">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{log.zone}</span>
                  </td>

                  {/* Train */}
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">
                    {log.trainNumber || '—'}
                  </td>

                  {/* Decision */}
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{log.decision}</span>
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-3 text-slate-600 text-[11px] leading-snug">
                    {log.reason}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
