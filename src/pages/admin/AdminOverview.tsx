import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  DollarSign,
  Activity,
  CreditCard,
  Store,
  Utensils,
  Layers,
  Palette,
  Globe,
  ExternalLink,
  Clock,
  FileText,
} from 'lucide-react';
import { useAdminUsers, useAdminStats } from '../../hooks/useApi';
import { PageHeader, PageShell, Card } from '../../components/dashboard/ui';
import StatCard from '../../components/dashboard/StatCard';

export default function AdminOverview() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();

  const show = (v: unknown) => (statsLoading ? '…' : String(v ?? 0));

  const primaryStats = [
    { name: t('Total Users'), value: show(stats?.totalUsers), icon: Users, tint: '#6c5ce7' },
    {
      name: t('Active Subscriptions'),
      value: show(stats?.activeSubscriptions),
      icon: CreditCard,
      tint: '#00b894',
    },
    {
      name: t('Trialing Users'),
      value: show(stats?.trialingSubscriptions),
      icon: Clock,
      tint: '#e17055',
    },
    {
      name: t('Monthly Recurring Revenue'),
      value: statsLoading ? '…' : `$${(stats?.monthlyRecurringRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      tint: '#0984e3',
    },
  ];

  const siteStats = [
    { name: t('Total Restaurants'), value: show(stats?.totalRestaurants), icon: Store, tint: '#6c5ce7' },
    { name: t('Menu Items'), value: show(stats?.totalMenuItems), icon: Utensils, tint: '#00b894' },
    { name: t('Categories'), value: show(stats?.totalCategories), icon: Layers, tint: '#e17055' },
    { name: t('Menu Templates'), value: show(stats?.totalTemplates), icon: Palette, tint: '#0984e3' },
  ];

  const recentUsers = usersData?.data?.slice(0, 6) ?? [];
  const maxTemplateCount = Math.max(...(stats?.templateUsage.map((tp) => tp.count) ?? [1]), 1);

  return (
    <PageShell>
      <PageHeader
        title={t('Admin Panel')}
        subtitle={t('System overview')}
        action={
          <div className="border-app bg-surface inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm text-muted shadow-card animate-float-in">
            <Globe className="h-4 w-4 text-brand-500" />
            <span dir="ltr">{stats?.domain ?? 'asnafii.com'}</span>
            <span className="text-faint">·</span>
            <Activity className="h-4 w-4 text-brand-500" />
            {statsLoading ? '…' : stats?.systemUptime}
          </div>
        }
      />

      <div className="mb-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
          {t('Business metrics')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryStats.map((item, i) => (
            <StatCard
              key={item.name}
              icon={item.icon}
              label={item.name}
              value={item.value}
              tint={item.tint}
              delay={i * 60}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
          {t('Platform content')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {siteStats.map((item, i) => (
            <StatCard
              key={item.name}
              icon={item.icon}
              label={item.name}
              value={item.value}
              tint={item.tint}
              delay={240 + i * 60}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title={t('Recent Registrations')} icon={Users} className="lg:col-span-2" delay={480}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-app text-muted border-b text-start">
                  <th className="pb-2 text-start font-medium">{t('Full Name')}</th>
                  <th className="pb-2 text-start font-medium">{t('Restaurant Name')}</th>
                  <th className="pb-2 text-start font-medium">{t('Email address')}</th>
                  <th className="pb-2 text-end font-medium">{t('Join date')}</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading && (
                  <tr>
                    <td colSpan={4} className="text-muted py-4">
                      …
                    </td>
                  </tr>
                )}
                {!usersLoading && recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-muted py-4">
                      {t('No users found.')}
                    </td>
                  </tr>
                )}
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-app border-b last:border-0">
                    <td className="text-main py-3">{u.name}</td>
                    <td className="text-muted py-3">{u.restaurantName || '—'}</td>
                    <td className="text-muted py-3" dir="ltr">
                      {u.email}
                    </td>
                    <td className="text-faint py-3 text-end">{u.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card title={t('Template usage')} icon={Palette} delay={540}>
            <div className="space-y-4">
              {(stats?.templateUsage ?? []).map((tpl) => (
                <div key={tpl.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted capitalize">{tpl.name}</span>
                    <span className="text-faint">{tpl.count}</span>
                  </div>
                  <div className="bg-surface-2 h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${(tpl.count / maxTemplateCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {statsLoading && <p className="text-muted text-sm">…</p>}
            </div>
            <Link
              to="/admin/templates"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              {t('View all templates')} <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Card>

          <Card title={t('Plan distribution')} icon={CreditCard} delay={600}>
            <div className="space-y-1">
              {(stats?.planDistribution ?? []).map((p) => (
                <div
                  key={p.planId}
                  className="border-app flex items-center justify-between border-b py-2 text-sm last:border-0"
                >
                  <span className="text-muted capitalize">{p.planId}</span>
                  <span className="text-main font-semibold">{p.count}</span>
                </div>
              ))}
              {statsLoading && <p className="text-muted text-sm">…</p>}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink
          to="/samples"
          icon={Store}
          label={t('Sample Menus')}
          desc={t('Public demo menus')}
          external
          delay={660}
        />
        <QuickLink
          to="/admin/legal"
          icon={FileText}
          label={t('Legal Content')}
          desc={t('Edit privacy & terms')}
          delay={700}
        />
        <QuickLink
          to="/admin/plans"
          icon={CreditCard}
          label={t('Plans')}
          desc={t('Manage pricing plans')}
          delay={740}
        />
      </div>
    </PageShell>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
  desc,
  external,
  delay = 0,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  external?: boolean;
  delay?: number;
}) {
  const className =
    'bg-surface border-app group flex items-start gap-3 rounded-2xl border p-4 shadow-card transition hover:-translate-y-0.5 animate-float-in';
  const style = { animationDelay: `${delay}ms` };
  const inner = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-semibold text-main">{label}</span>
        <span className="mt-0.5 block text-sm text-muted">{desc}</span>
      </span>
    </>
  );
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={className} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={to} className={className} style={style}>
      {inner}
    </Link>
  );
}
