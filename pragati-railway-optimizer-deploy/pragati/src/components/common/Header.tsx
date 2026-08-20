import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRailway } from '../../context/RailwayContext';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Radio, 
  ShieldAlert, 
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { PragatiIcon } from './Logos';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, selectedZone, setSelectedZone } = useAuth();
  const { 
    lastUpdated, 
    alerts, 
    zones, 
    emergencyMode, 
    emergencyDetails,
    triggerEmergencyCorridorBlock,
    resolveEmergencyPermanently
  } = useRailway();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [emergencySection, setEmergencySection] = useState('Kanpur Central – Tundla');
  const [emergencyReason, setEmergencyReason] = useState('Track Obstruction / Safety Signal');
  const [resolutionNotes, setResolutionNotes] = useState('Track obstruction cleared and safety inspection confirmed by divisional controller.');
  const navigate = useNavigate();
  const unreadAlerts = alerts.filter(a => !a.isResolved);

  const [currentTime, setCurrentTime] = useState(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });
  const [currentDate, setCurrentDate] = useState(() => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  });

  // Real-time instant device clock synchronization (every second)
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setCurrentDate(new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(now));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEmergencyConfirm = () => {
    triggerEmergencyCorridorBlock(emergencySection, emergencyReason);
    setShowEmergencyModal(false);
  };

  const handleResolveEmergencyConfirm = () => {
    resolveEmergencyPermanently(resolutionNotes);
    setShowResolveModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-gradient-to-r from-[#F45100] via-[#FF6B00] to-[#F45100] text-white shadow-md px-3 sm:px-6 flex items-center justify-between transition-all">
        {/* Left Side: Brand and Mobile Toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition lg:hidden"
            title="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/operator/dashboard'} className="flex items-center space-x-2.5 group">
            <div className="bg-white text-[#F45100] p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <PragatiIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-wider uppercase drop-shadow-sm font-sans">
                PRAGATI
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
          {/* Zone Selector for Operator or Zone Filter */}
          {user?.role === 'OPERATOR' ? (
            <div className="hidden md:flex items-center bg-white/15 backdrop-blur-sm border border-white/25 rounded-md px-3 py-1 text-white text-xs font-medium">
              <span className="text-orange-200 mr-1.5 font-normal">Zone:</span>
              <span className="font-semibold">{selectedZone}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center bg-white/15 backdrop-blur-sm border border-white/25 rounded-md px-2.5 py-1 text-white text-xs">
              <span className="text-orange-200 mr-1.5">View:</span>
              <select 
                value={selectedZone} 
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              >
                <option value="All Zones" className="text-slate-900">All 17 Zones</option>
                {zones.map(z => (
                  <option key={z.id} value={z.name} className="text-slate-900">{z.name} ({z.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Emergency Alert Indicator & Permanent Resolver */}
          {emergencyMode ? (
            <button
              onClick={() => setShowResolveModal(true)}
              className="flex items-center space-x-1.5 bg-red-700 hover:bg-red-800 border border-white/50 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse shadow-lg transition hover:scale-105 cursor-pointer"
              title="Emergency active - Click to Resolve Permanently"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>EMERGENCY ACTIVE • CLICK TO RESOLVE</span>
            </button>
          ) : (
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="hidden sm:flex items-center space-x-1.5 bg-red-600/90 hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm transition border border-red-500"
              title="Trigger Emergency Red Corridor Block"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Emergency Block</span>
            </button>
          )}

          {/* Live Data Status Indicator */}
          <div className="flex items-center space-x-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse"></div>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-100 uppercase tracking-wider">
              Live Data
            </span>
          </div>

          {/* Date & Time display - Synchronized instantly with device clock */}
          <div className="hidden lg:flex items-center text-white/90 text-xs font-mono font-medium border-l border-white/20 pl-3">
            <span>{currentDate}</span>
            <span className="mx-1.5 text-white/50">|</span>
            <span className="font-bold text-white tracking-wide">{currentTime}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-lg hover:bg-white/20 text-white transition focus:outline-none"
              title="Alerts & Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#F45100]">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">Active Bulletins</span>
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadAlerts.length} Critical
                    </span>
                  </div>
                  <Link 
                    to={user?.role === 'ADMIN' ? '/admin/alerts' : '/operator/alerts'} 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#0878F9] hover:underline font-semibold"
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {unreadAlerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No critical alerts at this time.
                    </div>
                  ) : (
                    unreadAlerts.slice(0, 4).map((a) => (
                      <div key={a.id} className="p-3 hover:bg-slate-50 text-xs transition">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            a.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {a.severity}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{a.timestamp}</span>
                        </div>
                        <p className="font-bold text-slate-900">{a.title}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill with AI Generated Photo */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 px-2 sm:px-2.5 py-1 rounded-lg transition focus:outline-none"
            >
              <img 
                src={user?.avatar || (user?.role === 'ADMIN' 
                  ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' 
                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80')} 
                alt="Avatar" 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover shadow-sm flex-shrink-0"
              />
              <div className="hidden md:block text-left pr-0.5">
                <p className="text-xs font-extrabold text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-orange-100 font-medium leading-tight">{user?.role === 'ADMIN' ? 'ADMIN' : 'CONTROLLER'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center space-x-3">
                  <img 
                    src={user?.avatar || (user?.role === 'ADMIN' 
                      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' 
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80')} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                    <span className="inline-block mt-0.5 bg-orange-100 text-[#F45100] text-[9px] font-extrabold px-2 py-0.2 rounded-full">
                      {user?.role === 'ADMIN' ? 'All 17 Zones' : user?.assignedZone}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <Link 
                    to={user?.role === 'ADMIN' ? '/admin/settings' : '/operator/dashboard'}
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    System Settings
                  </Link>
                  <Link 
                    to="/manual-control" 
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    Manual Override Console
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Persistent Emergency Top Alert Banner (Across all pages when active) */}
      {emergencyMode && (
        <div className="bg-red-700 text-white px-4 py-3 shadow-lg border-b-2 border-red-900 flex flex-wrap items-center justify-between gap-3 animate-pulse lg:ml-64 transition-all">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-red-900/80 rounded-xl flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white text-red-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex-shrink-0">
                  CRITICAL LOCKDOWN
                </span>
                <span className="font-extrabold text-sm sm:text-base truncate">
                  Emergency Corridor Red Lock Active
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium mt-0.5 truncate">
                Section: <strong>{emergencyDetails?.section || 'Kanpur Central – Tundla'}</strong> • Reason: {emergencyDetails?.reason || 'Track Obstruction'} (Triggered: {emergencyDetails?.timestamp || 'Active'})
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowResolveModal(true)}
            className="bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-400 px-4 py-2 rounded-xl text-xs font-black shadow-md transition hover:scale-105 flex-shrink-0 cursor-pointer"
          >
            ✓ Resolve Emergency & Restore Traffic
          </button>
        </div>
      )}

      {/* Trigger Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-300 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-red-600 text-white p-4 flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="font-black text-lg">EMERGENCY CORRIDOR LOCK</h3>
                <p className="text-xs text-red-100">Immediate Signal Red & Movement Halt</p>
              </div>
            </div>
            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg leading-relaxed">
                <strong>WARNING:</strong> This action will instantly set all signals to <strong>RED</strong> on the designated section and hold all approaching trains. This action is permanently recorded in the Ministry Audit Log.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Section</label>
                <select 
                  value={emergencySection} 
                  onChange={(e) => setEmergencySection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-red-500"
                >
                  <option value="Kanpur Central – Tundla">Kanpur Central – Tundla (Trunk Block)</option>
                  <option value="New Delhi – Ghaziabad">New Delhi – Ghaziabad (NCR Gateway)</option>
                  <option value="Prayagraj – Pt. Deen Dayal Upadhyaya">Prayagraj – DDU (Eastern Fast)</option>
                  <option value="Jhansi – Gwalior">Jhansi – Gwalior (Central Section)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Justification</label>
                <input 
                  type="text" 
                  value={emergencyReason} 
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                  placeholder="Reason for emergency stop..."
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEmergencyConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-600/30 transition"
                >
                  Confirm Emergency Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Emergency Permanent Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-200 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-700 text-white p-4 flex items-center space-x-3">
              <div className="p-2 bg-emerald-800 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-black text-lg">RESOLVE EMERGENCY PROTOCOL</h3>
                <p className="text-xs text-emerald-100">Permanent Clearance & Signal Restoration</p>
              </div>
            </div>
            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-lg leading-relaxed text-xs">
                <strong>SAFETY CLEARANCE NOTICE:</strong> Confirming this resolution will remove the emergency red signal locks, restore train speeds, mark emergency alerts resolved, and permanently log the safety clearance in the tamper-evident audit log.
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                <p className="font-bold text-slate-800">
                  Section: <span className="text-[#063B7A]">{emergencyDetails?.section || 'Kanpur Central – Tundla'}</span>
                </p>
                <p className="text-slate-600">
                  Initial Trigger Reason: {emergencyDetails?.reason || 'Track Obstruction / Safety Signal'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clearance Justification / Inspection Notes</label>
                <textarea 
                  value={resolutionNotes} 
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Enter track inspection / safety clearance notes..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResolveEmergencyConfirm}
                  className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-lg shadow-emerald-700/30 transition flex items-center justify-center space-x-1.5"
                >
                  <span>Resolve & Restore Traffic</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
