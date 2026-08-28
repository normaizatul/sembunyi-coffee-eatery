import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  Banknote, 
  CreditCard, 
  QrCode, 
  Receipt, 
  UserCheck,
  Calendar,
  Clock
} from 'lucide-react';
import { Order, PaymentDetails, LanguageType } from '../types';
import { SembunyiLogo } from './SembunyiLogo';
import { updateOrderPaymentInFirestore } from '../lib/firestoreService';

interface PaymentModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onPaymentSuccess: (order: Order, paymentDetails: PaymentDetails) => void;
  language: LanguageType;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  order,
  onClose,
  onPaymentSuccess,
  language
}) => {
  const isMs = language === 'ms';
  const hasCashier2Items = order?.items?.some((i) => i.menuItem?.cashierStation === 'cashier_2');
  const hasCashier1Items = order?.items?.some((i) => i.menuItem?.cashierStation !== 'cashier_2');

  const [selectedPayType, setSelectedPayType] = useState<'tunai' | 'kad' | 'qr_kaunter'>('tunai');
  const [selectedStationPay, setSelectedStationPay] = useState<'cashier_1' | 'cashier_2'>(
    hasCashier2Items && !hasCashier1Items ? 'cashier_2' : 'cashier_1'
  );
  const [cashierStaffName, setCashierStaffName] = useState('Juruwang Bertugas');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !order) return null;

  const totalAmountFormatted = (order.totalAmount || 0).toFixed(2);
  const subtotalFormatted = (order.subtotal || 0).toFixed(2);
  const taxFormatted = (order.tax || 0).toFixed(2);
  const isPaid = !!order.isPaid;
  const paymentDetails = order.paymentDetails;

  const handleCashierConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const txnId = `TXN-CSH-${Date.now().toString().slice(-6)}`;
      const recNumber = `REC-CSH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const paidDate = new Date().toISOString();

      const details: PaymentDetails = {
        transactionId: txnId,
        gateway: 'counter',
        receiptNumber: recNumber,
        paidAt: paidDate,
        cashierName: `${cashierStaffName} (${selectedStationPay === 'cashier_2' ? 'Kaunter 2 - Sembunyi Burgers' : 'Kaunter 1 - Kafe Sembunyi'})`,
        paymentType: selectedPayType,
        payerName: order.customerName || 'Tetamu Meja ' + order.tableNumber,
      };

      // 1. Call server endpoint
      try {
        await fetch('/api/payment/cashier-pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            paymentType: selectedPayType,
            cashierName: details.cashierName,
            cashierStation: selectedStationPay,
          })
        });
      } catch (srvErr) {
        console.warn('Server cashier-pay endpoint error:', srvErr);
      }

      // 2. Update Firestore
      try {
        await updateOrderPaymentInFirestore(order.id, details);
      } catch (fErr) {
        console.warn('Firestore payment update error:', fErr);
      }

      const updatedOrder: Order = {
        ...order,
        isPaid: true,
        paymentMethod: 'counter',
        paymentDetails: details,
        status: order.status === 'diterima' ? 'memasak' : order.status
      };

      onPaymentSuccess(updatedOrder, details);
    } catch (err) {
      console.error('Error confirming cashier payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>{isPaid ? (isMs ? 'Resit Rasmi Kaunter' : 'Official Counter Receipt') : (isMs ? 'Bil Pesanan Meja' : 'Table Order Bill')}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                  isPaid ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isPaid ? 'LUNAS' : 'BAYAR KAUNTER'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Kafe Sembunyi • Juruwang & Kaunter Bayaran</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Printable Receipt Paper Container */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden print:p-0 print:border-none">
            {/* Top Cafe Branding */}
            <div className="text-center pb-4 border-b border-dashed border-slate-800">
              <div className="flex justify-center mb-2">
                <SembunyiLogo size="sm" showSubtitle={false} />
              </div>
              <p className="font-extrabold text-white text-sm tracking-wide">KAFE SEMBUNYI</p>
              <p className="text-[10px] text-slate-400">Sembunyi Enterprise (SSM: 202401089241)</p>
              <p className="text-[10px] text-slate-400">No. 14, Lorong Warisan, 50480 Kuala Lumpur</p>
            </div>

            {/* Order & Table Meta */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-slate-800/80">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">No. Pesanan:</span>
                <span className="font-mono font-bold text-white">#{order.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">No. Meja:</span>
                <span className="font-black text-amber-400 text-xs">MEJA {order.tableNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Pelanggan:</span>
                <span className="font-semibold text-slate-200">{order.customerName || 'Tetamu'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Tarikh & Masa:</span>
                <span className="font-semibold text-slate-300">
                  {new Date(order.createdAt || Date.now()).toLocaleDateString('ms-MY', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase border-b border-slate-800 pb-1">
                <span>Hidangan</span>
                <span>Jumlah</span>
              </div>

              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs py-1 border-b border-slate-900/80 last:border-none">
                  <div className="pr-2">
                    <span className="font-bold text-white">{item.quantity}x </span>
                    <span className="text-slate-200">
                      {item.menuItem ? (isMs ? item.menuItem.nameMs : item.menuItem.nameEn) : 'Item'}
                    </span>
                    {item.selectedOptions?.spiceLevel && (
                      <span className="text-[10px] text-rose-400 block">🌶️ {item.selectedOptions.spiceLevel}</span>
                    )}
                    {item.selectedOptions?.sugarLevel && (
                      <span className="text-[10px] text-amber-400 block">🍯 {item.selectedOptions.sugarLevel}</span>
                    )}
                  </div>
                  <span className="font-bold text-slate-200 shrink-0">RM {(item.totalPrice || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Financial Calculations */}
            <div className="pt-3 border-t border-dashed border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Jumlah Sebelum Cukai</span>
                <span>RM {subtotalFormatted}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cukai Perkhidmatan (SST 6%)</span>
                <span>RM {taxFormatted}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span className="text-amber-400">JUMLAH KESELURUHAN</span>
                <span className="text-amber-400 text-base">RM {totalAmountFormatted}</span>
              </div>
            </div>

            {/* Paid Stamp or Unpaid Notice */}
            {isPaid ? (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TELAH DIBAYAR DI KAUNTER JURUWANG</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1 border-t border-emerald-500/20">
                  <div>
                    <span className="text-slate-400 block">No. Resit:</span>
                    <span className="font-mono text-emerald-300 font-bold">{paymentDetails?.receiptNumber || 'REC-CSH-2026'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kaedah Bayaran:</span>
                    <span className="capitalize font-bold text-white">
                      {paymentDetails?.paymentType === 'kad' ? 'Kad Debit/Kredit' : paymentDetails?.paymentType === 'qr_kaunter' ? 'QR Kaunter' : 'Tunai'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Juruwang:</span>
                    <span className="text-white">{paymentDetails?.cashierName || 'Juruwang Bertugas'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Masa Bayaran:</span>
                    <span className="text-white">{new Date(paymentDetails?.paidAt || Date.now()).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                  <Banknote className="w-4 h-4" />
                  <span>SILA BUAT BAYARAN DI KAUNTER</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Kemukakan No. Pesanan <span className="font-mono font-bold text-white">#{order.id}</span> atau sebutkan <span className="font-bold text-amber-300">Meja {order.tableNumber}</span> di kaunter juruwang untuk membuat bayaran.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">💵 Tunai</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">💳 Kad Debit/Kredit</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">📱 QR Kaunter</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Cashier / Staff Collection Box (If Unpaid) */}
          {!isPaid && (
            <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-extrabold text-xs text-white">Kaunter Juruwang (Terima Bayaran)</span>
                </div>
              </div>

              {/* Station Selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Kaunter Bayaran:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStationPay('cashier_2')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedStationPay === 'cashier_2'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🍔</span>
                    <span>Kaunter 2 (Burgers & Western)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStationPay('cashier_1')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedStationPay === 'cashier_1'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>☕</span>
                    <span>Kaunter 1 (Kafe Sembunyi)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Pilih Cara Bayaran Pelanggan:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayType('tunai')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedPayType === 'tunai'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Tunai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayType('kad')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedPayType === 'kad'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Kad Terminal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayType('qr_kaunter')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedPayType === 'qr_kaunter'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Kaunter</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCashierConfirmPayment}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Mengesahkan Bayaran...' : `SAHKAN BAYARAN KAUNTER (RM ${totalAmountFormatted})`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isMs ? 'Cetak Bil / Resit' : 'Print Receipt'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {isMs ? 'Tutup Paparan' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
