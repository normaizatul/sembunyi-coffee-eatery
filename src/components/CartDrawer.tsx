import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Banknote, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CartItem, LanguageType, Order } from '../types';
import { SafeImage } from './SafeImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber: string;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderSubmitted: (order: Order) => void;
  language: LanguageType;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  tableNumber,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSubmitted,
  language,
}) => {
  const isMs = language === 'ms';
  const [customerName, setCustomerName] = useState('Cik Nourul');
  const [customerPhone, setCustomerPhone] = useState('0123456789');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const safeCart = Array.isArray(cart) ? cart : [];
  const subtotal = safeCart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const tax = subtotal * 0.06; // 6% SST
  const grandTotal = subtotal + tax;

  const handleSubmitOrder = async () => {
    if (safeCart.length === 0) return;
    setIsSubmitting(true);

    const prepTimes = safeCart.map((c) => c?.menuItem?.prepTimeMinutes || 10);
    const prepTime = prepTimes.length > 0 ? Math.max(...prepTimes, 10) : 10;
    const now = new Date();
    const completionTime = new Date(now.getTime() + prepTime * 60 * 1000).toISOString();

    const newOrderPayload: Partial<Order> = {
      tableNumber,
      customerName: customerName.trim() || 'Tetamu',
      customerPhone: customerPhone.trim() || '0123456789',
      items: safeCart,
      subtotal,
      tax,
      totalAmount: grandTotal,
      status: 'diterima',
      paymentMethod: 'counter',
      isPaid: false,
      createdAt: now.toISOString(),
      estimatedMinutes: prepTime,
      estimatedCompletionTime: completionTime,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload),
      });
      const data = await res.json();
      if (data.success) {
        onOrderSubmitted(data.order);
        onClearCart();
        onClose();
      }
    } catch (error) {
      console.error('Submit order failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl relative">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-white">
                  {isMs ? 'Pesanan QR Saya' : 'My QR Order'}
                </h2>
                <p className="text-xs text-slate-400">Meja {tableNumber} • SmartDinePlus</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {safeCart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3 text-slate-500 border border-slate-700/50">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  {isMs ? 'Troli Pesanan Kosong' : 'Your Cart is Empty'}
                </h3>
                <p className="text-xs max-w-xs">
                  {isMs
                    ? 'Sila pilih hidangan lazat dari menu QR untuk membuat pesanan anda.'
                    : 'Please choose delicious items from the QR menu to place your order.'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
                  <span>{safeCart.length} {isMs ? 'Jenis Hidangan' : 'Items'}</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isMs ? 'Kosongkan' : 'Clear All'}</span>
                  </button>
                </div>

                {safeCart.map((item) => {
                  const dishName = item.menuItem
                    ? (isMs ? item.menuItem.nameMs : item.menuItem.nameEn)
                    : 'Hidangan';
                  const dishImg = item.menuItem?.imageUrl || '';
                  const addOnsList = item.selectedOptions?.addOns || [];
                  const isCashier2 = item.menuItem?.cashierStation === 'cashier_2';

                  return (
                    <div
                      key={item.cartItemId}
                      className={`p-3 bg-slate-950/70 border rounded-xl flex items-start justify-between gap-3 ${
                        isCashier2 ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800/80'
                      }`}
                    >
                      <SafeImage
                        src={dishImg}
                        alt={dishName}
                        category={item.menuItem?.category}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-900"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {isCashier2 ? (
                                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                                  Kaunter 2
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-300 text-[9px] font-medium px-1.5 py-0.2 rounded">
                                  Kaunter 1
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-white truncate">
                                {dishName}
                              </h4>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.cartItemId)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-400 mt-0.5 space-y-0.5">
                          {item.selectedOptions?.pattyChoice && (
                            <div className="text-amber-400 font-bold">🥩 {item.selectedOptions.pattyChoice}</div>
                          )}
                          {item.selectedOptions?.temperature && (
                            <div className="text-amber-300 font-medium">{item.selectedOptions.temperature}</div>
                          )}
                          {item.selectedOptions?.spiceLevel && (
                            <div className="text-rose-400 font-medium">🌶️ {item.selectedOptions.spiceLevel}</div>
                          )}
                          {item.selectedOptions?.sugarLevel && (
                            <div>🍯 {item.selectedOptions.sugarLevel}</div>
                          )}
                          {addOnsList.length > 0 && (
                            <div className="text-emerald-400">
                              + {addOnsList.map((a) => (isMs ? a.nameMs : a.nameEn)).join(', ')}
                            </div>
                          )}
                          {item.selectedOptions?.specialInstruction && (
                            <div className="italic text-slate-500">"{item.selectedOptions.specialInstruction}"</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900">
                          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-black text-emerald-400">
                            RM {(item.totalPrice || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Customer Details & Cashier Notice */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                        {isMs ? 'Nama Pemesan' : 'Customer Name'}
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Cik Nourul"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-400 uppercase block mb-1 flex items-center gap-1">
                        <span>💬 No. Telefon</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0123456789"
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                      {isMs ? 'Panduan Kaunter Pembayaran' : 'Cashier Payment Guide'}
                    </label>
                    <div className="space-y-2">
                      {/* Counter Routing Breakdown Box */}
                      {(() => {
                        const cashier1Items = safeCart.filter((i) => i.menuItem?.cashierStation !== 'cashier_2');
                        const cashier2Items = safeCart.filter((i) => i.menuItem?.cashierStation === 'cashier_2');
                        const totalC1 = cashier1Items.reduce((s, i) => s + (i.totalPrice || 0), 0);
                        const totalC2 = cashier2Items.reduce((s, i) => s + (i.totalPrice || 0), 0);

                        return (
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                            {cashier2Items.length > 0 && (
                              <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">🍔</span>
                                  <div>
                                    <div className="font-bold text-amber-300">Kaunter 2 (Sembunyi Burger & Grill)</div>
                                    <div className="text-[10px] text-slate-400">Bayar di Cashier 2 ({cashier2Items.length} hidangan)</div>
                                  </div>
                                </div>
                                <span className="font-black text-amber-400">RM {totalC2.toFixed(2)}</span>
                              </div>
                            )}

                            {cashier1Items.length > 0 && (
                              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">☕</span>
                                  <div>
                                    <div className="font-bold text-slate-200">Kaunter 1 (Kafe Sembunyi)</div>
                                    <div className="text-[10px] text-slate-400">Bayar di Cashier 1 ({cashier1Items.length} hidangan)</div>
                                  </div>
                                </div>
                                <span className="font-black text-emerald-400">RM {totalC1.toFixed(2)}</span>
                              </div>
                            )}

                            <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5 pt-1">
                              <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Sila selesaikan bayaran di kaunter dahulu. Dapur akan terus mula memasak sebaik sahaja bayaran disahkan!</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-semibold">RM {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SST (6%)</span>
                  <span className="text-slate-200 font-semibold">RM {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-slate-800">
                  <span className="text-amber-400">Jumlah Keseluruhan</span>
                  <span className="text-amber-400">RM {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleSubmitOrder}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Menghantar Pesanan...</span>
                ) : (
                  <>
                    <span>HANTAR PESANAN & BAYAR DI KAUNTER (RM {grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
