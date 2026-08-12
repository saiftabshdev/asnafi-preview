import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { ThemeLangToggle } from '../../ThemeLangToggle';
import { OperatingHoursDropdown } from './OperatingHoursDropdown';
import type { RestaurantInfo } from '../../../types/restaurant';
import { cn } from '../../../lib/utils';

type Props = {
  restaurant: RestaurantInfo;
  themeColor: string;
  search: string;
  setSearch: (value: string) => void;
  isRtl: boolean;
  showSearch?: boolean;
  showHours?: boolean;
  showAboutNav?: boolean;
  activeView?: 'menu' | 'about';
  setActiveView?: (view: 'menu' | 'about') => void;
  startSlot?: ReactNode;
  endSlot?: ReactNode;
  className?: string;
};

export function MenuTemplateHeader({
  restaurant,
  themeColor,
  search,
  setSearch,
  isRtl,
  showSearch = true,
  showHours = true,
  showAboutNav = true,
  activeView = 'menu',
  setActiveView,
  startSlot,
  endSlot,
  className,
}: Props) {
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        'flex items-center gap-3 px-4 lg:px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shrink-0 z-10',
        className,
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2 shrink-0">
        <ThemeLangToggle />
        {startSlot}
      </div>

      {showAboutNav && setActiveView && (
        <nav className="hidden sm:flex items-center gap-1 ms-2">
          <button
            type="button"
            onClick={() => setActiveView('menu')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeView === 'menu'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800',
            )}
            style={activeView === 'menu' ? { backgroundColor: themeColor } : undefined}
          >
            {t('Menu')}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('about')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeView === 'about'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800',
            )}
            style={activeView === 'about' ? { backgroundColor: themeColor } : undefined}
          >
            {t('About Us')}
          </button>
        </nav>
      )}

      {showSearch && (
        <div className="flex-1 max-w-xs relative mx-auto">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none end-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search menu...')}
            className="w-full py-2 pe-10 ps-4 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full outline-none focus:ring-2"
            style={{ ['--tw-ring-color' as string]: `${themeColor}33` }}
          />
        </div>
      )}

      <div className="flex items-center gap-2 ms-auto shrink-0">
        {showHours && restaurant.operatingHours && restaurant.operatingHours.length > 0 && (
          <OperatingHoursDropdown hours={restaurant.operatingHours} themeColor={themeColor} compact />
        )}
        {endSlot}
      </div>
    </header>
  );
}
