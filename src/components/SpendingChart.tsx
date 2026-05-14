/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../lib/types';
import { formatCurrency, getMonthName } from '../lib/utils';
import { TrendingUp } from 'lucide-react';

interface SpendingChartProps {
  transactions: Transaction[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  // Aggregate by month
  const monthlyData = transactions.reduce((acc: any, t) => {
    const month = getMonthName(t.date);
    const existing = acc.find((d: any) => d.name === month);
    if (existing) {
      existing.amount += t.amount;
    } else {
      acc.push({ name: month, amount: t.amount, rawDate: new Date(t.date) });
    }
    return acc;
  }, []);

  // Sort by date
  const data = monthlyData.sort((a: any, b: any) => a.rawDate - b.rawDate);

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-[450px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <TrendingUp className="w-24 h-24 text-emerald-600" />
      </div>
      
      <div className="mb-8 relative z-10">
        <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1 text-center lg:text-left">Liquidity Trajectory</h3>
        <p className="text-[10px] font-bold text-slate-400 italic text-center lg:text-left">Monthly spending velocity</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }}
              tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '1.5rem', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '12px 16px'
              }}
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
              formatter={(value: number) => [formatCurrency(value), 'Ledger Value']}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
