import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarClock,
  CalendarDays,
  Check,
  CreditCard,
  Crown,
  Sparkles,
  Tag,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { usePlans, useSubscription } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api/client';
import { localizePlans } from '../../lib/localizePlan';
import { PageShell } from '../../components/dashboard/ui';

const ACTIVE_STATUSES = ['TRIALING', 'ACTIVE'];
const PLAN_ICONS: LucideIcon[] = [Zap, Sparkles, Crown];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Subscription() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: subscription, refetch } = useSubscription();
  const [searchParams] = useSearchParams();

  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const polledRef = useRef(false);

  const localizedPlans = useMemo(() => localizePlans(plans, t), [plans, t]);
  const subStatus = user?.subscription?.status ?? 'NONE';
  const hasActive = ACTIVE_STATUSES.includes(subStatus);
  const currentPlanId = hasActive ? (user?.subscription?.planId ?? null) : null;
  const currentPlan = localizedPlans.find((p) => p.id === currentPlanId);
  const canManageBilling = Boolean(subscription?.stripeCustomerId);

  const maxDiscount = plans.length ? Math.max(...plans.map((p) => p.annualDiscount)) : 20;
  const locale = i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'tr' ? 'tr-TR' : 'en-GB';
  const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString(locale) : '—');

  useEffect(() => {
    if (searchParams.get('canceled') === '1') toast.info(t('Checkout canceled'));
  }, [searchParams, t]);

  useEffect(() => {
    if (searchParams.get('success') !== '1' || polledRef.current) return;
    polledRef.current = true;

    (async () => {
      setActivating(true);
      toast.info(t('Payment received activating'));
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const sub = await apiFetch<{ status: string }>('/subscriptions/me');
          if (ACTIVE_STATUSES.includes(sub.status)) {
            await refreshUser();
            await refetch();
            toast.success(t('Subscription activated'));
            setActivating(false);
            return;
          }
        } catch {
          /* retry */
        }
        await sleep(2000);
      }
      await refreshUser();
      await refetch();
      toast.info(t('Payment received pending'));
      setActivating(false);
    })();
  }, [searchParams, refreshUser, refetch, t]);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await apiFetch<{ url: string }>('/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId, billingCycle: annual ? 'YEARLY' : 'MONTHLY' }),
      });
      if (res.url) window.location.href = res.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dash.save_failed'));
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      const res = await apiFetch<{ url: string }>('/subscriptions/portal', { method: 'POST' });
      if (res.url) window.location.href = res.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dash.save_failed'));
    }
  };

  if (plansLoading) {
    return (
      <PageShell>
        <p className="text-sm text-muted">{t('Loading plans')}…</p>
      </PageShell>
    );
  }

  const summary = [
    {
      icon: Tag,
      label: t('dash.sub_type'),
      value:
        subStatus === 'TRIALING'
          ? t('dash.sub_type_trial')
          : subscription?.billingCycle === 'YEARLY'
            ? t('dash.sub_type_annual')
            : subscription?.billingCycle === 'MONTHLY'
              ? t('dash.sub_type_monthly')
              : '—',
      tint: '#6c5ce7',
      badge: true,
    },
    {
      icon: CalendarDays,
      label: t('dash.sub_start_date'),
      value: fmtDate(user?.joinDate),
      tint: '#0984e3',
      ltr: true,
    },
    {
      icon: CalendarClock,
      label: subStatus === 'TRIALING' ? t('dash.sub_trial_ends') : t('dash.sub_next_bill'),
      value: fmtDate(
        subStatus === 'TRIALING'
          ? (subscription?.trialEndsAt ?? user?.subscription?.trialEndsAt)
          : subscription?.currentPeriodEnd,
      ),
      tint: '#e17055',
      ltr: true,
    },
    {
      icon: Wallet,
      label: t('dash.sub_value'),
      value: currentPlan
        ? `$${annual ? currentPlan.annualPrice : currentPlan.monthlyPrice}`
        : t('dash.sub_free'),
      tint: '#00b894',
      ltr: true,
    },
    {
      icon: CreditCard,
      label: t('dash.sub_payment_method'),
      value: canManageBilling ? t('dash.sub_pay_card') : '—',
      tint: '#f59e0b',
    },
  ];

  return (
    <PageShell>
      {/* Header + billing cycle toggle */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="animate-float-in">
          <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
            {t('dash.sub_title')}
          </h1>
          <p className="mt-1 text-sm text-muted">{t('dash.sub_subtitle')}</p>
        </div>

        <div className="border-app bg-surface inline-flex items-center gap-2 rounded-xl border p-1 shadow-card animate-float-in">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-semibold transition',
              !annual ? 'bg-brand-500 text-white shadow-sm' : 'text-muted hover:text-main',
            )}
          >
            {t('dash.sub_monthly')}
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition',
              annual ? 'bg-brand-500 text-white shadow-sm' : 'text-muted hover:text-main',
            )}
          >
            {t('dash.sub_annual')}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                annual
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
              )}
            >
              {t('lp.pricing.save', { percent: maxDiscount })}
            </span>
          </button>
        </div>
      </div>

      {activating && (
        <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
          {t('Payment received activating')}
        </div>
      )}

      {/* Current plan */}
      <div className="border-app bg-surface mb-6 overflow-hidden rounded-2xl border shadow-card animate-float-in">
        <div className="border-app bg-surface-2 flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/25">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-main">
                  {currentPlan?.name ?? '—'}
                </span>
                {hasActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t('dash.sub_active')}
                  </span>
                )}
              </div>
              <div className="text-xs text-faint">{t('dash.sub_current_plan')}</div>
            </div>
          </div>

          {canManageBilling && (
            <button
              type="button"
              onClick={handlePortal}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 sm:self-auto"
            >
              <CreditCard className="h-4 w-4" />
              {t('dash.sub_manage_billing')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-5">
          {summary.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="bg-surface flex items-start gap-3 p-5">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${d.tint}1a`, color: d.tint }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-faint">{d.label}</div>
                  {d.badge ? (
                    <span className="mt-1 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-sm font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      {d.value}
                    </span>
                  ) : (
                    <div
                      className="mt-0.5 truncate text-sm font-bold text-main"
                      dir={d.ltr ? 'ltr' : undefined}
                    >
                      {d.value}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {localizedPlans.map((plan, i) => {
          const Icon = PLAN_ICONS[i % PLAN_ICONS.length];
          const isCurrent = plan.id === currentPlanId;
          return (
            <div
              key={plan.id}
              className={cn(
                'border-app bg-surface relative flex flex-col rounded-2xl border p-6 shadow-card transition-all animate-float-in',
                plan.popular && 'border-brand-500 shadow-lg shadow-brand-500/15',
                isCurrent && 'ring-2 ring-brand-500',
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold text-white shadow-md shadow-brand-500/30">
                  {t('dash.sub_popular')}
                </span>
              )}

              <div className="mb-4 flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-main">{plan.name}</h3>
              </div>

              <div className="border-app mb-5 flex items-baseline gap-1 border-b pb-5" dir="ltr">
                <span className="font-display text-4xl font-bold text-main">
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-sm text-faint">
                  / {annual ? t('dash.sub_year') : t('dash.sub_month')}
                </span>
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || loading === plan.id || activating}
                className={cn(
                  'w-full rounded-xl py-2.5 text-sm font-bold transition disabled:cursor-not-allowed',
                  isCurrent
                    ? 'bg-surface-2 text-faint'
                    : plan.popular
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600'
                      : 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25',
                )}
              >
                {loading === plan.id
                  ? '…'
                  : isCurrent
                    ? t('dash.sub_current')
                    : hasActive
                      ? t('dash.sub_upgrade')
                      : t('Trial note')}
              </button>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
