import { API_ENDPOINTS } from '@/shared/services/endpoints';

/** Static report catalog — exports only (no list API). */
export const REPORT_CATALOG = [
  {
    id: 'sales-pipeline',
    categoryKey: 'salesOps',
    nameKey: 'salesPipeline',
    requiresDealer: false,
    excel: API_ENDPOINTS.REPORT_SALES_PIPELINE_EXCEL,
    pdf: API_ENDPOINTS.REPORT_SALES_PIPELINE_PDF,
  },
  {
    id: 'subscriptions',
    categoryKey: 'salesOps',
    nameKey: 'subscriptions',
    requiresDealer: false,
    excel: API_ENDPOINTS.REPORT_SUBSCRIPTIONS_EXCEL,
    pdf: API_ENDPOINTS.REPORT_SUBSCRIPTIONS_PDF,
  },
  {
    id: 'orders',
    categoryKey: 'salesOps',
    nameKey: 'orders',
    requiresDealer: false,
    excel: API_ENDPOINTS.REPORT_ORDERS_EXCEL,
    pdf: API_ENDPOINTS.REPORT_ORDERS_PDF,
  },
  {
    id: 'dealers-tires',
    categoryKey: 'salesOps',
    nameKey: 'dealersTires',
    requiresDealer: true,
    excel: (dealerId) => API_ENDPOINTS.REPORT_DEALER_TIRES_EXCEL(dealerId),
    pdf: (dealerId) => API_ENDPOINTS.REPORT_DEALER_TIRES_PDF(dealerId),
  },
  {
    id: 'occupancy',
    categoryKey: 'platformWarehouse',
    nameKey: 'occupancy',
    requiresDealer: false,
    requiresWarehouse: true,
    excel: API_ENDPOINTS.REPORT_WMS_OCCUPANCY_EXCEL,
    pdf: API_ENDPOINTS.REPORT_WMS_OCCUPANCY_PDF,
  },
  {
    id: 'pending-work',
    categoryKey: 'platformWarehouse',
    nameKey: 'pendingWork',
    requiresDealer: false,
    requiresWarehouse: true,
    excel: API_ENDPOINTS.REPORT_WMS_PENDING_EXCEL,
    pdf: API_ENDPOINTS.REPORT_WMS_PENDING_PDF,
  },
  {
    id: 'inventory',
    categoryKey: 'platformWarehouse',
    nameKey: 'inventory',
    requiresDealer: false,
    requiresWarehouse: true,
    excel: API_ENDPOINTS.REPORT_WMS_INVENTORY_EXCEL,
    pdf: API_ENDPOINTS.REPORT_WMS_INVENTORY_PDF,
  },
  {
    id: 'sla-compliance',
    categoryKey: 'platformWarehouse',
    nameKey: 'slaCompliance',
    requiresDealer: false,
    requiresWarehouse: true,
    excel: API_ENDPOINTS.REPORT_WMS_SLA_EXCEL,
    pdf: API_ENDPOINTS.REPORT_WMS_SLA_PDF,
  },
  {
    id: 'employee-performance',
    categoryKey: 'platformWarehouse',
    nameKey: 'employeePerformance',
    requiresDealer: false,
    requiresWarehouse: true,
    excel: API_ENDPOINTS.REPORT_WMS_PERFORMANCE_EXCEL,
    pdf: API_ENDPOINTS.REPORT_WMS_PERFORMANCE_PDF,
  },
];

export const REPORT_CATEGORIES = ['salesOps', 'platformWarehouse'];
