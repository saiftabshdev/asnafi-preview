import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { getRestaurantProfileMissing } from '../lib/restaurantProfile';
import type { RestaurantInfo } from '../types/restaurant';

const FIELD_LABEL_KEYS: Record<string, string> = {
  name: 'Restaurant Name',
  description: 'Description',
  address: 'Address',
  whatsapp: 'WhatsApp number or link',
};

type Props = {
  info?: Partial<RestaurantInfo> | null;
};

export function RestaurantProfileBanner({ info }: Props) {
  const { t } = useTranslation();
  if (!info) return null;

  const missing = getRestaurantProfileMissing(info);
  if (missing.length === 0) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="text-sm text-amber-800 dark:text-amber-200">
        <p className="font-medium">{t('Complete restaurant profile')}</p>
        <p className="mt-1 text-amber-700 dark:text-amber-300">
          {t('Complete restaurant profile menu hint')}
        </p>
        <ul className="mt-2 list-disc ps-5 space-y-0.5 text-amber-700 dark:text-amber-300">
          {missing.map((field) => (
            <li key={field}>{t(FIELD_LABEL_KEYS[field] ?? field)}</li>
          ))}
        </ul>
        <Link
          to="/dashboard/restaurant"
          className="mt-2 inline-block font-semibold underline hover:no-underline"
        >
          {t('Go to Restaurant Info')}
        </Link>
      </div>
    </div>
  );
}
