import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  CheckCircle
} from 'lucide-react';

import Dashboard from '../pages/Dashboard';
import LeadsList from '../pages/leads/LeadsList';
import AddLead from '../pages/leads/AddLead';
import EditLead from '../pages/leads/EditLead';
import LeadDetail from '../pages/leads/LeadDetail';
import LeadsApproval from '../pages/leads/LeadsApproval';
import VendorsList from '../pages/vendors/VendorsList';
import AddVendor from '../pages/vendors/AddVendor';
import EditVendor from '../pages/vendors/EditVendor';
import VendorDetail from '../pages/vendors/VendorDetail';
import SubscriptionPlans from '../pages/subscription-plans/SubscriptionPlans';
import LoginForm from '../components/auth/LoginForm';

export const publicRoutes = [
  { path: '/login', element: LoginForm },
];

/**
 * Protected routes rendered inside AppLayout.
 * - `showInSidebar`: whether the route appears in the sidebar navigation.
 * - `label` / `icon` / `roles`: used by the Sidebar to render and filter nav items.
 * - Routes without `showInSidebar` (detail / edit pages) are still accessible but hidden from the nav.
 */
export const protectedRoutes = [
  {
    path: '/',
    index: true,
    element: Dashboard,
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['PLATFORM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT', 'admin', 'manager', 'sales_rep', 'mechanic'],
    showInSidebar: true,
    sidebarPath: '/dashboard',
  },
  {
    path: 'leads',
    element: LeadsList,
    label: 'Leads',
    icon: Users,
    roles: ['PLATFORM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT', 'admin', 'manager', 'sales_rep'],
    showInSidebar: true,
  },
  {
    path: 'leads/add',
    element: AddLead,
  },
  {
    path: 'leads/:id',
    element: LeadDetail,
  },
  {
    path: 'leads/:id/edit',
    element: EditLead,
  },
  {
    path: 'leads-approval',
    element: LeadsApproval,
    label: 'Approve Leads',
    icon: CheckCircle,
    roles: ['PLATFORM_ADMIN', 'SALES_MANAGER', 'admin', 'manager'],
    showInSidebar: true,
  },
  {
    path: 'vendors',
    element: VendorsList,
    label: 'Vendors',
    icon: Building2,
    roles: ['PLATFORM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT', 'admin', 'manager', 'sales_rep'],
    showInSidebar: true,
  },
  {
    path: 'vendors/add',
    element: AddVendor,
  },
  {
    path: 'vendors/:id',
    element: VendorDetail,
  },
  {
    path: 'vendors/:id/edit',
    element: EditVendor,
  },
  {
    path: 'subscription-plans',
    element: SubscriptionPlans,
    label: 'Subscription Plans',
    icon: CreditCard,
    roles: ['PLATFORM_ADMIN', 'admin'],
    showInSidebar: true,
  },
  {
    path: 'inventory',
    label: 'Tire Inventory',
    icon: Truck,
    roles: ['PLATFORM_ADMIN', 'SALES_MANAGER', 'admin', 'manager', 'mechanic'],
    showInSidebar: true,
    placeholder: true,
  },
  {
    path: 'reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['PLATFORM_ADMIN', 'admin', 'manager'],
    showInSidebar: true,
    placeholder: true,
  },
  {
    path: 'settings',
    label: 'Settings',
    icon: Settings,
    roles: ['PLATFORM_ADMIN', 'admin'],
    showInSidebar: true,
    placeholder: true,
  },
];

export const sidebarNavItems = protectedRoutes
  .filter((r) => r.showInSidebar)
  .map((r) => ({
    name: r.label,
    href: r.sidebarPath || `/${r.path}`,
    icon: r.icon,
    roles: r.roles,
  }));
