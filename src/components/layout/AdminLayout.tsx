import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const location = useLocation();

  return (
    <div className="bg-app text-main flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn('absolute inset-y-0 h-full animate-float-in', isRtl ? 'right-0' : 'left-0')}
          >
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'bg-surface-2 text-main absolute top-4 z-10 grid h-8 w-8 place-items-center rounded-lg',
                  isRtl ? 'left-4' : 'right-4',
                )}
              >
                <X className="h-4 w-4" />
              </button>
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
