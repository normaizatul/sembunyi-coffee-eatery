import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Compass,
  ExternalLink,
  Sparkles,
  Utensils,
  Coffee,
  CheckCircle2,
  Heart,
  Share2,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { LanguageType } from '../types';
import { SembunyiLogo } from './SembunyiLogo';

interface AboutCafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageType;
}

export const GOOGLE_MAPS_URL = 'https://share.google/Ns5TlAdbepig8uRDU';
export const WHATSAPP_PHONE = '+60173574029';
export const WHATSAPP_DISPLAY = '017-357 4029';
export const CAFE_ADDRESS = 'Kampung Tradisi, 06010 Changlun, Kedah Darul Aman, Malaysia';

export const AboutCafeModal: React.FC<AboutCafeModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;
  const isMs = language === 'ms';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SEMBUNYI COFFEE & EATERY (Changlun, Kedah)',
          text: 'Jom santai & lepak minum kopi di SEMBUNYI COFFEE & EATERY, Kampung Tradisi, Changlun, Kedah!',
          url: GOOGLE_MAPS_URL,
        });
      } catch {
        // Ignore abort
      }
    } else {
      navigator.clipboard?.writeText(GOOGLE_MAPS_URL);
      alert(isMs ? 'Pautan lokasi Google Maps telah disalin!' : 'Google Maps location link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Hero */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border-b border-amber-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-2 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-xl ring-2 ring-amber-400/40 shrink-0">
              <SembunyiLogo className="w-12 h-12 text-slate-950" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Kampung Tradisi, Changlun, Kedah</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                SEMBUNYI COFFEE & EATERY
              </h2>
              <p className="text-xs text-amber-200/90 font-medium italic mt-0.5">
                sembunyi. coffee & eatery — "Good Food ✦ Good Coffee ✦ Good Vibes ♡"
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Tagline / Philosophy Quote */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
            <Heart className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">
                {isMs
                  ? '"Makanan & kopi enak lahir dari rasa kasih sayang dan jiwa yang tenang."'
                  : '"Quality coffee and comforting food crafted with passion and peaceful vibes."'}
              </p>
              <p className="text-[11px] text-amber-300/80 mt-1">
                {isMs
                  ? 'Falsafah SEMBUNYI COFFEE & EATERY — menyajikan suasana santai (*chill vibes*) di perkampungan damai untuk lepak, bekerja, berbual mesra, dan menikmati kopi premium serta aneka hidangan memikat selera.'
                  : 'The essence of SEMBUNYI COFFEE & EATERY — delivering a serene hideaway for friends, students, and families to unwind over artisanal brews and hearty meals.'}
              </p>
            </div>
          </div>

          {/* Location & Google Maps Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{isMs ? 'Lokasi & Pandu Arah' : 'Location & Navigation'}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Changlun, Kedah
              </span>
            </div>

            <p className="text-slate-200 font-semibold text-xs leading-normal">
              {CAFE_ADDRESS}
            </p>

            <p className="text-slate-400 text-xs">
              {isMs
                ? 'Terletak di kawasan damai Kampung Tradisi, Changlun, Kedah (berdekatan laluan Changlun - Sintok / UUM). Suasana redup kampung tradisional dengan tempat letak kenderaan yang selesa.'
                : 'Located in the peaceful surroundings of Kampung Tradisi, Changlun, Kedah (near Changlun - Sintok / UUM route). Traditional village tranquility with convenient parking.'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{isMs ? 'Buka di Google Maps' : 'Open in Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_PHONE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  isMs
                    ? 'Salam SEMBUNYI COFFEE & EATERY! Saya ingin bertanya tentang meja atau menu.'
                    : 'Hello SEMBUNYI COFFEE & EATERY! I would like to inquire about tables or the menu.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
              </a>

              <button
                onClick={handleShare}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title={isMs ? 'Kongsi Pautan' : 'Share Link'}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{isMs ? 'Waktu Operasi Kafe' : 'Cafe Operating Hours'}</span>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isMs ? 'Buka Setiap Hari (Kecuali Rabu)' : 'Open Daily (Except Wednesday)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">
                    {isMs ? 'Khamis — Selasa (Setiap Hari)' : 'Thursday — Tuesday (Daily)'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {isMs ? 'Dibuka' : 'Open'}
                  </span>
                </div>
                <p className="text-amber-300 font-black text-base sm:text-lg">5:00 PM — 12:00 AM</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  {isMs
                    ? 'Waktu makan malam santai, minum kopi segar & lepak santai hingga tengah malam.'
                    : 'Evening dinner sessions, fresh coffee & relaxed midnight hangout.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">
                    {isMs ? 'Rabu' : 'Wednesday'}
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                    {isMs ? 'Tutup (Cuti)' : 'Closed'}
                  </span>
                </div>
                <p className="text-rose-400 font-black text-base sm:text-lg">
                  {isMs ? 'TUTUP (CUTI MINGGUAN)' : 'CLOSED (WEEKLY BREAK)'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isMs
                    ? 'Hari rehat mingguan staf kafe & persediaan ramuan dapur segar.'
                    : 'Weekly staff break and replenishment of fresh kitchen ingredients.'}
                </p>
              </div>
            </div>
          </div>

          {/* Dual Kitchen Station Concept */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>{isMs ? 'Konsep 2 Kaunter Masakan Unik' : 'Unique Dual Counter Dining Concept'}</span>
            </h4>
            <p className="text-slate-400 text-xs">
              {isMs
                ? 'Sistem SmartDinePlus mengasingkan pesanan anda kepada 2 stesen dapur khas supaya hidangan dimasak pantas dan segar:'
                : 'SmartDinePlus routes your orders automatically to 2 dedicated kitchen stations for optimal freshness & speed:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 block">Stesen 1</span>
                    <h5 className="font-extrabold text-xs text-white">Kaunter 1 (Kafe Sembunyi)</h5>
                  </div>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 mt-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Kopi artisanal & matcha latte</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Pasta Itali berkrim & pizza</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Croffle rangup, waffle & pastry</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Minuman sparkling segar berkarbonat</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-rose-950/30 border border-rose-500/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-400 block">Stesen 2</span>
                    <h5 className="font-extrabold text-xs text-white">Kaunter 2 (Sembunyi Burgers & Grill)</h5>
                  </div>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 mt-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Chicken Chop & Lamb Chop bersos lada hitam</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Sembunyi smash burgers & cheese leleh</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Fries goncang & snek bakar</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Set nasi goreng panas Sembunyi</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Amenities & Highlights */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="font-extrabold text-white text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isMs ? 'Kemudahan & Keistimewaan Kafe' : 'Amenities & Cafe Features'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                <span>🚗</span>
                <span className="font-medium">Parkir Luas & Percuma</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                <span>🕌</span>
                <span className="font-medium">Ruang Solat / Surau</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                <span>🌿</span>
                <span className="font-medium">Suasana Santai Kampung</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                <span>📱</span>
                <span className="font-medium">Pesanan Kod QR Pintar</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                <span>👨‍👩‍👧‍👦</span>
                <span className="font-medium">Mesra Keluarga</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                <span>💳</span>
                <span className="font-medium">DuitNow QR & Tunai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>{isMs ? 'Buka di Google Maps' : 'Open in Google Maps'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
          >
            {isMs ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
