/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, FinancialInsight, CorporateStrategy } from './types';
import { formatCurrency } from './utils';

export function generateInsights(transactions: Transaction[]): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  if (transactions.length === 0) return [];

  // Group by category
  const categorySpends: Record<string, number> = {};
  const merchantCounts: Record<string, number> = {};
  
  transactions.forEach(t => {
    categorySpends[t.category] = (categorySpends[t.category] || 0) + t.amount;
    merchantCounts[t.merchant] = (merchantCounts[t.merchant] || 0) + 1;
  });

  const totalSpend = Object.values(categorySpends).reduce((sum, val) => sum + val, 0);
  const avgCategorySpend = totalSpend / (Object.keys(categorySpends).length || 1);

  // 1. SPIKE detection
  Object.entries(categorySpends).forEach(([cat, amount]) => {
    if (amount > avgCategorySpend * 1.5) {
      insights.push({
        id: `spike-${cat}`,
        type: 'spike',
        title: `${cat} Overload`,
        description: `You've spent ${formatCurrency(amount)} on ${cat} this period, which is 50% above your category average.`,
        category: cat,
        amount,
        severity: 'high',
        actionLabel: 'Review Category'
      });
    }
  });

  // 2. SURPLUS STRATEGY (Corporate Focused)
  // Assume a default monthly estimated income if not detectable
  const estMonthlyIncome = 120000; // Realistic corporate salary for demo
  const monthlySpend = totalSpend / 3; // Estimate for current month if 3 months data
  const surplus = estMonthlyIncome - monthlySpend;

  if (surplus > 20000) {
    insights.push({
      id: 'strategy-surplus',
      type: 'strategy',
      title: 'Wealth Deployment',
      description: `You have an estimated monthly surplus of ${formatCurrency(surplus)}. Invest ₹15,000 into a Nifty 50 Index Fund for long-term growth.`,
      severity: 'low',
      actionLabel: 'Start SIP'
    });
  }

  // 3. TAX EFFICIENCY (Corporate Focused)
  const shoppingSpend = categorySpends['Shopping'] || 0;
  if (shoppingSpend > 15000) {
    insights.push({
      id: 'strategy-tax',
      type: 'strategy',
      title: 'Tax Shield Strategy',
      description: `High discretionary spend detected. Redirect ₹5,000 from 'Shopping' to an ELSS Mutual Fund to save up to ₹1,500 in tax monthly (u/s 80C).`,
      severity: 'medium',
      actionLabel: 'Explore ELSS'
    });
  }

  // 4. ANOMALY detection (Single large transaction)
  const sortedByAmount = [...transactions].sort((a, b) => b.amount - a.amount);
  if (sortedByAmount[0] && sortedByAmount[0].amount > 5000) {
    insights.push({
      id: 'anomaly-large',
      type: 'anomaly',
      title: 'Large Transaction Alert',
      description: `Single high-value spend of ${formatCurrency(sortedByAmount[0].amount)} at ${sortedByAmount[0].merchant} identified.`,
      severity: 'medium',
      actionLabel: 'Verify Secure'
    });
  }

  // 5. SUBSCRIPTION OPTIMIZATION
  const subscriptionTotal = categorySpends['Subscriptions'] || 0;
  if (subscriptionTotal > 1500) {
    insights.push({
      id: 'suggest-subs',
      type: 'suggestion',
      title: 'Subscription Audit',
      description: `Your digital overhead is ${formatCurrency(subscriptionTotal)}. Audit recurring payments to prune services not utilized in the last 30 days.`,
      severity: 'low',
      actionLabel: 'Audit List'
    });
  }

  return insights.slice(0, 6);
}

export function getCorporateStrategies(): CorporateStrategy[] {
  return [
    {
      id: 'wealth-builder',
      name: 'The Wealth Accelerator',
      targetPersona: 'Aggressive Growth',
      description: 'Optimize for maximum net worth growth by utilizing all secondary income for equity compounding.',
      potentialImpact: 'Estimated ₹12L additional wealth over 5 years @ 12% CAGR.',
      steps: [
        { title: 'Emergency Buffer', description: 'Maintain 6 months of expenses in a Liquid Fund.' },
        { title: 'Index SIP', description: 'Automate a fixed transfer on the 1st of every month.' },
        { title: 'Lifestyle Cap', description: 'Ensure discretionary spend stays below 30% of net income.' }
      ]
    },
    {
      id: 'tax-optimizer',
      name: 'The Tax Strategist',
      targetPersona: 'Efficiency Seeker',
      description: 'Systematically reduce tax liability while building high-safety assets.',
      potentialImpact: 'Save up to ₹46,800 annually in taxes (Old Regime) or optimize for New Regime deductions.',
      steps: [
        { title: 'ELSS Allocation', description: 'Exhaust ₹1.5L limit under Section 80C.' },
        { title: 'NPS Tier 1', description: 'Utilize additional ₹50k deduction for retirement planning.' },
        { title: 'Health Insurance', description: 'Optimize for Section 80D via comprehensive coverage for family.' }
      ]
    },
    {
      id: 'stability-core',
      name: 'The Financial Fortress',
      targetPersona: 'Risk Averse',
      description: 'Focus on clearing high-interest debt and building a rock-solid safety net.',
      potentialImpact: 'Protect against market volatility and career transitions.',
      steps: [
        { title: 'CC Debt Clearance', description: 'Prioritize clearing all 36%+ APR revolving credit.' },
        { title: 'Insurance Audit', description: 'Correct under-insured status for Term & Health.' },
        { title: 'Fixed Income SIP', description: 'Build a solid base in Debt Funds/PPF.' }
      ]
    }
  ];
}
