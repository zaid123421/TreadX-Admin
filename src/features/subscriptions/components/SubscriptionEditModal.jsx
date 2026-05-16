import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle, Calendar, CreditCard } from 'lucide-react';

export default function SubscriptionEditModal({ subscription, subscriptionPlans, onClose, onSave, isSubmitting }) {
  const [formData, setFormData] = React.useState({
    dealerId: subscription?.dealerId || 0,
    planId: subscription?.planId || 0,
    startDate: subscription?.startDate ? new Date(subscription.startDate).toISOString().slice(0, 16) : '',
    endDate: subscription?.endDate ? new Date(subscription.endDate).toISOString().slice(0, 16) : '',
    amountPaid: subscription?.amountPaid || 0,
    autoRenew: subscription?.autoRenew ?? true,
    billingWeekday: subscription?.billingWeekday || 'MONDAY',
  });
  const [error, setError] = React.useState('');

  const handleSubmit = () => {
    if (!formData.planId) {
      setError('Plan is required');
      return;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return;
    }

    onSave({
      dealerId: formData.dealerId,
      planId: formData.planId,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      amountPaid: formData.amountPaid,
      autoRenew: formData.autoRenew,
      billingWeekday: formData.billingWeekday,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update subscription details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planId">Subscription Plan <span className="text-red-500">*</span></Label>
            <Select
              value={String(formData.planId)}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, planId: parseInt(value) }));
                setError('');
              }}
            >
              <SelectTrigger id="planId">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {subscriptionPlans?.map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.planName || plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }));
                  setError('');
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }));
                  setError('');
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountPaid">Amount Paid</Label>
            <Input
              id="amountPaid"
              type="number"
              step="0.01"
              value={formData.amountPaid}
              onChange={(e) => setFormData((prev) => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingWeekday">Billing Weekday</Label>
            <Select
              value={formData.billingWeekday}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, billingWeekday: value }))}
            >
              <SelectTrigger id="billingWeekday">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONDAY">Monday</SelectItem>
                <SelectItem value="TUESDAY">Tuesday</SelectItem>
                <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                <SelectItem value="THURSDAY">Thursday</SelectItem>
                <SelectItem value="FRIDAY">Friday</SelectItem>
                <SelectItem value="SATURDAY">Saturday</SelectItem>
                <SelectItem value="SUNDAY">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autoRenew"
              checked={formData.autoRenew}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, autoRenew: checked }))}
            />
            <Label htmlFor="autoRenew" className="cursor-pointer">
              Auto Renew
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
