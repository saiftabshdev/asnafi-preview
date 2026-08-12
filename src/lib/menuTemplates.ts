export type MenuTemplateId = 'bistro' | 'fresh' | 'vibrant' | 'luxury' | 'nakhil';

export const ALL_TEMPLATE_IDS: MenuTemplateId[] = ['bistro', 'fresh', 'vibrant', 'luxury', 'nakhil'];

export const MENU_TEMPLATES: {
  id: MenuTemplateId;
  name: string;
  image: string;
  coverImage: string;
}[] = [
  {
    id: 'bistro',
    name: 'Bistro',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=400&fit=crop',
  },
  {
    id: 'fresh',
    name: 'Fresh',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&h=400&fit=crop',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
  },
  {
    id: 'nakhil',
    name: 'Nakhil',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1670508183158-d1a3cbf5239a?w=1200&h=400&fit=crop',
  },
];

export function getTemplateCoverImage(template: string): string {
  return MENU_TEMPLATES.find((t) => t.id === template)?.coverImage ?? MENU_TEMPLATES[0].coverImage;
}
