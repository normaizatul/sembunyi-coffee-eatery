import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Flame, Sparkles, Check, ShoppingBag } from 'lucide-react';
import { MenuItem, CartItem, SelectedOptions, CustomizeOption, LanguageType } from '../types';
import { SafeImage } from './SafeImage';

interface DishModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  language: LanguageType;
}

export const DishModal: React.FC<DishModalProps> = ({ item, onClose, onAddToCart, language }) => {
  const isMs = language === 'ms';

  const [quantity, setQuantity] = useState(1);
  const [selectedPatty, setSelectedPatty] = useState<string | undefined>(
    item?.customization?.pattyChoices ? item.customization.pattyChoices[0] : undefined
  );
  const [selectedTemperature, setSelectedTemperature] = useState<string | undefined>(
    item?.customization?.temperatures ? item.customization.temperatures[0] : undefined
  );
  const [selectedSpice, setSelectedSpice] = useState<string | undefined>(
    item?.customization?.spiceLevels ? item.customization.spiceLevels[0] : undefined
  );
  const [selectedSugar, setSelectedSugar] = useState<string | undefined>(
    item?.customization?.sugarLevels ? item.customization.sugarLevels[0] : undefined
  );
  const [selectedAddOns, setSelectedAddOns] = useState<CustomizeOption[]>([]);
  const [specialInstruction, setSpecialInstruction] = useState('');

  // Reset state on modal item change
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedPatty(item.customization?.pattyChoices ? item.customization.pattyChoices[0] : undefined);
      setSelectedTemperature(item.customization?.temperatures ? item.customization.temperatures[0] : undefined);
      setSelectedSpice(item.customization?.spiceLevels ? item.customization.spiceLevels[0] : undefined);
      setSelectedSugar(item.customization?.sugarLevels ? item.customization.sugarLevels[0] : undefined);
      setSelectedAddOns([]);
      setSpecialInstruction('');
    }
  }, [item]);

  if (!item) return null;

  const toggleAddOn = (addon: CustomizeOption) => {
    if (selectedAddOns.some((a) => a.id === addon.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.price + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const selectedOptions: SelectedOptions = {
      pattyChoice: selectedPatty,
      temperature: selectedTemperature,
      spiceLevel: selectedSpice,
      sugarLevel: selectedSugar,
      addOns: selectedAddOns,
      specialInstruction: specialInstruction.trim() || undefined,
    };

    const cartItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedOptions,
      unitPriceWithAddons: unitPrice,
      totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Header Image */}
        <div className="relative h-52 w-full bg-slate-950 shrink-0">
          <SafeImage
            src={item.imageUrl}
            alt={isMs ? item.nameMs : item.nameEn}
            category={item.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            {item.cashierStation === 'cashier_2' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 mb-1 shadow">
                🍔 Kaunter 2 (Sembunyi Burger & Grill) • Bayar di Cashier 2
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 mb-1">
                ☕ Kaunter 1 (Kafe Sembunyi)
              </span>
            )}
            <h2 className="text-xl font-bold text-white mb-1">
              {isMs ? item.nameMs : item.nameEn}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-extrabold text-emerald-400 text-lg">RM {item.price.toFixed(2)}</span>
              <span>•</span>
              <span>🔥 {item.calories} kcal</span>
              <span>•</span>
              <span>⏱️ {item.prepTimeMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            {isMs ? item.descriptionMs : item.descriptionEn}
          </p>

          {/* Patty Choices (e.g. Ayam / Daging / Mix) */}
          {item.customization?.pattyChoices && item.customization.pattyChoices.length > 0 && (
            <div>
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🥩</span>
                <span>{isMs ? 'Pilihan Daging / Patty (Wajib)' : 'Patty Choice (Required)'}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(item.customization.pattyChoices || []).map((patty) => {
                  const isSelected = selectedPatty === patty;
                  return (
                    <button
                      key={patty}
                      type="button"
                      onClick={() => setSelectedPatty(patty)}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold ring-2 ring-amber-400 shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{patty}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Temperature Option (Hot / Cold) */}
          {item.customization?.temperatures && item.customization.temperatures.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 block">
                {isMs ? 'Pilihan Suhu (Temperature)' : 'Temperature Option'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(item.customization.temperatures || []).map((temp) => {
                  const isSelected = selectedTemperature === temp;
                  const isHot = temp.toLowerCase().includes('panas') || temp.toLowerCase().includes('hot');
                  return (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setSelectedTemperature(temp)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border transition-all text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? isHot
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold ring-1 ring-amber-500'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold ring-1 ring-cyan-500'
                          : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{isHot ? '🔥' : '🧊'}</span>
                      <span>{temp}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spice Level Option */}
          {item.customization?.spiceLevels && item.customization.spiceLevels.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>{isMs ? 'Tahap Kepedasan' : 'Spice Level'}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(item.customization.spiceLevels || []).map((lvl) => {
                  const isSelected = selectedSpice === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedSpice(lvl)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                        isSelected
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold ring-1 ring-rose-500'
                          : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sugar Level Option */}
          {item.customization?.sugarLevels && item.customization.sugarLevels.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 block">
                {isMs ? 'Tahap Manis / Gula' : 'Sweetness Level'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(item.customization.sugarLevels || []).map((sug) => {
                  const isSelected = selectedSugar === sug;
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSelectedSugar(sug)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold ring-1 ring-emerald-500'
                          : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      {sug}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-Ons */}
          {item.customization?.addOns && item.customization.addOns.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 block">
                {isMs ? 'Tambahan Suapan (Add-Ons)' : 'Optional Add-Ons'}
              </label>
              <div className="space-y-2">
                {(item.customization.addOns || []).map((addon) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon)}
                      className={`w-full p-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{isMs ? addon.nameMs : addon.nameEn}</span>
                      </div>
                      <span className="font-bold text-emerald-400">+RM {addon.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instruction */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 block">
              {isMs ? 'Nota / Arahan Khas Kepada Dapur' : 'Special Notes for Kitchen'}
            </label>
            <textarea
              value={specialInstruction}
              onChange={(e) => setSpecialInstruction(e.target.value)}
              placeholder={isMs ? 'Contoh: Kurang ais, asingkan sos, tanpa bawang...' : 'e.g., Less ice, separate sauce, no onion...'}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-white">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>{isMs ? 'Tambah Pesanan' : 'Add to Order'}</span>
            </span>
            <span className="text-sm font-black">RM {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
