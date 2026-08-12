import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';

/**
 * Card shell used for panels whose metric has no data source yet
 * (menu views, QR scans, order counts). Keeps the dashboard's visual
 * rhythm without inventing numbers.
 */
export default function PendingPanel({
  title,
  icon: Icon,
  messageKey,
  delay = 0,
  className = '',
}: {
  title: string;
  icon: LucideIcon;
  messageKey: string;
  delay?: number;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-surface border-app rounded-2xl border p-6 shadow-card animate-float-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="mb-5 font-display text-base font-bold text-main">{title}</h3>
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <span className="bg-surface-2 grid h-12 w-12 place-items-center rounded-2xl text-faint">
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold text-muted">{t('dash.no_data_yet')}</p>
        <p className="max-w-xs text-xs text-faint">{t(messageKey)}</p>
      </div>
    </div>
  );
}
