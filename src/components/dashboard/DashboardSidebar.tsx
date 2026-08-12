import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  LogOut,
  Palette,
  Settings,
  Share2,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Logo } from '../Logo';
import { useAuth, useEffectivePlanId, useHasSubscription } from '../../context/AuthContext';
import { usePlans, useRestaurant } from '../../hooks/useApi';
import { localizePlan } from '../../lib/localizePlan';

type NavItem = { to: string; end?: boolean; icon: LucideIcon; label: string };

const NAV_GROUPS: { key: string; items: NavItem[] }[] = [
  {
    key: 'dash.section_manage',
    items: [
      { to: '/dashboard', end: true, icon: LayoutGrid, label: 'dash.nav_overview' },
      { to: '/dashboard/restaurant', icon: Store, label: 'dash.nav_restaurant' },
      { to: '/dashboard/menu', icon: UtensilsCrossed, label: 'dash.nav_menu' },
      { to: '/dashboard/design', icon: Palette, label: 'dash.nav_design' },
    ],
  },
  {
    key: 'dash.section_growth',
    items: [
      { to: '/dashboard/analytics', icon: BarChart3, label: 'dash.nav_analytics' },
      { to: '/dashboard/share', icon: Share2, label: 'dash.nav_qr' },
      { to: '/dashboard/subscription', icon: CreditCard, label: 'dash.nav_subscription' },
      { to: '/dashboard/settings', icon: Settings, label: 'dash.nav_settings' },
    ],
  },
];

function initials(name?: string) {
  if (!name) return 'U';
  return name.trim().charAt(0).toUpperCase() || 'U';
}

export default function DashboardSidebar({
  onNavigate,
  onOpenProfile,
}: {
  onNavigate?: () => void;
  onOpenProfile?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const location = useLocation();
  const { user, logout } = useAuth();
  const hasSubscription = useHasSubscription();
  const planId = useEffectivePlanId();
  const { data: plans = [] } = usePlans();
  const { data: restaurant } = useRestaurant();

  const currentPlan = plans.find((p) => p.id === planId);
  const planName = currentPlan ? localizePlan(currentPlan, t).name : t('dash.sub_type_trial');
  const itemCount =
    restaurant?.categories.reduce((sum, c) => sum + c.items.length, 0) ?? 0;
  const itemLimit = currentPlan?.maxMenuItems ?? null;

  return (
    <aside className="bg-sidebar border-app flex h-full w-[264px] flex-col border-e">
      {/* Brand */}
      <Link to="/" className="flex flex-col gap-1 px-6 py-6">
        <Logo className="h-7 w-fit object-contain" />
        <div className="text-[11px] font-medium tracking-wide text-faint">MENU PLATFORM</div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.key} className="mb-6">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
              {t(group.key)}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
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
          </div>
        ))}
      </nav>

      {/* Plan card */}
      <div className="px-4 pb-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-lg shadow-brand-500/25">
          <div className="absolute -end-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="text-sm font-semibold">{planName}</div>
            <div className="mt-0.5 text-xs text-white/70" dir="ltr">
              {itemLimit == null ? `${itemCount} / ∞` : `${itemCount} / ${itemLimit}`}
            </div>
            <Link
              to="/dashboard/subscription"
              onClick={onNavigate}
              className="mt-3 block w-full rounded-lg bg-white/95 px-3 py-1.5 text-center text-xs font-bold text-brand-700 transition hover:bg-white"
            >
              {hasSubscription ? t('dash.upgrade') : t('dash.sub_upgrade')}
            </Link>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="border-app flex items-center gap-3 border-t px-5 py-4">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex min-w-0 flex-1 items-center gap-3 text-start"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(user?.name)
            )}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-main">
              {restaurant?.info.name || user?.restaurantName || user?.name}
            </span>
            <span className="block truncate text-xs text-faint" dir="ltr">
              {user?.email}
            </span>
          </span>
        </button>
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
