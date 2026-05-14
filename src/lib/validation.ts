/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction } from './types';

/**
 * Validates a single transaction object for type safety and data integrity.
 */
export function validateTransaction(t: Partial<Transaction>): string[] {
  const errors: string[] = [];

  if (!t.date || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
    errors.push('Date must be in YYYY-MM-DD format.');
  }

  if (!t.merchant || t.merchant.trim().length === 0) {
    errors.push('Merchant name is required.');
  } else if (t.merchant.length > 100) {
    errors.push('Merchant name is too long (max 100 characters).');
  }

  if (typeof t.amount !== 'number' || isNaN(t.amount)) {
    errors.push('Amount must be a valid number.');
  } else if (t.amount < 0) {
    errors.push('Amount cannot be negative.');
  }

  if (!t.category || t.category.trim().length === 0) {
    errors.push('Category is required.');
  }

  return errors;
}

/**
 * Validates a CSV file header structure.
 */
export function validateCSVHeaders(headers: string[]): string | null {
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  const required = ['date', 'merchant', 'amount'];
  const missing = required.filter(h => !normalizedHeaders.includes(h));

  if (missing.length > 0) {
    return `Missing required CSV columns: ${missing.join(', ')}.`;
  }

  return null;
}

/**
 * Validates a CSV file's overall integrity.
 */
export function validateCSVFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return 'Invalid file type. Please upload a .csv file.';
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return 'File is too large. Maximum size is 5MB.';
  }

  return null;
}
