import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Swords,
  Code2,
  Trophy,
  Flame,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Sparkles
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E5E7EB] flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <nav className="w-full border-b border-[#232738] bg-[#11131B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              Skill<span className="text-purple-400 ml-1">Battle</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20 flex items-center space-x-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1C2030] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-900/30"
                >
                  Start Coding
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Real-Time Competitive Programming Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Code Fast. Fight Live. <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-500 bg-clip-text text-transparent">
              Conquer the Arena.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The ultimate developer arena pairing algorithmic practice with high-stakes, real-time 1v1 coding battles. Challenge friends and prove your mastery.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? '/battle/create' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-900/30 hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <Swords className="w-5 h-5" />
              <span>Create 1v1 Battle</span>
            </Link>

            <Link
              to="/problems"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#161924] hover:bg-[#1F2333] border border-[#2A2E42] text-gray-200 font-semibold text-base transition-colors flex items-center justify-center space-x-2"
            >
              <Code2 className="w-5 h-5 text-purple-400" />
              <span>Browse Problems</span>
            </Link>
          </div>

          {/* 1v1 Battle Preview Visual */}
          <div className="pt-12 max-w-5xl mx-auto">
            <div className="rounded-3xl bg-[#141622]/90 border border-[#232738] p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              {/* Fake Battle Arena Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#232738] text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-gray-400 font-mono pl-2">ROOM #SB-PRO • Two Sum • Medium</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold">
                  <span>⏱ 08:42</span>
                </div>
              </div>

              {/* Fake Battle Split View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-left font-mono text-xs">
                <div className="p-4 rounded-2xl bg-[#0F1018] border border-[#232738]">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#232738]/50">
                    <span className="text-purple-400 font-bold">Student A (You)</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Passed 5/5</span>
                  </div>
                  <pre className="text-gray-300 overflow-x-auto leading-relaxed">
{`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1018] border border-[#232738]">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#232738]/50">
                    <span className="text-indigo-400 font-bold">Student B (Opponent)</span>
                    <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Passed 3/5</span>
                  </div>
                  <pre className="text-gray-400 overflow-x-auto leading-relaxed opacity-60">
{`// Code hidden during active battle
// Opponent progress streaming:
// [Status]: Executing test suite...
// [Passed]: 3/5 sample & hidden tests
// [Time]: 142 ms runtime`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 border-t border-[#232738] bg-[#0E1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Engineered for Serious Coders
            </h2>
            <p className="text-sm text-gray-400">
              Everything you need to master data structures, prepare for technical interviews, and compete in head-to-head battles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4 hover:border-purple-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Live 1v1 Battle Arena</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generate shareable battle rooms, sync countdowns with friends via Socket.IO, and solve identical problems under time pressure.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4 hover:border-purple-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Monaco Code Editor</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                VS Code-grade editor with syntax highlighting, custom dark theme, multi-language support (JavaScript & Python), and instant test runner.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4 hover:border-purple-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Streaks & Heatmap</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                LeetCode-inspired submission activity heatmap grounded in real MongoDB logs, streak counters, and milestone achievement badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#232738] bg-[#0A0B10] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Swords className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-gray-300">Skill Battle</span>
            <span>— College Capstone Web Platform</span>
          </div>
          <div>
            Built with React, Vite, Node.js, Express, MongoDB & Socket.IO
          </div>
        </div>
      </footer>
    </div>
  );
};

