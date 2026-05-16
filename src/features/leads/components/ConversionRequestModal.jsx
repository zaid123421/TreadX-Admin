import React from 'react';
import { ConversionRequestModalView } from './ConversionRequestModalView';
import { conversionRequestsService } from '@/features/conversion-requests/services/conversionRequestsApiService';

export default function ConversionRequestModal({ lead, onClose, onSuccess }) {
  const [requestNotes, setRequestNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async () => {
    if (!requestNotes.trim()) {
      setError('Request notes are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await conversionRequestsService.createConversionRequestForLead(lead.id, requestNotes);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create conversion request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConversionRequestModalView
      lead={lead}
      requestNotes={requestNotes}
      setRequestNotes={setRequestNotes}
      isSubmitting={isSubmitting}
      error={error}
      handleSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
