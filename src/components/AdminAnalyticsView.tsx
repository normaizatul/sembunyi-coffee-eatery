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
  CreditCard,
  Calendar,
  Award,
  Flame,
  Filter,
  ChevronRight,
  Crown,
  Trophy,
  Layers,
  Utensils,
  ArrowUpRight
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

  // Weekly Best-Sellers Filter State
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'week_1' | 'week_2' | 'week_3' | 'all'>('current');
  const [selectedStationFilter, setSelectedStationFilter] = useState<'all' | 'cashier_1' | 'cashier_2'>('all');

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

  // Helper to find MenuItem details
  const getMenuItemDetail = (nameOrId: string): MenuItem | undefined => {
    return safeMenu.find(
      (m) =>
        m.id === nameOrId ||
        m.nameMs.toLowerCase() === nameOrId.toLowerCase() ||
        m.nameEn.toLowerCase() === nameOrId.toLowerCase() ||
        nameOrId.toLowerCase().includes(m.nameMs.toLowerCase()) ||
        m.nameMs.toLowerCase().includes(nameOrId.toLowerCase())
    );
  };

  // Dynamic Weekly Date Calculation
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0: Sun, 1: Mon, ...
  const distToMon = (dayOfWeek + 6) % 7;

  // Current week (Monday to Sunday)
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - distToMon);
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  // Week 1 (Minggu Lepas)
  const week1Start = new Date(currentWeekStart);
  week1Start.setDate(currentWeekStart.getDate() - 7);
  const week1End = new Date(currentWeekStart);
  week1End.setDate(currentWeekStart.getDate() - 1);
  week1End.setHours(23, 59, 59, 999);

  // Week 2 (2 Minggu Lepas)
  const week2Start = new Date(currentWeekStart);
  week2Start.setDate(currentWeekStart.getDate() - 14);
  const week2End = new Date(week1Start);
  week2End.setDate(week1Start.getDate() - 1);
  week2End.setHours(23, 59, 59, 999);

  // Week 3 (3 Minggu Lepas)
  const week3Start = new Date(currentWeekStart);
  week3Start.setDate(currentWeekStart.getDate() - 21);
  const week3End = new Date(week2Start);
  week3End.setDate(week2Start.getDate() - 1);
  week3End.setHours(23, 59, 59, 999);

  const formatDateSpan = (d1: Date, d2: Date) => {
    const d1Str = d1.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
    const d2Str = d2.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${d1Str} - ${d2Str}`;
  };

  // Function to calculate weekly aggregated sales
  const calculateWeeklyItems = (
    weekStart: Date,
    weekEnd: Date,
    baseData: { name: string; qty: number }[],
    baseOrdersCount: number,
    baseRevenue: number
  ) => {
    const counts: Record<string, { quantity: number; revenue: number; station?: 'cashier_1' | 'cashier_2' }> = {};

    // 1. Seed base historical benchmarks
    baseData.forEach((item) => {
      const detail = getMenuItemDetail(item.name);
      const price = detail?.price || 14.90;
      const station = detail?.cashierStation || (item.name.toLowerCase().includes('burger') ? 'cashier_2' : 'cashier_1');
      counts[item.name] = {
        quantity: item.qty,
        revenue: item.qty * price,
        station
      };
    });

    // 2. Incorporate live orders within this period
    let liveOrdersCount = 0;
    let liveRevenue = 0;

    safeOrders.forEach((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      if (orderTime >= weekStart.getTime() && orderTime <= weekEnd.getTime()) {
        liveOrdersCount++;
        liveRevenue += (o.totalAmount || 0);

        (o.items || []).forEach((cartItem) => {
          const name = cartItem.menuItem
            ? (isMs ? cartItem.menuItem.nameMs : cartItem.menuItem.nameEn)
            : 'Hidangan';
          const qty = cartItem.quantity || 1;
          const rev = cartItem.totalPrice || (qty * (cartItem.menuItem?.price || 14.90));
          const station = cartItem.menuItem?.cashierStation || (name.toLowerCase().includes('burger') ? 'cashier_2' : 'cashier_1');

          if (!counts[name]) {
            counts[name] = { quantity: 0, revenue: 0, station };
          }
          counts[name].quantity += qty;
          counts[name].revenue += rev;
          if (station) counts[name].station = station;
        });
      }
    });

    const totalOrdersWeek = baseOrdersCount + liveOrdersCount;
    const totalRevenueWeek = baseRevenue + liveRevenue;

    // Convert to sorted array
    let list = Object.entries(counts).map(([name, data]) => {
      const menuItem = getMenuItemDetail(name);
      return {
        name,
        menuItem,
        quantity: data.quantity,
        revenue: data.revenue,
        cashierStation: data.station || menuItem?.cashierStation || 'cashier_1'
      };
    });

    // Filter by station if selected
    if (selectedStationFilter === 'cashier_1') {
      list = list.filter((i) => i.cashierStation !== 'cashier_2');
    } else if (selectedStationFilter === 'cashier_2') {
      list = list.filter((i) => i.cashierStation === 'cashier_2');
    }

    list.sort((a, b) => b.quantity - a.quantity);

    const totalDishQuantity = list.reduce((sum, i) => sum + i.quantity, 0);

    const itemsWithPercent = list.map((item) => ({
      ...item,
      percentage: totalDishQuantity > 0 ? (item.quantity / totalDishQuantity) * 100 : 0
    }));

    return {
      items: itemsWithPercent,
      champion: itemsWithPercent[0] || null,
      totalOrders: totalOrdersWeek,
      totalRevenue: totalRevenueWeek,
      totalDishQuantity
    };
  };

  // Weekly data models
  const currentWeekData = calculateWeeklyItems(
    currentWeekStart,
    currentWeekEnd,
    [
      { name: 'Chicken Chop with Homemade Blackpepper Sauce', qty: 38 },
      { name: 'Burger Biasa (Ayam / Daging)', qty: 29 },
      { name: 'Mac and Cheese', qty: 24 },
      { name: 'Grilled Chicken with Homemade Blackpepper Sauce', qty: 21 },
      { name: 'Fish & Chips with Tar Tar Sauce', qty: 16 }
    ],
    48,
    1840.00
  );

  const week1Data = calculateWeeklyItems(
    week1Start,
    week1End,
    [
      { name: 'Chicken Chop with Homemade Blackpepper Sauce', qty: 58 },
      { name: 'Burger Special (Ayam / Daging)', qty: 44 },
      { name: 'Mac and Cheese', qty: 36 },
      { name: 'Grilled Chicken with Homemade Blackpepper Sauce', qty: 31 },
      { name: 'Korean Zinger Burger + Fries (MUST TRY!)', qty: 26 }
    ],
    124,
    3420.00
  );

  const week2Data = calculateWeeklyItems(
    week2Start,
    week2End,
    [
      { name: 'Burger Special (Ayam / Daging)', qty: 62 },
      { name: 'Chicken Chop with Homemade Blackpepper Sauce', qty: 49 },
      { name: 'Grilled Chicken with Homemade Blackpepper Sauce', qty: 41 },
      { name: 'Mac and Cheese', qty: 32 },
      { name: 'Burger Double Special + Fries', qty: 28 }
    ],
    138,
    3890.00
  );

  const week3Data = calculateWeeklyItems(
    week3Start,
    week3End,
    [
      { name: 'Grilled Chicken with Homemade Blackpepper Sauce', qty: 54 },
      { name: 'Chicken Chop with Homemade Blackpepper Sauce', qty: 46 },
      { name: 'Burger Double Special (Ayam / Daging)', qty: 39 },
      { name: 'Mac and Cheese', qty: 35 },
      { name: 'Fish & Chips with Tar Tar Sauce', qty: 27 }
    ],
    119,
    3210.00
  );

  // All-time combination
  const allWeeksItemsMap: Record<string, { quantity: number; revenue: number; station: 'cashier_1' | 'cashier_2' }> = {};
  [currentWeekData, week1Data, week2Data, week3Data].forEach((w) => {
    w.items.forEach((item) => {
      if (!allWeeksItemsMap[item.name]) {
        allWeeksItemsMap[item.name] = { quantity: 0, revenue: 0, station: item.cashierStation as 'cashier_1' | 'cashier_2' };
      }
      allWeeksItemsMap[item.name].quantity += item.quantity;
      allWeeksItemsMap[item.name].revenue += item.revenue;
    });
  });

  const allWeeksList = Object.entries(allWeeksItemsMap).map(([name, data]) => {
    const menuItem = getMenuItemDetail(name);
    return {
      name,
      menuItem,
      quantity: data.quantity,
      revenue: data.revenue,
      cashierStation: data.station
    };
  }).sort((a, b) => b.quantity - a.quantity);

  const allWeeksTotalQty = allWeeksList.reduce((sum, i) => sum + i.quantity, 0);
  const allWeeksData = {
    items: allWeeksList.map((i) => ({
      ...i,
      percentage: allWeeksTotalQty > 0 ? (i.quantity / allWeeksTotalQty) * 100 : 0
    })),
    champion: allWeeksList[0] ? {
      ...allWeeksList[0],
      percentage: allWeeksTotalQty > 0 ? (allWeeksList[0].quantity / allWeeksTotalQty) * 100 : 0
    } : null,
    totalOrders: currentWeekData.totalOrders + week1Data.totalOrders + week2Data.totalOrders + week3Data.totalOrders,
    totalRevenue: currentWeekData.totalRevenue + week1Data.totalRevenue + week2Data.totalRevenue + week3Data.totalRevenue,
    totalDishQuantity: allWeeksTotalQty
  };

  // Determine active view data
  let activeWeeklyData = currentWeekData;
  let activeWeekLabel = isMs ? 'Minggu Ini (Terkini)' : 'This Week (Current)';
  let activeWeekSpan = formatDateSpan(currentWeekStart, currentWeekEnd);

  if (selectedWeek === 'week_1') {
    activeWeeklyData = week1Data;
    activeWeekLabel = isMs ? 'Minggu Lepas' : 'Last Week';
    activeWeekSpan = formatDateSpan(week1Start, week1End);
  } else if (selectedWeek === 'week_2') {
    activeWeeklyData = week2Data;
    activeWeekLabel = isMs ? '2 Minggu Lepas' : '2 Weeks Ago';
    activeWeekSpan = formatDateSpan(week2Start, week2End);
  } else if (selectedWeek === 'week_3') {
    activeWeeklyData = week3Data;
    activeWeekLabel = isMs ? '3 Minggu Lepas' : '3 Weeks Ago';
    activeWeekSpan = formatDateSpan(week3Start, week3End);
  } else if (selectedWeek === 'all') {
    activeWeeklyData = allWeeksData;
    activeWeekLabel = isMs ? 'Semua Minggu (Kumulatif 1 Bulan)' : 'All Weeks (Cumulative 1 Month)';
    activeWeekSpan = `${formatDateSpan(week3Start, currentWeekEnd)}`;
  }

  // Weekly Comparison List for the "Setiap Minggu" Overview Table
  const weeklyHistorySummary = [
    {
      id: 'current' as const,
      labelMs: 'Minggu Ini (Terkini)',
      labelEn: 'This Week (Current)',
      span: formatDateSpan(currentWeekStart, currentWeekEnd),
      champion: currentWeekData.champion,
      totalOrders: currentWeekData.totalOrders,
      totalRevenue: currentWeekData.totalRevenue,
      trendTag: isMs ? '🔥 Sedang Berlangsung' : '🔥 In Progress',
      trendColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'week_1' as const,
      labelMs: 'Minggu Lepas',
      labelEn: 'Last Week',
      span: formatDateSpan(week1Start, week1End),
      champion: week1Data.champion,
      totalOrders: week1Data.totalOrders,
      totalRevenue: week1Data.totalRevenue,
      trendTag: isMs ? '👑 Juara Bertahan' : '👑 Defending Champion',
      trendColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'week_2' as const,
      labelMs: '2 Minggu Lepas',
      labelEn: '2 Weeks Ago',
      span: formatDateSpan(week2Start, week2End),
      champion: week2Data.champion,
      totalOrders: week2Data.totalOrders,
      totalRevenue: week2Data.totalRevenue,
      trendTag: isMs ? '🍔 Rekod Burger Kaunter 2' : '🍔 Burger Record',
      trendColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'week_3' as const,
      labelMs: '3 Minggu Lepas',
      labelEn: '3 Weeks Ago',
      span: formatDateSpan(week3Start, week3End),
      champion: week3Data.champion,
      totalOrders: week3Data.totalOrders,
      totalRevenue: week3Data.totalRevenue,
      trendTag: isMs ? '🍗 Pilihan Ayam Panggang' : '🍗 Grilled Specialty',
      trendColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    }
  ];

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

          {/* SECTION: ANALISIS MAKANAN PALING LARIS SETIAP MINGGU */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{isMs ? 'Makanan Paling Laris Setiap Minggu' : 'Best-Selling Food Every Week'}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {activeWeekLabel}
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {isMs 
                    ? 'Pantau hidangan nombor 1 paling laris, kuantiti pesanan mingguan, dan perbandingan jualan dari minggu ke minggu untuk perancangan stok & menu.'
                    : 'Monitor the #1 top-selling dishes, weekly order quantities, and week-over-week trends for stock and menu optimization.'}
                </p>
              </div>

              {/* Station Filter & Print Button */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Station Filter */}
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs">
                  <button
                    onClick={() => setSelectedStationFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedStationFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua Kaunter
                  </button>
                  <button
                    onClick={() => setSelectedStationFilter('cashier_1')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedStationFilter === 'cashier_1'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kaunter 1 (Kafe)
                  </button>
                  <button
                    onClick={() => setSelectedStationFilter('cashier_2')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedStationFilter === 'cashier_2'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kaunter 2 (Burgers)
                  </button>
                </div>

                <button
                  onClick={handlePrintQR}
                  title={isMs ? 'Cetak Laporan Mingguan' : 'Print Weekly Report'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isMs ? 'Cetak Laporan' : 'Print Report'}</span>
                </button>
              </div>
            </div>

            {/* Week Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedWeek('current')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2 ${
                  selectedWeek === 'current'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${selectedWeek === 'current' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{isMs ? 'Minggu Ini (Terkini)' : 'This Week (Current)'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${selectedWeek === 'current' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {formatDateSpan(currentWeekStart, currentWeekEnd)}
                </span>
              </button>

              <button
                onClick={() => setSelectedWeek('week_1')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2 ${
                  selectedWeek === 'week_1'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${selectedWeek === 'week_1' ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{isMs ? 'Minggu Lepas' : 'Last Week'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${selectedWeek === 'week_1' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {formatDateSpan(week1Start, week1End)}
                </span>
              </button>

              <button
                onClick={() => setSelectedWeek('week_2')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2 ${
                  selectedWeek === 'week_2'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${selectedWeek === 'week_2' ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{isMs ? '2 Minggu Lepas' : '2 Weeks Ago'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${selectedWeek === 'week_2' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {formatDateSpan(week2Start, week2End)}
                </span>
              </button>

              <button
                onClick={() => setSelectedWeek('week_3')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2 ${
                  selectedWeek === 'week_3'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${selectedWeek === 'week_3' ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{isMs ? '3 Minggu Lepas' : '3 Weeks Ago'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${selectedWeek === 'week_3' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {formatDateSpan(week3Start, week3End)}
                </span>
              </button>

              <button
                onClick={() => setSelectedWeek('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2 ${
                  selectedWeek === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${selectedWeek === 'all' ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{isMs ? 'Semua Minggu (Kumulatif)' : 'All Weeks (Cumulative)'}</span>
              </button>
            </div>

            {/* Selected Week's Champion & Top 5 Ranking Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Champion Hero Card (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      <Crown className="w-3.5 h-3.5 fill-slate-950" />
                      {isMs ? 'Juara Jualan Mingguan' : 'Weekly Sales Champion'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                      {activeWeekSpan}
                    </span>
                  </div>

                  {activeWeeklyData.champion ? (
                    <div className="space-y-4">
                      {/* Image & Main Dish Info */}
                      <div className="flex items-center gap-3.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        {activeWeeklyData.champion.menuItem?.imageUrl ? (
                          <SafeImage
                            src={activeWeeklyData.champion.menuItem.imageUrl}
                            alt={activeWeeklyData.champion.name}
                            category={activeWeeklyData.champion.menuItem.category}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-amber-500/30"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Utensils className="w-7 h-7" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {activeWeeklyData.champion.cashierStation === 'cashier_2' ? (
                              <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                                Kaunter 2 (Burgers)
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-300 text-[9px] font-medium px-1.5 py-0.2 rounded">
                                Kaunter 1 (Kafe)
                              </span>
                            )}
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> 4.9
                            </span>
                          </div>
                          <h4 className="text-base font-black text-white line-clamp-2 leading-snug">
                            {activeWeeklyData.champion.name}
                          </h4>
                          <p className="text-xs font-black text-emerald-400 mt-0.5">
                            RM {(activeWeeklyData.champion.menuItem?.price || 14.90).toFixed(2)} / porsi
                          </p>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                            {isMs ? 'Kuantiti Terjual' : 'Units Sold'}
                          </span>
                          <p className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
                            <span>{activeWeeklyData.champion.quantity}</span>
                            <span className="text-xs font-normal text-slate-400">porsi</span>
                          </p>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {activeWeeklyData.champion.percentage.toFixed(1)}% daripada jualan
                          </span>
                        </div>

                        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                            {isMs ? 'Jumlah Kutipan' : 'Revenue Generated'}
                          </span>
                          <p className="text-2xl font-black text-emerald-400">
                            RM {activeWeeklyData.champion.revenue.toFixed(2)}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Sumbangan hasil tertinggi
                          </span>
                        </div>
                      </div>

                      {/* Quick Highlight Insight */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          <strong>Cadangan Pengurusan:</strong> Kekalkan bekalan bahan mentah untuk{' '}
                          <span className="text-white font-bold">{activeWeeklyData.champion.name}</span> terutama pada waktu puncak bagi mengelakkan situasi hidangan kehabisan stok.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      Tiada data hidangan untuk kriteria ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Top 5 Leaderboard (7 cols) */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{isMs ? 'Kedudukan 5 Hidangan Paling Laris' : 'Top 5 Best-Selling Dishes'}</span>
                    <span className="text-xs text-slate-400 font-normal">({activeWeekLabel})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {activeWeeklyData.totalDishQuantity} Porsi Terjual
                  </span>
                </div>

                {activeWeeklyData.items.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Tiada rekod jualan untuk minggu ini.</p>
                ) : (
                  <div className="space-y-2.5">
                    {activeWeeklyData.items.slice(0, 5).map((dish, idx) => {
                      const maxQty = activeWeeklyData.champion?.quantity || 1;
                      const progressWidth = Math.min(100, Math.round((dish.quantity / maxQty) * 100));

                      const rankBadges = [
                        'bg-amber-400 text-slate-950 font-black', // #1 Gold
                        'bg-slate-300 text-slate-950 font-black', // #2 Silver
                        'bg-amber-700 text-white font-black',      // #3 Bronze
                        'bg-slate-800 text-slate-300 font-bold',  // #4
                        'bg-slate-800 text-slate-300 font-bold',  // #5
                      ];

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center shrink-0 shadow-sm ${
                                  rankBadges[idx] || 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                #{idx + 1}
                              </span>

                              {dish.menuItem?.imageUrl ? (
                                <SafeImage
                                  src={dish.menuItem.imageUrl}
                                  alt={dish.name}
                                  category={dish.menuItem.category}
                                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                                />
                              ) : null}

                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-white truncate">{dish.name}</h5>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>RM {(dish.menuItem?.price || 14.90).toFixed(2)} seunit</span>
                                  <span>•</span>
                                  <span className={dish.cashierStation === 'cashier_2' ? 'text-amber-400' : 'text-slate-400'}>
                                    {dish.cashierStation === 'cashier_2' ? 'Kaunter 2 (Burgers)' : 'Kaunter 1 (Kafe)'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                {dish.quantity} Terjual
                              </span>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                RM {dish.revenue.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Visual progress bar */}
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0
                                  ? 'bg-amber-400'
                                  : idx === 1
                                  ? 'bg-emerald-400'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* WEEKLY HISTORY COMPARISON TABLE: MENUNJUKKAN MAKANAN PALING LARIS SETIAP MINGGU */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-black text-white">
                    {isMs ? 'Ringkasan Makanan Paling Laris Untuk Setiap Minggu' : 'Best-Selling Dish by Week Comparison'}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  Perbandingan 4 Minggu Terkini • Klik baris atau butang untuk memilih minggu
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3">Minggu & Tempoh</th>
                      <th className="p-3">Juara Makanan Paling Laris</th>
                      <th className="p-3 text-center">Kuantiti Terjual</th>
                      <th className="p-3 text-right">Hasil Jualan Juara</th>
                      <th className="p-3 text-center">Jumlah Pesanan</th>
                      <th className="p-3">Catatan / Prestasi</th>
                      <th className="p-3 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {weeklyHistorySummary.map((item) => {
                      const isRowSelected = selectedWeek === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedWeek(item.id)}
                          className={`transition-colors cursor-pointer ${
                            isRowSelected
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                              : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <td className="p-3">
                            <span className="font-bold text-white block">{item.labelMs}</span>
                            <span className="text-[10px] text-slate-400 block">{item.span}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {item.champion?.menuItem?.imageUrl ? (
                                <SafeImage
                                  src={item.champion.menuItem.imageUrl}
                                  alt={item.champion.name}
                                  category={item.champion.menuItem.category}
                                  className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-700"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                                  <Crown className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block leading-tight">
                                  {item.champion?.name || 'Tiada data'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {item.champion?.cashierStation === 'cashier_2'
                                    ? 'Kaunter 2 (Burgers)'
                                    : 'Kaunter 1 (Kafe)'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              {item.champion?.quantity || 0} Porsi
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-emerald-400">
                            RM {(item.champion?.revenue || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-300">
                            {item.totalOrders} Pesanan
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.trendColor}`}>
                              {item.trendTag}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWeek(item.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                isRowSelected
                                  ? 'bg-emerald-500 text-slate-950 font-black'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {isRowSelected ? 'Dipilih' : 'Papar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
