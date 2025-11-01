/**
 * Validation Alert Component
 * 
 * Displays validation messages and warnings based on budget status:
 * - Expenses too high (>150% income) - Critical error
 * - Expenses equal/exceed income - Warning
 * - No savings available - Info message
 * 
 * Used across multiple steps to provide consistent user feedback.
 */

import React from 'react';
import { alertStyles } from '../styles';

interface ValidationAlertProps {
  type: 'expensesTooHigh' | 'exceedsIncome' | 'noSavingsAvailable';
  dict: any;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ type, dict }) => {
  if (type === 'expensesTooHigh') {
    return (
      <div className={alertStyles.error.banner}>
        <p className={alertStyles.error.title}>
          ⚠️ {dict.budgetCalculator?.validation?.tooHigh?.title || "Expenses Too High"}
        </p>
        <p>{dict.budgetCalculator?.validation?.tooHigh?.message || "Your expenses are more than 150% of your income. Please reduce your expenses to continue."}</p>
      </div>
    );
  }

  if (type === 'exceedsIncome') {
    return (
      <div className={alertStyles.warning.banner}>
        <p className={alertStyles.warning.title}>
          💡 {dict.budgetCalculator?.validation?.exceedsIncome?.title || "Spending Equals or More Than Income"}
        </p>
        <p>{dict.budgetCalculator?.validation?.exceedsIncome?.message || "Your expenses are more than your income."}</p>
      </div>
    );
  }

  if (type === 'noSavingsAvailable') {
    return (
      <div className={alertStyles.warning.banner}>
        <p className={alertStyles.warning.title}>
          💡 {dict.budgetCalculator?.validation?.noSavingsAvailable?.title || "Spending Equals or More Than Income"}
        </p>
        <p>{dict.budgetCalculator?.validation?.noSavingsAvailable?.message || "Savings can only be added when income exceeds expenses."}</p>
      </div>
    );
  }

  return null;
};
