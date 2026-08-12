import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Calendar,
  Clock,
  Eye,
  Globe,
  QrCode,
  Smartphone,
  UtensilsCrossed,
} from 'lucide-react';
import { useRestaurant } from '../../hooks/useApi';
import { PageShell } from '../../components/dashboard/ui';
import StatCard from '../../components/dashboard/StatCard';
import PendingPanel from '../../components/dashboard/PendingPanel';

const RANGES = ['today', 'last7', 'last30'] as const;

export default function Analytics() {
  const { t } = useTranslation();
  const { data, isLoading } = useRestaurant();
  const [range, setRange] = useState<(typeof RANGES)[number]>('last7');

  const categories = data?.categories ?? [];
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);

  /** Only ranking we can compute today: categories by how many items they hold. */
  const byItemCount = [...categories]
    .sort((a, b) => b.items.length - a.items.length)
    .slice(0, 5);
  const maxCount = byItemCount[0]?.items.length || 1;

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-float-in">
          <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
            {t('dash.an_title')}
          </h1>
          <p className="mt-1 text-sm text-muted">{t('dash.an_subtitle')}</p>
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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UtensilsCrossed}
          label={t('dash.stat_active')}
          value={isLoading ? '…' : String(totalItems)}
          tint="#0984e3"
        />
        <StatCard
          icon={BarChart3}
          label={t('dash.stat_categories')}
          value={isLoading ? '…' : String(categories.length)}
          tint="#00b894"
          delay={60}
        />
        <StatCard icon={Eye} label={t('dash.stat_views')} value="—" tint="#e17055" delay={120} />
        <StatCard icon={QrCode} label={t('dash.stat_scans')} value="—" tint="#6c5ce7" delay={180} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <PendingPanel
            title={t('dash.an_views_trend')}
            icon={Eye}
            messageKey="dash.metrics_pending"
            delay={220}
          />

          {/* Real: categories ranked by item count */}
          <div
            className="bg-surface border-app rounded-2xl border p-6 shadow-card animate-float-in"
            style={{ animationDelay: '260ms' }}
          >
            <h3 className="mb-5 font-display text-base font-bold text-main">
              {t('dash.an_top_categories')}
            </h3>
            {byItemCount.length === 0 ? (
              <p className="py-8 text-center text-sm text-faint">{t('dash.no_data_yet')}</p>
            ) : (
              <div className="space-y-4">
                {byItemCount.map((c) => (
                  <div key={c.id} className="flex items-center gap-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-main">{c.name}</span>
                        <span className="shrink-0 text-xs text-faint">
                          {c.items.length} {t('dash.mm_items_count')}
                        </span>
                      </div>
                      <div className="bg-surface-2 mt-1.5 h-1.5 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                          style={{ width: `${(c.items.length / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <PendingPanel
            title={t('dash.an_traffic_sources')}
            icon={Globe}
            messageKey="dash.metrics_pending"
            delay={300}
          />
          <PendingPanel
            title={t('dash.an_peak_hours')}
            icon={Clock}
            messageKey="dash.metrics_pending"
            delay={340}
          />
          <PendingPanel
            title={t('dash.an_device')}
            icon={Smartphone}
            messageKey="dash.metrics_pending"
            delay={380}
          />
        </div>
      </div>
    </PageShell>
  );
}
