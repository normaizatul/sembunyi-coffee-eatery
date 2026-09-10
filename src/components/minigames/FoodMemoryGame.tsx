import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Clock, Star, Trophy, CheckCircle2 } from 'lucide-react';
import { gameAudio } from '../../utils/gameAudio';

interface FoodCardItem {
  id: string;
  nameMs: string;
  nameEn: string;
  icon: string;
  category: string;
}

const FOOD_PAIRS: FoodCardItem[] = [
  { id: 'chicken_chop', nameMs: 'Chicken Chop', nameEn: 'Chicken Chop', icon: '🍗', category: 'Main' },
  { id: 'burger', nameMs: 'Burger Sembunyi', nameEn: 'Sembunyi Burger', icon: '🍔', category: 'Burger' },
  { id: 'croffle', nameMs: 'Croffle Biscoff', nameEn: 'Biscoff Croffle', icon: '🧇', category: 'Dessert' },
  { id: 'latte', nameMs: 'Caramel Latte', nameEn: 'Caramel Latte', icon: '☕', category: 'Coffee' },
  { id: 'matcha', nameMs: 'Matcha Uji Ais', nameEn: 'Iced Matcha', icon: '🍵', category: 'Drink' },
  { id: 'pasta', nameMs: 'Pasta Carbonara', nameEn: 'Pasta Carbonara', icon: '🍝', category: 'Pasta' },
  { id: 'fries', nameMs: 'Cheesy Fries', nameEn: 'Cheesy Fries', icon: '🍟', category: 'Sides' },
  { id: 'tiramisu', nameMs: 'Tiramisu Cake', nameEn: 'Tiramisu Cake', icon: '🍰', category: 'Dessert' },
];

interface CardState {
  instanceId: number;
  pairId: string;
  nameMs: string;
  nameEn: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface FoodMemoryGameProps {
  isMs: boolean;
}

export const FoodMemoryGame: React.FC<FoodMemoryGameProps> = ({ isMs }) => {
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  // Load best score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sembunyi_game_memory_bestmoves');
      if (saved) setBestMoves(parseInt(saved, 10));
    } catch {
      // Ignore
    }
  }, []);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isWon && cards.length > 0) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWon, cards.length]);

  const initGame = () => {
    // Generate 16 cards (8 pairs shuffled)
    const deck: CardState[] = [];
    FOOD_PAIRS.forEach((item) => {
      // Card A
      deck.push({
        instanceId: Math.random(),
        pairId: item.id,
        nameMs: item.nameMs,
        nameEn: item.nameEn,
        icon: item.icon,
        isFlipped: false,
        isMatched: false,
      });
      // Card B
      deck.push({
        instanceId: Math.random(),
        pairId: item.id,
        nameMs: item.nameMs,
        nameEn: item.nameEn,
        icon: item.icon,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
    setTimer(0);
    gameAudio.playPop();
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) {
      return;
    }

    gameAudio.playTap();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // MATCH!
        setTimeout(() => {
          gameAudio.playSuccess();
          setCards((prev) => {
            const matchedCards = prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            );

            // Check if all matched
            if (matchedCards.every((c) => c.isMatched)) {
              setIsWon(true);
              gameAudio.playVictory();
              // Update best score
              const currentMoves = moves + 1;
              if (bestMoves === null || currentMoves < bestMoves) {
                setBestMoves(currentMoves);
                try {
                  localStorage.setItem('sembunyi_game_memory_bestmoves', currentMoves.toString());
                } catch {
                  // Ignore
                }
              }
            }
            return matchedCards;
          });
          setFlippedIndices([]);
        }, 350);
      } else {
        // NO MATCH
        setTimeout(() => {
          gameAudio.playError();
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const getStars = () => {
    if (moves <= 12) return 3;
    if (moves <= 18) return 2;
    return 1;
  };

  return (
    <div className="flex flex-col h-full space-y-3 select-none">
      {/* Top Bar: Stats */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-xs font-black text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{timer}s</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-xl text-xs font-bold text-white">
            <span>{isMs ? 'Langkah:' : 'Moves:'}</span>
            <span className="text-amber-400 font-black">{moves}</span>
          </div>

          {bestMoves !== null && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{isMs ? 'Rekod Terendah:' : 'Best:'}</span>
              <span className="font-bold text-slate-200">{bestMoves}</span>
            </div>
          )}
        </div>

        <button
          onClick={initGame}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isMs ? 'Susun Semula' : 'Reset Deck'}</span>
        </button>
      </div>

      {/* Main Grid or Victory Splash */}
      {isWon ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="text-4xl">🎉🍽️</div>
          <div>
            <h3 className="text-2xl font-black text-white">{isMs ? 'Tahniah! Semua Kad Berjaya Dipadankan!' : 'Victory! All Pairs Matched!'}</h3>
            <p className="text-xs text-slate-300 mt-1">
              {isMs ? 'Ingatan anda amat tajam! Hidangan anda di dapur sedang disiapkan.' : 'Your memory is sharp! Your dishes in the kitchen are on the way.'}
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-8 h-8 ${
                  s <= getStars() ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 w-full max-w-xs space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{isMs ? 'Jumlah Langkah:' : 'Total Moves:'}</span>
              <span className="font-black text-amber-400 text-sm">{moves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{isMs ? 'Masa Diambil:' : 'Time Taken:'}</span>
              <span className="font-bold text-white">{timer} saat</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{isMs ? 'Rekod Terbaik:' : 'Best Record:'}</span>
              <span className="font-bold text-emerald-400">{bestMoves} langkah</span>
            </div>
          </div>

          <button
            onClick={initGame}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            {isMs ? 'Main Pusingan Baharu' : 'Play New Round'}
          </button>
        </div>
      ) : (
        /* 4x4 Grid of Cards */
        <div className="flex-1 grid grid-cols-4 gap-2 sm:gap-2.5 p-2 bg-slate-950/80 border border-slate-800 rounded-2xl">
          {cards.map((card, idx) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={idx}
                onClick={() => handleCardClick(idx)}
                disabled={isRevealed}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all duration-300 transform active:scale-95 cursor-pointer shadow-sm relative ${
                  card.isMatched
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-400/40'
                    : card.isFlipped
                    ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400/50'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isRevealed ? (
                  <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
                    <span className="text-2xl sm:text-3xl mb-0.5">{card.icon}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-200 text-center leading-tight truncate max-w-[55px]">
                      {isMs ? card.nameMs : card.nameEn}
                    </span>
                    {card.isMatched && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute top-1 right-1" />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-amber-400/70">
                    <span className="text-lg opacity-40">☕</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                      Sembunyi
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Hint */}
      <div className="text-center text-[11px] text-slate-400 font-medium">
        💡 {isMs ? 'Padankan 8 pasangan hidangan & minuman Kafe Sembunyi!' : 'Find all 8 matching Sembunyi Cafe food & drinks!'}
      </div>
    </div>
  );
};
