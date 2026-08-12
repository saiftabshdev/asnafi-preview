import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ShoppingCart,
  Plus,
  Heart,
  Truck,
  Wine,
  CreditCard,
} from 'lucide-react';
import { ThemeLangToggle } from '../ThemeLangToggle';
import { MenuLogo } from './shared/MenuLogo';
import { AboutView } from './shared/AboutView';
import type { MenuTemplateProps } from './types';
import type { Item } from '../../types/restaurant';
import { getWhatsAppNumber } from '../../lib/restaurantProfile';
import { buildWhatsAppOrderMessage } from './shared/whatsapp';
import { CategoryIcon } from './shared/CategoryIcon';
import { MenuFooter } from './shared/MenuFooter';

export default function LuxuryTemplate({
  restaurant,
  categories,
  filteredCategories,
  themeColor,
  search,
  setSearch,
  onItemClick,
  cart,
  cartTotal,
  onOpenCart,
  ordersEnabled,
  activeView = 'menu',
  setActiveView,
  isRtl,
}: MenuTemplateProps) {
  const { t } = useTranslation();
  const [activeCat, setActiveCat] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const whatsappNumber = getWhatsAppNumber(restaurant);

  const allItems = useMemo(() => {
    const items: Item[] = [];
    for (const cat of filteredCategories) {
      if (activeCat !== 'all' && cat.id !== activeCat) continue;
      items.push(...cat.items);
    }
    return items;
  }, [filteredCategories, activeCat]);

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const sendWhatsApp = () => {
    if (!whatsappNumber || cart.length === 0) return;
    const msg = buildWhatsAppOrderMessage(cart, cartTotal, restaurant.currency);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#f5efe6] text-stone-950 transition-colors duration-500 dark:bg-[#040807] dark:text-white flex flex-col"
      style={{ ['--menu-accent' as string]: themeColor }}
    >
      <div className="pointer-events-none fixed inset-0 opacity-70 dark:opacity-100">
        <div className="absolute -top-40 start-1/2 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: `${themeColor}33` }} />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1240px] items-center justify-center px-4 py-6 sm:px-8">
        <div className="relative w-full">
          <div className="relative min-h-[840px] overflow-hidden rounded-[2rem] border border-amber-950/10 bg-white/65 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#050909]/90 lg:rounded-[2.2rem]">
            <div className="relative p-5 sm:p-8 lg:p-12">
              <header className="flex items-center justify-between gap-4 flex-wrap">
                <ThemeLangToggle />
                <div className="flex items-center gap-3 ms-auto">
                  <MenuLogo restaurant={restaurant} maxHeight={44} />
                  <button
                    onClick={onOpenCart}
                    className="relative grid size-10 place-items-center rounded-full border border-stone-200 bg-white/75 dark:border-white/10 dark:bg-white/5"
                  >
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span
                        className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: themeColor }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </header>

              {activeView === 'about' ? (
                <AboutView
                  restaurant={restaurant}
                  themeColor={themeColor}
                  isRtl={isRtl}
                  onBack={() => setActiveView?.('menu')}
                />
              ) : (
                <>
              <section className="relative mt-6 min-h-[280px] sm:min-h-[340px] rounded-[1.6rem] overflow-hidden">
                {restaurant.coverImage && (
                  <>
                    <img
                      src={restaurant.coverImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                )}
              </section>

              <section id="menu" className="relative mt-8">
                <div className="mb-5 flex flex-col gap-4 lg:hidden">
                  <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 p-2 dark:border-white/10 dark:bg-white/5">
                    <Search className="ms-3" size={18} style={{ color: themeColor }} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('Search menu...')}
                      className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="hidden lg:flex mb-4 relative max-w-xs">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('Search menu...')}
                    className="w-full ps-10 pe-4 py-2 rounded-full border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-sm"
                  />
                </div>

                <div className="flex overflow-x-auto rounded-2xl border border-stone-200 bg-white/70 p-1 shadow-sm dark:border-white/15 dark:bg-white/[.06] no-scrollbar">
                  <button
                    onClick={() => setActiveCat('all')}
                    className={`flex min-w-[100px] flex-1 items-center justify-center px-4 py-3 text-sm font-semibold ${
                      activeCat === 'all' ? 'rounded-xl text-white shadow-lg' : 'text-stone-700 dark:text-white/80'
                    }`}
                    style={activeCat === 'all' ? { background: `linear-gradient(to right, ${themeColor}, ${themeColor}cc)` } : undefined}
                  >
                    {t('menu.template.allCategories')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCat(cat.id)}
                      className={`flex min-w-[120px] flex-1 items-center justify-center px-4 py-3 text-sm font-semibold border-s border-stone-200 dark:border-white/10 ${
                        activeCat === cat.id ? 'rounded-xl text-white shadow-lg' : 'text-stone-700 dark:text-white/80'
                      }`}
                      style={activeCat === cat.id ? { background: `linear-gradient(to right, ${themeColor}, ${themeColor}cc)` } : undefined}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 shrink-0" />
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="my-8 flex items-center justify-center gap-5">
                  <span className="h-px w-16 opacity-50" style={{ backgroundColor: themeColor }} />
                  <h3 className="text-2xl font-black">{t('menu.template.featuredDishes')}</h3>
                  <span className="h-px w-16 opacity-50" style={{ backgroundColor: themeColor }} />
                </div>

                {allItems.length === 0 ? (
                  <div className="rounded-3xl border border-dashed p-10 text-center text-stone-600 dark:text-white/70">
                    {t('No items found.')}
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {allItems.map((item) => (
                      <article
                        key={item.id}
                        className="group overflow-hidden rounded-2xl border border-stone-200 bg-white/75 shadow-xl dark:border-white/15 dark:bg-white/[.055] cursor-pointer"
                        onClick={() => onItemClick(item)}
                      >
                        {item.image && (
                          <div className="relative h-36 overflow-hidden">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition duration-500" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFavorites((f) =>
                                  f.includes(item.id) ? f.filter((id) => id !== item.id) : [...f, item.id],
                                );
                              }}
                              className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-black/35 backdrop-blur-md"
                            >
                              <Heart size={18} fill={favorites.includes(item.id) ? themeColor : 'none'} style={{ color: themeColor }} />
                            </button>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-black">{item.name}</h4>
                            <p className="whitespace-nowrap font-black" style={{ color: themeColor }}>
                              {Number(item.price).toFixed(2)} {restaurant.currency}
                            </p>
                          </div>
                          <p className="mt-2 min-h-10 text-sm leading-6 text-stone-600 dark:text-white/65 line-clamp-2">
                            {item.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick(item);
                            }}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border py-2 text-sm font-bold transition hover:text-white"
                            style={{ borderColor: `${themeColor}73`, color: themeColor }}
                          >
                            <Plus size={16} /> {t('Add to Cart')}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <footer className="mt-8 grid gap-4 rounded-2xl border border-stone-200 bg-white/65 p-5 dark:border-white/15 dark:bg-white/[.055] md:grid-cols-3">
                {[
                  { icon: Truck, title: t('menu.template.quickDelivery'), sub: t('menu.template.quickDeliverySub') },
                  { icon: Wine, title: t('menu.template.quality'), sub: t('menu.template.qualitySub') },
                  { icon: CreditCard, title: t('menu.template.securePayment'), sub: t('menu.template.securePaymentSub') },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center justify-center gap-4 md:border-e border-stone-200 dark:border-white/10 last:border-0">
                    <Icon size={38} strokeWidth={1.4} style={{ color: themeColor }} />
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="text-sm text-stone-600 dark:text-white/60">{sub}</p>
                    </div>
                  </div>
                ))}
              </footer>
                </>
              )}
            </div>
          </div>
        </div>

        {cartCount > 0 && (
          <div
            className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between rounded-full p-4 text-white shadow-2xl lg:hidden"
            style={{ background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)` }}
          >
            <div className="font-black">
              <span>
                {cartCount} {t('menu.template.items')}
              </span>
              <p>
                {cartTotal.toFixed(2)} {restaurant.currency}
              </p>
            </div>
            <button onClick={ordersEnabled ? sendWhatsApp : onOpenCart} className="font-bold">
              {ordersEnabled ? t('Send Order via WhatsApp') : t('Cart')}
            </button>
          </div>
        )}
      </section>

      <MenuFooter
        r={restaurant}
        themeColor={themeColor}
        onAboutClick={setActiveView ? () => setActiveView('about') : undefined}
        fullWidth
        className="bg-[#f5efe6] dark:bg-[#040807] border-stone-200 dark:border-white/10"
      />
    </main>
  );
}
