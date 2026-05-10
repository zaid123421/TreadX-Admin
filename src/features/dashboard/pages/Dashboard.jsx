import React from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardView } from '../components/DashboardView';

const Dashboard = () => {
  const { user } = useAuth();
  const vm = useDashboard();
  return <DashboardView user={user} vm={vm} />;
};

export default Dashboard;
