import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { battleService } from '../../services/battleService';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { Loader } from '../../components/common/Loader';
import {
  Swords,
  Trophy,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const BattleHistoryPage = () => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await battleService.getUserBattleHistory({ page: pagination.page, limit: 10 });
        if (res.success) {
          setBattles(res.battles);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to load battle history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [pagination.page]);

  // Aggregate stats
  const wins = battles.filter(b => b.outcome === 'Victory').length;
  const losses = battles.filter(b => b.outcome === 'Defeat').length;
  const draws = battles.filter(b => b.outcome === 'Draw').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <History className="w-7 h-7 text-purple-400" />
            <span>Battle History</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Review your past 1v1 friend duels, algorithmic matches, and win rates.
          </p>
        </div>

        <Link
          to="/battle/create"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/30 transition-all self-start sm:self-auto"
        >
          <Swords className="w-4 h-4" />
          <span>New 1v1 Battle</span>
        </Link>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] text-center">
          <span className="text-xs text-gray-400">Total Matches</span>
          <p className="text-xl font-bold text-white mt-1">{pagination.total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] text-center">
          <span className="text-xs text-emerald-400">Victories</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{wins}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] text-center">
          <span className="text-xs text-rose-400">Defeats</span>
          <p className="text-xl font-bold text-rose-400 mt-1">{losses}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] text-center">
          <span className="text-xs text-amber-400">Draws</span>
          <p className="text-xl font-bold text-amber-400 mt-1">{draws}</p>
        </div>
      </div>

      {/* Battle Table */}
      <div className="rounded-2xl bg-[#141622] border border-[#232738] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16">
            <Loader message="Loading battle history..." />
          </div>
        ) : battles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232738] bg-[#171A26] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Outcome</th>
                  <th className="py-3.5 px-4">Problem</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Opponent</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232738]/50 text-xs">
                {battles.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1A1D2B]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                          b.outcome === 'Victory'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : b.outcome === 'Defeat'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {b.outcome === 'Victory' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {b.outcome === 'Defeat' && <XCircle className="w-3.5 h-3.5" />}
                        <span>{b.outcome}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {b.problem?.title || 'Unknown Problem'}
                    </td>

                    <td className="py-3.5 px-4">
                      <DifficultyBadge difficulty={b.difficulty} />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={
                            b.opponent?.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${b.opponent?.username || 'opp'}`
                          }
                          alt={b.opponent?.name}
                          className="w-6 h-6 rounded-md bg-[#0F1118] border border-[#232738]"
                        />
                        <span className="text-gray-300 font-medium">
                          {b.opponent?.name || 'Guest'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 font-mono">
                      {Math.floor(b.duration / 60)} mins
                    </td>

                    <td className="py-3.5 px-4 text-right text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Swords className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-400 font-semibold">No battles yet</p>
            <p className="text-xs text-gray-500">
              Create your first 1v1 battle room and invite a friend!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

