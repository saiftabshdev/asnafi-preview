import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ExternalLink, Globe, Menu, Moon, Shield, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { setLanguage } from '../../lib/setLanguage';
import { useTheme } from '../ThemeProvider';

const LANGS = [
  { code: 'ar', label: 'AR', native: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'EN', native: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'TR', native: 'Türkçe', flag: '🇹🇷' },
] as const;

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const isRtl = i18n.language === 'ar';
  const isDark = theme === 'dark';
  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectLang = (code: string) => {
    setLanguage(code);
    setLangOpen(false);
  };

  return (
    <header className="bg-surface/80 border-app sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-600 sm:flex dark:bg-brand-500/15 dark:text-brand-300">
        <Shield className="h-4 w-4" />
        {t('Authorized personnel only')}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <a
          href="/"
          className="border-app bg-surface-2 hidden items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold text-muted transition hover:border-strong hover:text-main md:flex"
        >
          <ExternalLink className="h-4 w-4" />
          {t('Back to home')}
        </a>

        {/* Language */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            className="border-app bg-surface-2 flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm font-semibold text-main transition hover:border-strong"
          >
            <Globe className="h-4 w-4 text-faint" />
            <span>{current.label}</span>
          </button>
          {langOpen && (
            <div
              className={cn(
                'border-app bg-surface absolute top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border p-1.5 shadow-card',
                isRtl ? 'left-0' : 'right-0',
              )}
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => selectLang(l.code)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                    l.code === i18n.language
                      ? 'bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                      : 'text-muted hover:bg-surface-2',
                  )}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1 text-start">{l.native}</span>
                  {l.code === i18n.language && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="border-app bg-surface-2 grid h-9 w-9 place-items-center rounded-xl border text-main transition hover:border-strong"
        >
          {isDark ? (
            <Sun className="h-[18px] w-[18px] text-amber-400" />
          ) : (
            <Moon className="h-[18px] w-[18px] text-brand-500" />
          )}
        </button>
      </div>
    </header>
  );
}
