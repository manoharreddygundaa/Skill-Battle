import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dailyChallengeService } from '../../services/dailyChallengeService';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { Loader } from '../../components/common/Loader';
import {
  CalendarDays,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

export const DailyChallengePage = () => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const res = await dailyChallengeService.getTodayChallenge();
        if (res.success) {
          setChallenge(res.dailyChallenge);
        }
      } catch (err) {
        console.error('Failed to load daily challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();

    // Timer countdown to midnight
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight - now;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <Loader message="Loading today's daily challenge..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Every Day at Midnight (UTC)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Daily Coding Challenge
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          One curated algorithmic problem selected every 24 hours. Solve it to earn streak bonuses and boost your rank.
        </p>
      </div>

      {/* Countdown Card */}
      <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDays className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-xs font-bold text-white">Today's Date: {challenge?.date}</p>
            <p className="text-[11px] text-gray-400">Resets automatically at midnight</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-sm font-bold text-purple-300">{timeLeft} remaining</span>
        </div>
      </div>

      {/* Main Challenge Card */}
      {challenge?.problem ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181B28] to-[#12141D] border border-purple-500/40 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Featured Problem
              </span>
              <h2 className="text-2xl font-bold text-white">{challenge.problem.title}</h2>
            </div>

            <div className="flex items-center space-x-2">
              <DifficultyBadge difficulty={challenge.problem.difficulty} size="md" />
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>+{challenge.bonusPoints} Rating Points</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {challenge.problem.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {challenge.problem.tags?.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-[#1C2030] text-xs text-gray-400 border border-[#2A2E42]"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="pt-4 border-t border-[#232738] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{challenge.totalCompletions} Students Completed</span>
              </span>
            </div>

            {challenge.isCompleted ? (
              <div className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Solved for Today! Streak Maintained</span>
              </div>
            ) : (
              <Link
                to={`/problems/${challenge.problem.slug}`}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
              >
                <span>Solve Today's Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-gray-400 text-sm">
          No daily challenge scheduled for today.
        </div>
      )}
    </div>
  );
};

