import React from 'react';
import { Users, Bell, CheckCircle2, QrCode, AlertTriangle, Receipt, Utensils } from 'lucide-react';
import { TableInfo, Order, OrderStatus, LanguageType } from '../types';

interface WaiterFloorViewProps {
  tables: TableInfo[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onResolveTableCall?: (tableNumber: string, nextStatus: TableInfo['status']) => void;
  language: LanguageType;
}

export const WaiterFloorView: React.FC<WaiterFloorViewProps> = ({
  tables,
  orders,
  onUpdateOrderStatus,
  onResolveTableCall,
  language,
}) => {
  const isMs = language === 'ms';

  const getTableStatusStyle = (status: TableInfo['status']) => {
    switch (status) {
      case 'panggil_pelayan':
        return {
          bg: 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/30 text-rose-300',
          badge: 'bg-rose-500 text-white font-black animate-pulse',
          label: 'PANGGIL PELAYAN!',
        };
      case 'minta_bil':
        return {
          bg: 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/30 text-amber-300',
          badge: 'bg-amber-500 text-slate-950 font-black',
          label: 'MINTA BIL / RESIT',
        };
      case 'menunggu_makanan':
        return {
          bg: 'bg-slate-900 border-teal-500/50 text-slate-200',
          badge: 'bg-teal-500 text-slate-950 font-bold',
          label: 'MEMASAK DI DAPUR',
        };
      case 'sedang_dijamu':
        return {
          bg: 'bg-slate-900 border-emerald-500/50 text-slate-200',
          badge: 'bg-emerald-500 text-slate-950 font-bold',
          label: 'SEDANG DIJAMU',
        };
      default:
        return {
          bg: 'bg-slate-900/60 border-slate-800 text-slate-400',
          badge: 'bg-slate-800 text-slate-400',
          label: 'KOSONG',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Floor Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isMs ? 'Pengurusan Dewan & Staf Pelayan' : 'Floor & Waiter Service Hub'}
            </h2>
            <p className="text-xs text-slate-400">SmartDinePlus Real-Time Dining Table Status Map</p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <div className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-rose-400" />
            <span>{(tables || []).filter((t) => t.status === 'panggil_pelayan' || t.status === 'minta_bil').length} Panggilan Alert</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">
            {(tables || []).filter((t) => t.status === 'sedang_dijamu').length} Sedang Dijamu
          </div>
          <div className="px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl">
            {(tables || []).filter((t) => t.status === 'kosong').length} Meja Kosong
          </div>
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(tables || []).map((table) => {
          const style = getTableStatusStyle(table.status);
          const safeOrdersList = Array.isArray(orders) ? orders : [];
          const activeOrder = safeOrdersList.find((o) => o && (o.id === table.activeOrderId || (o.tableNumber === table.tableNumber && o.status !== 'selesai')));

          return (
            <div
              key={table.tableNumber}
              className={`border rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all ${style.bg}`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">MEJA {table.tableNumber}</span>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                      {table.seats} Kerusi
                    </span>
                  </div>

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                {activeOrder ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>Pesanan #{activeOrder.id}</span>
                      <span className="text-emerald-400">RM {(activeOrder.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Pemesan: {activeOrder.customerName || 'Tetamu'}</p>
                    <div className="text-[11px] text-amber-300 font-medium">
                      Item: {(activeOrder.items || []).map((i) => `${i.quantity || 1}x ${i.menuItem ? (isMs ? i.menuItem.nameMs : i.menuItem.nameEn) : 'Item'}`).join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    Meja sedia untuk diimbas kod QR oleh pelanggan baharu.
                  </div>
                )}
              </div>

              {/* Service Action Controls */}
              <div className="pt-3 border-t border-slate-800 mt-3 space-y-1.5">
                {(table.status === 'panggil_pelayan' || table.status === 'minta_bil') && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = activeOrder ? 'sedang_dijamu' : 'kosong';
                      if (onResolveTableCall) {
                        onResolveTableCall(table.tableNumber, nextStatus);
                      }
                    }}
                    className="w-full bg-rose-500 hover:bg-rose-400 active:scale-[0.98] text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>TANDA PANGGILAN SELESAI</span>
                  </button>
                )}

                {activeOrder && activeOrder.status === 'sedia' && (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(activeOrder.id, 'selesai')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>HANTAR KE MEJA & SELESAIKAN</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
