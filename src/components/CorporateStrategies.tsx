/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CorporateStrategy } from '../lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { Target, TrendingUp, ShieldCheck, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface CorporateStrategiesProps {
  strategies: CorporateStrategy[];
}

export function CorporateStrategies({ strategies }: CorporateStrategiesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(strategies[0]?.id || null);

  const activeStrategy = strategies.find(s => s.id === selectedId);

  const getIcon = (id: string) => {
    if (id.includes('wealth')) return TrendingUp;
    if (id.includes('tax')) return Target;
    return ShieldCheck;
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target className="w-32 h-32 text-emerald-600" />
      </div>

      <div className="mb-10 relative z-10">
        <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Strategic Growth Paths</h3>
        <p className="text-[10px] font-bold text-slate-400 italic">Corporate wealth optimization models</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
        {strategies.map((strategy) => {
          const Icon = getIcon(strategy.id);
          const isActive = selectedId === strategy.id;
          
          return (
            <button
              key={strategy.id}
              onClick={() => setSelectedId(strategy.id)}
              className={cn(
                "p-5 rounded-2xl border text-left transition-all relative overflow-hidden group/btn",
                isActive 
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/20" 
                  : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-emerald-200"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-3 transition-transform group-hover/btn:scale-110", isActive ? "text-emerald-100" : "text-emerald-600")} />
              <h4 className="text-[11px] font-black uppercase tracking-widest mb-1">{strategy.name}</h4>
              <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60", isActive ? "text-emerald-50" : "text-slate-400")}>
                {strategy.targetPersona}
              </p>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeStrategy && (
          <motion.div
            key={activeStrategy.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col relative z-10"
          >
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-6 group/info">
               <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">Strategy Overview</h5>
               <p className="text-[13px] font-bold text-slate-800 leading-relaxed italic mb-4">
                 "{activeStrategy.description}"
               </p>
               <div className="flex items-center gap-3 py-3 px-4 bg-emerald-500/10 border border-emerald-500/10 rounded-xl">
                 <Zap className="w-3.5 h-3.5 text-emerald-600" />
                 <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                   Potential Impact: {activeStrategy.potentialImpact}
                 </span>
               </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Execution Roadmap</h5>
              {activeStrategy.steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl group/step hover:border-emerald-200 hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover/step:bg-emerald-50 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 group-hover/step:text-emerald-600 font-mono">0{i+1}</span>
                  </div>
                  <div className="flex-1">
                    <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{step.title}</h6>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{step.description}</p>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/step:bg-emerald-600 group-hover/step:text-white transition-all">
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/40 hover:bg-black transition-all flex items-center justify-center gap-3 group">
              Initialize Strategic Deployment
              <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-125" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
