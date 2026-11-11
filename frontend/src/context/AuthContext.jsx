import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skill_battle_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skill_battle_token'));
  const [loading, setLoading] = useState(true);

  // Sync user state with backend session on mount
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('skill_battle_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('skill_battle_token', res.token);
      localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, username, email, password) => {
    const res = await authService.register({ name, username, email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('skill_battle_token', res.token);
      localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('skill_battle_token');
    localStorage.removeItem('skill_battle_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success) {
      setUser(prev => ({ ...prev, ...res.user }));
      localStorage.setItem('skill_battle_user', JSON.stringify({ ...user, ...res.user }));
    }
    return res;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

