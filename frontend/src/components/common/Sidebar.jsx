import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Code2,
  Swords,
  CalendarDays,
  History,
  Trophy,
  User,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: '1v1 Battle Arena', path: '/battle/create', icon: Swords, badge: 'LIVE' },
    { name: 'Daily Challenge', path: '/daily-challenge', icon: CalendarDays },
    { name: 'Battle History', path: '/battle/history', icon: History },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'My Profile', path: `/profile/${user?.username || ''}`, icon: User }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#11131B] border-r border-[#232738] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-4 px-3 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Platform
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-[#161924]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500 text-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Admin Navigation (If Admin) */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-400" />
                Administration
              </p>
              <nav className="space-y-1">
                <NavLink
                  to="/admin"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                        : 'text-gray-400 hover:text-white hover:bg-[#161924]'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin Dashboard</span>
                </NavLink>
                <NavLink
                  to="/admin/problems"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                        : 'text-gray-400 hover:text-white hover:bg-[#161924]'
                    }`
                  }
                >
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Manage Problems</span>
                </NavLink>
                <NavLink
                  to="/admin/users"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                        : 'text-gray-400 hover:text-white hover:bg-[#161924]'
                    }`
                  }
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Student Accounts</span>
                </NavLink>
                <NavLink
                  to="/admin/daily-challenge"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                        : 'text-gray-400 hover:text-white hover:bg-[#161924]'
                    }`
                  }
                >
                  <CalendarDays className="w-4 h-4 text-purple-400" />
                  <span>Daily Challenges</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-4 border-t border-[#232738]">
          <div className="p-3 rounded-xl bg-[#161924] border border-[#232738]/80 text-xs">
            <div className="flex items-center space-x-2 text-purple-300 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Skill Battle v1.0</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              College Capstone Competitive Programming & Real-time 1v1 Platform.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

