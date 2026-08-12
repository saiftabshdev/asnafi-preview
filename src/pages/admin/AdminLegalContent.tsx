import React from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminLegalPage, useAdminUpdateLegalPage, type LegalSection } from '../../hooks/useApi';
import { cn } from '../../lib/utils';
import {
  PageHeader,
  PageShell,
  Card,
  Label,
  TextInput,
  TextArea,
  primaryButton,
} from '../../components/dashboard/ui';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
] as const;

const PAGES = [
  { slug: 'privacy', labelKey: 'Privacy Policy' },
  { slug: 'terms', labelKey: 'Terms and Conditions' },
] as const;

export default function AdminLegalContent() {
  const { t } = useTranslation();
  const [pageSlug, setPageSlug] = React.useState<'privacy' | 'terms'>('privacy');
  const [locale, setLocale] = React.useState('en');
  const [title, setTitle] = React.useState('');
  const [sections, setSections] = React.useState<LegalSection[]>([]);

  const { data, isLoading, isFetching } = useAdminLegalPage(pageSlug, locale);
  const updateLegal = useAdminUpdateLegalPage();

  React.useEffect(() => {
    if (data) {
      setTitle(data.title);
      setSections(data.sections);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateLegal.mutateAsync({
        slug: pageSlug,
        locale,
        data: { title, sections },
      });
      toast.success(t('Legal content saved'));
    } catch {
      toast.error(t('Failed to save legal content'));
    }
  };

  const updateSection = (index: number, field: 'title' | 'body', value: string) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSection = () => {
    setSections((prev) => [...prev, { title: '', body: '' }]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <PageShell width="medium">
      <PageHeader title={t('Legal Content')} subtitle={t('Legal content admin desc')} />

      <div className="mb-5 flex flex-wrap gap-2 animate-float-in">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setPageSlug(p.slug)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
              pageSlug === p.slug
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-surface border-app border text-muted hover:text-main',
            )}
          >
            {t(p.labelKey)}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2 animate-float-in">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              locale === l.code ? 'bg-brand-500 text-white' : 'bg-surface-2 text-muted hover:text-main',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {(isLoading || isFetching) && !data && <p className="text-muted">{t('Loading plans')}...</p>}

      {data && (
        <Card title={title || t('Legal Content')} icon={Save}>
          {data.updatedAt && (
            <p className="mb-4 text-xs text-faint">
              {t('Last updated')}: {new Date(data.updatedAt).toLocaleString()}
            </p>
          )}

          <div className="mb-5">
            <Label>{t('Page title')}</Label>
            <TextInput type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-main">{t('Sections')}</h3>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                <Plus className="h-4 w-4" /> {t('Add section')}
              </button>
            </div>

            {sections.map((section, index) => (
              <div key={index} className="bg-surface-2 border-app space-y-3 rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                  <TextInput
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder={t('Section title')}
                    className="flex-1 bg-surface font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-red-500 transition hover:bg-red-500/10"
                    aria-label="Remove section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <TextArea
                  value={section.body}
                  onChange={(e) => updateSection(index, 'body', e.target.value)}
                  rows={4}
                  placeholder={t('Section body')}
                  className="bg-surface"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={updateLegal.isPending}
            className={cn(primaryButton, 'mt-6')}
          >
            <Save className="h-4 w-4" />
            {updateLegal.isPending ? '…' : t('Save changes')}
          </button>
        </Card>
      )}
    </PageShell>
  );
}
