import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  Settings,
  ChevronDown,
  KeyRound,
  Moon,
  Sun,
  Languages,
  LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthContext';
import { useTheme } from '@/app/providers/theme/useTheme';
import { useLocale } from '@/i18n/useLocale';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/utils';
import { sidebarNavItems } from '@/app/routes/routes';

const Sidebar = ({ onClose }) => {
  const { user, hasAnyRole, logout } = useAuth();
  const { t } = useTranslation(['common', 'routes', 'layout']);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith('/change-password')
  );

  const filteredNavigation = sidebarNavItems.filter((item) =>
    hasAnyRole(item.roles)
  );

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const nextLocale = locale === 'en' ? 'ar' : 'en';
  const isChangePasswordActive = location.pathname.startsWith('/change-password');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="relative flex h-16 shrink-0 items-center justify-center px-5">
        <div className="flex items-center gap-2.5">
          <img
            src="/brand/treadx-logo.png"
            alt=""
            className="h-8 w-8 object-contain"
            width={32}
            height={32}
          />
          <h2 className="text-2xl font-bold tracking-tight text-sidebar-foreground">
            Tread<span className="text-primary">X</span>
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute end-3 top-1/2 -translate-y-1/2 lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/dashboard' &&
              item.href !== '/' &&
              location.pathname.startsWith(item.href)) ||
            ((item.href === '/' || item.href === '/dashboard') &&
              (location.pathname === '/' || location.pathname === '/dashboard'));

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-primary/60'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <span className="flex items-center min-w-0">
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span className="ms-3 truncate">
                  {item.labelKey ? t(`routes:${item.labelKey}`) : item.name}
                </span>
              </span>
              {isActive && (
                <span className="ms-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground">
                  Active
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Settings accordion: theme, language, change password */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            className={cn(
              'flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
              settingsOpen || isChangePasswordActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-primary/60'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <span className="flex items-center">
              <Settings
                className={cn(
                  'h-5 w-5',
                  settingsOpen || isChangePasswordActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <span className="ms-3">{t('routes:settings')}</span>
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                settingsOpen && 'rotate-180'
              )}
            />
          </button>

          {settingsOpen && (
            <div className="mt-1 ms-2 space-y-1 border-s border-sidebar-border ps-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>
                  {isDark
                    ? t('layout:theme.switchToLight')
                    : t('layout:theme.switchToDark')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLocale(nextLocale)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Languages className="h-4 w-4" />
                <span>
                  {t('layout:locale.switchLanguage')} ({nextLocale.toUpperCase()})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/change-password');
                  onClose?.();
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isChangePasswordActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <KeyRound className="h-4 w-4" />
                <span>{t('routes:changePassword')}</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Account + Logout */}
      <div className="shrink-0 p-4 space-y-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 rounded-xl bg-muted/40 border border-border/60 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary truncate">
              {user?.roleName || ''}
            </p>
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            {user?.email && (
              <span className="inline-block mt-1 max-w-full truncate rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {user.email}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-1 text-sm font-medium text-sidebar-foreground/90 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t('common:actions.logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
