import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { dailyChallengeService } from '../../services/dailyChallengeService';
import { Loader } from '../../components/common/Loader';
import {
  CalendarDays,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

export const AdminDailyChallengePage = () => {
  const [problems, setProblems] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [bonusPoints, setBonusPoints] = useState(50);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [probRes, challengeRes] = await Promise.all([
          adminService.getProblems({ limit: 50 }),
          dailyChallengeService.getTodayChallenge()
        ]);

        if (probRes.success) {
          setProblems(probRes.problems);
          if (probRes.problems.length > 0 && !selectedProblemId) {
            setSelectedProblemId(probRes.problems[0]._id);
          }
        }

        if (challengeRes.success) {
          setCurrentChallenge(challengeRes.dailyChallenge);
        }
      } catch (err) {
        console.error('Failed to load daily challenge data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!date || !selectedProblemId) {
      setError('Date and problem are required.');
      return;
    }

    try {
      setSaving(true);
      const res = await adminService.setDailyChallenge({
        date,
        problemId: selectedProblemId,
        bonusPoints: parseInt(bonusPoints, 10) || 50
      });

      if (res.success) {
        setSuccessMsg(`Daily challenge for ${date} set successfully!`);
        // Refresh today's challenge
        const updated = await dailyChallengeService.getTodayChallenge();
        if (updated.success) setCurrentChallenge(updated.dailyChallenge);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set daily challenge');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading daily challenge settings..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-2.5">
          <CalendarDays className="w-7 h-7 text-purple-400" />
          <span>Manage Daily Challenges</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Schedule and curate the daily coding challenge for all students across the platform.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Current Active Challenge Card */}
      {currentChallenge && (
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Currently Active Today ({currentChallenge.date})
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {currentChallenge.problem?.title}
            </h3>
            <span className="text-xs font-mono text-purple-300">
              +{currentChallenge.bonusPoints} pts • {currentChallenge.totalCompletions} Solved
            </span>
          </div>
        </div>
      )}

      {/* Schedule Form */}
      <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          Schedule Challenge for Date
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Calendar Date (YYYY-MM-DD) *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Bonus Streak Points
              </label>
              <input
                type="number"
                value={bonusPoints}
                onChange={(e) => setBonusPoints(e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Select Problem *
            </label>
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              required
            >
              {problems.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.difficulty}] {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 flex items-center space-x-1.5 transition-all hover:scale-105 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Publish Daily Challenge</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

