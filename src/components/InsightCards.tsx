/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinancialInsight } from '../lib/types';
import { TrendingUp, AlertCircle, Bookmark, Zap, Target, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { aiService } from '../services/geminiService';

interface InsightCardsProps {
  insights: FinancialInsight[];
  transactions?: any[];
  variant?: 'default' | 'compact';
}

export function InsightCards({ insights, transactions = [], variant = 'default' }: InsightCardsProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [aiInsights, setAiInsights] = useState<FinancialInsight[] | null>(null);

  const displayInsights = aiInsights || insights;

  const handleAiRefinement = async () => {
    setIsRefining(true);
    const refined = await aiService.refineInsights(transactions);
    if (refined.length > 0) setAiInsights(refined);
    setIsRefining(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'spike': return TrendingUp;
      case 'anomaly': return AlertCircle;
      case 'pattern': return Bookmark;
      case 'suggestion': return Zap;
      case 'strategy': return Target;
      default: return Zap;
    }
  };

  if (variant === 'compact') {
    const topInsight = insights[0];
    if (!topInsight) return null;
    const Icon = getIcon(topInsight.type);

    return (
      <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] flex items-center gap-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full -mr-12 -mt-12 opacity-10 group-hover:scale-110 transition-transform" />
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0 shadow-xl shadow-emerald-600/20 relative z-10">
          <Icon className="w-5 h-5" />
        </div>
        <div className="relative z-10">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Primary Neural Output</p>
          <p className="text-[11px] text-emerald-900 leading-relaxed font-bold italic">
            {topInsight.description}
          </p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low': return 'bg-slate-50 text-slate-700 border-slate-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-full overflow-hidden flex flex-col relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Zap className="w-32 h-32 text-emerald-600" />
      </div>

      <div className="mb-10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Expert Reasoning</h3>
          <p className="text-[10px] font-bold text-slate-400 italic">Neural pattern detection</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAiRefinement}
          disabled={isRefining}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all group/refine"
        >
          {isRefining ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
          )}
          {isRefining ? 'Neural Refining...' : 'AI Refinement'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 relative z-10">
        {displayInsights.map((insight, idx) => {
          const Icon = getIcon(insight.type);
          return (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group/card"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 group-hover/card:border-emerald-200 group-hover/card:scale-110 transition-all shadow-sm">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className={cn("text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full border shadow-sm", getSeverityColor(insight.severity))}>
                  {insight.severity} Priority
                </span>
              </div>
              <h4 className="text-[13px] font-black text-slate-900 mb-2 uppercase tracking-tight">{insight.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed italic font-bold opacity-80 mb-4">
                "{insight.description}"
              </p>
              {insight.actionLabel && (
                <button className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-600/20 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">
                  {insight.actionLabel}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
