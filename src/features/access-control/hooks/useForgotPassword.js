import { useState } from 'react';
import { forgotPassword as forgotPasswordApi } from '../services/accessControlApiService';
import { handleApiError } from '@/shared/services/apiClient';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSuccess(false);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi({ email: trimmed });
      setSuccess(true);
    } catch (err) {
      setError(handleApiError(err, 'Failed to send password reset email'));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    success,
    submit,
  };
}
