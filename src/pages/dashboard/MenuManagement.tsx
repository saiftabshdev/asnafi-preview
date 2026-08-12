import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateCategory,
  useCreateMenuItem,
  useDeleteCategory,
  useDeleteMenuItem,
  useMenuCategories,
  usePlans,
  useRestaurant,
  useUpdateCategory,
  useUpdateMenuItem,
  useUploadImage,
} from '../../hooks/useApi';
import type { Category, Item } from '../../types/restaurant';
import { useEffectivePlanId, useHasSubscription } from '../../context/AuthContext';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { RestaurantProfileBanner } from '../../components/RestaurantProfileBanner';
import { TrilingualFieldGroup } from '../../components/TrilingualFieldGroup';
import { IconPicker, MenuItemIcon } from '../../components/IconPicker';
import { isRestaurantProfileComplete } from '../../lib/restaurantProfile';
import {
  emptyTranslations,
  primaryTranslation,
  translationsFromLegacy,
} from '../../lib/translations';
import { ApiError } from '../../lib/api/client';
import { cn } from '../../lib/utils';
import {
  Label,
  Modal,
  PageShell,
  TextInput,
  ghostButton,
  primaryButton,
} from '../../components/dashboard/ui';

type CategoryDraft = {
  id?: string;
  isNew: boolean;
  icon: string;
  nameTranslations: ReturnType<typeof emptyTranslations>;
};

type ItemDraft = {
  catId: string;
  item: Item;
  isNew: boolean;
  nameTranslations: ReturnType<typeof emptyTranslations>;
  descriptionTranslations: ReturnType<typeof emptyTranslations>;
};

export default function MenuManagement() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const hasSubscription = useHasSubscription();
  const planId = useEffectivePlanId();
  const { data: plans = [] } = usePlans();
  const { data: categories = [], isLoading, isError } = useMenuCategories(hasSubscription);
  const { data: restaurantData } = useRestaurant();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItemMut = useDeleteMenuItem();
  const uploadImage = useUploadImage();

  const currency = restaurantData?.info.currency ?? '$';
  const profileComplete = isRestaurantProfileComplete(restaurantData?.info ?? {});
  const canEditMenu = hasSubscription && profileComplete;

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const currentPlan = plans.find((p) => p.id === planId);
  const maxMenuItems = currentPlan?.maxMenuItems ?? null;
  const atItemLimit = maxMenuItems != null && totalItems >= maxMenuItems;

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [catDraft, setCatDraft] = useState<CategoryDraft | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null);

  /* --- deep links from the topbar search and the overview quick actions ---
     Waits for the restaurant payload: `canEditMenu` is false until it lands,
     so acting on the intent any earlier would just bounce off the guard. */
  useEffect(() => {
    const intent = searchParams.get('new');
    if (!intent || !restaurantData) return;
    if (intent === 'category') openCategoryModal();
    if (intent === 'item' && categories[0]) openItemModal(categories[0].id);
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, restaurantData, categories.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => {
        if (c.name.toLowerCase().includes(q)) return c;
        const items = c.items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q),
        );
        return items.length ? { ...c, items } : null;
      })
      .filter(Boolean) as Category[];
  }, [categories, query]);

  const isOpen = (id: string) => !collapsed.has(id) || Boolean(query.trim());

  const toggleCat = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandAll = (open: boolean) =>
    setCollapsed(open ? new Set() : new Set(categories.map((c) => c.id)));

  /* ------------------------------ categories ----------------------------- */

  function openCategoryModal(category?: Category) {
    if (!category && !canEditMenu) {
      toast.error(t('Complete restaurant profile menu hint'));
      return;
    }
    setCatDraft(
      category
        ? {
            id: category.id,
            isNew: false,
            icon: category.icon ?? '',
            nameTranslations: category.nameTranslations ?? translationsFromLegacy(category.name),
          }
        : { isNew: true, icon: '', nameTranslations: emptyTranslations() },
    );
  }

  const saveCategory = async () => {
    if (!catDraft) return;
    const name = primaryTranslation(catDraft.nameTranslations, '').trim();
    if (!name) {
      toast.error(t('Enter category name'));
      return;
    }
    const payload = { name, nameTranslations: catDraft.nameTranslations, icon: catDraft.icon };
    try {
      if (catDraft.isNew) {
        await createCategory.mutateAsync(payload);
        toast.success(t('Category added'));
      } else if (catDraft.id) {
        await updateCategory.mutateAsync({ id: catDraft.id, ...payload });
        toast.success(t('Category updated'));
      }
      setCatDraft(null);
    } catch {
      toast.error(t('Failed to save category'));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t('Delete category confirm'))) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success(t('Category deleted'));
    } catch {
      toast.error(t('Failed to delete category'));
    }
  };

  /* -------------------------------- items -------------------------------- */

  function openItemModal(catId: string, item?: Item) {
    if (!item && !canEditMenu) {
      toast.error(t('Complete restaurant profile menu hint'));
      return;
    }
    if (!item && atItemLimit) {
      toast.error(t('Menu item limit reached'));
      return;
    }
    setItemDraft(
      item
        ? {
            catId,
            item: { ...item, extras: [...item.extras] },
            isNew: false,
            nameTranslations: item.nameTranslations ?? translationsFromLegacy(item.name),
            descriptionTranslations:
              item.descriptionTranslations ?? translationsFromLegacy(item.description),
          }
        : {
            catId,
            isNew: true,
            item: { id: '', name: '', description: '', price: 0, image: '', extras: [] },
            nameTranslations: emptyTranslations(),
            descriptionTranslations: emptyTranslations(),
          },
    );
  }

  const saveItem = async () => {
    if (!itemDraft) return;
    const { catId, item, isNew } = itemDraft;
    const payload = {
      name: primaryTranslation(itemDraft.nameTranslations, item.name),
      description: primaryTranslation(itemDraft.descriptionTranslations, item.description),
      nameTranslations: itemDraft.nameTranslations,
      descriptionTranslations: itemDraft.descriptionTranslations,
      price: item.price,
      imageUrl: item.image,
      extras: item.extras,
    };
    if (!payload.name.trim()) {
      toast.error(t('Enter item name'));
      return;
    }
    try {
      if (isNew) {
        await createItem.mutateAsync({ categoryId: catId, item: payload });
        toast.success(t('Item created'));
      } else {
        await updateItem.mutateAsync({ categoryId: catId, itemId: item.id, item: payload });
        toast.success(t('Item updated'));
      }
      setItemDraft(null);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.data as { code?: string })?.code === 'MENU_ITEM_LIMIT_REACHED'
      ) {
        toast.error(t('Menu item limit reached'));
      } else {
        toast.error(t('Failed to save item'));
      }
    }
  };

  const handleDeleteItem = async (catId: string, itemId: string) => {
    if (!confirm(t('Delete item confirm'))) return;
    try {
      await deleteItemMut.mutateAsync({ categoryId: catId, itemId });
      toast.success(t('Item deleted'));
    } catch {
      toast.error(t('Failed to delete item'));
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !itemDraft) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      setItemDraft({ ...itemDraft, item: { ...itemDraft.item, image: url } });
    } catch {
      toast.error(t('Upload failed'));
    }
  };

  const updateExtra = (idx: number, patch: Partial<{ name: string; price: number }>) => {
    if (!itemDraft) return;
    const extras = itemDraft.item.extras.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex));
    setItemDraft({ ...itemDraft, item: { ...itemDraft.item, extras } });
  };

  /* ------------------------------- render -------------------------------- */

  return (
    <PageShell width="narrow">
      <SubscriptionBanner />
      <RestaurantProfileBanner info={restaurantData?.info} />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="animate-float-in">
          <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
            {t('dash.mm_title')}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t('dash.mm_subtitle')}{' '}
            <span className="font-semibold text-brand-500" dir="ltr">
              {totalItems} / {maxMenuItems ?? '∞'}
            </span>{' '}
            {t('dash.mm_items_count')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCategoryModal()}
          disabled={!canEditMenu}
          className={cn(primaryButton, 'animate-float-in')}
        >
          <Plus className="h-4 w-4" />
          {t('dash.mm_add_category')}
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 animate-float-in sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-faint ltr:left-3 rtl:right-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('dash.mm_search')}
            className="bg-surface border-app w-full rounded-xl border py-2.5 text-sm text-main outline-none transition placeholder:text-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4"
          />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => expandAll(true)} className={ghostButton}>
            <ChevronsUpDown className="h-4 w-4" /> {t('dash.mm_expand_all')}
          </button>
          <button type="button" onClick={() => expandAll(false)} className={ghostButton}>
            <ChevronsDownUp className="h-4 w-4" /> {t('dash.mm_collapse_all')}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted">{t('Loading...')}</p>}

        {filtered.map((cat, ci) => (
          <div
            key={cat.id}
            className="bg-surface border-app overflow-hidden rounded-2xl border shadow-card animate-float-in"
            style={{ animationDelay: `${ci * 40}ms` }}
          >
            {/* Category header */}
            <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
              <span className="text-faint" title={t('dash.mm_edit')}>
                <GripVertical className="h-4 w-4" />
              </span>
              <button
                type="button"
                onClick={() => toggleCat(cat.id)}
                className="flex flex-1 items-center gap-3 text-start"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  {cat.icon ? <MenuItemIcon name={cat.icon} className="h-4 w-4" /> : '•'}
                </span>
                <span className="font-display text-base font-bold text-main">{cat.name}</span>
                <span className="bg-surface-2 rounded-full px-2 py-0.5 text-xs font-medium text-faint">
                  {cat.items.length} {t('dash.mm_items_count')}
                </span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-red-500/10 hover:text-red-500"
                  title={t('dash.mm_delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openCategoryModal(cat)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-brand-500"
                  title={t('dash.mm_edit')}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleCat(cat.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-main"
                >
                  <ChevronDown
                    className={cn('h-5 w-5 transition-transform', isOpen(cat.id) && 'rotate-180')}
                  />
                </button>
              </div>
            </div>

            {/* Items */}
            {isOpen(cat.id) && (
              <div className="border-app border-t px-3 pb-3 pt-1 sm:px-4">
                <div className="space-y-2 py-2">
                  {cat.items.length === 0 && (
                    <p className="py-6 text-center text-sm text-faint">{t('dash.mm_empty_cat')}</p>
                  )}

                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      className="group border-app bg-surface-2 flex items-center gap-3 rounded-xl border p-2.5 transition hover:border-strong"
                    >
                      <span className="text-faint">
                        <GripVertical className="h-4 w-4" />
                      </span>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(cat.id, item.id)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-faint transition hover:bg-red-500/10 hover:text-red-500"
                          title={t('dash.mm_delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openItemModal(cat.id, item)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-faint transition hover:bg-surface hover:text-brand-500"
                          title={t('dash.mm_edit')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        className="shrink-0 px-1 font-display text-sm font-bold tabular-nums text-main"
                        dir="ltr"
                      >
                        {Number(item.price).toFixed(2)} {currency}
                      </div>

                      <div className="min-w-0 flex-1 text-start">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-main">
                            {item.name}
                          </span>
                          {item.extras.length > 0 && (
                            <span className="shrink-0 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                              +{item.extras.length}
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-faint">{item.description}</div>
                      </div>

                      <div className="bg-surface grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg text-faint">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <MenuItemIcon name={cat.icon} className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openItemModal(cat.id)}
                  disabled={!canEditMenu || atItemLimit}
                  className="border-strong flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-semibold text-muted transition hover:border-brand-400 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-strong disabled:hover:text-muted"
                >
                  <Plus className="h-4 w-4" />
                  {t('dash.mm_add_item_to')} {cat.name}
                </button>
              </div>
            )}
          </div>
        ))}

        {!isLoading && filtered.length === 0 && !isError && (
          <p className="py-10 text-center text-sm text-faint">
            {hasSubscription && !profileComplete
              ? t('Complete restaurant profile menu hint')
              : t('dash.mm_empty_cat')}
          </p>
        )}
        {isError && hasSubscription && (
          <p className="py-10 text-center text-sm text-red-500">{t('Could not load menu')}</p>
        )}
      </div>

      {/* ------------------------------ modals ------------------------------ */}

      <Modal
        open={Boolean(catDraft)}
        onClose={() => setCatDraft(null)}
        title={catDraft?.isNew ? t('dash.cm_add_title') : t('dash.cm_edit_title')}
        footer={
          <>
            <button
              type="button"
              onClick={() => setCatDraft(null)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-main"
            >
              {t('dash.cm_cancel')}
            </button>
            <button
              type="button"
              onClick={saveCategory}
              disabled={createCategory.isPending || updateCategory.isPending}
              className={primaryButton}
            >
              <Save className="h-4 w-4" />
              {t('dash.cm_save')}
            </button>
          </>
        }
      >
        {catDraft && (
          <div className="space-y-5">
            <TrilingualFieldGroup
              label={t('dash.cm_name')}
              translations={catDraft.nameTranslations}
              onChange={(nameTranslations) => setCatDraft({ ...catDraft, nameTranslations })}
            />
            <div>
              <Label>{t('dash.cm_icon')}</Label>
              <IconPicker
                value={catDraft.icon}
                onChange={(icon) => setCatDraft({ ...catDraft, icon })}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(itemDraft)}
        onClose={() => setItemDraft(null)}
        size="lg"
        title={itemDraft?.isNew ? t('dash.im_add_title') : t('dash.im_edit_title')}
        footer={
          <>
            <button
              type="button"
              onClick={() => setItemDraft(null)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-main"
            >
              {t('dash.cm_cancel')}
            </button>
            <button
              type="button"
              onClick={saveItem}
              disabled={createItem.isPending || updateItem.isPending}
              className={primaryButton}
            >
              <Save className="h-4 w-4" />
              {t('dash.im_save')}
            </button>
          </>
        }
      >
        {itemDraft && (
          <div className="space-y-5">
            {/* Image */}
            <div className="flex items-center gap-4">
              <div className="bg-surface-2 grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl text-faint">
                {itemDraft.item.image ? (
                  <img src={itemDraft.item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <label className="border-app bg-surface-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold text-main transition hover:border-strong">
                <Upload className="h-4 w-4" />
                {uploadImage.isPending ? `${t('dash.im_upload')}…` : t('dash.im_upload')}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <TrilingualFieldGroup
              label={t('dash.im_name')}
              translations={itemDraft.nameTranslations}
              onChange={(nameTranslations) => setItemDraft({ ...itemDraft, nameTranslations })}
            />
            <TrilingualFieldGroup
              label={t('dash.im_desc')}
              translations={itemDraft.descriptionTranslations}
              onChange={(descriptionTranslations) =>
                setItemDraft({ ...itemDraft, descriptionTranslations })
              }
              multiline
            />

            <div>
              <Label>
                {t('dash.im_price')} ({currency})
              </Label>
              <TextInput
                type="number"
                min={0}
                step="0.01"
                dir="ltr"
                value={itemDraft.item.price}
                onChange={(e) =>
                  setItemDraft({
                    ...itemDraft,
                    item: { ...itemDraft.item, price: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>

            {/* Extras */}
            <div className="border-app border-t pt-4">
              <Label
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setItemDraft({
                        ...itemDraft,
                        item: {
                          ...itemDraft.item,
                          extras: [...itemDraft.item.extras, { name: '', price: 0 }],
                        },
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 transition hover:text-brand-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('dash.im_add_extra')}
                  </button>
                }
              >
                {t('dash.im_extras')}
              </Label>

              <div className="space-y-2">
                {itemDraft.item.extras.map((extra, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <TextInput
                      placeholder={t('dash.im_extra_name')}
                      value={extra.name}
                      onChange={(e) => updateExtra(idx, { name: e.target.value })}
                    />
                    <TextInput
                      type="number"
                      min={0}
                      step="0.01"
                      dir="ltr"
                      className="w-28 shrink-0"
                      placeholder={t('dash.im_price')}
                      value={extra.price}
                      onChange={(e) => updateExtra(idx, { price: parseFloat(e.target.value) || 0 })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setItemDraft({
                          ...itemDraft,
                          item: {
                            ...itemDraft.item,
                            extras: itemDraft.item.extras.filter((_, i) => i !== idx),
                          },
                        })
                      }
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-red-500/10 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
