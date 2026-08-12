import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Clock,
  Info,
  Share2,
} from 'lucide-react';
import type { RestaurantInfo } from '../../../types/restaurant';
import { cn } from '../../../lib/utils';

type Props = {
  r: RestaurantInfo;
  themeColor: string;
  onAboutClick?: () => void;
  className?: string;
  fullWidth?: boolean;
};

function FooterColumn({
  title,
  icon,
  themeColor,
  children,
}: {
  title: string;
  icon: ReactNode;
  themeColor: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-3">
      <h3
        className="text-base font-bold flex items-center gap-2"
        style={{ color: themeColor }}
      >
        <span className="shrink-0">{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

function ContactRow({
  icon,
  href,
  external,
  children,
}: {
  icon: ReactNode;
  href?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const content = (
    <>
      <span className="shrink-0 mt-0.5 w-4 flex justify-center">{icon}</span>
      <span className="min-w-0 flex-1 leading-snug">{children}</span>
    </>
  );

  const rowClass = 'flex items-start gap-2.5 min-w-0 w-full';

  if (href) {
    return (
      <li className="min-w-0">
        <a
          href={href}
          className={cn(rowClass, 'hover:underline text-inherit')}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li className={cn(rowClass, 'min-w-0')}>
      {content}
    </li>
  );
}

export function MenuFooter({ r, themeColor, onAboutClick, className, fullWidth }: Props) {
  const { t } = useTranslation();
  const hasAbout = Boolean(r.description?.trim()) || Boolean(onAboutClick);
  const hasHours = Boolean(r.operatingHours?.length);
  const hasSocial = Boolean(
    r.socialLinks?.instagram ||
      r.socialLinks?.facebook ||
      r.socialLinks?.twitter ||
      r.socialLinks?.website,
  );
  const hasContact = Boolean(r.address || r.phone || r.email || r.mapLink);

  if (!hasAbout && !hasHours && !hasSocial && !hasContact) return null;

  const visibleColumns = [hasAbout, hasHours, hasSocial, hasContact].filter(Boolean).length;

  return (
    <footer
      className={cn(
        'shrink-0 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900',
        fullWidth ? 'w-full mt-auto' : 'mt-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm',
        className,
      )}
    >
      <div className={cn('mx-auto px-4 py-10', fullWidth ? 'max-w-6xl' : 'max-w-5xl')}>
        <div
          className={cn(
            'grid gap-x-10 gap-y-8',
            visibleColumns <= 1 && 'grid-cols-1',
            visibleColumns === 2 && 'grid-cols-1 sm:grid-cols-2',
            visibleColumns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            visibleColumns >= 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {hasAbout && (
            <FooterColumn
              title={t('About Us')}
              icon={<Info className="w-4 h-4" />}
              themeColor={themeColor}
            >
              {r.description?.trim() ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
                  {r.description}
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">{r.name}</p>
              )}
              {onAboutClick && (
                <button
                  type="button"
                  onClick={onAboutClick}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: themeColor }}
                >
                  {t('Learn more')}
                </button>
              )}
            </FooterColumn>
          )}

          {hasHours && (
            <FooterColumn
              title={t('Operating Hours')}
              icon={<Clock className="w-4 h-4" />}
              themeColor={themeColor}
            >
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                {r.operatingHours!.map((hour, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-4 min-w-0"
                  >
                    <span className="shrink-0">{t(hour.day)}</span>
                    <span className="shrink-0 tabular-nums text-end">
                      {hour.isClosed ? t('Closed') : `${hour.open} - ${hour.close}`}
                    </span>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          )}

          {hasSocial && (
            <FooterColumn
              title={t('Social Media')}
              icon={<Share2 className="w-4 h-4" />}
              themeColor={themeColor}
            >
              <div className="flex flex-wrap gap-2">
                {r.socialLinks?.instagram && (
                  <a
                    href={r.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 hover:opacity-80 transition-opacity"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {r.socialLinks?.facebook && (
                  <a
                    href={r.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 hover:opacity-80 transition-opacity"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {r.socialLinks?.twitter && (
                  <a
                    href={r.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 hover:opacity-80 transition-opacity"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {r.socialLinks?.website && (
                  <a
                    href={r.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 hover:opacity-80 transition-opacity"
                    aria-label="Website"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </FooterColumn>
          )}

          {hasContact && (
            <FooterColumn
              title={t('Contact Us')}
              icon={<Phone className="w-4 h-4" />}
              themeColor={themeColor}
            >
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                {r.address && (
                  <ContactRow icon={<MapPin className="w-4 h-4" style={{ color: themeColor }} />}>
                    {r.address}
                  </ContactRow>
                )}
                {r.mapLink && (
                  <ContactRow
                    href={r.mapLink}
                    external
                    icon={<MapPin className="w-4 h-4" style={{ color: themeColor }} />}
                  >
                    <span style={{ color: themeColor }}>{t('View on Google Maps')}</span>
                  </ContactRow>
                )}
                {r.phone && (
                  <ContactRow
                    href={`tel:${r.phone.replace(/\s/g, '')}`}
                    icon={<Phone className="w-4 h-4" style={{ color: themeColor }} />}
                  >
                    <bdi dir="ltr" className="inline tabular-nums">
                      {r.phone}
                    </bdi>
                  </ContactRow>
                )}
                {r.email && (
                  <ContactRow
                    href={`mailto:${r.email}`}
                    icon={<Mail className="w-4 h-4" style={{ color: themeColor }} />}
                  >
                    <span className="break-all">{r.email}</span>
                  </ContactRow>
                )}
              </ul>
            </FooterColumn>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 text-center text-xs text-gray-400">
          Powered by Asnafi
        </div>
      </div>
    </footer>
  );
}
