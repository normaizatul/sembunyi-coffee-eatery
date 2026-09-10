import React, { useState } from 'react';
import { 
  Gamepad2, 
  X, 
  Coffee, 
  Layers, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Utensils, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { BaristaRushGame } from './BaristaRushGame';
import { BurgerStackerGame } from './BurgerStackerGame';
import { FoodMemoryGame } from './FoodMemoryGame';
import { Order, LanguageType } from '../../types';
import { gameAudio } from '../../utils/gameAudio';

interface CafeMiniGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  language: LanguageType;
}

type GameTab = 'barista' | 'burger' | 'memory';

export const CafeMiniGamesModal: React.FC<CafeMiniGamesModalProps> = ({
  isOpen,
  onClose,
  order,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<GameTab>('barista');
  const [soundOn, setSoundOn] = useState(true);

  if (!isOpen) return null;

  const isMs = language === 'ms';

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    gameAudio.soundEnabled = newState;
    if (newState) gameAudio.playPop();
  };

  const handleTabChange = (tab: GameTab) => {
    setActiveTab(tab);
    gameAudio.playTap();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-amber-500/40 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>{isMs ? 'Permainan Santai Kafe Sembunyi' : 'Sembunyi Cafe Arcade'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {isMs ? '3 Permainan' : '3 Games'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isMs
                  ? 'Main permainan santai bertemakan makanan & kopi sementara pesanan anda disiapkan di dapur!'
                  : 'Fun food & cafe games while waiting for your order in the kitchen!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio sound toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? (isMs ? 'Matikan Bunyi' : 'Mute Sound') : (isMs ? 'Hidupkan Bunyi' : 'Unmute Sound')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Order Status Bar (If customer has active order) */}
        {order && (
          <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-slate-200">
                {isMs ? `Meja ${order.tableNumber} • Pesanan #${order.id}` : `Table ${order.tableNumber} • Order #${order.id}`}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {order.status === 'sedia'
                  ? (isMs ? '🍲 Sedia Dihidang!' : '🍲 Ready to Serve!')
                  : order.status === 'memasak'
                  ? (isMs ? '🍳 Sedang Dimasak di Dapur' : '🍳 Cooking in Kitchen')
                  : (isMs ? '⏳ Pesanan Diterima' : '⏳ Order Received')}
              </span>
            </div>

            {order.status === 'sedia' ? (
              <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMs ? 'Makanan Sedia!' : 'Food Ready!'}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>~{order.estimatedMinutes || 12} {isMs ? 'minit' : 'mins'}</span>
              </span>
            )}
          </div>
        )}

        {/* Game Navigation Tabs */}
        <div className="p-2 bg-slate-950 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleTabChange('barista')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'barista'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{isMs ? '1. Bancuh Kopi' : '1. Barista Rush'}</span>
          </button>

          <button
            onClick={() => handleTabChange('burger')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'burger'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isMs ? '2. Susun Burger' : '2. Burger Stacker'}</span>
          </button>

          <button
            onClick={() => handleTabChange('memory')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'memory'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{isMs ? '3. Padanan Menu' : '3. Food Memory'}</span>
          </button>
        </div>

        {/* Game Body Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-slate-950">
          {activeTab === 'barista' && <BaristaRushGame isMs={isMs} />}
          {activeTab === 'burger' && <BurgerStackerGame isMs={isMs} />}
          {activeTab === 'memory' && <FoodMemoryGame isMs={isMs} />}
        </div>
      </div>
    </div>
  );
};
