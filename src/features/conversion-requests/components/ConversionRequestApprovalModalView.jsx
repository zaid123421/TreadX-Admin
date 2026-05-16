import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { AlertCircle, Building2, User, Mail, Phone, Calendar, CreditCard } from 'lucide-react';

export function ConversionRequestApprovalModalView({
  request,
  formData,
  subscriptionPlans,
  loadingPlans,
  onFieldChange,
  onNestedFieldChange,
  isSubmitting,
  error,
  handleSubmit,
  onClose,
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approve Conversion Request</DialogTitle>
          <DialogDescription>
            Review lead information and complete dealer details to convert {request.leadBusinessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Information Summary */}
          <div className="bg-muted/40 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Lead Information
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Business:</span>
                <span className="ml-2 font-medium">{request.leadBusinessName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Requested by:</span>
                <span className="ml-2">{request.requestedByEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="ml-2">{request.assignedToEmail}</span>
              </div>
            </div>
            {request.requestNotes && (
              <div className="mt-2 pt-2 border-t border-border/40">
                <span className="text-muted-foreground text-sm">Notes:</span>
                <p className="text-sm mt-1">{request.requestNotes}</p>
              </div>
            )}
          </div>

          {/* Dealer Creation Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Dealer Details</h3>

            {/* Legal Name */}
            <div className="space-y-2">
              <Label htmlFor="legalName">
                Legal Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => onFieldChange('legalName', e.target.value)}
                placeholder="Enter legal business name"
              />
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">
                Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => onFieldChange('businessName', e.target.value)}
                placeholder="Enter display business name"
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => onFieldChange('email', e.target.value)}
                    placeholder="contact@business.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => onFieldChange('phoneNumber', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            {/* System Configuration */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                System Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPlanId">
                    Subscription Plan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.subscriptionPlanId}
                    onValueChange={(value) => onFieldChange('subscriptionPlanId', value)}
                    disabled={loadingPlans}
                  >
                    <SelectTrigger id="subscriptionPlanId">
                      <SelectValue placeholder={loadingPlans ? 'Loading plans...' : 'Select plan'} />
                    </SelectTrigger>
                   <SelectContent>
  {/* ⚡ التعديل السحري: فحص ما إذا كانت المصفوفة بداخل content أو استخدام المتاح بأمان ⚡ */}
  {(Array.isArray(subscriptionPlans) 
    ? subscriptionPlans 
    : subscriptionPlans?.content || []
  ).map((plan) => (
    <SelectItem key={plan.id} value={String(plan.id)}>
      {/* تأكدي من أسماء الحقول هنا، لو كانت planName استخدميها بدلاً من plan.name */}
      {plan.planName || plan.name} - ${plan.price != null ? plan.price : 'N/A'}
    </SelectItem>
  ))}
</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalUsers">Total Users</Label>
                  <Input
                    id="totalUsers"
                    type="number"
                    min="1"
                    value={formData.totalUsers}
                    onChange={(e) => onNestedFieldChange('system', 'totalUsers', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="billingWeekday">Billing Weekday</Label>
                  <Select
                    value={formData.billingWeekday}
                    onValueChange={(value) => onFieldChange('billingWeekday', value)}
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
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="autoRenew"
                    checked={formData.autoRenew}
                    onCheckedChange={(checked) => onFieldChange('autoRenew', checked)}
                  />
                  <Label htmlFor="autoRenew" className="cursor-pointer">
                    Auto Renew Subscription
                  </Label>
                </div>
              </div>
            </div>

            {/* Team Roles Configuration */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Team Roles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dealerAdminCount">Dealer Admins</Label>
                  <Input
                    id="dealerAdminCount"
                    type="number"
                    min="0"
                    value={formData.userRoles.DEALER_ADMIN}
                    onChange={(e) => onNestedFieldChange('userRoles', 'DEALER_ADMIN', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealerTechnicianCount">Dealer Technicians</Label>
                  <Input
                    id="dealerTechnicianCount"
                    type="number"
                    min="0"
                    value={formData.userRoles.DEALER_TECHNICIAN}
                    onChange={(e) => onNestedFieldChange('userRoles', 'DEALER_TECHNICIAN', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Total team members: {formData.userRoles.DEALER_ADMIN + formData.userRoles.DEALER_TECHNICIAN} / {formData.totalUsers} users
              </p>
            </div>

            {/* Admin Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Admin Account
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={(e) => onNestedFieldChange('admin', 'adminFirstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="adminLastName"
                    value={formData.adminLastName}
                    onChange={(e) => onNestedFieldChange('admin', 'adminLastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => onNestedFieldChange('admin', 'adminEmail', e.target.value)}
                    placeholder="admin@business.com"
                  />
                </div>
              </div>
            </div>
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
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-success hover:bg-success/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Approve & Create Dealer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
