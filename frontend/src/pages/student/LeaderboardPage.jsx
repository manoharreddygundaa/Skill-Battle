import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { battleService } from '../../services/battleService';
import { Loader } from '../../components/common/Loader';
import { Trophy, Medal, Swords, Flame, Crown, ArrowRight } from 'lucide-react';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await battleService.getLeaderboard();
        if (res.success) {
          setLeaderboard(res.leaderboard);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <Loader message="Loading battle leaderboard..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5 text-purple-400" />
          <span>Global Arena Rankings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Battle Leaderboard</h1>
        <p className="text-xs text-gray-400">
          Top competitive programmers ranked by 1v1 battle victories and rating points.
        </p>
      </div>

      {/* Leaderboard Table Card */}
      <div className="rounded-2xl bg-[#141622] border border-[#232738] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232738] bg-[#171A26] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4 text-center">Battle Wins</th>
                <th className="py-3.5 px-4 text-center">Win Rate</th>
                <th className="py-3.5 px-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232738]/50 text-xs">
              {leaderboard.map((u, idx) => {
                const rank = idx + 1;
                return (
                  <tr
                    key={u._id}
                    className="hover:bg-[#1A1D2B]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold">
                      {rank === 1 ? (
                        <span className="text-amber-400 font-black text-sm flex items-center justify-center">
                          <Crown className="w-4 h-4 mr-0.5" /> 1
                        </span>
                      ) : rank === 2 ? (
                        <span className="text-gray-300 font-bold text-sm">2</span>
                      ) : rank === 3 ? (
                        <span className="text-amber-600 font-bold text-sm">3</span>
                      ) : (
                        <span className="text-gray-500 font-mono">{rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/profile/${u.username}`}
                        className="flex items-center space-x-3 group"
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg bg-[#0F1118] border border-[#232738] object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-gray-500">@{u.username}</p>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-white font-mono">
                      {u.battleStats?.wins || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center text-purple-400 font-semibold font-mono">
                      {u.battleStats?.winRate || 0}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-amber-400 font-mono">
                      {u.rating} ELO
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

