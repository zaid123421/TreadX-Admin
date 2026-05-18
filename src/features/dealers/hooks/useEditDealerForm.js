import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dealersService } from '../services/dealersApiService';

export function useEditDealerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDealer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDealer = async () => {
    try {
      setLoading(true);
      const dealer = await dealersService.getDealer(id);
      setFormData(dealer);
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
      await dealersService.updateDealer(id, formData);
      navigate(`/dealers/${id}`, {
        state: {
          message: 'Dealer updated successfully!',
          type: 'success',
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to update dealer');
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
