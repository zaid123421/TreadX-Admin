import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { publicRoutes, protectedRoutes } from './config/routes';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {publicRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.element />} />
            ))}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              {protectedRoutes
                .filter((r) => r.element)
                .map((route) =>
                  route.index ? (
                    <Route key="index" index element={<route.element />} />
                  ) : (
                    <Route key={route.path} path={route.path} element={<route.element />} />
                  )
                )}
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
