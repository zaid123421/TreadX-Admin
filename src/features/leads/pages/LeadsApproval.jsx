import React from 'react';
import { useLeadsApproval } from '../hooks/useLeadsApproval';
import { LeadsApprovalView } from '../components/LeadsApprovalView';

const LeadsApproval = () => {
  const vm = useLeadsApproval();
  return <LeadsApprovalView {...vm} />;
};

export default LeadsApproval;
