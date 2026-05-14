/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Budget } from './types';
import { categorizeTransaction } from './categorizer';
import { db, auth, handleFirestoreError } from './firebase';
import { 
  collection, 
  query, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  writeBatch,
  where,
  orderBy
} from 'firebase/firestore';

const MERCHANTS = [
  'Zomato', 'Swiggy', 'Uber', 'Ola', 'Amazon', 'Flipkart', 'Netflix', 'Airtel', 
  'Apollo Pharmacy', 'Starbucks', 'McDonald\'s', 'BigBasket', 'Blinkit', 'Myntra',
  'Spotify', 'Disney+ Hotstar', 'Cult.fit', 'PVR Cinemas', 'BookMyShow', 'Airtel Broadband',
  'Jio Fiber', 'Amazon Prime', 'Apple Music', 'Udemy', 'Tata Play', 'Blue Tokai',
  'IndiGo', 'Irctc', 'Blinkit', 'Zomato Gold', 'Swiggy One', 'Urban Company', 'Nykaa'
];

const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Amazon Pay', 'Paytm Wallet'];

function generateDemoTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < 60; i++) {
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 120)); // Last 4 months
    
    const dateStr = date.toISOString().split('T')[0];
    const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    const category = categorizeTransaction(merchant);
    
    // Realistic Indian amounts
    let amount = 0;
    if (category === 'Food & Dining') amount = Math.floor(Math.random() * 800) + 150;
    else if (category === 'Transport') amount = Math.floor(Math.random() * 400) + 60;
    else if (category === 'Shopping') amount = Math.floor(Math.random() * 5000) + 500;
    else if (category === 'Groceries') amount = Math.floor(Math.random() * 2000) + 200;
    else if (category === 'Subscriptions') amount = Math.floor(Math.random() * 1000) + 199;
    else if (category === 'Travel') amount = Math.floor(Math.random() * 8000) + 2000;
    else amount = Math.floor(Math.random() * 1500) + 100;

    transactions.push({
      id: `tr-${i}`,
      date: dateStr,
      time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      merchant,
      category,
      amount,
      paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
      currency: 'INR',
      status: 'Completed'
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

export const DEMO_TRANSACTIONS = generateDemoTransactions();

const STORAGE_KEY = 'finflow_transactions';

export function loadLocalTransactions(): Transaction[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse transactions', e);
      return [];
    }
  }
  return [];
}

export function saveLocalTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function clearLocalTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}

// Firestore Operations
const getTransactionRef = (userId: string, transactionId: string) => 
  doc(db, 'users', userId, 'transactions', transactionId);

const getTransactionsCollection = (userId: string) => 
  collection(db, 'users', userId, 'transactions');

export async function loadFirestoreTransactions(userId: string): Promise<Transaction[]> {
  try {
    const q = query(getTransactionsCollection(userId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Transaction);
  } catch (e) {
    return handleFirestoreError(e, 'list', `/users/${userId}/transactions`);
  }
}

export async function saveTransactionToFirestore(userId: string, transaction: Transaction) {
  try {
    const ref = getTransactionRef(userId, transaction.id);
    await setDoc(ref, { ...transaction, userId });
  } catch (e) {
    return handleFirestoreError(e, 'create', `/users/${userId}/transactions/${transaction.id}`);
  }
}

export async function deleteTransactionFromFirestore(userId: string, transactionId: string) {
  try {
    const ref = getTransactionRef(userId, transactionId);
    await deleteDoc(ref);
  } catch (e) {
    return handleFirestoreError(e, 'delete', `/users/${userId}/transactions/${transactionId}`);
  }
}

export async function syncLocalToFirestore(userId: string, transactions: Transaction[]) {
  const batch = writeBatch(db);
  transactions.forEach(t => {
    const ref = getTransactionRef(userId, t.id);
    batch.set(ref, { ...t, userId });
  });
  await batch.commit();
}

// Budget Operations
const BUDGET_STORAGE_KEY = 'finflow_budgets';

export function loadLocalBudgets(): Budget[] {
  const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse budgets', e);
      return [];
    }
  }
  return [];
}

export function saveLocalBudgets(budgets: Budget[]) {
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
}

const getBudgetsCollection = (userId: string) => 
  collection(db, 'users', userId, 'budgets');

export async function loadFirestoreBudgets(userId: string): Promise<Budget[]> {
  try {
    const snapshot = await getDocs(getBudgetsCollection(userId));
    return snapshot.docs.map(doc => doc.data() as Budget);
  } catch (e) {
    return handleFirestoreError(e, 'list', `/users/${userId}/budgets`);
  }
}

export async function saveBudgetsToFirestore(userId: string, budgets: Budget[]) {
  try {
    const batch = writeBatch(db);
    budgets.forEach(b => {
      const ref = doc(db, 'users', userId, 'budgets', b.category);
      batch.set(ref, { ...b, userId });
    });
    await batch.commit();
  } catch (e) {
    return handleFirestoreError(e, 'write', `/users/${userId}/budgets`);
  }
}
