import React from 'react';
import { useReports } from '../hooks/useReports';
import { ReportsView } from '../components/ReportsView';

const ReportsPage = () => {
  const reports = useReports();
  return <ReportsView {...reports} />;
};

export default ReportsPage;
