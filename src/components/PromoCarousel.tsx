import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Star, 
  ShoppingBag, 
  ArrowRight,
  BadgePercent,
  ChefHat
} from 'lucide-react';
import { MenuItem, LanguageType } from '../types';
import { SafeImage } from './SafeImage';

export interface PromoSlide {
  id: string;
  menuItemId?: string;
  badgeMs: string;
  badgeEn: string;
  badgeColor: string; // Tailwind color class
  taglineMs: string;
  taglineEn: string;
  titleMs: string;
  titleEn: string;
  descriptionMs: string;
  descriptionEn: string;
  priceDisplay: string;
  originalPrice?: string;
  imageUrl: string;
  category: string;
  accentGradient: string;
}

interface PromoCarouselProps {
  menu: MenuItem[];
  language: LanguageType;
  onSelectItem: (item: MenuItem) => void;
}

const DEFAULT_PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'promo-1',
    menuItemId: 'md-1',
    badgeMs: '🔥 SIGNATURE WAJIB CUBA',
    badgeEn: "🔥 CHEF'S SIGNATURE",
    badgeColor: 'from-amber-500 to-orange-600',
    taglineMs: 'Sos Blackpepper Homemade Istimewa',
    taglineEn: 'Signature Homemade Blackpepper Sauce',
    titleMs: 'Crispy Chicken Chop Bento Set',
    titleEn: 'Crispy Chicken Chop Bento Set',
    descriptionMs: 'Peha ayam goreng rangup keemasan disiram kuah sos lada hitam beraroma bersama kentang goreng berempah & coleslaw segar!',
    descriptionEn: 'Golden crispy chicken chop drenched in savory homemade black pepper sauce, served with seasoned fries and crunchy coleslaw.',
    priceDisplay: 'RM 14.90',
    imageUrl: '/images/chicken_chop_dish.jpg',
    category: 'main_dish',
    accentGradient: 'from-amber-950/80 via-slate-900/90 to-slate-950'
  },
  {
    id: 'promo-2',
    menuItemId: 'pa-1',
    badgeMs: '🧀 CHEESY & CREAMY',
    badgeEn: '🧀 CHEESY & CREAMY',
    badgeColor: 'from-yellow-400 to-amber-500',
    taglineMs: 'Limpahan Sos Keju Cheddar Asli',
    taglineEn: 'Rich Golden Cheddar Cheese Melt',
    titleMs: 'Golden Mac and Cheese',
    titleEn: 'Golden Mac and Cheese',
    descriptionMs: 'Makaroni lembut diadun pekat bersama sos keju bakar, cendawan butang empuk dan taburan herba parsli.',
    descriptionEn: 'Tender elbow macaroni tossed in velvety golden cheese sauce, topped with button mushrooms and fragrant parsley.',
    priceDisplay: 'RM 11.90',
    imageUrl: '/images/mac_and_cheese.jpg',
    category: 'pasta',
    accentGradient: 'from-yellow-950/80 via-slate-900/90 to-slate-950'
  },
  {
    id: 'promo-3',
    menuItemId: 'md-2',
    badgeMs: '🥩 GRILLED TO PERFECTION',
    badgeEn: '🥩 GRILLED TO PERFECTION',
    badgeColor: 'from-rose-500 to-red-600',
    taglineMs: 'Ayam Panggang Herba Lembut Berjus',
    taglineEn: 'Juicy Herb-Marinated Boneless Thigh',
    titleMs: 'Grilled Chicken with Blackpepper',
    titleEn: 'Grilled Chicken with Blackpepper',
    descriptionMs: 'Ayam panggang tanpa tulang diperap herba terpilih, dipanggang sempurna dengan aroma asap memikat!',
    descriptionEn: 'Succulent boneless chicken thigh grilled with aromatic herbs, glazed with rich homemade black pepper gravy.',
    priceDisplay: 'RM 15.90',
    imageUrl: '/images/grilled_chicken_dish.jpg',
    category: 'main_dish',
    accentGradient: 'from-red-950/80 via-slate-900/90 to-slate-950'
  },
  {
    id: 'promo-4',
    menuItemId: 'cr-2',
    badgeMs: '🥐 DESSERT OF THE DAY',
    badgeEn: '🥐 DESSERT OF THE DAY',
    badgeColor: 'from-amber-600 to-amber-800',
    taglineMs: 'Kombinasi Croissant & Waffle Rangup',
    taglineEn: 'Crispy Caramelized Croissant Waffle',
    titleMs: 'Chocolate Croffle & Waffle',
    titleEn: 'Chocolate Croffle & Waffle',
    descriptionMs: 'Croffle rangup gebu dibakar panas dengan limpahan coklat premium pekat. Manis memikat selera!',
    descriptionEn: 'Crispy warm croffle drizzled with rich decadent Belgian chocolate syrup for the ultimate sweet indulgence.',
    priceDisplay: 'RM 7.00',
    imageUrl: '/images/chocolate_croffle_waffle.jpg',
    category: 'croffle_pastry',
    accentGradient: 'from-amber-950/90 via-stone-900 to-slate-950'
  },
  {
    id: 'promo-5',
    menuItemId: 'pa-3',
    badgeMs: '🍝 TASTE OF ITALY',
    badgeEn: '🍝 TASTE OF ITALY',
    badgeColor: 'from-emerald-500 to-teal-600',
    taglineMs: 'Daging Cincang Lembu Segar & Tomato',
    taglineEn: 'Slow-Cooked Minced Beef & Herb Ragu',
    titleMs: 'De Ferrari Beef Bolognese',
    titleEn: 'De Ferrari Beef Bolognese',
    descriptionMs: 'Spaghetti al-dente disalut sos daging bolognese pekat beraroma herba oregano dan keju parmesan parut.',
    descriptionEn: 'Authentic pasta tossed with hearty minced beef bolognese ragu, simmered with vine-ripened tomatoes and parmesan.',
    priceDisplay: 'RM 13.90',
    imageUrl: '/images/de_ferrari_beef_bolognese.jpg',
    category: 'pasta',
    accentGradient: 'from-emerald-950/80 via-slate-900/90 to-slate-950'
  }
];

export const PromoCarousel: React.FC<PromoCarouselProps> = ({
  menu,
  language,
  onSelectItem
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isMs = language === 'ms';
  const slides = DEFAULT_PROMO_SLIDES;

  const nextSlide = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, slides.length]);

  const currentSlide = slides[currentIndex];

  const handleOrderClick = () => {
    if (!currentSlide.menuItemId) return;
    const foundDish = menu.find((item) => item.id === currentSlide.menuItemId);
    if (foundDish) {
      onSelectItem(foundDish);
    }
  };

  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 80 : -80,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 }
      }
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 bg-slate-950 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Slide Presentation with AnimatePresence */}
      <div className="relative min-h-[340px] sm:min-h-[290px] md:min-h-[300px] flex items-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full p-5 sm:p-7 md:p-8"
          >
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-8">
              
              {/* Left Column: Text, Slogan, Tag & CTA */}
              <div className="flex-1 space-y-3.5 text-left w-full">
                {/* Badge Tag */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${currentSlide.badgeColor} shadow-md uppercase tracking-wider`}>
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>{isMs ? currentSlide.badgeMs : currentSlide.badgeEn}</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    {isMs ? currentSlide.taglineMs : currentSlide.taglineEn}
                  </span>
                </div>

                {/* Main Headline */}
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {isMs ? currentSlide.titleMs : currentSlide.titleEn}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-2 max-w-xl font-normal">
                    {isMs ? currentSlide.descriptionMs : currentSlide.descriptionEn}
                  </p>
                </div>

                {/* Price & Order Action Bar */}
                <div className="pt-2 flex items-center gap-4 flex-wrap">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {currentSlide.priceDisplay}
                    </span>
                    {currentSlide.originalPrice && (
                      <span className="text-xs text-slate-500 line-through">
                        {currentSlide.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleOrderClick}
                    className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isMs ? 'Pesan & Tambah ke Troli' : 'Order & Add to Cart'}</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Hero High-Res Food Visual Card with Glow */}
              <div 
                onClick={handleOrderClick}
                className="relative w-full md:w-80 lg:w-96 h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden cursor-pointer shrink-0 shadow-2xl border border-slate-700/60 group/card"
              >
                <SafeImage
                  src={currentSlide.imageUrl}
                  alt={isMs ? currentSlide.titleMs : currentSlide.titleEn}
                  category={currentSlide.category}
                  className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />

                {/* Overlay Floating Tag */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/30 px-3 py-1 rounded-xl text-amber-300 font-extrabold text-xs shadow-lg">
                    ✨ Sembunyi Cafe Special
                  </div>
                  <div className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-xl text-xs shadow-md">
                    {currentSlide.priceDisplay}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrow Buttons */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700/60 flex items-center justify-center backdrop-blur-md shadow-xl opacity-80 hover:opacity-100 transition-all z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700/60 flex items-center justify-center backdrop-blur-md shadow-xl opacity-80 hover:opacity-100 transition-all z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom Dots / Slide Progress Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-3 py-1 bg-slate-950/60 backdrop-blur-md rounded-full border border-slate-800">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'w-7 bg-amber-400 shadow-sm shadow-amber-500/50' 
                  : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
