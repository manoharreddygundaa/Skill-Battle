import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Clock, Cpu, Award, ArrowRight, X } from 'lucide-react';

export const SubmissionModal = ({ isOpen, onClose, submission, onNextProblem }) => {
  useEffect(() => {
    if (isOpen && submission?.status === 'Accepted') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, submission]);

  if (!isOpen || !submission) return null;

  const isAccepted = submission.status === 'Accepted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#161924] border border-[#2A2E42] shadow-2xl p-6 overflow-hidden">
        {/* Glow Header */}
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${
            isAccepted ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#232738] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="relative z-10 space-y-5">
          {/* Status Header */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isAccepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isAccepted ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
            </div>
            <div>
              <h3
                className={`text-2xl font-bold ${
                  isAccepted ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {submission.status}
              </h3>
              <p className="text-xs text-gray-400">
                {isAccepted
                  ? 'All test cases passed successfully!'
                  : `${submission.testCasesPassed} of ${submission.totalTestCases} test cases passed.`}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#10121A] border border-[#232738]">
              <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Runtime</span>
              </div>
              <p className="text-lg font-bold text-white font-mono">
                {submission.executionTime} <span className="text-xs text-gray-400 font-sans">ms</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#10121A] border border-[#232738]">
              <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Memory</span>
              </div>
              <p className="text-lg font-bold text-white font-mono">
                {submission.memory ? Math.round(submission.memory / 1024) : 14}{' '}
                <span className="text-xs text-gray-400 font-sans">MB</span>
              </p>
            </div>
          </div>

          {/* Test cases progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-400">Test Cases Progress</span>
              <span className={isAccepted ? 'text-emerald-400' : 'text-amber-400'}>
                {submission.testCasesPassed} / {submission.totalTestCases} passed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#10121A] overflow-hidden border border-[#232738]">
              <div
                className={`h-full transition-all duration-500 ${
                  isAccepted ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{
                  width: `${(submission.testCasesPassed / submission.totalTestCases) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Awarded Badges Notice (if any) */}
          {submission.awardedBadges && submission.awardedBadges.length > 0 && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center space-x-3">
              <Award className="w-6 h-6 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-300">Badge Unlocked!</p>
                <p className="text-xs text-gray-300">
                  {submission.awardedBadges.map(b => b.name).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#232738] transition-colors"
            >
              Close
            </button>
            {onNextProblem && (
              <button
                onClick={onNextProblem}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors flex items-center space-x-1.5 shadow-md shadow-purple-900/30"
              >
                <span>Next Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

