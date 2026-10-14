import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Timer,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  unreadCount = 0
}) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar & Planner', path: '/calendar', icon: Calendar },
    { name: 'Focus Timer', path: '/timer', icon: Timer },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLinkClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <GraduationCap size={22} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-white text-base tracking-tight">StudyTrack</span>
                <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Productivity</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                {!collapsed && item.badge > 0 && (
                  <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Student'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            )}

            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
