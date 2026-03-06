import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Truck, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, isAuthenticated, clearError, user } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (user?.roleName === 'SALES_MANAGER' || user?.roleName === 'SALES_AGENT') {
      return <Navigate to="/leads" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!email || !password) {
      return;
    }

    await login(email, password);
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@treadx.com', password: 'admin123' },
    { role: 'Manager', email: 'manager@treadx.com', password: 'manager123' },
    { role: 'Sales Rep', email: 'sales@treadx.com', password: 'sales123' }
  ];

  const fillDemoCredentials = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">TreadX</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sales Management System
          </p>
          <p className="text-xs text-gray-500">
            Tire Storage Service for Vendors & Mechanics
          </p>
        </div>

        {/* Login form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the sales management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Demo Credentials:
              </p>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => fillDemoCredentials(cred.email, cred.password)}
                    disabled={loading}
                  >
                    <div className="text-left">
                      <div className="font-medium">{cred.role}</div>
                      <div className="text-xs text-gray-500">{cred.email}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 TreadX. All rights reserved.</p>
          <p className="mt-1">Tire Storage & Sales Management Solution</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

