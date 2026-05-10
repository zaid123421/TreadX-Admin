import React from 'react';
import LeadDetailView from '../components/LeadDetailView';
import { useLeadDetail } from '../hooks/useLeadDetail';

const LeadDetail = () => {
  const vm = useLeadDetail();
  return <LeadDetailView vm={vm} />;
};

export default LeadDetail;
