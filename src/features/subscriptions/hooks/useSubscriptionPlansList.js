import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthContext';
import { canManageSubscriptionPlans } from '@/shared/access/roleMatrix';
import { subscriptionPlansService } from '../services/subscriptionPlansApiService';
import { toast } from 'sonner';
import { formatBillingCycleLabel, formatUsdPrice } from '../utils/subscriptionFormatters';

export function useSubscriptionPlansList() {
  const { user } = useAuth();
  const canManagePlans = canManageSubscriptionPlans(user);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const { data: plansData, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-plans', currentPage, pageSize],
    queryFn: () =>
      subscriptionPlansService.getAllSubscriptionPlans({
        page: currentPage,
        size: pageSize,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeletePlan = async (planId) => {
    try {
      await subscriptionPlansService.deleteSubscriptionPlan(planId);
      toast.success('Subscription plan deleted successfully');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to delete subscription plan');
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingPlan(null);
  };

  const onModalOpenChange = (open) => {
    setIsCreateModalOpen(open);
    if (!open) setEditingPlan(null);
  };

  const onFormSuccess = () => {
    closeModal();
    refetch();
  };

  return {
    plansData,
    isLoading,
    error,
    refetch,
    canManagePlans,
    currentPage,
    handlePageChange,
    isCreateModalOpen,
    onModalOpenChange,
    editingPlan,
    setEditingPlan,
    handleDeletePlan,
    handleEditPlan,
    closeModal,
    onFormSuccess,
    formatBillingCycle: formatBillingCycleLabel,
    formatPrice: formatUsdPrice,
  };
}
