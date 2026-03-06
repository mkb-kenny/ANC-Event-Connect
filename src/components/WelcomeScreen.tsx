import { motion } from 'motion/react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useEventSettings } from '../services/settingsService';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { settings, loading } = useEventSettings();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.5 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-slate-50 to-purple-100/40"></div>
      
      {/* Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[100px] opacity-20"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-[100px] opacity-20"
      />

      {/* Content */}
      <div className="relative z-10 text-center w-full h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/70 backdrop-blur-3xl border-b border-white/60 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group w-full h-full flex flex-col items-center justify-center"
        >
          {/* Shine Effect */}
          <motion.div 
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
          />
          
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-28 h-28 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/10 mb-8 p-4 transform transition-transform group-hover:scale-110 duration-500 relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src="/anc-logo.png" alt="ANC Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain relative z-10" />
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.5
                }
              }
            }}
          >
            <motion.h1 
              variants={{
                hidden: { y: 20, opacity: 0, scale: 0.9 },
                visible: { 
                  y: 0, 
                  opacity: 1, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 100 }
                }
              }}
              className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-[1.1]"
            >
              Welcome to <br />
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  filter: ["drop-shadow(0 0 0px rgba(37, 99, 235, 0))", "drop-shadow(0 0 8px rgba(37, 99, 235, 0.2))", "drop-shadow(0 0 0px rgba(37, 99, 235, 0))"]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="inline-block"
              >
                <motion.span 
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_auto]"
                >
                  {settings.title}
                </motion.span>
              </motion.div>
            </motion.h1>
            
            <motion.p 
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
              className="text-slate-500 text-lg font-semibold mb-10 leading-relaxed"
            >
              {settings.subtitle}
            </motion.p>

            <motion.div
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(37, 99, 235, 0)",
                    "0 0 20px 5px rgba(37, 99, 235, 0.2)",
                    "0 0 0 0px rgba(37, 99, 235, 0)"
                  ],
                  y: [0, -2, 0],
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onClick={onStart}
                className="w-full py-5 bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-[length:200%_auto] text-white rounded-2xl font-bold text-xl shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ChevronRight className="w-6 h-6 text-white/70 group-hover/btn:text-white transition-colors" />
                  </motion.div>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
