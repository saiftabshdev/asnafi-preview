import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { Item, RestaurantInfo } from '../../../types/restaurant';

type Props = {
  item: Item;
  restaurant: RestaurantInfo;
  themeColor: string;
  ordersEnabled: boolean;
  quantity: number;
  setQuantity: (n: number) => void;
  extrasState: Record<string, { selected: boolean; qty: number }>;
  toggleExtra: (name: string) => void;
  updateExtraQty: (name: string, delta: number) => void;
  currentItemTotal: number;
  onClose: () => void;
  onAddToCart: () => void;
};

export function ItemExtrasModal({
  item,
  restaurant,
  themeColor,
  ordersEnabled,
  quantity,
  setQuantity,
  extrasState,
  toggleExtra,
  updateExtraQty,
  currentItemTotal,
  onClose,
  onAddToCart,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {item.image && (
          <div className="relative h-48 sm:h-56 w-full shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1 relative">
          {!item.image && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 pr-8">{item.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
          <div className="font-bold text-xl mb-6" style={{ color: themeColor }}>
            {Number(item.price).toFixed(2)} {restaurant.currency}
          </div>

          {item.extras && item.extras.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t('Extras')}</h3>
              <div className="space-y-3">
                {item.extras.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-slate-800 gap-3"
                  >
                    <label className="flex items-center gap-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extrasState[ex.name]?.selected || false}
                        onChange={() => toggleExtra(ex.name)}
                        className="w-5 h-5 rounded border-gray-300 bg-white dark:bg-slate-900"
                        style={{ accentColor: themeColor }}
                      />
                      <div>
                        <span className="block font-medium text-gray-900 dark:text-white">{ex.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          +{Number(ex.price).toFixed(2)} {restaurant.currency}
                        </span>
                      </div>
                    </label>
                    {extrasState[ex.name]?.selected && (
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-lg p-1 w-fit">
                        <button
                          onClick={() => updateExtraQty(ex.name, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md"
                        >
                          -
                        </button>
                        <span className="font-medium w-4 text-center dark:text-white">
                          {extrasState[ex.name].qty}
                        </span>
                        <button
                          onClick={() => updateExtraQty(ex.name, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
            <span className="font-bold text-gray-900 dark:text-white">{t('Quantity')}</span>
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-lg p-1 border border-gray-200 dark:border-slate-700 shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
              >
                -
              </button>
              <span className="font-bold w-6 text-center dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={onAddToCart}
            disabled={!ordersEnabled}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-between px-6 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: themeColor }}
          >
            <span>{ordersEnabled ? t('Add to Cart') : t('WhatsApp orders unavailable')}</span>
            <span>
              {currentItemTotal.toFixed(2)} {restaurant.currency}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
