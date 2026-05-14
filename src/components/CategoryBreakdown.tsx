/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction, CATEGORY_COLORS } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

export function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const categoryData = transactions.reduce((acc: any, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const data = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);

  const topCategories = data.slice(0, 5);
  const othersValue = data.slice(5).reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Zap className="w-32 h-32 text-emerald-600" />
      </div>

      <div className="mb-10 relative z-10 text-center lg:text-left">
        <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Sector Architecture</h3>
        <p className="text-[10px] font-bold text-slate-400 italic">Structural spend decomposition</p>
      </div>

      <div className="space-y-8 flex-1 relative z-10">
        {topCategories.map((cat, idx) => (
          <motion.div 
            key={cat.name} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between group/item"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-3 h-3 rounded-full shadow-inner" 
                style={{ backgroundColor: CATEGORY_COLORS[cat.name] || CATEGORY_COLORS['Others'] }} 
              />
              <span className="text-[11px] font-black text-slate-500 group-hover/item:text-slate-900 transition-colors uppercase tracking-widest">
                {cat.name}
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">{formatCurrency(cat.value)}</span>
              <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (cat.value / topCategories[0].value) * 100)}%` }}
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ backgroundColor: CATEGORY_COLORS[cat.name] || CATEGORY_COLORS['Others'], opacity: 0.9 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
        
        {othersValue > 0 && (
          <div className="flex items-center justify-between pt-6 border-t border-dashed border-slate-200">
            <div className="flex items-center gap-4 opacity-40">
              <div className="w-3 h-3 rounded-full bg-slate-200 shadow-inner" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Global Variance</span>
            </div>
            <span className="text-sm font-black text-slate-400 font-mono tracking-tighter opacity-70">{formatCurrency(othersValue)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
