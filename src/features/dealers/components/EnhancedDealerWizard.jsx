import React from 'react';
import { useEnhancedDealerWizard } from '../hooks/useEnhancedDealerWizard';
import { EnhancedDealerWizardView } from './EnhancedDealerWizardView';

const EnhancedDealerWizard = ({ onClose, onSuccess }) => {
  const vm = useEnhancedDealerWizard({ onClose, onSuccess });
  return <EnhancedDealerWizardView {...vm} />;
};

export default EnhancedDealerWizard;
