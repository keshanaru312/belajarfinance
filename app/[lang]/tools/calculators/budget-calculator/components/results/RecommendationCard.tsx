/**
 * Recommendation Card Component
 * 
 * Displays personalized recommendations based on the user's budget status.
 * Shows different cards depending on scenario:
 * - Overspending: Urgent action card (red)
 * - Gold Standard (50:30:20): Congratulations card (green)
 * - Default: Next step progression card (blue)
 */

import React from 'react';
import { cardStyles, categoryStyles, badgeStyles } from '../../styles';
import { budgetRules } from '../../constants';
import { formatCurrency } from '../../utils';
import type { BudgetRule } from '../../types';

interface RecommendationCardProps {
  hasOverspending: boolean;
  isGoldStandard: boolean;
  nextRuleName: string;
  bestRule: BudgetRule;
  income: number;
  totalExpenses: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  dict: any;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  hasOverspending,
  isGoldStandard,
  nextRuleName,
  bestRule,
  income,
  totalExpenses,
  needsPercentage,
  wantsPercentage,
  savingsPercentage,
  dict,
}) => {
  const nextRule = budgetRules.find(rule => rule.name === nextRuleName);

  // Overspending - Urgent Action Card
  if (hasOverspending) {
    return (
      <div className={cardStyles.warning.container}>
        <div className={cardStyles.warning.decorTop}></div>
        <div className={cardStyles.warning.decorBottom}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className={cardStyles.warning.icon}>
              <svg className={`w-6 h-6 ${cardStyles.warning.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cardStyles.warning.title}>
                  {dict.budgetCalculator?.results?.priorityAction || "Priority Action"}
                </h3>
                <span className={cardStyles.warning.badge}>URGENT</span>
              </div>
              <p className={cardStyles.warning.description}>
                Your spending exceeds income - immediate action required
              </p>
            </div>
          </div>

          {/* Target Focus */}
          <div className="mb-4">
            <div className={cardStyles.warning.urgentCard}>
              <div className="text-center">
                <div className={`${cardStyles.warning.urgentIcon} mb-4 mx-auto`}>
                  <svg className={`w-6 h-6 ${cardStyles.warning.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  &lt;100%
                </div>
                <div className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-2">
                  SPENDING TARGET
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mb-4 px-2">
                  Spend less than your income to build financial security
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Reduce by {Math.round(((totalExpenses / income) * 100) - 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={cardStyles.warning.content}>
            <p className={`${cardStyles.warning.description} font-medium mb-2`}>
              Immediate Steps Required:
            </p>
            <ul className={`text-sm ${cardStyles.warning.description} space-y-1`}>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-current rounded-full"></span>
                Reduce total expenses by {formatCurrency(totalExpenses - income)} ({Math.round(((totalExpenses - income) / income) * 100)}% of income)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-current rounded-full"></span>
                Focus on cutting non-essential spending first
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-current rounded-full"></span>
                Consider increasing income through side work or career development
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Gold Standard - Congratulations Card
  if (isGoldStandard) {
    const categories = [
      { label: 'Needs', target: 50, current: Math.round(needsPercentage), style: categoryStyles.needs },
      { label: 'Wants', target: 30, current: Math.round(wantsPercentage), style: categoryStyles.wants },
      { label: 'Savings', target: 20, current: Math.round(savingsPercentage), style: categoryStyles.savings },
    ];

    return (
      <div className={cardStyles.success.container}>
        <div className={cardStyles.success.decorTop}></div>
        <div className={cardStyles.success.decorBottom}></div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cardStyles.success.icon}>
                <svg className={`w-6 h-6 ${cardStyles.success.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className={`${cardStyles.success.title} flex items-center gap-2`}>
                  🎉 Perfect! You're Following the Gold Standard!
                </h3>
                <span className={cardStyles.success.badge}>50:30:20 Rule</span>
              </div>
            </div>
            <div>
              <p className={cardStyles.success.description}>
                Excellent financial balance achieved
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {categories.map((item) => {
              const changeNeeded = item.target - item.current;
              const isOnTarget = changeNeeded === 0;
              
              return (
                <div key={item.label} className={cardStyles.success.content}>
                  <div className={`${item.style.iconBg} mb-3 mx-auto`}>
                    <div className={item.style.iconColor}>
                      {/* Icon SVG would go here */}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-2">
                      <div className={item.style.value}>
                        {item.target}%
                      </div>
                      <div className={item.style.label}>
                        Target {item.label}
                      </div>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium ${
                      isOnTarget ? badgeStyles.success : badgeStyles.info
                    }`}>
                      {isOnTarget ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Perfect!
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          {changeNeeded > 0 ? '+' : ''}{changeNeeded}%
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={cardStyles.success.content}>
            <p className={`${cardStyles.success.description} font-medium mb-2`}>
              💡 To maintain the perfect 50:30:20 balance:
            </p>
            <ul className={`text-sm ${cardStyles.success.description} space-y-1`}>
              {categories.map((item) => {
                const changeNeeded = item.target - item.current;
                if (changeNeeded === 0) {
                  return (
                    <li key={item.label} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      Keep {item.label.toLowerCase()} at {item.target}% - you're perfectly on target!
                    </li>
                  );
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Default - Next Step Card
  if (nextRule) {
    return (
      <div className={cardStyles.info.container}>
        <div className={cardStyles.info.decorTop}></div>
        <div className={cardStyles.info.decorBottom}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className={cardStyles.info.icon}>
              <svg className={`w-6 h-6 ${cardStyles.info.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cardStyles.info.title}>
                  {dict.budgetCalculator?.results?.nextStep || "Next Step"}
                </h3>
                <span className={cardStyles.info.badge}>{nextRuleName}</span>
              </div>
              <p className={cardStyles.info.description}>
                Your journey to better financial balance
              </p>
            </div>
          </div>
          
          <div className={cardStyles.info.content}>
            <p className={`${cardStyles.info.description} font-medium mb-2`}>
              {`To achieve the ${nextRuleName} rule:`}
            </p>
            <ul className={`text-sm ${cardStyles.info.description} space-y-1`}>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-current rounded-full"></span>
                Continue improving your budget allocation
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
