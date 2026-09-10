import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Bell, 
  Receipt, 
  X, 
  Sparkles, 
  ChefHat, 
  Star, 
  Send, 
  MessageSquare, 
  ThumbsUp, 
  Edit3, 
  Heart,
  BadgePercent,
  CreditCard,
  QrCode,
  ShieldCheck,
  Banknote,
  Gamepad2
} from 'lucide-react';
import { Order, LanguageType, OrderFeedback } from '../types';
import { submitOrderFeedbackInFirestore } from '../lib/firestoreService';

interface OrderStatusModalProps {
  order: Order | null;
  onClose: () => void;
  onCallWaiter: (reason: string) => void;
  onFeedbackSubmit?: (orderId: string, feedback: OrderFeedback) => void;
  onOpenPayment?: (order: Order) => void;
  onOpenMiniGames?: () => void;
  language: LanguageType;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  order,
  onClose,
  onCallWaiter,
  onFeedbackSubmit,
  onOpenPayment,
  onOpenMiniGames,
  language,
}) => {
  const [waiterCalled, setWaiterCalled] = useState(false);
  const isMs = language === 'ms';

  // Feedback State
  const [rating, setRating] = useState<number>(order?.feedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>(order?.feedback?.review || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(order?.feedback?.quickTags || []);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(!!order?.feedback);
  const [isEditingFeedback, setIsEditingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');

  // Sync state when order changes
  useEffect(() => {
    if (order?.feedback) {
      setRating(order.feedback.rating || 5);
      setReview(order.feedback.review || '');
      setSelectedTags(order.feedback.quickTags || []);
      setFeedbackSubmitted(true);
      setIsEditingFeedback(false);
    } else {
      setRating(5);
      setReview('');
      setSelectedTags([]);
      setFeedbackSubmitted(false);
      setIsEditingFeedback(false);
    }
  }, [order?.id, order?.feedback]);

  if (!order) return null;

  const handleCall = (reason: string) => {
    onCallWaiter(reason);
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 5000);
  };

  // Status index: diterima (0) -> memasak (1) -> sedia (2) -> selesai (3)
  const steps = [
    { key: 'diterima', labelMs: 'Pesanan Diterima', labelEn: 'Order Received', icon: Receipt },
    { key: 'memasak', labelMs: 'Disediakan di Dapur', labelEn: 'Preparing in Kitchen', icon: ChefHat },
    { key: 'sedia', labelMs: 'Sedia di Meja', labelEn: 'Ready & Served', icon: Utensils },
    { key: 'selesai', labelMs: 'Selesai & Bayar', labelEn: 'Completed', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'diterima': return 0;
      case 'memasak': return 1;
      case 'sedia': return 2;
      case 'selesai': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const formattedCompletionTime = (() => {
    if (order.estimatedCompletionTime) {
      try {
        return new Date(order.estimatedCompletionTime).toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch (e) {
        return null;
      }
    }
    if (order.createdAt && order.estimatedMinutes) {
      try {
        const d = new Date(new Date(order.createdAt).getTime() + order.estimatedMinutes * 60 * 1000);
        return d.toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch (e) {
        return null;
      }
    }
    return null;
  })();

  // Quick feedback tags list
  const quickTagsList = [
    { key: 'sedap', ms: '🍲 Makanan Sangat Sedap', en: '🍲 Delicious Food' },
    { key: 'pantas', ms: '⚡ Servis Pantas', en: '⚡ Fast Service' },
    { key: 'panas', ms: '🔥 Hidangan Panas & Segar', en: '🔥 Hot & Fresh' },
    { key: 'selesa', ms: '🌿 Suasana Selesa', en: '🌿 Cozy Ambience' },
    { key: 'minuman', ms: '☕ Minuman / Kopi Padu', en: '☕ Great Drinks' },
    { key: 'mesra', ms: '😊 Staf Mesra & Prihatin', en: '😊 Friendly Staff' },
    { key: 'berbaloi', ms: '💰 Sangat Berbaloi', en: '💰 Great Value' }
  ];

  const handleToggleTag = (tagText: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagText) ? prev.filter((t) => t !== tagText) : [...prev, tagText]
    );
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return isMs ? '⭐⭐⭐⭐⭐ Luar Biasa & Sangat Puas Hati!' : '⭐⭐⭐⭐⭐ Exceptional & Highly Satisfied!';
      case 4:
        return isMs ? '⭐⭐⭐⭐ Sedap & Memuaskan' : '⭐⭐⭐⭐ Delicious & Very Good';
      case 3:
        return isMs ? '⭐⭐⭐ Sederhana / Okay' : '⭐⭐⭐ Average / Okay';
      case 2:
        return isMs ? '⭐⭐ Kurang Memuaskan' : '⭐⭐ Below Expectations';
      case 1:
        return isMs ? '⭐ Perlu Penambahbaikan' : '⭐ Needs Improvement';
      default:
        return '';
    }
  };

  const handleFeedbackSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setFeedbackError(isMs ? 'Sila pilih sekurang-kurangnya 1 bintang.' : 'Please select at least 1 star.');
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError('');

    const payload: OrderFeedback = {
      rating,
      review: review.trim(),
      quickTags: selectedTags,
      submittedAt: new Date().toISOString()
    };

    try {
      if (onFeedbackSubmit) {
        onFeedbackSubmit(order.id, payload);
      } else {
        await submitOrderFeedbackInFirestore(order.id, payload);
      }
      setFeedbackSubmitted(true);
      setIsEditingFeedback(false);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setFeedbackError(isMs ? 'Gagal menghantar ulasan. Sila cuba lagi.' : 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {isMs ? `Status Pesanan #${order.id}` : `Order Status #${order.id}`}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Meja {order.tableNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">SmartDinePlus Live Tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Tracker Body */}
        <div className="p-5 overflow-y-auto space-y-6">

          {/* ========================================================================= */}
          {/* STAR RATING & FEEDBACK SECTION (DISPLAYED WHEN STATUS IS 'selesai')      */}
          {/* ========================================================================= */}
          {order.status === 'selesai' && (
            <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Title & Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{isMs ? 'Penilaian & Ulasan Hidangan' : 'Meal Rating & Review'}</span>
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isMs
                        ? 'Kongsi maklum balas anda untuk membantu Kafe Sembunyi meningkatkan mutu masakan & khidmat.'
                        : 'Share your dining feedback to help Sembunyi Cafe enhance food quality & service.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback Form or Submitted Summary */}
              {feedbackSubmitted && !isEditingFeedback ? (
                /* Already Submitted View */
                <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        {isMs ? 'Ulasan Berjaya Diterima! Terima Kasih ✨' : 'Review Submitted! Thank You ✨'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingFeedback(true)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isMs ? 'Kemaskini Ulasan' : 'Edit Review'}</span>
                    </button>
                  </div>

                  {/* Star Display */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-6 h-6 ${
                          starNum <= (order.feedback?.rating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs font-black text-amber-300">
                      {getRatingLabel(order.feedback?.rating || rating)}
                    </span>
                  </div>

                  {/* Selected Tags */}
                  {order.feedback?.quickTags && order.feedback.quickTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {order.feedback.quickTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Review Text */}
                  {order.feedback?.review && (
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-200 italic">
                      "{order.feedback.review}"
                    </div>
                  )}
                </div>
              ) : (
                /* Interactive Star Rating Form */
                <form onSubmit={handleFeedbackSubmitAction} className="space-y-4">
                  {/* Star Rating Selector */}
                  <div className="text-center py-2 bg-slate-950/80 rounded-xl border border-slate-800/80 p-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {isMs ? 'Berapa Bintang Untuk Hidangan Anda?' : 'How would you rate your meal?'}
                    </span>

                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((starNum) => {
                        const activeVal = hoverRating || rating;
                        const isFilled = starNum <= activeVal;
                        return (
                          <button
                            type="button"
                            key={starNum}
                            onClick={() => setRating(starNum)}
                            onMouseEnter={() => setHoverRating(starNum)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-slate-600 hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-none"
                            aria-label={`Rate ${starNum} Stars`}
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                isFilled
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                  : 'text-slate-700 hover:text-slate-500'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Dynamic Rating Feedback Text */}
                    <div className="mt-2 text-xs font-black text-amber-300">
                      {getRatingLabel(hoverRating || rating)}
                    </div>
                  </div>

                  {/* Quick Praise / Feedback Chips */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      {isMs ? 'Pilihan Pantas Maklum Balas:' : 'Quick Compliments & Highlights:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {quickTagsList.map((tag) => {
                        const tagLabel = isMs ? tag.ms : tag.en;
                        const isSelected = selectedTags.includes(tagLabel);
                        return (
                          <button
                            type="button"
                            key={tag.key}
                            onClick={() => handleToggleTag(tagLabel)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20 scale-102'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            {tagLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review Text Area */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      {isMs ? 'Tulis Ulasan Anda (Pilihan):' : 'Write Your Review (Optional):'}
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder={
                          isMs
                            ? 'Cth: Ayam chicken chop sangat rangup dan kuah blackpepper pekat. Servis meja pun cepat...'
                            : 'E.g., Crispy chicken chop with flavorful blackpepper sauce! Fast and polite service...'
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      />
                      <MessageSquare className="w-4 h-4 text-slate-600 absolute bottom-3 right-3 pointer-events-none" />
                    </div>
                  </div>

                  {feedbackError && (
                    <p className="text-xs text-rose-400 font-semibold">{feedbackError}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {isEditingFeedback && (
                      <button
                        type="button"
                        onClick={() => setIsEditingFeedback(false)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        {isMs ? 'Batal' : 'Cancel'}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmittingFeedback}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingFeedback ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>
                        {isSubmittingFeedback
                          ? (isMs ? 'Sedang Menyimpan...' : 'Saving...')
                          : (isMs ? 'Hantar Maklum Balas & Ulasan' : 'Submit Meal Review')}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Order Status Ready Pickup Banner & WhatsApp Trigger */}
          {order.status === 'sedia' && (
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500 p-4 rounded-xl text-center relative overflow-hidden shadow-xl animate-pulse">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-xs mb-1">
                <Utensils className="w-5 h-5 animate-bounce" />
                <span className="text-sm uppercase tracking-wider">HIDANGAN SEDIA UNTUK DIAMBIL / DISAJIKAN!</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                {isMs
                  ? `Pesanan #${order.id} bagi Meja ${order.tableNumber} telah siap dimasak dengan sempurna.`
                  : `Order #${order.id} for Table ${order.tableNumber} is hot & ready!`}
              </p>

              {/* WhatsApp Notification Button */}
              {order.customerPhone && (
                <div className="mt-3 pt-3 border-t border-emerald-500/30 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '').startsWith('60') ? order.customerPhone.replace(/[^0-9]/g, '') : '60' + order.customerPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                      `Salam ${order.customerName || 'Pelanggan'}! 🍲 Hidangan anda bagi Pesanan #${order.id} di Meja ${order.tableNumber} telah SEDIA UNTUK DIAMBIL / DISAJIKAN di kaunter SmartDinePlus. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <span>💬 Buka / Hantar Notifikasi WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Estimated Time Indicator (hide if order is already completed) */}
          {order.status !== 'selesai' && (
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 rounded-xl text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{isMs ? 'Anggaran Masa Penyiapan' : 'Estimated Time'}</span>
              </div>
              <p className="text-2xl font-black text-white">~ {order.estimatedMinutes} Minit</p>

              {formattedCompletionTime && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                  <span className="text-xs font-semibold text-amber-300">
                    {isMs ? 'Dijangka Siap Pada:' : 'Estimated Ready At:'}{' '}
                    <span className="text-white font-black tracking-wide">{formattedCompletionTime}</span>
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-2">
                {isMs ? 'Dapur sedang menyediakan hidangan anda dengan teliti.' : 'Kitchen is preparing your dishes with care.'}
              </p>
            </div>
          )}

          {/* Sembunyi Mini Games Waiting Lounge Feature Card */}
          {order.status !== 'selesai' && onOpenMiniGames && (
            <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-500/20 shrink-0">
                    <Gamepad2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">
                        {isMs ? '🎮 3 Permainan Kafe Sambil Menunggu!' : '🎮 3 Cafe Mini-Games While Waiting!'}
                      </h4>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {isMs ? 'PERCUMA' : 'FREE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {isMs
                        ? '1. Bancuh Kopi Sembunyi • 2. Susun Menara Burger • 3. Uji Minda Padanan Menu. Uji ketangkasan & ingatan anda sekarang!'
                        : '1. Barista Brew Rush • 2. Burger Stacker • 3. Food Memory Match. Have fun while waiting!'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-amber-300/90 font-semibold">
                  ☕ {isMs ? 'Luangkan masa santai sementara pesanan disiapkan' : 'Enjoy relaxing games while your food is prepared'}
                </span>
                <button
                  type="button"
                  onClick={onOpenMiniGames}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>{isMs ? 'MULA MAIN' : 'PLAY NOW'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Counter Payment Alert Banner (when unpaid) */}
          {!order.isPaid && order.status !== 'dibatalkan' && (
            <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider">
                    {isMs ? 'Langkah Seterusnya: Bayar di Kaunter' : 'Next Step: Pay at Counter'}
                  </h4>
                  <p className="font-bold text-sm text-white">
                    {isMs ? 'Pesanan akan mula dimasak selepas bayaran disahkan' : 'Cooking will proceed once counter payment is verified'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/20">
                {isMs
                  ? `Sila ke Kaunter ${order.items?.some(i => i.menuItem?.cashierStation === 'cashier_2') ? '2 (Burgers & Western) atau Kaunter 1' : '1 (Juruwang)'} dan maklumkan Meja #${order.tableNumber} (Pesanan #${order.id}) untuk membuat pembayaran (Tunai / Kad / QR).`
                  : `Please proceed to Counter ${order.items?.some(i => i.menuItem?.cashierStation === 'cashier_2') ? '2 or Counter 1' : '1'} and state Table #${order.tableNumber} (Order #${order.id}) to complete payment (Cash / Card / QR).`}
              </p>

              {onOpenPayment && (
                <button
                  type="button"
                  onClick={() => onOpenPayment(order)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{isMs ? 'Buka Bil & Bayar di Kaunter Sekarang' : 'Open Bill & Pay at Counter Now'}</span>
                </button>
              )}
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 block">
              {isMs ? 'Kemajuan Pesanan Live' : 'Live Order Progress'}
            </h4>

            <div className="space-y-4 relative">
              {steps.map((st, idx) => {
                const IconComponent = st.icon;
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={st.key} className="flex items-start gap-3 relative">
                    {/* Vertical Connecting Line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 h-6 -translate-x-1/2 ${
                          idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      />
                    )}

                    {/* Step Icon Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all z-10 ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30'
                          : isPassed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Step Title */}
                    <div className="pt-1">
                      <p
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-emerald-400 font-extrabold text-sm' : isPassed ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {isMs ? st.labelMs : st.labelEn}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-300/80 animate-pulse font-medium">
                          • {isMs ? 'Sedang Diproses Sekarang' : 'In Progress Now'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Waiter Call Action (only active if not completed) */}
          {order.status !== 'selesai' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    {isMs ? 'Panggil Pelayan / Bantuan Meja' : 'Call Waiter / Service Alert'}
                  </span>
                </div>
              </div>

              {waiterCalled ? (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isMs ? 'Staf pelayan kami telah dimaklumkan & menuju ke meja anda!' : 'Our waiter staff has been notified & heading to your table!'}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCall('pelayan')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs font-semibold text-slate-200 transition-colors text-center cursor-pointer"
                  >
                    🔔 {isMs ? 'Panggil Pelayan' : 'Call Waiter'}
                  </button>
                  <button
                    onClick={() => handleCall('bil')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-semibold text-slate-200 transition-colors text-center cursor-pointer"
                  >
                    💳 {isMs ? 'Minta Bil / Resit' : 'Request Bill'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Status & Cashier Bill Info */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${order.isPaid ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="text-xs font-bold text-white">
                  {isMs ? 'Status Pembayaran di Kaunter' : 'Counter Payment Status'}
                </span>
              </div>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                  order.isPaid
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {order.isPaid ? (isMs ? '✓ Lunas / Dibayar' : '✓ Paid') : (isMs ? '⏳ Belum Bayar' : '⏳ Unpaid')}
              </span>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">{isMs ? 'Kaedah Pembayaran:' : 'Payment Method:'}</span>
                <span className="font-bold text-amber-300">
                  {isMs ? 'Bayar di Kaunter Juruwang' : 'Pay at Cashier Counter'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                {order.isPaid
                  ? (isMs 
                      ? `Pesanan telah dibayar di kaunter. Resit: ${order.paymentDetails?.receiptNumber || 'REC-CSH'}`
                      : `Order has been paid at cashier. Receipt: ${order.paymentDetails?.receiptNumber || 'REC-CSH'}`)
                  : (isMs
                      ? `Sila tunjukkan No. Pesanan #${order.id} atau sebut Meja ${order.tableNumber} semasa membuat pembayaran di kaunter (Tunai, Kad atau Kod QR Kaunter).`
                      : `Please present Order #${order.id} or Table ${order.tableNumber} when paying at the cashier (Cash, Card or Counter QR).`)}
              </p>
            </div>

            {onOpenPayment && (
              <button
                type="button"
                onClick={() => onOpenPayment(order)}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
              >
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>{isMs ? 'Lihat Bil / Resit Rasmi Kaunter' : 'View Official Counter Bill / Receipt'}</span>
              </button>
            )}
          </div>

          {/* Order Summary Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
              {isMs ? 'Ringkasan Hidangan Ditempah' : 'Ordered Items Summary'}
            </h4>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                  <div>
                    <span className="font-bold text-white">{item?.quantity || 1}x </span>
                    <span className="text-slate-300">
                      {item?.menuItem
                        ? (isMs ? item.menuItem.nameMs : item.menuItem.nameEn)
                        : 'Hidangan'}
                    </span>
                    {item?.selectedOptions?.spiceLevel && (
                      <span className="text-rose-400 text-[10px] block">🌶️ {item.selectedOptions.spiceLevel}</span>
                    )}
                  </div>
                  <span className="font-semibold text-emerald-400">RM {(item?.totalPrice || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between text-xs font-bold text-white border-t border-slate-800">
                <span>Total (Inc. SST)</span>
                <span className="text-emerald-400">RM {(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {isMs ? 'Tutup Paparan' : 'Close View'}
          </button>
        </div>
      </div>
    </div>
  );
};
