import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Background from './components/Background';
import EventForm from './components/EventForm';
import ShareModal from './components/ShareModal';
import WelcomeScreen from './components/WelcomeScreen';
import AdminDashboard from './components/AdminDashboard';
import { QrCode, Share2, ShieldCheck } from 'lucide-react';

function App() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [view, setView] = useState<'form' | 'admin'>('form');
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.href);
  }, []);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ANC UWL Event Registration',
          text: 'Join us for the upcoming ANC Education UWL Event! Register now.',
          url: appUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to opening the QR modal if native share isn't supported
      setIsShareOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center font-sans text-slate-900">
      <Background />
      
      <AnimatePresence mode="wait">
        {showWelcome && view === 'form' && (
          <WelcomeScreen onStart={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      <header className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex items-center gap-4 cursor-pointer pointer-events-auto group" onClick={() => setView('form')}>
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/40 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/50 shadow-lg ring-1 ring-white/20 transition-all duration-300 group-hover:scale-110 group-active:scale-95 overflow-hidden p-1.5 group-hover:shadow-blue-500/20">
            <img src="/anc-logo.png" alt="ANC Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-slate-900 font-extrabold text-lg leading-tight drop-shadow-sm tracking-tight group-hover:text-blue-700 transition-colors">ANC Education</h1>
            <p className="text-blue-600 text-xs font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">UWL Event</p>
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button 
            onClick={handleNativeShare}
            className="bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/50 text-slate-700 px-5 py-2.5 rounded-2xl transition-all duration-300 shadow-lg flex items-center gap-2 text-sm font-bold hover:shadow-blue-500/20 active:scale-95 hover:text-blue-700 group"
            title="Share Event"
          >
            <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Share</span>
          </button>
          
          <button 
            onClick={() => setIsShareOpen(true)}
            className="bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/50 text-slate-700 p-2.5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-purple-500/20 active:scale-95 hover:text-purple-700 group"
            title="Show QR Code"
          >
            <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      <main className="w-full flex-1 relative z-10">
        <div className="flex flex-col justify-center pt-24 pb-8 px-4 md:px-6 w-full items-center">
          <AnimatePresence mode="wait">
            {view === 'form' ? (
              !showWelcome && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <EventForm />
                </motion.div>
              )
            ) : (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <AdminDashboard onBack={() => setView('form')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="w-full p-4 md:p-6 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-6 text-slate-500 text-xs z-20 font-medium shrink-0">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <p className="opacity-70 hover:opacity-100 transition-opacity">&copy; {new Date().getFullYear()} ANC Education.</p>
          <span className="hidden md:inline w-1 h-1 bg-slate-400 rounded-full opacity-50"></span>
          <a 
            href="https://spacenestsystems.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 hover:text-blue-600 transition-all flex items-center gap-1"
          >
            Created by <span className="font-bold">Space Nest Systems</span>
          </a>
        </div>
        
        <span className="hidden md:inline w-1 h-1 bg-slate-400 rounded-full opacity-50"></span>

        <button 
          onClick={() => setView('admin')}
          className="hover:text-blue-600 flex items-center gap-1.5 transition-all hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm group"
        >
          <ShieldCheck className="w-3.5 h-3.5 group-hover:text-blue-500 transition-colors" />
          Admin Access
        </button>
      </footer>

      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        url={appUrl} 
      />
    </div>
  );
}

export default App;
