import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Swords,
  Flame,
  Trophy,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  History
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#11131B]/90 backdrop-blur-md border-b border-[#232738]">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1D2130] lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center">
                Skill<span className="text-purple-400 ml-1">Battle</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Quick actions, streaks, and user dropdown */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {isAuthenticated ? (
            <>
              {/* Streak Badge */}
              <div
                title="Current Coding Streak"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold"
              >
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{user?.streak?.current || 0} Day Streak</span>
              </div>

              {/* Rating Badge */}
              <div
                title="Skill Battle ELO Rating"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold"
              >
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>{user?.rating || 1200} pts</span>
              </div>

              {/* Quick 1v1 Battle CTA */}
              <Link
                to="/battle/create"
                className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-purple-900/20 transition-all hover:scale-105"
              >
                <Swords className="w-4 h-4" />
                <span>1v1 Battle</span>
              </Link>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-[#1C2030] transition-colors focus:outline-none"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg bg-[#161924] border border-[#232738] object-cover"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#161924] border border-[#232738] shadow-2xl py-2 z-20">
                      <div className="px-4 py-3 border-b border-[#232738]">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            Administrator
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/profile/${user?.username}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#1D2130] hover:text-white"
                        >
                          <UserIcon className="w-4 h-4 mr-2.5 text-purple-400" />
                          My Profile
                        </Link>

                        <Link
                          to="/battle/history"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#1D2130] hover:text-white"
                        >
                          <History className="w-4 h-4 mr-2.5 text-indigo-400" />
                          Battle History
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/10"
                          >
                            <ShieldAlert className="w-4 h-4 mr-2.5 text-purple-400" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#232738]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 text-left"
                        >
                          <LogOut className="w-4 h-4 mr-2.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1D2130] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

