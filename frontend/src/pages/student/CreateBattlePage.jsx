import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { battleService } from '../../services/battleService';
import { Swords, Clock, Target, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const CreateBattlePage = () => {
  const [difficulty, setDifficulty] = useState('Easy');
  const [duration, setDuration] = useState(600); // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const res = await battleService.createBattleRoom({ difficulty, duration });
      if (res.success && res.roomCode) {
        navigate(`/battle/${res.roomCode}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create battle room');
    } finally {
      setIsLoading(false);
    }
  };

  const durations = [
    { label: '5 Minutes', seconds: 300, desc: 'Blitz speed match' },
    { label: '10 Minutes', seconds: 600, desc: 'Standard duel (Recommended)' },
    { label: '15 Minutes', seconds: 900, desc: 'Strategic match' },
    { label: '20 Minutes', seconds: 1200, desc: 'Deep algorithmic race' }
  ];

  const difficulties = [
    { id: 'Easy', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', desc: 'Fundamentals & logic' },
    { id: 'Medium', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10', desc: 'Data structures & optimization' },
    { id: 'Hard', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10', desc: 'Advanced algorithms' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Real-Time 1v1 Battle Arena</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Battle Room</h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
          Configure match rules, create a private lobby, and invite a friend using a shareable code.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreateRoom} className="space-y-6">
        {/* Step 1: Difficulty */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-3">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              1. Select Problem Difficulty
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  difficulty === diff.id
                    ? `${diff.color} shadow-lg shadow-purple-950/30`
                    : 'bg-[#10121A] border-[#232738] text-gray-400 hover:text-white hover:bg-[#181B28]'
                }`}
              >
                <div className="font-bold text-sm mb-1">{diff.id}</div>
                <div className="text-[10px] text-gray-400">{diff.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Duration */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              2. Select Match Duration
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {durations.map((dur) => (
              <button
                key={dur.seconds}
                type="button"
                onClick={() => setDuration(dur.seconds)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  duration === dur.seconds
                    ? 'bg-purple-600/15 border-purple-500/50 text-white shadow-md shadow-purple-950/20'
                    : 'bg-[#10121A] border-[#232738] text-gray-400 hover:text-white hover:bg-[#181B28]'
                }`}
              >
                <div className="font-semibold text-xs text-white">{dur.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{dur.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.02]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Swords className="w-5 h-5" />
              <span>Create Lobby & Get Invite Code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Alternative Join CTA */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400">
          Already have an invite code from a friend?{' '}
          <Link to="/battle/join" className="text-purple-400 hover:text-purple-300 font-semibold underline">
            Join Battle Room
          </Link>
        </p>
      </div>
    </div>
  );
};

