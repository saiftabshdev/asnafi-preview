import {
  UtensilsCrossed,
  Coffee,
  Wine,
  Pizza,
  Salad,
  Beef,
  Fish,
  IceCream,
  Cake,
  Soup,
  Sandwich,
  Egg,
  Apple,
  Cherry,
  Citrus,
  CupSoda,
  Beer,
  Martini,
  Cookie,
  Croissant,
  Drumstick,
  Flame,
  Leaf,
  Milk,
  Popcorn,
  ChefHat,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';

export const FOOD_ICONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'Utensils' },
  { name: 'Coffee', icon: Coffee, label: 'Coffee' },
  { name: 'Wine', icon: Wine, label: 'Wine' },
  { name: 'Pizza', icon: Pizza, label: 'Pizza' },
  { name: 'Salad', icon: Salad, label: 'Salad' },
  { name: 'Beef', icon: Beef, label: 'Beef' },
  { name: 'Fish', icon: Fish, label: 'Fish' },
  { name: 'IceCream', icon: IceCream, label: 'Ice cream' },
  { name: 'Cake', icon: Cake, label: 'Cake' },
  { name: 'Soup', icon: Soup, label: 'Soup' },
  { name: 'Sandwich', icon: Sandwich, label: 'Sandwich' },
  { name: 'Egg', icon: Egg, label: 'Egg' },
  { name: 'Apple', icon: Apple, label: 'Apple' },
  { name: 'Cherry', icon: Cherry, label: 'Cherry' },
  { name: 'Citrus', icon: Citrus, label: 'Citrus' },
  { name: 'CupSoda', icon: CupSoda, label: 'Soda' },
  { name: 'Beer', icon: Beer, label: 'Beer' },
  { name: 'Martini', icon: Martini, label: 'Cocktail' },
  { name: 'Cookie', icon: Cookie, label: 'Cookie' },
  { name: 'Croissant', icon: Croissant, label: 'Croissant' },
  { name: 'Drumstick', icon: Drumstick, label: 'Chicken' },
  { name: 'Flame', icon: Flame, label: 'Grill' },
  { name: 'Leaf', icon: Leaf, label: 'Vegan' },
  { name: 'Milk', icon: Milk, label: 'Milk' },
  { name: 'Popcorn', icon: Popcorn, label: 'Snack' },
  { name: 'ChefHat', icon: ChefHat, label: 'Chef' },
];

type Props = {
  value: string;
  onChange: (icon: string) => void;
};

export function IconPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
      <button
        type="button"
        onClick={() => onChange('')}
        className={cn(
          'grid aspect-square place-items-center rounded-lg border text-xs transition',
          !value
            ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
            : 'border-app bg-surface-2 text-faint hover:border-strong',
        )}
      >
        —
      </button>
      {FOOD_ICONS.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          type="button"
          title={label}
          onClick={() => onChange(name)}
          className={cn(
            'grid aspect-square place-items-center rounded-lg border transition',
            value === name
              ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
              : 'border-app bg-surface-2 text-muted hover:border-strong',
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function MenuItemIcon({ name, className }: { name?: string; className?: string }) {
  const entry = FOOD_ICONS.find((i) => i.name === name);
  if (!entry) return null;
  const Icon = entry.icon;
  return <Icon className={className} />;
}
