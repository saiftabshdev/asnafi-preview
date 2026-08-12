import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfile } from '../hooks/useApi';
import { X, Save, User, Mail, Globe, Phone, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { countries } from '../lib/countries';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { ApiError } from '../lib/api/client';

type ProfileForm = {
  name: string;
  email: string;
  country: string;
  phone: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyPasswordForm: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function UserProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { user, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState<ProfileForm | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordForm>(emptyPasswordForm);
  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        country: user.country,
        phone: user.phone,
      });
      setPasswordData(emptyPasswordForm);
      setPasswordSectionOpen(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !formData || !user) return null;

  const canChangePassword = user.authProvider === 'LOCAL';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        email: formData.email,
        country: formData.country,
        phone: formData.phone,
      });
      await refreshUser();
      toast.success(t('Profile updated successfully'));
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? String(err.message)
          : err instanceof Error
            ? err.message
            : t('Failed to update profile');
      toast.error(message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error(t('Current password required'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error(t('Password min length'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('Passwords do not match'));
      return;
    }

    try {
      await updateProfile.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData(emptyPasswordForm);
      setPasswordSectionOpen(false);
      toast.success(t('Password changed successfully'));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? String(err.message)
          : err instanceof Error
            ? err.message
            : t('Failed to change password');
      toast.error(message);
    }
  };

  const inputClass = (hasIcon: boolean) =>
    cn(
      'block w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2',
      hasIcon && (isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'),
      !hasIcon && 'px-3',
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('My Profile')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Full Name')}</label>
              <div className="relative rounded-md shadow-sm">
                <div className={cn('absolute inset-y-0 flex items-center pointer-events-none', isRtl ? 'right-0 pr-3' : 'left-0 pl-3')}>
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass(true)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Email address')}</label>
              <div className="relative rounded-md shadow-sm">
                <div className={cn('absolute inset-y-0 flex items-center pointer-events-none', isRtl ? 'right-0 pr-3' : 'left-0 pl-3')}>
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass(true)}
                  dir="ltr"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Country')}</label>
              <div className="relative rounded-md shadow-sm">
                <div className={cn('absolute inset-y-0 flex items-center pointer-events-none', isRtl ? 'right-0 pr-3' : 'left-0 pl-3')}>
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={inputClass(true)}
                  autoComplete="country"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {isRtl ? c.nameAr : c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Phone')}</label>
              <div className="relative rounded-md shadow-sm">
                <div className={cn('absolute inset-y-0 flex items-center pointer-events-none', isRtl ? 'right-0 pr-3' : 'left-0 pl-3')}>
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass(true)}
                  dir="ltr"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          </form>

          {canChangePassword && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPasswordSectionOpen((open) => !open)}
                className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  {t('Change Password')}
                </span>
                {passwordSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {passwordSectionOpen && (
                <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('Password change separate hint')}</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Current password')}</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className={cn('absolute inset-y-0 flex items-center pointer-events-none', isRtl ? 'right-0 pr-3' : 'left-0 pl-3')}>
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className={inputClass(true)}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('New password')}</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className={cn('absolute inset-y-0 flex items-center pointer-events-none', isRtl ? 'right-0 pr-3' : 'left-0 pl-3')}>
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className={inputClass(true)}
                        autoComplete="new-password"
                        minLength={8}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Confirm new password')}</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className={cn('absolute inset-y-0 flex items-center pointer-events-none', isRtl ? 'right-0 pr-3' : 'left-0 pl-3')}>
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className={inputClass(true)}
                        autoComplete="new-password"
                        minLength={8}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="w-full py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {t('Update Password')}
                  </button>
                </form>
              )}
            </div>
          )}

          {!canChangePassword && (
            <p className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-slate-800">
              {t('Google account password hint')}
            </p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-800/50">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            {t('Cancel')}
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={updateProfile.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {t('Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
