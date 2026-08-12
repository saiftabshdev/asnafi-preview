import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Facebook,
  Link2,
  MessageCircle,
  QrCode as QrIcon,
  Send,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../hooks/useApi';
import { Card, PageShell } from '../../components/dashboard/ui';

const QR_ELEMENT_ID = 'asnafi-menu-qr';

export default function ShareMenu() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { user } = useAuth();
  const { data } = useRestaurant();
  const [copied, setCopied] = useState(false);

  const slug = data?.info.slug ?? user?.slug;
  const menuUrl = slug ? `${window.location.origin}/menu/${slug}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('dash.save_failed'));
    }
  };

  /** Rasterise the inline SVG to a PNG the user can print. */
  const downloadQr = () => {
    const svg = document.getElementById(QR_ELEMENT_ID);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      const a = document.createElement('a');
      a.download = `${slug ?? 'menu'}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const shareLinks = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      tint: '#25d366',
      url: `https://wa.me/?text=${encodeURIComponent(menuUrl)}`,
    },
    {
      icon: Send,
      label: 'Telegram',
      tint: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(menuUrl)}`,
    },
    {
      icon: Facebook,
      label: 'Facebook',
      tint: '#1877f2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(menuUrl)}`,
    },
  ];

  if (!slug) {
    return (
      <PageShell width="narrow">
        <p className="text-sm text-muted">{t('Complete restaurant profile menu hint')}</p>
      </PageShell>
    );
  }

  return (
    <PageShell width="narrow">
      {user?.status === 'INACTIVE' && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {t('Menu disabled admin banner')}
        </div>
      )}

      <div className="mb-8 animate-float-in">
        <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
          {t('dash.sh_title')}
        </h1>
        <p className="mt-1 text-sm text-muted">{t('dash.sh_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Link */}
        <Card title={t('dash.sh_link_title')} icon={Link2} delay={40} className="flex flex-col">
          <div className="border-app bg-surface-2 flex overflow-hidden rounded-xl border">
            <button
              type="button"
              onClick={copyLink}
              title={t('dash.sh_copy')}
              className={cn(
                'border-app grid w-12 shrink-0 place-items-center transition ltr:border-r rtl:border-l',
                copied ? 'text-emerald-500' : 'text-faint hover:text-brand-500',
              )}
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
            <input
              readOnly
              dir="ltr"
              value={menuUrl}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-main outline-none"
            />
          </div>

          <button
            type="button"
            onClick={copyLink}
            className={cn(
              'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition',
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25',
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t('dash.sh_copied') : t('dash.sh_copy')}
          </button>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-faint">
              <Share2 className="h-3.5 w-3.5" />
              {t('dash.sh_share_on')}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {shareLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border-app bg-surface-2 flex flex-col items-center gap-2 rounded-xl border py-3 transition hover:-translate-y-0.5 hover:border-strong"
                  >
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full"
                      style={{ background: `${s.tint}1a`, color: s.tint }}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-xs font-semibold text-muted">{s.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex-1" />

          <a
            href={menuUrl}
            target="_blank"
            rel="noreferrer"
            className="border-app mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold text-main transition hover:border-strong"
          >
            {t('dash.sh_open_new')}
            <ExternalLink className={cn('h-4 w-4', isRtl && 'rotate-180')} />
          </a>
        </Card>

        {/* QR */}
        <Card title={t('dash.sh_qr_title')} icon={QrIcon} delay={100} className="flex flex-col">
          <div className="flex flex-col items-center">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <QRCodeSVG
                id={QR_ELEMENT_ID}
                value={menuUrl}
                size={220}
                level="H"
                marginSize={2}
                fgColor="#16162a"
                bgColor="#ffffff"
              />
            </div>
            <p className="mt-4 text-center text-xs text-faint">{t('dash.sh_scan_hint')}</p>
          </div>

          <div className="flex-1" />

          <button
            type="button"
            onClick={downloadQr}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
          >
            <Download className="h-4 w-4" />
            {t('dash.sh_download_qr')}
          </button>
        </Card>
      </div>
    </PageShell>
  );
}
