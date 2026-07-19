import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { subscriptionsService } from '../services/subscriptionsApiService';
import { subscriptionPlansService } from '../services/subscriptionPlansApiService';

export function useSubscriptionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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
      const message = err.message || 'Failed to load subscriptions';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
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
      toast.success('Subscription cancelled successfully');
      await loadSubscriptions();
    } catch (err) {
      const message = err.message || 'Failed to cancel subscription';
      setError(message);
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await subscriptionsService.deleteSubscription(id);
      toast.success('Subscription deleted successfully');
      await loadSubscriptions();
    } catch (err) {
      const message = err.message || 'Failed to delete subscription';
      setError(message);
      toast.error(message);
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await subscriptionsService.updateSubscription(id, data);
      toast.success('Subscription updated successfully');
      await loadSubscriptions();
    } catch (err) {
      const message = err.message || 'Failed to update subscription';
      toast.error(message);
      throw err;
    }
  };

  return {
    items,
    loading,
    isInitialLoading,
    error,
    subscriptionId,
    setSubscriptionId,
    handleCancel,
    handleDelete,
    handleEdit,
    subscriptionPlans,
  };
}
