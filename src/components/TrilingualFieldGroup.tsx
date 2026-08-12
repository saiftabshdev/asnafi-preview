import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api/client';
import { LANG_CODES, LANG_LABELS, type LangCode, type TranslationMap } from '../lib/translations';
import { cn } from '../lib/utils';

type Props = {
  label: string;
  translations: TranslationMap;
  onChange: (translations: TranslationMap) => void;
  multiline?: boolean;
  sourceLang?: LangCode;
};

export function TrilingualFieldGroup({
  label,
  translations,
  onChange,
  multiline = false,
  sourceLang = 'ar',
}: Props) {
  const { t } = useTranslation();
  const [activeLang, setActiveLang] = useState<LangCode>('ar');
  const [translating, setTranslating] = useState(false);

  const updateLang = (lang: LangCode, value: string) => {
    onChange({ ...translations, [lang]: value });
  };

  const autoTranslate = async () => {
    const text = translations[sourceLang]?.trim();
    if (!text) {
      toast.error(t('Enter source text first'));
      return;
    }
    setTranslating(true);
    try {
      const result = await apiFetch<{ translations: TranslationMap }>('/translate', {
        method: 'POST',
        body: JSON.stringify({
          text,
          source: sourceLang,
          targets: LANG_CODES.filter((l) => l !== sourceLang),
        }),
      });
      onChange({ ...translations, ...result.translations });
      toast.success(t('Translation complete'));
    } catch {
      toast.error(t('Translation failed'));
    } finally {
      setTranslating(false);
    }
  };

  const InputTag = multiline ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-semibold text-main">{label}</label>
        <button
          type="button"
          onClick={autoTranslate}
          disabled={translating}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 transition hover:text-brand-600 disabled:opacity-50"
        >
          <Languages className="w-3.5 h-3.5" />
          {translating ? t('Translating...') : t('Auto-translate')}
        </button>
      </div>

      <div className="bg-surface-2 flex items-center gap-1 rounded-lg p-1">
        {LANG_CODES.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={cn(
              'flex-1 rounded-md px-2 py-1 text-xs font-semibold transition',
              activeLang === lang
                ? 'bg-surface text-brand-600 shadow-sm dark:text-brand-300'
                : 'text-faint hover:text-main',
            )}
          >
            {LANG_LABELS[lang]}
          </button>
        ))}
      </div>

      <InputTag
        value={translations[activeLang] ?? ''}
        onChange={(e) => updateLang(activeLang, e.target.value)}
        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
        rows={multiline ? 3 : undefined}
        className="border-app bg-surface-2 w-full rounded-xl border px-3.5 py-2.5 text-sm text-main outline-none transition placeholder:text-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
      />
    </div>
  );
}
