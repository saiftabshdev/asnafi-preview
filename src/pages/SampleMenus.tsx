import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ThemeLangToggle } from '../components/ThemeLangToggle';
import { Logo } from '../components/Logo';
import { SiteFooter } from '../components/SiteFooter';
import { cn } from '../lib/utils';
import { MENU_TEMPLATES } from '../lib/menuTemplates';

const SAMPLE_DESCRIPTIONS: Record<string, { en: string; accent: string }> = {
  bistro: {
    en: 'Gold-accent sidebar with hero banner and cart panel for upscale casual dining.',
    accent: '#c9a84c',
  },
  fresh: {
    en: 'Bright wellness-style grid with category navigation for cafes and healthy menus.',
    accent: '#22c55e',
  },
  vibrant: {
    en: 'Bold sidebar layout with mobile-first cart UX for burgers and fast casual.',
    accent: '#ff6a00',
  },
  luxury: {
    en: 'Premium card layout with hero section for memorable fine dining experiences.',
    accent: '#d6a14e',
  },
  nakhil: {
    en: 'Dark gold Arabian theme with menu/about tabs and trilingual support.',
    accent: '#E8A84C',
  },
};

export default function SampleMenus() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="h-8 object-contain" />
            </Link>
            <div className="flex items-center gap-4">
              <ThemeLangToggle />
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className={cn('w-4 h-4', isRtl && 'rotate-180')} />
                {t('Back to home')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t('Sample Menus')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('Choose a template to preview')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {MENU_TEMPLATES.map((sample) => {
            const meta = SAMPLE_DESCRIPTIONS[sample.id];
            return (
              <div
                key={sample.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img src={sample.image} alt={sample.name} className="w-full h-44 object-cover" />
                  <span
                    className="absolute top-3 start-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: meta?.accent ?? '#6366f1' }}
                  >
                    {sample.name}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {meta?.en ?? sample.name}
                  </p>
                  <Link
                    to={`/menu/sample-${sample.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t('Preview Menu')} <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
