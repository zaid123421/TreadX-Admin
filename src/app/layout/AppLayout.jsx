import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthContext';
import Sidebar from './Sidebar';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import ThemeSwitcher from '@/app/providers/theme/ThemeSwitcher';
import LocaleSwitcher from '@/i18n/LocaleSwitcher';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation(['layout', 'routes', 'common']);
  const { user, logout } = useAuth();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return t('routes:dashboard');
    if (path.startsWith('/leads')) return t('routes:leadsManagement');
    if (path.startsWith('/vendors')) return t('routes:vendorsManagement');
    if (path.startsWith('/profile')) return t('common:actions.profile');
    return t('layout:pageTitleFallback');
  }, [location.pathname, t]);

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0' : 'fixed inset-y-0 left-0 z-50 -translate-x-full'}
          lg:static lg:inset-0 lg:translate-x-0
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 bg-card shadow-sm border-b border-border">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {/* <h1 className="text-xl font-semibold text-foreground">
                {pageTitle}
              </h1> */}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <LocaleSwitcher className="relative flex items-center gap-1" />
              <ThemeSwitcher className="relative" />

              <Button variant="ghost" size="sm" className="relative" title={t('layout:header.notifications')}>
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.roleName ? t(`common:roles.${user.roleName}`) : ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="me-2 h-4 w-4" />
                    <span>{t('common:actions.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="me-2 h-4 w-4" />
                    <span>{t('common:actions.settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="me-2 h-4 w-4" />
                    <span>{t('common:actions.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8 h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>

      
    </div>
  );
};

export default AppLayout;
