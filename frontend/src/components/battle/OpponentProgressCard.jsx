import React from 'react';
import { Swords, Code, CheckCircle, Zap } from 'lucide-react';

export const OpponentProgressCard = ({ opponent, progress }) => {
  const {
    testCasesPassed = 0,
    totalTestCases = 1,
    status = 'coding'
  } = progress || {};

  const percentage = totalTestCases > 0 ? Math.min(100, Math.round((testCasesPassed / totalTestCases) * 100)) : 0;

  const getStatusLabel = () => {
    switch (status) {
      case 'solved':
        return { text: 'Solved All Test Cases!', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'submitted_partial':
        return { text: `Passed ${testCasesPassed}/${totalTestCases} Tests`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'testing':
        return { text: 'Running Tests...', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      default:
        return { text: 'Writing Solution...', color: 'text-gray-400 bg-[#1A1D2B] border-[#2A2E42]' };
    }
  };

  const statusInfo = getStatusLabel();

  return (
    <div className="p-3.5 rounded-2xl bg-[#141622] border border-[#232738] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img
            src={opponent?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent?.username || 'opp'}`}
            alt={opponent?.name}
            className="w-8 h-8 rounded-lg bg-[#161924] border border-[#232738] object-cover"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {opponent?.name || 'Opponent'}
              </span>
              <span className="text-[10px] text-gray-500">(@{opponent?.username})</span>
            </div>
            <span className="text-[10px] text-purple-400 font-semibold">
              {opponent?.rating || 1200} ELO
            </span>
          </div>
        </div>

        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Opponent Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>Opponent Test Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#1A1D2B] overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === 'solved' ? 'bg-emerald-500' : 'bg-purple-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

