import React from 'react';
import { CheckCircle2, Clock, CircleDot } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (status === 'solved') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        Solved
      </span>
    );
  }

  if (status === 'attempted') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
        <Clock className="w-3.5 h-3.5 mr-1" />
        Attempted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-800/40 px-2 py-0.5 rounded-full border border-gray-700/40">
      <CircleDot className="w-3 h-3 mr-1 opacity-50" />
      Unsolved
    </span>
  );
};

