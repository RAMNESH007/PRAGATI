import React, { useState } from 'react';
import { useRailway } from '../../context/RailwayContext';
import { useAuth } from '../../context/AuthContext';
import { IndiaZoneMap } from '../../components/network/IndiaZoneMap';
import { ReviewModal } from '../../components/recommendations/ReviewModal';
import { AIRecommendation, RailwayZone } from '../../types';
import { 
  Building2, 
  Train, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  PieChart as PieIcon,
  CheckCircle2,
  Calendar,
  MapPin
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { zones, trains, recommendations, alerts } = useRailway();
  const { selectedZone, setSelectedZone } = useAuth();
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);
  const [trendFilter, setTrendFilter] = useState<'Today' | 'Yesterday' | '7Days' | '30Days'>('Today');
  const navigate = useNavigate();

  // Dynamic filter based on top bar selectedZone
  const isFiltered = selectedZone && selectedZone !== 'All Zones';
  const currentZone = isFiltered 
    ? zones.find(z => z.name === selectedZone || selectedZone.includes(z.name) || z.code === selectedZone) || null
    : null;

  // Dynamic KPI calculations based on selected zone
  const totalZonesDisplay = currentZone ? currentZone.code : `${zones.length}`;
  const totalZonesSubtext = currentZone ? `${currentZone.name}` : 'All Railway Zones';

  const activeTrainsCount = currentZone ? currentZone.activeTrains : 2348;
  const activeTrainsSubtext = currentZone ? `Active in ${currentZone.code}` : 'Across All Zones';

  const onTimePercentage = currentZone ? currentZone.onTimePercentage : Math.round(zones.reduce((acc, z) => acc + z.onTimePercentage, 0) / zones.length);
  const avgDelay = currentZone ? currentZone.averageDelayMinutes : (zones.reduce((acc, z) => acc + z.averageDelayMinutes, 0) / zones.length).toFixed(1);
  const avgThroughput = currentZone ? currentZone.throughputPercentage : (zones.reduce((acc, z) => acc + z.throughputPercentage, 0) / zones.length).toFixed(1);

  // Dynamic AI Recommendation Distribution for the selected zone
  const aiDonutData = currentZone ? [
    { name: 'Recommended', value: Math.max(12, Math.round(currentZone.activeTrains * 0.22)), color: '#0878F9' },
    { name: 'Pending Review', value: Math.max(4, Math.round(currentZone.activeTrains * 0.08)), color: '#F59E0B' },
    { name: 'Operator Modified', value: Math.max(2, Math.round(currentZone.activeTrains * 0.04)), color: '#10B981' },
    { name: 'Rejected', value: Math.max(1, Math.round(currentZone.activeTrains * 0.02)), color: '#EF4444' }
  ] : [
    { name: 'Recommended', value: 78, color: '#0878F9' },
    { name: 'Pending Review', value: 32, color: '#F59E0B' },
    { name: 'Operator Modified', value: 12, color: '#10B981' },
    { name: 'Rejected', value: 6, color: '#EF4444' }
  ];

  const totalRecommendationsCount = aiDonutData.reduce((a, b) => a + b.value, 0);

  // Hourly throughput trend data adapted to selected zone
  const baseThroughput = currentZone ? currentZone.throughputPercentage : 92.4;
  const throughputTrendData = [
    { time: '00:00', throughput: Math.max(65, Number((baseThroughput - 7.2).toFixed(1))) },
    { time: '04:00', throughput: Math.max(65, Number((baseThroughput - 10.5).toFixed(1))) },
    { time: '08:00', throughput: Math.max(65, Number((baseThroughput - 3.1).toFixed(1))) },
    { time: '12:00', throughput: Number(baseThroughput.toFixed(1)) },
    { time: '16:00', throughput: Math.max(65, Number((baseThroughput - 4.2).toFixed(1))) },
    { time: '20:00', throughput: Math.max(65, Number((baseThroughput - 1.6).toFixed(1))) },
    { time: '24:00', throughput: Math.max(65, Number((baseThroughput - 5.8).toFixed(1))) }
  ];

  // Filtered active alerts for the selected zone
  const activeAlerts = alerts.filter(a => !a.isResolved);
  const filteredAlerts = currentZone 
    ? activeAlerts.filter(a => a.zone === currentZone.name || a.section.includes(currentZone.code) || a.section.includes(currentZone.name))
    : activeAlerts;
  const displayAlerts = (filteredAlerts.length > 0 ? filteredAlerts : activeAlerts).slice(0, 3);

  // AI vs Actual Delay Bar Chart Data
  const aiPerformanceData = [
    { zone: 'NR', aiDelay: 16, actualDelay: 22 },
    { zone: 'ER', aiDelay: 24, actualDelay: 31 },
    { zone: 'WR', aiDelay: 15, actualDelay: 18 },
    { zone: 'SR', aiDelay: 14, actualDelay: 16 },
    { zone: 'CR', aiDelay: 22, actualDelay: 28 },
    { zone: 'NER', aiDelay: 19, actualDelay: 24 },
    { zone: 'ECR', aiDelay: 25, actualDelay: 34 }
  ];

  const handleZoneClick = (zone: RailwayZone) => {
    setSelectedZone(zone.name);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Title & Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            {currentZone && (
              <span className="bg-orange-100 text-[#F45100] border border-orange-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-[#FF6B00]" />
                <span>{currentZone.name} ({currentZone.code})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentZone 
              ? `Live operational telemetry, throughput efficiency & AI decisions for ${currentZone.name} (HQ: ${currentZone.headquarters})`
              : 'Overview of all railway zones & system performance across Indian Railways'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {currentZone && (
            <button
              onClick={() => setSelectedZone('All Zones')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-soft transition"
            >
              Reset to All Zones
            </button>
          )}
          <Link
            to="/ai-recommendations"
            className="bg-gradient-to-r from-[#FF6B00] to-[#F45100] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 hover:opacity-95 transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Decision Hub ({recommendations.filter(r => r.status === 'PENDING').length} Pending)</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Cards matching reference image layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Zones / Zone Code */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {currentZone ? 'Zone Code' : 'Total Zones'}
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#063B7A]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalZonesDisplay}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{totalZonesSubtext}</p>
        </div>

        {/* Active Trains */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Trains</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#0878F9]">
              <Train className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{activeTrainsCount.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">{activeTrainsSubtext}</p>
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
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> ↑ 5% vs yesterday
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
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{avgDelay} min</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center">
            <TrendingDown className="w-3 h-3 mr-0.5 inline" /> ↓ 3.2 min vs yesterday
          </p>
        </div>

        {/* Section Throughput */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Section Throughput</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-[#FF6B00]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#FF6B00]">{avgThroughput}%</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> ↑ 6.1% vs yesterday
          </p>
        </div>

      </div>

      {/* Row 2: Zone Overview Map + AI Overview Donut + Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Zone Overview Map & Table (7 Cols) */}
        <div className="lg:col-span-7">
          <IndiaZoneMap onSelectZone={handleZoneClick} selectedZoneCode={currentZone?.code} />
        </div>

        {/* Right: AI Overview Donut & Critical Alerts (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* AI Recommendation Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#0878F9]" />
                <span>AI Recommendation Overview {currentZone ? `(${currentZone.code})` : ''}</span>
              </h3>
              <Link to="/ai-recommendations" className="text-xs text-[#0878F9] font-bold hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              {/* Donut Chart */}
              <div className="sm:col-span-6 relative h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {aiDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900">{totalRecommendationsCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="sm:col-span-6 space-y-2 text-xs">
                {aiDonutData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {item.value} <span className="text-[10px] text-slate-400">({Math.round((item.value / Math.max(1, totalRecommendationsCount)) * 100)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Critical Alerts Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>{currentZone ? `${currentZone.code} Alerts` : 'Critical Alerts'}</span>
              </h3>
              <Link to="/alerts" className="text-xs text-[#FF6B00] font-bold hover:underline">
                View All Alerts →
              </Link>
            </div>

            <div className="space-y-2.5">
              {displayAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-xl border flex items-start space-x-3 transition ${
                    alert.severity === 'CRITICAL' ? 'bg-red-50/70 border-red-200' :
                    alert.severity === 'WARNING' ? 'bg-amber-50/70 border-amber-200' :
                    'bg-blue-50/70 border-blue-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg text-white mt-0.5 ${
                    alert.severity === 'CRITICAL' ? 'bg-red-600' :
                    alert.severity === 'WARNING' ? 'bg-amber-500' :
                    'bg-blue-600'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{alert.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{alert.section}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Row 3: Throughput Trend (Line Chart) + AI vs Actual Performance (Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Throughput Trend Line Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Throughput Trend ({currentZone ? currentZone.code : 'All Zones'})
              </h3>
              <p className="text-[11px] text-slate-400">Track capacity utilization benchmarked throughout the day</p>
            </div>
            
            {/* Filter pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              {(['Today', 'Yesterday', '7Days', '30Days'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTrendFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                    trendFilter === f ? 'bg-white text-[#063B7A] shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f === '7Days' ? 'Last 7 Days' : f === '30Days' ? 'Last 30 Days' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#052B5F', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                  formatter={(value: any) => [`${value}%`, 'Throughput']}
                />
                <Line
                  type="monotone"
                  dataKey="throughput"
                  stroke="#0878F9"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FF6B00', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Peak {currentZone ? currentZone.code : 'corridor'} throughput recorded at 12:00 PM ({baseThroughput}%)
            </span>
            <Link to="/reports" className="text-[#0878F9] font-bold hover:underline">
              View Detailed Analytics →
            </Link>
          </div>
        </div>

        {/* AI vs Actual Performance Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                AI vs Actual Performance
              </h3>
              <p className="text-[11px] text-slate-400">Delay reduction delta across major railway zones</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="zone" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 40]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#052B5F', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="actualDelay" name="Actual Delay (min)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiDelay" name="With AI Optimization (min)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>AI reduces delay by an average of <strong>27.8%</strong></span>
            <span className="text-emerald-600 font-bold">✓ Active</span>
          </div>
        </div>

      </div>

      {/* Review Modal for AI Recommendations */}
      {selectedRec && (
        <ReviewModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}

    </div>
  );
};
