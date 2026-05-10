import { useState, useMemo } from 'react';
import { useAuth } from '@/app/providers/AuthContext';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, isAuthenticated, clearError, user } = useAuth();

  const redirectPath = useMemo(() => {
    if (!isAuthenticated) return null;
    if (user?.roleName === 'SYSTEM_ADMIN' || user?.roleName === 'SALES_MANAGER') return '/';
    if (user?.roleName === 'SALES_AGENT') return '/leads';
    return '/leads';
  }, [isAuthenticated, user?.roleName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return;
    await login(email, password);
  };

  const demoCredentials = [
    { roleKey: 'demoAdmin', email: 'admin@treadx.com', password: 'admin123' },
    { roleKey: 'demoManager', email: 'manager@treadx.com', password: 'manager123' },
    { roleKey: 'demoSales', email: 'sales@treadx.com', password: 'sales123' },
  ];

  const fillDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    redirectPath,
    handleSubmit,
    demoCredentials,
    fillDemoCredentials,
  };
}
