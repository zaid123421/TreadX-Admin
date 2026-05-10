import { useState, useEffect } from 'react';
import { subscriptionsService } from '../services/subscriptionsApiService';

export function useSubscriptionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dealerId, setDealerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionsService.getSubscriptions({
        page: 0,
        size: 20,
        sortBy: 'createdAt',
        direction: 'desc',
      });
      setItems(data.content || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleCreate = async () => {
    try {
      const payload = {
        dealerId: Number(dealerId),
        planId: Number(planId),
        amountPaid: Number(amountPaid),
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        autoRenew: true,
      };
      await subscriptionsService.createSubscription(payload);
      setDealerId('');
      setPlanId('');
      setAmountPaid('');
      await loadSubscriptions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async () => {
    if (!subscriptionId) return;
    try {
      await subscriptionsService.cancelSubscription(subscriptionId, cancelReason);
      setSubscriptionId('');
      setCancelReason('');
      await loadSubscriptions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await subscriptionsService.deleteSubscription(id);
      await loadSubscriptions();
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    items,
    loading,
    error,
    dealerId,
    setDealerId,
    planId,
    setPlanId,
    amountPaid,
    setAmountPaid,
    subscriptionId,
    setSubscriptionId,
    cancelReason,
    setCancelReason,
    handleCreate,
    handleCancel,
    handleDelete,
  };
}
