import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending and receiving HttpOnly cookies across origins
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token as fallback Bearer header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skill_battle_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiry & unauthenticated handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear client state on 401
      const hadToken = !!localStorage.getItem('skill_battle_token');
      localStorage.removeItem('skill_battle_token');
      localStorage.removeItem('skill_battle_user');
      sessionStorage.clear();

      const publicPaths = ['/login', '/register', '/'];
      const currentPath = window.location.pathname;

      if (hadToken && !publicPaths.some(p => currentPath === p || (p !== '/' && currentPath.startsWith(p)))) {
        console.warn('[Session] Session terminated or expired. Redirecting to login.');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
