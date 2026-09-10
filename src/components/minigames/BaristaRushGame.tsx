import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Flame, RotateCcw, Trophy, Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { gameAudio } from '../../utils/gameAudio';

interface Ingredient {
  id: string;
  nameMs: string;
  nameEn: string;
  color: string;
  icon: string;
}

interface DrinkRecipe {
  id: string;
  nameMs: string;
  nameEn: string;
  description: string;
  ingredients: string[]; // array of 3 ingredient IDs in sequence
  cupColor: string;
}

const INGREDIENTS: Ingredient[] = [
  { id: 'espresso', nameMs: 'Espresso Kaw', nameEn: 'Espresso Shot', color: '#451a03', icon: '☕' },
  { id: 'milk', nameMs: 'Susu Segar', nameEn: 'Fresh Milk', color: '#fef08a', icon: '🥛' },
  { id: 'matcha', nameMs: 'Serbuk Matcha Uji', nameEn: 'Matcha Powder', color: '#15803d', icon: '🍵' },
  { id: 'caramel', nameMs: 'Sirap Karamel', nameEn: 'Caramel Syrup', color: '#d97706', icon: '🍯' },
  { id: 'chocolate', nameMs: 'Coklat Pekat', nameEn: 'Melted Choco', color: '#78350f', icon: '🍫' },
  { id: 'ice', nameMs: 'Ketul Ais', nameEn: 'Ice Cubes', color: '#93c5fd', icon: '🧊' },
];

const DRINKS: DrinkRecipe[] = [
  {
    id: 'latte',
    nameMs: 'Sembunyi Signature Latte',
    nameEn: 'Sembunyi Signature Latte',
    description: 'Espresso Kaw ➔ Susu Segar ➔ Sirap Karamel',
    ingredients: ['espresso', 'milk', 'caramel'],
    cupColor: '#f59e0b',
  },
  {
    id: 'matcha_latte',
    nameMs: 'Iced Matcha Green Tea',
    nameEn: 'Iced Matcha Green Tea',
    description: 'Serbuk Matcha Uji ➔ Susu Segar ➔ Ketul Ais',
    ingredients: ['matcha', 'milk', 'ice'],
    cupColor: '#10b981',
  },
  {
    id: 'mocha',
    nameMs: 'Double Choco Mocha',
    nameEn: 'Double Choco Mocha',
    description: 'Coklat Pekat ➔ Espresso Kaw ➔ Susu Segar',
    ingredients: ['chocolate', 'espresso', 'milk'],
    cupColor: '#b45309',
  },
  {
    id: 'iced_caramel',
    nameMs: 'Iced Caramel Macchiato',
    nameEn: 'Iced Caramel Macchiato',
    description: 'Espresso Kaw ➔ Ketul Ais ➔ Sirap Karamel',
    ingredients: ['espresso', 'ice', 'caramel'],
    cupColor: '#f59e0b',
  },
  {
    id: 'iced_chocolate',
    nameMs: 'Belgian Choco Float',
    nameEn: 'Belgian Choco Float',
    description: 'Coklat Pekat ➔ Susu Segar ➔ Ketul Ais',
    ingredients: ['chocolate', 'milk', 'ice'],
    cupColor: '#92400e',
  },
  {
    id: 'matcha_espresso',
    nameMs: 'Dirty Matcha Espresso',
    nameEn: 'Dirty Matcha Espresso',
    description: 'Serbuk Matcha Uji ➔ Susu Segar ➔ Espresso Kaw',
    ingredients: ['matcha', 'milk', 'espresso'],
    cupColor: '#059669',
  },
];

interface BaristaRushGameProps {
  isMs: boolean;
}

export const BaristaRushGame: React.FC<BaristaRushGameProps> = ({ isMs }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [currentDrinkIndex, setCurrentDrinkIndex] = useState(0);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sembunyi_game_barista_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {
      // Ignore
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            gameAudio.playVictory();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('sembunyi_game_barista_highscore', score.toString());
      } catch {
        // Ignore
      }
    }
  }, [score, highScore]);

  const handleStartGame = () => {
    setIsPlaying(true);
    setTimeLeft(40);
    setScore(0);
    setCombo(1);
    setSelectedIngredients([]);
    setCurrentDrinkIndex(Math.floor(Math.random() * DRINKS.length));
    setFeedback(null);
    gameAudio.playPop();
  };

  const currentDrink = DRINKS[currentDrinkIndex];

  const handleSelectIngredient = (ingredientId: string) => {
    if (!isPlaying) return;

    gameAudio.playTap();
    const newIngredients = [...selectedIngredients, ingredientId];
    setSelectedIngredients(newIngredients);

    // If reached 3 ingredients, validate recipe!
    if (newIngredients.length === 3) {
      const isCorrect =
        newIngredients.length === currentDrink.ingredients.length &&
        newIngredients.every((val, index) => val === currentDrink.ingredients[index]);

      if (isCorrect) {
        // Correct order!
        gameAudio.playSuccess();
        const pts = 100 * combo;
        setScore((prev) => prev + pts);
        setCombo((prev) => Math.min(prev + 1, 5));
        setFeedback({
          message: isMs ? `Bancuhan Sempurna! +${pts} mata (${combo}x Kombo)` : `Perfect Brew! +${pts} pts (${combo}x Combo)`,
          type: 'success',
        });

        setTimeout(() => {
          setSelectedIngredients([]);
          setFeedback(null);
          // Pick next random drink
          let nextIdx = Math.floor(Math.random() * DRINKS.length);
          if (nextIdx === currentDrinkIndex) nextIdx = (nextIdx + 1) % DRINKS.length;
          setCurrentDrinkIndex(nextIdx);
        }, 500);
      } else {
        // Wrong recipe
        gameAudio.playError();
        setCombo(1);
        setFeedback({
          message: isMs ? 'Resipi Kurang Tepat! Kopi tertumpah...' : 'Wrong recipe! Try again...',
          type: 'error',
        });

        setTimeout(() => {
          setSelectedIngredients([]);
          setFeedback(null);
        }, 600);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Bar: Stats & Controls */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-xs font-black text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl text-xs font-bold text-white">
            <span>{isMs ? 'Mata:' : 'Score:'}</span>
            <span className="text-amber-400 font-black">{score}</span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
              <Flame className="w-3 h-3 fill-slate-950" />
              <span>{combo}x {isMs ? 'Kombo!' : 'Combo!'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{isMs ? 'Rekod:' : 'High:'}</span>
            <span className="font-bold text-slate-200">{highScore}</span>
          </div>

          <button
            onClick={handleStartGame}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isPlaying ? (isMs ? 'Mula Semula' : 'Restart') : (isMs ? 'Mula Main' : 'Start')}</span>
          </button>
        </div>
      </div>

      {/* Main Playing Area */}
      {!isPlaying && timeLeft === 40 ? (
        /* Welcome Splash */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800/80 rounded-2xl text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 animate-pulse">
            ☕
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{isMs ? 'Bancuhan Pantas Barista' : 'Barista Brew Rush'}</h3>
            <p className="text-xs text-amber-300 font-semibold mt-1">
              {isMs ? 'Bancuh Kopi Sembunyi Sepantas Kilat!' : 'Craft specialty coffee orders as fast as you can!'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
              {isMs
                ? 'Pesanan kopi kafe akan muncul. Tekan 3 bahan mengikut turutan resipi yang betul sebelum masa 40 saat tamat!'
                : 'Customer coffee tickets will appear. Tap 3 ingredients in the right sequence to serve as many drinks as possible!'}
            </p>
          </div>

          <button
            onClick={handleStartGame}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105"
          >
            <Coffee className="w-4 h-4" />
            <span>{isMs ? 'Mula Membancuh Kopi! (40 Saat)' : 'Start Brewing! (40 Seconds)'}</span>
          </button>
        </div>
      ) : !isPlaying && timeLeft === 0 ? (
        /* Game Over Scorecard */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <div>
            <h3 className="text-2xl font-black text-white">{isMs ? 'Masa Telah Tamat!' : 'Time is Up!'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isMs ? 'Tahniah! Pesanan hidangan anda di dapur semakin siap.' : 'Great job! Your food in the kitchen is also getting ready.'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 w-full max-w-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isMs ? 'Mata Keseluruhan:' : 'Final Score:'}</span>
              <span className="text-lg font-black text-amber-400">{score} {isMs ? 'mata' : 'pts'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isMs ? 'Rekod Tertinggi:' : 'High Score:'}</span>
              <span className="font-bold text-white">{highScore} {isMs ? 'mata' : 'pts'}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-semibold">
              {score >= 600
                ? (isMs ? '🏆 Gelaran: Jaguh Barista Sembunyi!' : '🏆 Rank: Sembunyi Master Barista!')
                : score >= 300
                ? (isMs ? '⭐ Gelaran: Barista Berbakat!' : '⭐ Rank: Skilled Barista!')
                : (isMs ? '☕ Gelaran: Barista Pelatih!' : '☕ Rank: Barista Apprentice!')}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            {isMs ? 'Main Pusingan Baharu' : 'Play New Round'}
          </button>
        </div>
      ) : (
        /* Active Game Interface */
        <div className="flex-1 flex flex-col space-y-3">
          {/* Order Ticket Card */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border-2 border-amber-500/40 p-4 rounded-2xl relative shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{isMs ? 'Pesanan Semasa' : 'Current Order'}</span>
              </span>
              <span className="text-xs text-slate-400">
                {isMs ? 'Langkah' : 'Step'}: <strong className="text-white">{selectedIngredients.length} / 3</strong>
              </span>
            </div>

            <h4 className="text-lg font-black text-white tracking-tight">
              {isMs ? currentDrink.nameMs : currentDrink.nameEn}
            </h4>

            {/* Target recipe steps */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">{isMs ? 'Resipi:' : 'Recipe:'}</span>
              {currentDrink.ingredients.map((ingId, idx) => {
                const ing = INGREDIENTS.find((i) => i.id === ingId);
                const isCompleted = selectedIngredients.length > idx && selectedIngredients[idx] === ingId;
                const isCurrent = selectedIngredients.length === idx;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isCurrent
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse ring-1 ring-amber-400/50'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span>{ing?.icon}</span>
                    <span>{idx + 1}. {isMs ? ing?.nameMs : ing?.nameEn}</span>
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Animated Cup Canvas Display */}
          <div className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-3 relative min-h-[140px]">
            {/* Feedback notification popup */}
            {feedback && (
              <div
                className={`absolute top-2 z-10 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg animate-bounce ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Visual Coffee Cup with Layers */}
            <div className="relative w-24 h-28 bg-slate-800/40 border-2 border-slate-600 rounded-b-2xl rounded-t-sm flex flex-col-reverse p-1.5 overflow-hidden shadow-inner">
              {/* Coffee fill layers */}
              {selectedIngredients.map((ingId, idx) => {
                const ing = INGREDIENTS.find((i) => i.id === ingId);
                return (
                  <div
                    key={idx}
                    style={{ backgroundColor: ing?.color || '#d97706' }}
                    className="w-full h-8 rounded-sm opacity-90 transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  >
                    {ing?.icon}
                  </div>
                );
              })}
              {selectedIngredients.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-500 font-semibold italic">
                  {isMs ? 'Cawan Kosong' : 'Empty Cup'}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              {selectedIngredients.length === 0
                ? (isMs ? 'Pilih bahan pertama di bawah 👇' : 'Pick the first ingredient below 👇')
                : (isMs ? `Bahan ${selectedIngredients.length} / 3 ditambah...` : `Ingredient ${selectedIngredients.length} / 3 added...`)}
            </p>
          </div>

          {/* 6 Ingredient Tap Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {INGREDIENTS.map((ing) => (
              <button
                key={ing.id}
                onClick={() => handleSelectIngredient(ing.id)}
                disabled={selectedIngredients.length >= 3}
                className="bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-50 border border-slate-800 hover:border-amber-500/50 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all cursor-pointer group shadow-sm"
              >
                <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform mb-1">
                  {ing.icon}
                </span>
                <span className="text-xs font-bold text-white text-center leading-tight">
                  {isMs ? ing.nameMs : ing.nameEn}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
