import type { RestaurantInfo } from '../types/restaurant';

export function parseWhatsAppNumber(input: string | null | undefined): string | null {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return null;

  const waMe = trimmed.match(/wa\.me\/(\d+)/i);
  if (waMe) return waMe[1];

  const sendLink = trimmed.match(/[?&]phone=(\d+)/i);
  if (sendLink) return sendLink[1];

  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

export function getRestaurantProfileMissing(info: Partial<RestaurantInfo>): string[] {
  const missing: string[] = [];
  if (!info.name?.trim()) missing.push('name');
  if (!info.description?.trim()) missing.push('description');
  if (!info.address?.trim()) missing.push('address');
  if (!parseWhatsAppNumber(info.whatsapp || info.phone)) missing.push('whatsapp');
  return missing;
}

export function isRestaurantProfileComplete(info: Partial<RestaurantInfo>): boolean {
  return getRestaurantProfileMissing(info).length === 0;
}

export function getWhatsAppNumber(info: Partial<RestaurantInfo>): string | null {
  return parseWhatsAppNumber(info.whatsapp || info.phone);
}
