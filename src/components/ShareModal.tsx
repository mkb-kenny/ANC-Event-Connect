import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function ShareModal({ isOpen, onClose, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ensure URL is valid before rendering QR
  const qrUrl = url || 'https://anc-education.com';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-6 z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Share Event</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 w-full flex justify-center">
                <QRCodeSVG 
                  value={qrUrl} 
                  size={200} 
                  level="H" 
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              
              <p className="text-center text-slate-500 text-sm font-medium">
                Scan this QR code to open the registration form on your mobile device.
              </p>

              <div className="w-full flex gap-2">
                <input 
                  readOnly 
                  value={qrUrl} 
                  className="flex-1 bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:outline-none font-medium"
                />
                <button 
                  onClick={handleCopy}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition-colors shadow-lg shadow-slate-900/20"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
