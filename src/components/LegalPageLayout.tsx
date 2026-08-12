import React from 'react';
import { useTranslation } from 'react-i18next';
import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';
import '../styles/landing.css';

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <main className="site">
      <SiteNav />

      <section className="legal shell">
        <div className="legal-head">
          <h1>{title}</h1>
          <p>
            {t('Last updated')}: {lastUpdated}
          </p>
        </div>

        {children}
      </section>

      <SiteFooter />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export { Section };
