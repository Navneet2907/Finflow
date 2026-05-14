/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, Database, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Globe, Link as LinkIcon } from 'lucide-react';
import { Transaction } from '../lib/types';
import { DEMO_TRANSACTIONS, saveLocalTransactions, syncLocalToFirestore } from '../lib/data';
import { categorizeTransaction } from '../lib/categorizer';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { validateTransaction, validateCSVHeaders, validateCSVFile } from '../lib/validation';

interface UploadCSVProps {
  onDataLoaded: (data: Transaction[]) => void;
}

export function UploadCSV({ onDataLoaded }: UploadCSVProps) {
  const { user, isGuest, logout } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (confirm('Cancel and return to initialization?')) {
      logout();
    }
  };

  const handleDemoData = async () => {
    setIsProcessing(true);
    if (user) {
      await syncLocalToFirestore(user.uid, DEMO_TRANSACTIONS);
    } else {
      saveLocalTransactions(DEMO_TRANSACTIONS);
    }
    onDataLoaded(DEMO_TRANSACTIONS);
    setIsProcessing(false);
  };

  const processCSV = async (text: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) throw new Error('The CSV file appears to be empty or only contains headers.');

      const headers = lines[0].split(',').map(h => h.trim());
      const headerError = validateCSVHeaders(headers);
      if (headerError) throw new Error(headerError);

      const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
      const dateIdx = normalizedHeaders.indexOf('date');
      const merchantIdx = normalizedHeaders.indexOf('merchant');
      const amountIdx = normalizedHeaders.indexOf('amount');

      const transactions: Transaction[] = [];
      const rowErrors: string[] = [];

      lines.slice(1).forEach((line, i) => {
        const values = line.split(',').map(v => v.trim());
        if (values.length < 3 && values[0] === '') return; // Skip empty rows

        const rawAmount = parseFloat(values[amountIdx]);
        const partialData: Partial<Transaction> = {
          date: values[dateIdx],
          merchant: values[merchantIdx],
          amount: rawAmount,
          category: categorizeTransaction(values[merchantIdx] || '')
        };

        const validationErrors = validateTransaction(partialData);
        if (validationErrors.length > 0) {
          rowErrors.push(`Row ${i + 2}: ${validationErrors.join(' ')}`);
          return;
        }

        transactions.push({
          ...partialData,
          id: `csv-${Date.now()}-${i}`,
          time: '12:00',
          paymentMethod: 'Imported',
          currency: 'INR',
          status: 'Completed',
          userId: user?.uid || 'guest'
        } as Transaction);
      });

      if (rowErrors.length > 0) {
        // If more than 5 errors, just summarize
        if (rowErrors.length > 5) {
          throw new Error(`Data Integrity Error: Found ${rowErrors.length} invalid rows in your CSV. Please check date formats and ensure amounts are numbers.`);
        }
        throw new Error(`Invalid data found in CSV:\n${rowErrors.join('\n')}`);
      }

      if (transactions.length === 0) {
        throw new Error('No valid transactions found in the file.');
      }

      if (user) {
        await syncLocalToFirestore(user.uid, transactions);
      } else {
        saveLocalTransactions(transactions);
      }
      onDataLoaded(transactions);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while parsing the CSV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchRemote = async () => {
    if (!remoteUrl) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Logic for handling GitHub raw URLs specifically or any direct CSV link
      let url = remoteUrl;
      if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText} (${response.status})`);
      const text = await response.text();
      await processCSV(text);
    } catch (e: any) {
      setError(`Network/GitHub Error: ${e.message}. Please ensure the URL is a raw CSV link and CORS is allowed.`);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileError = validateCSVFile(file);
      if (fileError) {
        setError(fileError);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => processCSV(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fileError = validateCSVFile(file);
      if (fileError) {
        setError(fileError);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => processCSV(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 p-8">
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition-all flex items-center justify-center"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Database className="w-32 h-32" />
      </div>

      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-3xl mb-6 shadow-inner">
          <Database className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Synchronize Engine</h2>
        <p className="text-slate-500 mt-2 font-medium">Link your ledger to unlock AI financial intelligence.</p>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={cn(
          "relative group border-2 border-dashed rounded-[2rem] p-16 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 text-center overflow-hidden",
          isDragging ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-400",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          isDragging && "opacity-100"
        )} />
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
        
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
          isDragging ? "bg-emerald-500 text-white scale-110 rotate-12" : "bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm"
        )}>
          <Upload className="w-8 h-8" />
        </div>

        <div className="relative">
          <p className="text-lg font-black text-slate-800">Bank Statement (.CSV)</p>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">Drop your exports here</p>
        </div>
        
        <div className="flex items-center gap-2 py-1 px-3 bg-white/80 rounded-full border border-slate-100 shadow-sm">
          <FileText className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Header Auto-Detection</span>
        </div>
      </div>

      <div className="mt-6">
        <button 
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors mx-auto"
        >
          <Globe className="w-3.5 h-3.5" />
          {showUrlInput ? 'Hide URL Option' : 'Load from GitHub/URL'}
        </button>

        <AnimatePresence>
          {showUrlInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="url" 
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../ledger.csv"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <button
                  onClick={handleFetchRemote}
                  disabled={isProcessing || !remoteUrl}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                >
                  Fetch
                </button>
              </div>
              <p className="mt-2 text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center">
                Supports GitHub Raw Links and any CORS-enabled CSV URL
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Integrity Fail</p>
            <p className="text-xs text-rose-700 leading-relaxed font-semibold italic">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 w-full">
          <div className="h-px bg-slate-100 flex-1" />
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Neural Demo Sandbox</span>
          <div className="h-px bg-slate-100 flex-1" />
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: '#0f172a' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDemoData}
          disabled={isProcessing}
          className="w-full py-5 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-colors shadow-2xl shadow-slate-900/20 disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Database className="w-5 h-5 text-emerald-400" />
              Hydrate with Demo Data
            </>
          )}
        </motion.button>
        
        <div className="flex items-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Zero Tracking
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Edge Compute
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ISO Ready
          </div>
        </div>
      </div>
    </div>
  );
}
