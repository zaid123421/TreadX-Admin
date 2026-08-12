import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Mail, Phone, MapPin, User, Building2, Users, Shield, Wrench, CreditCard, Calendar, ArrowLeft, Trash2, Warehouse, Edit, Link2, Boxes, AlertTriangle } from 'lucide-react';
import { formatPostalCode, formatPhoneNumber } from '../../leads/utils/leadUtils';
import { displayDealerId, DEALER_STATUS_BADGE_STYLES } from '../utils/dealerUtils';
import ErrorPage from '@/app/components/ErrorPage';
import { UserRole } from '@/shared/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Switch } from '@/shared/ui/switch';
import { Progress } from '@/shared/ui/progress';
import { subscriptionPlansService } from '@/features/subscriptions/services/subscriptionPlansApiService';
import { subscriptionsService } from '@/features/subscriptions/services/subscriptionsApiService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { canCreateDealerSubscription } from '@/shared/access/roleMatrix';
import { warehousesService } from '@/features/warehouses/services/warehousesApiService';
import { cn } from '@/shared/utils/utils';

export default function DealerDetailView({ vm }) {
  const {
    user,
    navigate,
    dealer,
    loading,
    error,
    loadDealer,
    handleDelete,
    activeSubscription,
    primaryWarehouse,
    handleSetPrimaryWarehouse,
    handleDeletePrimaryWarehouse,
    quota,
    quotaLoading,
    quotaError,
  } = vm;
  const canCreateSubscription = canCreateDealerSubscription(user);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [billingWeekday, setBillingWeekday] = useState('MONDAY');
  const [creating, setCreating] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [totalUsers, setTotalUsers] = useState(1);
  const [userRoles, setUserRoles] = useState({
    DEALER_ADMIN: 1,
    DEALER_TECHNICIAN: 0,
  });
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isDeleteWarehouseOpen, setIsDeleteWarehouseOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [savingWarehouse, setSavingWarehouse] = useState(false);
  const [deletingWarehouse, setDeletingWarehouse] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true);
      try {
        const data = await subscriptionPlansService.getActiveSubscriptionPlans({ page: 0, size: 50 });
        setPlans(data.content || data || []);
      } catch (err) {
        console.error('Failed to load plans', err);
        toast.error(err.message || 'Failed to load plans');
      } finally {
        setPlansLoading(false);
      }
    };

    if (isCreateOpen) loadPlans();
  }, [isCreateOpen]);

  useEffect(() => {
    const loadWarehouses = async () => {
      setWarehousesLoading(true);
      try {
        const list = await warehousesService.getWarehouses();
        setWarehouses(list);
      } catch (err) {
        console.error('Failed to load warehouses', err);
        toast.error(err.message || 'Failed to load warehouses');
        setWarehouses([]);
      } finally {
        setWarehousesLoading(false);
      }
    };

    if (isWarehouseDialogOpen) {
      setSelectedWarehouseId(primaryWarehouse?.warehouseId ?? null);
      loadWarehouses();
    }
  }, [isWarehouseDialogOpen, primaryWarehouse?.warehouseId]);

  const handleSavePrimaryWarehouse = async () => {
    if (!selectedWarehouseId) {
      toast.error('Please select a warehouse');
      return;
    }

    setSavingWarehouse(true);
    try {
      await handleSetPrimaryWarehouse(selectedWarehouseId);
      toast.success(
        primaryWarehouse ? 'Primary warehouse updated successfully' : 'Primary warehouse linked successfully',
      );
      setIsWarehouseDialogOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save primary warehouse');
    } finally {
      setSavingWarehouse(false);
    }
  };

  const handleConfirmDeletePrimaryWarehouse = async () => {
    setDeletingWarehouse(true);
    try {
      await handleDeletePrimaryWarehouse();
      toast.success('Primary warehouse link removed');
      setIsDeleteWarehouseOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to remove primary warehouse');
    } finally {
      setDeletingWarehouse(false);
    }
  };

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={loadDealer}
        onGoBack={() => navigate('/dealers')}
        onGoHome={() => navigate('/')}
        title="Failed to Load Dealer"
        showDetails={import.meta.env.DEV}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading dealer details...</p>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <ErrorPage
        error={{ message: 'Dealer not found' }}
        onGoBack={() => navigate('/dealers')}
        onGoHome={() => navigate('/')}
        title="Dealer Not Found"
        showDetails={false}
      />
    );
  }

  // هنا تم تأمين الـ ID وتحويله إلى نص بشكل آمن لحل المشكلة فوراً
  const safeDealerId = dealer.id ? String(dealer.id) : (vm.id ? String(vm.id) : '');

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      {/* شريط التحكم العلوي */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="ghost" className="gap-2 hover:bg-background" onClick={() => navigate('/dealers')}>
          <ArrowLeft className="h-4 w-4" /> Back to Dealers
        </Button>

        {user?.roleName === 'SYSTEM_ADMIN' && (
          <Button variant="destructive" className="gap-2 shadow-sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete Dealer
          </Button>
        )}
      </div>

      {/* لوحة العرض الرئيسية */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* كرت الهوية والاسم الرئيسي */}
        <Card className="border-none shadow-sm bg-card overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                <Building2 className="h-9 w-9 text-primary" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{dealer.businessName}</h1>
                  <Badge
                    style={{
                      ...DEALER_STATUS_BADGE_STYLES[dealer.status],
                      fontWeight: 600,
                      borderRadius: '6px',
                      padding: '2px 10px',
                    }}
                  >
                    {dealer.status}
                  </Badge>
                </div>
      
              </div>
            </div>
          </div>
        </Card>

        {/* شبكة البيانات المقسمة لأعمدة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* العمود الأول: البيانات القانونية والتواصل */}
          <Card className="lg:col-span-1 border-none shadow-sm h-fit">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal Name</span>
                <p className="text-sm font-medium text-foreground bg-muted/40 p-2.5 rounded-lg border">{dealer.legalName || '-'}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</span>
                <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                  <Mail className="h-4 w-4 shrink-0" /> {dealer.email}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</span>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-muted/40 p-2.5 rounded-lg border">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" /> {formatPhoneNumber(dealer.phoneNumber)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Address</span>
                <div className="flex items-start gap-2 text-sm font-medium text-foreground bg-muted/40 p-2.5 rounded-lg border">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    {dealer.streetNumber} {dealer.streetName} {dealer.aptUnitBldg || ''}
                    <span className="block text-xs text-muted-foreground mt-1 font-mono">{formatPostalCode(dealer.postalCode)}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* العمود الثاني والثالث: مخصص للاشتراكات وإعدادات الصلاحيات */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* كرت معلومات الاشتراك */}
            {activeSubscription ? (
              <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
                <CardHeader className="pb-4 border-b bg-muted/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <CreditCard className="h-5 w-5 text-emerald-500" /> Active Subscription
                    </CardTitle>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 capitalize font-semibold px-2.5 py-0.5">
                      {activeSubscription.planName || '-'} Plan
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3.5 border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Amount Paid</span>
                        <span className="font-bold text-base text-foreground">${activeSubscription.amountPaid?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Auto Renew</span>
                        <Badge variant={activeSubscription.autoRenew ? 'default' : 'secondary'} className="rounded-md">
                          {activeSubscription.autoRenew ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Billing Weekday</span>
                        <span className="font-semibold text-foreground">{activeSubscription.billingWeekday || '-'}</span>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4 space-y-3.5 border flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Calendar className="h-4 w-4" /> Billing Period
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date</span>
                            <span className="font-medium text-foreground">
                              {activeSubscription.startDate ? format(new Date(activeSubscription.startDate), 'yyyy-MM-dd') : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date</span>
                            <span className="font-medium text-foreground">
                              {activeSubscription.endDate ? format(new Date(activeSubscription.endDate), 'yyyy-MM-dd') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {activeSubscription.cancellationDate && (
                        <div className="pt-2 border-t border-dashed border-muted-foreground/20 mt-2">
                          <div className="text-xs font-semibold text-destructive">
                            Cancelled on: {format(new Date(activeSubscription.cancellationDate), 'yyyy-MM-dd')}
                          </div>
                          {activeSubscription.cancellationReason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{activeSubscription.cancellationReason}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-sm bg-muted/40 border-dashed border-2 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <CreditCard className="h-10 w-10 text-muted-foreground/60 mb-2 stroke-1" />
                <p className="font-medium text-sm mb-4">No Active Subscription found for this Dealer</p>

                {canCreateSubscription && (
                <Dialog open={isCreateOpen} onOpenChange={(open) => setIsCreateOpen(open)}>
                  <div>
                    <Button className="mb-4" onClick={() => setIsCreateOpen(true)}>Create Subscription</Button>

                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Subscription</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Choose Plan</label>
                          {plansLoading ? (
                            <div className="text-sm">Loading plans...</div>
                          ) : (
                            <select
                              className="w-full p-2 rounded border bg-card"
                              value={selectedPlanId || ''}
                              onChange={(e) => setSelectedPlanId(Number(e.target.value) || null)}
                            >
                              <option value="">Select a plan</option>
                              {plans.map((p) => (
                                <option key={p.id} value={p.id}>{p.planName} — ${p.price}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                            <input
                              type="datetime-local"
                              className="w-full p-2 rounded border bg-card"
                              value={startDateInput}
                              onChange={(e) => setStartDateInput(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">End Date</label>
                            <input
                              type="datetime-local"
                              className="w-full p-2 rounded border bg-card"
                              value={endDateInput}
                              onChange={(e) => setEndDateInput(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Amount Paid</label>
                          <input
                            type="number"
                            className="w-full p-2 rounded border bg-card"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Total Users</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full p-2 rounded border bg-card"
                            value={totalUsers}
                            onChange={(e) => setTotalUsers(parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-muted-foreground">Team Roles</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Dealer Admins</label>
                              <input
                                type="number"
                                min="0"
                                className="w-full p-2 rounded border bg-card"
                                value={userRoles.DEALER_ADMIN}
                                onChange={(e) =>
                                  setUserRoles((prev) => ({
                                    ...prev,
                                    DEALER_ADMIN: parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Dealer Technicians</label>
                              <input
                                type="number"
                                min="0"
                                className="w-full p-2 rounded border bg-card"
                                value={userRoles.DEALER_TECHNICIAN}
                                onChange={(e) =>
                                  setUserRoles((prev) => ({
                                    ...prev,
                                    DEALER_TECHNICIAN: parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total team members: {userRoles.DEALER_ADMIN + userRoles.DEALER_TECHNICIAN} / {totalUsers} users
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 pt-7">
                            <Switch
                              id="autoRenew"
                              checked={autoRenew}
                              onCheckedChange={setAutoRenew}
                            />
                            <label htmlFor="autoRenew" className="text-sm font-medium text-muted-foreground cursor-pointer">
                              Auto Renew
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Billing Weekday</label>
                            <select className="w-full p-2 rounded border bg-card" value={billingWeekday} onChange={(e) => setBillingWeekday(e.target.value)}>
                              <option>MONDAY</option>
                              <option>TUESDAY</option>
                              <option>WEDNESDAY</option>
                              <option>THURSDAY</option>
                              <option>FRIDAY</option>
                              <option>SATURDAY</option>
                              <option>SUNDAY</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={creating}>Cancel</Button>
                          <Button onClick={async () => {
                            if (!selectedPlanId) return toast.error('Please select a plan');
                            // validate dates
                            if (startDateInput && endDateInput) {
                              const s = new Date(startDateInput);
                              const e = new Date(endDateInput);
                              if (isNaN(s.getTime()) || isNaN(e.getTime())) {
                                return toast.error('Invalid start or end date');
                              }
                              if (s > e) return toast.error('Start date must be before end date');
                            }

                            const totalRoles = userRoles.DEALER_ADMIN + userRoles.DEALER_TECHNICIAN;
                            if (totalRoles > totalUsers) {
                              return toast.error(
                                `Total team members (${totalRoles}) cannot exceed total users (${totalUsers})`
                              );
                            }

                            setCreating(true);
                            try {
                              const payload = {
                                dealerId: dealer.id,
                                planId: selectedPlanId,
                                amountPaid: Number(amountPaid) || 0,
                                autoRenew,
                                billingWeekday,
                                totalUsers,
                                userRoles,
                                startDate: startDateInput ? new Date(startDateInput).toISOString() : undefined,
                                endDate: endDateInput ? new Date(endDateInput).toISOString() : undefined,
                              };
                              await subscriptionsService.createSubscription(payload);
                              toast.success('Subscription created');
                              setIsCreateOpen(false);
                              // refresh dealer to show new subscription
                              await loadDealer();
                            } catch (err) {
                              toast.error(err.message || 'Failed to create subscription');
                            } finally {
                              setCreating(false);
                            }
                          }} disabled={creating}>
                            {creating ? 'Creating...' : 'Create'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </div>
                </Dialog>
                )}
              </Card>
            )}

            {/* Storage Quota */}
            <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-info">
              <CardHeader className="pb-4 border-b bg-muted/10">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Boxes className="h-5 w-5 text-info" /> Storage Capacity
                  </CardTitle>
                  {quota?.thresholdBreachedTires ? (
                    <Badge variant="outline" className="gap-1 border-warning/40 bg-warning/10 text-warning">
                      <AlertTriangle className="h-3.5 w-3.5" /> Threshold breached
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {quotaLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-2 w-full animate-pulse rounded bg-muted" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-16 animate-pulse rounded-xl bg-muted" />
                      <div className="h-16 animate-pulse rounded-xl bg-muted" />
                      <div className="h-16 animate-pulse rounded-xl bg-muted" />
                    </div>
                  </div>
                ) : quotaError ? (
                  <p className="text-sm text-muted-foreground">{quotaError}</p>
                ) : !quota || !quota.hasActiveSubscription || quota.tireStorageLimit <= 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                    <Boxes className="h-10 w-10 text-muted-foreground/60 mb-2 stroke-1" />
                    <p className="font-medium text-sm">No storage quota available for this dealer</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Tire storage usage</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {Number(quota.tireCount).toLocaleString()} / {Number(quota.tireStorageLimit).toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(Math.max(quota.tireUsagePercent, 0), 100)}
                        className={cn(
                          'h-2.5',
                          quota.thresholdBreachedTires ? 'bg-destructive/20' : 'bg-primary/15',
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(quota.tireUsagePercent)}% used
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Used</p>
                        <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                          {Number(quota.tireCount).toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">tires stored</p>
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Limit</p>
                        <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                          {Number(quota.tireStorageLimit).toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">storage capacity</p>
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remaining</p>
                        <p
                          className={cn(
                            'mt-1 text-xl font-bold tabular-nums',
                            quota.thresholdBreachedTires ? 'text-warning' : 'text-foreground',
                          )}
                        >
                          {Number(quota.remaining).toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">slots left</p>
                      </div>
                    </div>

                    {(quota.activeStaffLimit > 0 || quota.activeStaff > 0) && (
                      <div className="rounded-xl border bg-muted/20 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-muted-foreground">Staff quota</span>
                          <span className="font-semibold tabular-nums text-foreground">
                            {Number(quota.activeStaff).toLocaleString()} /{' '}
                            {Number(quota.activeStaffLimit).toLocaleString()}
                          </span>
                        </div>
                        {quota.thresholdBreachedStaff ? (
                          <p className="mt-1 text-xs text-warning">Staff alert threshold breached</p>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {Math.round(quota.staffUsagePercent)}% of staff limit used
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Primary Warehouse Routing */}
            <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary">
              <CardHeader className="pb-4 border-b bg-muted/10">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Warehouse className="h-5 w-5 text-primary" /> Primary Warehouse
                  </CardTitle>
                  {primaryWarehouse?.primary && (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold px-2.5 py-0.5">
                      Primary
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {primaryWarehouse ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="bg-muted/30 rounded-xl p-4 border flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Warehouse Name</span>
                      </div>
                      <p className="text-base font-bold text-foreground">{primaryWarehouse.warehouseName}</p>
                      <p className="text-sm font-mono text-muted-foreground">{primaryWarehouse.warehouseCode}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => setIsWarehouseDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4" /> Change
                      </Button>
                      <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={() => setIsDeleteWarehouseOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                    <Warehouse className="h-10 w-10 text-muted-foreground/60 mb-2 stroke-1" />
                    <p className="font-medium text-sm mb-4">No primary warehouse linked to this dealer</p>
                    <Button className="gap-2" onClick={() => setIsWarehouseDialogOpen(true)}>
                      <Link2 className="h-4 w-4" /> Link Warehouse
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {primaryWarehouse ? 'Change Primary Warehouse' : 'Link Primary Warehouse'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Select Warehouse
                    </label>
                    {warehousesLoading ? (
                      <div className="text-sm text-muted-foreground">Loading warehouses…</div>
                    ) : warehouses.length === 0 ? (
                      <div className="text-sm text-muted-foreground rounded-lg border border-dashed p-4 text-center">
                        No warehouses available. Provision a warehouse first.
                      </div>
                    ) : (
                      <select
                        className="w-full p-2 rounded border bg-card"
                        value={selectedWarehouseId || ''}
                        onChange={(e) => setSelectedWarehouseId(Number(e.target.value) || null)}
                      >
                        <option value="">Select a warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.warehouseName} ({warehouse.warehouseCode})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsWarehouseDialogOpen(false)}
                      disabled={savingWarehouse}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePrimaryWarehouse}
                      disabled={savingWarehouse || warehousesLoading || warehouses.length === 0}
                    >
                      {savingWarehouse ? 'Saving…' : primaryWarehouse ? 'Update' : 'Link'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteWarehouseOpen} onOpenChange={setIsDeleteWarehouseOpen}>
              <AlertDialogContent className="border-border bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove primary warehouse link?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will unlink{' '}
                    <strong>{primaryWarehouse?.warehouseName}</strong> ({primaryWarehouse?.warehouseCode})
                    {' '}from this dealer. The warehouse itself will not be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deletingWarehouse}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deletingWarehouse}
                    onClick={(e) => {
                      e.preventDefault();
                      handleConfirmDeletePrimaryWarehouse();
                    }}
                  >
                    {deletingWarehouse ? 'Removing…' : 'Remove Link'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* كرت إعدادات وحسابات المستخدمين */}
            {dealer.totalUsers && dealer.userRoles && (
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> User Access Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* إجمالي الحسابات */}
                    <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 flex flex-col justify-center items-center text-center">
                      <span className="text-2xl sm:text-3xl font-extrabold text-primary">{dealer.totalUsers}</span>
                      <span className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Total Active Users</span>
                    </div>

                    {/* تفصيل الحسابات حسب الأدوار */}
                    <div className="sm:col-span-2 space-y-2">
                      {Object.entries(dealer.userRoles || {}).map(([role, count]) => {
                        const roleConfigs = {
                          [UserRole.DEALER_ADMIN]: {
                            label: 'Dealer Admin',
                            icon: Shield,
                            color: 'bg-red-50 text-red-700 border-red-200',
                          },
                          [UserRole.DEALER_TECHNICIAN]: {
                            label: 'Dealer Technician',
                            icon: Wrench,
                            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          },
                        };

                        const config = roleConfigs[role];
                        const IconComponent = config?.icon;

                        return (
                          <div key={role} className="flex items-center justify-between rounded-xl border bg-card p-3.5 shadow-2xs">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                              </div>
                              <span className="font-semibold text-sm text-foreground">{config?.label || role}</span>
                            </div>
                            <Badge variant="outline" className={`font-bold ${config?.color || 'bg-muted'}`}>
                              {count} {count === 1 ? 'user' : 'users'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}