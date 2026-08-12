import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, ChevronDown } from 'lucide-react';
import type { OperatingHours } from '../../../types/restaurant';
import { cn } from '../../../lib/utils';

type Props = {
  hours: OperatingHours[];
  themeColor?: string;
  className?: string;
  compact?: boolean;
};

export function OperatingHoursDropdown({ hours, themeColor, className, compact }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
          compact ? 'p-2 text-xs' : 'px-3 py-2 text-sm font-medium',
        )}
        aria-expanded={open}
      >
        <Clock className={compact ? 'w-4 h-4' : 'w-4 h-4'} style={themeColor ? { color: themeColor } : undefined} />
        {!compact && <span>{t('Opening hours')}</span>}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-50 min-w-[200px] rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-2 end-0">
          {hours.map((h) => (
            <div
              key={h.day}
              className="flex justify-between gap-4 px-4 py-1.5 text-xs text-gray-700 dark:text-gray-300"
            >
              <span className="font-medium">{h.day}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {h.isClosed ? t('Closed') : `${h.open} – ${h.close}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
