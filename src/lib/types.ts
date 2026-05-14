/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  merchant: string;
  category: string;
  amount: number;
  paymentMethod: string;
  currency: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface HealthScore {
  score: number; // 0-100
  label: string;
  breakdown: {
    spendingControl: number;
    savingsRate: number;
    categoryDiversity: number;
    consistency: number;
  };
  recommendations: string[];
}

export interface FinancialInsight {
  id: string;
  type: 'spike' | 'pattern' | 'anomaly' | 'suggestion' | 'strategy';
  title: string;
  description: string;
  category?: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high';
  actionLabel?: string;
}

export interface CorporateStrategy {
  id: string;
  name: string;
  description: string;
  targetPersona: string;
  steps: {
    title: string;
    description: string;
    isCompleted?: boolean;
  }[];
  potentialImpact: string;
}

export interface BehavioralAnalysis {
  id: string;
  habitName: string;
  tendency: 'Positive' | 'Caution' | 'Negative';
  observation: string;
  realWorldImpact: string;
  improvementTip: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  aiRecommendation: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f59e0b',
  'Groceries': '#10b981',
  'Transport': '#3b82f6',
  'Shopping': '#8b5cf6',
  'Entertainment': '#ec4899',
  'Utilities': '#64748b',
  'Health & Fitness': '#ef4444',
  'Travel': '#06b6d4',
  'Education': '#f97316',
  'Subscriptions': '#6366f1',
  'Investments': '#10b981',
  'Others': '#94a3b8',
};
