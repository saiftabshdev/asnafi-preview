import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import type { RestaurantInfo } from '../../../types/restaurant';
import { MenuLogo } from './MenuLogo';

type Props = {
  restaurant: RestaurantInfo;
  themeColor: string;
  isRtl: boolean;
  onBack?: () => void;
};

export function AboutView({ restaurant, themeColor, isRtl, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className={isRtl ? 'rotate-180' : ''} size={16} />
          {t('Back to menu')}
        </button>
      )}

      <div className="flex flex-col items-center text-center gap-4">
        <MenuLogo restaurant={restaurant} maxHeight={80} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{restaurant.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {restaurant.address && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <MapPin className="shrink-0 mt-0.5" size={18} style={{ color: themeColor }} />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{restaurant.address}</p>
              {restaurant.mapLink && (
                <a
                  href={restaurant.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm mt-1 inline-block hover:underline"
                  style={{ color: themeColor }}
                >
                  {t('View on map')}
                </a>
              )}
            </div>
          </div>
        )}

        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone}`}
            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-colors"
          >
            <Phone size={18} style={{ color: themeColor }} />
            <span className="text-gray-900 dark:text-white">{restaurant.phone}</span>
          </a>
        )}

        {restaurant.email && (
          <a
            href={`mailto:${restaurant.email}`}
            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-colors"
          >
            <Mail size={18} style={{ color: themeColor }} />
            <span className="text-gray-900 dark:text-white">{restaurant.email}</span>
          </a>
        )}

        {restaurant.operatingHours && restaurant.operatingHours.length > 0 && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} style={{ color: themeColor }} />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('Opening hours')}</h3>
            </div>
            <div className="space-y-2">
              {restaurant.operatingHours.map((h) => (
                <div key={h.day} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{h.day}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {h.isClosed ? t('Closed') : `${h.open} – ${h.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(restaurant.socialLinks?.instagram ||
        restaurant.socialLinks?.facebook ||
        restaurant.socialLinks?.twitter ||
        restaurant.socialLinks?.website) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          {restaurant.socialLinks.instagram && (
            <a
              href={restaurant.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Instagram size={18} />
            </a>
          )}
          {restaurant.socialLinks.facebook && (
            <a
              href={restaurant.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Facebook size={18} />
            </a>
          )}
          {restaurant.socialLinks.twitter && (
            <a
              href={restaurant.socialLinks.twitter}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Twitter size={18} />
            </a>
          )}
          {restaurant.socialLinks.website && (
            <a
              href={restaurant.socialLinks.website}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Globe size={18} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
