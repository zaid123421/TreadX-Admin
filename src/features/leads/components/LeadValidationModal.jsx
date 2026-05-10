import React from 'react';
import { useLeadValidationModal } from '../hooks/useLeadValidationModal';
import { LeadValidationModalView } from './LeadValidationModalView';

const LeadValidationModal = ({ lead, onClose, onSuccess }) => {
  const vm = useLeadValidationModal({ lead, onClose, onSuccess });
  return <LeadValidationModalView lead={lead} {...vm} />;
};

export default LeadValidationModal;
