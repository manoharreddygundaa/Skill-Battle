import React from 'react';

export const DifficultyBadge = ({ difficulty, size = 'sm' }) => {
  const styles = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const colorClass = styles[difficulty] || styles.Easy;
  const sizeClass = sizes[size] || sizes.sm;

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        difficulty === 'Easy' ? 'bg-emerald-400' : difficulty === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
      }`} />
      {difficulty}
    </span>
  );
};

