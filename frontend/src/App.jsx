import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Loader } from './components/common/Loader';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Student Pages
import { DashboardPage } from './pages/student/DashboardPage';
import { ProblemsPage } from './pages/student/ProblemsPage';
import { ProblemWorkspacePage } from './pages/student/ProblemWorkspacePage';
import { DailyChallengePage } from './pages/student/DailyChallengePage';
import { CreateBattlePage } from './pages/student/CreateBattlePage';
import { JoinBattlePage } from './pages/student/JoinBattlePage';
import { ActiveBattlePage } from './pages/student/ActiveBattlePage';
import { BattleHistoryPage } from './pages/student/BattleHistoryPage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProblemsPage } from './pages/admin/AdminProblemsPage';
import { AdminProblemEditorPage } from './pages/admin/AdminProblemEditorPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDailyChallengePage } from './pages/admin/AdminDailyChallengePage';

// Protected Route Wrapper for Students & Admins
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying session..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying admin credentials..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Student Platform (Inside MainLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:slug" element={<ProblemWorkspacePage />} />
        <Route path="/daily-challenge" element={<DailyChallengePage />} />

        {/* 1v1 Battle Arena */}
        <Route path="/battle" element={<Navigate to="/battle/create" replace />} />
        <Route path="/battle/create" element={<CreateBattlePage />} />
        <Route path="/battle/join" element={<JoinBattlePage />} />
        <Route path="/battle/:roomCode" element={<ActiveBattlePage />} />
        <Route path="/battle/history" element={<BattleHistoryPage />} />

        {/* Leaderboard & Profile */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <AdminRoute>
              <AdminProblemsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems/create"
          element={
            <AdminRoute>
              <AdminProblemEditorPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems/edit/:id"
          element={
            <AdminRoute>
              <AdminProblemEditorPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/daily-challenge"
          element={
            <AdminRoute>
              <AdminDailyChallengePage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

