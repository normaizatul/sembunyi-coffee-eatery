import React from 'react';
import { Flame, Clock, Plus, Sparkles, AlertCircle, HeartHandshake } from 'lucide-react';
import { MenuItem, LanguageType } from '../types';
import { SafeImage } from './SafeImage';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  language: LanguageType;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect, language }) => {
  const isMs = language === 'ms';

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col cursor-pointer relative"
    >
      {/* Food Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <SafeImage
          src={item.imageUrl}
          alt={isMs ? item.nameMs : item.nameEn}
          category={item.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.cashierStation === 'cashier_2' ? (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-amber-300">
              <span>🍔</span>
              <span>KAUNTER 2</span>
            </span>
          ) : (
            <span className="bg-slate-900/85 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow-md">
              Kafe Sembunyi
            </span>
          )}
          {item.isPopular && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>POPULAR</span>
            </span>
          )}
          {item.isSpicy && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>PEDAS</span>
            </span>
          )}
          {item.isHalal && (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              HALAL
            </span>
          )}
        </div>

        {/* Estimated Preparation Time Badge */}
        <div
          className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700/80 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md"
          title={isMs ? 'Anggaran masa penyediaan' : 'Estimated preparation time'}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isMs ? 'Anggaran siap' : 'Est. ready'}: {item.prepTimeMinutes} min
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors text-base line-clamp-1">
              {isMs ? item.nameMs : item.nameEn}
            </h3>
          </div>

          <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
            {isMs ? item.descriptionMs : item.descriptionEn}
          </p>
        </div>

        {/* Footer Info & Action */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-400">
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
              🔥 {item.calories} kcal
            </span>
            {item.allergens && item.allergens.length > 0 && (
              <span className="text-amber-400/90 truncate flex items-center gap-1" title={item.allergens.join(', ')}>
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{item.allergens[0]}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Harga</span>
              <span className="text-lg font-black text-emerald-400">
                RM {item.price.toFixed(2)}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1 text-xs group-hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isMs ? 'Pilih' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
