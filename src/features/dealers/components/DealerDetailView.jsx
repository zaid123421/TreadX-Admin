import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Mail, Phone, MapPin, User, Building2, Users, Shield, Wrench, CreditCard, Calendar, ArrowLeft, Trash2 } from 'lucide-react';
import { formatPostalCode, formatPhoneNumber } from '../../leads/utils/leadUtils';
import { displayDealerId, DEALER_STATUS_BADGE_STYLES } from '../utils/dealerUtils';
import ErrorPage from '@/app/components/ErrorPage';
import { UserRole } from '@/shared/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { subscriptionPlansService } from '@/features/subscriptions/services/subscriptionPlansApiService';
import { subscriptionsService } from '@/features/subscriptions/services/subscriptionsApiService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DealerDetailView({ vm }) {
  const { user, navigate, dealer, loading, error, loadDealer, handleDelete, activeSubscription } = vm;
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

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Auto Renew</label>
                            <select className="w-full p-2 rounded border bg-card" value={autoRenew ? 'true' : 'false'} onChange={(e) => setAutoRenew(e.target.value === 'true')}>
                              <option value="true">Enabled</option>
                              <option value="false">Disabled</option>
                            </select>
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

                            setCreating(true);
                            try {
                              const payload = {
                                dealerId: dealer.id,
                                planId: selectedPlanId,
                                amountPaid: Number(amountPaid) || 0,
                                autoRenew,
                                billingWeekday,
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
              </Card>
            )}

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