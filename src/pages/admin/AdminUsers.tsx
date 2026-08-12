import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Edit, Trash2, ExternalLink, Users as UsersIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import {
  useAdminUsers,
  useAdminUpdateUser,
  useAdminDeleteUser,
  type AdminUser,
} from '../../hooks/useApi';
import { toast } from 'sonner';
import {
  PageHeader,
  PageShell,
  Card,
  Modal,
  Label,
  TextInput,
  Select,
  primaryButton,
  ghostButton,
} from '../../components/dashboard/ui';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminUsers(search);
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const users = data?.data ?? [];

  const handleStatusToggle = async (user: AdminUser) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { status: user.status === 'Active' ? 'INACTIVE' : 'ACTIVE' },
      });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        data: {
          name: editingUser.name,
          email: editingUser.email,
          plan: editingUser.plan,
          endDate: editingUser.endDate || undefined,
        },
      });
      toast.success('User updated');
      setEditingUser(null);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete user?')) return;
    try {
      await deleteUser.mutateAsync(id);
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <PageShell>
      <PageHeader title={t('Users Management')} subtitle={t('Manage all registered users')} />

      <Card title={t('Users Management')} icon={UsersIcon}>
        <div className="relative mb-4 max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-faint ltr:left-3 rtl:right-3" />
          <input
            type="text"
            placeholder={t('Search users...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-2 border-app w-full rounded-xl border py-2.5 text-sm text-main outline-none transition placeholder:text-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4"
          />
        </div>

        <div className="-mx-5 overflow-x-auto md:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-app text-faint border-b text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3 text-start md:px-6">{t('User')}</th>
                <th className="px-5 py-3 text-start md:px-6">{t('Restaurant')}</th>
                <th className="px-5 py-3 text-start md:px-6">{t('Plan')}</th>
                <th className="px-5 py-3 text-start md:px-6">{t('Status')}</th>
                <th className="px-5 py-3 text-start md:px-6">{t('Joined')} / End Date</th>
                <th className="px-5 py-3 md:px-6" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-8 text-center">
                    …
                  </td>
                </tr>
              )}
              {!isLoading &&
                users.map((user) => (
                  <tr key={user.id} className="border-app hover:bg-surface-2 border-b last:border-0">
                    <td className="px-5 py-4 whitespace-nowrap md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-main">{user.name}</div>
                          <div className="truncate text-xs text-faint" dir="ltr">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted px-5 py-4 whitespace-nowrap md:px-6">
                      {user.restaurantName}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap md:px-6">
                      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap md:px-6">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        title={user.status === 'Active' ? t('Disable menu tooltip') : t('Enable menu tooltip')}
                        className={cn(
                          'inline-flex cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                          user.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400',
                        )}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="text-muted px-5 py-4 whitespace-nowrap md:px-6">
                      <div>{user.joinDate}</div>
                      <div className="text-xs text-faint">{user.endDate}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-end text-sm font-medium md:px-6">
                      <div className="flex items-center justify-end gap-1">
                        {user.slug && (
                          <Link
                            to={`/menu/${user.slug}`}
                            target="_blank"
                            className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-brand-500"
                            title="View Menu"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => setEditingUser(user)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-brand-500"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-red-500"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-8 text-center">
                    {t('No users found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        footer={
          <>
            <button type="button" onClick={() => setEditingUser(null)} className={ghostButton}>
              Cancel
            </button>
            <button type="submit" form="admin-edit-user-form" className={primaryButton}>
              Save Changes
            </button>
          </>
        }
      >
        {editingUser && (
          <form id="admin-edit-user-form" onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <TextInput
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <TextInput
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plan</Label>
                <Select
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}
                  className="capitalize"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </Select>
              </div>
              <div>
                <Label>End Date</Label>
                <TextInput
                  type="date"
                  value={editingUser.endDate}
                  onChange={(e) => setEditingUser({ ...editingUser, endDate: e.target.value })}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </PageShell>
  );
}
