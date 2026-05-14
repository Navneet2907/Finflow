import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogIn, UserCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const { loginWithGoogle, signUpWithGoogle, continueAsGuest } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [view, setView] = useState<'login' | 'signup'>('login');

  const handleGoogleAuth = async () => {
    setIsLoggingIn(true);
    try {
      if (view === 'login') {
        await loginWithGoogle();
      } else {
        await signUpWithGoogle();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/20 rounded-full blur-[80px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 relative overflow-hidden text-center"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[4rem] opacity-40" />
        
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl mb-8 shadow-2xl shadow-emerald-600/30">
            <Wallet className="text-white w-10 h-10" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Finflow</h1>
          <p className="text-slate-500 mb-12 text-sm leading-relaxed font-semibold italic">
            {view === 'login' 
              ? 'Access your unified financial intelligence suite.' 
              : 'Secure your financial future with AI-driven clarity.'}
          </p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#047857' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleAuth}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {view === 'login' ? 'Continue with Google' : 'Create Google Account'}
                </>
              )}
            </motion.button>

            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                {view === 'login' ? (
                  <>
                    New to Finflow?{' '}
                    <button onClick={() => setView('signup')} className="text-emerald-600 hover:underline">
                      Join waitlist
                    </button>
                  </>
                ) : (
                  <>
                    Already a member?{' '}
                    <button onClick={() => setView('login')} className="text-emerald-600 hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            <div className="relative py-6 flex items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Institutional Grade</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, borderColor: '#e2e8f0' }}
              whileTap={{ scale: 0.98 }}
              onClick={continueAsGuest}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
            >
              <UserCircle className="w-5 h-5 text-slate-400" />
              Experience as Guest
            </motion.button>
          </div>
        </div>

        <p className="mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Local Encryption Active <br /> Data Sovereignity Guaranteed
        </p>

        <div className="mt-8 pt-6 border-t border-slate-50">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed opacity-60">
            By signing in, you agree to our Terms of Service <br /> and Privacy Policy.
          </p>
        </div>
      </motion.div>

      <footer className="mt-12 text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] animate-pulse">
        Encrypted & Secured by Firebase
      </footer>
    </div>
  );
}
