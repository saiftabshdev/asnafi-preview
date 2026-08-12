import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ExternalLink, Globe, Menu, Moon, Search, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { setLanguage } from '../../lib/setLanguage';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../hooks/useApi';

const LANGS = [
  { code: 'ar', label: 'AR', native: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'EN', native: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'TR', native: 'Türkçe', flag: '🇹🇷' },
] as const;

export default function DashboardTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { data: restaurant } = useRestaurant();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const [query, setQuery] = useState('');
  const langRef = useRef<HTMLDivElement>(null);

  const isRtl = i18n.language === 'ar';
  const isDark = theme === 'dark';
  const slug = restaurant?.info.slug ?? user?.slug;
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

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/dashboard/menu?q=${encodeURIComponent(q)}` : '/dashboard/menu');
  };

  return (
    <header className="bg-surface/80 border-app sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 lg:hidden"
        aria-label={t('dash.nav_menu')}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <form onSubmit={submitSearch} className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-faint ltr:left-3 rtl:right-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('dash.search_placeholder')}
          className="bg-surface-2 border-app w-full rounded-xl border py-2.5 text-sm text-main outline-none transition placeholder:text-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4"
        />
      </form>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1.5">
        {/* View public menu */}
        {slug && (
          <a
            href={`/menu/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-100 md:flex dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25"
          >
            <ExternalLink className="h-4 w-4" />
            {t('dash.viewMenu')}
          </a>
        )}

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
          title={isDark ? t('dash.light_mode') : t('dash.dark_mode')}
        >
          {isDark ? (
            <Sun className="h-[18px] w-[18px] text-amber-400" />
          ) : (
            <Moon className="h-[18px] w-[18px] text-brand-500" />
          )}
        </button>

        {/* Public menu link on mobile */}
        {slug && (
          <Link
            to={`/menu/${slug}`}
            target="_blank"
            className="border-app bg-surface-2 grid h-9 w-9 place-items-center rounded-xl border text-main transition hover:border-strong md:hidden"
            title={t('dash.viewMenu')}
          >
            <ExternalLink className="h-[18px] w-[18px]" />
          </Link>
        )}
      </div>
    </header>
  );
}
