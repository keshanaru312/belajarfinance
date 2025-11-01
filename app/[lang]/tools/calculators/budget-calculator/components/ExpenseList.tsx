/**
 * ExpenseList Component
 * 
 * A reusable component for displaying and managing expense items during the budget input flow.
 * Used in both "Needs" and "Wants" steps of the detailed budget calculator flow.
 * 
 * Features:
 * - Display list of expense items with name and amount inputs
 * - Add/delete expense items dynamically
 * - Show progress bar of spending vs income
 * - Display validation warnings (overspending, empty names)
 * - Navigate between steps with validation
 * 
 * @param expenses - Array of expense items to display
 * @param type - Whether these are 'needs' or 'wants' expenses
 * @param title - Display title for the expense category
 * @param description - Help text describing what belongs in this category
 */

import React from 'react';
import { ProgressBar } from './ProgressBar';
import { formatCurrency } from '../utils';
import { buttonStyles, alertStyles } from '../styles';
import type { ExpenseItem } from '../types';

interface ExpenseListProps {
  expenses: ExpenseItem[];
  type: 'needs' | 'wants';
  title: string;
  description: string;
  income: number;
  totalNeeds: number;
  totalExpenses: number;
  maxAllowedExpenses: number;
  isExpensesTooHigh: boolean;
  step: number;
  setStep: (step: number) => void;
  addExpenseItem: (type: 'needs' | 'wants') => void;
  updateExpenseItem: (type: 'needs' | 'wants', id: string, field: 'name' | 'amount', value: string | number) => void;
  deleteExpenseItem: (type: 'needs' | 'wants', id: string) => void;
  dict: any;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  type,
  title,
  description,
  income,
  totalNeeds,
  totalExpenses,
  maxAllowedExpenses,
  isExpensesTooHigh,
  step,
  setStep,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  dict,
}) => {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = income - (type === 'needs' ? total : totalNeeds + total);
  
  // For progress bar, use total expenses when in wants screen to match validation messages
  const progressBarUsed = type === 'wants' ? totalExpenses : total;
  
  // Check if any expense name is blank
  const hasEmptyNames = expenses.some(item => !item.name.trim());

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        
        <div className={`mb-4 p-3 rounded-lg ${
          totalExpenses > maxAllowedExpenses
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : totalExpenses >= income
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <div className="flex justify-between text-sm mb-2">
            <span>{dict.budgetCalculator?.labels?.used || "Used:"} {formatCurrency(total)}</span>
            <span>{dict.budgetCalculator?.labels?.remaining || "Remaining:"} {formatCurrency(Math.max(0, remaining))}</span>
          </div>
          <ProgressBar used={progressBarUsed} total={income} />
          
          {totalExpenses > maxAllowedExpenses && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
              <p className="font-medium">⚠️ {dict.budgetCalculator?.validation?.tooHigh?.title || "Expenses Too High"}</p>
              <p className="mt-1">{dict.budgetCalculator?.validation?.tooHigh?.message || "Your total expenses exceed 150% of income."}</p>
            </div>
          )}
          
          {totalExpenses >= income && totalExpenses <= maxAllowedExpenses && (
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">💡 {dict.budgetCalculator?.validation?.exceedsIncome?.title || "Spending Equals or More Than Income"}</p>
              <p className="mt-1">{dict.budgetCalculator?.validation?.exceedsIncome?.message || "Consider reducing expenses to build savings."}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {expenses.map((item, index) => (
          <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dict.budgetCalculator?.labels?.expenseType || "Expense Type"} #{index + 1}
              </span>
              {expenses.length > 1 && (
                <button
                  onClick={() => deleteExpenseItem(type, item.id)}
                  className={buttonStyles.delete}
                  title={dict.budgetCalculator?.errors?.deleteExpense || "Delete expense"}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {dict.budgetCalculator?.labels?.expenseName || "Expense Name"}
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateExpenseItem(type, item.id, 'name', e.target.value)}
                  className={`input ${!item.name.trim() ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder={type === 'needs' 
                    ? (dict.budgetCalculator?.placeholders?.needsExample || 'e.g., Housing, Groceries, Transport')
                    : (dict.budgetCalculator?.placeholders?.wantsExample || 'e.g., Entertainment, Shopping, Dining')
                  }
                  required
                />
              </div>
              
              <div className="w-28">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {dict.budgetCalculator?.labels?.amount || "Amount (RM)"}
                </label>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateExpenseItem(type, item.id, 'amount', Number(e.target.value) || 0)}
                  className="input text-sm"
                  placeholder={dict.budgetCalculator?.placeholders?.amountZero || "0.00"}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => addExpenseItem(type)}
        className={buttonStyles.addItem}
      >
        <span className="text-lg">+</span>
        {type === 'needs' 
          ? (dict.budgetCalculator?.buttons?.addNeed || "Add Essential Expense")
          : (dict.budgetCalculator?.buttons?.addWant || "Add Fun Expense")
        }
      </button>

      {hasEmptyNames && (
        <div className={alertStyles.error.container}>
          <p className={`text-sm ${alertStyles.error.title}`}>
            <strong>⚠️ {dict.budgetCalculator?.errors?.missingInfo || "Missing Information:"}</strong> {dict.budgetCalculator?.errors?.fillExpenseNames || "Please fill in all expense names before continuing."}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep(step - 1)}
          className={buttonStyles.secondary}
        >
          {dict.budgetCalculator?.buttons?.back || "Back"}
        </button>
        <button
          onClick={() => setStep(step + 1)}
          disabled={isExpensesTooHigh || hasEmptyNames}
          className={buttonStyles.conditional(isExpensesTooHigh || hasEmptyNames)}
        >
          {dict.budgetCalculator?.buttons?.continue || "Continue"}
        </button>
      </div>
    </div>
  );
};
