import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthForm from './pages/AuthForm';
import AdminSetup from './pages/AdminSetup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import LessonView from './pages/LessonView';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import LearningPathPage from './pages/LearningPathPage';
import AddContentPage from './pages/AddContentPage';
import AssessmentPage from './pages/AssessmentPage';
import SkillTreePage from './pages/SkillTreePage';
import CertificatePage from './pages/CertificatePage';
import LeaderboardPage from './pages/LeaderboardPage';
import GamificationProvider from './context/GamificationContext';
// New Feature Imports
import GoalsPage from './pages/GoalsPage';
import ForumPage from './pages/ForumPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MessagesPage from './pages/MessagesPage';
import ChatBot from './components/ChatBot';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-t-indigo-500 rounded-full animate-spin' style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}></div>
          <div className='text-xl text-gray-300'>Loading...</div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to='/auth' replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-t-indigo-500 rounded-full animate-spin' style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}></div>
          <div className='text-xl text-gray-300'>Loading...</div>
        </div>
      </div>
    );
  }

  return user && user.role === 'admin' ? children : <Navigate to='/dashboard' replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-t-indigo-500 rounded-full animate-spin' style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}></div>
          <div className='text-xl text-gray-300'>Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect logged-in users to their appropriate dashboard
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Show navbar on landing page too, but not on auth/setup pages
  const showNavbar = user && location.pathname !== '/auth' && location.pathname !== '/setup';

  return (
    <div
      className='flex flex-col min-h-screen'
      style={{ background: user && location.pathname !== '/' ? 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' : '#0a0e1a' }}
    >
      {showNavbar && <NavBar />}
      <main className='flex-1'>
        <Routes>
          {/* Public Landing Page - shows to non-logged-in users, logged-in users redirected to dashboard */}
          <Route path='/' element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
            ) : (
              <LandingPage />
            )
          } />

          <Route path='/setup' element={
            <PublicRoute>
              <AdminSetup />
            </PublicRoute>
          } />
          <Route path='/auth' element={
            <PublicRoute>
              <AuthForm />
            </PublicRoute>
          } />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />}
            </ProtectedRoute>
          } />
          <Route path='/admin/dashboard' element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path='/admin/users' element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          } />
          <Route path='/learn/:id' element={
            <ProtectedRoute>
              <LessonView />
            </ProtectedRoute>
          } />
          <Route path='/progress' element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path='/learning-path' element={
            <ProtectedRoute>
              <LearningPathPage />
            </ProtectedRoute>
          } />
          <Route path='/add-content' element={
            <ProtectedRoute>
              <AddContentPage />
            </ProtectedRoute>
          } />

          {/* New Feature Routes */}
          <Route path='/assessment' element={
            <ProtectedRoute>
              <AssessmentPage />
            </ProtectedRoute>
          } />
          <Route path='/skill-tree' element={
            <ProtectedRoute>
              <SkillTreePage />
            </ProtectedRoute>
          } />
          <Route path='/certificates' element={
            <ProtectedRoute>
              <CertificatePage />
            </ProtectedRoute>
          } />
          <Route path='/leaderboard' element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } />

          {/* New Feature Routes */}
          <Route path='/goals' element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          } />
          <Route path='/forum' element={
            <ProtectedRoute>
              <ForumPage />
            </ProtectedRoute>
          } />
          <Route path='/analytics' element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path='/messages' element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
      {user && location.pathname !== '/' && <Footer />}
      {user && <ChatBot />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <GamificationProvider>
        <AppContent />
      </GamificationProvider>
    </Router>
  );
};

export default App;
