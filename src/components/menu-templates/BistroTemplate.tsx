import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  X,
  Menu,
  MessageCircle,
} from 'lucide-react';
import { buildWhatsAppOrderMessage } from './shared/whatsapp';
import { CategoryIcon } from './shared/CategoryIcon';
import { getWhatsAppNumber } from '../../lib/restaurantProfile';
import { MenuLogo } from './shared/MenuLogo';
import { MenuTemplateHeader } from './shared/MenuTemplateHeader';
import { MenuFooter } from './shared/MenuFooter';
import { CategorySidebar } from './shared/CategorySidebar';
import { AboutView } from './shared/AboutView';
import { CartLineActions } from './shared/CartLineActions';
import type { MenuTemplateProps } from './types';

export default function BistroTemplate({
  restaurant,
  categories,
  filteredCategories,
  themeColor,
  search,
  setSearch,
  onItemClick,
  isRtl,
  cart,
  cartTotal,
  onOpenCart,
  onRemoveFromCart,
  onUpdateCartQty,
  activeView = 'menu',
  setActiveView,
  ordersEnabled,
}: MenuTemplateProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mobileCart, setMobileCart] = useState(false);
  const whatsappNumber = getWhatsAppNumber(restaurant);

  const displayItems = useMemo(() => {
    for (const cat of filteredCategories) {
      if (cat.id === activeCategory) return cat.items;
    }
    return filteredCategories.flatMap((c) => c.items);
  }, [filteredCategories, activeCategory]);

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const sendWhatsApp = () => {
    if (!whatsappNumber || cart.length === 0) return;
    const msg = buildWhatsAppOrderMessage(cart, cartTotal, restaurant.currency);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const accent = themeColor;
  const sidebarBg = '#1a1a14';

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    setActiveView?.('menu');
    setSearch('');
    setMobileSidebar(false);
  };

  const Sidebar = (
    <CategorySidebar
      restaurant={restaurant}
      categories={categories}
      activeCategoryId={activeCategory}
      onSelectCategory={selectCategory}
      className="w-[220px] select-none"
      surfaceStyle={{ backgroundColor: sidebarBg }}
      surfaceClassName="text-white"
      accentColor={accent}
      activeClassName="border"
      inactiveClassName="text-gray-400 hover:bg-white/5 hover:text-gray-200"
      logoMaxHeight={56}
    />
  );

  const CartPanel = (
    <div className="flex flex-col self-stretch min-h-0 h-full w-[280px] shrink-0 bg-white dark:bg-zinc-900 border-s border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 text-white rounded-t-2xl" style={{ backgroundColor: sidebarBg }}>
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} style={{ color: accent }} />
          <span className="text-sm font-semibold">{t('Cart')}</span>
        </div>
        <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileCart(false)}>
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10">
            <ShoppingBag size={36} className="text-gray-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm font-medium text-gray-500">{t('menu.template.emptyCart')}</p>
          </div>
        ) : (
          cart.map((c) => (
            <div key={c.id} className="flex items-center gap-2 py-2.5 border-b border-gray-50 dark:border-zinc-800 last:border-0">
              {c.item.image && (
                <img src={c.item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0 text-end">
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-100 truncate">{c.item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">× {c.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-zinc-200 whitespace-nowrap">
                {c.totalPrice.toFixed(2)} {restaurant.currency}
              </span>
              <CartLineActions
                lineId={c.id}
                quantity={c.quantity}
                onRemove={onRemoveFromCart}
                onUpdateQty={onUpdateCartQty}
                compact
              />
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex justify-between text-base font-bold pt-1 mb-3">
            <span className="text-gray-800 dark:text-zinc-100">{t('Total')}</span>
            <span style={{ color: accent }}>
              {cartTotal.toFixed(2)} {restaurant.currency}
            </span>
          </div>
        </div>
      )}

      <div className="px-3 pb-4 pt-1">
        <button
          onClick={ordersEnabled ? sendWhatsApp : onOpenCart}
          disabled={cart.length === 0 && !ordersEnabled}
          className="w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
          style={{ backgroundColor: sidebarBg }}
        >
          <MessageCircle size={16} />
          {ordersEnabled ? t('Send Order via WhatsApp') : t('Cart')}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#f5f4f0] dark:bg-zinc-950 flex flex-col"
      style={{ ['--menu-accent' as string]: themeColor }}
    >
      <div className="flex flex-1 min-h-0 items-stretch">
        <div className="hidden lg:flex self-stretch shrink-0">{Sidebar}</div>

        <AnimatePresence>
          {mobileSidebar && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileSidebar(false)} />
              <motion.div
                initial={{ x: isRtl ? 280 : -280 }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? 280 : -280 }}
                className="fixed top-0 bottom-0 z-50 lg:hidden"
                style={isRtl ? { right: 0 } : { left: 0 }}
              >
                {Sidebar}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <MenuTemplateHeader
            restaurant={restaurant}
            themeColor={themeColor}
            search={search}
            setSearch={setSearch}
            isRtl={isRtl}
            showAboutNav={false}
            showHours={false}
            startSlot={
            <>
              <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => setMobileSidebar(true)}>
                <Menu size={20} />
              </button>
              <div className="lg:hidden shrink-0">
                <MenuLogo restaurant={restaurant} maxHeight={36} />
              </div>
            </>
          }
          endSlot={
            <button className="lg:hidden relative p-2 rounded-full border border-gray-200 dark:border-zinc-700" onClick={() => setMobileCart(true)}>
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
                  {cartCount}
                </span>
              )}
            </button>
          }
        />

        <div className="flex-1 flex items-stretch min-h-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-5 min-h-[320px]">
            {activeView === 'about' ? (
              <AboutView
                restaurant={restaurant}
                themeColor={themeColor}
                isRtl={isRtl}
                onBack={() => setActiveView?.('menu')}
              />
            ) : (
              <>
                {restaurant.coverImage && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden h-[200px] sm:h-[240px]">
                    <img src={restaurant.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-black/30 to-black/60" />
                  </motion.div>
                )}

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => {
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setSearch('');
                        }}
                        className={`px-4 py-3 rounded-2xl border text-xs font-medium whitespace-nowrap min-w-[80px] inline-flex items-center gap-2 ${
                          active ? 'shadow-sm' : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-500'
                        }`}
                        style={
                          active
                            ? { backgroundColor: `${accent}26`, borderColor: `${accent}66`, color: accent }
                            : undefined
                        }
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 shrink-0" />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                      onClick={() => onItemClick(item)}
                    >
                      {item.image && (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-bold text-gray-800 dark:text-zinc-100">
                            {Number(item.price).toFixed(2)} {restaurant.currency}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick(item);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-full text-xs font-semibold"
                            style={{ backgroundColor: sidebarBg }}
                          >
                            <Plus size={13} /> {t('Add to Cart')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {displayItems.length === 0 && (
                  <div className="text-center py-12 text-gray-500">{t('No items found.')}</div>
                )}
              </>
            )}
          </main>

          <div className="hidden lg:flex self-stretch shrink-0 py-5 pe-5">{CartPanel}</div>
        </div>
        </div>
      </div>

      <MenuFooter
        r={restaurant}
        themeColor={themeColor}
        onAboutClick={setActiveView ? () => setActiveView('about') : undefined}
        fullWidth
      />

      <AnimatePresence>
        {mobileCart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileCart(false)} />
            <motion.div
              initial={{ x: isRtl ? -320 : 320 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? -320 : 320 }}
              className="fixed top-0 bottom-0 z-50 lg:hidden"
              style={isRtl ? { left: 0 } : { right: 0 }}
            >
              {CartPanel}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
