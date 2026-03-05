import { motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-slate-50 to-purple-100/40"></div>
      
      {/* Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full blur-[100px] opacity-30"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300 rounded-full blur-[100px] opacity-30"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ transform: 'skewX(-20deg) translateX(-150%)', animation: 'shine 3s infinite' }}></div>
          
          <div className="w-28 h-28 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 mb-8 p-4 transform transition-transform group-hover:scale-105 duration-500">
            <img src="/anc-logo.png" alt="ANC Logo" className="w-full h-full object-contain" />
          </div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight"
          >
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
              UWL Alumni
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-lg font-medium mb-8"
          >
            Networking Evening Registration
          </motion.p>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Get Started
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover/btn:text-white transition-colors group-hover/btn:translate-x-1 duration-300" />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
