import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Users } from 'lucide-react';
import { useAdminTemplates } from '../../hooks/useApi';
import { PageHeader, PageShell } from '../../components/dashboard/ui';

export default function AdminTemplates() {
  const { t } = useTranslation();
  const { data: templates = [], isLoading } = useAdminTemplates();

  return (
    <PageShell>
      <PageHeader title={t('Menu Templates')} subtitle={t('Templates admin desc')} />

      {isLoading && <p className="text-muted">{t('Loading plans')}...</p>}

      <div className="grid gap-6 md:grid-cols-3">
        {templates.map((tpl, i) => (
          <article
            key={tpl.id}
            className="bg-surface border-app animate-float-in overflow-hidden rounded-2xl border shadow-card"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="relative aspect-[3/2]">
              <img src={tpl.previewImage} alt={tpl.name} className="h-full w-full object-cover" />
              <div
                className="absolute top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white ltr:left-3 rtl:right-3"
                style={{ backgroundColor: tpl.defaultColor }}
              >
                {tpl.name}
              </div>
            </div>
            <div className="p-5">
              <h2 className="font-display text-lg font-bold text-main">{tpl.name}</h2>
              <p className="mt-2 text-sm text-muted">{tpl.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-faint">
                <Users className="h-4 w-4" />
                {t('Restaurants using template', { count: tpl.usageCount })}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to={`/menu/${tpl.sampleSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                  style={{ backgroundColor: tpl.defaultColor }}
                >
                  {t('Preview sample')} <ExternalLink className="h-4 w-4" />
                </Link>
                <p className="text-center text-xs text-faint" dir="ltr">
                  /menu/{tpl.sampleSlug}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
