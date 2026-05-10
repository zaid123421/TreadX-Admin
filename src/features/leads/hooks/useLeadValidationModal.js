import { useState } from 'react';
import { LeadStatus } from '@/shared/types/enums';
import { leadsService } from '../services/leadsApiService';

export function useLeadValidationModal({ lead, onSuccess, onClose }) {
  const [validationStatus, setValidationStatus] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleValidate = async (status) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const validationData = {
        status,
        notes: notes.trim() || undefined,
      };

      const updatedLead = await leadsService.validateLead(lead.id, validationData);
      onSuccess(updatedLead);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = () => {
    setValidationStatus(LeadStatus.APPROVED);
  };

  const handleDeny = () => {
    setValidationStatus(LeadStatus.DENIED);
  };

  const handleConfirm = () => {
    if (validationStatus) {
      handleValidate(validationStatus);
    }
  };

  return {
    validationStatus,
    setValidationStatus,
    notes,
    setNotes,
    isSubmitting,
    error,
    handleApprove,
    handleDeny,
    handleConfirm,
    onClose,
  };
}
