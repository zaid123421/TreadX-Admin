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
