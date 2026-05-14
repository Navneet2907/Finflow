/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  subtitle?: string;
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, subtitle, className }: MetricCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -6, borderColor: '#10b981', shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      className={cn("bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-full flex flex-col justify-between group transition-all duration-500 relative overflow-hidden", className)}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none">
        <Icon className="w-20 h-20 text-slate-900" />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.25em] shrink-0 opacity-60">{title}</span>
        <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner">
          <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2 mb-4">
          <p className="text-4xl font-black text-slate-900 tracking-tighter">
            {title === 'Transactions' || title === 'Subscribed' ? value : formatCurrency(value)}
          </p>
          {trend && (
            <span className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded-full tracking-tighter shadow-sm border transition-all",
              trend.isUp ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
            )}>
              {trend.isUp ? '↑' : '↓'} {trend.value}%
            </span>
          )}
        </div>
        
        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 transition-all duration-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight italic flex items-center gap-2">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", trend?.isUp ? "bg-rose-400" : "bg-emerald-400")} />
            {subtitle || (trend ? (trend.isUp ? "Above average velocity" : "Efficiency maximized") : "Nominal performance")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
