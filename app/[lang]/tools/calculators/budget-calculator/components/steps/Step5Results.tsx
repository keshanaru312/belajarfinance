/**
 * Step 5: Results Display Component
 * 
 * This component displays the comprehensive budget analysis results including:
 * - Best matching budget rule (50:30:20, 70:20:10, or 80:20:0)
 * - Interactive pie chart visualization with drill-down capabilities
 * - Personalized recommendations based on current spending patterns
 * - Action buttons for adjusting budget or starting over
 * 
 * The component adapts its messaging based on:
 * - Whether user is overspending (expenses > income)
 * - How close they are to the gold standard (50:30:20 rule)
 * - What the next achievable budget rule target should be
 */

import React from 'react';
import { InteractivePieChart } from '../InteractivePieChart';
import { BestRuleMatchCard, RecommendationCard } from '../results';
import { budgetRules } from '../../constants';
import { buttonStyles } from '../../styles';
import { findBestRule, getNextRecommendation, formatCurrency } from '../../utils';
import type { ExpenseItem, FlowType } from '../../types';

interface Step5ResultsProps {
  income: number;
  totalNeeds: number;
  totalWants: number;
  totalSavings: number;
  totalExpenses: number;
  needsExpenses: ExpenseItem[];
  wantsExpenses: ExpenseItem[];
  emergencyFundAmount: number;
  otherSavingsAmount: number;
  flowType: FlowType;
  setFlowType: (type: FlowType) => void;
  setStep: (step: number) => void;
  dict: any;
}

export const Step5Results: React.FC<Step5ResultsProps> = ({
  income,
  totalNeeds,
  totalWants,
  totalSavings,
  totalExpenses,
  needsExpenses,
  wantsExpenses,
  emergencyFundAmount,
  otherSavingsAmount,
  flowType,
  setFlowType,
  setStep,
  dict,
}) => {
  const { rule: bestRule } = findBestRule(income, totalNeeds, totalWants, totalSavings);
  const needsPercentage = income > 0 ? (totalNeeds / income) * 100 : 0;
  const wantsPercentage = income > 0 ? (totalWants / income) * 100 : 0;
  const savingsPercentage = income > 0 ? (totalSavings / income) * 100 : 0;
  
  // Get personalized recommendation using new engine
  const recommendation = getNextRecommendation(
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    totalExpenses,
    income
  );

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="title">{dict.budgetCalculator?.results?.title || "Your Budget Analysis"}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dict.budgetCalculator?.results?.description || "Here's how your budget stacks up against popular budgeting rules."}
        </p>
      </div>

      {/* Closest Budget Rule */}
      <BestRuleMatchCard
        bestRule={bestRule}
        needsPercentage={needsPercentage}
        wantsPercentage={wantsPercentage}
        savingsPercentage={savingsPercentage}
        dict={dict}
      />

      <div className="space-y-6">
        {/* Interactive Pie Chart */}
        <InteractivePieChart
          needsPercentage={needsPercentage}
          wantsPercentage={wantsPercentage}
          savingsPercentage={savingsPercentage}
          totalNeeds={totalNeeds}
          totalWants={totalWants}
          totalSavings={totalSavings}
          needsExpenses={needsExpenses}
          wantsExpenses={wantsExpenses}
          emergencyFundAmount={emergencyFundAmount}
          otherSavingsAmount={otherSavingsAmount}
          flowType={flowType}
          setFlowType={setFlowType}
          setStep={setStep}
          dict={dict}
          formatCurrency={formatCurrency}
        />

        {/* Next Step Recommendation */}
        <RecommendationCard
          recommendation={recommendation}
          bestRule={bestRule}
          income={income}
          totalExpenses={totalExpenses}
          needsPercentage={needsPercentage}
          wantsPercentage={wantsPercentage}
          savingsPercentage={savingsPercentage}
          dict={dict}
        />

        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className={buttonStyles.secondary}
            >
              {dict.budgetCalculator?.buttons?.startOver || "Start Over"}
            </button>
            {flowType === 'detailed' && (
              <button
                onClick={() => setStep(4)}
                className={buttonStyles.primary}
              >
                {dict.budgetCalculator?.buttons?.adjustSavings || "Adjust Savings"}
              </button>
            )}
            {flowType === 'simple' && (
              <button
                onClick={() => setStep(2)}
                className={buttonStyles.primary}
              >
                {dict.budgetCalculator?.buttons?.adjustAmounts || "Adjust Amounts"}
              </button>
            )}
          </div>
          
          <button
            onClick={() => {
              setFlowType(flowType === 'detailed' ? 'simple' : 'detailed');
              setStep(1);
            }}
            className={buttonStyles.modeSwitch}
          >
            {flowType === 'detailed' 
              ? (dict.budgetCalculator?.buttons?.switchToSimple || "Switch to Simple Mode")
              : (dict.budgetCalculator?.buttons?.switchToDetailed || "Switch to Detailed Mode")
            }
          </button>
        </div>
      </div>
    </section>
  );
};
