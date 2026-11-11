import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, AtSign, UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await register(name, username.toLowerCase(), email, password);
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-gray-400">Join the competitive developer platform & 1v1 arena</p>
      </div>

      {/* Avatar Live Preview */}
      <div className="flex justify-center">
        <div className="relative group">
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'newuser'}`}
            alt="Avatar Preview"
            className="w-16 h-16 rounded-2xl bg-[#0F1118] border border-[#232738] p-1 shadow-md"
          />
          <span className="absolute -bottom-1 -right-1 text-[9px] font-bold text-purple-300 bg-purple-600/40 border border-purple-500/50 px-1.5 py-0.5 rounded-full">
            Avatar
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Username</label>
          <div className="relative">
            <AtSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. alex_coder"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@domain.com"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (min 6 characters)"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
};

