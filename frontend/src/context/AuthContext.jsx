import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skill_battle_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('skill_battle_token'));
  const [loading, setLoading] = useState(true);
  const [authInProgress, setAuthInProgress] = useState(false);

  // Complete cleanup helper
  const purgeClientSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('skill_battle_token');
    localStorage.removeItem('skill_battle_user');
    sessionStorage.clear();
  }, []);

  // Sync user state with backend session on mount & verify token authenticity
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem('skill_battle_token');

      // Attempt to verify via /auth/me (works with either Bearer token or HttpOnly cookie)
      try {
        const res = await authService.getMe();
        if (isMounted) {
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
          } else {
            purgeClientSession();
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[Auth] Session validation failed:', err.response?.data?.message || err.message);
          purgeClientSession();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    // Prevent back-button traversal access from browser bfcache
    const handlePageShow = (event) => {
      if (event.persisted && !localStorage.getItem('skill_battle_token')) {
        purgeClientSession();
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      isMounted = false;
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [purgeClientSession]);

  const login = async (email, password) => {
    if (authInProgress) {
      throw new Error('Authentication already in progress. Please wait.');
    }

    try {
      setAuthInProgress(true);
      const res = await authService.login({ email, password });
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('skill_battle_token', res.token);
        localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setAuthInProgress(false);
    }
  };

  const register = async (name, username, email, password) => {
    if (authInProgress) {
      throw new Error('Registration already in progress. Please wait.');
    }

    try {
      setAuthInProgress(true);
      const res = await authService.register({ name, username, email, password });
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('skill_battle_token', res.token);
        localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setAuthInProgress(false);
    }
  };

  const logout = async () => {
    try {
      // Invalidate session on backend (revokes token & clears HttpOnly cookie)
      await authService.logout();
    } catch (err) {
      console.warn('[Auth] Remote logout notification failed:', err);
    } finally {
      purgeClientSession();
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('skill_battle_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('[Auth] Failed to refresh user profile:', err);
    }
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success && res.user) {
      setUser((prev) => {
        const updated = { ...prev, ...res.user };
        localStorage.setItem('skill_battle_user', JSON.stringify(updated));
        return updated;
      });
    }
    return res;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !user.isSuspended,
    isAdmin: !!user && user.role === 'admin' && !user.isSuspended,
    login,
    register,
    logout,
    refreshUser,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
