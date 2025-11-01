"use client";

/**
 * ProgressBar Component
 * 
 * A reusable progress bar component that visually shows spending progress relative to income.
 * Color-codes the bar based on spending level:
 * - Green: Healthy spending (under budget)
 * - Yellow: At limit or slightly over budget
 * - Red: Significantly over budget (>150% of income)
 * 
 * Used throughout the calculator to provide immediate visual feedback on budget status.
 */

import React from 'react';

interface ProgressBarProps {
  used: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ used, total }) => {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isWayOverBudget = used > (total * 1.5);
  const isOverBudget = used > total;
  const isEqualToTotal = used === total;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2 dark:bg-gray-700">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${
          isWayOverBudget ? 'bg-red-600' : 
          isOverBudget ? 'bg-yellow-500' : 
          isEqualToTotal ? 'bg-yellow-500' : 'bg-green-500'
        }`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
};
