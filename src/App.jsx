import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthContext';
import { ProtectedRoute } from './features/auth';
import AppLayout from './app/layout/AppLayout';
import ErrorBoundary from './app/components/ErrorBoundary';
import { publicRoutes, protectedRoutes } from './app/routes/routes';

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
                    <Route
                      key="index"
                      index
                      element={
                        <ProtectedRoute roles={route.roles || []}>
                          <route.element />
                        </ProtectedRoute>
                      }
                    />
                  ) : (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ProtectedRoute roles={route.roles || []}>
                          <route.element />
                        </ProtectedRoute>
                      }
                    />
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
