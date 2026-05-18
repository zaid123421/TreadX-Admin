import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { dealersService } from '../services/dealersApiService';
import { subscriptionsService } from '@/features/subscriptions/services/subscriptionsApiService';

export function useDealerDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);

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

      // Fetch active subscription
      try {
        
        const subscriptionData = await subscriptionsService.getActiveSubscriptionByDealer(id);
        console.log("بيانات الاشتراك القادمة من السيرفر:", subscriptionData);
        setActiveSubscription(subscriptionData);
        
      } catch (subErr) {
        // If no active subscription, that's okay
        console.error("خطأ في جلب الاشتراك الفعلي:", subErr);
        setActiveSubscription(null);
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
  };
}
