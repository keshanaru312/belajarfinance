/**
 * Step 3: Wants Expenses Entry (Detailed Flow)
 * 
 * For users in the detailed flow, this is step 3 where they enter individual discretionary expenses.
 * 
 * Discretionary expenses (wants) include:
 * - Entertainment (movies, streaming services, concerts)
 * - Dining out and takeout
 * - Shopping (clothes, gadgets, non-essentials)
 * - Hobbies and recreational activities
 * - Subscriptions and memberships
 * - Travel and vacations
 * 
 * This component wraps the reusable ExpenseList component with wants-specific configuration.
 */

import React from 'react';
import { ExpenseList } from '../ExpenseList';
import type { ExpenseItem } from '../../types';

interface Step3WantsFlowProps {
  wantsExpenses: ExpenseItem[];
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

export const Step3WantsFlow: React.FC<Step3WantsFlowProps> = ({
  wantsExpenses,
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
        <h1 className="title">{dict.budgetCalculator?.steps?.wants?.title || "Fun Expenses (Wants)"}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dict.budgetCalculator?.steps?.wants?.description || "These are the fun stuff - entertainment, dining out, hobbies."}
        </p>
      </div>

      <ExpenseList
        expenses={wantsExpenses}
        type="wants"
        title={dict.budgetCalculator?.steps?.wants?.cardTitle || "Your Wants"}
        description={dict.budgetCalculator?.steps?.wants?.cardDescription || "Entertainment, dining out, shopping, hobbies, etc."}
        income={income}
        totalNeeds={totalNeeds}
        totalExpenses={totalExpenses}
        maxAllowedExpenses={maxAllowedExpenses}
        isExpensesTooHigh={isExpensesTooHigh}
        step={3}
        setStep={setStep}
        addExpenseItem={addExpenseItem}
        updateExpenseItem={updateExpenseItem}
        deleteExpenseItem={deleteExpenseItem}
        dict={dict}
      />
    </section>
  );
};
