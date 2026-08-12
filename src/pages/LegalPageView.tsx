import { useTranslation } from 'react-i18next';
import { LegalPageLayout, Section } from '../components/LegalPageLayout';
import { useLegalPage } from '../hooks/useApi';

type LegalPageViewProps = {
  slug: 'privacy' | 'terms';
};

export function LegalPageView({ slug }: LegalPageViewProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.split('-')[0];
  const { data, isLoading, isError } = useLegalPage(slug, locale);

  const fallbackTitle = slug === 'privacy' ? t('Privacy Policy') : t('Terms and Conditions');

  if (isLoading) {
    return (
      <LegalPageLayout title={fallbackTitle} lastUpdated="…">
        <p>{t('Loading plans')}...</p>
      </LegalPageLayout>
    );
  }

  if (isError || !data) {
    return (
      <LegalPageLayout title={fallbackTitle} lastUpdated="—">
        <p>{t('Could not load legal page')}</p>
      </LegalPageLayout>
    );
  }

  const formattedDate = new Date(data.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <LegalPageLayout title={data.title} lastUpdated={formattedDate}>
      {data.sections.map((section, index) => (
        <Section key={index} title={section.title}>
          <p>{section.body}</p>
        </Section>
      ))}
    </LegalPageLayout>
  );
}
