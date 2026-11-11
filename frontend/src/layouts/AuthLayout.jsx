import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Swords } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#0A0B10] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Purple Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link to="/" className="flex items-center space-x-2.5 mb-8 group z-10">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
          <Swords className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-white flex items-center">
            Skill<span className="text-purple-400 ml-1">Battle</span>
          </span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
            Competitive Coding Arena
          </span>
        </div>
      </Link>

      {/* Auth Form Card */}
      <div className="w-full max-w-md rounded-3xl bg-[#141622]/90 border border-[#232738] shadow-2xl p-6 sm:p-8 backdrop-blur-xl z-10">
        <Outlet />
      </div>

      <p className="mt-8 text-xs text-gray-400 z-10">
        &copy; {new Date().getFullYear()} Skill Battle. Built for College Capstone Project.
      </p>
    </div>
  );
};

