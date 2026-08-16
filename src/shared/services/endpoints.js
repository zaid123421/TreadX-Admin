export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  CURRENT_USER: '/users/me',

  LEADS: '/leads',
  LEAD_BY_ID: (id) => `/leads/${id}`,
  LEAD_VALIDATE: (id) => `/leads/${id}/validate`,
  LEAD_INITIATE_CONTACT: (id) => `/leads/${id}/initiate-contact`,
  LEAD_FILE_PREVIEW: (id) => `/leads/${id}/preview`,
  LEAD_FILE_DOWNLOAD: (id) => `/leads/${id}/file`,
  LEADS_BY_STATUS: '/leads/status',
  MY_LEADS: '/leads/my-leads',
  LEAD_TAKE: (id) => `/leads/${id}/take`,
  LEAD_ASSIGN: (id) => `/leads/${id}/assign`,
  LEADS_HISTORY_BY_LEAD: (leadId) => `/leads-history/lead/${leadId}`,

  DEALERS: '/dealers',
  ENHANCED_DEALERS_CREATE: '/enhanced-dealers/create',
  DEALER_BY_ID: (id) => `/dealers/${id}`,
  DEALER_QUOTA: (id) => `/dealers/${id}/quota`,
  DEALER_PRIMARY_WAREHOUSE: (id) => `/dealers/${id}/primary-warehouse`,
  DEALERS_BY_STATUS: '/dealers/status',
  DEALERS_SEARCH: '/dealers/search',

  /** Hierarchical address lookups for leads (GET base lists) */
  ADDRESS_COUNTRIES: '/addresses/base/countries',
  /** Path param is usually numeric country PK; when API returns id=null, callers may use iso3 (see addressApiService fallbacks). */
  ADDRESS_PROVINCES_BY_COUNTRY: (countryId) =>
    `/addresses/base/countries/${countryId}/provinces`,
  ADDRESS_CITIES_BY_PROVINCE: (stateId) =>
    `/addresses/base/provinces/${stateId}/cities`,
  /** Optional query-style lookups if path-by-id fails (backend-dependent). */
  ADDRESS_PROVINCES_QUERY: '/addresses/base/provinces',
  ADDRESS_CITIES_QUERY: '/addresses/base/cities',

  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  USER_PERMISSIONS: (id) => `/users/${id}/permissions`,

  // TERRITORIES: '/territories',
  // TERRITORY_BY_CODE: (code) => `/territories/${code}`,
  // TERRITORY_HIERARCHY: (code) => `/territories/${code}/hierarchy`,
  // TERRITORY_CHILDREN: (code) => `/territories/${code}/children`,
  // TERRITORIES_BY_LEVEL: (level) => `/territories/level/${level}`,
  // TERRITORY_CODES: '/territories/codes',

  // USER_TERRITORIES: (userId) => `/user-territories/users/${userId}/territories`,
  // USER_ACCESSIBLE_TERRITORIES: (userId) =>
  //   `/user-territories/users/${userId}/accessible-territories`,
  // MY_TERRITORIES: '/user-territories/my-territories',

  SUBSCRIPTION_PLANS: '/plans',
  SUBSCRIPTION_PLANS_ACTIVE: '/plans/active',
  SUBSCRIPTION_PLAN_BY_ID: (id) => `/plans/${id}`,
  SUBSCRIPTION_PLANS_BY_USER_COUNT: '/plans/by-user-count',

  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_BY_ID: (id) => `/subscriptions/${id}`,
  SUBSCRIPTIONS_BY_DEALER: (dealerId) => `/subscriptions/dealer/${dealerId}`,
  ACTIVE_SUBSCRIPTION_BY_DEALER: (dealerId) =>
    `/subscriptions/dealer/${dealerId}/active`,
  DEALER_SERVICE_DAYS: (dealerId) => `/subscriptions/dealer/${dealerId}/service-days`,
  SUBSCRIPTION_CANCEL: (id) => `/subscriptions/${id}/cancel`,
  SUBSCRIPTION_RENEW: (id) => `/subscriptions/${id}/renew`,
  SUBSCRIPTION_UPDATE: (id) => `/subscriptions/${id}`,

  CONVERSION_REQUESTS_ENDPOINT: `/conversion-requests/assigned/pending`,
  CONVERSION_REQUEST_CREATE: (leadId) => `/conversion-requests/lead/${leadId}`,
  CONVERSION_REQUEST_DECISION: (requestId) => `/conversion-requests/${requestId}/decision`,

  ROLES: '/roles',
  ROLE_BY_ID: (id) => `/roles/${id}`,
  ROLE_PERMISSIONS: (id) => `/roles/${id}/permissions`,

  /** Global permissions catalog (GET) — optional extras on user create */
  PERMISSIONS: '/permissions',

  /** WMS warehouse provisioning (System Administrator only) */
  WMS_WAREHOUSES: '/wms/warehouses',
  WMS_WAREHOUSE_BY_ID: (id) => `/wms/warehouses/${id}`,
  WMS_WAREHOUSE_STATUS: (id) => `/wms/warehouses/${id}/status`,
  WMS_WAREHOUSES_CAPACITY_OVERVIEW: '/wms/warehouses/capacity-overview',

  /** Report exports (paths relative to /api/v1 base) */
  REPORT_SALES_PIPELINE_EXCEL: '/reports/sales-pipeline/export',
  REPORT_SALES_PIPELINE_PDF: '/reports/sales-pipeline/export/pdf',
  REPORT_SUBSCRIPTIONS_EXCEL: '/reports/subscriptions/export',
  REPORT_SUBSCRIPTIONS_PDF: '/reports/subscriptions/export/pdf',
  REPORT_ORDERS_EXCEL: '/reports/orders/export',
  REPORT_ORDERS_PDF: '/reports/orders/export/pdf',
  REPORT_DEALER_TIRES_EXCEL: (dealerId) => `/reports/dealers/${dealerId}/tires/export`,
  REPORT_DEALER_TIRES_PDF: (dealerId) => `/reports/dealers/${dealerId}/tires/export/pdf`,
  REPORT_WMS_OCCUPANCY_EXCEL: '/wms/reports/occupancy/export',
  REPORT_WMS_OCCUPANCY_PDF: '/wms/reports/occupancy/export/pdf',
  REPORT_WMS_PENDING_EXCEL: '/wms/reports/pending/export',
  REPORT_WMS_PENDING_PDF: '/wms/reports/pending/export/pdf',
  REPORT_WMS_INVENTORY_EXCEL: '/wms/reports/inventory/export',
  REPORT_WMS_INVENTORY_PDF: '/wms/reports/inventory/export/pdf',
  REPORT_WMS_SLA_EXCEL: '/wms/reports/sla/export',
  REPORT_WMS_SLA_PDF: '/wms/reports/sla/export/pdf',
  REPORT_WMS_PERFORMANCE_EXCEL: '/wms/reports/performance/export',
  REPORT_WMS_PERFORMANCE_PDF: '/wms/reports/performance/export/pdf',
};
