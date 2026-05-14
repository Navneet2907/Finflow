/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { Hash } from 'lucide-react';

interface TopMerchantsProps {
  transactions: Transaction[];
}

export function TopMerchants({ transactions }: TopMerchantsProps) {
  const merchantTotals = transactions.reduce((acc: any, t) => {
    acc[t.merchant] = (acc[t.merchant] || 0) + t.amount;
    return acc;
  }, {});

  const data = Object.entries(merchantTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => (b.value as number) - (a.value as number))
    .slice(0, 8);

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-[450px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Hash className="w-32 h-32 text-emerald-600" />
      </div>

      <div className="mb-10 relative z-10 text-center lg:text-left">
        <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Entity Allocation</h3>
        <p className="text-[10px] font-bold text-slate-400 italic">Merchant volume analysis</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 120, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f8fafc" vertical={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900, textAnchor: 'end' }}
              width={110}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc', radius: 4 }}
              formatter={(value: number) => [formatCurrency(value), 'Allocation']}
              contentStyle={{ 
                borderRadius: '1.5rem', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '12px 16px'
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24} animationDuration={2000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#10b98120'} className="hover:opacity-80 transition-opacity" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
