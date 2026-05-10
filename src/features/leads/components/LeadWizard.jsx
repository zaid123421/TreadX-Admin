import React from 'react';
import { useLeadWizard } from '../hooks/useLeadWizard';
import { LeadWizardForm } from './LeadWizardForm';

const LeadWizard = ({ onClose, onSuccess, initialData = null, isEdit = false }) => {
  const wizard = useLeadWizard({ onClose, onSuccess, initialData, isEdit });
  return <LeadWizardForm {...wizard} />;
};

export default LeadWizard;
