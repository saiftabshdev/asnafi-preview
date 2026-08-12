import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  lineId: string;
  quantity: number;
  onRemove: (lineId: string) => void;
  onUpdateQty?: (lineId: string, delta: number) => void;
  themeColor?: string;
  compact?: boolean;
};

export function CartLineActions({ lineId, quantity, onRemove, onUpdateQty, themeColor, compact }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 shrink-0">
      {onUpdateQty && (
        <>
          <button
            type="button"
            onClick={() => onUpdateQty(lineId, -1)}
            disabled={quantity <= 1}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40"
            aria-label={t('Decrease quantity')}
          >
            <Minus size={compact ? 12 : 14} />
          </button>
          <span className="text-xs font-semibold w-5 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQty(lineId, 1)}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label={t('Increase quantity')}
          >
            <Plus size={compact ? 12 : 14} />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => onRemove(lineId)}
        className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        aria-label={t('Remove')}
        title={t('Remove')}
      >
        <Trash2 size={compact ? 12 : 14} style={themeColor ? undefined : undefined} />
      </button>
    </div>
  );
}
