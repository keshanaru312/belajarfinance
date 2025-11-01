/**
 * Constants for Budget Calculator
 * 
 * This file contains static configuration data used throughout the budget calculator:
 * - Budget rules (50:30:20, 70:20:10, 80:20:0) with their percentage allocations
 * - Default expense items for the "Needs" category to help users get started
 * 
 * These constants provide a consistent source of truth for budget recommendations
 * and initial state values.
 */

import type { BudgetRule, ExpenseItem } from './types';

// Available budget allocation rules

export const budgetRules: BudgetRule[] = [
  { name: "50:30:20", needs: 50, wants: 30, savings: 20 },
  { name: "70:20:10", needs: 70, wants: 20, savings: 10 },
  { name: "80:20:0", needs: 80, wants: 20, savings: 0 },
];

export const defaultNeeds: ExpenseItem[] = [
  { id: "need1", name: "Housing", amount: 0 },
  { id: "need2", name: "Utilities", amount: 0 },
  { id: "need3", name: "Groceries", amount: 0 },
  { id: "need4", name: "Transport", amount: 0 },
];
