import React from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { RailwayZone } from '../types';
import { 
  Download, 
  ArrowDownToLine,
  FileSpreadsheet,
  FileCheck2,
  Building2,
  MapPin,
  Train as TrainIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface DivisionReport {
  code: string;
  name: string;
  hq: string;
  activeTrains: number;
  onTimePercentage: number;
  averageDelayMinutes: number;
  throughputPercentage: number;
  alertsCount: number;
  status: string;
}

export const ReportsPage: React.FC = () => {
  const { zones } = useRailway();
  const { user, selectedZone } = useAuth();

  const isOperator = user?.role === 'OPERATOR';
  const activeZoneName = selectedZone || user?.assignedZone || 'Northern Railway';
  const myZone = zones.find(z => z.name === activeZoneName || z.code === activeZoneName) || zones[0];

  // Specific Divisional Data for Operator's Zone
  const getZoneDivisions = (zoneName: string): DivisionReport[] => {
    if (zoneName.toLowerCase().includes('northern') || zoneName === 'NR') {
      return [
        { code: 'DLI', name: 'Delhi Division', hq: 'New Delhi', activeTrains: 98, onTimePercentage: 74, averageDelayMinutes: 14.2, throughputPercentage: 94.2, alertsCount: 2, status: 'Active' },
        { code: 'UMB', name: 'Ambala Division', hq: 'Ambala Cantt', activeTrains: 64, onTimePercentage: 78, averageDelayMinutes: 12.8, throughputPercentage: 91.5, alertsCount: 1, status: 'Active' },
        { code: 'LKO', name: 'Lucknow NR Division', hq: 'Lucknow Charbagh', activeTrains: 72, onTimePercentage: 68, averageDelayMinutes: 19.5, throughputPercentage: 88.4, alertsCount: 1, status: 'Active' },
        { code: 'MB', name: 'Moradabad Division', hq: 'Moradabad', activeTrains: 48, onTimePercentage: 71, averageDelayMinutes: 16.3, throughputPercentage: 89.1, alertsCount: 1, status: 'Active' },
        { code: 'FZR', name: 'Firozpur Division', hq: 'Firozpur Cantt', activeTrains: 30, onTimePercentage: 75, averageDelayMinutes: 15.0, throughputPercentage: 86.8, alertsCount: 0, status: 'Active' }
      ];
    } else if (zoneName.toLowerCase().includes('western') || zoneName === 'WR') {
      return [
        { code: 'MMCT', name: 'Mumbai Central Division', hq: 'Mumbai', activeTrains: 110, onTimePercentage: 79, averageDelayMinutes: 13.5, throughputPercentage: 96.0, alertsCount: 1, status: 'Active' },
        { code: 'ADI', name: 'Ahmedabad Division', hq: 'Ahmedabad', activeTrains: 75, onTimePercentage: 76, averageDelayMinutes: 15.2, throughputPercentage: 92.4, alertsCount: 1, status: 'Active' },
        { code: 'BRC', name: 'Vadodara Division', hq: 'Vadodara', activeTrains: 65, onTimePercentage: 74, averageDelayMinutes: 16.0, throughputPercentage: 91.2, alertsCount: 0, status: 'Active' },
        { code: 'RTM', name: 'Ratlam Division', hq: 'Ratlam', activeTrains: 55, onTimePercentage: 72, averageDelayMinutes: 17.8, throughputPercentage: 90.5, alertsCount: 1, status: 'Active' },
        { code: 'BVP', name: 'Bhavnagar Division', hq: 'Bhavnagar', activeTrains: 25, onTimePercentage: 80, averageDelayMinutes: 11.2, throughputPercentage: 88.0, alertsCount: 0, status: 'Active' }
      ];
    } else {
      return [
        { code: `${myZone.code}-DIV1`, name: `${myZone.name} Division 1`, hq: myZone.headquarters, activeTrains: Math.round(myZone.activeTrains * 0.35), onTimePercentage: myZone.onTimePercentage + 2, averageDelayMinutes: Number((myZone.averageDelayMinutes * 0.9).toFixed(1)), throughputPercentage: Number((myZone.throughputPercentage + 1.2).toFixed(1)), alertsCount: 1, status: 'Active' },
        { code: `${myZone.code}-DIV2`, name: `${myZone.name} Division 2`, hq: 'Zonal Central', activeTrains: Math.round(myZone.activeTrains * 0.28), onTimePercentage: myZone.onTimePercentage, averageDelayMinutes: myZone.averageDelayMinutes, throughputPercentage: myZone.throughputPercentage, alertsCount: 2, status: 'Active' },
        { code: `${myZone.code}-DIV3`, name: `${myZone.name} Division 3`, hq: 'Regional Terminal', activeTrains: Math.round(myZone.activeTrains * 0.22), onTimePercentage: myZone.onTimePercentage - 3, averageDelayMinutes: Number((myZone.averageDelayMinutes * 1.1).toFixed(1)), throughputPercentage: Number((myZone.throughputPercentage - 2.1).toFixed(1)), alertsCount: 1, status: 'Active' },
        { code: `${myZone.code}-DIV4`, name: `${myZone.name} Division 4`, hq: 'Outer Junction', activeTrains: Math.round(myZone.activeTrains * 0.15), onTimePercentage: myZone.onTimePercentage + 4, averageDelayMinutes: Number((myZone.averageDelayMinutes * 0.85).toFixed(1)), throughputPercentage: Number((myZone.throughputPercentage + 0.8).toFixed(1)), alertsCount: 0, status: 'Active' }
      ];
    }
  };

  const divisions = getZoneDivisions(myZone.name);

  // Chart data: Operator sees their divisions; Admin sees all zones
  const barChartData = isOperator
    ? divisions.map((d: DivisionReport) => ({
        name: d.code,
        fullName: d.name,
        throughput: d.throughputPercentage,
        punctuality: d.onTimePercentage,
        delay: d.averageDelayMinutes
      }))
    : zones.slice(0, 8).map((z: RailwayZone) => ({
        name: z.code,
        fullName: z.name,
        throughput: z.throughputPercentage,
        punctuality: z.onTimePercentage,
        delay: z.averageDelayMinutes
      }));

  const punctualityTrendData = [
    { day: 'Mon', punctuality: 68, aiAssisted: 74 },
    { day: 'Tue', punctuality: 66, aiAssisted: 76 },
    { day: 'Wed', punctuality: 71, aiAssisted: 79 },
    { day: 'Thu', punctuality: 69, aiAssisted: 81 },
    { day: 'Fri', punctuality: 72, aiAssisted: 83 },
    { day: 'Sat', punctuality: 75, aiAssisted: 86 },
    { day: 'Sun', punctuality: 72, aiAssisted: 85 }
  ];

  // Accurate CSV Export with UTF-8 BOM
  const handleExportCSV = () => {
    const now = new Date();
    const formattedTimestamp = now.toLocaleString('en-IN');
    
    if (isOperator) {
      // Zone-Specific CSV for Operator
      const headers = [
        'Division Code',
        'Division Name',
        'Divisional HQ',
        'Parent Zone',
        'Active Trains',
        'On-Time Punctuality (%)',
        'Average Delay (mins)',
        'Section Throughput (%)',
        'Active Alerts Count',
        'Operational Status'
      ];

      const rows = divisions.map((d: DivisionReport) => [
        `"${d.code}"`,
        `"${d.name}"`,
        `"${d.hq}"`,
        `"${myZone.name}"`,
        d.activeTrains,
        `${d.onTimePercentage}%`,
        `${d.averageDelayMinutes}`,
        `${d.throughputPercentage}%`,
        d.alertsCount,
        `"${d.status}"`
      ]);

      const avgThroughput = (divisions.reduce((a, b) => a + b.throughputPercentage, 0) / divisions.length).toFixed(1);
      const avgPunctuality = (divisions.reduce((a, b) => a + b.onTimePercentage, 0) / divisions.length).toFixed(1);
      const totalTrains = divisions.reduce((a, b) => a + b.activeTrains, 0);

      const csvContent = [
        '# ==========================================================================',
        '# MINISTRY OF RAILWAYS - GOVERNMENT OF INDIA',
        '# PRAGATI: AI-POWERED RAILWAY TRAFFIC MANAGEMENT SYSTEM',
        `# Zone Report: ${myZone.name} (${myZone.code}) - Divisional Performance Audit`,
        `# Zonal HQ: ${myZone.headquarters} | Generated On: ${formattedTimestamp}`,
        '# ==========================================================================',
        '',
        headers.join(','),
        ...rows.map(r => r.join(',')),
        '',
        `"TOTAL / AVERAGE",,"All Divisions","${myZone.name}",${totalTrains},"${avgPunctuality}%",,"${avgThroughput}%",,"ACTIVE"`
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PRAGATI_${myZone.code}_Divisional_Report_${now.toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // National 17-Zone CSV for Admin
      const headers = [
        'Zone Code',
        'Zone Name',
        'Headquarters',
        'Active Trains',
        'On-Time Punctuality (%)',
        'Average Delay (mins)',
        'Section Throughput (%)',
        'Active Alerts Count',
        'Operational Status'
      ];

      const rows = zones.map((z: RailwayZone) => [
        `"${z.code}"`,
        `"${z.name}"`,
        `"${z.headquarters}"`,
        z.activeTrains,
        `${z.onTimePercentage}%`,
        `${z.averageDelayMinutes}`,
        `${z.throughputPercentage}%`,
        z.alertsCount,
        `"${z.status}"`
      ]);

      const avgThroughput = (zones.reduce((a, b) => a + b.throughputPercentage, 0) / zones.length).toFixed(1);
      const avgPunctuality = (zones.reduce((a, b) => a + b.onTimePercentage, 0) / zones.length).toFixed(1);
      const totalTrains = zones.reduce((a, b) => a + b.activeTrains, 0);

      const csvContent = [
        '# ==========================================================================',
        '# MINISTRY OF RAILWAYS - GOVERNMENT OF INDIA',
        '# PRAGATI: AI-POWERED RAILWAY TRAFFIC MANAGEMENT SYSTEM',
        `# Report: Zonal Throughput & Operational Performance Audit (All 17 Zones)`,
        `# Generated On: ${formattedTimestamp}`,
        '# ==========================================================================',
        '',
        headers.join(','),
        ...rows.map(r => r.join(',')),
        '',
        `"AVERAGE / TOTAL",,"All 17 Zones",${totalTrains},"${avgPunctuality}%",,"${avgThroughput}%",,"ACTIVE"`
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PRAGATI_All_Zones_Throughput_Report_${now.toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Formatted PDF Report generator
  const handleExportPDF = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const reportRef = `PRAGATI-RDSO-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the official PDF Report.');
      return;
    }

    const reportTitle = isOperator 
      ? `PRAGATI — ${myZone.name} (${myZone.code}) Operational & Divisional Audit`
      : 'PRAGATI — Traffic Optimization & Throughput Performance Audit (All 17 Zones)';

    const tableRows = isOperator
      ? divisions.map(d => `
          <tr>
            <td><strong>${d.code}</strong></td>
            <td>${d.name}</td>
            <td>${d.hq}</td>
            <td style="text-align: center;">${d.activeTrains}</td>
            <td style="text-align: center; color: #16a34a; font-weight: bold;">${d.onTimePercentage}%</td>
            <td style="text-align: center; color: #d97706;">${d.averageDelayMinutes}m</td>
            <td style="text-align: center; font-weight: bold; color: #f45100;">${d.throughputPercentage}%</td>
            <td style="text-align: right;" class="status-active">${d.status}</td>
          </tr>
        `).join('')
      : zones.map(z => `
          <tr>
            <td><strong>${z.code}</strong></td>
            <td>${z.name}</td>
            <td>${z.headquarters}</td>
            <td style="text-align: center;">${z.activeTrains}</td>
            <td style="text-align: center; color: #16a34a; font-weight: bold;">${z.onTimePercentage}%</td>
            <td style="text-align: center; color: #d97706;">${z.averageDelayMinutes}m</td>
            <td style="text-align: center; font-weight: bold; color: #f45100;">${z.throughputPercentage}%</td>
            <td style="text-align: right;" class="status-active">${z.status}</td>
          </tr>
        `).join('');

    const columnHeaders = isOperator
      ? `<th>Code</th><th>Division Name</th><th>Divisional HQ</th><th style="text-align: center;">Active Trains</th><th style="text-align: center;">Punctuality</th><th style="text-align: center;">Avg Delay</th><th style="text-align: center;">Throughput</th><th style="text-align: right;">Status</th>`
      : `<th>Code</th><th>Railway Zone</th><th>Headquarters</th><th style="text-align: center;">Active Trains</th><th style="text-align: center;">Punctuality</th><th style="text-align: center;">Avg Delay</th><th style="text-align: center;">Throughput</th><th style="text-align: right;">Status</th>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #063B7A; padding-bottom: 12px; margin-bottom: 20px; }
            .header-left { display: flex; align-items: center; gap: 12px; }
            .header-title h1 { margin: 0; color: #063B7A; font-size: 18px; font-weight: 800; text-transform: uppercase; }
            .header-title h2 { margin: 2px 0 0 0; color: #f45100; font-size: 13px; font-weight: 700; }
            .header-title p { margin: 2px 0 0 0; color: #64748b; font-size: 10px; }
            .badge { background: #063b7a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; }
            .kpi-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .kpi-val { font-size: 18px; font-weight: 800; color: #063B7A; margin-top: 4px; }
            .section-title { font-size: 13px; font-weight: bold; color: #063B7A; margin: 16px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
            th { background: #063B7A; color: white; text-align: left; padding: 6px 8px; font-weight: 600; }
            td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .status-active { color: #16a34a; font-weight: bold; }
            .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; text-align: right;">
            <button onclick="window.print()" style="background: #063B7A; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <div class="header">
            <div class="header-left">
              <img src="/images/railway-logo.png" style="width: 46px; height: 46px; object-fit: contain;" />
              <div class="header-title">
                <h1>Ministry of Railways • Government of India</h1>
                <h2>${reportTitle}</h2>
                <p>Centre for Railway Information Systems (CRIS) • RDSO Safety Protocol Certified</p>
              </div>
            </div>
            <div style="text-align: right;">
              <img src="/images/irctc-logo.png" style="height: 38px; object-fit: contain;" /><br/>
              <span style="font-size: 9px; color: #64748b; font-family: monospace;">Ref: ${reportRef}</span>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Section Throughput</div>
              <div class="kpi-val" style="color: #f45100;">${myZone.throughputPercentage}%</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Zonal Punctuality</div>
              <div class="kpi-val" style="color: #16a34a;">${myZone.onTimePercentage}%</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Average Delay Saved</div>
              <div class="kpi-val">14.8 min</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Active Monitored Trains</div>
              <div class="kpi-val">${myZone.activeTrains}</div>
            </div>
          </div>

          <div class="section-title">${isOperator ? `${myZone.name.toUpperCase()} DIVISIONAL EFFICIENCY REGISTRY` : 'ZONAL THROUGHPUT & OPERATIONAL EFFICIENCY REGISTRY'}</div>
          <table>
            <thead>
              <tr>
                ${columnHeaders}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="section-title" style="margin-top: 25px;">AI ASSISTED THROUGHPUT IMPACT SUMMARY</div>
          <div style="font-size: 11px; line-height: 1.6; color: #334155; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
            • <strong>AI Constraint Solving Efficacy:</strong> 94.2% recommendation accuracy across 1,480 resolved block headway conflicts.<br/>
            • <strong>Human-in-the-Loop Approval:</strong> 91.6% operator direct acceptance rate with 8.4% local condition manual overrides.<br/>
            • <strong>Zonal Bottleneck Mitigation:</strong> ${myZone.name} shows a +16.4% improvement in platform turnaround and section throughput.
          </div>

          <div class="footer">
            <span>Official Report Generated: ${formattedDate} at ${formattedTime}</span>
            <span>PRAGATI Decision Engine • Confidential / Operational</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isOperator ? `Operational Reports — ${myZone.name}` : 'Reports & Operational Analytics'}
            </h1>
            {isOperator && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#063B7A] text-white">
                {myZone.code} Zone
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isOperator 
              ? `Divisional throughput, AI decision acceptance benchmarks & punctuality audit for ${myZone.name}`
              : 'Throughput efficiency, AI decision acceptance benchmarks & punctuality audit across all 17 zones'}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-soft transition flex items-center space-x-1.5 cursor-pointer"
            title="Download formatted CSV spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export {isOperator ? `${myZone.code} CSV` : 'CSV Report'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="bg-[#063B7A] hover:bg-[#052B5F] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            title="Print or Save Official PDF Report"
          >
            <FileCheck2 className="w-4 h-4 text-orange-400" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Benchmark KPI Highlights Scoped to Active Zone for Operator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {isOperator ? `${myZone.code} Active Trains` : 'Total Active Trains'}
          </span>
          <span className="text-2xl font-black text-[#063B7A] mt-1 block">
            {isOperator ? myZone.activeTrains : '312'}
          </span>
          <span className="text-[10px] text-slate-500">
            {isOperator ? `Operating in ${myZone.name}` : 'Across 17 Zonal Networks'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {isOperator ? `${myZone.code} Punctuality` : 'On-Time Punctuality'}
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {isOperator ? `${myZone.onTimePercentage}%` : '72.4%'}
          </span>
          <span className="text-[10px] text-slate-500">
            {isOperator ? 'Target: >70%' : 'Network aggregate'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {isOperator ? `${myZone.code} Section Throughput` : 'Average Delay Saved'}
          </span>
          <span className="text-2xl font-black text-[#FF6B00] mt-1 block">
            {isOperator ? `${myZone.throughputPercentage}%` : '14.8 min'}
          </span>
          <span className="text-[10px] text-slate-500">
            {isOperator ? '↑ 4.2% vs baseline' : 'Per trunk train per 500 km'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {isOperator ? `${myZone.code} Average Delay` : 'Platform Utilization'}
          </span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">
            {isOperator ? `${myZone.averageDelayMinutes} min` : '+16.4%'}
          </span>
          <span className="text-[10px] text-slate-500">
            {isOperator ? '↓ 2.8 min delay saved' : 'Turnaround optimization'}
          </span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Punctuality Trend Line Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Punctuality Index (Manual vs AI-Assisted)
              </h3>
              <p className="text-[11px] text-slate-400">
                {isOperator ? `Weekly on-time percentage in ${myZone.name}` : 'Weekly national on-time percentage'}
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              +13% Overall Punctuality Gain
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={punctualityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#052B5F', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="aiAssisted" name="AI-Assisted Punctuality (%)" stroke="#10B981" strokeWidth={3} />
                <Line type="monotone" dataKey="punctuality" name="Traditional Manual (%)" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throughput Comparison Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {isOperator ? `Divisional Throughput (${myZone.code})` : 'Section Throughput by Zone'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isOperator ? `Capacity utilization across ${myZone.name} divisions` : 'Zonal capacity utilization index'}
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#052B5F', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                />
                <Bar dataKey="throughput" name="Throughput (%)" fill="#FF6B00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Detailed Benchmark Table (Scoped to Zone's Divisions for Operator) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#063B7A]" />
            <span>
              {isOperator ? `${myZone.name} — Operating Divisions Registry` : 'Detailed Zonal Performance Registry (All 17 Zones)'}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {isOperator ? `${divisions.length} Operating Divisions in ${myZone.code}` : '17 Total Zones'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3">{isOperator ? 'Division Code' : 'Zone Code'}</th>
                <th className="py-2.5 px-3">{isOperator ? 'Division Name' : 'Zone Name'}</th>
                <th className="py-2.5 px-3">{isOperator ? 'Divisional HQ' : 'Headquarters'}</th>
                <th className="py-2.5 px-3 text-center">Active Trains</th>
                <th className="py-2.5 px-3 text-center">On-Time %</th>
                <th className="py-2.5 px-3 text-center">Avg Delay</th>
                <th className="py-2.5 px-3 text-center">Throughput</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isOperator ? (
                divisions.map((div: DivisionReport, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#063B7A]">{div.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{div.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{div.hq}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700 font-bold">{div.activeTrains}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">{div.onTimePercentage}%</td>
                    <td className="py-2.5 px-3 text-center text-amber-600">{div.averageDelayMinutes}m</td>
                    <td className="py-2.5 px-3 text-center text-[#FF6B00] font-bold">{div.throughputPercentage}%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {div.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                zones.map((zone: RailwayZone) => (
                  <tr key={zone.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#063B7A]">{zone.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{zone.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{zone.headquarters}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{zone.activeTrains}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">{zone.onTimePercentage}%</td>
                    <td className="py-2.5 px-3 text-center text-amber-600">{zone.averageDelayMinutes}m</td>
                    <td className="py-2.5 px-3 text-center text-[#FF6B00] font-bold">{zone.throughputPercentage}%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {zone.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
