import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, Plus } from 'lucide-react';
import { subscriptionPlansService } from '../../services/subscriptionPlansApiService';
import { BillingCycle, defaultSubscriptionPlanRequest } from '../../types/api';
import { toast } from 'sonner';

// Validation schema
const subscriptionPlanSchema = z.object({
  planName: z.string().min(1, 'Plan name is required').max(100, 'Plan name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  billingCycle: z.enum([BillingCycle.MONTHLY, BillingCycle.QUARTERLY, BillingCycle.YEARLY]),
  maxTireStorage: z.number().min(1, 'Max tire storage must be at least 1'),
  maxUsers: z.number().min(1, 'Max users must be at least 1'),
  features: z.array(z.string().min(1, 'Feature cannot be empty')),
  isActive: z.boolean()
});

const SubscriptionPlanForm = ({ plan, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: plan || defaultSubscriptionPlanRequest
  });

  const watchedFeatures = watch('features', []);

  // Initialize form with plan data if editing
  useEffect(() => {
    if (plan) {
      reset(plan);
    }
  }, [plan, reset]);

  // Handle form submission
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
    } catch (error) {
      toast.error(error.message || 'Failed to save subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add feature
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = watchedFeatures || [];
      setValue('features', [...currentFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  // Remove feature
  const handleRemoveFeature = (index) => {
    const currentFeatures = watchedFeatures || [];
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    setValue('features', updatedFeatures);
  };

  // Handle feature input key press
  const handleFeatureKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Name */}
        <div className="space-y-2">
          <Label htmlFor="planName">Plan Name *</Label>
          <Input
            id="planName"
            {...register('planName')}
            placeholder="Enter plan name"
          />
          {errors.planName && (
            <p className="text-sm text-red-600">{errors.planName.message}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Billing Cycle */}
        <div className="space-y-2">
          <Label htmlFor="billingCycle">Billing Cycle *</Label>
          <Select
            value={watch('billingCycle')}
            onValueChange={(value) => setValue('billingCycle', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select billing cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BillingCycle.MONTHLY}>Monthly</SelectItem>
              <SelectItem value={BillingCycle.QUARTERLY}>Quarterly</SelectItem>
              <SelectItem value={BillingCycle.YEARLY}>Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.billingCycle && (
            <p className="text-sm text-red-600">{errors.billingCycle.message}</p>
          )}
        </div>

        {/* Max Tire Storage */}
        <div className="space-y-2">
          <Label htmlFor="maxTireStorage">Max Tire Storage *</Label>
          <Input
            id="maxTireStorage"
            type="number"
            min="1"
            {...register('maxTireStorage', { valueAsNumber: true })}
            placeholder="1000"
          />
          {errors.maxTireStorage && (
            <p className="text-sm text-red-600">{errors.maxTireStorage.message}</p>
          )}
        </div>

        {/* Max Users */}
        <div className="space-y-2">
          <Label htmlFor="maxUsers">Max Users *</Label>
          <Input
            id="maxUsers"
            type="number"
            min="1"
            {...register('maxUsers', { valueAsNumber: true })}
            placeholder="5"
          />
          {errors.maxUsers && (
            <p className="text-sm text-red-600">{errors.maxUsers.message}</p>
          )}
        </div>

        {/* Active Status */}
        <div className="space-y-2">
          <Label htmlFor="isActive">Active Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">
              {watch('isActive') ? 'Active' : 'Inactive'}
            </Label>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe the plan features and benefits"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4">
        <Label>Features *</Label>
        
        {/* Add Feature */}
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={handleFeatureKeyPress}
            placeholder="Add a feature..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddFeature}
            disabled={!newFeature.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Features List */}
        {watchedFeatures && watchedFeatures.length > 0 && (
          <div className="space-y-2">
            {watchedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="secondary" className="flex-1 justify-between">
                  {feature}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFeature(index)}
                    className="h-4 w-4 p-0 ml-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              </div>
            ))}
          </div>
        )}

        {errors.features && (
          <p className="text-sm text-red-600">{errors.features.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
};

export default SubscriptionPlanForm; 