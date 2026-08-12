import { lazy } from 'react';
import type { MenuTemplateId } from '../../lib/menuTemplates';
import type { MenuTemplateComponent } from './types';

const FreshTemplate = lazy(() => import('./FreshTemplate'));
const LuxuryTemplate = lazy(() => import('./LuxuryTemplate'));
const BistroTemplate = lazy(() => import('./BistroTemplate'));
const VibrantTemplate = lazy(() => import('./VibrantTemplate'));
const NakhilTemplate = lazy(() => import('./NakhilTemplate'));

const REGISTRY: Record<MenuTemplateId, MenuTemplateComponent> = {
  bistro: BistroTemplate as MenuTemplateComponent,
  fresh: FreshTemplate as MenuTemplateComponent,
  vibrant: VibrantTemplate as MenuTemplateComponent,
  luxury: LuxuryTemplate as MenuTemplateComponent,
  nakhil: NakhilTemplate as MenuTemplateComponent,
};

export function getMenuTemplateComponent(id: string): MenuTemplateComponent {
  return REGISTRY[id as MenuTemplateId] ?? REGISTRY.bistro;
}

export { REGISTRY };
