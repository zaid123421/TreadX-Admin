import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { dealersService } from '../services/dealersApiService';
import { subscriptionsService } from '@/features/subscriptions/services/subscriptionsApiService';
import { normalizeDealerQuota } from '../utils/dealerUtils';

export function useDealerDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [primaryWarehouse, setPrimaryWarehouse] = useState(null);
  const [quota, setQuota] = useState(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [quotaError, setQuotaError] = useState(null);

  useEffect(() => {
    loadDealer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDealer = async () => {
    try {
      setLoading(true);
      setError(null);
      const dealerData = await dealersService.getDealer(id);
      setDealer(dealerData);

      try {
        const subscriptionData = await subscriptionsService.getActiveSubscriptionByDealer(id);
        setActiveSubscription(subscriptionData);
      } catch (subErr) {
        console.error('Error loading subscription:', subErr);
        setActiveSubscription(null);
      }

      try {
        const warehouseRouting = await dealersService.getPrimaryWarehouse(id);
        setPrimaryWarehouse(warehouseRouting);
      } catch (whErr) {
        console.error('Error loading primary warehouse:', whErr);
        setPrimaryWarehouse(null);
      }

      setQuotaLoading(true);
      setQuotaError(null);
      try {
        const quotaData = await dealersService.getDealerQuota(id);
        setQuota(normalizeDealerQuota(quotaData));
      } catch (quotaErr) {
        console.error('Error loading dealer quota:', quotaErr);
        setQuota(null);
        setQuotaError(quotaErr.message || 'Failed to load storage quota');
      } finally {
        setQuotaLoading(false);
      }
    } catch (err) {
      console.error('Error loading dealer:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this dealer?')) return;
    try {
      await dealersService.deleteDealer(id);
      navigate('/dealers');
    } catch (err) {
      setError(err);
    }
  };

  const loadPrimaryWarehouse = async () => {
    try {
      const warehouseRouting = await dealersService.getPrimaryWarehouse(id);
      setPrimaryWarehouse(warehouseRouting);
      return warehouseRouting;
    } catch (err) {
      console.error('Error loading primary warehouse:', err);
      setPrimaryWarehouse(null);
      throw err;
    }
  };

  const handleSetPrimaryWarehouse = async (warehouseId) => {
    const result = await dealersService.setPrimaryWarehouse(id, warehouseId);
    setPrimaryWarehouse(result);
    return result;
  };

  const handleDeletePrimaryWarehouse = async () => {
    await dealersService.deletePrimaryWarehouse(id);
    setPrimaryWarehouse(null);
  };

  return {
    user,
    id,
    navigate,
    dealer,
    loading,
    error,
    loadDealer,
    handleDelete,
    activeSubscription,
    primaryWarehouse,
    loadPrimaryWarehouse,
    handleSetPrimaryWarehouse,
    handleDeletePrimaryWarehouse,
    quota,
    quotaLoading,
    quotaError,
  };
}
