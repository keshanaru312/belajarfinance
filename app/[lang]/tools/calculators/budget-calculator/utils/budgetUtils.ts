/**
 * Budget Utilities
 * 
 * This file contains pure utility functions for budget calculations and formatting:
 * - formatCurrency: Formats numbers as MYR currency
 * - findBestRule: Matches user's spending to closest budget rule using distance algorithm
 * - getNextRecommendation: Provides personalized advice for improving budget
 */

import { BudgetRule } from '../types';
import { budgetRules } from '../constants';

/**
 * Formats a number as Malaysian Ringgit (MYR) currency
 * @param amount - The number to format
 * @returns Formatted currency string (e.g., "RM 1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("ms-MY", {
    style: "currency",
    currency: "MYR",
  });
};

/**
 * findBestRule - Determines which budget rule best matches the user's spending pattern
 * 
 * ALGORITHM EXPLANATION:
 * This function finds the budget rule (50:30:20, 70:20:10, or 80:20:0) that most closely
 * matches the user's actual spending percentages using a "distance score" approach.
 * 
 * HOW IT WORKS:
 * 1. First, it calculates what percentage of income goes to each category:
 *    - Needs percentage = (totalNeeds / income) * 100
 *    - Wants percentage = (totalWants / income) * 100
 *    - Savings percentage = (totalSavings / income) * 100
 * 
 * 2. For each budget rule, it calculates a "distance score" by:
 *    - Finding the difference between user's % and rule's % for each category
 *    - Taking the absolute value (we care about distance, not direction)
 *    - Summing these differences together
 * 
 * 3. The rule with the LOWEST total distance score wins!
 * 
 * EXAMPLE:
 * User spends: 60% needs, 25% wants, 15% savings
 * 
 * Against 50:30:20 rule:
 *   - Needs diff: |60 - 50| = 10
 *   - Wants diff: |25 - 30| = 5
 *   - Savings diff: |15 - 20| = 5
 *   - Total score: 10 + 5 + 5 = 20
 * 
 * Against 70:20:10 rule:
 *   - Needs diff: |60 - 70| = 10
 *   - Wants diff: |25 - 20| = 5
 *   - Savings diff: |15 - 10| = 5
 *   - Total score: 10 + 5 + 5 = 20
 * 
 * Against 80:20:0 rule:
 *   - Needs diff: |60 - 80| = 20
 *   - Wants diff: |25 - 20| = 5
 *   - Savings diff: |15 - 0| = 15
 *   - Total score: 20 + 5 + 15 = 40
 * 
 * Result: 50:30:20 and 70:20:10 tied at score 20 (first one wins)
 * 
 * WHY THIS WORKS:
 * - Lower score = closer match = better recommendation
 * - Treats all categories equally (each % point has same weight)
 * - Simple, interpretable, and gives sensible results
 * 
 * @param income - User's monthly income
 * @param totalNeeds - Total essential expenses
 * @param totalWants - Total discretionary expenses
 * @param totalSavings - Total savings amount
 * @returns Object containing the best matching rule and its distance score
 */
export const findBestRule = (
  income: number,
  totalNeeds: number,
  totalWants: number,
  totalSavings: number
): { rule: BudgetRule; score: number } => {
  if (income === 0) return { rule: budgetRules[0], score: 0 };
  
  // Calculate user's actual percentages
  const needsPercentage = (totalNeeds / income) * 100;
  const wantsPercentage = (totalWants / income) * 100;
  const savingsPercentage = (totalSavings / income) * 100;

  let bestRule = budgetRules[0];
  let bestScore = Infinity;

  // Test each rule and find the one with lowest distance score
  budgetRules.forEach(rule => {
    const needsDiff = Math.abs(needsPercentage - rule.needs);
    const wantsDiff = Math.abs(wantsPercentage - rule.wants);
    const savingsDiff = Math.abs(savingsPercentage - rule.savings);
    const score = needsDiff + wantsDiff + savingsDiff;

    if (score < bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  });

  return { rule: bestRule, score: bestScore };
};

/**
 * =============================================================================
 * RECOMMENDATION ENGINE
 * =============================================================================
 * 
 * This section contains all logic for generating personalized budget recommendations.
 * 
 * CORE PHILOSOPHY:
 * 1. NEVER suggest reducing savings (only maintain or increase)
 * 2. NEVER suggest increasing needs/wants expenses (only maintain or reduce)
 * 3. Find the most achievable path to save more
 * 4. Acknowledge when changes are difficult (especially needs reduction)
 * 5. Provide alternatives when primary path is challenging
 * 
 * DECISION FLOW PRIORITY:
 * 
 * Priority 1: OVERSPENDING (expenses > income)
 *   → Still recommend a rule (most achievable one)
 *   → Add urgent messaging about reducing expenses
 *   → Help user see concrete target
 * 
 * Priority 2: GOLD STANDARD OR BETTER (savings >= 20%)
 *   → Check if wants > 30%: Suggest optional further optimization
 *   → Check if needs > 50%: Suggest optional income increase
 *   → Otherwise: Celebrate achievement
 * 
 * Priority 3: GOOD SAVINGS (10-19%)
 *   → Calculate effort to reach 50:30:20
 *   → Recommend if achievable
 * 
 * Priority 4: STARTING TO SAVE (1-9%)
 *   → Find most achievable rule that increases savings
 *   → Consider current spending distribution
 * 
 * Priority 5: NOT SAVING YET (0%)
 *   → Same as Priority 4, emphasize starting
 * 
 * =============================================================================
 */

/**
 * getNextRecommendation - Main recommendation engine
 * 
 * Analyzes user's current budget and determines the best next step to improve
 * their financial situation. Returns both the recommended rule and contextual
 * messaging to guide the user.
 * 
 * @param needsPercentage - Current needs spending percentage (0-100)
 * @param wantsPercentage - Current wants spending percentage (0-100)
 * @param savingsPercentage - Current savings percentage (0-100)
 * @param totalExpenses - Total monthly expenses in currency
 * @param income - Monthly income in currency
 * @returns Object with recommended rule, message type, and achievement status
 */
export const getNextRecommendation = (
  needsPercentage: number,
  wantsPercentage: number,
  savingsPercentage: number,
  totalExpenses: number,
  income: number
): {
  nextRule: BudgetRule | null;
  messageType: 'overspending' | 'gold_optional_wants' | 'gold_optional_needs' | 'gold_achieved' | 'progress' | 'start_saving';
  isGoldStandard: boolean;
  hasOverspending: boolean;
  effortScore?: number;
  alternatives?: string[];
  bestMatchRule?: BudgetRule;
} => {
  const goldStandardRule = budgetRules.find(r => r.name === "50:30:20") || budgetRules[0];
  const hasOverspending = totalExpenses > income;
  const isGoldStandard = savingsPercentage >= 20;

  // =================================================================
  // PRIORITY 1: OVERSPENDING - Critical situation
  // =================================================================
  if (hasOverspending) {
    // Calculate user's spending pattern to find best match
    const totalSpent = needsPercentage + wantsPercentage + savingsPercentage;
    const normalizedNeeds = totalSpent > 0 ? (needsPercentage / totalSpent) * 100 : 0;
    const normalizedWants = totalSpent > 0 ? (wantsPercentage / totalSpent) * 100 : 0;
    const normalizedSavings = totalSpent > 0 ? (savingsPercentage / totalSpent) * 100 : 0;
    
    // Find best match rule based on their spending distribution
    const { rule: bestMatchRule } = findBestRule(
      100, // Use 100 as base for percentage calculation
      normalizedNeeds,
      normalizedWants,
      normalizedSavings
    );
    
    return {
      nextRule: null, // No specific target - they need to get to 100% first
      messageType: 'overspending',
      isGoldStandard: false,
      hasOverspending: true,
      bestMatchRule, // Include for aspirational guidance
      alternatives: generateOverspendingAlternatives(needsPercentage, wantsPercentage)
    };
  }

  // =================================================================
  // PRIORITY 2: GOLD STANDARD OR BETTER - Optimization phase
  // =================================================================
  if (isGoldStandard) {
    // Check if wants can be optimized further
    if (wantsPercentage > 30) {
      return {
        nextRule: goldStandardRule,
        messageType: 'gold_optional_wants',
        isGoldStandard: true,
        hasOverspending: false
      };
    }
    
    // Check if needs could be addressed via income increase
    if (needsPercentage > 50) {
      return {
        nextRule: goldStandardRule,
        messageType: 'gold_optional_needs',
        isGoldStandard: true,
        hasOverspending: false
      };
    }
    
    // Perfect! Nothing to optimize
    return {
      nextRule: goldStandardRule,
      messageType: 'gold_achieved',
      isGoldStandard: true,
      hasOverspending: false
    };
  }

  // =================================================================
  // PRIORITY 3-5: PROGRESSIVE IMPROVEMENT - Build savings
  // =================================================================
  const targetRule = findMostAchievableRule(needsPercentage, wantsPercentage, savingsPercentage, false);
  const effortScore = calculateChangeEffort(needsPercentage, wantsPercentage, savingsPercentage, targetRule);
  
  // Determine if needs reduction is required (challenging scenario)
  const needsReductionRequired = targetRule.needs < needsPercentage;
  const alternatives = needsReductionRequired 
    ? generateNeedsReductionAlternatives(needsPercentage, wantsPercentage, targetRule)
    : [];

  return {
    nextRule: targetRule,
    messageType: savingsPercentage < 1 ? 'start_saving' : 'progress',
    isGoldStandard: false,
    hasOverspending: false,
    effortScore,
    alternatives
  };
};

/**
 * findMostAchievableRule - Determines which budget rule is most realistic to achieve
 * 
 * ALGORITHM:
 * 1. Filter rules to only those that increase savings (or all rules if overspending)
 * 2. Calculate "effort score" for each rule
 * 3. Return rule with lowest effort score
 * 
 * EFFORT SCORING:
 * - Needs changes: 1.5x weight (hardest - rent, utilities, groceries are sticky)
 * - Wants changes: 1.0x weight (moderate - can cut entertainment, dining)
 * - Savings changes: 0.5x weight (easiest - just redirect money)
 * 
 * @param needsPercentage - Current needs percentage
 * @param wantsPercentage - Current wants percentage
 * @param savingsPercentage - Current savings percentage
 * @param allowLowerSavings - If true, consider all rules (for overspending scenario)
 * @returns The most achievable budget rule
 */
export const findMostAchievableRule = (
  needsPercentage: number,
  wantsPercentage: number,
  savingsPercentage: number,
  allowLowerSavings: boolean = false
): BudgetRule => {
  // Filter candidate rules
  let candidateRules = allowLowerSavings
    ? budgetRules
    : budgetRules.filter(rule => rule.savings > savingsPercentage);

  // If no rules increase savings, default to gold standard
  if (candidateRules.length === 0) {
    return budgetRules.find(r => r.name === "50:30:20") || budgetRules[0];
  }

  // Calculate effort for each candidate
  let bestRule = candidateRules[0];
  let lowestEffort = Infinity;

  candidateRules.forEach(rule => {
    const effort = calculateChangeEffort(needsPercentage, wantsPercentage, savingsPercentage, rule);
    
    if (effort < lowestEffort) {
      lowestEffort = effort;
      bestRule = rule;
    }
  });

  return bestRule;
};

/**
 * calculateChangeEffort - Quantifies difficulty of reaching a target rule
 * 
 * WEIGHTING RATIONALE:
 * - Needs (1.5x): Hardest to change - essential expenses like rent, utilities
 * - Wants (1.0x): Moderate difficulty - discretionary spending is more flexible
 * - Savings (0.5x): Easiest - just redirect money flow, no lifestyle change
 * 
 * ONLY COUNTS REDUCTIONS AS EFFORT:
 * - Needs reduction = difficult (counts toward effort)
 * - Wants reduction = moderate (counts toward effort)
 * - Savings increase = easy (counts lightly toward effort)
 * - Any increases in needs/wants = not counted (we never suggest these)
 * 
 * @param currentNeeds - Current needs percentage
 * @param currentWants - Current wants percentage
 * @param currentSavings - Current savings percentage
 * @param targetRule - The rule to evaluate
 * @returns Effort score (lower = more achievable)
 */
export const calculateChangeEffort = (
  currentNeeds: number,
  currentWants: number,
  currentSavings: number,
  targetRule: BudgetRule
): number => {
  const needsChange = targetRule.needs - currentNeeds;
  const wantsChange = targetRule.wants - currentWants;
  const savingsChange = targetRule.savings - currentSavings;
  
  let effortScore = 0;
  
  // Needs: Only count if reduction needed (negative change)
  if (needsChange < 0) {
    effortScore += Math.abs(needsChange) * 1.5;
  }
  
  // Wants: Only count if reduction needed (negative change)
  if (wantsChange < 0) {
    effortScore += Math.abs(wantsChange) * 1.0;
  }
  
  // Savings: Only count if increase needed (positive change)
  if (savingsChange > 0) {
    effortScore += Math.abs(savingsChange) * 0.5;
  }
  
  return effortScore;
};

/**
 * generateOverspendingAlternatives - Suggests ways to fix overspending
 * 
 * Prioritizes the easiest changes first (wants before needs).
 * 
 * @param needsPercentage - Current needs percentage
 * @param wantsPercentage - Current wants percentage
 * @returns Array of alternative strategies
 */
export const generateOverspendingAlternatives = (
  needsPercentage: number,
  wantsPercentage: number
): string[] => {
  const alternatives: string[] = [];
  
  // Always suggest cutting wants first (easier)
  if (wantsPercentage > 20) {
    alternatives.push('reduce_wants');
  }
  
  // Then suggest cutting needs if necessary
  if (needsPercentage > 50) {
    alternatives.push('reduce_needs');
  }
  
  // Always include income increase as option
  alternatives.push('increase_income');
  
  return alternatives;
};

/**
 * generateNeedsReductionAlternatives - Suggests alternatives when needs reduction is hard
 * 
 * When a rule requires reducing essential expenses (needs), we acknowledge
 * this is difficult and provide alternative strategies.
 * 
 * @param needsPercentage - Current needs percentage
 * @param wantsPercentage - Current wants percentage
 * @param targetRule - The target rule that requires needs reduction
 * @returns Array of alternative strategies
 */
export const generateNeedsReductionAlternatives = (
  needsPercentage: number,
  wantsPercentage: number,
  targetRule: BudgetRule
): string[] => {
  const alternatives: string[] = [];
  
  // If wants are high, suggest reducing those instead
  if (wantsPercentage > targetRule.wants) {
    alternatives.push('reduce_wants_more');
  }
  
  // Always suggest income increase as alternative to needs reduction
  alternatives.push('increase_income');
  
  // Suggest gradual approach
  alternatives.push('gradual_approach');
  
  return alternatives;
};

/**
 * generateCategoryRecommendations - Creates recommendation messages for budget categories
 * 
 * MESSAGING RULES:
 * 1. Needs/Wants: Can only suggest "reduce" or "maintain" (never increase)
 * 2. Savings: Can only suggest "increase" or "maintain" (never reduce)
 * 3. When below target for expenses: Celebrate efficiency
 * 4. When above target for savings: Celebrate excellence
 * 
 * This ensures we never suggest bad financial behaviors like increasing expenses
 * or reducing savings.
 * 
 * @param targetRule - The target budget rule to aim for
 * @param needsPercentage - User's current needs percentage
 * @param wantsPercentage - User's current wants percentage
 * @param savingsPercentage - User's current savings percentage
 * @param dict - Translation dictionary
 * @returns Array of recommendation objects with label, message, and change type
 */
export const generateCategoryRecommendations = (
  targetRule: BudgetRule,
  needsPercentage: number,
  wantsPercentage: number,
  savingsPercentage: number,
  dict: any
): Array<{ label: string; message: string; changeNeeded: number; isOnTarget: boolean; categoryType: 'expense' | 'savings' }> => {
  const categories = [
    {
      label: 'Needs',
      labelKey: 'needs',
      current: Math.round(needsPercentage),
      target: targetRule.needs,
      type: 'expense' as const
    },
    {
      label: 'Wants',
      labelKey: 'wants',
      current: Math.round(wantsPercentage),
      target: targetRule.wants,
      type: 'expense' as const
    },
    {
      label: 'Savings',
      labelKey: 'savings',
      current: Math.round(savingsPercentage),
      target: targetRule.savings,
      type: 'savings' as const
    },
  ];

  return categories.map((item) => {
    const changeNeeded = item.target - item.current;
    // Use 2% tolerance - within 2% is considered "on target"
    const isOnTarget = Math.abs(changeNeeded) <= 2;
    const category = dict.budgetCalculator.categories[item.labelKey];
    
    let message = '';
    
    if (isOnTarget) {
      // Within 2% tolerance - essentially on target
      message = dict.budgetCalculator.results.categoryRecs.keep
        .replace('{category}', category)
        .replace('{current}', item.current);
      
    } else if (item.type === 'expense') {
      // For expenses (needs/wants): can only reduce or maintain
      if (changeNeeded < 0) {
        // Target is lower - need to reduce expenses (GOOD)
        message = dict.budgetCalculator.results.categoryRecs.reduce
          .replace('{category}', category)
          .replace('{current}', item.current)
          .replace('{target}', item.target)
          .replace('{change}', changeNeeded);
      } else {
        // Target is higher - but we NEVER suggest increasing expenses
        // Instead, celebrate being below target
        message = dict.budgetCalculator.results.categoryRecs.maintain
          .replace('{category}', category)
          .replace('{current}', item.current)
          .replace('{target}', item.target);
      }
      
    } else {
      // For savings: can only increase or maintain
      if (changeNeeded > 0) {
        // Target is higher - need to increase savings (GOOD)
        message = dict.budgetCalculator.results.categoryRecs.increase
          .replace('{category}', category)
          .replace('{current}', item.current)
          .replace('{target}', item.target)
          .replace('{change}', changeNeeded);
      } else {
        // Target is lower - but we NEVER suggest reducing savings
        // Instead, celebrate exceeding target
        message = dict.budgetCalculator.results.categoryRecs.maintainExcellent
          .replace('{category}', category)
          .replace('{current}', item.current)
          .replace('{target}', item.target);
      }
    }

    return {
      label: item.label,
      message,
      changeNeeded,
      isOnTarget,
      categoryType: item.type
    };
  });
};

/**
 * generateOverspendingRecommendations - Creates specific recommendations for overspending scenarios
 * 
 * PHILOSOPHY FOR OVERSPENDING:
 * - Don't recommend a specific target rule (they're not ready for that yet)
 * - Focus on immediate actions to get expenses below income
 * - Use best match rule as an aspirational long-term goal
 * - Always provide all 3 recommendations regardless of current pattern
 * - Let the user decide which actions to take
 * 
 * RECOMMENDATION STRUCTURE:
 * 1. Critical: Keep wants below 30% (discretionary spending)
 * 2. Important: Address needs through income increase or cost reduction
 * 3. Aspirational: Long-term goal once back on track
 * 
 * @param wantsPercentage - Current wants percentage
 * @param needsPercentage - Current needs percentage
 * @param bestMatchRule - The rule that most closely matches their current pattern
 * @param dict - Translation dictionary
 * @returns Array of 3 recommendations (critical, important, aspirational)
 */
export const generateOverspendingRecommendations = (
  wantsPercentage: number,
  needsPercentage: number,
  bestMatchRule: BudgetRule,
  dict: any
): Array<{ label: string; message: string; priority: 'critical' | 'important' | 'aspirational' }> => {
  return [
    {
      label: dict.budgetCalculator.results.overspendingRecs.keepWantsLow,
      message: dict.budgetCalculator.results.overspendingRecs.wantsMessage,
      priority: 'critical' as const
    },
    {
      label: dict.budgetCalculator.results.overspendingRecs.addressNeeds,
      message: dict.budgetCalculator.results.overspendingRecs.needsMessage,
      priority: 'important' as const
    },
    {
      label: dict.budgetCalculator.results.overspendingRecs.longTerm,
      message: dict.budgetCalculator.results.overspendingRecs.longTermMessage.replace('{rule}', bestMatchRule.name),
      priority: 'aspirational' as const
    }
  ];
};
