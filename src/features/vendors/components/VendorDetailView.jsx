import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Mail, Phone, MapPin, User, Building2, Users, Shield, UserCheck, Wrench, CreditCard, Calendar } from 'lucide-react';
import { formatPostalCode, formatPhoneNumber } from '../../leads/utils/leadUtils';
import { displayVendorId, VENDOR_STATUS_BADGE_STYLES } from '../utils/vendorUtils';
import ErrorPage from '@/app/components/ErrorPage';
import { UserRole } from '@/shared/types/api';
import { format } from 'date-fns';

export default function VendorDetailView({ vm }) {
  const { user, navigate, vendor, loading, error, loadVendor, handleDelete, activeSubscription } = vm;

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={loadVendor}
        onGoBack={() => navigate('/vendors')}
        onGoHome={() => navigate('/')}
        title="Failed to Load Vendor"
        showDetails={import.meta.env.DEV}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vendor information...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <ErrorPage
        error={{ message: 'Vendor not found' }}
        onGoBack={() => navigate('/vendors')}
        onGoHome={() => navigate('/')}
        title="Vendor Not Found"
        showDetails={false}
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[60vh] bg-background py-8">
      <div className="w-full max-w-2xl mb-4">
        <Button variant="outline" onClick={() => navigate('/vendors')}>
          &larr; Back to Vendors
        </Button>
      </div>
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl border-0">
        <CardHeader className="flex flex-row items-center justify-between rounded-t-2xl border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="mb-1 text-2xl font-bold text-card-foreground">{vendor.businessName}</CardTitle>
              <Badge
                style={{
                  ...VENDOR_STATUS_BADGE_STYLES[vendor.status],
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 999,
                  padding: '2px 12px',
                }}
              >
                {vendor.status}
              </Badge>
            </div>
          </div>
          {user?.roleName === 'SYSTEM_ADMIN' && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete Dealer
            </Button>
          )}
        </CardHeader>
        <CardContent className="rounded-b-2xl border-t-0 bg-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Legal Name:</span>
                <span>{vendor.legalName}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Email:</span>
                <span>{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Phone:</span>
                <span>{formatPhoneNumber(vendor.phoneNumber)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Address:</span>
                <span>
                  {vendor.streetNumber} {vendor.streetName} {vendor.aptUnitBldg || ''}{' '}
                  {formatPostalCode(vendor.postalCode)}
                </span>
              </div>
            
            </div>
          </div>

          {activeSubscription && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Active Subscription</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Plan</span>
                    <Badge variant="outline">{activeSubscription.planName || '-'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold">${activeSubscription.amountPaid?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Auto Renew</span>
                    <Badge variant={activeSubscription.autoRenew ? 'default' : 'secondary'}>
                      {activeSubscription.autoRenew ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Billing Weekday</span>
                    <span className="font-semibold">{activeSubscription.billingWeekday || '-'}</span>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Period</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <span className="text-sm font-medium">
                        {activeSubscription.startDate ? format(new Date(activeSubscription.startDate), 'yyyy-MM-dd') : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">End Date</span>
                      <span className="text-sm font-medium">
                        {activeSubscription.endDate ? format(new Date(activeSubscription.endDate), 'yyyy-MM-dd') : '-'}
                      </span>
                    </div>
                  </div>
                  {activeSubscription.cancellationDate && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cancellation Date</span>
                        <span className="text-sm font-medium text-destructive">
                          {format(new Date(activeSubscription.cancellationDate), 'yyyy-MM-dd')}
                        </span>
                      </div>
                      {activeSubscription.cancellationReason && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Reason: </span>
                          <span className="text-sm">{activeSubscription.cancellationReason}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {vendor.totalUsers && vendor.userRoles && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">User Access Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Total Users</span>
                    <Badge variant="outline">{vendor.totalUsers}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(vendor.userRoles || {}).map(([role, count]) => {
                    const roleConfigs = {
                      [UserRole.DEALER_ADMIN]: {
                        label: 'Dealer Admin',
                        icon: Shield,
                        color: 'bg-red-100 text-red-800',
                      },
                      [UserRole.DEALER_TECHNICIAN]: {
                        label: 'Dealer Technician',
                        icon: Wrench,
                        color: 'bg-green-100 text-green-800',
                      },
                    };

                    const config = roleConfigs[role];
                    const IconComponent = config?.icon;

                    return (
                      <div key={role} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          <span className="font-medium">{config?.label || role}</span>
                        </div>
                        <Badge variant="secondary" className={config?.color}>
                          {count} users
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
