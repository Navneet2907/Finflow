/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, HealthScore } from './types';

export function calculateHealthScore(transactions: Transaction[]): HealthScore {
  if (transactions.length === 0) {
    return {
      score: 0,
      label: 'Needs Attention',
      breakdown: { spendingControl: 0, savingsRate: 0, categoryDiversity: 0, consistency: 0 },
      recommendations: ['Add some transactions to see your health score.']
    };
  }

  // 1. Spending Control (Relative to average)
  // Simple heuristic for demo
  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
  const avgMonthly = totalSpend / 3; // Approx 3 months in demo
  const budget = 50000;
  const spendingControl = Math.min(100, Math.max(0, 100 - (avgMonthly / budget) * 50));

  // 2. Savings Rate (Assume income is 1.3x spending for demo)
  const income = totalSpend * 1.3;
  const savings = income - totalSpend;
  const savingsRate = (savings / income) * 100;

  // 3. Category Diversity
  const categories = new Set(transactions.map(t => t.category));
  const categoryDiversity = Math.min(100, (categories.size / 8) * 100);

  // 4. Consistency (Frequency of transactions)
  const transactionFrequency = transactions.length / 90; // Over 90 days
  const consistency = Math.min(100, transactionFrequency * 100);

  // Weighted Score
  const score = Math.round(
    spendingControl * 0.3 + 
    savingsRate * 0.3 + 
    categoryDiversity * 0.2 + 
    consistency * 0.2
  );

  let label = 'Needs Attention';
  if (score >= 80) label = 'Excellent';
  else if (score >= 60) label = 'Good';
  else if (score >= 40) label = 'Fair';

  const recommendations = [];
  if (spendingControl < 60) recommendations.push('Corporate lifestyle creep detected. Cap discretionary spend at 30% of net income.');
  if (categoryDiversity < 50) recommendations.push('Diversify your corporate benefits; ensure you are utilizing tax-saving categories.');
  if (savingsRate < 25) recommendations.push('Target a 30% savings rate for aggressive wealth compounding.');
  if (recommendations.length === 0) recommendations.push('Elite financial discipline detected. Consider legacy planning or aggressive pre-payments.');

  return {
    score,
    label,
    breakdown: { spendingControl, savingsRate, categoryDiversity, consistency },
    recommendations: recommendations.slice(0, 3)
  };
}
