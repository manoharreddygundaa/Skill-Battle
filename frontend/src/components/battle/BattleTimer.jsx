import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

export const BattleTimer = ({ remainingSeconds }) => {
  const isUrgent = remainingSeconds <= 60;
  const isCritical = remainingSeconds <= 15;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border transition-all ${
        isCritical
          ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-bounce'
          : isUrgent
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
          : 'bg-[#181B28] border-[#2A2E42] text-purple-300'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
      ) : (
        <Timer className="w-4 h-4 text-purple-400 shrink-0" />
      )}
      <span className="font-mono text-base font-bold tracking-wider">{formatted}</span>
    </div>
  );
};

