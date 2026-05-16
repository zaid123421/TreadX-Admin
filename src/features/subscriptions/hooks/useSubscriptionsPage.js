import { useState, useEffect } from 'react';
import { subscriptionsService } from '../services/subscriptionsApiService';
import { subscriptionPlansService } from '../services/subscriptionPlansApiService';

export function useSubscriptionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

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
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      const data = await subscriptionPlansService.getAllSubscriptionPlans();
      const plans = Array.isArray(data) ? data : data?.content || [];
      setSubscriptionPlans(plans);
    } catch (err) {
      console.error('Failed to load subscription plans:', err);
    }
  };

  // Creation of subscriptions is disabled via UI. Use API or admin tools if needed.

  // Cancel a subscription by id with an optional reason.
  const handleCancel = async (id, reason = '') => {
    if (!id) return;
    try {
      await subscriptionsService.cancelSubscription(id, reason);
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

  const handleEdit = async (id, data) => {
    try {
      await subscriptionsService.updateSubscription(id, data);
      await loadSubscriptions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    subscriptionId,
    setSubscriptionId,
    handleCancel,
    handleDelete,
    handleEdit,
    subscriptionPlans,
  };
}
