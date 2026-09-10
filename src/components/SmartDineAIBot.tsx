import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User, X, Plus, Globe, Loader2, RefreshCw } from 'lucide-react';
import { MenuItem, AIChatMessage, LanguageType } from '../types';
import { SafeImage } from './SafeImage';
import { getLocalRecommendation } from '../utils/localRecommendation';

interface SmartDineAIBotProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem[];
  onSelectDish: (item: MenuItem) => void;
  language: LanguageType;
  onLanguageChange?: (lang: LanguageType) => void;
}

export const SmartDineAIBot: React.FC<SmartDineAIBotProps> = ({
  isOpen,
  onClose,
  menu,
  onSelectDish,
  language,
  onLanguageChange,
}) => {
  const isMs = language === 'ms';

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: isMs
        ? 'Selamat datang! Saya SmartDine AI, pembantu virtual restoran SmartDinePlus. Boleh saya bantu anda mencari menu mengikut selera, bajet, atau pilihan diet anda?'
        : 'Welcome! I am SmartDine AI, your virtual dining assistant for SmartDinePlus. How can I help you discover dishes based on your taste, budget, or dietary preferences today?',
      timestamp: new Date().toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Synchronize welcome & conversational language when language prop changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'm-welcome',
            sender: 'assistant',
            text: isMs
              ? 'Selamat datang! Saya SmartDine AI, pembantu virtual restoran SmartDinePlus. Boleh saya bantu anda mencari menu mengikut selera, bajet, atau pilihan diet anda?'
              : 'Welcome! I am SmartDine AI, your virtual dining assistant for SmartDinePlus. How can I help you discover dishes based on your taste, budget, or dietary preferences today?',
            timestamp: new Date().toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      // Add a brief language switch notification message
      const lastMsg = prev[prev.length - 1];
      if (lastMsg?.id?.startsWith('lang-switch')) return prev;

      return [
        ...prev,
        {
          id: `lang-switch-${Date.now()}`,
          sender: 'assistant',
          text: isMs
            ? '🌐 Bahasa ditukar kepada Bahasa Melayu. Sila beritahu apa yang anda ingin cari di Kafe Sembunyi!'
            : '🌐 Language switched to English. Let me know what dishes or drinks you would like to explore!',
          timestamp: new Date().toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });
  }, [language, isMs]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          language,
        }),
      });

      if (!res.ok) throw new Error(`AI endpoint returned ${res.status}`);
      const data = await res.json();

      if (data.success && data.text) {
        const aiMsg: AIChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          suggestedDishIds: data.suggestedDishIds || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else throw new Error('Invalid AI response');
    } catch (err) {
      console.warn('AI endpoint unavailable; using the built-in menu assistant.', err);
      const fallback = getLocalRecommendation(promptToSend, language, menu);
      const errorMsg: AIChatMessage = {
        id: `local-${Date.now()}`,
        sender: 'assistant',
        text: fallback.text,
        timestamp: new Date().toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        suggestedDishIds: fallback.suggestedDishIds,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `m-welcome-${Date.now()}`,
        sender: 'assistant',
        text: isMs
          ? 'Perbualan telah dimulakan semula. Ada apa-apa hidangan, minuman, atau kombo yang boleh saya cadangkan?'
          : 'Chat refreshed. How can I assist you with dish recommendations or pairings today?',
        timestamp: new Date().toLocaleTimeString(isMs ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = isMs
    ? [
        '🔥 Menu pedas & popular',
        '💰 Bajet bawah RM15',
        '🍔 Burger Kaunter 2',
        '🥩 Western Chop & Grill',
        '☕ Kopi & Minuman segar',
        '🥐 Croffle & Pastri manis',
      ]
    : [
        '🔥 Spicy & popular dishes',
        '💰 Budget under RM15',
        '🍔 Counter 2 Burgers',
        '🥩 Western Chops & Grills',
        '☕ Fresh Coffee & Drinks',
        '🥐 Sweet Croffles & Pastry',
      ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-white">SmartDine AI</h3>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-500/30">
                GEMINI 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isMs ? 'Pembantu Maya Kafe Sembunyi' : 'Virtual Cafe Assistant'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* In-drawer Language Switcher */}
          {onLanguageChange && (
            <button
              onClick={() => onLanguageChange(isMs ? 'en' : 'ms')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title={isMs ? 'Tukar Bahasa' : 'Switch Language'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isMs ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
            </button>
          )}

          {/* Reset chat button */}
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMs ? 'Mula Semula Chat' : 'Reset Conversation'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(messages || []).map((msg) => {
          const isUser = msg.sender === 'user';
          const suggestedIds = Array.isArray(msg.suggestedDishIds) ? msg.suggestedDishIds : [];
          const safeMenu = Array.isArray(menu) ? menu : [];

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  isUser ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-amber-500 text-slate-950 font-bold'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-[84%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-950 border border-slate-800/90 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-[9px] opacity-60 mt-1.5 block text-right font-medium">{msg.timestamp}</span>
                </div>

                {/* Render Suggested Dishes if present */}
                {suggestedIds.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{isMs ? 'Hidangan Cadangan AI:' : 'AI Suggested Dishes:'}</span>
                    </p>
                    <div className="space-y-1.5">
                      {suggestedIds.map((id) => {
                        const dish = safeMenu.find((m) => m && m.id === id);
                        if (!dish) return null;
                        const isCounter2 = dish.cashierStation === 'cashier_2';

                        return (
                          <div
                            key={dish.id}
                            onClick={() => onSelectDish(dish)}
                            className="p-2.5 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <SafeImage
                                src={dish.imageUrl}
                                alt={dish.nameMs}
                                category={dish.category}
                                className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-700"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                      isCounter2
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {isCounter2 ? 'Kaunter 2' : 'Kaunter 1'}
                                  </span>
                                  {dish.isSpicy && <span className="text-[9px] text-rose-400 font-bold">🌶️ Pedas</span>}
                                </div>
                                <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                  {isMs ? dish.nameMs : dish.nameEn}
                                </p>
                                <p className="text-[11px] font-black text-emerald-400">
                                  RM {(dish.price || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectDish(dish);
                              }}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[10px] flex items-center gap-1 shrink-0 shadow-sm cursor-pointer ml-2"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isMs ? 'Pilih' : 'Add'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-400 p-2.5 bg-slate-950 rounded-xl border border-slate-800 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {isMs
                ? 'SmartDine AI sedang merangka cadangan menu terbaik...'
                : 'SmartDine AI is curating recommendations for you...'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Prompt Pills */}
      <div className="px-3.5 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-full whitespace-nowrap transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            isMs
              ? 'Tanya SmartDine AI tentang menu, harga, ramuan...'
              : 'Ask SmartDine AI about dishes, calories, prices...'
          }
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button
          disabled={isLoading || !inputPrompt.trim()}
          onClick={() => handleSendMessage()}
          className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
          title={isMs ? 'Hantar' : 'Send'}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
