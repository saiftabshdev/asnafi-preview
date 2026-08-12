import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Store, Phone, Globe } from 'lucide-react';
import { AuthLayout, AuthDivider, GoogleAuthButton } from '../components/AuthLayout';
import { countries } from '../lib/countries';
import { useAuth } from '../context/AuthContext';
import { getGoogleAuthUrl } from '../lib/api/client';
import { toast } from 'sonner';

export default function Register() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const navigate = useNavigate();
  const { requestRegistrationOtp, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    country: 'US',
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestRegistrationOtp(formData);
      toast.success(t('Verification code sent'));
      setStep('verify');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error(t('Enter 6 digit code'));
      return;
    }
    setLoading(true);
    try {
      await verifyRegistrationOtp(formData.email, otp);
      toast.success(t('Account created'));
      navigate('/dashboard/subscription');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendRegistrationOtp(formData.email);
      toast.success(t('Verification code sent'));
      setResendCooldown(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('Resend failed'));
    }
  };

  if (step === 'verify') {
    return (
      <AuthLayout
        title={t('Verify your email')}
        subtitle={
          <>
            {t('Otp sent to')}{' '}
            <strong style={{ color: 'var(--ink)' }} dir="ltr">
              {formData.email}
            </strong>
          </>
        }
        footer={
          <button type="button" onClick={() => setStep('details')} className="auth-switch">
            {t('Change email')}
          </button>
        }
      >
        <form onSubmit={handleVerify}>
          <div className="field">
            <label htmlFor="otp">{t('Verification code')}</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="otp-input"
              dir="ltr"
              autoComplete="one-time-code"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn primary full auth-submit"
          >
            {loading ? '...' : t('Verify and create account')}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="auth-resend"
          >
            {resendCooldown > 0
              ? t('Resend in seconds', { seconds: resendCooldown })
              : t('Resend code')}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('Create your account')}
      subtitle={
        <>
          {t('Register subtitle')}{' '}
          <Link to="/login" className="auth-switch">
            {t('Already have an account? Sign in')}
          </Link>
        </>
      }
      footer={<Link to="/">{t('Back to home')}</Link>}
    >
      <GoogleAuthButton
        label={t('Continue with Google')}
        onClick={() => {
          window.location.href = getGoogleAuthUrl('/dashboard/subscription');
        }}
      />

      <AuthDivider />

      <form onSubmit={handleRequestOtp}>
        <Field id="name" label={t('Full Name')} icon={User}>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />
        </Field>

        <Field id="restaurant" label={t('Restaurant Name')} icon={Store}>
          <input
            id="restaurant"
            type="text"
            required
            value={formData.restaurant}
            onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
          />
        </Field>

        <Field id="country" label={t('Country')} icon={Globe}>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {isRtl ? c.nameAr : c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="phone" label={t('Phone')} icon={Phone}>
          <input
            id="phone"
            type="text"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            dir="ltr"
          />
        </Field>

        <Field id="email" label={t('Email address')} icon={Mail}>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            dir="ltr"
          />
        </Field>

        <Field id="password" label={t('Password')} icon={Lock}>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            dir="ltr"
          />
        </Field>

        <button type="submit" disabled={loading} className="btn primary full auth-submit">
          {loading ? '...' : t('Continue to verification')}
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-wrap">
        <Icon />
        {children}
      </div>
    </div>
  );
}
