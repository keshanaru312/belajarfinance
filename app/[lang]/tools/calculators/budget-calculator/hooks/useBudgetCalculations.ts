/**
 * useBudgetCalculations Hook
 * 
 * A custom React hook that handles all budget calculations and validation logic.
 * This hook consolidates complex calculation logic in one place to keep components clean.
 * 
 * Calculations include:
 * - Total amounts for needs, wants, and expenses
 * - Remaining funds after expenses
 * - Validation flags (overspending detection)
 * - Savings distribution (emergency fund vs other savings)
 * 
 * All calculations are memoized using useMemo for optimal performance.
 */

import { useMemo } from 'react';
import { FlowType, ExpenseItem } from '../types';

export const useBudgetCalculations = (
  income: number,
  flowType: FlowType,
  needsExpenses: ExpenseItem[],
  wantsExpenses: ExpenseItem[],
  simpleTotalNeeds: number,
  simpleTotalWants: number,
  simpleTotalSavings: number,
  emergencyFundPercentage: number,
  otherSavingsPercentage: number
) => {
  const totalNeeds = useMemo(() => 
    flowType === 'detailed' 
      ? needsExpenses.reduce((sum, item) => sum + item.amount, 0)
      : simpleTotalNeeds,
    [flowType, needsExpenses, simpleTotalNeeds]
  );

  const totalWants = useMemo(() => 
    flowType === 'detailed'
      ? wantsExpenses.reduce((sum, item) => sum + item.amount, 0)
      : simpleTotalWants,
    [flowType, wantsExpenses, simpleTotalWants]
  );

  const totalExpenses = useMemo(() => 
    totalNeeds + totalWants,
    [totalNeeds, totalWants]
  );

  const remainingAfterExpenses = useMemo(() => 
    Math.max(0, income - totalExpenses),
    [income, totalExpenses]
  );

  const maxAllowedExpenses = useMemo(() => 
    income * 1.5,
    [income]
  );

  const isExpensesTooHigh = useMemo(() => 
    totalExpenses > maxAllowedExpenses,
    [totalExpenses, maxAllowedExpenses]
  );

  const isExpensesSameOrExceedIncome = useMemo(() => 
    totalExpenses >= income,
    [totalExpenses, income]
  );

  const { totalSavings, emergencyFundAmount, otherSavingsAmount } = useMemo(() => {
    if (flowType === 'simple') {
      return {
        totalSavings: simpleTotalSavings,
        emergencyFundAmount: (simpleTotalSavings * emergencyFundPercentage) / 100,
        otherSavingsAmount: (simpleTotalSavings * otherSavingsPercentage) / 100
      };
    } else {
      const emergency = (remainingAfterExpenses * emergencyFundPercentage) / 100;
      const other = (remainingAfterExpenses * otherSavingsPercentage) / 100;
      return {
        totalSavings: emergency + other,
        emergencyFundAmount: emergency,
        otherSavingsAmount: other
      };
    }
  }, [
    flowType,
    simpleTotalSavings,
    remainingAfterExpenses,
    emergencyFundPercentage,
    otherSavingsPercentage
  ]);

  return {
    totalNeeds,
    totalWants,
    totalExpenses,
    remainingAfterExpenses,
    maxAllowedExpenses,
    isExpensesTooHigh,
    isExpensesSameOrExceedIncome,
    totalSavings,
    emergencyFundAmount,
    otherSavingsAmount
  };
};
