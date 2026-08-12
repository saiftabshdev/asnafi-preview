import type { CSSProperties, ReactNode } from 'react';
import { MenuLogo } from './MenuLogo';
import { CategoryIcon } from './CategoryIcon';
import type { Category, RestaurantInfo } from '../../../types/restaurant';
import { cn } from '../../../lib/utils';

type Props = {
  restaurant: RestaurantInfo;
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  className?: string;
  logoMaxHeight?: number;
  accentColor?: string;
  /** Sidebar surface styles */
  surfaceClassName?: string;
  /** Active category button styles */
  activeClassName?: string;
  inactiveClassName?: string;
  showLogo?: boolean;
  headerSlot?: ReactNode;
  surfaceStyle?: CSSProperties;
};

export function CategorySidebar({
  restaurant,
  categories,
  activeCategoryId,
  onSelectCategory,
  className,
  logoMaxHeight = 56,
  accentColor,
  surfaceClassName,
  activeClassName,
  inactiveClassName,
  showLogo = true,
  headerSlot,
  surfaceStyle,
}: Props) {
  return (
    <aside
      className={cn('flex flex-col self-stretch min-h-full shrink-0', surfaceClassName, className)}
      style={surfaceStyle}
    >
      {showLogo && (
        <div className="flex flex-col items-center pt-6 pb-4 px-4 shrink-0">
          <MenuLogo restaurant={restaurant} maxHeight={logoMaxHeight} className="mb-1" />
          {headerSlot}
        </div>
      )}

      <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto min-h-0">
        {categories.map((cat) => {
          const active = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-start',
                active ? activeClassName : inactiveClassName,
              )}
              style={
                active && accentColor
                  ? { backgroundColor: `${accentColor}33`, color: accentColor, borderColor: `${accentColor}4d` }
                  : undefined
              }
            >
              <CategoryIcon name={cat.icon} className="w-4 h-4 shrink-0" />
              <span className="truncate">{cat.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
