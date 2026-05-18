import React from 'react';
import { Users, Building2, DollarSign, Activity, Truck, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Link } from 'react-router-dom';

export function DashboardView({ user, vm }) {
  const { t } = useTranslation('dashboard');
  const { totalLeads, totalDealers, monthlyRevenue, leadStatusData, loading } = vm;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-primary to-info p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t('welcome', { name: user?.firstName || 'User' })}
            </h1>
            <p className="text-primary-foreground/80">
              {t('welcomeSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalLeads')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-16 rounded bg-muted"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold">{totalLeads}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dealers')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-12 rounded bg-muted"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold">{totalDealers}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('monthlyRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 rounded bg-muted"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold">{monthlyRevenue.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('leadStatusOverview')}</CardTitle>
            <CardDescription>
              {t('leadStatusDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ms-2 text-sm text-muted-foreground">{t('loadingStatuses')}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const desiredOrder = [
                    'PENDING',
                    'APPROVED',
                    'DENIED',
                    'CONTACTED',
                    'PENDING_CONVERSION',
                    'UNQUALIFIED',
                    'DONE',
                  ];
                  const data = Array.isArray(leadStatusData) ? leadStatusData : [];
                  const ordered = desiredOrder.map((s) => data.find((it) => it.status === s) || { status: s, count: 0, color: 'bg-muted' });

                  if (data.length === 0) {
                    return <p className="text-sm text-muted-foreground py-4 text-center">{t('noLeads')}</p>;
                  }

                  return ordered.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium">{t(`statuses.${item.status}`)}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ));
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
            <CardDescription>
              {t('recentActivityDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {t('noActivity')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('checkLater')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
          <CardDescription>
            {t('quickActionsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/leads/add" className="block cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">{t('createLead')}</h3>
                  <p className="text-sm text-muted-foreground">{t('createLeadDesc')}</p>
                </div>
              </div>
            </Link>
            <Link to="/dealers/add" className="block cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-success" />
                <div>
                  <h3 className="font-medium">{t('addDealer')}</h3>
                  <p className="text-sm text-muted-foreground">{t('addDealerDesc')}</p>
                </div>
              </div>
            </Link>
            <div className="cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-info" />
                <div>
                  <h3 className="font-medium">{t('inventoryCheck')}</h3>
                  <p className="text-sm text-muted-foreground">{t('inventoryCheckDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
