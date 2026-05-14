/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HealthScore } from '../lib/types';
import { motion } from 'motion/react';

interface FinancialHealthScoreProps {
  healthScore: HealthScore;
}

export function FinancialHealthScore({ healthScore }: FinancialHealthScoreProps) {
  const { score, label, breakdown, recommendations } = healthScore;

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10b981'; // emerald-500
    if (s >= 60) return '#3b82f6'; // blue-500
    if (s >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // rose-500
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <div className="w-32 h-32 border-8 border-emerald-500 rounded-full" />
      </div>

      <div className="mb-10 relative z-10 text-center lg:text-left">
        <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Vital Metrics</h3>
        <p className="text-[10px] font-bold text-slate-400 italic">Core health assessment</p>
      </div>
      
      <div className="flex flex-col items-center py-6 mb-8 relative z-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
            <circle
              className="text-slate-100 stroke-current"
              strokeWidth="8"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <motion.circle
              className="stroke-current transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
              style={{
                stroke: scoreColor,
                strokeDasharray: '276.46',
                strokeDashoffset: 276.46 - (276.46 * score) / 100,
              }}
              initial={{ strokeDashoffset: 276.46 }}
              animate={{ strokeDashoffset: 276.46 - (276.46 * score) / 100 }}
            />
          </svg>
          <div className="text-center group-hover:scale-110 transition-transform">
            <span className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{score}</span>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-2 py-0.5 px-2 rounded-full inline-block" style={{ backgroundColor: `${scoreColor}10`, color: scoreColor }}>{label}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-10 relative z-10">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-[10px] font-black text-slate-900 font-mono italic">{Math.round(value)}%</span>
            </div>
            <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden ring-1 ring-slate-100">
              <motion.div 
                className="h-full rounded-full transition-all duration-1000" 
                style={{ backgroundColor: scoreColor }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-dashed border-slate-200 relative z-10">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Neural Guidance</h4>
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-[11px] text-slate-700 leading-relaxed font-bold italic opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
