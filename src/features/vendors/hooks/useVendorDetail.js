import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { vendorsService } from '../services/vendorsApiService';
import { subscriptionsService } from '@/features/subscriptions/services/subscriptionsApiService';

export function useVendorDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);

  useEffect(() => {
    loadVendor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorData = await vendorsService.getVendor(id);
      setVendor(vendorData);

      // Fetch active subscription
      try {
        const subscriptionData = await subscriptionsService.getActiveSubscriptionByDealer(id);
        setActiveSubscription(subscriptionData);
      } catch (subErr) {
        // If no active subscription, that's okay
        setActiveSubscription(null);
      }
    } catch (err) {
      console.error('Error loading vendor:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this dealer?')) return;
    try {
      await vendorsService.deleteVendor(id);
      navigate('/vendors');
    } catch (err) {
      setError(err);
    }
  };

  return {
    user,
    id,
    navigate,
    vendor,
    loading,
    error,
    loadVendor,
    handleDelete,
    activeSubscription,
  };
}
