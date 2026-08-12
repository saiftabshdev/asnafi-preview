import type { RestaurantInfo } from '../../../types/restaurant';

type Props = {
  restaurant: RestaurantInfo;
  className?: string;
  maxHeight?: number;
};

export function MenuLogo({ restaurant, className = '', maxHeight }: Props) {
  const width = restaurant.logoWidth ?? 120;
  const height = maxHeight ?? Math.round(width * 0.6);

  if (restaurant.logo) {
    return (
      <img
        src={restaurant.logo}
        alt={restaurant.name}
        className={`object-contain ${className}`}
        style={{ width, height, maxWidth: width, maxHeight: height }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center text-2xl font-bold ${className}`}
      style={{ width, height, maxWidth: width, maxHeight: height }}
      aria-hidden
    >
      🍽
    </div>
  );
}
