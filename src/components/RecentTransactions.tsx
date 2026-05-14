/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction } from '../lib/types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Search, ChevronLeft, ChevronRight, Filter, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const categories = ['All', ...new Set(transactions.map(t => t.category))].sort();

  const filtered = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-1">Transaction Ledger</h3>
          <p className="text-[10px] font-bold text-slate-400 italic">Real-time audit trail</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text"
              placeholder="Filter ledger..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 w-32 md:w-48 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="relative group">
            <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              className="pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-tighter appearance-none focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all cursor-pointer"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 scrollbar-hide">
        <table className="w-full text-left min-w-[600px] md:min-w-0">
          <thead>
            <tr className="text-[9px] uppercase text-slate-400 border-b border-slate-50 bg-slate-50/30">
              <th className="px-4 md:px-8 py-4 font-black tracking-widest text-center w-16">ID</th>
              <th className="px-4 md:px-8 py-4 font-black tracking-widest">Merchant / Entity</th>
              <th className="px-4 md:px-8 py-4 font-black tracking-widest hidden sm:table-cell">Classification</th>
              <th className="px-4 md:px-8 py-4 font-black tracking-widest text-right">Value (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length > 0 ? (
              paginated.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-4 md:px-8 py-4 text-center">
                    <span className="text-[10px] font-mono text-slate-300 font-bold">#{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                  </td>
                  <td className="px-4 md:px-8 py-4">
                    <div className="text-sm font-black text-slate-800 tracking-tight truncate max-w-[120px] md:max-w-none">{t.merchant}</div>
                    <div className="text-[10px] font-bold text-slate-400 italic mt-0.5">{formatDate(t.date)}</div>
                    <div className="sm:hidden mt-2">
                       <span className={cn(
                        "px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-widest border",
                        t.category === 'Food & Dining' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        t.category === 'Transport' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        t.category === 'Shopping' ? "bg-violet-50 text-violet-600 border-violet-100" :
                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {t.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-4 hidden sm:table-cell">
                    <span className={cn(
                      "px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest border transition-all",
                      t.category === 'Food & Dining' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      t.category === 'Transport' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      t.category === 'Shopping' ? "bg-violet-50 text-violet-600 border-violet-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-4 text-right">
                    <div className="text-sm font-black text-slate-900 font-mono tracking-tighter">
                      {formatCurrency(t.amount)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <Database className="w-8 h-8 text-slate-200 mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Null pointer: No data records match criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Displaying <span className="text-slate-900">{Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}–{Math.min(filtered.length, currentPage * itemsPerPage)}</span> of {filtered.length} units
        </div>
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:border-emerald-500 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:border-emerald-500 transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
