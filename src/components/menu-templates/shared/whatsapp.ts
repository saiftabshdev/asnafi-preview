import type { CartLine } from '../types';

export function buildWhatsAppOrderMessage(
  cart: CartLine[],
  cartTotal: number,
  currency: string,
): string {
  const lines = cart.map(
    (c) =>
      `${c.quantity}x ${c.item.name}${
        c.extras.length
          ? ` (${c.extras.map((e) => `${e.qty}x ${e.name}`).join(', ')})`
          : ''
      }`,
  );
  return `New Order from Asnafi:\n\n${lines.join('\n')}\n\nTotal: ${cartTotal.toFixed(2)} ${currency}`;
}
