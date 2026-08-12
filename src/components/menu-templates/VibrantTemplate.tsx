import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Plus,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeLangToggle } from '../ThemeLangToggle';
import { buildWhatsAppOrderMessage } from './shared/whatsapp';
import { getWhatsAppNumber } from '../../lib/restaurantProfile';
import { MenuLogo } from './shared/MenuLogo';
import { AboutView } from './shared/AboutView';
import { CartLineActions } from './shared/CartLineActions';
import { MenuFooter } from './shared/MenuFooter';
import { CategorySidebar } from './shared/CategorySidebar';
import type { MenuTemplateProps } from './types';
import { CategoryIcon } from './shared/CategoryIcon';

export default function VibrantTemplate({
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
  onRemoveFromCart,
  onUpdateCartQty,
  activeView = 'menu',
  setActiveView,
  ordersEnabled,
}: MenuTemplateProps) {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const accent = themeColor;
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const whatsappNumber = getWhatsAppNumber(restaurant);

  const displayItems = useMemo(() => {
    for (const cat of filteredCategories) {
      if (cat.id === activeCategory) return cat.items;
    }
    return [];
  }, [filteredCategories, activeCategory]);

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);

  const sendWhatsApp = () => {
    if (!whatsappNumber || cart.length === 0) return;
    const msg = buildWhatsAppOrderMessage(cart, cartTotal, restaurant.currency);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    setShowMobileCart(false);
  };

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    setActiveView?.('menu');
    setMobileSidebar(false);
  };

  const openAbout = () => {
    setActiveView?.('about');
    setMobileSidebar(false);
  };

  const CategoryNav = ({ className = '', widthClass = 'w-[260px]' }: { className?: string; widthClass?: string }) => (
    <CategorySidebar
      restaurant={restaurant}
      categories={categories}
      activeCategoryId={activeCategory}
      onSelectCategory={selectCategory}
      className={cn(widthClass, className)}
      surfaceStyle={{ backgroundColor: accent }}
      surfaceClassName="text-white"
      activeClassName="bg-slate-900 text-white shadow-lg"
      inactiveClassName="text-white/90 hover:bg-white/15"
      logoMaxHeight={56}
    />
  );

  const CartContent = () => (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {cart.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-12">{t('menu.template.emptyCart')}</p>
        ) : (
          cart.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="text-sm font-semibold text-slate-500 w-6">{c.quantity}x</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                  {c.item.name}
                </p>
                <p className="font-bold text-sm" style={{ color: accent }}>
                  {c.totalPrice.toFixed(2)} {restaurant.currency}
                </p>
              </div>
              {c.item.image && (
                <img src={c.item.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
              )}
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
      <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">{t('Total')}:</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {cartTotal.toFixed(2)} {restaurant.currency}
          </span>
        </div>
        <button
          onClick={sendWhatsApp}
          disabled={!ordersEnabled || cart.length === 0}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {t('Send Order via WhatsApp')}
        </button>
      </div>
    </>
  );

  const ItemGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
      {displayItems.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          {item.image && (
            <div className="aspect-square rounded-xl overflow-hidden mb-3">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{item.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-lg" style={{ color: accent }}>
              {Number(item.price).toFixed(2)} {restaurant.currency}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: accent }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f5f5f7] text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col"
      style={{ ['--menu-accent' as string]: themeColor }}
    >
      {/* Desktop */}
      <div className="hidden lg:flex flex-col flex-1 min-h-screen">
        <div className="flex flex-1 min-h-0 items-stretch">
          <CategoryNav />

          <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-[#f5f5f7] dark:bg-slate-950">
            <div className="flex-1 overflow-y-auto px-8 py-6 min-h-[320px]">
              {activeView === 'about' ? (
                <AboutView
                  restaurant={restaurant}
                  themeColor={themeColor}
                  isRtl={isRtl}
                  onBack={() => setActiveView?.('menu')}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <ThemeLangToggle />
                    <h2 className="text-2xl font-bold flex-1 text-center">{t('menu.template.featuredDishes')}</h2>
                    <div className="relative">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('Search menu...')}
                        className="pe-10 ps-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm w-56"
                      />
                    </div>
                  </div>
                  <ItemGrid />
                  {displayItems.length === 0 && (
                    <p className="text-center py-16 text-slate-400 text-sm">{t('No items found.')}</p>
                  )}
                </>
              )}
            </div>
          </main>

          <aside className="w-[300px] shrink-0 self-stretch bg-white dark:bg-slate-900 border-s border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" style={{ color: accent }} />
              <h2 className="font-bold text-lg">{t('Cart')}</h2>
            </div>
            <CartContent />
          </aside>
        </div>

        <MenuFooter
          r={restaurant}
          themeColor={themeColor}
          onAboutClick={setActiveView ? openAbout : undefined}
          fullWidth
        />
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen flex flex-col pb-28">
        <AnimatePresence>
          {mobileSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebar(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ x: isRtl ? 280 : -280 }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? 280 : -280 }}
                className="fixed top-0 bottom-0 z-50 h-full"
                style={isRtl ? { right: 0 } : { left: 0 }}
              >
                <CategoryNav className="h-full min-h-screen" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3 py-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileSidebar(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label={t('Menu')}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex justify-center min-w-0 px-1">
            <MenuLogo restaurant={restaurant} maxHeight={40} />
          </div>
          <ThemeLangToggle />
          <button
            type="button"
            onClick={() => setShowMobileCart(true)}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label={t('Cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                className="absolute -top-0.5 -end-0.5 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </header>

        {activeView === 'about' ? (
          <div className="flex-1 overflow-y-auto">
            <AboutView
              restaurant={restaurant}
              themeColor={themeColor}
              isRtl={isRtl}
              onBack={() => setActiveView?.('menu')}
            />
          </div>
        ) : (
          <>
            <div className="px-4 py-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search menu...')}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </div>

            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold ${
                    activeCategory === cat.id
                      ? 'text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: accent } : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 shrink-0" />
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 px-4 py-3 min-h-[240px]">
              <ItemGrid />
              {displayItems.length === 0 && (
                <p className="text-center py-12 text-slate-400 text-sm">{t('No items found.')}</p>
              )}
            </div>

            <MenuFooter
              r={restaurant}
              themeColor={themeColor}
              onAboutClick={setActiveView ? openAbout : undefined}
              fullWidth
              className="mt-auto"
            />
          </>
        )}

        {totalItems > 0 && activeView !== 'about' && (
          <motion.button
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            onClick={() => setShowMobileCart(true)}
            className="fixed bottom-5 left-4 right-4 z-40 text-white rounded-2xl py-4 px-5 flex items-center justify-center gap-2 shadow-xl font-bold"
            style={{ backgroundColor: accent }}
          >
            <ShoppingCart className="w-5 h-5" />
            {t('Cart')} ({totalItems}) — {cartTotal.toFixed(2)} {restaurant.currency}
          </motion.button>
        )}

        <AnimatePresence>
          {showMobileCart && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileCart(false)}
                className="fixed inset-0 bg-black/40 z-50"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] flex flex-col"
              >
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingCart style={{ color: accent }} /> {t('Cart')}
                  </h2>
                  <button
                    onClick={() => setShowMobileCart(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <CartContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
