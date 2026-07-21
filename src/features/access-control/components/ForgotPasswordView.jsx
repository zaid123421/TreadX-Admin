import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { cn } from '@/shared/utils/utils';

const BRAND_LOGO = '/brand/treadx-logo.png';
const BRAND_BG = '/brand/login-bg-pattern.png';

export function ForgotPasswordView({
  email,
  setEmail,
  loading,
  error,
  success,
  onSubmit,
}) {
  const { t } = useTranslation(['auth', 'common']);

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0e12] lg:flex-row">
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
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('common:appName')}
          </h1>
          <p className="mt-2 text-lg font-medium text-white/80">{t('auth:adminPanel')}</p>
          <div className="my-6 h-px w-24 bg-white/20" />
          <p className="text-sm text-white/60">{t('auth:crmTagline')}</p>
        </div>
      </section>

      <section className="flex flex-1 flex-col justify-center bg-[#12141a] px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16 lg:py-12">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth:backToSignIn')}
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t('auth:forgotPasswordTitle')}
            </h2>
            <p className="mt-2 text-sm text-white/55">{t('auth:forgotPasswordSubtitle')}</p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-6 py-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {t('auth:forgotPasswordSuccessTitle')}
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  {t('auth:forgotPasswordSuccessMessage', { email })}
                </p>
              </div>

              <Button asChild className="h-11 w-full font-semibold shadow-lg shadow-primary/15">
                <Link to="/login">{t('auth:backToSignIn')}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-red-500/40 bg-red-950/40 text-red-100">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-white/70">
                  {t('auth:adminEmail')}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth:emailPlaceholder')}
                    required
                    disabled={loading}
                    className="h-11 border-white/10 bg-white/5 ps-10 text-white placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-primary/25"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="mt-2 h-11 w-full font-semibold shadow-lg shadow-primary/15"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('auth:forgotPasswordSending')}
                  </>
                ) : (
                  t('auth:forgotPasswordSubmit')
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
