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

import Dashboard from '../../features/dashboard';
import LeadsList from '../../features/leads/pages/LeadsList';
import AddLead from '../../features/leads/pages/AddLead';
import EditLead from '../../features/leads/pages/EditLead';
import LeadDetail from '../../features/leads/pages/LeadDetail';
import LeadsApproval from '../../features/leads/pages/LeadsApproval';
import VendorsList from '../../features/vendors/pages/VendorsList';
import AddVendor from '../../features/vendors/pages/AddVendor';
import EditVendor from '../../features/vendors/pages/EditVendor';
import VendorDetail from '../../features/vendors/pages/VendorDetail';
import SubscriptionPlans from '../../features/subscriptions/pages/SubscriptionPlans';
import Subscriptions from '../../features/subscriptions/pages/Subscriptions';
import {
  UsersManagement,
  RolesManagement,
  ChangePassword,
} from '../../features/access-control';
import { LoginForm } from '../../features/auth';

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
    labelKey: 'dashboard',
    icon: LayoutDashboard,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER'],
    showInSidebar: true,
    sidebarPath: '/dashboard',
  },
  {
    path: 'leads',
    element: LeadsList,
    labelKey: 'leads',
    icon: Users,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
    showInSidebar: true,
  },
  {
    path: 'leads/add',
    element: AddLead,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
  },
  {
    path: 'leads/:id',
    element: LeadDetail,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
  },
  {
    path: 'leads/:id/edit',
    element: EditLead,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
  },
  {
    path: 'leads-approval',
    element: LeadsApproval,
    labelKey: 'leadsApproval',
    icon: CheckCircle,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER'],
    showInSidebar: true,
  },
  {
    path: 'vendors',
    element: VendorsList,
    labelKey: 'vendors',
    icon: Building2,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
    showInSidebar: true,
  },
  {
    path: 'vendors/add',
    element: AddVendor,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER'],
  },
  {
    path: 'vendors/:id',
    element: VendorDetail,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
  },
  {
    path: 'vendors/:id/edit',
    element: EditVendor,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER'],
  },
  {
    path: 'subscription-plans',
    element: SubscriptionPlans,
    labelKey: 'subscriptionPlans',
    icon: CreditCard,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
    showInSidebar: true,
  },
  {
    path: 'subscriptions',
    element: Subscriptions,
    labelKey: 'subscriptions',
    icon: CreditCard,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER'],
    showInSidebar: true,
  },
  {
    path: 'users',
    element: UsersManagement,
    labelKey: 'users',
    icon: Users,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER'],
    showInSidebar: true,
  },
  {
    path: 'roles',
    element: RolesManagement,
    labelKey: 'roles',
    icon: Settings,
    roles: ['SYSTEM_ADMIN'],
    showInSidebar: true,
  },
  {
    path: 'change-password',
    element: ChangePassword,
    labelKey: 'changePassword',
    icon: Settings,
    roles: ['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT'],
    showInSidebar: true,
  },
  {
    path: 'inventory',
    labelKey: 'inventory',
    icon: Truck,
    roles: ['SYSTEM_ADMIN'],
    showInSidebar: true,
    placeholder: true,
  },
  {
    path: 'reports',
    labelKey: 'reports',
    icon: BarChart3,
    roles: ['SYSTEM_ADMIN',],
    showInSidebar: true,
    placeholder: true,
  },
  {
    path: 'settings',
    labelKey: 'settings',
    icon: Settings,
    roles: ['SYSTEM_ADMIN'],
    showInSidebar: true,
    placeholder: true,
  },
];

export const sidebarNavItems = protectedRoutes
  .filter((r) => r.showInSidebar)
  .map((r) => ({
    name: r.labelKey,
    labelKey: r.labelKey,
    href: r.sidebarPath || `/${r.path}`,
    icon: r.icon,
    roles: r.roles,
  }));

/** Default route after login and when redirecting away from `/` without dashboard access. */
export function getHomePathForRole(roleName) {
  switch (roleName) {
    case 'SYSTEM_ADMIN':
    case 'SALES_MANAGER':
      return '/';
    case 'SALES_AGENT':
      return '/leads';
    default:
      return '/leads';
  }
}
