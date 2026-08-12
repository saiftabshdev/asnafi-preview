import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
  icon: LucideIcon;
  label: string;
  /** Rendered value. Pass "—" when the metric has no data source yet. */
  value: string;
  suffix?: string;
  /** Percentage change vs. the previous period. Omit when unknown. */
  delta?: number;
  /** Sparkline series. Omit when unknown. */
  spark?: number[];
  tint: string;
  delay?: number;
};

function sparkPoints(spark: number[]) {
  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const range = max - min || 1;
  return spark
    .map((v, i) => {
      const x = (i / (spark.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 26 - 2;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  delta,
  spark,
  tint,
  delay = 0,
}: Props) {
  const { t } = useTranslation();
  const hasDelta = typeof delta === 'number';
  const up = (delta ?? 0) >= 0;

  return (
    <div
      className="group bg-surface border-app relative overflow-hidden rounded-2xl border p-5 shadow-card transition-all hover:-translate-y-0.5 animate-float-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted">{label}</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-main">{value}</span>
            {suffix && <span className="text-sm font-semibold text-faint">{suffix}</span>}
          </div>
        </div>
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{ background: `${tint}1a`, color: tint }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {hasDelta ? (
            <>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold',
                  up
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400',
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(delta as number)}%
              </span>
              <span className="text-xs text-faint">{t('dash.vs_last_period')}</span>
            </>
          ) : (
            <span className="text-xs text-faint">{t('dash.no_data_yet')}</span>
          )}
        </div>

        {spark && spark.length > 1 && (
          <svg viewBox="0 0 100 30" className="h-8 w-24 shrink-0" preserveAspectRatio="none">
            <polyline
              points={sparkPoints(spark)}
              fill="none"
              stroke={tint}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
