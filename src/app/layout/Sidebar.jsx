import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/utils';
import { sidebarNavItems } from '@/app/routes/routes';

const Sidebar = ({ onClose }) => {
  const { user, hasAnyRole } = useAuth();
  const { t } = useTranslation(['common', 'routes']);
  const location = useLocation();

  const filteredNavigation = sidebarNavItems.filter((item) =>
    hasAnyRole(item.roles)
  );

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">{t('common:appName')}</h2>
            <p className="text-xs text-muted-foreground">{t('common:appSubtitle')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-s-2 border-sidebar-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive ? 'text-sidebar-primary' : 'text-muted-foreground'
              )} />
              <span className="ms-3">{item.labelKey ? t(`routes:${item.labelKey}`) : item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-foreground truncate">
              {user?.roleName ? t(`common:roles.${user.roleName}`) : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
