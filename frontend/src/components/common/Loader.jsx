import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
        <div className="absolute inset-0 rounded-full blur-sm bg-purple-500/20 -z-10" />
      </div>
      {message && <p className="text-sm text-gray-400 font-medium tracking-wide">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0A0B10]/80 backdrop-blur-md z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
};

