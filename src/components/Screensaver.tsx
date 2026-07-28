/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ShieldCheck, Moon, ArrowRight, Sparkles, Lock, AlertCircle } from 'lucide-react';
import { LoginUser } from '../App';

interface ScreensaverProps {
  currentUser: LoginUser | null;
  onDismiss: () => void;
}

export default function Screensaver({ currentUser, onDismiss }: ScreensaverProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [activePhrase, setActivePhrase] = useState<number>(0);
  
  // Lock / Unlock Screen states
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const phrases = [
    "İyi ki Yeşilay var!",
    "Sağlıklı Nesiller, Aydınlık Yarınlar",
    "Yeşilay Gençlik Kampları",
    "Bağımlılıklardan Uzak, Sağlıklı Yaşama Doğru",
    "Doğayla İç İçe, Sağlık Dolu Bir Kamp Dönemi"
  ];

  // Keep clock and slogans updated
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const sloganTimer = setInterval(() => {
      setActivePhrase((prev) => (prev + 1) % phrases.length);
    }, 6000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(sloganTimer);
    };
  }, []);

  // Listen for user activity to bring up the lock password overlay
  useEffect(() => {
    const handleActivityToUnlock = () => {
      if (!isUnlocking) {
        setIsUnlocking(true);
      }
    };

    // Any interaction on window will trigger the unlock screen
    window.addEventListener('mousemove', handleActivityToUnlock);
    window.addEventListener('mousedown', handleActivityToUnlock);
    window.addEventListener('keydown', handleActivityToUnlock);
    window.addEventListener('touchstart', handleActivityToUnlock);

    return () => {
      window.removeEventListener('mousemove', handleActivityToUnlock);
      window.removeEventListener('mousedown', handleActivityToUnlock);
      window.removeEventListener('keydown', handleActivityToUnlock);
      window.removeEventListener('touchstart', handleActivityToUnlock);
    };
  }, [isUnlocking]);

  const handleVerify = (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : passcode;
    
    const adminPasswords = ['1920'];
    const personnelPasscode = '1920';

    // Allow correct credentials based on role or master codes
    const isAdmin = currentUser?.role === 'admin';
    const isValid = isAdmin
      ? adminPasswords.includes(code) || code === personnelPasscode
      : code === personnelPasscode || adminPasswords.includes(code);

    if (isValid) {
      onDismiss();
    } else {
      setError('Hatalı şifre! Lütfen tekrar deneyiniz.');
      setPasscode('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const getExpectedPasscodeHint = () => {
    return "Giriş Şifresi: 1920";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const userInitials = currentUser?.name
    ? currentUser.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PP';

  return (
    <div 
      id="yesilay-screensaver-overlay"
      className={`fixed inset-0 z-[999999] bg-[#020d08] flex flex-col justify-between items-center p-8 select-none text-white overflow-hidden ${
        isUnlocking ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* Background Animated Gradient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft emerald radial glow in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
        {/* Top-right subtle glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px]" />
        {/* Bottom-left subtle glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-emerald-700/5 rounded-full blur-[100px]" />
      </div>

      {/* Top Bar: System Status */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10 opacity-70">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-450 animate-pulse" />
          <span className="text-[10px] tracking-[0.15em] font-mono text-emerald-100 font-extrabold uppercase">
            Yeşilay KYS • Güvenli Mod
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] tracking-wider text-emerald-100 font-bold">
          <Moon className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Ekran Kilidi Aktif</span>
        </div>
      </div>

      {/* Main Content Area: Floating Logo and Animated Phrases */}
      <div className="flex-1 flex flex-col justify-center items-center gap-12 z-10 w-full max-w-3xl">
        
        {/* Animated Crescent & Logo Wrapper */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Outer Rotating Emerald Ring */}
          <div className="absolute inset-[-30px] border border-emerald-500/10 rounded-full animate-spin duration-[40000ms]" />
          <div className="absolute inset-[-15px] border border-dashed border-emerald-500/20 rounded-full animate-spin duration-[25000ms] reverse" />

          {/* Central Logo Box */}
          <div className="relative w-48 h-48 flex items-center justify-center bg-emerald-950/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            
            {/* Animated Glow Backing for the Crescent */}
            <div className="absolute inset-4 bg-emerald-500/10 rounded-full blur-md animate-ping duration-[3000ms] opacity-50" />
            
            {/* The Green Crescent (Yeşilay Crescent) */}
            <motion.svg 
              viewBox="0 0 100 100" 
              className="w-32 h-32 drop-shadow-[0_0_20px_rgba(0,171,65,0.6)]"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 4, -4, 0]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut"
              }}
            >
              <path
                d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z"
                fill="#00AB41"
              />
            </motion.svg>
          </div>

          {/* Brand Titles with elegant spacing */}
          <div className="mt-8 text-center space-y-1">
            <h1 className="text-4xl font-black text-white tracking-[0.25em] font-sans drop-shadow-md">
              YEŞİLAY
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] w-8 bg-emerald-500/40" />
              <span className="text-[10px] text-emerald-400 font-black tracking-[0.4em] uppercase">
                TÜRKİYE
              </span>
              <span className="h-[1px] w-8 bg-emerald-500/40" />
            </div>
          </div>
        </motion.div>

        {/* Sliding Slogans / Phrases */}
        <div className="h-12 flex items-center justify-center text-center overflow-hidden w-full px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={activePhrase}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8 }}
              className="text-lg md:text-xl font-medium text-emerald-50/90 tracking-wide font-sans flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              {phrases[activePhrase]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Bar: Clock & Wake Guidance */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 z-10 border-t border-emerald-500/10 pt-6">
        
        {/* Dynamic Clock display */}
        <div className="flex flex-col items-center md:items-start">
          <div className="text-3xl font-black font-mono tracking-wider text-emerald-50 flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-emerald-400 animate-pulse" />
            {formatTime(time)}
          </div>
          <span className="text-[10px] text-emerald-400/70 font-semibold tracking-wider mt-1">
            {formatDate(time)}
          </span>
        </div>

        {/* Quick wake indication */}
        <div 
          className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-widest font-black uppercase cursor-pointer hover:text-emerald-300 transition duration-350"
          onClick={() => setIsUnlocking(true)}
        >
          <span>Çıkış Yapmak İçin Fareyi Hareket Ettirin veya Tıklayın</span>
          <ArrowRight className="w-3.5 h-3.5 animate-bounce-horizontal" />
        </div>
      </div>

      {/* PASSWORD UNLOCK OVERLAY (FROSTED GLASS MODAL) */}
      <AnimatePresence>
        {isUnlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            onClick={(e) => {
              // Click outside the unlock card to dismiss unlock mode
              if (e.target === e.currentTarget) {
                setIsUnlocking(false);
                setPasscode('');
                setError('');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-zinc-950/70 border border-emerald-500/25 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col items-center text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
            >
              {/* Decorative light reflection on top */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 animate-pulse">
                <Lock className="w-5 h-5" />
              </div>

              {/* Logged in User Profile Info */}
              <div className="flex flex-col items-center mb-4">
                <div className={`w-14 h-14 rounded-full ${localStorage.getItem('kys_profile_color_' + currentUser?.id) || 'bg-emerald-600'} text-white flex items-center justify-center font-black text-lg shadow-md border-2 border-emerald-500/30 mb-2 uppercase`}>
                  {userInitials}
                </div>
                <h3 className="font-extrabold text-base text-zinc-100 tracking-tight">{currentUser?.name || 'Saha Personeli'}</h3>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md mt-1">
                  {currentUser?.roleName || 'Personel'}
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-2 font-medium">Güvenli Moddan Çıkmak İçin Şifrenizi Giriniz</p>
              {/* Passcode Indicator Bullets */}
              <div className="flex justify-center gap-4 my-4 relative">
                {/* Hidden Input for Mobile Keyboard & Accessibility */}
                <input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setError('');
                    const val = e.target.value.replace(/\D/g, '');
                    setPasscode(val);
                    if (val.length === 4) {
                      setTimeout(() => handleVerify(val), 150);
                    }
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full z-10 cursor-text"
                />
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                      index < passcode.length
                        ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                        : 'border-white/20 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Error Message Container */}
              <div className="h-6 text-center text-[11px] text-rose-400 font-bold tracking-wide mb-3 flex items-center justify-center">
                {error && (
                  <span className="flex items-center justify-center gap-1.5 animate-shake">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </span>
                )}
              </div>
              {/* Actions & Hint */}
              <div className="mt-6 space-y-3 w-full border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsUnlocking(false);
                    setPasscode('');
                    setError('');
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-400 transition cursor-pointer"
                >
                  Vazgeç (Kilidi Kapat)
                </button>
                <div className="text-[9px] text-zinc-500 leading-normal font-mono">
                  {getExpectedPasscodeHint()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1.5s infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
