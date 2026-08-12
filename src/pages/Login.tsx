import React from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout, AuthDivider, GoogleAuthButton } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { getGoogleAuthUrl } from '../lib/api/client';
import { toast } from 'sonner';

const OAUTH_ERRORS: Record<string, string> = {
  google_not_configured: 'Google sign-in is not configured on this server.',
  auth_failed: 'Authentication failed. Please try again.',
  admin_use_admin_portal: 'Admin accounts must use the admin login portal.',
};

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, logout, user } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  React.useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      toast.error(OAUTH_ERRORS[oauthError] ?? t('Sign-in error'));
    }
  }, [searchParams, t]);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email.trim().toLowerCase(), password);
      if (loggedIn.role === 'ADMIN') {
        await logout();
        setError(t('Admin use admin portal'));
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('Sign in to your account')}
      subtitle={
        <>
          {t('Or')}{' '}
          <Link to="/register" className="auth-switch">
            {t('Create your account')}
          </Link>
          {' — '}
          {t('Trial note')}
        </>
      }
      footer={<Link to="/">{t('Back to home')}</Link>}
    >
      {error && <div className="auth-error">{error}</div>}

      <GoogleAuthButton
        label={t('Continue with Google')}
        onClick={() => {
          window.location.href = getGoogleAuthUrl(from);
        }}
      />

      <AuthDivider />

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">{t('Email address')}</label>
          <div className="field-wrap">
            <Mail />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="password">{t('Password')}</label>
          <div className="field-wrap">
            <Lock />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn primary full auth-submit">
          {loading ? '...' : t('Sign in')}
        </button>
      </form>
    </AuthLayout>
  );
}
