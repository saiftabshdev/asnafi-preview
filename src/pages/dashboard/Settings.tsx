import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe, Lock, Moon, Palette, Save, Sun, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useUpdateProfile } from '../../hooks/useApi';
import { countries } from '../../lib/countries';
import { cn } from '../../lib/utils';
import { setLanguage } from '../../lib/setLanguage';
import { ApiError } from '../../lib/api/client';
import { useTheme } from '../../components/ThemeProvider';
import { LANG_CODES, LANG_LABELS } from '../../lib/translations';
import {
  Card,
  Label,
  PageShell,
  Select,
  TextInput,
  primaryButton,
} from '../../components/dashboard/ui';

type ProfileForm = { name: string; email: string; country: string; phone: string };
const emptyPassword = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Settings() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState<ProfileForm | null>(null);
  const [password, setPassword] = useState(emptyPassword);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, country: user.country, phone: user.phone });
    }
  }, [user]);

  const canChangePassword = user?.authProvider === 'LOCAL';

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      await updateProfile.mutateAsync(form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success(t('Profile updated successfully'));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? String(err.message) : t('Failed to update profile'),
      );
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.currentPassword) {
      toast.error(t('Current password required'));
      return;
    }
    if (password.newPassword.length < 8) {
      toast.error(t('Password min length'));
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      toast.error(t('Passwords do not match'));
      return;
    }
    try {
      await updateProfile.mutateAsync({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword(emptyPassword);
      toast.success(t('Password changed successfully'));
    } catch (err) {
      toast.error(err instanceof ApiError ? String(err.message) : t('dash.save_failed'));
    }
  };

  const selectLang = (code: string) => setLanguage(code);

  if (!form) {
    return (
      <PageShell width="narrow">
        <p className="text-sm text-muted">{t('Loading...')}</p>
      </PageShell>
    );
  }

  return (
    <PageShell width="narrow">
      <div className="mb-6 animate-float-in">
        <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
          {t('dash.set_title')}
        </h1>
        <p className="mt-1 text-sm text-muted">{t('dash.set_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Profile */}
        <form onSubmit={saveProfile} className="lg:col-span-2">
          <Card title={t('dash.set_profile')} icon={User} delay={40}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t('dash.set_fullname')}</Label>
                <TextInput
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">{t('dash.set_email')}</Label>
                <TextInput
                  id="email"
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="country">{t('dash.set_country')}</Label>
                <Select
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {isRtl ? c.nameAr : c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">{t('dash.set_phone')}</Label>
                <TextInput
                  id="phone"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className={cn(
                  primaryButton,
                  saved && 'bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-500',
                )}
              >
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? t('dash.set_saved') : t('dash.set_save')}
              </button>
            </div>
          </Card>
        </form>

        {/* Appearance + language */}
        <Card title={t('dash.set_appearance')} icon={Palette} delay={100}>
          <div className="space-y-5">
            <div>
              <Label>{t('dash.set_appearance')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'light', icon: Sun, label: t('dash.light_mode') },
                    { id: 'dark', icon: Moon, label: t('dash.dark_mode') },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const active = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border px-2 py-4 transition',
                        active
                          ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                          : 'border-app bg-surface-2 text-muted hover:border-strong',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>{t('dash.set_interface_lang')}</Label>
              <div className="space-y-2">
                {LANG_CODES.map((code) => {
                  const active = i18n.language === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => selectLang(code)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl border px-4 py-3 transition',
                        active
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15'
                          : 'border-app bg-surface-2 hover:border-strong',
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-main">
                        <Globe className="h-4 w-4 text-faint" />
                        {LANG_LABELS[code]}
                      </span>
                      {active && <Check className="h-4 w-4 text-brand-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Password */}
        <Card title={t('dash.set_change_pw')} icon={Lock} delay={160}>
          {canChangePassword ? (
            <form onSubmit={changePassword} className="space-y-4">
              <p className="text-xs text-faint">{t('dash.set_pw_note')}</p>
              <div>
                <Label htmlFor="currentPassword">{t('dash.set_current_pw')}</Label>
                <TextInput
                  id="currentPassword"
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  value={password.currentPassword}
                  onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('dash.set_new_pw')}</Label>
                <TextInput
                  id="newPassword"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  value={password.newPassword}
                  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('dash.set_confirm_pw')}</Label>
                <TextInput
                  id="confirmPassword"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  value={password.confirmPassword}
                  onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={updateProfile.isPending} className={primaryButton}>
                  <Lock className="h-4 w-4" />
                  {t('dash.set_change_pw')}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted">{t('Google account password hint')}</p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
