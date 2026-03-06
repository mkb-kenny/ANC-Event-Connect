import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Download, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import { useEventSettings } from '../services/settingsService';

interface SuccessTicketProps {
  data: {
    studentName: string;
    program: string;
    uwlIdNo: string;
  };
  onReset: () => void;
}

export default function SuccessTicket({ data, onReset }: SuccessTicketProps) {
  const { width, height } = useWindowSize();
  const { settings, loading } = useEventSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 relative">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative"
      >
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
          
          <h2 className="text-3xl font-extrabold text-white relative z-10 tracking-tight mb-1">Thank You!</h2>
          <p className="text-blue-50 text-sm relative z-10 font-medium opacity-90">Registration Confirmed</p>
          <p className="text-white/80 text-xs mt-2 relative z-10 font-medium uppercase tracking-widest">{settings.title} {settings.subtitle}</p>
          
          {/* Decorative Circles */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 md:p-8 flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
             <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
               We look forward to seeing you there! Here is your digital pass.
             </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 transform hover:scale-105 transition-transform duration-300">
            <QRCodeSVG
              value={JSON.stringify({ name: data.studentName, program: data.program, id: data.uwlIdNo })}
              size={180}
              level="H"
              includeMargin={true}
              className="w-full h-auto max-w-[180px]"
            />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 break-words tracking-tight">{data.studentName}</h3>
            <p className="text-slate-500 font-medium text-sm">Program: <span className="text-blue-600">{data.program}</span></p>
            <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full mt-2 border border-slate-200">
              ID: {data.uwlIdNo}
            </span>
          </div>

          <div className="w-full border-t-2 border-dashed border-slate-200 my-6 relative opacity-50">
            <div className="absolute -left-10 -top-3.5 w-7 h-7 bg-slate-50 rounded-full shadow-inner"></div>
            <div className="absolute -right-10 -top-3.5 w-7 h-7 bg-slate-50 rounded-full shadow-inner"></div>
          </div>

          <div className="flex gap-3 w-full">
            <button 
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Save
            </button>
            <button 
              onClick={async () => {
                const shareData = {
                  title: `${settings.title} ${settings.subtitle}`,
                  text: `I just registered for the ${settings.title} ${settings.subtitle}! Join me there.`,
                  url: window.location.href
                };
                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                } catch (err) {
                  console.error('Error sharing:', err);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onReset}
        className="w-full mt-6 text-slate-500 hover:text-slate-900 flex items-center justify-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Register another alumni
      </motion.button>
    </div>
  );
}
