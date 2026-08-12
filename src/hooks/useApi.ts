import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError, resolveMediaUrl } from '../lib/api/client';
import { getTemplateCoverImage } from '../lib/menuTemplates';
import type { RestaurantInfo, Category } from '../types/restaurant';

export type PublicMenuData = {
  info: RestaurantInfo;
  categories: Category[];
};

type ApiMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string;
  icon?: string;
  extras: { name: string; price: number }[];
  nameTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
};

type ApiCategory = {
  id: string;
  name: string;
  icon?: string;
  items: ApiMenuItem[];
  nameTranslations?: Record<string, string>;
};

function mapCategory(cat: ApiCategory): Category {
  return {
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    nameTranslations: cat.nameTranslations,
    items: (cat.items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: resolveMediaUrl(item.image ?? item.imageUrl ?? ''),
      icon: item.icon,
      extras: item.extras ?? [],
      nameTranslations: item.nameTranslations,
      descriptionTranslations: item.descriptionTranslations,
    })),
  };
}

function mapMenuData(data: PublicMenuData): PublicMenuData {
  const logo = resolveMediaUrl(data.info.logo);
  const customCover = resolveMediaUrl(data.info.coverImage);
  const coverImage = customCover || getTemplateCoverImage(data.info.theme.template);

  return {
    info: {
      ...data.info,
      logo,
      coverImage,
    },
    categories: (data.categories ?? []).map(mapCategory),
  };
}

export function useRestaurant() {
  return useQuery({
    queryKey: ['restaurant', 'me'],
    queryFn: async () => mapMenuData(await apiFetch<PublicMenuData>('/restaurants/me')),
  });
}

export function useUpdateRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<PublicMenuData>('/restaurants/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
}

export function usePublicMenu(slug: string | undefined, lang?: string) {
  return useQuery({
    queryKey: ['public-menu', slug, lang],
    queryFn: async () => {
      const qs = lang ? `?lang=${encodeURIComponent(lang)}` : '';
      return mapMenuData(await apiFetch<PublicMenuData>(`/public/menus/${slug}${qs}`));
    },
    enabled: !!slug,
  });
}

export type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscount: number;
  popular?: boolean;
  features: string[];
  maxMenuItems?: number | null;
  allowedTemplates?: string[];
  stripeProductId?: string | null;
  stripePriceMonthlyId?: string | null;
  stripePriceYearlyId?: string | null;
};

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => apiFetch<Plan[]>('/plans'),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: () =>
      apiFetch<{
        status: string;
        planId: string | null;
        billingCycle: string | null;
        trialEndsAt: string | null;
        currentPeriodEnd: string | null;
        stripeCustomerId?: string | null;
        plan?: { id: string; name: string };
      }>('/subscriptions/me'),
  });
}

export function useMenuCategories(enabled = true) {
  return useQuery({
    queryKey: ['menus', 'categories'],
    queryFn: async () => {
      const raw = await apiFetch<ApiCategory[]>('/menus/categories');
      return raw.map(mapCategory);
    },
    enabled,
    retry: (count, error) => {
      if (error instanceof ApiError && error.status === 403) return false;
      return count < 1;
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const result = await apiFetch<{ url: string }>('/uploads', { method: 'POST', body: form });
      return { url: resolveMediaUrl(result.url) };
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; nameTranslations?: Record<string, string>; icon?: string }) =>
      apiFetch<ApiCategory>('/menus/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      nameTranslations?: Record<string, string>;
      icon?: string;
    }) =>
      apiFetch<ApiCategory>(`/menus/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/menus/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'categories'] }),
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      item,
    }: {
      categoryId: string;
      item: { name: string; description?: string; price: number; imageUrl?: string; extras?: { name: string; price: number }[] };
    }) =>
      apiFetch<ApiMenuItem>(`/menus/categories/${categoryId}/items`, {
        method: 'POST',
        body: JSON.stringify(item),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'categories'] }),
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      itemId,
      item,
    }: {
      categoryId: string;
      itemId: string;
      item: { name?: string; description?: string; price?: number; imageUrl?: string; extras?: { name: string; price: number }[] };
    }) =>
      apiFetch<ApiMenuItem>(`/menus/categories/${categoryId}/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(item),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'categories'] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, itemId }: { categoryId: string; itemId: string }) =>
      apiFetch(`/menus/categories/${categoryId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'categories'] }),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: {
      name?: string;
      email?: string;
      phone?: string;
      country?: string;
      currentPassword?: string;
      newPassword?: string;
    }) => apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
  });
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  restaurantName: string;
  slug?: string;
  plan: string;
  status: string;
  joinDate: string;
  endDate: string;
};

export function useAdminUsers(search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return useQuery({
    queryKey: ['admin', 'users', search ?? ''],
    queryFn: () =>
      apiFetch<{ data: AdminUser[]; total: number }>(`/admin/users${q}`),
  });
}

export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiFetch<AdminUser>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () =>
      apiFetch<{
        totalUsers: number;
        activeSubscriptions: number;
        trialingSubscriptions: number;
        monthlyRecurringRevenue: number;
        systemUptime: string;
        totalRestaurants: number;
        totalMenuItems: number;
        totalCategories: number;
        totalTemplates: number;
        templateUsage: Array<{ id: string; name: string; count: number }>;
        planDistribution: Array<{ planId: string; count: number }>;
        domain: string;
      }>('/admin/stats'),
  });
}

export type MenuTemplateInfo = {
  id: string;
  name: string;
  description: string;
  sampleSlug: string;
  previewImage: string;
  defaultColor: string;
  usageCount: number;
};

export function useAdminTemplates() {
  return useQuery({
    queryKey: ['admin', 'templates'],
    queryFn: () => apiFetch<MenuTemplateInfo[]>('/admin/templates'),
  });
}

export type LegalSection = { title: string; body: string };

export type LegalPageData = {
  slug: string;
  locale: string;
  title: string;
  sections: LegalSection[];
  updatedAt: string;
};

export function useLegalPage(slug: string, locale: string) {
  return useQuery({
    queryKey: ['legal', slug, locale],
    queryFn: () => apiFetch<LegalPageData>(`/legal/${slug}?locale=${locale}`),
  });
}

export function useAdminLegalPage(slug: string, locale: string) {
  return useQuery({
    queryKey: ['admin', 'legal', slug, locale],
    queryFn: () => apiFetch<LegalPageData>(`/admin/legal/${slug}/${locale}`),
    enabled: !!slug && !!locale,
  });
}

export function useAdminUpdateLegalPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      locale,
      data,
    }: {
      slug: string;
      locale: string;
      data: { title: string; sections: LegalSection[] };
    }) =>
      apiFetch<LegalPageData>(`/admin/legal/${slug}/${locale}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'legal', vars.slug, vars.locale] });
      qc.invalidateQueries({ queryKey: ['legal', vars.slug, vars.locale] });
    },
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => apiFetch<Plan[]>('/admin/plans'),
  });
}

export function useAdminUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) =>
      apiFetch<Plan>(`/admin/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      qc.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
