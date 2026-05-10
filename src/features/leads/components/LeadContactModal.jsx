import React from 'react';
import { useLeadContactModal } from '../hooks/useLeadContactModal';
import { LeadContactModalView } from './LeadContactModalView';

const LeadContactModal = ({ lead, onClose, onSuccess }) => {
  const vm = useLeadContactModal({ lead, onClose, onSuccess });
  return <LeadContactModalView lead={lead} {...vm} />;
};

export default LeadContactModal;
