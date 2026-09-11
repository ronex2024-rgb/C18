import React, { useState, useEffect } from 'react';
import { SmartTrap, Language } from '../types';
import { translations } from '../utils/translations';
import QRCode from 'qrcode';
import { X, QrCode as QrIcon, Printer, Radio, Bug } from 'lucide-react';

interface QrCodeModalProps {
  trap: SmartTrap | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  trap,
  isOpen,
  onClose,
  lang
}) => {
  const t = translations[lang];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (trap) {
      const payload = JSON.stringify({
        trapCode: trap.code,
        zoneId: trap.zoneId,
        coords: trap.coordinates,
        firmware: trap.firmwareVersion,
        platform: 'M-PAS',
        pest: 'Lasioderma_serricorne'
      });

      QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [trap]);

  if (!isOpen || !trap) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
          <QrIcon className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">
            {t.qrTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          {t.qrSubtitle}
        </p>

        {/* QR Badge Card */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${trap.code}`}
                className="h-52 w-52 rounded-lg border border-slate-700 bg-white p-2 shadow-inner"
              />
            ) : (
              <div className="h-52 w-52 animate-pulse bg-slate-800 rounded-lg" />
            )}
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2.5">
            <span className="font-mono text-base font-extrabold text-white block">
              {trap.code}
            </span>
            <span className="text-xs text-amber-400 font-semibold block">
              {lang === 'en' ? trap.nameEn : trap.nameAr}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              Zone: {trap.zoneId.toUpperCase()} • LoRaWAN ID: {trap.firmwareVersion}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>Print Trap Tag</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
