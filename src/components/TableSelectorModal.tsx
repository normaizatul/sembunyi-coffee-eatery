import React, { useState } from 'react';
import { QrCode, Camera, Check, X, Smartphone, Sparkles, RefreshCw } from 'lucide-react';
import { TableInfo, LanguageType } from '../types';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string;
  onSelectTable: (tableNum: string) => void;
  tables: TableInfo[];
  language: LanguageType;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTable,
  onSelectTable,
  tables,
  language,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [simulatedScanResult, setSimulatedScanResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (num: string) => {
    setIsScanning(true);
    setSimulatedScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setSimulatedScanResult(num);
      onSelectTable(num);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {language === 'ms' ? 'Pilih atau Imbas QR Meja' : 'Select or Scan Table QR'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ms'
                  ? 'Simulasi imbasan kod QR pada meja restoran SmartDinePlus'
                  : 'Simulate scanning QR code on SmartDinePlus dining tables'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Scanner Simulator Canvas */}
        <div className="my-5 bg-slate-950 rounded-xl p-5 border border-slate-800 text-center relative overflow-hidden">
          {isScanning ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <div className="relative w-24 h-24 border-2 border-emerald-500/40 rounded-xl flex items-center justify-center overflow-hidden bg-emerald-950/20">
                {/* Laser scan line */}
                <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
                <QrCode className="w-12 h-12 text-emerald-400/50" />
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'ms' ? 'Mengimbas Kod QR Meja...' : 'Scanning Table QR Code...'}</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-3">
                <Smartphone className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {language === 'ms' ? `Meja Aktif Sekarang: Meja ${currentTable}` : `Current Active Table: Table ${currentTable}`}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {language === 'ms'
                  ? 'Pilih nombor meja di bawah untuk mensimulasikan imbasan kamera QR telefon bimbit pelanggan.'
                  : 'Select a table number below to simulate scanning a customer smartphone camera QR.'}
              </p>
            </div>
          )}

          {simulatedScanResult && !isScanning && (
            <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ms' ? `Berjaya disambung ke Meja ${simulatedScanResult}!` : `Successfully connected to Table ${simulatedScanResult}!`}</span>
            </div>
          )}
        </div>

        {/* Quick Table Grid */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ms' ? 'Pilih Meja Restoran (12 Meja Available)' : 'Select Restaurant Table'}</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(tables || []).map((tbl) => {
              const isSelected = tbl.tableNumber === currentTable;
              return (
                <button
                  key={tbl.tableNumber}
                  onClick={() => handleSimulateScan(tbl.tableNumber)}
                  disabled={isScanning}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xs font-bold">Meja {tbl.tableNumber}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {tbl.seats} Kerusi
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            {language === 'ms' ? 'Tutup & Teruskan' : 'Close & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
