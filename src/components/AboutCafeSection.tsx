import React from 'react';
import {
  MapPin,
  Clock,
  Compass,
  Phone,
  ExternalLink,
  Sparkles,
  Utensils,
  Coffee,
  Flame,
  ChevronRight,
  Heart,
  Info,
  Car,
  Trees,
} from 'lucide-react';
import { LanguageType } from '../types';
import { SembunyiLogo } from './SembunyiLogo';
import { GOOGLE_MAPS_URL, CAFE_ADDRESS, WHATSAPP_DISPLAY, WHATSAPP_PHONE } from './AboutCafeModal';

interface AboutCafeSectionProps {
  language: LanguageType;
  onOpenDetailsModal: () => void;
}

export const AboutCafeSection: React.FC<AboutCafeSectionProps> = ({
  language,
  onOpenDetailsModal,
}) => {
  const isMs = language === 'ms';

  return (
    <section id="about-cafe" className="scroll-mt-24 space-y-4">
      {/* Main Feature Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-2 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-xl ring-2 ring-amber-400/40 shrink-0">
                <SembunyiLogo className="w-12 h-12 text-slate-950" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black mb-1.5 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isMs ? 'Tentang Kafe Sembunyi' : 'About Sembunyi Cafe'}</span>
                  <span className="text-amber-500/60">•</span>
                  <span className="text-slate-300 text-[11px] font-semibold">Kampung Tradisi, Changlun, Kedah</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  SEMBUNYI COFFEE & EATERY
                </h3>
                <p className="text-amber-200/90 text-xs sm:text-sm font-medium italic mt-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>
                    {isMs
                      ? '"Good Food ✦ Good Coffee ✦ Good Vibes ♡"'
                      : '"Good Food ✦ Good Coffee ✦ Good Vibes ♡"'}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{isMs ? 'Buka Google Maps' : 'Open Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onOpenDetailsModal}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-amber-400" />
                <span>{isMs ? 'Kisah Penuh' : 'Full Story'}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Core Info Grid: Location, Hours, Philosophy, Dual Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Location & Google Maps */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-extrabold text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{isMs ? 'Lokasi Kafe' : 'Cafe Location'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Changlun, Kedah
                  </span>
                </div>
                <p className="text-slate-200 font-semibold text-xs leading-relaxed">
                  {CAFE_ADDRESS}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isMs
                    ? 'Suasana santai kampung tradisional di Kampung Tradisi, Changlun, Kedah (laluan ke UUM / Sintok). Tempat damai lepak kopi & makan bersama kawan serta keluarga.'
                    : 'Serene village ambiance in Kampung Tradisi, Changlun, Kedah (route to UUM / Sintok). A peaceful retreat for coffee and meals with friends & family.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-extrabold text-xs inline-flex items-center gap-1"
                >
                  <span>{isMs ? 'Pandu Arah Sekarang' : 'Get Directions'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-slate-500 font-mono">share.google</span>
              </div>
            </div>

            {/* Card 2: Operating Hours */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-extrabold text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{isMs ? 'Waktu Operasi' : 'Operating Hours'}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    5:00 PM — 12:00 AM
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {isMs ? 'Khamis — Selasa:' : 'Thursday — Tuesday:'}
                    </span>
                    <span className="text-emerald-400 font-black">5:00 PM — 12:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400">
                      {isMs ? 'Rabu (Cuti Mingguan):' : 'Wednesday (Weekly Off):'}
                    </span>
                    <span className="text-rose-400 font-bold">{isMs ? 'Tutup' : 'Closed'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  {isMs
                    ? 'Dibuka setiap hari kecuali hari Rabu. Sesi makan malam santai, minum kopi petang & lepak hingga tengah malam.'
                    : 'Open daily except Wednesday. Evening dinners, coffee sessions & late-night hangout.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    isMs
                      ? 'Salam SEMBUNYI COFFEE & EATERY! Saya ingin bertanya tentang tempahan meja atau menu.'
                      : 'Hello SEMBUNYI COFFEE & EATERY! I have a question about reservations or the menu.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
                </a>
              </div>
            </div>

            {/* Card 3: Dual Station Concept Highlight */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-extrabold text-xs sm:text-sm">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>{isMs ? '2 Kaunter Masakan Khas' : '2 Special Kitchen Counters'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                    SmartDine+
                  </span>
                </div>

                <div className="space-y-2 pt-0.5">
                  <div className="p-2 bg-slate-900 rounded-xl border border-amber-500/20 flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                      <Coffee className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px]">
                      <span className="font-extrabold text-white block">Kaunter 1 (Kafe Sembunyi)</span>
                      <span className="text-slate-400">Kopi, pasta Itali, croffle & sparkling</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-xl border border-rose-500/20 flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px]">
                      <span className="font-extrabold text-white block">Kaunter 2 (Sembunyi Burgers & Grill)</span>
                      <span className="text-slate-400">Chicken chop, lamb chop, smash burger</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={onOpenDetailsModal}
                  className="text-amber-400 hover:text-amber-300 font-extrabold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{isMs ? 'Ketahui Lebih Lanjut' : 'Learn More'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Facility Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMs ? 'Suasana Santai Kampung' : 'Cozy Village Vibes'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>{isMs ? 'Parkir Luas & Percuma' : 'Ample Free Parking'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
              <span>🕌</span>
              <span>{isMs ? 'Ruang Solat / Surau' : 'Surau Facility'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
              <span>👨‍👩‍👧‍👦</span>
              <span>{isMs ? 'Mesra Keluarga' : 'Family Friendly'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
              <span>📱</span>
              <span>{isMs ? 'Pesanan Kod QR Pintar' : 'Smart QR Ordering'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
