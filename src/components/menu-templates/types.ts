import type { ComponentType } from 'react';
import type { Category, Item, RestaurantInfo } from '../../types/restaurant';

export type CartLine = {
  id: string;
  item: Item;
  quantity: number;
  extras: { name: string; price: number; qty: number }[];
  totalPrice: number;
};

export interface MenuTemplateProps {
  restaurant: RestaurantInfo;
  categories: Category[];
  filteredCategories: Category[];
  themeColor: string;
  search: string;
  setSearch: (value: string) => void;
  activeCategory?: string;
  setActiveCategory?: (id: string) => void;
  onItemClick: (item: Item) => void;
  isRtl: boolean;
  cart: CartLine[];
  cartTotal: number;
  onOpenCart: () => void;
  onRemoveFromCart: (lineId: string) => void;
  onUpdateCartQty?: (lineId: string, delta: number) => void;
  activeView?: 'menu' | 'about';
  setActiveView?: (view: 'menu' | 'about') => void;
  ordersEnabled: boolean;
}

export type MenuTemplateComponent = ComponentType<MenuTemplateProps>;
