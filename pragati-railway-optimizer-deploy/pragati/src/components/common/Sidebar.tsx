import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRailway } from '../../context/RailwayContext';
import {
  LayoutDashboard,
  MapPin,
  Train as TrainIcon,
  Network,
  CalendarDays,
  Sparkles,
  Sliders,
  Bell,
  BarChart3,
  Users,
  Settings,
  FileText,
  LogOut,
  FlaskConical,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout, selectedZone } = useAuth();
  const { alerts, recommendations } = useRailway();
  const navigate = useNavigate();

  const unreadAlertCount = alerts.filter(a => !a.isResolved).length;
  const pendingRecCount = recommendations.filter(r => r.status === 'PENDING').length;

  const isAdmin = user?.role === 'ADMIN';

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Zones', path: '/admin/zones', icon: MapPin },
    { name: 'Trains', path: '/admin/trains', icon: TrainIcon },
    { name: 'Network Map', path: '/network-map', icon: Network },
    { name: 'Schedule Planner', path: '/schedule', icon: CalendarDays },
    { name: 'AI Recommendations', path: '/ai-recommendations', icon: Sparkles, badge: pendingRecCount > 0 ? 'New' : undefined, badgeColor: 'bg-orange-500' },
    { name: 'Manual Control', path: '/manual-control', icon: Sliders },
    { name: 'What-If Simulator', path: '/simulation', icon: FlaskConical },
    { name: 'Alerts & Notifications', path: '/alerts', icon: Bell, badge: unreadAlertCount > 0 ? unreadAlertCount.toString() : undefined, badgeColor: 'bg-red-500' },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Users & Roles', path: '/admin/users', icon: Users },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ];

  const operatorNavItems = [
    { name: 'Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
    { name: 'My Zone Overview', path: '/operator/zone', icon: MapPin },
    { name: 'Trains in My Zone', path: '/operator/trains', icon: TrainIcon },
    { name: 'Network Map', path: '/network-map', icon: Network },
    { name: 'Schedule Planner', path: '/schedule', icon: CalendarDays },
    { name: 'AI Recommendations', path: '/ai-recommendations', icon: Sparkles, badge: pendingRecCount > 0 ? 'New' : undefined, badgeColor: 'bg-orange-500' },
    { name: 'Manual Control', path: '/manual-control', icon: Sliders },
    { name: 'What-If Simulator', path: '/simulation', icon: FlaskConical },
    { name: 'Alerts & Notifications', path: '/alerts', icon: Bell, badge: unreadAlertCount > 0 ? unreadAlertCount.toString() : undefined, badgeColor: 'bg-red-500' },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const navItems = isAdmin ? adminNavItems : operatorNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-14 bottom-0 left-0 z-30 w-64 bg-[#052B5F] text-slate-200 border-r border-[#063B7A] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Top Panel Indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-black/25 px-3 py-1.5 rounded-md border border-white/5">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'ADMIN PANEL' : 'OPERATOR PANEL'}</span>
            </span>
            {!isAdmin && (
              <span className="text-[10px] text-blue-300 normal-case font-normal truncate max-w-[90px]">
                {selectedZone}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-300 hover:bg-[#063B7A] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Panel & Logout */}
        <div className="p-3 border-t border-[#063B7A]/60 bg-[#031B3D]/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
          <div className="mt-2 text-[10px] text-slate-400 text-center font-mono">
            PRAGATI • RDSO Compliant
          </div>
        </div>
      </aside>
    </>
  );
};
