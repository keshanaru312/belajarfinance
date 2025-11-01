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
}

export const BudgetStatusBanner: React.FC<BudgetStatusBannerProps> = ({
  income,
  totalExpenses,
  totalSavings,
  isExpensesTooHigh,
  isExpensesSameOrExceedIncome,
}) => {
  const status = isExpensesTooHigh 
    ? statusStyles.overspending 
    : isExpensesSameOrExceedIncome 
      ? statusStyles.atLimit 
      : statusStyles.healthy;

  return (
    <div className={`p-3 rounded-lg ${status.container}`}>
      <div className="flex justify-between text-sm mb-2">
        <span>Monthly Income:</span>
        <span className="font-medium">{formatCurrency(income)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span>Total Expenses:</span>
        <span className={status.value}>
          {formatCurrency(totalExpenses)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Total Savings:</span>
        <span className="font-medium">{formatCurrency(totalSavings)}</span>
      </div>
    </div>
  );
};
