import { BillingCycle } from '@/shared/types/enums';

export const formatBillingCycleLabel = (cycle) => {
  switch (cycle) {
    case BillingCycle.MONTHLY:
      return 'Monthly';
    case BillingCycle.QUARTERLY:
      return 'Quarterly';
    case BillingCycle.YEARLY:
      return 'Yearly';
    default:
      return cycle;
  }
};

export const formatUsdPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export const WEEKDAY_VALUES = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const WEEKDAY_LABELS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

export const WEEKDAY_SHORT_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

/** @param {string[]} serviceDays */
export const sortServiceDays = (serviceDays = []) =>
  [...serviceDays].sort(
    (a, b) => WEEKDAY_VALUES.indexOf(a) - WEEKDAY_VALUES.indexOf(b),
  );

/** @param {Record<string, unknown> | null | undefined} subscription @param {Record<string, unknown> | null | undefined} plan */
export const resolveServiceDaysCap = (subscription, plan) => {
  const candidates = [
    subscription?.serviceDaysCap,
    subscription?.maxServiceDays,
    subscription?.planMaxServiceDays,
    plan?.serviceDaysCap,
    plan?.maxServiceDays,
    plan?.maxWeeklyServiceDays,
    plan?.weeklyServiceDaysLimit,
  ];

  for (const value of candidates) {
    const cap = Number(value);
    if (Number.isFinite(cap) && cap > 0) return cap;
  }

  return WEEKDAY_VALUES.length;
};

/** @param {Record<string, unknown> | null | undefined} subscription */
export const getSubscriptionServiceDays = (subscription) =>
  sortServiceDays(Array.isArray(subscription?.serviceDays) ? subscription.serviceDays : []);
