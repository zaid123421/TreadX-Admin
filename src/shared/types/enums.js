// Shared API enums (TreadX OpenAPI)

export const LeadStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
  CONTACTED: 'CONTACTED',
  ONBOARDED: 'ONBOARDED',
  DONE: 'DONE',
};

export const LeadSource = {
  GOVERNMENT: 'GOVERNMENT',
  ADS: 'ADS',
};

export const ContactMethod = {
  MAIL_EMAIL: 'MAIL_EMAIL',
  TEXT: 'TEXT',
  PHONE: 'PHONE',
  OTHER: 'OTHER',
};

export const VendorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const TerritoryLevel = {
  DISTRICT: 'DISTRICT',
  CITY: 'CITY',
  PROVINCE: 'PROVINCE',
  COUNTRY: 'COUNTRY',
};

export const UserRole = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_AGENT: 'SALES_AGENT',
  DEALER_ADMIN: 'DEALER_ADMIN',
  DEALER_TECHNICIAN: 'DEALER_TECHNICIAN',
};

export const BillingCycle = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
};

export const ConversionRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
