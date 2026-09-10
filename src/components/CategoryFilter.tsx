import React from 'react';
import { Search, Sparkles, Utensils, Coffee, Pizza, Flame, Layers, Heart, Cookie, CupSoda, Sandwich, Drumstick, Soup, Beef } from 'lucide-react';
import { CategoryType, LanguageType } from '../types';

interface CategoryFilterProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  spicyOnly: boolean;
  onToggleSpicy: () => void;
  vegOnly: boolean;
  onToggleVeg: () => void;
  selectedStation?: 'all' | 'cashier_1' | 'cashier_2';
  onSelectStation?: (station: 'all' | 'cashier_1' | 'cashier_2') => void;
  language: LanguageType;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  spicyOnly,
  onToggleSpicy,
  vegOnly,
  onToggleVeg,
  selectedStation = 'all',
  onSelectStation,
  language,
}) => {
  const isMs = language === 'ms';

  const categories: { id: CategoryType; labelMs: string; labelEn: string; icon: any; stationBadge?: string }[] = [
    { id: 'semua', labelMs: 'Semua Menu', labelEn: 'All Menu', icon: Layers },
    // Kaunter 2: Sembunyi Burgers & Western
    { id: 'sembunyi_burger', labelMs: '🍔 Sembunyi Burgers', labelEn: '🍔 Sembunyi Burgers', icon: Sandwich, stationBadge: 'Kaunter 2' },
    { id: 'maggie_samyang', labelMs: '🍜 Maggie & Samyang', labelEn: '🍜 Maggie & Samyang', icon: Soup, stationBadge: 'Kaunter 2' },
    { id: 'chicken_wings', labelMs: '🍗 Chicken & Wings', labelEn: '🍗 Chicken & Wings', icon: Drumstick, stationBadge: 'Kaunter 2' },
    { id: 'fries_goncang', labelMs: '🍟 Fries Goncang', labelEn: '🍟 Shaker Fries', icon: Flame, stationBadge: 'Kaunter 2' },
    { id: 'sembunyi_snack', labelMs: '🍢 Sembunyi Snack', labelEn: '🍢 Sembunyi Snacks', icon: Flame, stationBadge: 'Kaunter 2' },
    { id: 'western_grill', labelMs: '🥩 Lambchop & Grill', labelEn: '🥩 Lambchop & Grill', icon: Beef, stationBadge: 'Kaunter 2' },
    // Kaunter 1: Kafe Sembunyi
    { id: 'main_dish', labelMs: 'Western Chop (Kafe)', labelEn: 'Western Chops', icon: Utensils, stationBadge: 'Kaunter 1' },
    { id: 'pasta', labelMs: 'Pasta Milano', labelEn: 'Pasta Milano', icon: Sandwich, stationBadge: 'Kaunter 1' },
    { id: 'rice_set', labelMs: 'Rice Set', labelEn: 'Rice Set', icon: Utensils, stationBadge: 'Kaunter 1' },
    { id: 'pizza', labelMs: 'Pizza Milano', labelEn: 'Pizza Milano', icon: Pizza, stationBadge: 'Kaunter 1' },
    { id: 'side_snack', labelMs: 'Sides (Kafe)', labelEn: 'Cafe Sides', icon: Flame, stationBadge: 'Kaunter 1' },
    { id: 'croffle_pastry', labelMs: 'Croffle & Pastri', labelEn: 'Croffle & Pastries', icon: Cookie, stationBadge: 'Kaunter 1' },
    { id: 'coffee', labelMs: 'Coffee (Kopi)', labelEn: 'Coffee', icon: Coffee, stationBadge: 'Kaunter 1' },
    { id: 'non_coffee', labelMs: 'Non Coffee / Matcha', labelEn: 'Non Coffee & Matcha', icon: Sparkles, stationBadge: 'Kaunter 1' },
    { id: 'sparkling_refresher', labelMs: 'Sparkling & Minuman', labelEn: 'Sparkling & Drinks', icon: CupSoda, stationBadge: 'Kaunter 1' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Input Bar & Quick Dietary Filter Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isMs ? 'Cari menu Sembunyi...' : 'Search Sembunyi dishes...'}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
          />
        </div>

        {/* Dietary Constraint Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs no-scrollbar">
          <button
            onClick={onToggleSpicy}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              spicyOnly
                ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isMs ? 'Pedas' : 'Spicy'}</span>
          </button>

          <button
            onClick={onToggleVeg}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              vegOnly
                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Vegetarian</span>
          </button>
        </div>
      </div>

      {/* Counter / Cashier Station Filter Banner */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => {
            if (onSelectStation) onSelectStation('all');
          }}
          className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            selectedStation === 'all'
              ? 'bg-slate-100 text-slate-950 border-white shadow-md'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isMs ? 'Semua Stesen' : 'All Counters'}</span>
        </button>

        <button
          onClick={() => {
            if (onSelectStation) onSelectStation('cashier_2');
          }}
          className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            selectedStation === 'cashier_2'
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/40'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-950/60'
          }`}
        >
          <span>🍔</span>
          <span>{isMs ? 'Kaunter 2: Sembunyi Burgers & Western' : 'Counter 2: Sembunyi Burgers & Western'}</span>
          <span className="bg-amber-900/80 text-amber-200 text-[10px] px-1.5 py-0.5 rounded font-black border border-amber-600/50">
            {isMs ? 'Bayar di Cashier 2' : 'Pay Cashier 2'}
          </span>
        </button>

        <button
          onClick={() => {
            if (onSelectStation) onSelectStation('cashier_1');
          }}
          className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            selectedStation === 'cashier_1'
              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md ring-2 ring-emerald-400/40'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white'
          }`}
        >
          <span>☕</span>
          <span>{isMs ? 'Kaunter 1: Kafe Sembunyi & Minuman' : 'Counter 1: Cafe & Drinks'}</span>
        </button>
      </div>

      {/* Horizontal Category Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar text-xs">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl border font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isMs ? cat.labelMs : cat.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
