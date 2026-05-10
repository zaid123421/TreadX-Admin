import { BillingCycle } from '@/shared/types/enums';

export const defaultSubscriptionPlanRequest = {
  planName: '',
  description: '',
  price: 0,
  billingCycle: BillingCycle.MONTHLY,
  maxTireStorage: 1,
  maxUsers: 1,
  features: [],
  isActive: true,
};

export const defaultSubscriptionPlanResponse = {
  id: null,
  planName: '',
  description: '',
  price: 0,
  billingCycle: BillingCycle.MONTHLY,
  maxTireStorage: 0,
  maxUsers: 0,
  features: [],
  isActive: true,
  createdAt: '',
  updatedAt: '',
};
