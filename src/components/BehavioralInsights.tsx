/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, BehavioralAnalysis } from '../lib/types';
import { aiService } from '../services/geminiService';
import { Brain, Info, AlertTriangle, CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface BehavioralInsightsProps {
  transactions: Transaction[];
}

export function BehavioralInsights({ transactions }: BehavioralInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<BehavioralAnalysis[]>([]);

  const analyze = async () => {
    setLoading(true);
    // Passing transactions for AI to analyze habits
    const results = await aiService.analyzeSpendingHabits(transactions);
    setHabits(results);
    setLoading(false);
  };

  const getTendencyColor = (tendency: string) => {
    switch (tendency) {
      case 'Positive': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'Caution': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'Negative': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getTendencyIcon = (tendency: string) => {
    switch (tendency) {
      case 'Positive': return CheckCircle;
      case 'Caution': return AlertTriangle;
      case 'Negative': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Brain className="w-40 h-40 text-blue-600" />
      </div>

      <div className="mb-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Behavioral Anthropology</h3>
          <p className="text-[10px] font-bold text-slate-400 italic">How your mind spends in the real world</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? 'Analyzing Neural Patterns...' : 'Decode Spending Habits'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {habits.length > 0 ? (
            habits.map((habit, idx) => {
              const Icon = getTendencyIcon(habit.tendency);
              return (
                <motion.div
                  key={habit.id || idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group/card flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2 rounded-xl border flex items-center justify-center", getTendencyColor(habit.tendency))}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", getTendencyColor(habit.tendency))}>
                      {habit.tendency}
                    </span>
                  </div>

                  <h4 className="text-[13px] font-black text-slate-900 mb-3 tracking-tight uppercase">{habit.habitName}</h4>
                  
                  <div className="flex-1 space-y-4">
                    <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed">
                      "{habit.observation}"
                    </p>
                    
                    <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 group-hover/card:bg-white group-hover/card:border-blue-100 transition-all">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Real World Context
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold italic leading-relaxed">
                        {habit.realWorldImpact}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> Optimization Hack
                      </p>
                      <p className="text-[11px] text-emerald-900 font-bold italic leading-relaxed">
                        {habit.improvementTip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                Neural Cortex Idle: Request behavioral audit
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
