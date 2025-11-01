/**
 * Recommendation Card Component
 * 
 * Displays personalized recommendations based on the user's budget status.
 * Uses the centralized recommendation engine from budgetUtils.ts.
 * 
 * Shows standardized cards for all scenarios:
 * - Overspending: Urgent action card (red/warning theme)
 * - Gold Standard achieved: Congratulations/optional optimization (green/success theme)
 * - Progress needed: Next achievable step (blue/info theme)
 */

import React from 'react';
import { cardStyles, categoryStyles, badgeStyles } from '../../styles';
import { formatCurrency, generateCategoryRecommendations, generateOverspendingRecommendations } from '../../utils';
import type { BudgetRule } from '../../types';

interface RecommendationCardProps {
  recommendation: {
    nextRule: BudgetRule | null;
    messageType: 'overspending' | 'gold_optional_wants' | 'gold_optional_needs' | 'gold_achieved' | 'progress' | 'start_saving';
    isGoldStandard: boolean;
    hasOverspending: boolean;
    effortScore?: number;
    alternatives?: string[];
    bestMatchRule?: BudgetRule;
  };
  bestRule: BudgetRule;
  income: number;
  totalExpenses: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  dict: any;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  bestRule,
  income,
  totalExpenses,
  needsPercentage,
  wantsPercentage,
  savingsPercentage,
  dict,
}) => {
  const { nextRule, messageType, hasOverspending, isGoldStandard, alternatives, bestMatchRule } = recommendation;

  // For overspending, use bestMatchRule; otherwise use nextRule
  const displayRule = messageType === 'overspending' ? (bestMatchRule || bestRule) : nextRule;

    // =================================================================
  // SCENARIO 1, 5 & 6: OVERSPENDING / PROGRESS / START_SAVING - Building towards goals
  // =================================================================
  if (messageType === 'progress' || messageType === 'overspending' || messageType === 'start_saving') {
    // Get recommendations from budgetUtils for consistent logic
    const recommendations = messageType === 'overspending'
      ? generateOverspendingRecommendations(wantsPercentage, needsPercentage, displayRule!, dict)
      : generateCategoryRecommendations(displayRule!, needsPercentage, wantsPercentage, savingsPercentage, dict);

    return (
      <div className={cardStyles.info.container}>
        <div className={cardStyles.info.decorTop}></div>
        <div className={cardStyles.info.decorBottom}></div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cardStyles.info.icon}>
                <svg className={`w-6 h-6 ${cardStyles.info.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
                <div>
                <h3 className={`${cardStyles.info.title} flex items-center gap-2`}>
                    {messageType === 'start_saving'
                    ? `🚀 ${dict.budgetCalculator.results.recommendations.startSaving}`
                    : messageType === 'overspending'
                    ? `📊 ${dict.budgetCalculator.results.recommendations.overspending}`
                    : `📈 ${dict.budgetCalculator.results.recommendations.progress}`}
                </h3>

                {messageType === 'overspending' ? (
                    <>
                      <span className={cardStyles.info.badge}>{dict.budgetCalculator.results.recommendations.actionPlan}</span>
                      <p className={`${cardStyles.info.description} mt-2`}>
                        {dict.budgetCalculator.results.recommendations.focusReducing} {formatCurrency(totalExpenses - income)}
                      </p>
                    </>
                ) : (
                    <span className={cardStyles.info.badge}>
                      {dict.budgetCalculator.results.recommendations.nextTarget}: {displayRule!.name}
                    </span>
                )}
                </div>

            </div>
          </div>
          
          {/* Only show grid for non-overspending scenarios */}
          {messageType !== 'overspending' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {(recommendations as ReturnType<typeof generateCategoryRecommendations>).map((rec) => {
              // Map recommendation label to category style
              const style = rec.label === 'Needs' ? categoryStyles.needs 
                          : rec.label === 'Wants' ? categoryStyles.wants 
                          : categoryStyles.savings;
              
              const targetPercentage = displayRule![rec.label.toLowerCase() as 'needs' | 'wants' | 'savings'];
              
              return (
                <div key={rec.label} className={cardStyles.info.content}>
                  <div className={`${style.iconBg} mb-3 mx-auto`}>
                    <div className={style.iconColor}>
                      {rec.label === 'Needs' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      )}
                      {rec.label === 'Wants' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15m0-5a3 3 0 11-6 0 3 3 0 016 0zm6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {rec.label === 'Savings' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-2">
                      <div className={style.value}>
                        {targetPercentage}%
                      </div>
                      <div className={style.label}>
                        {dict.budgetCalculator.results.recommendations.targetLabel} {rec.label.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium ${
                      rec.isOnTarget ? badgeStyles.success : badgeStyles.info
                    }`}>
                      {rec.isOnTarget ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {dict.budgetCalculator.results.recommendations.perfect}
                        </>
                      ) : rec.categoryType === 'expense' ? (
                        // For expenses: if changeNeeded is negative, we need to REDUCE (down arrow)
                        rec.changeNeeded < 0 ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            {rec.changeNeeded}%
                          </>
                        ) : (
                          // Below target for expenses - maintain (tick)
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {dict.budgetCalculator.results.recommendations.good}
                          </>
                        )
                      ) : (
                        // For savings: if changeNeeded is positive, we need to INCREASE (up arrow)
                        rec.changeNeeded > 0 ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            +{rec.changeNeeded}%
                          </>
                        ) : (
                          // Above target for savings - maintain (tick)
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {dict.budgetCalculator.results.recommendations.good}
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
          
          <div className={cardStyles.info.content}>
            <p className={`${cardStyles.info.description} font-medium mb-2`}>
              {messageType === 'overspending' ? `💡 ${dict.budgetCalculator.results.recommendations.actionSteps}` : `💡 ${dict.budgetCalculator.results.recommendations.toReach} ${displayRule!.name} ${dict.budgetCalculator.results.recommendations.target}`}
            </p>
            <ul className={`text-sm ${cardStyles.info.description} space-y-1`}>
              {messageType === 'overspending' ? (
                // For overspending, show the custom recommendations
                (recommendations as ReturnType<typeof generateOverspendingRecommendations>).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-current rounded-full mt-1.5"></span>
                    <span>{rec.message}</span>
                  </li>
                ))
              ) : (
                // For normal progress, show category recommendations
                <>
                  {(recommendations as ReturnType<typeof generateCategoryRecommendations>).map((rec) => (
                    <li key={rec.label} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      {rec.message}
                    </li>
                  ))}
                  {alternatives && alternatives.length > 0 && (
                    <>
                      {alternatives.includes('reduce_wants_more') && (
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          Focus on reducing discretionary spending first
                        </li>
                      )}
                      {alternatives.includes('increase_income') && (
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          Consider income increase through side work or advancement
                        </li>
                      )}
                      {alternatives.includes('gradual_approach') && (
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          Take a gradual approach - small changes add up!
                        </li>
                      )}
                    </>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  // =================================================================
  // SCENARIO 2: GOLD STANDARD ACHIEVED - Celebration!
  // =================================================================
  if (messageType === 'gold_achieved') {
    // Get recommendations from budgetUtils for consistent logic
    const recommendations = generateCategoryRecommendations(
      nextRule!,
      needsPercentage,
      wantsPercentage,
      savingsPercentage,
      dict
    );

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
                  🎉 {dict.budgetCalculator.results.recommendations.goldAchieved}
                </h3>
                <span className={cardStyles.success.badge}>{nextRule!.name} {dict.budgetCalculator.results.rule}</span>
              </div>
            </div>
            <div>
              <p className={cardStyles.success.description}>
                {dict.budgetCalculator.results.recommendations.excellentBalance}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {recommendations.map((rec) => {
              // Map recommendation label to category style
              const style = rec.label === 'Needs' ? categoryStyles.needs 
                          : rec.label === 'Wants' ? categoryStyles.wants 
                          : categoryStyles.savings;
              
              const targetPercentage = nextRule![rec.label.toLowerCase() as 'needs' | 'wants' | 'savings'];
              
              return (
                <div key={rec.label} className={cardStyles.success.content}>
                  <div className={`${style.iconBg} mb-3 mx-auto`}>
                    <div className={style.iconColor}>
                      {rec.label === 'Needs' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      )}
                      {rec.label === 'Wants' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15m0-5a3 3 0 11-6 0 3 3 0 016 0zm6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {rec.label === 'Savings' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-2">
                      <div className={style.value}>
                        {targetPercentage}%
                      </div>
                      <div className={style.label}>
                        {dict.budgetCalculator.results.recommendations.targetLabel} {rec.label.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium ${
                      rec.isOnTarget ? badgeStyles.success : badgeStyles.info
                    }`}>
                      {rec.isOnTarget ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {dict.budgetCalculator.results.recommendations.perfect}
                        </>
                      ) : rec.categoryType === 'expense' ? (
                        // For expenses: if changeNeeded is negative, we need to REDUCE (down arrow)
                        rec.changeNeeded < 0 ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            {rec.changeNeeded}%
                          </>
                        ) : (
                          // Below target for expenses - maintain (tick)
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {dict.budgetCalculator.results.recommendations.belowTarget}
                          </>
                        )
                      ) : (
                        // For savings: if changeNeeded is positive, we need to INCREASE (up arrow)
                        rec.changeNeeded > 0 ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            +{rec.changeNeeded}%
                          </>
                        ) : (
                          // Above target for savings - maintain (tick)
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {dict.budgetCalculator.results.recommendations.aboveTarget}
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={cardStyles.success.content}>
            <p className={`${cardStyles.success.description} font-medium mb-2`}>
              💡 {dict.budgetCalculator.results.recommendations.maintain} {nextRule!.name} {dict.budgetCalculator.results.recommendations.balance}
            </p>
            <ul className={`text-sm ${cardStyles.success.description} space-y-1`}>
              {generateCategoryRecommendations(
                nextRule!,
                needsPercentage,
                wantsPercentage,
                savingsPercentage,
                dict
              ).map((rec) => (
                <li key={rec.label} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  {rec.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // =================================================================
  // SCENARIO 3 & 4: GOLD OPTIONAL WANTS/NEEDS - Optional improvements
  // =================================================================
  if (messageType === 'gold_optional_wants' || messageType === 'gold_optional_needs') {
    // Get recommendations from budgetUtils for consistent logic
    const recommendations = generateCategoryRecommendations(
      nextRule!,
      needsPercentage,
      wantsPercentage,
      savingsPercentage,
      dict
    );

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
                  🎉 {dict.budgetCalculator.results.recommendations.goldOptional}
                </h3>
                <span className={cardStyles.success.badge}>{dict.budgetCalculator.results.recommendations.savingsAchieved}</span>
              </div>
            </div>
            <div>
              <p className={cardStyles.success.description}>
                {messageType === 'gold_optional_wants' 
                  ? dict.budgetCalculator.results.recommendations.optionalWants
                  : dict.budgetCalculator.results.recommendations.optionalNeeds}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {recommendations.map((rec) => {
              // Map recommendation label to category style
              const style = rec.label === 'Needs' ? categoryStyles.needs 
                          : rec.label === 'Wants' ? categoryStyles.wants 
                          : categoryStyles.savings;
              
              const targetPercentage = nextRule![rec.label.toLowerCase() as 'needs' | 'wants' | 'savings'];
              
              return (
                <div key={rec.label} className={cardStyles.success.content}>
                  <div className={`${style.iconBg} mb-3 mx-auto`}>
                    <div className={style.iconColor}>
                      {rec.label === 'Needs' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      )}
                      {rec.label === 'Wants' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15m0-5a3 3 0 11-6 0 3 3 0 016 0zm6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {rec.label === 'Savings' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-2">
                      <div className={style.value}>
                        {targetPercentage}%
                      </div>
                      <div className={style.label}>
                        {dict.budgetCalculator.results.recommendations.targetLabel} {rec.label.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium ${
                      rec.isOnTarget ? badgeStyles.success : badgeStyles.info
                    }`}>
                      {rec.isOnTarget ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {dict.budgetCalculator.results.recommendations.great}
                        </>
                      ) : rec.categoryType === 'expense' ? (
                        // For expenses: if changeNeeded is negative, we need to REDUCE (down arrow)
                        rec.changeNeeded < 0 ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            {rec.changeNeeded}%
                          </>
                        ) : (
                          // Below target for expenses - maintain (tick)
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {dict.budgetCalculator.results.recommendations.belowTarget}
                          </>
                        )
                      ) : (
                        // For savings: if changeNeeded is positive, we need to INCREASE (up arrow)
                        rec.changeNeeded > 0 ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            +{rec.changeNeeded}%
                          </>
                        ) : (
                          // Above target for savings - maintain (tick)
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {dict.budgetCalculator.results.recommendations.aboveTarget}
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={cardStyles.success.content}>
            <p className={`${cardStyles.success.description} font-medium mb-2`}>
              💡 {dict.budgetCalculator.results.recommendations.optional} {nextRule!.name} {dict.budgetCalculator.results.recommendations.balance}
            </p>
            <ul className={`text-sm ${cardStyles.success.description} space-y-1`}>
              {messageType === 'gold_optional_wants' && (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    {dict.budgetCalculator.results.recommendations.reduceSlightly}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    {dict.budgetCalculator.results.recommendations.savingsExcellent}
                  </li>
                </>
              )}
              {messageType === 'gold_optional_needs' && alternatives && (
                <>
                  {alternatives.includes('increase_income') && (
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      {dict.budgetCalculator.results.recommendations.considerIncome}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    {dict.budgetCalculator.results.recommendations.keepSavings}
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // =================================================================
  // SCENARIO 5 & 6: PROGRESS / START_SAVING - Building towards goals
  // =================================================================
//   if (messageType === 'progress' || messageType === 'start_saving') {
//     // Get recommendations from budgetUtils for consistent logic
//     const recommendations = generateCategoryRecommendations(
//       nextRule,
//       needsPercentage,
//       wantsPercentage,
//       savingsPercentage
//     );

//     return (
//       <div className={cardStyles.info.container}>
//         <div className={cardStyles.info.decorTop}></div>
//         <div className={cardStyles.info.decorBottom}></div>
        
//         <div className="relative z-10 p-6">
//           <div className="flex items-start justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <div className={cardStyles.info.icon}>
//                 <svg className={`w-6 h-6 ${cardStyles.info.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className={`${cardStyles.info.title} flex items-center gap-2`}>
//                   {messageType === 'start_saving' ? '🚀 Start Building Your Savings!' : '📈 Great Progress! Keep Going!'}
//                 </h3>
//                 <span className={cardStyles.info.badge}>Next Target: {nextRule.name}</span>
//               </div>
//             </div>
//             <div>
//               <p className={cardStyles.info.description}>
//                 {messageType === 'start_saving' 
//                   ? 'Your next achievable financial milestone' 
//                   : 'Building towards the gold standard'}
//               </p>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-3 gap-4 mb-4">
//             {recommendations.map((rec) => {
//               // Map recommendation label to category style
//               const style = rec.label === 'Needs' ? categoryStyles.needs 
//                           : rec.label === 'Wants' ? categoryStyles.wants 
//                           : categoryStyles.savings;
              
//               const targetPercentage = nextRule[rec.label.toLowerCase() as 'needs' | 'wants' | 'savings'];
              
//               return (
//                 <div key={rec.label} className={cardStyles.info.content}>
//                   <div className={`${style.iconBg} mb-3 mx-auto`}>
//                     <div className={style.iconColor}>
//                       {rec.label === 'Needs' && (
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//                         </svg>
//                       )}
//                       {rec.label === 'Wants' && (
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15m0-5a3 3 0 11-6 0 3 3 0 016 0zm6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       )}
//                       {rec.label === 'Savings' && (
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="text-center">
//                     <div className="mb-2">
//                       <div className={style.value}>
//                         {targetPercentage}%
//                       </div>
//                       <div className={style.label}>
//                         TARGET {rec.label.toUpperCase()}
//                       </div>
//                     </div>
                    
//                     <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium ${
//                       rec.isOnTarget ? badgeStyles.success : badgeStyles.info
//                     }`}>
//                       {rec.isOnTarget ? (
//                         <>
//                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                           </svg>
//                           Perfect!
//                         </>
//                       ) : rec.categoryType === 'expense' ? (
//                         // For expenses: if changeNeeded is negative, we need to REDUCE (down arrow)
//                         rec.changeNeeded < 0 ? (
//                           <>
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
//                             </svg>
//                             {rec.changeNeeded}%
//                           </>
//                         ) : (
//                           // Below target for expenses - maintain (tick)
//                           <>
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                             Good!
//                           </>
//                         )
//                       ) : (
//                         // For savings: if changeNeeded is positive, we need to INCREASE (up arrow)
//                         rec.changeNeeded > 0 ? (
//                           <>
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
//                             </svg>
//                             +{rec.changeNeeded}%
//                           </>
//                         ) : (
//                           // Above target for savings - maintain (tick)
//                           <>
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                             Good!
//                           </>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
          
//           <div className={cardStyles.info.content}>
//             <p className={`${cardStyles.info.description} font-medium mb-2`}>
//               💡 To reach the {nextRule.name} target:
//             </p>
//             <ul className={`text-sm ${cardStyles.info.description} space-y-1`}>
//               {recommendations.map((rec) => (
//                 <li key={rec.label} className="flex items-center gap-2">
//                   <span className="w-1 h-1 bg-current rounded-full"></span>
//                   {rec.message}
//                 </li>
//               ))}
//               {alternatives && alternatives.length > 0 && (
//                 <>
//                   {alternatives.includes('reduce_wants_more') && (
//                     <li className="flex items-center gap-2">
//                       <span className="w-1 h-1 bg-current rounded-full"></span>
//                       Focus on reducing discretionary spending first
//                     </li>
//                   )}
//                   {alternatives.includes('increase_income') && (
//                     <li className="flex items-center gap-2">
//                       <span className="w-1 h-1 bg-current rounded-full"></span>
//                       Consider income increase through side work or advancement
//                     </li>
//                   )}
//                   {alternatives.includes('gradual_approach') && (
//                     <li className="flex items-center gap-2">
//                       <span className="w-1 h-1 bg-current rounded-full"></span>
//                       Take a gradual approach - small changes add up!
//                     </li>
//                   )}
//                 </>
//               )}
//             </ul>
//           </div>
//         </div>
//       </div>
//     );
//   }

  // Fallback - should never reach here
  return null;
};
