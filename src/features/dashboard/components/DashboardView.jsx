import React from 'react';
import {
  Users,
  Building2,
  Warehouse,
  Boxes,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Link } from 'react-router-dom';

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

/** Theme-aware Recharts tooltip — avoids default black item/label text. */
function ChartHoverTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      {label != null && label !== '' ? (
        <p className="mb-1 text-xs font-medium text-popover-foreground">{label}</p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((entry, index) => {
          const name = entry.name ?? entry.dataKey;
          const rawValue = entry.value;
          const display =
            typeof valueFormatter === 'function'
              ? valueFormatter(rawValue, name, entry)
              : formatNumber(rawValue);

          return (
            <li key={`${name}-${index}`} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: entry.color || entry.payload?.color || 'var(--primary)' }}
              />
              <span className="text-muted-foreground">{name}</span>
              <span className="ms-auto font-semibold tabular-nums text-popover-foreground">
                {display}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CapacitySummaryStat({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
        {formatNumber(value)}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function CapacityPieChart({ capacity, loading, error, t }) {
  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center gap-2 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
        <span className="text-sm">{t('capacityLoading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="flex h-72 items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {error}
      </p>
    );
  }

  const { summary, segments, chartSegments } = capacity || {};
  if (!chartSegments?.length) {
    return (
      <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        {t('capacityEmpty')}
      </p>
    );
  }

  const chartData = chartSegments.map((s) => ({
    ...s,
    label: t(`capacitySegments.${s.key}`, { defaultValue: s.key }),
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <CapacitySummaryStat
          label={t('capacityStats.total')}
          value={summary.totalCapacity}
          hint={t('capacityStats.totalHint')}
        />
        <CapacitySummaryStat
          label={t('capacityStats.used')}
          value={summary.used}
          hint={t('capacityStats.usedHint', { percent: summary.utilizationPercent })}
        />
        <CapacitySummaryStat
          label={t('capacityStats.allocated')}
          value={summary.allocated}
          hint={t('capacityStats.allocatedHint', { percent: summary.allocationPercent })}
        />
        <CapacitySummaryStat
          label={t('capacityStats.warehouses')}
          value={summary.warehouseCount}
          hint={t('capacityStats.warehousesHint', {
            initialized: summary.initializedWarehouseCount,
          })}
        />
      </div>

      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_1.1fr]">
        <div className="relative mx-auto h-56 w-full max-w-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={chartData.length > 1 ? 2 : 0}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartHoverTooltip
                    valueFormatter={(value, _name, entry) =>
                      `${formatNumber(value)} (${entry?.payload?.percent ?? 0}%)`
                    }
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {summary.utilizationPercent}%
            </p>
            <p className="text-[11px] text-muted-foreground">{t('capacityStats.utilization')}</p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {segments.map((segment) => {
            const label = t(`capacitySegments.${segment.key}`);
            const description = t(`capacitySegmentHints.${segment.key}`);
            return (
              <li
                key={segment.key}
                className="flex items-start justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: segment.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatNumber(segment.value)}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">{segment.percent}%</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function LeadStatusChart({ leadStatusData, loading, t }) {
  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center gap-2 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
        <span className="text-sm">{t('loadingStatuses')}</span>
      </div>
    );
  }

  const data = Array.isArray(leadStatusData) ? leadStatusData : [];
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  if (total === 0) {
    return (
      <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        {t('noLeads')}
      </p>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    label: t(`statuses.${item.status}`),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('leadStatusTotal', { count: total })}</p>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              stroke="var(--border)"
            />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              stroke="var(--border)"
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
              content={<ChartHoverTooltip valueFormatter={(value) => formatNumber(value)} />}
            />
            <Bar dataKey="count" name={t('leadCount')} radius={[0, 4, 4, 0]} barSize={16}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        {chartData
          .filter((item) => item.count > 0)
          .map((item) => (
            <Badge key={item.status} variant="secondary" className="gap-1.5 font-normal">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              {item.label}: {item.count}
            </Badge>
          ))}
      </div>
    </div>
  );
}

export function DashboardView({ user, vm }) {
  const { t } = useTranslation('dashboard');
  const {
    totalLeads,
    totalDealers,
    leadStatusData,
    capacity,
    capacityError,
    capacityLoading,
    loading,
  } = vm;

  const capacitySummary = capacity?.summary;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-primary to-info p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t('welcome', { name: user?.firstName || 'User' })}
            </h1>
            <p className="text-primary-foreground/80">{t('welcomeSubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalLeads')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">{formatNumber(totalLeads)}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t('totalLeadsHint')}</p>
              </>
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
              <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">{formatNumber(totalDealers)}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t('dealersHint')}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('capacityStats.used')}</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {capacityLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">
                  {formatNumber(capacitySummary?.used)}
                  <span className="ms-1 text-sm font-normal text-muted-foreground">
                    / {formatNumber(capacitySummary?.totalCapacity)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('capacityStats.usedHint', {
                    percent: capacitySummary?.utilizationPercent ?? 0,
                  })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('capacityStats.warehouses')}</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {capacityLoading ? (
              <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">
                  {formatNumber(capacitySummary?.warehouseCount)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('capacityStats.warehousesHint', {
                    initialized: capacitySummary?.initializedWarehouseCount ?? 0,
                  })}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('leadStatusOverview')}</CardTitle>
            <CardDescription>{t('leadStatusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadStatusChart leadStatusData={leadStatusData} loading={loading} t={t} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('capacityOverview')}</CardTitle>
            <CardDescription>{t('capacityOverviewDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <CapacityPieChart
              capacity={capacity}
              loading={capacityLoading}
              error={capacityError}
              t={t}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
          <CardDescription>{t('quickActionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/leads/add"
              className="block cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">{t('createLead')}</h3>
                  <p className="text-sm text-muted-foreground">{t('createLeadDesc')}</p>
                </div>
              </div>
            </Link>
            <Link
              to="/warehouses"
              className="block cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <Warehouse className="h-8 w-8 text-success" />
                <div>
                  <h3 className="font-medium">{t('viewWarehouses')}</h3>
                  <p className="text-sm text-muted-foreground">{t('viewWarehousesDesc')}</p>
                </div>
              </div>
            </Link>
            <Link
              to="/reports"
              className="block cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-info" />
                <div>
                  <h3 className="font-medium">{t('viewReports')}</h3>
                  <p className="text-sm text-muted-foreground">{t('viewReportsDesc')}</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
