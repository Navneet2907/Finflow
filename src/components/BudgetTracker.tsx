/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Transaction, Budget } from '../lib/types';
import { aiService } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { 
  loadLocalBudgets, 
  saveLocalBudgets, 
  loadFirestoreBudgets, 
  saveBudgetsToFirestore 
} from '../lib/data';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Target, Sparkles, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface BudgetTrackerProps {
  transactions: Transaction[];
}

export function BudgetTracker({ transactions }: BudgetTrackerProps) {
  const { user, isGuest } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function initBudgets() {
      setLoading(true);
      let loadedBudgets: Budget[] = [];
      if (user) {
        loadedBudgets = await loadFirestoreBudgets(user.uid);
      } else if (isGuest) {
        loadedBudgets = loadLocalBudgets();
      }
      setBudgets(loadedBudgets);
      setLoading(false);
    }
    initBudgets();
  }, [user, isGuest]);

  const generateBudgets = async () => {
    setSyncing(true);
    const suggested = await aiService.suggestBudgets(transactions);
    if (suggested.length > 0) {
      setBudgets(suggested);
      if (user) {
        await saveBudgetsToFirestore(user.uid, suggested);
      } else if (isGuest) {
        saveLocalBudgets(suggested);
      }
    }
    setSyncing(false);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target className="w-40 h-40 text-emerald-600" />
      </div>

      <div className="mb-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Financial Guardrails</h3>
          <p className="text-[10px] font-bold text-slate-400 italic">AI-powered budget synthesis</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateBudgets}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all"
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {syncing ? 'Architecting Limits...' : 'Generate AI Budget'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
          ) : budgets.length > 0 ? (
            budgets.map((budget, idx) => {
              const percent = Math.min(100, (budget.spent / budget.limit) * 100);
              const isOver = budget.spent > budget.limit;
              
              return (
                <motion.div
                  key={budget.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group/card"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        isOver ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                      )}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{budget.category}</h4>
                        <p className="text-[10px] font-bold text-slate-400 italic">Target: {formatCurrency(budget.limit)}</p>
                      </div>
                    </div>
                    {isOver ? (
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    ) : percent > 80 ? (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                      <span className={cn(
                        "text-[11px] font-black font-mono italic",
                        isOver ? "text-rose-600" : "text-emerald-600"
                      )}>{Math.round(percent)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          isOver ? "bg-rose-500" : "bg-emerald-500"
                        )}
                      />
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-bold text-slate-500">{formatCurrency(budget.spent)} utilized</span>
                      <span className="text-[10px] font-bold text-slate-500">{formatCurrency(Math.max(0, budget.limit - budget.spent))} remaining</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <div className="flex items-start gap-2">
                       <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                       <p className="text-[10px] text-emerald-900 font-bold italic leading-relaxed">
                         "{budget.aiRecommendation}"
                       </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center max-w-[250px]">
                No Guardrails Active: Initialize AI Budget Synthesis
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
