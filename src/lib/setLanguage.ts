import i18n from './i18n';

export const RTL_LANGS = ['ar'];

/**
 * Single place that changes the UI language. Keeps <html dir> and <html lang>
 * in sync with i18next so RTL logical properties resolve correctly, and keeps
 * the DOM write out of component bodies.
 */
export function setLanguage(code: string) {
  i18n.changeLanguage(code);
  applyDocumentLanguage(code);
}

export function applyDocumentLanguage(code: string) {
  const root = document.documentElement;
  root.setAttribute('dir', RTL_LANGS.includes(code) ? 'rtl' : 'ltr');
  root.setAttribute('lang', code);
}
