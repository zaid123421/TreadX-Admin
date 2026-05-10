import React from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, Shield, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { cn } from '@/shared/utils/utils';

const BRAND_LOGO = '/brand/treadx-logo.png';
const BRAND_BG = '/brand/login-bg-pattern.png';

export function LoginFormView({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
  redirectPath,
  handleSubmit,
  demoCredentials,
  fillDemoCredentials,
}) {
  const { t } = useTranslation(['auth', 'common']);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0e12] lg:flex-row">
      {/* Branding panel */}
      <section
        className={cn(
          'relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden px-8 py-10',
          'lg:min-h-screen lg:w-1/2 lg:py-16'
        )}
      >
        <div className="absolute inset-0 bg-[#060708]" aria-hidden />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.85]"
          style={{ backgroundImage: `url(${BRAND_BG})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black/80"
          aria-hidden
        />

        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          <img
            src={BRAND_LOGO}
            alt=""
            className="mb-6 h-32 w-auto object-contain drop-shadow-md sm:h-40"
            width={120}
            height={96}
          />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('common:appName')}</h1>
          <p className="mt-2 text-lg font-medium text-white/80">{t('auth:adminPanel')}</p>
          <div className="my-6 h-px w-24 bg-white/20" />
          <p className="text-sm text-white/60">{t('auth:crmTagline')}</p>
          <p className="mt-10 text-xs text-white/35">{t('auth:crmVersion')}</p>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 flex-col justify-center bg-[#12141a] px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16 lg:py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t('auth:adminSignIn')}</h2>
            <p className="mt-1 text-sm text-white/55">{t('auth:adminSignInSubtitle')}</p>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/35 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/95">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
            <p>{t('auth:adminNotice')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-500/40 bg-red-950/40 text-red-100">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">
                {t('auth:adminEmail')}
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth:emailPlaceholder')}
                  required
                  disabled={loading}
                  className="h-11 border-white/10 bg-white/5 ps-10 text-white placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-primary/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password" className="text-white/70">
                  {t('auth:password')}
                </Label>
               
              </div>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth:passwordPlaceholder')}
                  required
                  disabled={loading}
                  className="h-11 border-white/10 bg-white/5 pe-11 ps-10 text-white placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-primary/25"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-1 top-1/2 h-9 w-9 -translate-y-1/2 text-white/50 hover:bg-white/10 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="w-full text-right">
  <button 
    type="button"
    className="text-xs font-medium text-primary hover:underline"
    onClick={(e) => e.preventDefault()}
  >
    {t('auth:forgotPassword')}
  </button>
</div>
            </div>
            


            <Button
              type="submit"
              className="mt-2 h-11 w-full font-semibold shadow-lg shadow-primary/15"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('auth:signingIn')}
                </>
              ) : (
                t('auth:signIn')
              )}
            </Button>
          </form>

          

          <div className="mt-10 flex flex-col items-center gap-1 text-center text-xs text-white/40">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 opacity-70" aria-hidden />
              <span className="text-white/55">{t('auth:loginFooterBrand')}</span>
            </div>
            <p>{t('auth:loginFooterAudit')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
