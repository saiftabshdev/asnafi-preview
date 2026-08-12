import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Shield } from 'lucide-react';
import { ThemeLangToggle } from '../../components/ThemeLangToggle';
import { Logo } from '../../components/Logo';
import { Label, TextInput, primaryButton } from '../../components/dashboard/ui';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, user } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  React.useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-app flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-4 ltr:right-4 rtl:left-4">
        <ThemeLangToggle />
      </div>

      <div className="mb-6 flex flex-col items-center gap-4 animate-float-in">
        <Logo className="h-9 object-contain" />

        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Shield className="h-4 w-4" />
          {t('Admin Portal')}
        </div>

        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-main">{t('Sign in to admin panel')}</h1>
          <p className="mt-1 text-sm text-muted">{t('Authorized personnel only')}</p>
        </div>
      </div>

      <div
        className="bg-surface border-app w-full max-w-md rounded-2xl border p-6 shadow-card animate-float-in md:p-8"
        style={{ animationDelay: '80ms' }}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="admin-email">{t('Email address')}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-faint ltr:left-3.5 rtl:right-3.5" />
              <TextInput
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ltr:pl-10 rtl:pr-10"
                dir="ltr"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="admin-password">{t('Password')}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-faint ltr:left-3.5 rtl:right-3.5" />
              <TextInput
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ltr:pl-10 rtl:pr-10"
                dir="ltr"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full ${primaryButton}`}>
            {loading ? '…' : t('Sign in')}
          </button>
        </form>
      </div>

      <Link to="/" className="mt-6 text-sm text-muted transition hover:text-main animate-float-in" style={{ animationDelay: '120ms' }}>
        {t('Back to home')}
      </Link>
    </div>
  );
}
