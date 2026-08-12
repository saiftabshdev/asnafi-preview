import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, FolderPlus, PlusCircle, QrCode, type LucideIcon } from 'lucide-react';

type Action = { icon: LucideIcon; key: string; tint: string; to: string; external?: boolean };

export default function QuickActions({ menuSlug }: { menuSlug?: string }) {
  const { t } = useTranslation();

  const actions: Action[] = [
    { icon: PlusCircle, key: 'dash.qa_add_item', tint: '#6c5ce7', to: '/dashboard/menu?new=item' },
    { icon: FolderPlus, key: 'dash.qa_add_category', tint: '#00b894', to: '/dashboard/menu?new=category' },
    { icon: QrCode, key: 'dash.qa_share_qr', tint: '#0984e3', to: '/dashboard/share' },
    {
      icon: Eye,
      key: 'dash.qa_preview',
      tint: '#e17055',
      to: menuSlug ? `/menu/${menuSlug}` : '/samples',
      external: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a, i) => {
        const Icon = a.icon;
        const className =
          'group bg-surface border-app flex flex-col items-center gap-2.5 rounded-2xl border p-4 shadow-card transition-all hover:-translate-y-0.5 animate-float-in';
        const style = { animationDelay: `${180 + i * 40}ms` };
        const inner = (
          <>
            <span
              className="grid h-11 w-11 place-items-center rounded-xl transition-transform group-hover:scale-110"
              style={{ background: `${a.tint}1a`, color: a.tint }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-main">{t(a.key)}</span>
          </>
        );

        return a.external ? (
          <a key={a.key} href={a.to} target="_blank" rel="noreferrer" className={className} style={style}>
            {inner}
          </a>
        ) : (
          <Link key={a.key} to={a.to} className={className} style={style}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
