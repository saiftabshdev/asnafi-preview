import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Check, Clock, FileText, Languages, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PublicMenuData } from '../../hooks/useApi';
import { LANG_CODES } from '../../lib/translations';

type Step = { icon: LucideIcon; key: string; done: boolean; to: string };

/**
 * Menu readiness is derived from the restaurant payload — every step below
 * checks data the API already returns, so the percentage is real.
 */
function useMenuHealthSteps(data?: PublicMenuData): Step[] {
  return useMemo(() => {
    const categories = data?.categories ?? [];
    const items = categories.flatMap((c) => c.items);
    const hasItems = items.length > 0;

    const allTranslated =
      hasItems &&
      items.every((i) => LANG_CODES.every((l) => (i.nameTranslations?.[l] ?? '').trim())) &&
      categories.every((c) => LANG_CODES.every((l) => (c.nameTranslations?.[l] ?? '').trim()));

    return [
      {
        icon: Camera,
        key: 'dash.step_photos',
        done: hasItems && items.every((i) => Boolean(i.image)),
        to: '/dashboard/menu',
      },
      {
        icon: FileText,
        key: 'dash.step_desc',
        done: hasItems && items.every((i) => Boolean(i.description?.trim())),
        to: '/dashboard/menu',
      },
      {
        icon: Clock,
        key: 'dash.step_hours',
        done: (data?.info.operatingHours?.length ?? 0) > 0,
        to: '/dashboard/restaurant',
      },
      {
        icon: Languages,
        key: 'dash.step_translate',
        done: allTranslated,
        to: '/dashboard/menu',
      },
    ];
  }, [data]);
}

export default function MenuHealth({ data }: { data?: PublicMenuData }) {
  const { t } = useTranslation();
  const steps = useMenuHealthSteps(data);
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div
      className="bg-surface border-app rounded-2xl border p-6 shadow-card animate-float-in"
      style={{ animationDelay: '380ms' }}
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-main">{t('dash.menu_health')}</h3>
        <span className="font-display text-lg font-bold text-brand-500">{pct}%</span>
      </div>
      <p className="mb-4 text-xs text-faint">{t('dash.menu_health_desc')}</p>

      <div className="bg-surface-2 mb-5 h-2 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.to}
              className="flex items-center gap-3 rounded-lg py-1.5 transition hover:opacity-80"
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                  s.done
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-surface-2 text-faint',
                )}
              >
                {s.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  s.done ? 'text-muted line-through' : 'text-main',
                )}
              >
                {t(s.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
