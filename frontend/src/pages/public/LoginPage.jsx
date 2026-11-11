import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, ShieldCheck, User } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-gray-400">Sign in to resume your coding battles and practice</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Quick 1-Click Demo Buttons for Evaluation & Demo */}
      <div className="pt-2 border-t border-[#232738] space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 text-center uppercase tracking-wider">
          Capstone Demo Quick Login
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillQuickCredentials('student1@skillbattle.com', 'Student@123')}
            className="p-2 rounded-xl bg-[#1A1D2B] hover:bg-[#232738] border border-[#2A2E42] text-[11px] font-medium text-gray-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Student (Devon)</span>
          </button>

          <button
            type="button"
            onClick={() => fillQuickCredentials('admin@skillbattle.com', 'Admin@123')}
            className="p-2 rounded-xl bg-[#1A1D2B] hover:bg-[#232738] border border-[#2A2E42] text-[11px] font-medium text-purple-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin (Alex)</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
          Create Account
        </Link>
      </div>
    </div>
  );
};

