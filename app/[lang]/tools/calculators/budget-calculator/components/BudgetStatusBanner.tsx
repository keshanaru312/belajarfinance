/**
 * Budget Status Banner
 * 
 * Displays the current budget status with color-coded feedback:
 * - Red: Expenses too high (>150% of income)
 * - Yellow: Expenses equal or exceed income
 * - Blue: Under budget (healthy)
 * 
 * Shows income, total expenses, and savings with appropriate styling.
 */

import React from 'react';
import { formatCurrency } from '../utils';
import { statusStyles } from '../styles';

interface BudgetStatusBannerProps {
  income: number;
  totalExpenses: number;
  totalSavings: number;
  isExpensesTooHigh: boolean;
  isExpensesSameOrExceedIncome: boolean;
  dict: any;
}

export const BudgetStatusBanner: React.FC<BudgetStatusBannerProps> = ({
  income,
  totalExpenses,
  totalSavings,
  isExpensesTooHigh,
  isExpensesSameOrExceedIncome,
  dict,
}) => {
  const status = isExpensesTooHigh 
    ? statusStyles.overspending 
    : isExpensesSameOrExceedIncome 
      ? statusStyles.atLimit 
      : statusStyles.healthy;

  return (
    <div className={`p-3 rounded-lg ${status.container}`}>
      <div className="flex justify-between text-sm mb-2">
        <span>{dict.budgetCalculator.status.monthlyIncome}</span>
        <span className="font-medium">{formatCurrency(income)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span>{dict.budgetCalculator.status.totalExpenses}</span>
        <span className={status.value}>
          {formatCurrency(totalExpenses)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>{dict.budgetCalculator.status.totalSavings}</span>
        <span className="font-medium">{formatCurrency(totalSavings)}</span>
      </div>
    </div>
  );
};
