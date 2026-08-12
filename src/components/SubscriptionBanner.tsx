import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { useHasSubscription } from '../context/AuthContext';

export function SubscriptionBanner() {
  const { t } = useTranslation();
  const hasSubscription = useHasSubscription();

  if (hasSubscription) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="text-sm text-amber-800 dark:text-amber-200">
        <p className="font-medium">{t('Subscription required') || 'Subscription required'}</p>
        <p className="mt-1 text-amber-700 dark:text-amber-300">
          {t('Choose a plan to unlock menu editing and design settings.') ||
            'Choose a plan to unlock menu editing and design settings.'}{' '}
          <Link to="/dashboard/subscription" className="font-semibold underline hover:no-underline">
            {t('View plans') || 'View plans'}
          </Link>
        </p>
      </div>
    </div>
  );
}
