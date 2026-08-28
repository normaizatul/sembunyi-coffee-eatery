import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, AlertCircle, RefreshCw, Flame, Utensils, Volume2, Bell } from 'lucide-react';
import { Order, OrderStatus, LanguageType } from '../types';

interface KitchenDisplayViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  language: LanguageType;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  onUpdateStatus,
  language,
}) => {
  const isMs = language === 'ms';
  const [filter, setFilter] = useState<'semua' | 'diterima' | 'memasak' | 'sedia'>('semua');
  const [stationFilter, setStationFilter] = useState<'all' | 'cashier_1' | 'cashier_2'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active kitchen tickets (excluding completed)
  const safeOrders = Array.isArray(orders) ? orders : [];
  const kitchenTickets = safeOrders.filter((o) => o && o.status !== 'selesai' && o.status !== 'dibatalkan');

  const filteredTickets = kitchenTickets.filter((o) => {
    // Status filter
    if (filter !== 'semua' && o.status !== filter) return false;
    
    // Station filter
    if (stationFilter === 'cashier_2') {
      return o.items?.some((i) => i.menuItem?.cashierStation === 'cashier_2');
    }
    if (stationFilter === 'cashier_1') {
      return o.items?.some((i) => i.menuItem?.cashierStation !== 'cashier_2');
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                {isMs ? 'Paparan Dapur Live (KDS)' : 'Kitchen Display System (KDS)'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {kitchenTickets.length} Tiket Aktif
              </span>
            </div>
            <p className="text-xs text-slate-400">SmartDinePlus Kitchen Order Management System</p>
          </div>
        </div>

        {/* Filter Tabs & Audio Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kitchen Station Filter */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-semibold">
            <button
              onClick={() => setStationFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                stationFilter === 'all' ? 'bg-slate-200 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Dapur
            </button>
            <button
              onClick={() => setStationFilter('cashier_2')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                stationFilter === 'cashier_2' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400 hover:text-white'
              }`}
            >
              <span>🍔</span>
              <span>Burger & Grill (Kaunter 2)</span>
            </button>
            <button
              onClick={() => setStationFilter('cashier_1')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                stationFilter === 'cashier_1' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-emerald-400 hover:text-white'
              }`}
            >
              <span>☕</span>
              <span>Kafe (Kaunter 1)</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-semibold">
            <button
              onClick={() => setFilter('semua')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'semua' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({kitchenTickets.length})
            </button>
            <button
              onClick={() => setFilter('diterima')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'diterima' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Baharu ({kitchenTickets.filter((t) => t.status === 'diterima').length})
            </button>
            <button
              onClick={() => setFilter('memasak')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'memasak' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Memasak ({kitchenTickets.filter((t) => t.status === 'memasak').length})
            </button>
            <button
              onClick={() => setFilter('sedia')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'sedia' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sedia ({kitchenTickets.filter((t) => t.status === 'sedia').length})
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="Loceng Amaran Tiket Baharu"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ticket Grid */}
      {filteredTickets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Tiada Tiket Pesanan Aktif</h3>
          <p className="text-xs">Semua pesanan di dapur telah siap disajikan dengan sempurna!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((ticket) => {
            const isNew = ticket.status === 'diterima';
            const isCooking = ticket.status === 'memasak';
            const isReady = ticket.status === 'sedia';

            return (
              <div
                key={ticket.id}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all ${
                  isNew
                    ? 'border-rose-500/70 ring-2 ring-rose-500/20'
                    : isCooking
                    ? 'border-amber-500/70 ring-2 ring-amber-500/20'
                    : 'border-emerald-500/70 ring-2 ring-emerald-500/20'
                }`}
              >
                <div>
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">MEJA {ticket.tableNumber}</span>
                        <span className="text-xs font-bold text-slate-400">#{ticket.id}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {ticket.customerName || 'Tetamu'} {ticket.customerPhone ? `(${ticket.customerPhone})` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ticket.customerPhone && (
                        <a
                          href={`https://wa.me/${ticket.customerPhone.replace(/[^0-9]/g, '').startsWith('60') ? ticket.customerPhone.replace(/[^0-9]/g, '') : '60' + ticket.customerPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                            `Salam ${ticket.customerName || 'Pelanggan'}! 🍲 Hidangan pesanan #${ticket.id} di Meja ${ticket.tableNumber} kini ${ticket.status === 'sedia' ? 'SEDIA UNTUK DIAMBIL / DISAJIKAN!' : 'sedang dimasak!'}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          title="Hantar Notifikasi WhatsApp"
                        >
                          💬 WA
                        </a>
                      )}

                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isNew
                            ? 'bg-rose-500 text-white animate-pulse'
                            : isCooking
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        {isNew ? 'BAHARU' : isCooking ? 'MEMASAK' : 'SEDIA'}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          ticket.isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {ticket.isPaid ? '✓ LUNAS' : '⏳ BELUM BAYAR'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 mb-4">
                    {(ticket.items || []).map((item, i) => {
                      if (!item) return null;
                      const dishName = item.menuItem
                        ? (isMs ? item.menuItem.nameMs : item.menuItem.nameEn)
                        : 'Hidangan';
                      const addOnsList = item.selectedOptions?.addOns || [];

                      return (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-extrabold text-white text-sm flex items-center gap-1.5 flex-wrap">
                              <span className="text-emerald-400">{item.quantity || 1}x </span>
                              <span>{dishName}</span>
                              {item.menuItem?.cashierStation === 'cashier_2' ? (
                                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded">
                                  🍔 Kaunter 2
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-300 text-[10px] font-medium px-1.5 py-0.2 rounded">
                                  ☕ Kaunter 1
                                </span>
                              )}
                            </div>

                            {item.selectedOptions?.pattyChoice && (
                              <span className="text-[12px] font-bold text-amber-300 block mt-0.5">
                                🥩 Pilihan Patty: {item.selectedOptions.pattyChoice}
                              </span>
                            )}
                            {item.selectedOptions?.spiceLevel && (
                              <span className="text-[11px] font-semibold text-rose-400 block">
                                🌶️ {item.selectedOptions.spiceLevel}
                              </span>
                            )}
                            {item.selectedOptions?.sugarLevel && (
                              <span className="text-[11px] text-amber-300 block">
                                🍯 {item.selectedOptions.sugarLevel}
                              </span>
                            )}
                            {addOnsList.length > 0 && (
                              <span className="text-[11px] text-emerald-300 block">
                                + {addOnsList.map((a) => (isMs ? a.nameMs : a.nameEn)).join(', ')}
                              </span>
                            )}
                            {item.selectedOptions?.specialInstruction && (
                              <span className="text-[11px] italic text-amber-400 block bg-amber-500/10 p-1 rounded mt-1">
                                ⚠️ "{item.selectedOptions.specialInstruction}"
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action Bump Buttons */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Masa Diterima: {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-amber-400 font-bold">~{ticket.estimatedMinutes} Minit</span>
                  </div>

                  {isNew && (
                    <div className="space-y-2">
                      {!ticket.isPaid ? (
                        <div className="p-3 bg-amber-950/50 border border-amber-500/50 rounded-xl space-y-2 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-amber-300 font-extrabold text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span>MENUNGGU BAYARAN DI KAUNTER</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-tight">
                            Pelanggan perlu selesaikan bayaran di Kaunter {ticket.items?.some(i => i.menuItem?.cashierStation === 'cashier_2') ? '2 / 1' : '1'} dahulu sebelum dapur proceed memasak.
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Confirm cashier payment and start cooking immediately
                              onUpdateStatus(ticket.id, 'memasak');
                            }}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black py-2 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>SAHKAN BAYAR & MULA MEMASAK</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(ticket.id, 'memasak');
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 active:scale-[0.98] text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                        >
                          <Flame className="w-4 h-4 text-slate-950 animate-bounce" />
                          <span>MULA MEMASAK (BAYARAN DISAHKAN)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isCooking && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(ticket.id, 'sedia');
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 active:scale-[0.98] text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <Utensils className="w-4 h-4 text-slate-950 animate-pulse" />
                      <span>HIDANGAN SEDIA (BUMP)</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(ticket.id, 'selesai');
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 active:scale-[0.98] text-emerald-400 border border-emerald-500/40 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>TANDA SELESAI & DISAJIKAN</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
