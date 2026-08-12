import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, X, Menu, MessageCircle } from 'lucide-react';
import { ThemeLangToggle } from '../ThemeLangToggle';
import { buildWhatsAppOrderMessage } from './shared/whatsapp';
import { getWhatsAppNumber } from '../../lib/restaurantProfile';
import { MenuLogo } from './shared/MenuLogo';
import { AboutView } from './shared/AboutView';
import { CartLineActions } from './shared/CartLineActions';
import { MenuFooter } from './shared/MenuFooter';
import { CategorySidebar } from './shared/CategorySidebar';
import type { MenuTemplateProps } from './types';

const GOLD = '#E8A84C';

export default function NakhilTemplate({
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
  const accent = themeColor || GOLD;
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

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    setActiveView?.('menu');
    setSearch('');
    setMobileSidebar(false);
  };

  const openAbout = () => setActiveView?.('about');

  const Sidebar = (
    <CategorySidebar
      restaurant={restaurant}
      categories={categories}
      activeCategoryId={activeCategory}
      onSelectCategory={selectCategory}
      className="w-[240px]"
      surfaceClassName="bg-white dark:bg-[#111111] text-stone-800 dark:text-[#F0EDE6] border-e border-stone-200 dark:border-white/10"
      activeClassName="font-semibold text-stone-900 dark:text-[#0C0C0C]"
      inactiveClassName="text-stone-500 dark:text-[#888] hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-[#F0EDE6]"
      accentColor={accent}
      logoMaxHeight={64}
    />
  );

  const CartPanel = (
    <div className="flex flex-col self-stretch min-h-0 h-full w-[300px] shrink-0 bg-stone-50 dark:bg-[#181818] border-s border-stone-200 dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-stone-900 dark:text-[#F0EDE6]">
          <ShoppingBag size={18} style={{ color: accent }} />
          <span className="font-bold">{t('Cart')}</span>
        </div>
        <button className="lg:hidden text-stone-400" onClick={() => setMobileCart(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {cart.length === 0 ? (
          <p className="text-center text-stone-400 dark:text-[#888] text-sm py-12">{t('menu.template.emptyCart')}</p>
        ) : (
          cart.map((c) => (
            <div key={c.id} className="flex items-center gap-2 py-3 border-b border-stone-200 dark:border-white/5 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6] truncate">{c.item.name}</p>
                <p className="text-xs text-stone-500 dark:text-[#888]">× {c.quantity}</p>
              </div>
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: accent }}>
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
        <div className="px-4 py-3 border-t border-stone-200 dark:border-white/10">
          <div className="flex justify-between font-bold text-stone-900 dark:text-[#F0EDE6] mb-3">
            <span>{t('Total')}</span>
            <span style={{ color: accent }}>
              {cartTotal.toFixed(2)} {restaurant.currency}
            </span>
          </div>
          <button
            onClick={ordersEnabled ? sendWhatsApp : onOpenCart}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl font-bold text-stone-900 dark:text-[#0C0C0C] flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ backgroundColor: accent }}
          >
            <MessageCircle size={16} />
            {ordersEnabled ? t('Send Order via WhatsApp') : t('Cart')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f5f0] dark:bg-[#0C0C0C] text-stone-900 dark:text-[#F0EDE6] flex flex-col">
      <div className="flex flex-1 min-h-0 items-stretch">
        <div className="hidden lg:flex self-stretch shrink-0">{Sidebar}</div>

        <AnimatePresence>
          {mobileSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={() => setMobileSidebar(false)}
              />
              <motion.div
                initial={{ x: isRtl ? 280 : -280 }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? 280 : -280 }}
                className="fixed top-0 bottom-0 z-50 lg:hidden h-full"
                style={isRtl ? { right: 0 } : { left: 0 }}
              >
                {Sidebar}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <header className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-200 dark:border-white/10 bg-white/95 dark:bg-[#0C0C0C]/95 backdrop-blur shrink-0">
            <ThemeLangToggle />
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 shrink-0"
              onClick={() => setMobileSidebar(true)}
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden flex-1 flex justify-center min-w-0">
              <MenuLogo restaurant={restaurant} maxHeight={36} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search menu...')}
              className="hidden sm:block flex-1 max-w-md py-2 px-4 text-sm bg-stone-100 dark:bg-[#181818] border border-stone-200 dark:border-white/10 rounded-full outline-none text-stone-900 dark:text-[#F0EDE6] placeholder:text-stone-400 dark:placeholder:text-[#505050]"
            />
            <button className="lg:hidden relative p-2 shrink-0" onClick={() => setMobileCart(true)}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -end-1 w-5 h-5 text-stone-900 dark:text-[#0C0C0C] text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accent }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </header>

          <div className="sm:hidden px-4 py-2 border-b border-stone-200 dark:border-white/10 bg-white dark:bg-[#0C0C0C]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search menu...')}
              className="w-full py-2 px-4 text-sm bg-stone-100 dark:bg-[#181818] border border-stone-200 dark:border-white/10 rounded-full outline-none text-stone-900 dark:text-[#F0EDE6] placeholder:text-stone-400 dark:placeholder:text-[#505050]"
            />
          </div>

          <div className="flex flex-1 min-h-0 items-stretch overflow-hidden">
            <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 min-w-0 min-h-[320px]">
              {activeView === 'about' ? (
                <AboutView
                  restaurant={restaurant}
                  themeColor={accent}
                  isRtl={isRtl}
                  onBack={() => setActiveView?.('menu')}
                />
              ) : (
                <>
                  {restaurant.coverImage && (
                    <div className="relative rounded-2xl overflow-hidden h-[180px] sm:h-[220px] mb-6">
                      <img src={restaurant.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 dark:from-[#0C0C0C] via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayItems.map((item, i) => (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-white dark:bg-[#181818] rounded-2xl overflow-hidden border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 transition-colors cursor-pointer group shadow-sm"
                        onClick={() => onItemClick(item)}
                      >
                        {item.image && (
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-bold text-stone-900 dark:text-[#F0EDE6]">{item.name}</h4>
                          <p className="text-xs text-stone-500 dark:text-[#888] mt-1 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold" style={{ color: accent }}>
                              {Number(item.price).toFixed(2)} {restaurant.currency}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onItemClick(item);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-stone-900 dark:text-[#0C0C0C]"
                              style={{ backgroundColor: accent }}
                            >
                              <Plus size={13} /> {t('Add to Cart')}
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>

                  {displayItems.length === 0 && (
                    <p className="text-center py-12 text-stone-500 dark:text-[#888]">{t('No items found.')}</p>
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
        themeColor={accent}
        onAboutClick={setActiveView ? openAbout : undefined}
        fullWidth
      />

      <AnimatePresence>
        {mobileCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileCart(false)}
            />
            <motion.div
              initial={{ x: isRtl ? -320 : 320 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? -320 : 320 }}
              className="fixed top-0 bottom-0 z-50 lg:hidden h-full"
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
