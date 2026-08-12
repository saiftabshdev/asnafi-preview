import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Clock,
  Image as ImageIcon,
  MapPin,
  Save,
  Share2,
  Store,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import type { OperatingHours, RestaurantInfo as RestaurantInfoType } from '../../types/restaurant';
import { useRestaurant, useUpdateRestaurant, useUploadImage } from '../../hooks/useApi';
import { countries } from '../../lib/countries';
import { CURRENCIES } from '../../lib/currencies';
import { cn } from '../../lib/utils';
import { TrilingualFieldGroup } from '../../components/TrilingualFieldGroup';
import { emptyTranslations, translationsFromLegacy } from '../../lib/translations';
import type { TranslationMap } from '../../lib/translations';
import {
  Card,
  Label,
  PageShell,
  Select,
  TextInput,
  primaryButton,
} from '../../components/dashboard/ui';

export default function RestaurantInfo() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data, isLoading } = useRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const uploadImage = useUploadImage();
  const info = data?.info;

  const [formData, setFormData] = useState<RestaurantInfoType | null>(null);
  const [nameTranslations, setNameTranslations] = useState<TranslationMap>(emptyTranslations());
  const [descriptionTranslations, setDescriptionTranslations] = useState<TranslationMap>(
    emptyTranslations(),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!info) return;
    setFormData(info);
    setNameTranslations(info.nameTranslations ?? translationsFromLegacy(info.name));
    setDescriptionTranslations(
      info.descriptionTranslations ?? translationsFromLegacy(info.description),
    );
  }, [info]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!formData) return;
    try {
      await updateRestaurant.mutateAsync({
        name: formData.name,
        nameTranslations,
        slug: formData.slug,
        description: formData.description,
        descriptionTranslations,
        logoUrl: formData.logo,
        logoWidth: formData.logoWidth,
        coverImageUrl: formData.coverImage,
        country: formData.country,
        currency: formData.currency,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        address: formData.address,
        mapLink: formData.mapLink,
        socialLinks: formData.socialLinks,
        operatingHours: formData.operatingHours,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success(t('dash.ri_saved'));
    } catch {
      toast.error(t('dash.save_failed'));
    }
  };

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'coverImage',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      setFormData((prev) => (prev ? { ...prev, [field]: url } : prev));
    } catch {
      toast.error(t('Upload failed'));
    }
  };

  const updateHour = <K extends keyof OperatingHours>(
    index: number,
    field: K,
    value: OperatingHours[K],
  ) => {
    if (!formData) return;
    const hours = [...(formData.operatingHours ?? [])];
    hours[index] = { ...hours[index], [field]: value };
    setFormData({ ...formData, operatingHours: hours });
  };

  if (isLoading || !formData) {
    return (
      <PageShell>
        <p className="text-sm text-muted">{t('Loading...')}</p>
      </PageShell>
    );
  }

  return (
    <PageShell width="medium">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="animate-float-in">
            <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
              {t('dash.ri_title')}
            </h1>
            <p className="mt-1 text-sm text-muted">{t('dash.ri_subtitle')}</p>
          </div>
          <button
            type="submit"
            disabled={updateRestaurant.isPending}
            className={cn(
              primaryButton,
              'animate-float-in',
              saved && 'bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-500',
            )}
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? t('dash.ri_saved') : t('dash.ri_save')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* ------------------------- left column ------------------------- */}
          <div className="space-y-5 lg:col-span-2">
            <Card title={t('dash.ri_basic')} icon={Store} delay={40}>
              <div className="space-y-5">
                <TrilingualFieldGroup
                  label={`${t('dash.ri_name')} *`}
                  translations={nameTranslations}
                  onChange={(next) => {
                    setNameTranslations(next);
                    setFormData((prev) =>
                      prev ? { ...prev, name: next.ar || next.en || next.tr || prev.name } : prev,
                    );
                  }}
                />
                <TrilingualFieldGroup
                  label={t('dash.ri_desc')}
                  translations={descriptionTranslations}
                  onChange={(next) => {
                    setDescriptionTranslations(next);
                    setFormData((prev) =>
                      prev
                        ? {
                            ...prev,
                            description: next.ar || next.en || next.tr || prev.description,
                          }
                        : prev,
                    );
                  }}
                  multiline
                />

                <div>
                  <Label htmlFor="slug">{t('dash.ri_slug')}</Label>
                  <div className="border-app bg-surface-2 flex overflow-hidden rounded-xl border">
                    <span
                      className="border-app bg-surface shrink-0 px-3 py-2.5 text-sm text-faint ltr:border-r rtl:border-l"
                      dir="ltr"
                    >
                      /menu/
                    </span>
                    <input
                      id="slug"
                      dir="ltr"
                      value={formData.slug || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                        })
                      }
                      className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-main outline-none"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="currency">{t('dash.ri_currency')}</Label>
                  <Select
                    id="currency"
                    value={formData.currency || '$'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>

            <Card title={t('dash.ri_visual')} icon={ImageIcon} delay={100}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label>{t('dash.ri_logo')}</Label>
                    <div className="flex items-center gap-4">
                      <div className="border-strong bg-surface-2 grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed p-2">
                        {formData.logo ? (
                          <img src={formData.logo} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <Store className="h-7 w-7 text-faint" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="border-app bg-surface-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold text-main transition hover:border-strong">
                          <Upload className="h-4 w-4" />
                          {t('dash.ri_upload')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                          />
                        </label>
                        <p className="mt-2 text-xs text-faint">{t('dash.ri_logo_hint')}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="logoWidth">{t('dash.ri_logo_width')}</Label>
                    <TextInput
                      id="logoWidth"
                      type="number"
                      dir="ltr"
                      min={50}
                      max={400}
                      value={formData.logoWidth || 120}
                      onChange={(e) =>
                        setFormData({ ...formData, logoWidth: Number(e.target.value) })
                      }
                    />
                    <p className="mt-2 text-xs text-faint">{t('dash.ri_logo_range')}</p>
                  </div>
                </div>

                <div className="border-app border-t pt-5">
                  <Label>{t('dash.ri_cover')}</Label>
                  <div className="border-strong bg-surface-2 mb-3 grid h-40 w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed">
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-faint" />
                    )}
                  </div>
                  <label className="border-app bg-surface-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold text-main transition hover:border-strong">
                    <Upload className="h-4 w-4" />
                    {t('dash.ri_upload')}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'coverImage')}
                    />
                  </label>
                  <p className="mt-2 text-xs text-faint">{t('dash.ri_cover_hint')}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ------------------------- right column ------------------------ */}
          <div className="space-y-5">
            <Card title={t('dash.ri_contact')} icon={MapPin} delay={160}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country">{t('dash.ri_country')}</Label>
                  <Select
                    id="country"
                    value={formData.country || 'US'}
                    onChange={(e) => {
                      const selected = countries.find((c) => c.code === e.target.value);
                      setFormData({
                        ...formData,
                        country: e.target.value,
                        currency: selected ? selected.currency : formData.currency,
                      });
                    }}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {isRtl ? c.nameAr : c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="whatsapp" required>
                    {t('dash.ri_whatsapp')}
                  </Label>
                  <TextInput
                    id="whatsapp"
                    dir="ltr"
                    placeholder="+966501234567"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                  <p className="mt-1.5 text-xs text-faint">{t('dash.ri_whatsapp_hint')}</p>
                </div>

                <div>
                  <Label htmlFor="phone">{t('dash.ri_phone')}</Label>
                  <TextInput
                    id="phone"
                    dir="ltr"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t('dash.ri_email')}</Label>
                  <TextInput
                    id="email"
                    type="email"
                    dir="ltr"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="address" required>
                    {t('dash.ri_address')}
                  </Label>
                  <TextInput
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="mapLink">{t('dash.ri_maps')}</Label>
                  <TextInput
                    id="mapLink"
                    type="url"
                    dir="ltr"
                    placeholder="https://maps.google.com/..."
                    value={formData.mapLink || ''}
                    onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            <Card title={t('dash.ri_social')} icon={Share2} delay={220}>
              <div className="space-y-4">
                {(['instagram', 'facebook', 'website'] as const).map((key) => (
                  <div key={key}>
                    <Label htmlFor={key}>{key[0].toUpperCase() + key.slice(1)} URL</Label>
                    <TextInput
                      id={key}
                      type="url"
                      dir="ltr"
                      value={formData.socialLinks?.[key] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, [key]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card title={t('dash.ri_hours')} icon={Clock} delay={280}>
              <div className="space-y-3">
                {formData.operatingHours?.map((hour, idx) => (
                  <div key={hour.day} className="flex items-center justify-between gap-2 text-sm">
                    <label className="flex w-28 shrink-0 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hour.isClosed}
                        onChange={(e) => updateHour(idx, 'isClosed', !e.target.checked)}
                        className="h-4 w-4 rounded accent-[var(--color-brand-500)]"
                      />
                      <span
                        className={cn('font-medium', hour.isClosed ? 'text-faint' : 'text-main')}
                      >
                        {t(hour.day)}
                      </span>
                    </label>

                    {hour.isClosed ? (
                      <div className="bg-surface-2 flex-1 rounded-lg py-1.5 text-center text-xs text-faint">
                        {t('dash.ri_closed')}
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center gap-1" dir="ltr">
                        <input
                          type="time"
                          value={hour.open}
                          onChange={(e) => updateHour(idx, 'open', e.target.value)}
                          className="border-app bg-surface-2 w-full rounded-lg border p-1.5 text-xs text-main outline-none focus:border-brand-400"
                        />
                        <span className="text-faint">–</span>
                        <input
                          type="time"
                          value={hour.close}
                          onChange={(e) => updateHour(idx, 'close', e.target.value)}
                          className="border-app bg-surface-2 w-full rounded-lg border p-1.5 text-xs text-main outline-none focus:border-brand-400"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </PageShell>
  );
}
