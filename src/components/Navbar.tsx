import React from 'react';
import { QrCode, ShoppingBag, ChefHat, Users, LayoutDashboard, Sparkles, Globe, Lock, Unlock, LogOut, ShieldAlert, MapPin, Info, Gamepad2 } from 'lucide-react';
import { LanguageType } from '../types';
import { SembunyiLogo } from './SembunyiLogo';

interface NavbarProps {
  activeView: 'customer' | 'kitchen' | 'waiter' | 'admin';
  setActiveView: (view: 'customer' | 'kitchen' | 'waiter' | 'admin') => void;
  tableNumber: string;
  onOpenTableModal: () => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  isAiBotOpen: boolean;
  setIsAiBotOpen: (open: boolean) => void;
  isStaffAuthenticated: boolean;
  onOpenStaffLogin: (targetView?: 'kitchen' | 'waiter' | 'admin') => void;
  onStaffLogout: () => void;
  onOpenAboutCafe?: () => void;
  onOpenMiniGames?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  tableNumber,
  onOpenTableModal,
  cartCount,
  cartTotal,
  onOpenCart,
  language,
  setLanguage,
  isAiBotOpen,
  setIsAiBotOpen,
  isStaffAuthenticated,
  onOpenStaffLogin,
  onStaffLogout,
  onOpenAboutCafe,
  onOpenMiniGames,
}) => {
  const isMs = language === 'ms';

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-2xl">
      {/* Top Banner: Changes based on Customer vs Staff Mode */}
      {isStaffAuthenticated ? (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 px-4 py-1.5 text-xs text-amber-100 flex items-center justify-between font-medium shadow-inner border-b border-amber-500/30">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border border-amber-300/40 text-amber-200 flex items-center gap-1">
                <Unlock className="w-3 h-3 text-amber-300" />
                <span>{isMs ? 'MOD STAF AKTIF' : 'STAFF MODE ACTIVE'}</span>
              </span>
              <span className="text-amber-100 font-semibold text-[11px] sm:text-xs hidden sm:inline">
                {isMs ? 'Sistem Pengurusan Kafe Sembunyi' : 'Sembunyi Cafe Management System'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'ms' ? 'en' : 'ms')}
                className="bg-black/20 hover:bg-black/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors text-white text-[11px] font-bold border border-amber-300/20"
                title="Tukar Bahasa"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
              </button>

              <button
                onClick={onStaffLogout}
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors text-[11px] font-bold"
                title="Log Keluar Mod Staf"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isMs ? 'Kunci & Keluar' : 'Lock & Exit'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 px-4 py-1.5 text-xs text-amber-100 flex items-center justify-between font-medium shadow-inner">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border border-amber-300/30 text-amber-200">
                ☕ sembunyi.
              </span>
              <span className="text-amber-100 font-semibold truncate text-[11px] sm:text-xs">
                coffee & eatery — Good Food ✦ Good Coffee ✦ Good Vibes ♡
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenMiniGames && (
                <button
                  onClick={onOpenMiniGames}
                  className="bg-black/30 hover:bg-black/50 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 transition-colors text-amber-200 hover:text-white text-[11px] font-bold border border-amber-400/40 cursor-pointer shadow-sm"
                  title={isMs ? 'Main 3 Permainan Santai Kafe Sembunyi' : 'Play 3 Sembunyi Cafe Mini-Games'}
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span className="inline">{isMs ? '🎮 Permainan Kafe' : '🎮 Mini Games'}</span>
                </button>
              )}
              {onOpenAboutCafe && (
                <button
                  onClick={onOpenAboutCafe}
                  className="bg-black/25 hover:bg-black/45 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 transition-colors text-amber-100 hover:text-white text-[11px] font-bold border border-amber-300/30 cursor-pointer"
                  title="Tentang Kafe Sembunyi & Lokasi"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden xs:inline">{isMs ? 'Tentang Kafe' : 'About Cafe'}</span>
                </button>
              )}
              <button
                onClick={() => setLanguage(language === 'ms' ? 'en' : 'ms')}
                className="bg-black/20 hover:bg-black/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors text-white text-[11px] font-bold border border-amber-300/20 cursor-pointer"
                title="Tukar Bahasa"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('customer')}>
          <div className="p-1 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40 group-hover:scale-105 transition-transform">
            <SembunyiLogo className="w-10 h-10 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1">
                <span>sembunyi.</span>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-md">
                  Cafe
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <span>coffee & eatery</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 font-bold">
                {isStaffAuthenticated ? (isMs ? 'Portal Kakitangan' : 'Staff Portal') : 'SmartDine+ QR'}
              </span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs: ONLY visible if Staff is Authenticated */}
        {isStaffAuthenticated ? (
          <nav className="hidden lg:flex items-center bg-slate-900 p-1 rounded-xl border border-amber-500/30 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{isMs ? 'Menu Pelanggan' : 'Customer Menu'}</span>
            </button>
            <button
              onClick={() => setActiveView('kitchen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'kitchen'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{isMs ? 'Paparan Dapur (KDS)' : 'Kitchen KDS'}</span>
            </button>
            <button
              onClick={() => setActiveView('waiter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'waiter'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isMs ? 'Staf & Pelayan' : 'Staff & Waiter'}</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isMs ? 'Analitik & Menu' : 'Analytics & QR'}</span>
            </button>
          </nav>
        ) : (
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-xs text-slate-400 italic">
              {isMs ? '✨ Pesanan Meja Pantas Tanpa Beratur' : '✨ Contactless Table QR Ordering'}
            </span>
          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Table Badge & Scanner Trigger (In Customer Mode) */}
          <button
            onClick={onOpenTableModal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-xl transition-all text-xs font-bold shadow-sm"
            title="Tukar Meja / Imbas QR"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>{isMs ? `Meja ${tableNumber}` : `Table ${tableNumber}`}</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAiBotOpen(!isAiBotOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold shadow-sm ${
              isAiBotOpen
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">SmartDine AI</span>
          </button>

          {/* Staff Mode Login / Toggle Button */}
          {!isStaffAuthenticated ? (
            <button
              onClick={() => onOpenStaffLogin('kitchen')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl transition-all text-xs font-bold shadow-sm hover:border-amber-400"
              title="Akses Staf / Dapur (Kata Laluan Diperlukan)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isMs ? 'Mod Staf' : 'Staff Access'}</span>
            </button>
          ) : (
            <button
              onClick={onStaffLogout}
              className="flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl transition-all text-xs font-bold shadow-sm"
              title="Log Keluar Mod Staf"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMs ? 'Keluar Staf' : 'Exit Staff'}</span>
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">RM {cartTotal.toFixed(2)}</span>
            {cartCount > 0 && (
              <span className="bg-slate-950 text-emerald-400 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-emerald-400">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar: Adapt based on Staff vs Customer */}
      {isStaffAuthenticated ? (
        <div className="flex lg:hidden bg-slate-900 border-t border-amber-500/30 px-2 py-1.5 justify-around text-[11px] font-semibold text-slate-400">
          <button
            onClick={() => setActiveView('customer')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              activeView === 'customer' ? 'text-amber-400 font-bold bg-slate-800' : ''
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isMs ? 'Pelanggan' : 'Customer'}</span>
          </button>
          <button
            onClick={() => setActiveView('kitchen')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              activeView === 'kitchen' ? 'text-amber-400 font-bold bg-slate-800' : ''
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>{isMs ? 'Dapur' : 'Kitchen'}</span>
          </button>
          <button
            onClick={() => setActiveView('waiter')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              activeView === 'waiter' ? 'text-amber-400 font-bold bg-slate-800' : ''
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isMs ? 'Pelayan' : 'Waiter'}</span>
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              activeView === 'admin' ? 'text-amber-400 font-bold bg-slate-800' : ''
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{isMs ? 'Admin' : 'Admin'}</span>
          </button>
        </div>
      ) : (
        <div className="flex lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-1.5 justify-between items-center text-[11px] font-medium text-slate-400">
          <button
            onClick={onOpenTableModal}
            className="flex items-center gap-1 text-emerald-400 font-semibold"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Meja {tableNumber}</span>
          </button>
          <button
            onClick={() => onOpenStaffLogin('kitchen')}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-amber-500/30"
          >
            <Lock className="w-3 h-3" />
            <span>{isMs ? 'Kakitangan / Dapur' : 'Staff Login'}</span>
          </button>
        </div>
      )}
    </header>
  );
};

