import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { SolvedProgressRing } from '../../components/profile/SolvedProgressRing';
import { ActivityHeatmap } from '../../components/profile/ActivityHeatmap';
import { BadgeCard } from '../../components/profile/BadgeCard';
import { Loader } from '../../components/common/Loader';
import {
  User,
  Flame,
  Trophy,
  Swords,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await profileService.getStudentProfile(username);
        if (res.success) {
          setProfile(res.profile);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load student profile.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return <Loader message="Loading developer profile..." fullScreen />;
  }

  if (error || !profile) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Profile Not Found</h2>
        <p className="text-xs text-gray-400">{error || 'This user does not exist.'}</p>
      </div>
    );
  }

  const { stats, battleStats, streak, heatmap, badges, recentSubmissions } = profile;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171A28] via-[#141622] to-[#171926] border border-[#232738] shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-24 h-24 rounded-3xl bg-[#0F1118] border-2 border-purple-500/40 object-cover shadow-lg shadow-purple-950/30"
        />

        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-white">{profile.name}</h1>
              <p className="text-xs text-gray-400 font-mono">@{profile.username}</p>
            </div>

            <div className="flex items-center justify-center md:justify-end space-x-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>{profile.rating || 1200} ELO</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{streak?.current || 0}d Streak</span>
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
            {profile.bio || 'Competitive programming enthusiast on Skill Battle.'}
          </p>

          <div className="flex items-center justify-center md:justify-start space-x-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </span>
            <span>•</span>
            <span className="uppercase text-[11px] font-semibold text-purple-400">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats Grid: Solved Ring + 1v1 Battle Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Solved Progress Ring */}
        <div className="lg:col-span-7">
          <SolvedProgressRing stats={stats} />
        </div>

        {/* Right: Battle Performance Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#141622] border border-[#232738] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Swords className="w-4 h-4 text-indigo-400" />
              <span>1v1 Battle Record</span>
            </h3>
            <span className="text-xs font-bold text-indigo-400">
              {battleStats?.winRate || 0}% Win Rate
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-[#0F1118] border border-[#232738]">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Wins</span>
              <p className="text-lg font-bold text-white mt-0.5">{battleStats?.wins || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1118] border border-[#232738]">
              <span className="text-[10px] text-rose-400 font-bold uppercase">Losses</span>
              <p className="text-lg font-bold text-white mt-0.5">{battleStats?.losses || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1118] border border-[#232738]">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Draws</span>
              <p className="text-lg font-bold text-white mt-0.5">{battleStats?.draws || 0}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1118] border border-[#232738] flex items-center justify-between text-xs text-gray-400">
            <span>Total Battles Fought</span>
            <span className="font-bold text-white font-mono">{battleStats?.totalBattles || 0}</span>
          </div>
        </div>
      </div>

      {/* LeetCode-Inspired MongoDB Submission Activity Heatmap */}
      <div>
        <ActivityHeatmap heatmapData={heatmap} />
      </div>

      {/* Earned Badges Showcase */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Earned Badges & Achievements</span>
        </h3>

        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((b) => (
              <BadgeCard
                key={b.badge._id}
                badge={b.badge}
                unlocked={true}
                unlockedAt={b.unlockedAt}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] text-center text-xs text-gray-500">
            No badges unlocked yet. Solve challenges and win battles to earn badges!
          </div>
        )}
      </div>

      {/* Recent Submissions Feed */}
      <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Recent Submissions</span>
        </h3>

        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div className="divide-y divide-[#232738]/50 text-xs">
            {recentSubmissions.map((sub) => (
              <div key={sub._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{sub.problem?.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {sub.language.toUpperCase()} • {new Date(sub.createdAt).toLocaleString()}
                  </p>
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
                  <span className="text-gray-400 font-mono text-[11px]">{sub.executionTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">No submissions yet.</p>
        )}
      </div>
    </div>
  );
};

