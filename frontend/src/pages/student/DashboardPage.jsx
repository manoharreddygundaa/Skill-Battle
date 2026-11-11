import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dailyChallengeService } from '../../services/dailyChallengeService';
import { profileService } from '../../services/profileService';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { Loader } from '../../components/common/Loader';
import {
  Code2,
  Swords,
  Flame,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Sparkles,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [profileRes, challengeRes] = await Promise.allSettled([
          profileService.getStudentProfile(user.username),
          dailyChallengeService.getTodayChallenge()
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          setProfileData(profileRes.value.profile);
        }

        if (challengeRes.status === 'fulfilled' && challengeRes.value.success) {
          setDailyChallenge(challengeRes.value.dailyChallenge);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return <Loader message="Loading your dashboard..." />;
  }

  const stats = profileData?.stats || {};
  const battleStats = profileData?.battleStats || user?.battleStats || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#141622] to-indigo-900/30 border border-[#232738] p-6 sm:p-8">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Welcome Back, Developer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user?.name || user?.username}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Ready to code? Complete today's daily challenge or test your speed in a 1v1 battle against a friend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/battle/create"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              <span>Start 1v1 Battle</span>
            </Link>

            <Link
              to="/problems"
              className="px-5 py-2.5 rounded-xl bg-[#1C2030] hover:bg-[#232738] border border-[#2A2E42] text-gray-200 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-colors"
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>Practice Problems</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Problems Solved</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">{stats.totalSolved || 0}</span>
            <span className="text-xs text-gray-500">/ {stats.totalProblems || 0}</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center">
            <span>{stats.acceptanceRate || 0}% overall completion</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Coding Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">{user?.streak?.current || 0}</span>
            <span className="text-xs text-gray-500">days active</span>
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            Max: {user?.streak?.max || 0} days record
          </div>
        </div>

        {/* Battle Wins */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">1v1 Battle Wins</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">{battleStats.wins || 0}</span>
            <span className="text-xs text-gray-500">/ {battleStats.totalBattles || 0} matches</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-medium">
            Win rate: {battleStats.winRate || 0}%
          </div>
        </div>

        {/* Platform Rating */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Skill Rating</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">{user?.rating || 1200}</span>
            <span className="text-xs text-gray-500">ELO pts</span>
          </div>
          <div className="text-[11px] text-purple-400 font-medium">
            Competitive division
          </div>
        </div>
      </div>

      {/* Main Grid: Daily Challenge Card + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Daily Challenge */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#181B28] to-[#12141D] border border-purple-500/30 shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Daily Challenge
                </span>
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
                +50 BONUS PTS
              </span>
            </div>

            {dailyChallenge ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white hover:text-purple-300 transition-colors">
                    {dailyChallenge.problem?.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <DifficultyBadge difficulty={dailyChallenge.problem?.difficulty} />
                    <span className="text-xs text-gray-400">
                      {dailyChallenge.totalCompletions || 0} students solved
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {dailyChallenge.problem?.description?.slice(0, 150)}...
                </p>

                {dailyChallenge.isCompleted ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed Today!</span>
                  </div>
                ) : (
                  <Link
                    to={`/problems/${dailyChallenge.problem?.slug}`}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-purple-900/30"
                  >
                    <span>Solve Challenge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No challenge scheduled today.</p>
            )}
          </div>

          {/* Quick 1v1 Battle Action Card */}
          <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Friend Battle Arena</h4>
                <p className="text-xs text-gray-400">Real-time 1v1 algorithmic duel</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Create a battle room, pick a difficulty, and share the room code with a classmate to race against the clock.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <Link
                to="/battle/create"
                className="flex-1 py-2 rounded-xl bg-[#1C2030] hover:bg-[#232738] border border-[#2A2E42] text-xs font-semibold text-white text-center transition-colors"
              >
                Create Room
              </Link>
              <Link
                to="/battle/join"
                className="flex-1 py-2 rounded-xl bg-[#1C2030] hover:bg-[#232738] border border-[#2A2E42] text-xs font-semibold text-purple-300 text-center transition-colors"
              >
                Join with Code
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Submissions & Solved Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Submissions */}
          <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#232738]">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Recent Submissions</span>
              </h3>
              <Link to="/problems" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                View All Problems &rarr;
              </Link>
            </div>

            {profileData?.recentSubmissions && profileData.recentSubmissions.length > 0 ? (
              <div className="divide-y divide-[#232738]/60">
                {profileData.recentSubmissions.slice(0, 5).map((sub) => (
                  <div key={sub._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <Link
                        to={`/problems/${sub.problem?.slug}`}
                        className="font-semibold text-white hover:text-purple-400 transition-colors"
                      >
                        {sub.problem?.title}
                      </Link>
                      <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                        <span className="uppercase font-mono">{sub.language}</span>
                        <span>•</span>
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-gray-400 font-mono text-[11px]">
                        {sub.executionTime}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                No submissions yet. Start solving problems to track your progress!
              </div>
            )}
          </div>

          {/* Difficulty Breakdown Preview */}
          <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Skill Progress by Difficulty</span>
            </h3>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0F1118] border border-[#232738] space-y-1 text-center">
                <span className="text-xs font-semibold text-emerald-400">Easy</span>
                <p className="text-lg font-bold text-white">
                  {stats.solvedEasy || 0}{' '}
                  <span className="text-xs text-gray-500 font-normal">/ {stats.totalEasy || 0}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1118] border border-[#232738] space-y-1 text-center">
                <span className="text-xs font-semibold text-amber-400">Medium</span>
                <p className="text-lg font-bold text-white">
                  {stats.solvedMedium || 0}{' '}
                  <span className="text-xs text-gray-500 font-normal">/ {stats.totalMedium || 0}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1118] border border-[#232738] space-y-1 text-center">
                <span className="text-xs font-semibold text-rose-400">Hard</span>
                <p className="text-lg font-bold text-white">
                  {stats.solvedHard || 0}{' '}
                  <span className="text-xs text-gray-500 font-normal">/ {stats.totalHard || 0}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

