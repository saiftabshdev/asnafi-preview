import { useTranslation } from 'react-i18next';
import { X, ShoppingBag } from 'lucide-react';
import type { CartLine } from '../types';
import type { RestaurantInfo } from '../../../types/restaurant';
import { buildWhatsAppOrderMessage } from './whatsapp';
import { CartLineActions } from './CartLineActions';

type Props = {
  cart: CartLine[];
  cartTotal: number;
  restaurant: RestaurantInfo;
  themeColor: string;
  whatsappNumber: string | null;
  ordersEnabled: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onRemoveFromCart: (lineId: string) => void;
  onUpdateCartQty?: (lineId: string, delta: number) => void;
  showFloatingButton: boolean;
};

export function CartOverlay({
  cart,
  cartTotal,
  restaurant,
  themeColor,
  whatsappNumber,
  ordersEnabled,
  isOpen,
  onClose,
  onOpen,
  onRemoveFromCart,
  onUpdateCartQty,
  showFloatingButton,
}: Props) {
  const { t } = useTranslation();

  const sendWhatsApp = () => {
    if (!whatsappNumber) {
      alert(t('WhatsApp not configured'));
      return;
    }
    const msg = buildWhatsAppOrderMessage(cart, cartTotal, restaurant.currency);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      {showFloatingButton && cart.length > 0 && !isOpen && (
        <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <button
            onClick={onOpen}
            className="pointer-events-auto w-full max-w-md py-4 rounded-full font-bold text-white shadow-2xl flex items-center justify-between px-6 transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {cart.reduce((acc, c) => acc + c.quantity, 0)}
              </div>
              <span>{t('Cart')}</span>
            </div>
            <span>
              {cartTotal.toFixed(2)} {restaurant.currency}
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> {t('Cart')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-4 border-b border-gray-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
                >
                  <div className="font-bold text-gray-400 dark:text-gray-500">{c.quantity}x</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{c.item.name}</h4>
                    {c.extras.length > 0 && (
                      <ul className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        {c.extras.map((ex, j) => (
                          <li key={j}>
                            + {ex.qty}x {ex.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {c.totalPrice.toFixed(2)} {restaurant.currency}
                    </div>
                    <CartLineActions
                      lineId={c.id}
                      quantity={c.quantity}
                      onRemove={onRemoveFromCart}
                      onUpdateQty={onUpdateCartQty}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{t('Total')}</span>
                <span className="text-2xl font-bold" style={{ color: themeColor }}>
                  {cartTotal.toFixed(2)} {restaurant.currency}
                </span>
              </div>
              <button
                onClick={sendWhatsApp}
                disabled={!ordersEnabled}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeColor }}
              >
                {t('Send Order via WhatsApp')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
