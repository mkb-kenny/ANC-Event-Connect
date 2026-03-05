import { motion } from 'motion/react';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      {/* Vibrant Gradient Orbs */}
      <motion.div
        animate={{
          opacity: [0.3, 0.4, 0.3],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.3, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-400/20 rounded-full blur-[130px]"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.3, 0.2],
          x: [0, 20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-pink-400/15 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
          x: [0, -30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-[110px]"
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
    </div>
  );
}
