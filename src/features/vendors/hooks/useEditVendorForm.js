import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorsService } from '../services/vendorsApiService';

export function useEditVendorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVendor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const vendor = await vendorsService.getVendor(id);
      setFormData(vendor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await vendorsService.updateVendor(id, formData);
      navigate(`/vendors/${id}`, {
        state: {
          message: 'Vendor updated successfully!',
          type: 'success',
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    isSubmitting,
    error,
    handleSubmit,
  };
}
