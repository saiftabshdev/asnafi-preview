import { useTranslation } from 'react-i18next';

const WHATSAPP_URL = 'https://wa.me/message/Z36J62K7EN3WN1';

export function WhatsAppButton() {
  const { t } = useTranslation();

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={t('Chat on WhatsApp')}
      title={t('Chat on WhatsApp')}
      className="fixed bottom-6 z-[80] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-lg shadow-black/25 transition-transform hover:scale-110 active:scale-95 ltr:right-6 rtl:left-6"
    >
      <span className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-40 motion-safe:animate-ping" />
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.845 9.845 0 0 0 12.04 2Zm0 18.15c-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.83.84-3.04-.2-.32a8.19 8.19 0 0 1-1.25-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.15 8.15 0 0 1 2.41 5.83c-.01 4.54-3.71 8.23-8.26 8.23Zm4.52-6.16c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18a7.19 7.19 0 0 1-1.33-1.65c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.2-.47-.4-.41-.54-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2.01 0 1.19.86 2.34.98 2.5.12.16 1.7 2.6 4.13 3.64.58.25.99.4 1.33.51.56.18 1.07.15 1.47.09.45-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
