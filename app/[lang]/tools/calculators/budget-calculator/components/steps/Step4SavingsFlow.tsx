/**
 * Step 4: Savings Allocation (Detailed Flow)
 * 
 * For users in the detailed flow, this is step 4 where they allocate remaining funds between:
 * - Emergency Fund: Safety net for unexpected expenses
 * - Other Savings: Retirement, investments, future goals, etc.
 * 
 * Features:
 * - Interactive sliders/inputs for allocation
 * - Real-time calculation of available funds
 * - Automatic adjustment (if one changes, the other adjusts)
 * - Visual progress bar showing allocation status
 * - Handles edge case where no savings are available (expenses = income)
 */

import React from 'react';
import { formatCurrency } from '../../utils';
import { buttonStyles, alertStyles } from '../../styles';

interface Step4SavingsFlowProps {
  income: number;
  totalExpenses: number;
  remainingAfterExpenses: number;
  maxAllowedExpenses: number;
  emergencyFundPercentage: number;
  setEmergencyFundPercentage: (percentage: number) => void;
  otherSavingsPercentage: number;
  setOtherSavingsPercentage: (percentage: number) => void;
  setStep: (step: number) => void;
  dict: any;
}

export const Step4SavingsFlow: React.FC<Step4SavingsFlowProps> = ({
  income,
  totalExpenses,
  remainingAfterExpenses,
  maxAllowedExpenses,
  emergencyFundPercentage,
  setEmergencyFundPercentage,
  otherSavingsPercentage,
  setOtherSavingsPercentage,
  setStep,
  dict
}) => {
  const maxSavings = remainingAfterExpenses;
  const emergencyFundAmount = (emergencyFundPercentage / 100) * maxSavings;
  const otherSavingsAmount = (otherSavingsPercentage / 100) * maxSavings;
  const totalAllocated = emergencyFundAmount + otherSavingsAmount;
  const unspentAmount = maxSavings - totalAllocated;

  const handleEmergencyFundChange = (value: number) => {
    const percentage = maxSavings > 0 ? Math.min(100, Math.max(0, (value / maxSavings) * 100)) : 0;
    setEmergencyFundPercentage(percentage);
    
    // Automatically adjust other savings to use remaining funds
    const remainingFunds = maxSavings - value;
    const otherPercentage = maxSavings > 0 ? Math.max(0, (remainingFunds / maxSavings) * 100) : 50;
    setOtherSavingsPercentage(otherPercentage);
  };

  const handleOtherSavingsChange = (value: number) => {
    const percentage = maxSavings > 0 ? Math.min(100, Math.max(0, (value / maxSavings) * 100)) : 0;
    setOtherSavingsPercentage(percentage);
    
    // Automatically adjust emergency fund to use remaining funds
    const remainingFunds = maxSavings - value;
    const emergencyPercentage = maxSavings > 0 ? Math.max(0, (remainingFunds / maxSavings) * 100) : 50;
    setEmergencyFundPercentage(emergencyPercentage);
  };

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="title">{dict.budgetCalculator?.steps?.savings?.title || "Allocate Your Savings"}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dict.budgetCalculator?.steps?.savings?.description || "Decide how to split your remaining money between emergency fund and other savings."}
        </p>
      </div>

      <div className="card space-y-4">
        <div className={`p-3 rounded-lg ${
          maxSavings <= 0 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <div className="flex justify-between text-sm mb-2">
            <span>Available: {formatCurrency(maxSavings)}</span>
            <span>Remaining: {formatCurrency(Math.max(0, unspentAmount))}</span>
          </div>
          {/* Custom progress bar for savings that reflects budget health */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                totalExpenses > maxAllowedExpenses ? 'bg-red-600' : 
                totalExpenses > income ? 'bg-yellow-500' : 
                totalExpenses === income ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: maxSavings > 0 ? `${Math.min((totalAllocated / maxSavings) * 100, 100)}%` : '0%' }}
            ></div>
          </div>
          
          {maxSavings <= 0 && (
            <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">💡 {dict.budgetCalculator?.validation?.noSavingsAvailable?.title || "Spending Equals or More Than Income"}</p>
              <p>{dict.budgetCalculator?.validation?.noSavingsAvailable?.message || "Savings can only be added when income exceeds expenses."}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {dict.budgetCalculator?.steps?.savings?.emergencyFund || "Emergency Fund (RM)"}
            </label>
            <input
              type="number"
              value={Math.round(emergencyFundAmount)}
              onChange={(e) => handleEmergencyFundChange(Number(e.target.value) || 0)}
              className={`input ${maxSavings <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="0"
              max={maxSavings}
              disabled={maxSavings <= 0}
            />
            <p className="text-xs text-gray-500 mt-1">
              {emergencyFundPercentage.toFixed(1)}% of available savings
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {dict.budgetCalculator?.steps?.savings?.otherSavings || "Other Savings (RM)"}
            </label>
            <input
              type="number"
              value={Math.round(otherSavingsAmount)}
              onChange={(e) => handleOtherSavingsChange(Number(e.target.value) || 0)}
              className={`input ${maxSavings <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="0"
              max={maxSavings}
              disabled={maxSavings <= 0}
            />
            <p className="text-xs text-gray-500 mt-1">
              {otherSavingsPercentage.toFixed(1)}% of available savings
            </p>
          </div>

          {unspentAmount > 0 && (
            <div className={alertStyles.warning.banner}>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>{formatCurrency(unspentAmount)}</strong> unallocated will be added to your wants budget.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(3)}
            className={buttonStyles.secondary}
          >
            {dict.budgetCalculator?.buttons?.back || "Back"}
          </button>
          <button
            onClick={() => setStep(5)}
            className={buttonStyles.primary}
          >
            {dict.budgetCalculator?.buttons?.seeResults || "See Results"}
          </button>
        </div>
      </div>
    </section>
  );
};
