import React from 'react';
import { useLeadsList } from '../hooks/useLeadsList';
import { LeadsListView } from '../components/LeadsListView';

const LeadsList = () => {
  const vm = useLeadsList();
  return <LeadsListView {...vm} />;
};

export default LeadsList;
