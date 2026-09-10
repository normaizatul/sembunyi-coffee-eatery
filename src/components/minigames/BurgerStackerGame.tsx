import React, { useState, useEffect, useRef } from 'react';
import { Layers, RotateCcw, Heart, Trophy, Sparkles, Award } from 'lucide-react';
import { gameAudio } from '../../utils/gameAudio';

interface BurgerLayer {
  id: string;
  nameMs: string;
  nameEn: string;
  icon: string;
  color: string;
  width: number; // in pixels
  x: number; // center position
}

const INGREDIENT_POOL = [
  { nameMs: 'Roti Bawah', nameEn: 'Bottom Bun', icon: '🍞', color: '#d97706', width: 140 },
  { nameMs: 'Patri Daging Berjus', nameEn: 'Juicy Beef Patty', icon: '🥩', color: '#78350f', width: 135 },
  { nameMs: 'Keju Cheddar Meleleh', nameEn: 'Melted Cheddar', icon: '🧀', color: '#facc15', width: 130 },
  { nameMs: 'Hirisan Tomato Segar', nameEn: 'Fresh Tomato', icon: '🍅', color: '#ef4444', width: 120 },
  { nameMs: 'Gelang Bawang Rangup', nameEn: 'Crispy Onion Ring', icon: '🧅', color: '#f97316', width: 115 },
  { nameMs: 'Cendawan Panggang', nameEn: 'Grilled Mushroom', icon: '🍄', color: '#854d0e', width: 110 },
  { nameMs: 'Salad Rangup', nameEn: 'Fresh Lettuce', icon: '🥬', color: '#22c55e', width: 125 },
  { nameMs: 'Sos Lada Hitam Kafe', nameEn: 'Blackpepper Sauce', icon: '🍯', color: '#451a03', width: 120 },
  { nameMs: 'Krofel Emas Rangup', nameEn: 'Golden Croffle', icon: '🧇', color: '#d97706', width: 130 },
  { nameMs: 'Roti Bijan Atas', nameEn: 'Top Sesame Bun', icon: '🍔', color: '#d97706', width: 130 },
];

interface BurgerStackerGameProps {
  isMs: boolean;
}

export const BurgerStackerGame: React.FC<BurgerStackerGameProps> = ({ isMs }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [stack, setStack] = useState<BurgerLayer[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Moving item state
  const [currentX, setCurrentX] = useState(150);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [nextIngredientIndex, setNextIngredientIndex] = useState(0);

  const animationFrameRef = useRef<number | null>(null);
  const arenaWidth = 320; // width of stacking arena
  const plateWidth = 160;

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sembunyi_game_burger_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {
      // Ignore
    }
  }, []);

  const handleStartGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    // Base plate layer
    setStack([
      {
        id: 'base-plate',
        nameMs: 'Pinggan Hidangan',
        nameEn: 'Serving Plate',
        icon: '🍽️',
        color: '#64748b',
        width: plateWidth,
        x: arenaWidth / 2,
      },
    ]);
    setNextIngredientIndex(0);
    setCurrentX(50);
    setDirection(1);
    setFeedback(null);
    gameAudio.playPop();
  };

  // Moving ingredient loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const speed = Math.min(2.5 + stack.length * 0.18, 6.0); // gets slightly faster as stack grows!

    const updateMovement = () => {
      setCurrentX((prev) => {
        let next = prev + speed * direction;
        if (next >= arenaWidth - 40) {
          setDirection(-1);
          return arenaWidth - 40;
        } else if (next <= 40) {
          setDirection(1);
          return 40;
        }
        return next;
      });
      animationFrameRef.current = requestAnimationFrame(updateMovement);
    };

    animationFrameRef.current = requestAnimationFrame(updateMovement);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, gameOver, direction, stack.length]);

  const handleDrop = () => {
    if (!isPlaying || gameOver) return;

    const currentIng = INGREDIENT_POOL[nextIngredientIndex % INGREDIENT_POOL.length];
    const topItem = stack[stack.length - 1];

    const diff = Math.abs(currentX - topItem.x);
    const maxAllowedDiff = (topItem.width + currentIng.width) / 2.8;

    if (diff > maxAllowedDiff) {
      // Missed! Ingredient fell off!
      gameAudio.playError();
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback(isMs ? 'Terlepas! Bahan terjatuh ke bawah...' : 'Missed! Ingredient fell off...');

      if (newLives <= 0) {
        setGameOver(true);
        setIsPlaying(false);
        gameAudio.playVictory();
      }
    } else {
      // Landed successfully!
      const isPerfect = diff < 12;
      gameAudio.playSuccess();

      const points = isPerfect ? 100 : 50;
      setScore((prev) => {
        const newScore = prev + points;
        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            localStorage.setItem('sembunyi_game_burger_highscore', newScore.toString());
          } catch {
            // Ignore
          }
        }
        return newScore;
      });

      setFeedback(
        isPerfect
          ? (isMs ? '✨ SUSUNAN TEPAT! +100' : '✨ PERFECT STACK! +100')
          : (isMs ? '👍 Berjaya Disusun! +50' : '👍 Nice Stack! +50')
      );

      // Add to stack
      const newLayer: BurgerLayer = {
        id: `layer-${Date.now()}`,
        nameMs: currentIng.nameMs,
        nameEn: currentIng.nameEn,
        icon: currentIng.icon,
        color: currentIng.color,
        width: Math.max(currentIng.width - (diff * 0.4), 60), // narrows slightly if off-center
        x: currentX,
      };

      setStack((prev) => [...prev, newLayer]);
      setNextIngredientIndex((prev) => prev + 1);
    }

    setTimeout(() => {
      setFeedback(null);
    }, 800);
  };

  const nextIng = INGREDIENT_POOL[nextIngredientIndex % INGREDIENT_POOL.length];

  return (
    <div className="flex flex-col h-full space-y-3 select-none">
      {/* Top Bar: Stats */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          {/* Lives */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 transition-all ${
                  heart <= lives
                    ? 'text-rose-500 fill-rose-500 animate-pulse'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Stack height */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl text-xs font-bold text-white">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{isMs ? 'Tingkat:' : 'Layers:'}</span>
            <span className="text-amber-400 font-black">{Math.max(stack.length - 1, 0)}</span>
          </div>

          <div className="text-xs font-bold text-slate-300">
            <span>{isMs ? 'Mata:' : 'Score:'}</span> <strong className="text-emerald-400 font-black">{score}</strong>
          </div>
        </div>

        <button
          onClick={handleStartGame}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isPlaying ? (isMs ? 'Mula Semula' : 'Restart') : (isMs ? 'Mula Main' : 'Start')}</span>
        </button>
      </div>

      {/* Main Arena */}
      {!isPlaying && !gameOver ? (
        /* Welcome Splash */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 animate-pulse">
            🍔
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{isMs ? 'Menara Burger & Krofel' : 'Burger & Croffle Stacker'}</h3>
            <p className="text-xs text-amber-300 font-semibold mt-1">
              {isMs ? 'Bina Menara Burger Sembunyi Setinggi Mungkin!' : 'Stack the tallest Sembunyi Burger tower!'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
              {isMs
                ? 'Bahan burger akan bergerak ke kiri dan ke kanan. Sentuh skrin pada masa yang tepat untuk menjatuhkan bahan di atas pinggan!'
                : 'Ingredients swing horizontally. Tap at the perfect timing to stack them high without tipping over!'}
            </p>
          </div>

          <button
            onClick={handleStartGame}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105"
          >
            <Layers className="w-4 h-4" />
            <span>{isMs ? 'Mula Susun Burger!' : 'Start Stacking!'}</span>
          </button>
        </div>
      ) : gameOver ? (
        /* Game Over Screen */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="text-4xl">🍔🏆</div>
          <div>
            <h3 className="text-2xl font-black text-white">{isMs ? 'Permainan Tamat!' : 'Game Over!'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isMs ? 'Hebat menara burger yang berjaya anda bina!' : 'Spectacular burger tower crafted!'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 w-full max-w-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isMs ? 'Tingkat Dicapai:' : 'Height Reached:'}</span>
              <span className="text-sm font-black text-amber-400">{Math.max(stack.length - 1, 0)} tingkat</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isMs ? 'Jumlah Mata:' : 'Total Score:'}</span>
              <span className="text-lg font-black text-emerald-400">{score} {isMs ? 'mata' : 'pts'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isMs ? 'Rekod Tertinggi:' : 'High Score:'}</span>
              <span className="font-bold text-white">{highScore} {isMs ? 'mata' : 'pts'}</span>
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
        /* Interactive Stacking Stage */
        <div
          onClick={handleDrop}
          className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col items-center justify-end p-4 cursor-pointer min-h-[320px]"
        >
          {/* Feedback banner */}
          {feedback && (
            <div className="absolute top-4 z-20 px-4 py-1.5 bg-amber-500 text-slate-950 rounded-full font-black text-xs shadow-xl animate-bounce">
              {feedback}
            </div>
          )}

          {/* Swinging Crane / Spatula at Top */}
          <div className="absolute top-2 left-0 right-0 h-16 pointer-events-none">
            {/* Guide line */}
            <div className="w-full border-b border-dashed border-slate-800/80 absolute top-8" />
            {/* Moving ingredient */}
            <div
              style={{
                left: `${currentX}px`,
                transform: 'translateX(-50%)',
              }}
              className="absolute top-3 transition-transform duration-75 flex flex-col items-center"
            >
              <div className="w-1 h-3 bg-amber-500/80" />
              <div className="px-3 py-1 rounded-xl bg-slate-900 border-2 border-amber-400 text-sm font-black flex items-center gap-1.5 shadow-xl">
                <span>{nextIng.icon}</span>
                <span className="text-[11px] text-amber-300 font-bold whitespace-nowrap">
                  {isMs ? nextIng.nameMs : nextIng.nameEn}
                </span>
              </div>
            </div>
          </div>

          {/* Stacking Tower Canvas */}
          <div className="relative w-full flex flex-col-reverse items-center pb-2 z-10">
            {/* Render stack items from bottom to top */}
            {stack.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  width: `${item.width}px`,
                  backgroundColor: item.color,
                  marginLeft: `${(item.x - arenaWidth / 2) * 0.8}px`,
                }}
                className={`h-6 rounded-md shadow-md flex items-center justify-center text-xs font-bold text-white transition-all my-0.5 border border-black/20 ${
                  idx === stack.length - 1 && idx > 0 ? 'animate-bounce' : ''
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                <span className="text-[10px] truncate max-w-[80px]">
                  {isMs ? item.nameMs : item.nameEn}
                </span>
              </div>
            ))}
          </div>

          {/* Tap to Drop Instruction */}
          <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>👇 {isMs ? 'Sentuh mana-mana untuk jatuhkan' : 'Tap anywhere to drop'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDrop();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMs ? 'JATUHKAN SEKARANG!' : 'DROP NOW!'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
