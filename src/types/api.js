// API Types based on TreadX OpenAPI specification

// Lead Status Enum
export const LeadStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED', 
  DENIED: 'DENIED',
  CONTACTED: 'CONTACTED',
  ONBOARDED: 'ONBOARDED',
  DONE: 'DONE'
};

// Lead Source Enum
export const LeadSource = {
  GOVERNMENT: 'GOVERNMENT',
  ADS: 'ADS'
};

// Contact Method Enum
export const ContactMethod = {
  MAIL_EMAIL: 'MAIL_EMAIL',
  TEXT: 'TEXT',
  PHONE: 'PHONE',
  OTHER: 'OTHER'
};

// Vendor Status Enum
export const VendorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

// Territory Level Enum
export const TerritoryLevel = {
  DISTRICT: 'DISTRICT',
  CITY: 'CITY',
  PROVINCE: 'PROVINCE',
  COUNTRY: 'COUNTRY'
};

// User Roles (based on API patterns)
export const UserRole = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_AGENT: 'SALES_AGENT',
  VENDOR_ADMIN: 'VENDOR_ADMIN',
  VENDOR_EMPLOYEE: 'VENDOR_EMPLOYEE',
  VENDOR_TECHNICIAN: 'VENDOR_TECHNICIAN'
};

// Billing Cycle Enum
export const BillingCycle = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY'
};

// Lead Request DTO
export const defaultLeadRequest = {
  businessName: '',
  phoneNumber: '',
  streetNumber: '',
  streetName: '',
  aptUnitBldg: '',
  postalCode: '',
  source: LeadSource.GOVERNMENT,
  sourceUrl: '',
  uploadedFile: '',
  status: LeadStatus.PENDING,
  notes: '',
  vendorId: null
};

// Lead Response DTO
export const defaultLeadResponse = {
  id: null,
  businessName: '',
  phoneNumber: '',
  streetNumber: '',
  streetName: '',
  aptUnitBldg: '',
  postalCode: '',
  city: '',
  province: '',
  country: '',
  formattedAddress: '',
  source: LeadSource.GOVERNMENT,
  sourceUrl: '',
  uploadedFile: '',
  previewUrl: '',
  status: LeadStatus.PENDING,
  notes: '',
  vendorId: null,
  vendorUniqueId: '',
  createdAt: '',
  updatedAt: '',
  addedBy: null,
  addedByName: '',
  lastModifiedBy: null,
  lastModifiedByName: '',
  validatedBy: null,
  validatedByFirstName: '',
  validatedByLastName: '',
  validatedAt: '',
  contactMethod: null,
  contactMethodDetails: '',
  extensionNumber: '',
  contactName: '',
  position: '',
  addedByManager: false,
  assignedTo: null,
  assignedToFirstName: '',
  assignedToLastName: '',
  assignedAt: null
};

// Vendor Request DTO
export const defaultVendorRequest = {
  leadId: null,
  legalName: '',
  businessName: '',
  streetNumber: '',
  streetName: '',
  aptUnitBldg: '',
  postalCode: '',
  email: '',
  phoneNumber: '',
  status: VendorStatus.ACTIVE
};

// Vendor Response DTO
export const defaultVendorResponse = {
  id: null,
  legalName: '',
  businessName: '',
  email: '',
  phoneNumber: '',
  vendorUniqueId: '',
  status: VendorStatus.ACTIVE,
  streetNumber: '',
  streetName: '',
  aptUnitBldg: '',
  postalCode: '',
  totalUsers: 0,
  userRoles: {
    VENDOR_ADMIN: 0,
    VENDOR_EMPLOYEE: 0,
    VENDOR_TECHNICIAN: 0
  }
};

// Subscription Plan Request DTO
export const defaultSubscriptionPlanRequest = {
  planName: '',
  description: '',
  price: 0,
  billingCycle: BillingCycle.MONTHLY,
  maxTireStorage: 0,
  maxUsers: 0,
  features: [],
  isActive: true
};

// Subscription Plan Response DTO
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
  updatedAt: ''
};

// User Response DTO
export const defaultUserResponse = {
  id: null,
  email: '',
  firstName: '',
  lastName: '',
  position: '',
  role: null,
  additionalPermissions: [],
  createdAt: '',
  updatedAt: '',
  createdBy: null,
  updatedBy: null,
  active: true,
  system: false
};

// Territory Response DTO
export const defaultTerritoryResponse = {
  id: null,
  code: '',
  name: '',
  level: TerritoryLevel.CITY,
  parentTerritoryCode: '',
  databaseName: '',
  isActive: true,
  description: '',
  timezone: '',
  currency: '',
  createdAt: '',
  updatedAt: '',
  createdBy: null,
  updatedBy: null,
  territoryUniqueId: '',
  parentUniqueId: '',
  childTerritoryCodes: [],
  descendantTerritoryCodes: [],
  ancestorTerritoryCodes: [],
  totalChildTerritories: 0,
  totalDescendantTerritories: 0
};

// Lead Validation Request
export const defaultLeadValidationRequest = {
  status: LeadStatus.PENDING,
  notes: ''
};

// Initiate Contact Request
export const defaultInitiateContactRequest = {
  contactMethod: ContactMethod.PHONE,
  contactMethodDetails: '',
  extensionNumber: '',
  contactName: '',
  position: ''
};

// Authentication Request
export const defaultAuthRequest = {
  email: '',
  password: ''
};

// Authentication Response
export const defaultAuthResponse = {
  token: '',
  email: '',
  firstName: '',
  lastName: '',
  role: ''
};

// Pagination Response
export const defaultPageResponse = {
  totalElements: 0,
  totalPages: 0,
  size: 10,
  content: [],
  number: 0,
  sort: [],
  first: true,
  last: true,
  numberOfElements: 0,
  pageable: null,
  empty: true
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/v1/users/login',
  CURRENT_USER: '/api/v1/users/me',
  
  // Leads
  LEADS: '/api/v1/leads',
  LEAD_BY_ID: (id) => `/api/v1/leads/${id}`,
  LEAD_VALIDATE: (id) => `/api/v1/leads/${id}/validate`,
  LEAD_INITIATE_CONTACT: (id) => `/api/v1/leads/${id}/initiate-contact`,
  LEAD_FILE_PREVIEW: (id) => `/api/v1/leads/${id}/preview`,
  LEAD_FILE_DOWNLOAD: (id) => `/api/v1/leads/${id}/file`,
  LEADS_BY_STATUS: '/api/v1/leads/status',
  MY_LEADS: '/api/v1/leads/my-leads',
  LEAD_TAKE: (id) => `/api/v1/leads/${id}/take`,
  
  // Vendors
  VENDORS: '/api/v1/vendors',
  VENDOR_BY_ID: (id) => `/api/v1/vendors/${id}`,
  VENDORS_BY_STATUS: '/api/v1/vendors/status',
  VENDORS_SEARCH: '/api/v1/vendors/search',
  
  // Users
  USERS: '/api/v1/users',
  USER_BY_ID: (id) => `/api/v1/users/${id}`,
  USER_PERMISSIONS: (id) => `/api/v1/users/${id}/permissions`,
  
  // Territories
  TERRITORIES: '/api/v1/territories',
  TERRITORY_BY_CODE: (code) => `/api/v1/territories/${code}`,
  TERRITORY_HIERARCHY: (code) => `/api/v1/territories/${code}/hierarchy`,
  TERRITORY_CHILDREN: (code) => `/api/v1/territories/${code}/children`,
  TERRITORIES_BY_LEVEL: (level) => `/api/v1/territories/level/${level}`,
  TERRITORY_CODES: '/api/v1/territories/codes',
  
  // User Territories
  USER_TERRITORIES: (userId) => `/api/v1/user-territories/users/${userId}/territories`,
  USER_ACCESSIBLE_TERRITORIES: (userId) => `/api/v1/user-territories/users/${userId}/accessible-territories`,
  MY_TERRITORIES: '/api/v1/user-territories/my-territories',
  
  // Subscription Plans
  SUBSCRIPTION_PLANS: '/api/v1/subscription-plans',
  SUBSCRIPTION_PLANS_ACTIVE: '/api/v1/subscription-plans/active',
  SUBSCRIPTION_PLAN_BY_ID: (id) => `/api/v1/subscription-plans/${id}`
};

// Helper functions
export const getStatusColor = (status) => {
  switch (status) {
    case LeadStatus.PENDING:
      return { backgroundColor: '#FFBF00', color: '#000' };
    case LeadStatus.APPROVED:
      return { backgroundColor: '#28A745', color: '#fff' };
    case LeadStatus.DENIED:
      return { backgroundColor: '#DC3545', color: '#fff' };
    case LeadStatus.CONTACTED:
      return { backgroundColor: '#007BFF', color: '#fff' };
    case LeadStatus.ONBOARDED:
      return { backgroundColor: '#EA580C', color: '#fff' };
    case LeadStatus.DONE:
      return { backgroundColor: '#343A40', color: '#fff' };
    default:
      return { backgroundColor: '#F3F4F6', color: '#374151' };
  }
};

export const getStatusLabel = (status) => {
  return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export const getContactMethodLabel = (method) => {
  switch (method) {
    case ContactMethod.MAIL_EMAIL:
      return 'Email';
    case ContactMethod.TEXT:
      return 'Text Message';
    case ContactMethod.PHONE:
      return 'Phone Call';
    case ContactMethod.OTHER:
      return 'Other';
    default:
      return method;
  }
};

export const formatAddress = (vendor) => {
  const parts = [
    vendor.streetNumber,
    vendor.streetName,
    vendor.aptUnitBldg,
    vendor.postalCode
  ].filter(Boolean);
  return parts.join(', ');
};

export const formatFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ');
};

