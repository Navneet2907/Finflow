/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Transaction, HealthScore, FinancialInsight } from './lib/types';
import { 
  loadLocalTransactions, 
  loadFirestoreTransactions, 
  DEMO_TRANSACTIONS, 
  saveLocalTransactions 
} from './lib/data';
import { calculateHealthScore } from './lib/healthScore';
import { generateInsights } from './lib/insights';
import { Dashboard } from './components/Dashboard';
import { UploadCSV } from './components/UploadCSV';
import { Login } from './components/Login';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const { user, loading: authLoading, isGuest } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // If we're not a guest and not signed in, we're going to show the Login screen,
      // so we don't need to be in a "data loading" state.
      if (!user && !isGuest) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      let data: Transaction[] = [];

      try {
        if (user) {
          // Authenticated user
          data = await loadFirestoreTransactions(user.uid);
        } else if (isGuest) {
          // Guest user
          data = loadLocalTransactions();
          if (data.length === 0) {
            // Default demo data for guest if empty
            data = DEMO_TRANSACTIONS;
            saveLocalTransactions(data);
          }
        }

        if (data.length > 0) {
          updateAppState(data);
        } else {
          setTransactions([]);
          setHealthScore(null);
          setInsights([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setDataLoading(false);
      }
    }

    if (!authLoading) {
      fetchData();
    }
  }, [user, isGuest, authLoading]);

  const updateAppState = (data: Transaction[]) => {
    setTransactions(data);
    setHealthScore(calculateHealthScore(data));
    setInsights(generateInsights(data));
  };

  const handleDataLoaded = (data: Transaction[]) => {
    updateAppState(data);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] relative overflow-hidden">
        {/* Background decorative elements - Dark Neural Theme */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          <div className="relative mb-10">
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            </div>
            {/* Orbital Rings */}
            <div className="absolute inset-x-[-20px] inset-y-[-20px] border border-emerald-500/20 rounded-[3rem] animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-x-[-40px] inset-y-[-40px] border border-blue-500/10 rounded-[4rem] animate-[spin_15s_linear_infinite_reverse]" />
          </div>

          <div className="text-center">
            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-3">Finflow Central Intelligence</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Synchronizing Neural Cores...</p>
            </div>
          </div>
          
          <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // If not logged in and not a guest, show Login
  if (!user && !isGuest) {
    return <Login />;
  }

  // If no transactions, show Upload (Authenticated users might need to upload data too)
  if (transactions.length === 0) {
    return <UploadCSV onDataLoaded={handleDataLoaded} />;
  }

  return healthScore && <Dashboard transactions={transactions} healthScore={healthScore} insights={insights} />;
}

