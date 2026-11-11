import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';
import {
  Users,
  Code2,
  Swords,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        if (res.success) {
          setStats(res);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <Loader message="Loading administrator dashboard..." />;
  }

  const counts = stats?.stats || {};

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time system telemetry, student accounts, problem curation, and activity logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/problems/create"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Problem</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Registered Students</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{counts.totalUsers || 0}</p>
          <p className="text-[11px] text-gray-500">Active platform learners</p>
        </div>

        {/* Total Coding Problems */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Coding Problems</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{counts.totalProblems || 0}</p>
          <p className="text-[11px] text-indigo-400 font-medium">Curated test suites</p>
        </div>

        {/* Total Battles */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Total 1v1 Battles</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{counts.totalBattles || 0}</p>
          <p className="text-[11px] text-amber-400 font-medium">
            {counts.activeBattlesCount || 0} live right now
          </p>
        </div>

        {/* Total Submissions */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Total Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{counts.totalSubmissions || 0}</p>
          <p className="text-[11px] text-emerald-400 font-medium">Automated test runs</p>
        </div>
      </div>

      {/* Activity Feeds Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions Feed */}
        <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#232738]">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Real-Time Submissions Feed</span>
            </h3>
          </div>

          {stats?.recentSubmissions?.length > 0 ? (
            <div className="divide-y divide-[#232738]/50 text-xs">
              {stats.recentSubmissions.map((sub) => (
                <div key={sub._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={
                        sub.user?.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${sub.user?.username || 'u'}`
                      }
                      alt={sub.user?.username}
                      className="w-7 h-7 rounded-lg bg-[#0F1118] border border-[#232738]"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {sub.user?.name || 'User'}{' '}
                        <span className="text-gray-500 font-normal">on {sub.problem?.title}</span>
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {sub.language.toUpperCase()} • {new Date(sub.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full border text-[10px] ${
                      sub.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">No recent submissions.</p>
          )}
        </div>

        {/* Recently Registered Students */}
        <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#232738]">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Recently Registered Students</span>
            </h3>
            <Link to="/admin/users" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
              Manage All &rarr;
            </Link>
          </div>

          {stats?.recentUsers?.length > 0 ? (
            <div className="divide-y divide-[#232738]/50 text-xs">
              {stats.recentUsers.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-7 h-7 rounded-lg bg-[#0F1118] border border-[#232738]"
                    />
                    <div>
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-[10px] text-gray-500">
                        @{u.username} • {u.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      u.isSuspended
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {u.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">No students registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

