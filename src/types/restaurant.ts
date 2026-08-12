import type { TranslationMap } from '../lib/translations';

export type Extra = { name: string; price: number };

export type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  icon?: string;
  extras: Extra[];
  nameTranslations?: TranslationMap;
  descriptionTranslations?: TranslationMap;
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
  items: Item[];
  nameTranslations?: TranslationMap;
};

export type Theme = {
  primaryColor: string;
  template: 'bistro' | 'fresh' | 'vibrant' | 'luxury' | 'nakhil';
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
};

export type OperatingHours = {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
};

export type RestaurantInfo = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  logoWidth?: number;
  coverImage: string;
  theme: Theme;
  country: string;
  currency: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  mapLink?: string;
  socialLinks?: SocialLinks;
  operatingHours?: OperatingHours[];
  nameTranslations?: TranslationMap;
  descriptionTranslations?: TranslationMap;
};
