import { useState, useEffect } from 'react';
import { vendorsService } from '../services/vendorsApiService';
import { subscriptionsService } from '@/features/subscriptions/services/subscriptionsApiService';
import { subscriptionPlansService } from '@/features/subscriptions/services/subscriptionPlansApiService';

export function useVendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    loadVendors();
    loadSubscriptionPlans();
  }, [currentPage, statusFilter]);

  const loadSubscriptionPlans = async () => {
    try {
      const data = await subscriptionPlansService.getAllSubscriptionPlans();
      const plans = Array.isArray(data) ? data : data?.content || [];
      setSubscriptionPlans(plans);
    } catch (err) {
      console.error('Failed to load subscription plans:', err);
    }
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        size: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter || undefined,
        search: searchQuery || undefined,
      };

      const response = await vendorsService.getVendors(params);
      setVendors(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadVendors();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleEditSubscription = async (id, data) => {
    try {
      await subscriptionsService.updateSubscription(id, data);
      await loadVendors();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    vendors,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    loadVendors,
    handleSearch,
    handleStatusFilterChange,
    handleEditSubscription,
    subscriptionPlans,
  };
}
