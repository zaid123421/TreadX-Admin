import { useState, useEffect } from 'react';
import { dealersService } from '../services/dealersApiService';
import { subscriptionsService } from '@/features/subscriptions/services/subscriptionsApiService';
import { subscriptionPlansService } from '@/features/subscriptions/services/subscriptionPlansApiService';

export function useDealersList() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 💡 حالة التحميل الأولية للموقع
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // 💡 قيمة البحث بعد التأخير
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  // 💡 تأثير الـ Debounce: انتظر 400 ملي ثانية بعد توقف المستخدم عن الكتابة لتحديث القيمة
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(0); // إعادة الترقيم للصفحة الأولى عند تغير نص البحث
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 💡 جلب البيانات عند تغير الصفحة، الفلتر، أو القيمة المفلترة للبحث
  useEffect(() => {
    loadDealers();
  }, [currentPage, statusFilter, debouncedSearchQuery]);

  useEffect(() => {
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

  const loadDealers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        size: pageSize,
      };

      let response;
      if (debouncedSearchQuery) {
        response = await dealersService.searchDealers(debouncedSearchQuery, {
          ...params,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
      } else if (statusFilter !== 'all') {
        response = await dealersService.getDealersByStatus(statusFilter, params);
      } else {
        response = await dealersService.getDealers(params);
      }

      setDealers(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error('Error loading dealers:', err);
      setError(err);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleEditSubscription = async (id, data) => {
    // Errors are surfaced inside SubscriptionEditModal — do not set list-level error
    await subscriptionsService.updateSubscription(id, data);
    await loadDealers();
  };

  return {
    dealers,
    loading,
    isInitialLoading, // 💡 تمرير الحالة الجديدة للواجهة
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    loadDealers,
    handleStatusFilterChange,
    handleEditSubscription,
    subscriptionPlans,
  };
}