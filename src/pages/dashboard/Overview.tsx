import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, BarChart3, Calendar, Eye, QrCode, Star, UtensilsCrossed } from 'lucide-react';
import { useRestaurant } from '../../hooks/useApi';
import { PageShell } from '../../components/dashboard/ui';
import StatCard from '../../components/dashboard/StatCard';
import QuickActions from '../../components/dashboard/QuickActions';
import MenuHealth from '../../components/dashboard/MenuHealth';
import PendingPanel from '../../components/dashboard/PendingPanel';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { RestaurantProfileBanner } from '../../components/RestaurantProfileBanner';

const RANGES = ['today', 'last7', 'last30'] as const;

export default function DashboardOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useRestaurant();
  const [range, setRange] = useState<(typeof RANGES)[number]>('last7');

  const categories = data?.categories ?? [];
  const activeItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const show = (v: string) => (isLoading ? '…' : v);

  return (
    <PageShell>
      <SubscriptionBanner />
      <RestaurantProfileBanner info={data?.info} />

      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-float-in">
          <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
            {t('dash.overview_title')}
          </h1>
          <p className="mt-1 text-sm text-muted">{t('dash.overview_subtitle')}</p>
        </div>

        <div className="border-app bg-surface flex items-center gap-1 rounded-xl border p-1 shadow-card animate-float-in">
          <Calendar className="mx-2 h-4 w-4 text-faint" />
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                range === r ? 'bg-brand-500 text-white shadow-sm' : 'text-muted hover:text-main'
              }`}
            >
              {t(`dash.${r}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats — the two on the right have no data source yet (see report) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UtensilsCrossed}
          label={t('dash.stat_active')}
          value={show(String(activeItems))}
          tint="#0984e3"
          delay={0}
        />
        <StatCard
          icon={BarChart3}
          label={t('dash.stat_categories')}
          value={show(String(categories.length))}
          tint="#00b894"
          delay={60}
        />
        <StatCard icon={QrCode} label={t('dash.stat_scans')} value="—" tint="#6c5ce7" delay={120} />
        <StatCard icon={Eye} label={t('dash.stat_views')} value="—" tint="#e17055" delay={180} />
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <QuickActions menuSlug={data?.info.slug} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <PendingPanel
            title={t('dash.weekly_views')}
            icon={Eye}
            messageKey="dash.metrics_pending"
            delay={260}
          />
          <PendingPanel
            title={t('dash.recent_activity')}
            icon={Activity}
            messageKey="dash.activity_pending"
            delay={300}
          />
        </div>
        <div className="space-y-5">
          <PendingPanel
            title={t('dash.popular_items')}
            icon={Star}
            messageKey="dash.popular_pending"
            delay={340}
          />
          <MenuHealth data={data} />
        </div>
      </div>
    </PageShell>
  );
}
