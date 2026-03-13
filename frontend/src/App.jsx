import React, { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import useAuth from './hooks/useAuth';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Updates = lazy(() => import('./pages/Updates.jsx'));
const Upload = lazy(() => import('./pages/Upload.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-space text-white">
    <div className="h-12 w-12 animate-spin rounded-full border-2 border-aqua border-t-transparent" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  if (authLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

const App = () => {
  const location = useLocation();

  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <Suspense fallback={<LoadingScreen />}>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="updates" element={<Updates />} />
                  <Route path="upload" element={<Upload />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
