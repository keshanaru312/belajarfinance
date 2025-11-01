/**
 * Budget Utilities
 * 
 * This file contains pure utility functions for budget calculations and formatting:
 * - formatCurrency: Formats numbers as MYR currency
 * - findBestRule: Matches user's spending to closest budget rule using distance algorithm
 * - getNextRecommendation: Provides personalized advice for improving budget
 */

import { BudgetRule } from '../types';
import { budgetRules } from '../constants';

/**
 * Formats a number as Malaysian Ringgit (MYR) currency
 * @param amount - The number to format
 * @returns Formatted currency string (e.g., "RM 1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("ms-MY", {
    style: "currency",
    currency: "MYR",
  });
};

/**
 * findBestRule - Determines which budget rule best matches the user's spending pattern
 * 
 * ALGORITHM EXPLANATION:
 * This function finds the budget rule (50:30:20, 70:20:10, or 80:20:0) that most closely
 * matches the user's actual spending percentages using a "distance score" approach.
 * 
 * HOW IT WORKS:
 * 1. First, it calculates what percentage of income goes to each category:
 *    - Needs percentage = (totalNeeds / income) * 100
 *    - Wants percentage = (totalWants / income) * 100
 *    - Savings percentage = (totalSavings / income) * 100
 * 
 * 2. For each budget rule, it calculates a "distance score" by:
 *    - Finding the difference between user's % and rule's % for each category
 *    - Taking the absolute value (we care about distance, not direction)
 *    - Summing these differences together
 * 
 * 3. The rule with the LOWEST total distance score wins!
 * 
 * EXAMPLE:
 * User spends: 60% needs, 25% wants, 15% savings
 * 
 * Against 50:30:20 rule:
 *   - Needs diff: |60 - 50| = 10
 *   - Wants diff: |25 - 30| = 5
 *   - Savings diff: |15 - 20| = 5
 *   - Total score: 10 + 5 + 5 = 20
 * 
 * Against 70:20:10 rule:
 *   - Needs diff: |60 - 70| = 10
 *   - Wants diff: |25 - 20| = 5
 *   - Savings diff: |15 - 10| = 5
 *   - Total score: 10 + 5 + 5 = 20
 * 
 * Against 80:20:0 rule:
 *   - Needs diff: |60 - 80| = 20
 *   - Wants diff: |25 - 20| = 5
 *   - Savings diff: |15 - 0| = 15
 *   - Total score: 20 + 5 + 15 = 40
 * 
 * Result: 50:30:20 and 70:20:10 tied at score 20 (first one wins)
 * 
 * WHY THIS WORKS:
 * - Lower score = closer match = better recommendation
 * - Treats all categories equally (each % point has same weight)
 * - Simple, interpretable, and gives sensible results
 * 
 * @param income - User's monthly income
 * @param totalNeeds - Total essential expenses
 * @param totalWants - Total discretionary expenses
 * @param totalSavings - Total savings amount
 * @returns Object containing the best matching rule and its distance score
 */
export const findBestRule = (
  income: number,
  totalNeeds: number,
  totalWants: number,
  totalSavings: number
): { rule: BudgetRule; score: number } => {
  if (income === 0) return { rule: budgetRules[0], score: 0 };
  
  // Calculate user's actual percentages
  const needsPercentage = (totalNeeds / income) * 100;
  const wantsPercentage = (totalWants / income) * 100;
  const savingsPercentage = (totalSavings / income) * 100;

  let bestRule = budgetRules[0];
  let bestScore = Infinity;

  // Test each rule and find the one with lowest distance score
  budgetRules.forEach(rule => {
    const needsDiff = Math.abs(needsPercentage - rule.needs);
    const wantsDiff = Math.abs(wantsPercentage - rule.wants);
    const savingsDiff = Math.abs(savingsPercentage - rule.savings);
    const score = needsDiff + wantsDiff + savingsDiff;

    if (score < bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  });

  return { rule: bestRule, score: bestScore };
};

export const getNextRecommendation = (
  currentRule: string,
  totalExpenses: number,
  income: number,
  dict: any
): string => {
  // First check if expenses exceed income - this takes priority
  if (totalExpenses > income) {
    return dict.budgetCalculator?.results?.overspendingAdvice || 
      "Your first priority should be reducing expenses to spend within your income. Consider cutting non-essential expenses and finding ways to increase your income.";
  }
  
  // Then follow normal budgeting rule progression
  if (currentRule === "80:20:0") return "70:20:10";
  if (currentRule === "70:20:10") return "50:30:20";
  return dict.budgetCalculator?.results?.goldStandard || "Well done! You've achieved the gold standard of budgeting.";
};
