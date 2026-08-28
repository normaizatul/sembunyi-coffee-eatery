import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, X, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { MenuItem, AIChatMessage, LanguageType } from '../types';
import { SafeImage } from './SafeImage';

interface SmartDineAIBotProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem[];
  onSelectDish: (item: MenuItem) => void;
  language: LanguageType;
}

export const SmartDineAIBot: React.FC<SmartDineAIBotProps> = ({
  isOpen,
  onClose,
  menu,
  onSelectDish,
  language,
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
        : 'Welcome! I am SmartDine AI, your virtual dining assistant. How can I help you discover dishes based on your taste, budget, or diet today?',
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
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

      const data = await res.json();

      if (data.success) {
        const aiMsg: AIChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
          suggestedDishIds: data.suggestedDishIds || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: AIChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: isMs
            ? 'Maaf, terdapat masalah teknikal semasa berhubung dengan SmartDine AI. Sila cuba sebentar lagi.'
            : 'Sorry, there was a technical issue connecting to SmartDine AI. Please try again.',
          timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = isMs
    ? [
        'Cadangkan menu pedas & popular',
        'Hidangan bajet di bawah RM15',
        'Minuman wangi & menyegarkan',
        'Set combo untuk sekeluarga',
      ]
    : [
        'Suggest spicy & popular dishes',
        'Budget meals under RM15',
        'Refreshing drinks & desserts',
        'Family feast combo deals',
      ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>SmartDine AI Assistant</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-500/30">
                GEMINI 3.6
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Pembantu Menu & Rekomendasi Makanan</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
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
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-amber-500 text-slate-950 font-bold'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] space-y-2`}>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-[9px] opacity-60 mt-1 block text-right">{msg.timestamp}</span>
                </div>

                {/* Render Suggested Dishes if present */}
                {suggestedIds.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {isMs ? 'Hidangan Cadangan AI:' : 'AI Suggested Dishes:'}
                    </p>
                    {suggestedIds.map((id) => {
                      const dish = safeMenu.find((m) => m && m.id === id);
                      if (!dish) return null;
                      return (
                        <div
                          key={dish.id}
                          onClick={() => onSelectDish(dish)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <SafeImage
                              src={dish.imageUrl}
                              alt={dish.nameMs}
                              category={dish.category}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-xs font-bold text-white line-clamp-1">{isMs ? dish.nameMs : dish.nameEn}</p>
                              <p className="text-[10px] font-bold text-emerald-400">RM {(dish.price || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          <button className="p-1 bg-amber-500 text-slate-950 rounded-lg font-bold text-[10px] flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            <span>Suai</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-400 p-2 bg-slate-950 rounded-xl border border-slate-800 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>SmartDine AI sedang merangka cadangan...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Pills */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-full whitespace-nowrap transition-colors"
          >
            💡 {p}
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
          placeholder={isMs ? 'Tanya SmartDine AI tentang menu...' : 'Ask SmartDine AI about menu...'}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          disabled={isLoading || !inputPrompt.trim()}
          onClick={() => handleSendMessage()}
          className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl disabled:opacity-40 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
