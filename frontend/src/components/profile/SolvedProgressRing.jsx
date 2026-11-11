import React from 'react';

export const SolvedProgressRing = ({ stats }) => {
  const {
    totalSolved = 0,
    totalProblems = 0,
    solvedEasy = 0,
    totalEasy = 0,
    solvedMedium = 0,
    totalMedium = 0,
    solvedHard = 0,
    totalHard = 0
  } = stats || {};

  const percentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Circular Progress */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-32 h-32 -rotate-90">
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#1C2030"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress Stroke */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#8B5CF6"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-white leading-none">{totalSolved}</span>
          <span className="text-[11px] text-gray-400 mt-0.5">/ {totalProblems} Solved</span>
          <span className="text-[10px] text-purple-400 font-semibold mt-0.5">{percentage}%</span>
        </div>
      </div>

      {/* Difficulty Breakdown Bars */}
      <div className="flex-1 w-full space-y-3.5">
        {/* Easy */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-emerald-400">Easy</span>
            <span className="text-gray-300">
              {solvedEasy} <span className="text-gray-500 font-normal">/ {totalEasy}</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1C2030] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${totalEasy > 0 ? (solvedEasy / totalEasy) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Medium */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-amber-400">Medium</span>
            <span className="text-gray-300">
              {solvedMedium} <span className="text-gray-500 font-normal">/ {totalMedium}</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1C2030] overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${totalMedium > 0 ? (solvedMedium / totalMedium) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Hard */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-rose-400">Hard</span>
            <span className="text-gray-300">
              {solvedHard} <span className="text-gray-500 font-normal">/ {totalHard}</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1C2030] overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${totalHard > 0 ? (solvedHard / totalHard) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

