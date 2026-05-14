/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic2, Square, Loader2 } from 'lucide-react';
import { FinancialInsight } from '../lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { aiService } from '../services/geminiService';

interface VoiceBriefingProps {
  insights: FinancialInsight[];
  transactions?: any[];
  variant?: 'default' | 'header';
}

export function VoiceBriefing({ insights, transactions = [], variant = 'default' }: VoiceBriefingProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  const speak = async () => {
    window.speechSynthesis.cancel();
    
    setIsGenerating(true);
    const script = await aiService.generateAIBriefing(transactions, insights);
    setTranscript(script);
    setIsGenerating(false);
    
    const u = new SpeechSynthesisUtterance(script);
    u.lang = 'en-IN';
    u.rate = 0.95;
    u.pitch = 1;

    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (variant === 'header') {
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={isSpeaking ? stop : speak}
        className={cn(
          "flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all border",
          isSpeaking 
            ? "bg-rose-500 text-white shadow-rose-500/20 border-rose-400" 
            : "bg-slate-900 text-white hover:bg-black shadow-slate-900/20 hover:shadow-emerald-500/10 border-slate-800"
        )}
      >
        {isSpeaking ? (
          <>
            <Square className="w-3.5 h-3.5 fill-white" />
            Abort Audio
          </>
        ) : isGenerating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Neural Compute...
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            Neural Briefing
          </>
        )}
      </motion.button>
    );
  }

  if (!supported) {
    return (
      <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 flex items-center gap-4">
        <div className="p-3 bg-rose-500 text-white rounded-2xl">
          <VolumeX className="w-6 h-6" />
        </div>
        <div>
          <p className="text-rose-900 font-black text-xs uppercase tracking-widest">Synthesis Offline</p>
          <p className="text-rose-600 text-[11px] font-bold italic">Voice synthesis is not supported in this environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-600 p-10 rounded-[3rem] shadow-2xl shadow-emerald-900/20 text-white relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
            <div className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">AI Synthesis</div>
            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          </div>
          <h3 className="text-3xl font-black mb-3 tracking-tighter">Neural Financial Briefing</h3>
          <p className="text-emerald-100 text-[13px] leading-relaxed max-w-md opacity-80 font-medium italic">
            Initialize a real-time voice synthesis session to analyze spending trajectories, structural anomalies, and smart-cache suggestions.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {isGenerating ? (
              <div className="flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] border border-white/20">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            ) : !isSpeaking ? (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={speak}
                className="group relative flex items-center justify-center w-24 h-24 bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/40 transition-all hover:bg-emerald-50"
              >
                <Volume2 className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={stop}
                className="flex items-center justify-center w-24 h-24 bg-rose-500 rounded-[2rem] shadow-2xl shadow-rose-900/40 border border-rose-400"
              >
                <Square className="w-10 h-10 text-white fill-white" />
              </motion.button>
            )}
            
            {/* Pulsing ring when speaking */}
            {isSpeaking && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 border-4 border-white opacity-20 rounded-[2rem] pointer-events-none"
              />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200">
            {isGenerating ? 'Computing Neural Context' : isSpeaking ? 'Audio Stream Active' : 'Initialize Audio'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isSpeaking && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 40 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="pt-10 border-t border-white/10 overflow-hidden"
          >
            <div className="flex justify-center gap-1.5 h-12 items-end mb-8">
              {[...Array(16)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [12, 28, 16, 44, 20, 32, 12][i % 7] }}
                  transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.6, repeatType: 'reverse' }}
                  className="w-2 bg-white/30 rounded-full"
                />
              ))}
            </div>
            <div className="bg-black/20 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/5 text-[11px] font-mono text-emerald-50 leading-relaxed max-h-40 overflow-y-auto">
              <span className="opacity-40 block mb-2 font-black uppercase tracking-widest">[NEURAL_TRANSCRIPT_LIVE]</span>
              {transcript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
