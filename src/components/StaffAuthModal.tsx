import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, X, ChevronRight, ChefHat, Users, LayoutDashboard, Settings } from 'lucide-react';
import { LanguageType } from '../types';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetView: 'kitchen' | 'waiter' | 'admin') => void;
  targetView?: 'kitchen' | 'waiter' | 'admin';
  language: LanguageType;
}

const DEFAULT_STAFF_PIN = '1234';

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetView = 'kitchen',
  language,
}) => {
  const isMs = language === 'ms';
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentSavedPin, setCurrentSavedPin] = useState(DEFAULT_STAFF_PIN);
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<'kitchen' | 'waiter' | 'admin'>(targetView);

  useEffect(() => {
    const saved = localStorage.getItem('sembunyi_staff_pin');
    if (saved) {
      setCurrentSavedPin(saved);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedDestination(targetView);
    setPin('');
    setErrorMsg('');
    setIsChangingPin(false);
    setPinSuccessMsg('');
  }, [isOpen, targetView]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!pin) {
      setErrorMsg(isMs ? 'Sila masukkan kata laluan / PIN staf.' : 'Please enter staff password / PIN.');
      return;
    }

    // Master override PINs for cafe admin or custom saved PIN
    if (pin === currentSavedPin || pin === '1234' || pin === '8888' || pin.toLowerCase() === 'sembunyi' || pin.toLowerCase() === 'admin') {
      setErrorMsg('');
      onSuccess(selectedDestination);
      onClose();
    } else {
      setErrorMsg(
        isMs
          ? 'Kata laluan salah! Sila cuba lagi. (PIN Lalai: 1234)'
          : 'Incorrect password! Please try again. (Default PIN: 1234)'
      );
      setPin('');
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setErrorMsg(isMs ? 'PIN baharu mesti sekurang-kurangnya 4 digit.' : 'New PIN must be at least 4 digits.');
      return;
    }
    localStorage.setItem('sembunyi_staff_pin', newPin);
    setCurrentSavedPin(newPin);
    setPinSuccessMsg(isMs ? 'PIN staf berjaya dikemaskini!' : 'Staff PIN updated successfully!');
    setNewPin('');
    setIsChangingPin(false);
    setTimeout(() => setPinSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 px-6 py-4 flex items-center justify-between text-white border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/30 rounded-xl border border-amber-300/30">
              <Lock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                {isMs ? 'Akses Mod Staf & Kakitangan' : 'Staff & Kitchen Portal Access'}
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                {isMs ? 'Sembunyi Cafe • Kawalan Keselamatan' : 'Sembunyi Cafe • Security Gate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-amber-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {pinSuccessMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pinSuccessMsg}</span>
            </div>
          )}

          {/* Destination Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block">
              {isMs ? 'Pilih Bahagian Staf Yang Ingin Dibuka:' : 'Select Staff Section:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDestination('kitchen')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  selectedDestination === 'kitchen'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <ChefHat className="w-5 h-5" />
                <span>{isMs ? 'Dapur KDS' : 'Kitchen KDS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('waiter')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  selectedDestination === 'waiter'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>{isMs ? 'Pelayan & Meja' : 'Floor Waiter'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('admin')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  selectedDestination === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>{isMs ? 'Admin & Menu' : 'Admin & QR'}</span>
              </button>
            </div>
          </div>

          {!isChangingPin ? (
            <form onSubmit={handleVerify} className="space-y-4">
              {/* Password Input Field */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{isMs ? 'Masukkan Kata Laluan / PIN Staf:' : 'Enter Staff PIN / Password:'}</span>
                  <span className="text-[11px] text-amber-400 font-mono">Lalai: 1234</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder={isMs ? 'Masukkan PIN (cth: 1234)' : 'Enter PIN (e.g. 1234)'}
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center tracking-widest text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Touch Numpad for Quick Staff Pin Entry */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    className="h-11 bg-slate-800 hover:bg-slate-750 active:bg-amber-500 active:text-slate-950 text-white font-bold rounded-xl border border-slate-700 text-base shadow-sm transition-all"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white font-bold rounded-xl border border-slate-700 text-xs transition-all"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  className="h-11 bg-slate-800 hover:bg-slate-750 active:bg-amber-500 active:text-slate-950 text-white font-bold rounded-xl border border-slate-700 text-base shadow-sm transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 bg-slate-800/60 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 text-xs transition-all flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isMs ? 'Tukar PIN' : 'Change PIN'}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isMs ? 'Sahkan & Masuk Mod Staf' : 'Verify & Enter Staff Mode'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Change PIN Form */
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  <span>{isMs ? 'Tetapkan PIN Staf Baharu' : 'Set New Staff PIN'}</span>
                </h4>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {isMs ? 'Masukkan PIN Baharu (4-6 Digit):' : 'Enter New PIN (4-6 Digits):'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Contoh: 5678"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-center tracking-widest text-base focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  {isMs ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-colors"
                >
                  {isMs ? 'Simpan PIN Baharu' : 'Save New PIN'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
