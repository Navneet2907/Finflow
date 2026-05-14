/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction, HealthScore, FinancialInsight } from '../lib/types';
import { MetricCard } from './MetricCard';
import { SpendingChart } from './SpendingChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RecentTransactions } from './RecentTransactions';
import { VoiceBriefing } from './VoiceBriefing';
import { FinancialHealthScore } from './FinancialHealthScore';
import { InsightCards } from './InsightCards';
import { TopMerchants } from './TopMerchants';
import { CorporateStrategies } from './CorporateStrategies';
import { BehavioralInsights } from './BehavioralInsights';
import { BudgetTracker } from './BudgetTracker';
import { CreditCard, Wallet, Calendar, Hash, LogOut, LayoutDashboard, Zap, Target, Menu, X, Brain, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clearLocalTransactions } from '../lib/data';
import { getCorporateStrategies } from '../lib/insights';
import { cn } from '../lib/utils';

import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  transactions: Transaction[];
  healthScore: HealthScore;
  insights: FinancialInsight[];
}

export function Dashboard({ transactions, healthScore, insights }: DashboardProps) {
  const { user, isGuest, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const corporateStrategies = getCorporateStrategies();
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const now = new Date();
  const thisMonthData = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthSpend = thisMonthData.reduce((sum, t) => sum + t.amount, 0);
  const avgDaily = transactions.length > 0 ? totalSpent / 90 : 0; 

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    // Improved logout reliability
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return isGuest ? 'GS' : '??';
  };

  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 lg:static w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">Finflow</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-5 py-4 space-y-2">
          <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Core Operating Suite</p>
          <button 
            onClick={() => scrollTo('dashboard-top')} 
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/10 text-left"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => scrollTo('ledger-section')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group text-left"
          >
            <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
            Transactions
          </button>
          <button 
            onClick={() => scrollTo('insights-section')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group text-left"
          >
            <Zap className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
            AI Insights
          </button>
          <button 
            onClick={() => scrollTo('habits-section')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group text-left"
          >
            <Brain className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
            Spending Habits
          </button>
          <button 
            onClick={() => scrollTo('budget-section')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group text-left"
          >
            <ShieldAlert className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
            Budget Guardrails
          </button>
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10">
              <p className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em] mb-2">
                {user ? 'Verified Account' : 'Guest Instance'}
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-black">
                  {getUserInitials()}
                </div>
                <p className="font-bold text-xs truncate max-w-[120px]">
                  {user ? (user.displayName || user.email) : 'Finflow Guest'}
                </p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#f43f5e' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full py-3 bg-white/10 hover:bg-rose-500/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Terminate Session
              </motion.button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header Bar */}
        <header id="dashboard-top" className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-10 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Operating Parameters: Verified</p>
              <h1 className="text-sm md:text-xl font-black text-slate-900 tracking-tighter">
                {user ? `System Core: ${user.displayName?.split(' ')[0]}` : 'Neural Clarity Engine'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 hover:border-rose-200 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Login</span>
              <span className="sm:hidden">Exit</span>
            </motion.button>
            <VoiceBriefing insights={insights} transactions={transactions} variant="header" />
            <div className="hidden sm:flex w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-black text-emerald-700">{getUserInitials()}</span>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Grid Content */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="p-6 grid grid-cols-12 gap-6 flex-1 overflow-y-auto"
        >
          
          {/* Metric Cards (4 Columns) */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-3">
            <MetricCard title="Total Spent" value={totalSpent} icon={Wallet} trend={{ value: 12, isUp: false }} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-3">
            <MetricCard title="This Month" value={monthSpend} icon={Calendar} trend={{ value: 4, isUp: true }} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-3">
            <MetricCard title="Daily Avg" value={avgDaily} icon={Hash} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-3">
            <MetricCard title="Subscribed" value={transactions.filter(t => t.category === 'Subscriptions').length} icon={CreditCard} subtitle="Items tracked" />
          </motion.div>

          {/* Center Section: Spending Trend & Category Breakdown */}
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } }} className="col-span-12 lg:col-span-8 h-[450px]">
            <SpendingChart transactions={transactions} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } }} className="col-span-12 lg:col-span-4 h-[450px]">
            <CategoryBreakdown transactions={transactions} />
          </motion.div>

          {/* Behavior & Spending Habits Section */}
          <motion.div id="habits-section" variants={{ hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } }} className="col-span-12">
            <BehavioralInsights transactions={transactions} />
          </motion.div>

          {/* AI Budget Guardrails Section */}
          <motion.div id="budget-section" variants={{ hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } }} className="col-span-12">
            <BudgetTracker transactions={transactions} />
          </motion.div>

          {/* Corporate Strategic Path Section */}
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } }} className="col-span-12">
            <CorporateStrategies strategies={corporateStrategies} />
          </motion.div>

          {/* Bottom Section: Health Score & Recent Activity */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <FinancialHealthScore healthScore={healthScore} />
            <VoiceBriefing insights={insights} transactions={transactions} />
          </motion.div>
          <motion.div id="ledger-section" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <RecentTransactions transactions={transactions} />
            <div id="insights-section" className="mt-auto">
              <InsightCards insights={insights} transactions={transactions} variant="compact" />
            </div>
          </motion.div>

          {/* Top Merchants (Full width at bottom or in its own section) */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-12">
            <TopMerchants transactions={transactions} />
          </motion.div>
          
          <div className="col-span-12 py-8 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">
              Professional Insight Engine • v2.5.0
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
