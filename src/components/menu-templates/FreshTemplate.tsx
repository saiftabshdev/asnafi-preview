import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Plus, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeLangToggle } from '../ThemeLangToggle';
import { MenuFooter } from './shared/MenuFooter';
import { MenuLogo } from './shared/MenuLogo';
import { AboutView } from './shared/AboutView';
import type { MenuTemplateProps } from './types';
import type { Item } from '../../types/restaurant';
import { CategoryIcon } from './shared/CategoryIcon';

export default function FreshTemplate({
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
  activeView = 'menu',
  setActiveView,
}: MenuTemplateProps) {
  const { t } = useTranslation();
  const [activeCat, setActiveCat] = useState<string>('all');
  const Arrow = isRtl ? ChevronLeft : ChevronRight;

  const displayItems = useMemo(() => {
    const items: Item[] = [];
    for (const cat of filteredCategories) {
      if (activeCat !== 'all' && cat.id !== activeCat) continue;
      items.push(...cat.items);
    }
    return items;
  }, [filteredCategories, activeCat]);

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div
      className="min-h-screen bg-[#fafafa] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors flex flex-col"
      style={{ ['--menu-accent' as string]: themeColor }}
    >
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-4">
          <ThemeLangToggle />
          <div className="flex-1 flex justify-center">
            <MenuLogo restaurant={restaurant} maxHeight={40} />
          </div>
          <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 w-56 lg:w-64">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search menu...')}
              className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 ms-2 w-full"
            />
          </div>
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -end-0.5 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ backgroundColor: themeColor }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 lg:px-6 py-6 flex gap-6">
        <aside className="hidden xl:block w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <button
              onClick={() => setActiveCat('all')}
              className={`w-full text-start px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeCat === 'all' ? 'text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              style={activeCat === 'all' ? { backgroundColor: themeColor } : undefined}
            >
              {t('menu.template.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`w-full text-start px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeCat === cat.id ? 'text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={activeCat === cat.id ? { backgroundColor: themeColor } : undefined}
              >
                <span className="inline-flex items-center gap-2">
                  <CategoryIcon name={cat.icon} className="w-4 h-4 shrink-0" />
                  {cat.name}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {activeView === 'about' ? (
            <AboutView
              restaurant={restaurant}
              themeColor={themeColor}
              isRtl={isRtl}
              onBack={() => setActiveView?.('menu')}
            />
          ) : (
            <>
          <div className="md:hidden">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search menu...')}
              className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <section className="relative rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden min-h-[200px] sm:min-h-[280px]">
            {restaurant.coverImage ? (
              <>
                <img
                  src={restaurant.coverImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
            )}
          </section>

          <div className="xl:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCat('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold ${
                activeCat === 'all' ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
              }`}
              style={activeCat === 'all' ? { backgroundColor: themeColor } : undefined}
            >
              {t('menu.template.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold ${
                  activeCat === cat.id ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                }`}
                style={activeCat === cat.id ? { backgroundColor: themeColor } : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 shrink-0" />
                  {cat.name}
                </span>
              </button>
            ))}
          </div>

          <section id="menu">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                {t('menu.template.featuredDishes')}
                <Leaf className="w-4 h-4 text-green-500" />
              </h2>
              {cartCount > 0 && (
                <button
                  onClick={onOpenCart}
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: themeColor }}
                >
                  {t('Cart')} ({cartTotal.toFixed(2)} {restaurant.currency})
                  <Arrow className="w-4 h-4" />
                </button>
              )}
            </div>

            {displayItems.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">{t('No items found.')}</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {displayItems.map((item, i) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                    onClick={() => onItemClick(item)}
                  >
                    {item.image && (
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-sm sm:text-base leading-snug">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-sm">
                        {Number(item.price).toFixed(2)} {restaurant.currency}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick(item);
                        }}
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
            </>
          )}
        </main>
      </div>

      <MenuFooter
        r={restaurant}
        themeColor={themeColor}
        onAboutClick={setActiveView ? () => setActiveView('about') : undefined}
        fullWidth
        className="pb-20 xl:pb-8"
      />
    </div>
  );
}
