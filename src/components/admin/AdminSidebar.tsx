import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  LayoutGrid,
  LogOut,
  Palette,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Logo } from '../Logo';
import { useAuth } from '../../context/AuthContext';

type NavItem = { to: string; end?: boolean; icon: LucideIcon; label: string };

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', end: true, icon: LayoutGrid, label: 'dash.nav_overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/plans', icon: CreditCard, label: 'Plans' },
  { to: '/admin/templates', icon: Palette, label: 'Menu Templates' },
  { to: '/admin/legal', icon: FileText, label: 'Legal Content' },
];

function initials(name?: string) {
  if (!name) return 'A';
  return name.trim().charAt(0).toUpperCase() || 'A';
}

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="bg-sidebar border-app flex h-full w-[264px] flex-col border-e">
      {/* Brand */}
      <Link to="/admin" className="flex flex-col gap-1 px-6 py-6">
        <Logo className="h-7 w-fit object-contain" />
        <div className="text-[11px] font-medium tracking-wide text-faint uppercase">
          {t('Admin Panel')}
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'text-muted hover:bg-surface-2 hover:text-main',
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0',
                    isActive ? 'text-white' : 'text-faint group-hover:text-brand-500',
                  )}
                />
                <span className="flex-1 text-start">{t(item.label)}</span>
                {isActive && (
                  <ChevronRight className={cn('h-4 w-4 text-white/70', isRtl && 'rotate-180')} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* View site card */}
      <div className="px-4 pb-3">
        <a
          href="https://asnafii.com"
          target="_blank"
          rel="noreferrer"
          className="border-app bg-surface-2 flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold text-muted transition hover:text-main"
          dir="ltr"
        >
          asnafii.com
          <ExternalLink className="h-4 w-4 shrink-0" />
        </a>
        <Link
          to="/"
          onClick={onNavigate}
          className="mt-2 block w-full rounded-xl px-4 py-2 text-center text-xs font-semibold text-faint transition hover:text-main"
        >
          {t('Exit Admin')}
        </Link>
      </div>

      {/* User */}
      <div className="border-app flex items-center gap-3 border-t px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(user?.name)
          )}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold text-main">{user?.name}</span>
          <span className="block truncate text-xs text-faint" dir="ltr">
            {user?.email}
          </span>
        </span>
        <button
          type="button"
          onClick={() => logout()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-red-500"
          title={t('dash.logout')}
        >
          <LogOut className={cn('h-4 w-4', isRtl && 'rotate-180')} />
        </button>
      </div>
    </aside>
  );
}
