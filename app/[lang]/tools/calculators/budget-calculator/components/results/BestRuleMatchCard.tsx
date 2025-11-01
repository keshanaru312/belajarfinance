/**
 * Best Rule Match Card
 * 
 * Displays the budget rule (50:30:20, 70:20:10, or 80:20:0) that best matches
 * the user's current spending pattern.
 * 
 * Shows a comparison grid with:
 * - Rule's target percentages
 * - User's actual percentages
 * - Visual indicators for how close they are
 */

import React from 'react';
import { cardStyles, categoryStyles, badgeStyles } from '../../styles';
import type { BudgetRule } from '../../types';

interface BestRuleMatchCardProps {
  bestRule: BudgetRule;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  dict: any;
}

export const BestRuleMatchCard: React.FC<BestRuleMatchCardProps> = ({
  bestRule,
  needsPercentage,
  wantsPercentage,
  savingsPercentage,
  dict,
}) => {
  const categories = [
    { 
      label: dict.budgetCalculator.categories.needsLabel, 
      ruleValue: bestRule.needs, 
      userValue: Math.round(needsPercentage),
      style: categoryStyles.needs,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l8-8" />
        </svg>
      )
    },
    { 
      label: dict.budgetCalculator.categories.wantsLabel, 
      ruleValue: bestRule.wants, 
      userValue: Math.round(wantsPercentage),
      style: categoryStyles.wants,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: dict.budgetCalculator.categories.savingsLabel, 
      ruleValue: bestRule.savings, 
      userValue: Math.round(savingsPercentage),
      style: categoryStyles.savings,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className={cardStyles.success.container}>
      {/* Decorative background elements */}
      <div className={cardStyles.success.decorTop}></div>
      <div className={cardStyles.success.decorBottom}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={cardStyles.success.icon}>
            <svg className={`w-6 h-6 ${cardStyles.success.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cardStyles.success.title}>
                {dict.budgetCalculator?.results?.bestMatch || "Closest Match"}
              </h3>
              <span className={cardStyles.success.badge}>
                {bestRule.name}
              </span>
            </div>
            <p className={cardStyles.success.description}>
              {dict.budgetCalculator?.results?.bestMatchDesc || "This budgeting rule aligns most with your current pattern"}
            </p>
          </div>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => {
            const difference = Math.abs(category.ruleValue - category.userValue);
            const isClose = difference <= 5;
            
            return (
              <div key={category.label} className={cardStyles.success.content}>
                <div className={`${category.style.iconBg} mb-3 mx-auto`}>
                  <div className={category.style.iconColor}>
                    {category.icon}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mb-2">
                    <div className={category.style.value}>
                      {category.ruleValue}%
                    </div>
                    <div className={category.style.label}>
                      {category.label}
                    </div>
                  </div>
                  
                  <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                    isClose ? badgeStyles.success : badgeStyles.warning
                  }`}>
                    {isClose ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {dict.budgetCalculator.status.you} {category.userValue}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
