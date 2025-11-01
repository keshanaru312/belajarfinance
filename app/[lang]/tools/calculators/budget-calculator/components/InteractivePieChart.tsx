/**
 * InteractivePieChart Component
 * 
 * An interactive, animated pie chart visualization for budget breakdown.
 * Provides multiple layers of interactivity for exploring budget details:
 * 
 * Features:
 * - Main view: Shows needs/wants/savings distribution with hover effects
 * - Click segments: View detailed breakdown of selected category
 * - Drill-down mode: Explore individual items within a category (detailed flow only)
 * - Smooth animations: Uses framer-motion for engaging transitions
 * - Upgrade prompts: Encourages simple flow users to try detailed tracking
 * 
 * The chart adapts its behavior based on flowType (simple vs detailed) to provide
 * appropriate interactivity and information density.
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { InteractivePieChartProps, PieChartData } from '../types';

export const InteractivePieChart: React.FC<InteractivePieChartProps> = ({ 
  needsPercentage, 
  wantsPercentage, 
  savingsPercentage,
  totalNeeds,
  totalWants,
  totalSavings,
  needsExpenses,
  wantsExpenses,
  emergencyFundAmount,
  otherSavingsAmount,
  flowType,
  setFlowType,
  setStep,
  dict,
  formatCurrency
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Helper function to get breakdown data
  const getBreakdownData = (segmentName: string) => {
    if (flowType === 'simple') {
      return null; // No breakdown for simple flow
    }

    if (segmentName === dict.budgetCalculator?.categories?.needsLabel) {
      return needsExpenses.filter(item => item.amount > 0);
    } else if (segmentName === dict.budgetCalculator?.categories?.wantsLabel) {
      return wantsExpenses.filter(item => item.amount > 0);
    } else if (segmentName === dict.budgetCalculator?.categories?.savingsLabel) {
      return [
        { id: 'emergency', name: dict.budgetCalculator?.steps?.savings?.emergencyFundLabel || 'Emergency Fund', amount: emergencyFundAmount },
        { id: 'other', name: dict.budgetCalculator?.steps?.savings?.otherSavingsLabel || 'Other Savings', amount: otherSavingsAmount }
      ].filter(item => item.amount > 0);
    }
    return [];
  };

  // Prepare drill-down data
  const getDrillDownData = () => {
    if (!drillDownCategory || flowType === 'simple') return null;

    const breakdownItems = getBreakdownData(drillDownCategory);
    if (!breakdownItems || breakdownItems.length === 0) return null;

    const total = breakdownItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Generate colors for breakdown items
    const generateColor = (index: number, baseColor: string) => {
      const hue = parseInt(baseColor.slice(1), 16);
      const hueShift = (index * 40) % 360;
      return `hsl(${(hue + hueShift) % 360}, 60%, ${50 + (index * 10) % 30}%)`;
    };

    const baseColor = drillDownCategory === 'Needs' ? '#ef4444' : 
                     drillDownCategory === 'Wants' ? '#3b82f6' : '#10b981';

    return breakdownItems.map((item, index) => ({
      name: item.name,
      value: total > 0 ? (item.amount / total) * 100 : 0,
      amount: item.amount,
      color: generateColor(index, baseColor)
    }));
  };

  const drillDownData = getDrillDownData();
  
  const data: PieChartData[] = drillDownData || [
    { 
      name: dict.budgetCalculator.categories.needsLabel, 
      value: needsPercentage, 
      amount: totalNeeds,
      color: '#ef4444' // red-500
    },
    { 
      name: dict.budgetCalculator.categories.wantsLabel, 
      value: wantsPercentage, 
      amount: totalWants,
      color: '#3b82f6' // blue-500
    },
    { 
      name: dict.budgetCalculator.categories.savingsLabel, 
      value: savingsPercentage, 
      amount: totalSavings,
      color: '#10b981' // emerald-500
    }
  ].filter(item => item.value > 0); // Only show segments with values > 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {drillDownCategory 
            ? `${drillDownCategory} ${dict.budgetCalculator.results.breakdown}`
            : (dict.budgetCalculator?.results?.yourBudget || "Your Current Budget")
          }
        </h3>
        {drillDownCategory && (
          <button
            onClick={() => setDrillDownCategory(null)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
          >
            ← {dict.budgetCalculator.results.backToOverview}
          </button>
        )}
      </div>
      
      {/* Instructions for interaction */}
      {!drillDownCategory && !selectedCategory && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {flowType === 'detailed' 
              ? dict.budgetCalculator.results.clickToExplore
              : dict.budgetCalculator.results.clickToExploreSimple
            }
          </p>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Pie Chart */}
        <motion.div 
          className="w-full max-w-sm mx-auto"
          animate={{ 
            scale: isHovered ? 1.02 : 1,
            rotateY: activeIndex !== null ? 5 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={activeIndex !== null ? 45 : 50}
                outerRadius={activeIndex !== null ? 105 : 100}
                paddingAngle={activeIndex !== null ? 4 : 2}
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) => {
                  if (!drillDownCategory) {
                    const categoryName = data[index].name;
                    if (['Needs', 'Wants', 'Savings'].includes(categoryName)) {
                      setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
                    }
                  }
                }}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={activeIndex === index ? "#ffffff" : "none"}
                    strokeWidth={activeIndex === index ? 3 : 0}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                      cursor: !drillDownCategory ? 'pointer' : 'default',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: activeIndex === index && !drillDownCategory ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((entry, index) => (
            <div
              key={entry.name}
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
                !drillDownCategory ? 'cursor-pointer' : 'cursor-default'
              } ${
                activeIndex === index 
                  ? `bg-gray-50 dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 ${
                      !drillDownCategory ? 'transform scale-105' : ''
                    }` 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => {
                if (!drillDownCategory) {
                  const categoryName = entry.name;
                  if (['Needs', 'Wants', 'Savings'].includes(categoryName)) {
                    setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
                  }
                }
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span 
                  className={`font-medium text-sm ${
                    activeIndex === index ? 'text-current' : ''
                  }`}
                  style={{
                    color: activeIndex === index ? entry.color : undefined
                  }}
                >
                  {entry.name}:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className={`text-xs font-semibold ${
                    activeIndex === index ? 'text-current' : ''
                  }`}
                  style={{
                    color: activeIndex === index ? entry.color : undefined
                  }}
                >
                  {Math.round(entry.value)}% ({formatCurrency(entry.amount)})
                </span>
                {activeIndex === index && !drillDownCategory && (
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Category Detail */}
      {selectedCategory && !drillDownCategory && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: selectedCategory === 'Needs' ? '#ef4444' : 
                                 selectedCategory === 'Wants' ? '#3b82f6' : '#10b981'
                }}
              />
              <h4 className="font-medium text-sm">
                {selectedCategory} Details
              </h4>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {flowType === 'detailed' ? (
            <div className="space-y-3">
              <div className="space-y-2">
                {(() => {
                  const breakdownItems = getBreakdownData(selectedCategory);
                  const categoryData = data.find(d => d.name === selectedCategory);
                  const categoryTotal = categoryData?.amount || 0;
                  
                  return breakdownItems?.map((item, index) => {
                    const percentage = categoryTotal > 0 ? (item.amount / categoryTotal) * 100 : 0;
                    return (
                      <div key={item.id || index} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                        <span className="font-medium">
                          {Math.round(percentage)}% ({formatCurrency(item.amount)})
                        </span>
                      </div>
                    );
                  });
                })()}
                {getBreakdownData(selectedCategory)?.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No items in this category</p>
                )}
              </div>
              
              {(getBreakdownData(selectedCategory)?.length || 0) > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setDrillDownCategory(selectedCategory);
                      setSelectedCategory(null);
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {dict.budgetCalculator?.results?.viewBreakdownChart?.replace('{category}', selectedCategory || '') || `View ${selectedCategory} Breakdown Chart`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {dict.budgetCalculator?.results?.unlockDetailed?.replace('{category}', selectedCategory || '') || `Unlock Detailed ${selectedCategory} Breakdown`}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {dict.budgetCalculator?.results?.seeWhereMoneyGoes?.replace('{category}', selectedCategory?.toLowerCase() || '') || `See exactly where your ${selectedCategory?.toLowerCase()} money goes with interactive charts, individual expense tracking, and detailed insights to optimize your spending.`}
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setFlowType('detailed');
                    setStep(1); // Go back to start with detailed flow
                  }}
                  className="w-full px-4 py-3 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {dict.budgetCalculator?.results?.switchToDetailed || "Switch to Detailed Tracking"}
                </button>
                
                <p className="text-xs text-gray-500">
                  {dict.budgetCalculator?.results?.setupTime || "Takes 2-3 minutes to set up • Get personalized recommendations"}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
