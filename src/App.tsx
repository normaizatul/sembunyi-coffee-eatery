import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TableSelectorModal } from './components/TableSelectorModal';
import { CategoryFilter } from './components/CategoryFilter';
import { MenuCard } from './components/MenuCard';
import { DishModal } from './components/DishModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderStatusModal } from './components/OrderStatusModal';
import { SmartDineAIBot } from './components/SmartDineAIBot';
import { KitchenDisplayView } from './components/KitchenDisplayView';
import { WaiterFloorView } from './components/WaiterFloorView';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { StaffAuthModal } from './components/StaffAuthModal';
import { SembunyiLogo } from './components/SembunyiLogo';
import { PromoCarousel } from './components/PromoCarousel';
import { PaymentModal } from './components/PaymentModal';

import { MenuItem, CartItem, Order, TableInfo, CategoryType, LanguageType, OrderStatus, OrderFeedback, PaymentDetails } from './types';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from './data/initialMenu';
import {
  initializeFirestoreData,
  subscribeToMenu,
  subscribeToOrders,
  subscribeToTables,
  createOrderInFirestore,
  updateOrderStatusInFirestore,
  updateTableStatusInFirestore,
  updateMenuItemInFirestore,
  callWaiterInFirestore,
  submitOrderFeedbackInFirestore,
} from './lib/firestoreService';
import { QrCode, Sparkles, Utensils, HeartHandshake, CheckCircle2, ChevronRight, PhoneCall, Lock, ShieldCheck } from 'lucide-react';

// Helper function to play a pleasant notification chime sound using Web Audio API
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (e) {
    console.error('Audio chime play error:', e);
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<'customer' | 'kitchen' | 'waiter' | 'admin'>('customer');
  const [tableNumber, setTableNumber] = useState('04');
  const [language, setLanguage] = useState<LanguageType>('ms');

  // Staff Authentication State
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sembunyi_staff_auth') === 'true';
  });
  const [isStaffAuthModalOpen, setIsStaffAuthModalOpen] = useState(false);
  const [pendingStaffTargetView, setPendingStaffTargetView] = useState<'kitchen' | 'waiter' | 'admin'>('kitchen');

  // Data state synced with Firestore
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [tables, setTables] = useState<TableInfo[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Filtering state
  const [activeCategory, setActiveCategory] = useState<CategoryType>('semua');
  const [selectedStation, setSelectedStation] = useState<'all' | 'cashier_1' | 'cashier_2'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [halalOnly, setHalalOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);

  // Modals state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedDishModal, setSelectedDishModal] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderTracker, setActiveOrderTracker] = useState<Order | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [pickupAlertOrder, setPickupAlertOrder] = useState<Order | null>(null);

  // Staff mode auth handlers
  const handleOpenStaffLogin = (targetView: 'kitchen' | 'waiter' | 'admin' = 'kitchen') => {
    if (isStaffAuthenticated) {
      setActiveView(targetView);
    } else {
      setPendingStaffTargetView(targetView);
      setIsStaffAuthModalOpen(true);
    }
  };

  const handleStaffAuthSuccess = (targetView: 'kitchen' | 'waiter' | 'admin') => {
    setIsStaffAuthenticated(true);
    localStorage.setItem('sembunyi_staff_auth', 'true');
    setActiveView(targetView);
    setIsStaffAuthModalOpen(false);
  };

  const handleStaffLogout = () => {
    setIsStaffAuthenticated(false);
    localStorage.removeItem('sembunyi_staff_auth');
    setActiveView('customer');
  };

  const handleViewChange = (view: 'customer' | 'kitchen' | 'waiter' | 'admin') => {
    if (view === 'customer') {
      setActiveView('customer');
    } else {
      if (isStaffAuthenticated) {
        setActiveView(view);
      } else {
        handleOpenStaffLogin(view);
      }
    }
  };

  // Request browser notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Initialize Firestore collections and subscribe to real-time changes
  useEffect(() => {
    initializeFirestoreData();

    const unsubMenu = subscribeToMenu((updatedMenu) => {
      if (updatedMenu && updatedMenu.length > 0) setMenu(updatedMenu);
    });

    const unsubOrders = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders || []);
    });

    const unsubTables = subscribeToTables((updatedTables) => {
      if (updatedTables && updatedTables.length > 0) setTables(updatedTables);
    });

    return () => {
      unsubMenu();
      unsubOrders();
      unsubTables();
    };
  }, []);

  // Sync active order tracker & detect when food is READY ('sedia') for pickup notification!
  useEffect(() => {
    if (activeOrderTracker) {
      const updated = orders.find((o) => o.id === activeOrderTracker.id);
      if (updated) {
        // Trigger alert if status just became 'sedia'
        if (updated.status === 'sedia' && activeOrderTracker.status !== 'sedia') {
          playNotificationChime();
          setPickupAlertOrder(updated);

          // Web Push Notification if browser allows
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('🍲 HIDANGAN SEDIA UNTUK DIAMBIL!', {
                body: `Pesanan #${updated.id} bagi Meja ${updated.tableNumber} telah siap. Sila ambil/jemput makan!`,
                icon: '/assets/icon.png',
              });
            } catch (e) {
              console.error('Notification trigger error:', e);
            }
          }
        }
        setActiveOrderTracker(updated);
      }
    }
  }, [orders]);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId);
    } else {
      setCart((prev) =>
        prev.map((c) =>
          c.cartItemId === cartItemId
            ? { ...c, quantity: newQty, totalPrice: c.unitPriceWithAddons * newQty }
            : c
        )
      );
    }
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderSubmitted = async (newOrder: Order) => {
    try {
      const savedOrder = await createOrderInFirestore(newOrder);
      setActiveOrderTracker(savedOrder);
    } catch (err) {
      console.error('Error saving order to Firestore:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // 1. Instant Optimistic state update for lightning-fast UI response
    setOrders((prevOrders) =>
      prevOrders.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    // 2. Play alert chime when order is ready
    if (status === 'sedia') {
      playNotificationChime();
    }

    // 3. Persist to Firestore
    try {
      await updateOrderStatusInFirestore(orderId, status);
    } catch (err) {
      console.error('Error updating order status in Firestore:', err);
    }
  };

  const handleToggleMenuAvailability = async (itemId: string) => {
    const dish = menu.find((m) => m.id === itemId);
    if (!dish) return;
    const updated = { ...dish, isAvailable: !dish.isAvailable };
    try {
      await updateMenuItemInFirestore(updated);
    } catch (err) {
      console.error('Error updating menu in Firestore:', err);
    }
  };

  const handleCallWaiter = async (reason: string) => {
    try {
      await callWaiterInFirestore(tableNumber, reason);
    } catch (err) {
      console.error('Error calling waiter in Firestore:', err);
    }
  };

  const handleOrderFeedback = async (orderId: string, feedback: OrderFeedback) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, feedback } : o))
    );
    if (activeOrderTracker && activeOrderTracker.id === orderId) {
      setActiveOrderTracker((prev) => (prev ? { ...prev, feedback } : null));
    }
    try {
      await submitOrderFeedbackInFirestore(orderId, feedback);
    } catch (err) {
      console.error('Error submitting feedback in Firestore:', err);
    }
  };

  const handlePaymentSuccess = (updatedOrder: Order, paymentDetails: PaymentDetails) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? { ...o, isPaid: true, status: 'memasak', paymentDetails } : o))
    );
    if (activeOrderTracker && activeOrderTracker.id === updatedOrder.id) {
      setActiveOrderTracker((prev) => (prev ? { ...prev, isPaid: true, status: 'memasak', paymentDetails } : null));
    }
  };

  const handleResolveTableCall = async (targetTableNumber: string, nextStatus: TableInfo['status']) => {
    setTables((prev) =>
      prev.map((t) => (t.tableNumber === targetTableNumber ? { ...t, status: nextStatus } : t))
    );
    try {
      await updateTableStatusInFirestore(targetTableNumber, nextStatus);
    } catch (err) {
      console.error('Error updating table in Firestore:', err);
    }
  };

  // Menu filtering logic
  const safeMenu = Array.isArray(menu) ? menu : [];
  const filteredMenu = safeMenu.filter((item) => {
    if (!item || !item.isAvailable) return false;
    if (selectedStation === 'cashier_2' && item.cashierStation !== 'cashier_2') return false;
    if (selectedStation === 'cashier_1' && item.cashierStation === 'cashier_2') return false;
    if (activeCategory !== 'semua' && item.category !== activeCategory) return false;
    if (halalOnly && !item.isHalal) return false;
    if (spicyOnly && !item.isSpicy) return false;
    if (vegOnly && !item.isVegetarian) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName =
        (item.nameMs && item.nameMs.toLowerCase().includes(q)) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(q));
      const matchDesc =
        (item.descriptionMs && item.descriptionMs.toLowerCase().includes(q)) ||
        (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q));
      return matchName || matchDesc;
    }

    return true;
  });

  const safeCart = Array.isArray(cart) ? cart : [];
  const cartCount = safeCart.reduce((sum, c) => sum + (c?.quantity || 0), 0);
  const cartTotal = safeCart.reduce((sum, c) => sum + (c?.totalPrice || 0), 0);
  const safeOrdersList = Array.isArray(orders) ? orders : [];
  const activeTableOrder = safeOrdersList.find(
    (o) => o && o.tableNumber === tableNumber && o.status !== 'selesai'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={handleViewChange}
        tableNumber={tableNumber}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        language={language}
        setLanguage={setLanguage}
        isAiBotOpen={isAiBotOpen}
        setIsAiBotOpen={setIsAiBotOpen}
        isStaffAuthenticated={isStaffAuthenticated}
        onOpenStaffLogin={handleOpenStaffLogin}
        onStaffLogout={handleStaffLogout}
      />

      {/* Main Content Render based on Active View */}
      <main className="flex-1 pb-16">
        {/* If user navigates to staff view without auth, show staff security lock screen */}
        {activeView !== 'customer' && !isStaffAuthenticated ? (
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">
                {language === 'ms' ? 'Kawasan Terhad Kakitangan' : 'Staff Restricted Area'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ms'
                  ? 'Bahagian ini memerlukan kata laluan / PIN staf Kafe Sembunyi untuk paparan Dapur KDS, Pelayan dan Analitik.'
                  : 'This section requires Sembunyi Cafe staff password / PIN to access Kitchen KDS, Waiter and Analytics.'}
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => handleOpenStaffLogin(activeView)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'ms' ? 'Masukkan Kata Laluan Staf' : 'Enter Staff Password'}</span>
                </button>
                <button
                  onClick={() => setActiveView('customer')}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                >
                  {language === 'ms' ? 'Kembali ke Menu Pelanggan' : 'Back to Customer Menu'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeView === 'customer' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Real-time Pickup Notification Banner */}
                {(pickupAlertOrder || (activeTableOrder && activeTableOrder.status === 'sedia')) && (
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-slate-950 p-4 rounded-2xl shadow-2xl border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-4 animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-950 text-emerald-400 rounded-xl shadow">
                        <Utensils className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-950 flex items-center gap-2">
                          <span>🍲 HIDANGAN ANDA DAH READY!</span>
                          <span className="bg-slate-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full uppercase">
                            Meja {(pickupAlertOrder || activeTableOrder)?.tableNumber}
                          </span>
                        </h3>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">
                          Pesanan #{(pickupAlertOrder || activeTableOrder)?.id} telah siap dimasak. Sila ambil/jemput makan!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(pickupAlertOrder || activeTableOrder)?.customerPhone && (
                        <a
                          href={`https://wa.me/${(pickupAlertOrder || activeTableOrder)?.customerPhone?.replace(/[^0-9]/g, '').startsWith('60') ? (pickupAlertOrder || activeTableOrder)?.customerPhone?.replace(/[^0-9]/g, '') : '60' + (pickupAlertOrder || activeTableOrder)?.customerPhone?.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                            `Salam ${(pickupAlertOrder || activeTableOrder)?.customerName || 'Pelanggan'}! 🍲 Hidangan pesanan #${(pickupAlertOrder || activeTableOrder)?.id} di Meja ${(pickupAlertOrder || activeTableOrder)?.tableNumber} telah SEDIA UNTUK DIAMBIL / DISAJIKAN!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950 hover:bg-slate-900 text-emerald-400 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                        >
                          <span>💬 Notifikasi WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => setActiveOrderTracker(pickupAlertOrder || activeTableOrder)}
                        className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow"
                      >
                        Lihat Tracker
                      </button>
                    </div>
                  </div>
                )}

                {/* Sembunyi Cafe Welcome Hero Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/30 p-6 md:p-8 shadow-2xl">
                  <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-5">
                      {/* Big Sembunyi Logo Badge */}
                      <div className="p-2 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 ring-4 ring-amber-400/30 shrink-0">
                        <SembunyiLogo className="w-16 h-16 sm:w-20 sm:h-20 text-slate-950" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black mb-2 shadow-inner">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>sembunyi. coffee & eatery</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                          Selamat Datang • Meja {tableNumber}
                        </h2>
                        <p className="text-amber-200/80 text-xs sm:text-sm mt-1 font-medium italic">
                          "Good Food ✦ Good Coffee ✦ Good Vibes ♡ Made with love"
                        </p>
                        <p className="text-slate-400 text-xs mt-2 max-w-xl hidden sm:block">
                          Pilih hidangan Barat, pasta lazat, rice set, croffle & kopi segar. Sesuaikan kepedasan, tahap gula & pilihan suhu (panas/sejuk) mengikut citarasa anda!
                        </p>
                      </div>
                    </div>

                    {/* Active Order Tracker Pill Button */}
                    {activeTableOrder ? (
                      <button
                        onClick={() => setActiveOrderTracker(activeTableOrder)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center gap-3 text-xs shrink-0 group"
                      >
                        <div className="w-3 h-3 rounded-full bg-slate-950 animate-ping" />
                        <div className="text-left">
                          <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-80">Pesanan Aktif In-Progress</p>
                          <p className="text-sm font-black">Pesanan #{activeTableOrder.id} ({activeTableOrder.status.toUpperCase()})</p>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTableModalOpen(true)}
                        className="bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-bold px-4 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2.5 text-xs shrink-0"
                      >
                        <QrCode className="w-5 h-5 text-amber-400" />
                        <span>Tukar Meja / Imbas Meja {tableNumber}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Promotional Food Slider / Ad Banner Carousel */}
                <PromoCarousel
                  menu={safeMenu}
                  language={language}
                  onSelectItem={(dish) => setSelectedDishModal(dish)}
                />

                {/* Menu Filters & Search */}
                <CategoryFilter
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  halalOnly={halalOnly}
                  onToggleHalal={() => setHalalOnly(!halalOnly)}
                  spicyOnly={spicyOnly}
                  onToggleSpicy={() => setSpicyOnly(!spicyOnly)}
                  vegOnly={vegOnly}
                  onToggleVeg={() => setVegOnly(!vegOnly)}
                  selectedStation={selectedStation}
                  onSelectStation={setSelectedStation}
                  language={language}
                />

                {/* Menu Cards Grid */}
                {filteredMenu.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto">
                    <Utensils className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">Hidangan Tidak Dijumpai</h3>
                    <p className="text-xs">Sila cuba kata kunci carian lain atau padamkan tapisan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredMenu.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        onSelect={(m) => setSelectedDishModal(m)}
                        language={language}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 2: Kitchen KDS */}
            {activeView === 'kitchen' && (
              <KitchenDisplayView
                orders={orders}
                onUpdateStatus={handleUpdateOrderStatus}
                language={language}
              />
            )}

            {/* View 3: Waiter & Floor Staff */}
            {activeView === 'waiter' && (
              <WaiterFloorView
                tables={tables}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onResolveTableCall={handleResolveTableCall}
                language={language}
              />
            )}

            {/* View 4: Admin Analytics & QR Generator */}
            {activeView === 'admin' && (
              <AdminAnalyticsView
                menu={menu}
                orders={orders}
                tables={tables}
                onToggleAvailability={handleToggleMenuAvailability}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* Floating SmartDine AI Assistant Drawer */}
      <SmartDineAIBot
        isOpen={isAiBotOpen}
        onClose={() => setIsAiBotOpen(false)}
        menu={menu}
        onSelectDish={(d) => setSelectedDishModal(d)}
        language={language}
      />

      {/* Modals & Drawers */}
      <StaffAuthModal
        isOpen={isStaffAuthModalOpen}
        onClose={() => setIsStaffAuthModalOpen(false)}
        onSuccess={handleStaffAuthSuccess}
        targetView={pendingStaffTargetView}
        language={language}
      />
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        currentTable={tableNumber}
        onSelectTable={(num) => setTableNumber(num)}
        tables={tables}
        language={language}
      />

      <DishModal
        item={selectedDishModal}
        onClose={() => setSelectedDishModal(null)}
        onAddToCart={handleAddToCart}
        language={language}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        tableNumber={tableNumber}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderSubmitted={handleOrderSubmitted}
        onOpenPayment={(ord) => setActivePaymentOrder(ord)}
        language={language}
      />

      <OrderStatusModal
        order={activeOrderTracker}
        onClose={() => setActiveOrderTracker(null)}
        onCallWaiter={handleCallWaiter}
        onFeedbackSubmit={handleOrderFeedback}
        onOpenPayment={(ord) => setActivePaymentOrder(ord)}
        language={language}
      />

      <PaymentModal
        isOpen={!!activePaymentOrder}
        order={activePaymentOrder}
        onClose={() => setActivePaymentOrder(null)}
        onPaymentSuccess={handlePaymentSuccess}
        language={language}
      />

      {/* Footer Branding */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SmartDinePlus Kafe Sembunyi — Project FYP Cik Nourul Ain. Hak Cipta Terpelihara.</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            {isStaffAuthenticated ? (
              <button
                onClick={handleStaffLogout}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-amber-500/30"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Mod Staf Aktif (Klik untuk Kunci/Keluar)</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenStaffLogin('kitchen')}
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1 font-medium transition-colors"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Akses Portal Staf</span>
              </button>
            )}
            <span>•</span>
            <span>QR Protocol v3.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
