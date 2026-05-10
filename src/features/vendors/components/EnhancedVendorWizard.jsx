import React from 'react';
import { useEnhancedVendorWizard } from '../hooks/useEnhancedVendorWizard';
import { EnhancedVendorWizardView } from './EnhancedVendorWizardView';

const EnhancedVendorWizard = ({ onClose, onSuccess }) => {
  const vm = useEnhancedVendorWizard({ onClose, onSuccess });
  return <EnhancedVendorWizardView {...vm} />;
};

export default EnhancedVendorWizard;
