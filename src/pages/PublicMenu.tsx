import React, { useState, useMemo, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicMenu } from '../hooks/useApi';
import { ApiError } from '../lib/api/client';
import { getWhatsAppNumber } from '../lib/restaurantProfile';
import type { Item } from '../types/restaurant';
import { getMenuTemplateComponent } from '../components/menu-templates';
import { ItemExtrasModal } from '../components/menu-templates/shared/ItemExtrasModal';
import { CartOverlay } from '../components/menu-templates/shared/CartOverlay';
import type { CartLine } from '../components/menu-templates/types';

export default function PublicMenu() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { slug } = useParams();
  const { data, isLoading, isError, error } = usePublicMenu(slug, i18n.language);

  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<'menu' | 'about'>('menu');
  const [quantity, setQuantity] = useState(1);
  const [extrasState, setExtrasState] = useState<Record<string, { selected: boolean; qty: number }>>({});

  React.useEffect(() => {
    if (data?.categories[0]?.id) {
      setActiveCategory(data.categories[0].id);
    }
  }, [data]);

  React.useEffect(() => {
    if (selectedItem) {
      setQuantity(1);
      const initial: Record<string, { selected: boolean; qty: number }> = {};
      selectedItem.extras?.forEach((ex) => {
        initial[ex.name] = { selected: false, qty: 1 };
      });
      setExtrasState(initial);
    }
  }, [selectedItem]);

  const currentItemTotal = useMemo(() => {
    if (!selectedItem) return 0;
    let sum = Number(selectedItem.price);
    selectedItem.extras?.forEach((ex) => {
      if (extrasState[ex.name]?.selected) {
        sum += Number(ex.price) * extrasState[ex.name].qty;
      }
    });
    return sum * quantity;
  }, [selectedItem, extrasState, quantity]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <p className="text-gray-500">Loading menu...</p>
      </div>
    );
  }

  if (isError || !data?.info) {
    const isNotFound = error instanceof ApiError && error.status === 404;
    const isMenuDisabled =
      error instanceof ApiError &&
      error.status === 403 &&
      (error.data as { code?: string })?.code === 'MENU_DISABLED';
    const isOffline = error instanceof TypeError || (error instanceof ApiError && error.status >= 500);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 font-sans px-4">
        <div className="text-center max-w-md">
          {isMenuDisabled ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('Menu unavailable')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{t('Menu disabled message')}</p>
            </>
          ) : isNotFound ? (
            <>
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{t('Menu Not Found')}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('Service unavailable')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isOffline ? t('Backend unavailable message') : t('Could not load menu')}
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/samples" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              {t('View sample menus')}
            </Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800">
              {t('Back to home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const restaurant = data.info;
  const menuCategories = data.categories;
  const themeColor = restaurant.theme.primaryColor;
  const templateId = restaurant.theme.template;
  const whatsappNumber = getWhatsAppNumber(restaurant);
  const ordersEnabled = !!whatsappNumber;

  const filteredCategories = menuCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const toggleExtra = (name: string) => {
    setExtrasState((prev) => ({
      ...prev,
      [name]: { ...prev[name], selected: !prev[name].selected },
    }));
  };

  const updateExtraQty = (name: string, delta: number) => {
    setExtrasState((prev) => {
      const current = prev[name].qty;
      const next = Math.max(1, current + delta);
      return { ...prev, [name]: { ...prev[name], qty: next } };
    });
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const selectedExtrasList =
      selectedItem.extras
        ?.filter((ex) => extrasState[ex.name]?.selected)
        .map((ex) => ({
          name: ex.name,
          price: ex.price,
          qty: extrasState[ex.name].qty,
        })) || [];

    setCart([
      ...cart,
      {
        id: Date.now().toString(),
        item: selectedItem,
        quantity,
        extras: selectedExtrasList,
        totalPrice: currentItemTotal,
      },
    ]);
    setSelectedItem(null);
  };

  const handleRemoveFromCart = (lineId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== lineId));
  };

  const handleUpdateCartQty = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== lineId) return c;
          const newQty = c.quantity + delta;
          if (newQty <= 0) return null;
          const unitPrice = c.totalPrice / c.quantity;
          return { ...c, quantity: newQty, totalPrice: unitPrice * newQty };
        })
        .filter(Boolean) as CartLine[],
    );
  };

  const cartTotal = cart.reduce((acc, c) => acc + c.totalPrice, 0);
  const TemplateComponent = getMenuTemplateComponent(templateId);

  const inlineCartTemplates = ['bistro', 'vibrant', 'luxury', 'fresh', 'nakhil'];
  const useSharedFloatingCart = !inlineCartTemplates.includes(templateId);

  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
            <p className="text-gray-500">{t('Loading...')}</p>
          </div>
        }
      >
        <TemplateComponent
          restaurant={restaurant}
          categories={menuCategories}
          filteredCategories={filteredCategories}
          themeColor={themeColor}
          search={search}
          setSearch={setSearch}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onItemClick={setSelectedItem}
          isRtl={isRtl}
          cart={cart}
          cartTotal={cartTotal}
          onOpenCart={() => setIsCartOpen(true)}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateCartQty={handleUpdateCartQty}
          activeView={activeView}
          setActiveView={setActiveView}
          ordersEnabled={ordersEnabled}
        />
      </Suspense>

      {selectedItem && (
        <ItemExtrasModal
          item={selectedItem}
          restaurant={restaurant}
          themeColor={themeColor}
          ordersEnabled={ordersEnabled}
          quantity={quantity}
          setQuantity={setQuantity}
          extrasState={extrasState}
          toggleExtra={toggleExtra}
          updateExtraQty={updateExtraQty}
          currentItemTotal={currentItemTotal}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartOverlay
        cart={cart}
        cartTotal={cartTotal}
        restaurant={restaurant}
        themeColor={themeColor}
        whatsappNumber={whatsappNumber}
        ordersEnabled={ordersEnabled}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpen={() => setIsCartOpen(true)}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateCartQty={handleUpdateCartQty}
        showFloatingButton={useSharedFloatingCart && !selectedItem}
      />
    </>
  );
}
