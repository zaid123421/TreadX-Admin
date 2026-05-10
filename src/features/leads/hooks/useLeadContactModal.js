import { useState } from 'react';
import { defaultInitiateContactRequest } from '@/features/leads/types/leadDefaults';
import { leadsService } from '../services/leadsApiService';

export function useLeadContactModal({ lead, onSuccess, onClose }) {
  const [formData, setFormData] = useState({ ...defaultInitiateContactRequest });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedLead = await leadsService.initiateContact(lead.id, formData);
      onSuccess(updatedLead);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    error,
    onClose,
  };
}
