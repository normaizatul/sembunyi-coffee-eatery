import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Sparkles, 
  Download, 
  Star, 
  MessageSquare,
  Heart,
  CreditCard
} from 'lucide-react';
import { MenuItem, Order, TableInfo, LanguageType } from '../types';
import { SembunyiLogo } from './SembunyiLogo';
import { SafeImage } from './SafeImage';

interface AdminAnalyticsViewProps {
  menu: MenuItem[];
  orders: Order[];
  tables: TableInfo[];
  onToggleAvailability: (itemId: string) => void;
  language: LanguageType;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  menu,
  orders,
  tables,
  onToggleAvailability,
  language,
}) => {
  const isMs = language === 'ms';
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'qr'>('analytics');
  const [selectedQrTable, setSelectedQrTable] = useState('01');

  // Sales Calculations
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeMenu = Array.isArray(menu) ? menu : [];
  const safeTables = Array.isArray(tables) ? tables : [];

  const totalRevenue = safeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = safeOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Feedback & Rating Calculations
  const feedbackOrders = safeOrders.filter((o) => o.feedback && o.feedback.rating > 0);
  const avgCustomerRating = feedbackOrders.length > 0
    ? feedbackOrders.reduce((sum, o) => sum + (o.feedback?.rating || 0), 0) / feedbackOrders.length
    : 5.0;

  // Best selling dish counts
  const dishSalesMap: Record<string, number> = {};
  safeOrders.forEach((o) => {
    (o?.items || []).forEach((item) => {
      const name = item.menuItem
        ? (isMs ? item.menuItem.nameMs : item.menuItem.nameEn)
        : 'Hidangan';
      dishSalesMap[name] = (dishSalesMap[name] || 0) + (item.quantity || 1);
    });
  });

  const sortedPopularDishes = Object.entries(dishSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isMs ? 'Pengurusan Restoran & Analitik SmartDinePlus' : 'SmartDinePlus Admin & Analytics'}
            </h2>
            <p className="text-xs text-slate-400">Panel Kawalan FYP Cik Nourul Ain • Penjana QR & Pengurusan Stok Menu</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Analitik Jualan
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'menu' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🍲 Pengurusan Menu
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'qr' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🖨️ Penjana QR Meja
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Jumlah Hasil Jualan</span>
                <p className="text-2xl font-black text-emerald-400">RM {totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Jumlah Pesanan QR</span>
                <p className="text-2xl font-black text-white">{totalOrders} Pesanan</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Purata Setiap Pesanan</span>
                <p className="text-2xl font-black text-amber-400">RM {avgOrderValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Star className="w-8 h-8 fill-amber-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Penilaian Pelanggan</span>
                <div className="flex items-center gap-1.5">
                  <p className="text-2xl font-black text-amber-300">{avgCustomerRating.toFixed(1)}</p>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0 ({feedbackOrders.length} Ulasan)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Dishes Rankings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Menu Paling Laris & Popular Hari Ini</span>
              </h3>

              {sortedPopularDishes.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada data jualan pesanan.</p>
              ) : (
                <div className="space-y-3">
                  {sortedPopularDishes.map(([dishName, count], idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="text-sm font-bold text-white">{dishName}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {count} Terjual
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Reviews & Feedback Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Maklum Balas & Ulasan Terkini Pelanggan</span>
              </h3>

              {feedbackOrders.length === 0 ? (
                <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    {isMs
                      ? 'Belum ada ulasan yang dihantar oleh pelanggan hari ini.'
                      : 'No customer reviews submitted yet today.'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isMs
                      ? 'Pelanggan boleh memberi ulasan & bintang selepas pesanan selesai.'
                      : 'Customers can leave star ratings and reviews once their order is completed.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {feedbackOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{ord.customerName || 'Tetamu'}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                            Meja {ord.tableNumber}
                          </span>
                        </div>
                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (ord.feedback?.rating || 5)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Quick Tags */}
                      {ord.feedback?.quickTags && ord.feedback.quickTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ord.feedback.quickTags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Review Text */}
                      {ord.feedback?.review && (
                        <p className="text-xs text-slate-300 italic bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          "{ord.feedback.review}"
                        </p>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                        <span>Pesanan #{ord.id}</span>
                        <span>
                          {ord.feedback?.submittedAt
                            ? new Date(ord.feedback.submittedAt).toLocaleTimeString('ms-MY', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment & Cashier Collection Breakdown Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
              <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>Kutipan Bayaran di Kaunter Juruwang (Pecahan Kaunter 1 & 2)</span>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                  Bayaran Kaunter (Tunai / Kad / QR)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">Total Lunas</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Lunas</span>
                  </div>
                  <p className="text-xl font-black text-emerald-400">
                    RM {safeOrders.filter((o) => o.isPaid).reduce((s, o) => s + (o.totalAmount || 0), 0).toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {safeOrders.filter((o) => o.isPaid).length} Pesanan Selesai Bayar
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400">Menunggu Bayaran</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Belum Bayar</span>
                  </div>
                  <p className="text-xl font-black text-amber-400">
                    RM {safeOrders.filter((o) => !o.isPaid && o.status !== 'dibatalkan').reduce((s, o) => s + (o.totalAmount || 0), 0).toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {safeOrders.filter((o) => !o.isPaid && o.status !== 'dibatalkan').length} Pesanan Belum Bayar
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">🍔 Kaunter 2 (Burgers)</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">Station 2</span>
                  </div>
                  <p className="text-xl font-black text-amber-400">
                    RM {safeOrders.reduce((total, o) => {
                      const c2Sub = (o.items || [])
                        .filter((i) => i.menuItem?.cashierStation === 'cashier_2')
                        .reduce((sum, i) => sum + (i.totalPrice || 0), 0);
                      return total + c2Sub;
                    }, 0).toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Sembunyi Burgers & Grill
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">☕ Kaunter 1 (Kafe)</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-black">Station 1</span>
                  </div>
                  <p className="text-xl font-black text-slate-200">
                    RM {safeOrders.reduce((total, o) => {
                      const c1Sub = (o.items || [])
                        .filter((i) => i.menuItem?.cashierStation !== 'cashier_2')
                        .reduce((sum, i) => sum + (i.totalPrice || 0), 0);
                      return total + c1Sub;
                    }, 0).toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Kafe Sembunyi Utama
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Menu Management & Availability Toggle */}
      {activeTab === 'menu' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-white">Senarai & Stok Menu SmartDinePlus</h3>
              <p className="text-xs text-slate-400">Togol ketersediaan hidangan secara real-time untuk paparan menu pelanggan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeMenu.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.nameMs}
                    category={item.category}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {item.cashierStation === 'cashier_2' ? (
                        <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                          Kaunter 2
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-300 text-[9px] font-medium px-1.5 py-0.2 rounded">
                          Kaunter 1
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-white">{isMs ? item.nameMs : item.nameEn}</h4>
                    </div>
                    <p className="text-xs font-black text-emerald-400">RM {item.price.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleAvailability(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    item.isAvailable
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ADA STOK</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>HABIS STOK</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Table QR Code Generator */}
      {activeTab === 'qr' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Penjana Kod QR Meja Restoran</h3>
              <p className="text-xs text-slate-400">
                Hasilkan pelekat Kod QR rasmi SmartDinePlus untuk ditampal pada setiap meja pelanggan
              </p>
            </div>
            <button
              onClick={handlePrintQR}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Pelekat QR</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Table Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-2">Pilih Meja</label>
              <div className="grid grid-cols-3 gap-2">
                {safeTables.map((t) => (
                  <button
                    key={t.tableNumber}
                    onClick={() => setSelectedQrTable(t.tableNumber)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      selectedQrTable === t.tableNumber
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    Meja {t.tableNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Printable Sticker Banner Preview */}
            <div className="md:col-span-2 flex justify-center">
              <div className="bg-white text-slate-950 rounded-2xl p-8 border-4 border-slate-950 shadow-2xl max-w-sm w-full text-center space-y-4 print:shadow-none print:border-2">
                <div className="border-b-2 border-slate-950 pb-3 flex flex-col items-center">
                  <SembunyiLogo className="w-14 h-14 text-slate-950 mb-1" />
                  <h4 className="text-lg font-black tracking-tight">sembunyi.</h4>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">coffee & eatery • QR Order</p>
                </div>

                {/* Simulated QR Pattern */}
                <div className="p-4 bg-slate-950 rounded-2xl inline-block text-white">
                  <QrCode className="w-36 h-36 mx-auto text-amber-400" />
                </div>

                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-3 rounded-xl font-black shadow">
                  <p className="text-2xl tracking-wider">MEJA {selectedQrTable}</p>
                  <p className="text-[10px] uppercase font-bold">Imbas Untuk Pesan & Bayar Hidangan</p>
                </div>

                <p className="text-[9px] text-slate-500 font-semibold italic">
                  "Good Food ✦ Good Coffee ✦ Good Vibes ♡ Made with love"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
