/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CATEGORY_COLORS } from './types';

const MERCHANT_MAP: Record<string, string> = {
  'zomato': 'Food & Dining',
  'swiggy': 'Food & Dining',
  'starbucks': 'Food & Dining',
  'mcdonald': 'Food & Dining',
  'uber': 'Transport',
  'ola': 'Transport',
  'irctc': 'Travel',
  'indigo': 'Travel',
  'airtel': 'Utilities',
  'jio': 'Utilities',
  'bescom': 'Utilities',
  'amazon': 'Shopping',
  'flipkart': 'Shopping',
  'myntra': 'Shopping',
  'netflix': 'Subscriptions',
  'spotify': 'Subscriptions',
  'hotstar': 'Subscriptions',
  'apollo': 'Health & Fitness',
  'cult.fit': 'Health & Fitness',
  'bigbasket': 'Groceries',
  'blinkit': 'Groceries',
  'reliance fresh': 'Groceries',
  'pvr': 'Entertainment',
  'bookmyshow': 'Entertainment',
  'udemy': 'Education',
  'coursera': 'Education',
  'zerodha': 'Investments',
  'groww': 'Investments',
  'indmoney': 'Investments',
  'kuvera': 'Investments',
  'nps': 'Investments',
  'ppf': 'Investments',
};

export function categorizeTransaction(merchant: string): string {
  const m = merchant.toLowerCase();
  
  for (const [key, category] of Object.entries(MERCHANT_MAP)) {
    if (m.includes(key)) return category;
  }

  // Fallback keyword matching
  if (m.includes('food') || m.includes('restaurant') || m.includes('cafe')) return 'Food & Dining';
  if (m.includes('pharmacy') || m.includes('hospital') || m.includes('gym')) return 'Health & Fitness';
  if (m.includes('cab') || m.includes('auto') || m.includes('petrol')) return 'Transport';
  if (m.includes('mart') || m.includes('store') || m.includes('dairy')) return 'Groceries';
  if (m.includes('invest') || m.includes('mutual fund') || m.includes('stock') || m.includes('sip')) return 'Investments';
  
  return 'Others';
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Others'];
}
