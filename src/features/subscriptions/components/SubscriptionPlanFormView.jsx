import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { X, Plus } from 'lucide-react';
import { BillingCycle } from '@/shared/types/enums';

export function SubscriptionPlanFormView({
  plan,
  register,
  handleFormSubmit,
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
}) {
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="planName">Plan Name *</Label>
          <Input id="planName" {...register('planName')} placeholder="Enter plan name" />
          {errors.planName && <p className="text-sm text-red-600">{errors.planName.message}</p>}
        </div>

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
          {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingCycle">Billing Cycle *</Label>
          <Select value={watch('billingCycle')} onValueChange={(value) => setValue('billingCycle', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select billing cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BillingCycle.MONTHLY}>Monthly</SelectItem>
              <SelectItem value={BillingCycle.QUARTERLY}>Quarterly</SelectItem>
              <SelectItem value={BillingCycle.YEARLY}>Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.billingCycle && <p className="text-sm text-red-600">{errors.billingCycle.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTireStorage">Max Tire Storage *</Label>
          <Input
            id="maxTireStorage"
            type="number"
            min="1"
            {...register('maxTireStorage', { valueAsNumber: true })}
            placeholder="1000"
          />
          {errors.maxTireStorage && <p className="text-sm text-red-600">{errors.maxTireStorage.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxUsers">Max Users *</Label>
          <Input
            id="maxUsers"
            type="number"
            min="1"
            {...register('maxUsers', { valueAsNumber: true })}
            placeholder="5"
          />
          {errors.maxUsers && <p className="text-sm text-red-600">{errors.maxUsers.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="isActive">Active Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">{watch('isActive') ? 'Active' : 'Inactive'}</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe the plan features and benefits"
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="space-y-4">
        <Label>Features *</Label>

        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={handleFeatureKeyPress}
            placeholder="Add a feature..."
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleAddFeature} disabled={!newFeature.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

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

        {errors.features && <p className="text-sm text-red-600">{errors.features.message}</p>}
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
