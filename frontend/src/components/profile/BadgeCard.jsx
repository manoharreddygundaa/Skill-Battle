import React from 'react';
import { Award, Target, Trophy, Flame, Zap, Swords, Crown, Sparkles, Lock } from 'lucide-react';

const iconMap = {
  Award,
  Target,
  Trophy,
  Flame,
  Zap,
  Swords,
  Crown,
  Sparkles
};

export const BadgeCard = ({ badge, unlocked = false, unlockedAt }) => {
  const IconComponent = iconMap[badge.icon] || Award;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        unlocked
          ? 'bg-[#161924] border-purple-500/30 shadow-md shadow-purple-950/20'
          : 'bg-[#12141D]/60 border-[#232738] opacity-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            unlocked
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-900/30'
              : 'bg-[#1C2030] text-gray-500'
          }`}
        >
          {unlocked ? <IconComponent className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-white truncate">{badge.name}</h5>
            {unlocked && (
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                Unlocked
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {badge.description}
          </p>
          {unlocked && unlockedAt && (
            <p className="text-[10px] text-gray-500 mt-2">
              Earned {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

