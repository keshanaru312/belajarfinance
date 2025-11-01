/**
 * Step 1: Income Input & Flow Selection
 * 
 * The first step of the budget calculator where users:
 * 1. Enter their monthly income
 * 2. Choose between two flow types:
 *    - Detailed: Item-by-item expense tracking (recommended)
 *    - Simple: Quick overview with total amounts
 * 
 * This component handles the initial setup that determines the rest of the user's journey.
 */

import React from 'react';
import { buttonStyles } from '../../styles';

interface Step1IncomeInputProps {
  income: number;
  setIncome: (income: number) => void;
  flowType: 'detailed' | 'simple';
  setFlowType: (flowType: 'detailed' | 'simple') => void;
  setStep: (step: number) => void;
  dict: any;
}

export const Step1IncomeInput: React.FC<Step1IncomeInputProps> = ({
  income,
  setIncome,
  flowType,
  setFlowType,
  setStep,
  dict
}) => {
  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <h1 className="title">{dict.budgetCalculator?.title || "Budget Calculator"}</h1>
      <p className="subtitle">
        {dict.budgetCalculator?.intro || "Discover which budgeting rule works best for you: 50:30:20, 70:20:10, or 80:20."}
      </p>

      <div className="card space-y-6 mt-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            {dict.budgetCalculator?.labels?.monthlyIncome || "Monthly Income (RM)"}
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value) || 0)}
            className="input"
            placeholder="e.g. 5000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            {dict.budgetCalculator?.labels?.howDetailed || "How detailed do you want to be?"}
          </label>
          <div className="space-y-3">
            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
              flowType === 'detailed' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
              <input
                type="radio"
                name="flowType"
                value="detailed"
                checked={flowType === 'detailed'}
                onChange={(e) => setFlowType(e.target.value as 'detailed' | 'simple')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  {dict.budgetCalculator?.flowTypes?.detailed?.title || "Detailed Breakdown (Recommended)"}
                  <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    {dict.budgetCalculator?.labels?.recommended || "Recommended"}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {dict.budgetCalculator?.flowTypes?.detailed?.desc || "Break down expenses by category for easier adjustments and optimization. Perfect for fine-tuning your budget."}
                </div>
              </div>
            </label>
            
            <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
              flowType === 'simple' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
              <input
                type="radio"
                name="flowType"
                value="simple"
                checked={flowType === 'simple'}
                onChange={(e) => setFlowType(e.target.value as 'detailed' | 'simple')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{dict.budgetCalculator?.flowTypes?.simple?.title || "Quick Overview"}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {dict.budgetCalculator?.flowTypes?.simple?.desc || "Fast track to understand your budgeting rule. Just enter total amounts to get instant insights."}
                </div>
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={() => setStep(2)}
          disabled={income <= 0}
          className={income <= 0 ? buttonStyles.primaryDisabled : buttonStyles.primary}
        >
          {dict.budgetCalculator?.buttons?.start || "Start Budgeting"}
        </button>
      </div>
    </section>
  );
};
