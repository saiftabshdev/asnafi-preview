import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

type ApiErrorStateProps = {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
};

export function ApiErrorState({
  title,
  message,
  backTo = '/',
  backLabel,
}: ApiErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
          <WifiOff className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title ?? t('Service unavailable')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message ?? t('Backend unavailable message')}
        </p>
        <Link
          to={backTo}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {backLabel ?? t('Back to home')}
        </Link>
      </div>
    </div>
  );
}
