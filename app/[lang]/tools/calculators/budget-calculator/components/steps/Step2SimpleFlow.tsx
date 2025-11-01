/**
 * Step 2: Simple Flow - Budget Totals Entry
 * 
 * For users who chose the "Quick Overview" flow, this component allows them to enter
 * total amounts for needs, wants, and savings without breaking them down into individual items.
 * 
 * Features:
 * - Simple three-field input (needs, wants, savings)
 * - Real-time validation and warnings
 * - Automatic calculation of remaining budget
 * - Visual feedback for overspending
 * - Direct path to results
 */

import React from 'react';
import { BudgetStatusBanner, ValidationAlert } from '../';
import { buttonStyles } from '../../styles';

interface Step2SimpleFlowProps {
  income: number;
  simpleTotalNeeds: number;
  setSimpleTotalNeeds: (value: number) => void;
  simpleTotalWants: number;
  setSimpleTotalWants: (value: number) => void;
  simpleTotalSavings: number;
  setSimpleTotalSavings: (value: number) => void;
  isExpensesTooHigh: boolean;
  isExpensesSameOrExceedIncome: boolean;
  setStep: (step: number) => void;
  dict: any;
}

export const Step2SimpleFlow: React.FC<Step2SimpleFlowProps> = ({
  income,
  simpleTotalNeeds,
  setSimpleTotalNeeds,
  simpleTotalWants,
  setSimpleTotalWants,
  simpleTotalSavings,
  setSimpleTotalSavings,
  isExpensesTooHigh,
  isExpensesSameOrExceedIncome,
  setStep,
  dict
}) => {
  const simpleMaxSavings = Math.max(0, income - (simpleTotalNeeds + simpleTotalWants));

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="title">{dict.budgetCalculator?.simple?.title || "Enter Your Budget Totals"}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dict.budgetCalculator?.simple?.description || "Enter the total amounts you spend on needs, wants, and savings each month."}
        </p>
      </div>

      <div className="card space-y-4">
        <BudgetStatusBanner
          income={income}
          totalExpenses={simpleTotalNeeds + simpleTotalWants}
          totalSavings={simpleTotalSavings}
          isExpensesTooHigh={isExpensesTooHigh}
          isExpensesSameOrExceedIncome={isExpensesSameOrExceedIncome}
          dict={dict}
        />
        
        {isExpensesTooHigh && (
          <ValidationAlert type="expensesTooHigh" dict={dict} />
        )}
        
        {!isExpensesTooHigh && isExpensesSameOrExceedIncome && (
          <ValidationAlert type="exceedsIncome" dict={dict} />
        )}
        
        {!isExpensesTooHigh && simpleMaxSavings <= 0 && (
          <ValidationAlert type="noSavingsAvailable" dict={dict} />
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {dict.budgetCalculator?.simple?.labels?.totalNeeds || "Total Essential Expenses (RM)"}
            </label>
            <input
              type="number"
              value={simpleTotalNeeds}
              onChange={(e) => setSimpleTotalNeeds(Number(e.target.value) || 0)}
              className="input"
              placeholder="e.g. 2500"
            />
            <p className="text-xs text-gray-500 mt-1">Housing, utilities, groceries, transport, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {dict.budgetCalculator?.simple?.labels?.totalWants || "Total Fun Expenses (RM)"}
            </label>
            <input
              type="number"
              value={simpleTotalWants}
              onChange={(e) => setSimpleTotalWants(Number(e.target.value) || 0)}
              className="input"
              placeholder="e.g. 800"
            />
            <p className="text-xs text-gray-500 mt-1">Entertainment, dining out, shopping, hobbies, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {dict.budgetCalculator?.simple?.labels?.totalSavings || "Total Savings (RM)"}
            </label>
            <input
              type="number"
              value={simpleTotalSavings}
              onChange={(e) => setSimpleTotalSavings(Number(e.target.value) || 0)}
              className={`input ${simpleMaxSavings <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="e.g. 700"
              disabled={simpleMaxSavings <= 0}
              max={simpleMaxSavings}
            />
            <p className="text-xs text-gray-500 mt-1">Emergency fund, retirement, investments, etc.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className={buttonStyles.secondary}
          >
            {dict.budgetCalculator?.buttons?.back || "Back"}
          </button>
          <button
            onClick={() => setStep(5)}
            disabled={isExpensesTooHigh}
            className={buttonStyles.conditional(isExpensesTooHigh)}
          >
            {dict.budgetCalculator?.buttons?.seeResults || "See Results"}
          </button>
        </div>
      </div>
    </section>
  );
};
