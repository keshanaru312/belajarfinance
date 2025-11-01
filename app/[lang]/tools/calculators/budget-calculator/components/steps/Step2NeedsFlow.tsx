/**
 * Step 2: Needs Expenses Entry (Detailed Flow)
 * 
 * For users in the detailed flow, this is step 2 where they enter individual essential expenses.
 * 
 * Essential expenses (needs) include:
 * - Housing (rent/mortgage)
 * - Utilities (electricity, water, internet)
 * - Groceries and food
 * - Transportation
 * - Insurance
 * - Healthcare
 * 
 * This component wraps the reusable ExpenseList component with needs-specific configuration.
 */

import React from 'react';
import { ExpenseList } from '../ExpenseList';
import type { ExpenseItem } from '../../types';

interface Step2NeedsFlowProps {
  needsExpenses: ExpenseItem[];
  income: number;
  totalNeeds: number;
  totalExpenses: number;
  maxAllowedExpenses: number;
  isExpensesTooHigh: boolean;
  setStep: (step: number) => void;
  addExpenseItem: (type: 'needs' | 'wants') => void;
  updateExpenseItem: (type: 'needs' | 'wants', id: string, field: 'name' | 'amount', value: string | number) => void;
  deleteExpenseItem: (type: 'needs' | 'wants', id: string) => void;
  dict: any;
}

export const Step2NeedsFlow: React.FC<Step2NeedsFlowProps> = ({
  needsExpenses,
  income,
  totalNeeds,
  totalExpenses,
  maxAllowedExpenses,
  isExpensesTooHigh,
  setStep,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  dict
}) => {
  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="title">{dict.budgetCalculator?.steps?.needs?.title || "Essential Expenses (Needs)"}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dict.budgetCalculator?.steps?.needs?.description || "These are essential expenses you can't live without."}
        </p>
      </div>

      <ExpenseList
        expenses={needsExpenses}
        type="needs"
        title={dict.budgetCalculator?.steps?.needs?.cardTitle || "Your Needs"}
        description={dict.budgetCalculator?.steps?.needs?.cardDescription || "Housing, utilities, groceries, transport, etc."}
        income={income}
        totalNeeds={totalNeeds}
        totalExpenses={totalExpenses}
        maxAllowedExpenses={maxAllowedExpenses}
        isExpensesTooHigh={isExpensesTooHigh}
        step={2}
        setStep={setStep}
        addExpenseItem={addExpenseItem}
        updateExpenseItem={updateExpenseItem}
        deleteExpenseItem={deleteExpenseItem}
        dict={dict}
      />
    </section>
  );
};
