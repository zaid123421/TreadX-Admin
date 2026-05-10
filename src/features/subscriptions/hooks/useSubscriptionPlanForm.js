import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { subscriptionPlansService } from '../services/subscriptionPlansApiService';
import { BillingCycle } from '@/shared/types/enums';
import { defaultSubscriptionPlanRequest } from '@/features/subscriptions/types/subscriptionDefaults';
import { toast } from 'sonner';

const subscriptionPlanSchema = z.object({
  planName: z.string().min(1, 'Plan name is required').max(100, 'Plan name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  billingCycle: z.enum([BillingCycle.MONTHLY, BillingCycle.QUARTERLY, BillingCycle.YEARLY]),
  maxTireStorage: z.number().min(1, 'Max tire storage must be at least 1'),
  maxUsers: z.number().min(1, 'Max users must be at least 1'),
  features: z.array(z.string().min(1, 'Feature cannot be empty')),
  isActive: z.boolean(),
});

export function useSubscriptionPlanForm({ plan, onSuccess, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: plan || defaultSubscriptionPlanRequest,
  });

  const watchedFeatures = watch('features', []);

  useEffect(() => {
    if (plan) {
      reset(plan);
    }
  }, [plan, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (plan) {
        await subscriptionPlansService.updateSubscriptionPlan(plan.id, data);
        toast.success('Subscription plan updated successfully');
      } else {
        await subscriptionPlansService.createSubscriptionPlan(data);
        toast.success('Subscription plan created successfully');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = watchedFeatures || [];
      setValue('features', [...currentFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    const currentFeatures = watchedFeatures || [];
    setValue(
      'features',
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  const handleFeatureKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  return {
    plan,
    register,
    handleFormSubmit: handleSubmit(onSubmit),
    errors,
    watch,
    setValue,
    isSubmitting,
    onCancel,
    newFeature,
    setNewFeature,
    watchedFeatures,
    handleAddFeature,
    handleRemoveFeature,
    handleFeatureKeyPress,
  };
}
