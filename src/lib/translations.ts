export type LangCode = 'ar' | 'en' | 'tr';

export type TranslationMap = Partial<Record<LangCode, string>>;

export const LANG_CODES: LangCode[] = ['ar', 'en', 'tr'];

export const LANG_LABELS: Record<LangCode, string> = {
  ar: 'العربية',
  en: 'English',
  tr: 'Türkçe',
};

export function emptyTranslations(): TranslationMap {
  return { ar: '', en: '', tr: '' };
}

export function translationsFromLegacy(text: string): TranslationMap {
  return { ar: text, en: text, tr: text };
}

export function primaryTranslation(translations: TranslationMap | undefined, fallback: string): string {
  return translations?.ar || translations?.en || translations?.tr || fallback;
}
