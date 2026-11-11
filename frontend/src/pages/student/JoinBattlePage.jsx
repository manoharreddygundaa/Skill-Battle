import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Swords, ArrowRight, Sparkles } from 'lucide-react';

export const JoinBattlePage = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/battle/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in py-12">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40">
          <Swords className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Join Coding Battle</h1>
        <p className="text-xs text-gray-400">
          Enter the room code shared by your friend to enter the battle lobby.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-[#141622] border border-[#232738] shadow-xl space-y-5">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Battle Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. SB-PRO or BTL7X"
              className="w-full text-center font-mono text-xl tracking-widest uppercase p-3 rounded-xl bg-[#0F1118] border border-[#232738] text-purple-300 placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!roomCode.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>Enter Battle Lobby</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-gray-500">
        Want to host a new match instead?{' '}
        <Link to="/battle/create" className="text-purple-400 hover:text-purple-300 font-semibold underline">
          Create Battle Room
        </Link>
      </div>
    </div>
  );
};

