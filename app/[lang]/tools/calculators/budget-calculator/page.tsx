"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { usePersistentValue } from "@/hooks/usePersistentValue";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const runtime = "edge";

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

interface BudgetRule {
  name: string;
  needs: number;
  wants: number;
  savings: number;
}

const budgetRules: BudgetRule[] = [
  { name: "50:30:20", needs: 50, wants: 30, savings: 20 },
  { name: "70:20:10", needs: 70, wants: 20, savings: 10 },
  { name: "80:20:0", needs: 80, wants: 20, savings: 0 },
];

const defaultNeeds: ExpenseItem[] = [
  { id: "need1", name: "Housing", amount: 0 },
  { id: "need2", name: "Utilities", amount: 0 },
  { id: "need3", name: "Groceries", amount: 0 },
  { id: "need4", name: "Transport", amount: 0 },
];

export default function BudgetCalculator() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);

  const [step, setStep] = useState(1);
  const [flowType, setFlowType] = usePersistentValue<'detailed' | 'simple'>("budgetFlowType", 'detailed');
  const [income, setIncome] = usePersistentValue("budgetIncome", 0);
  const [needsExpenses, setNeedsExpenses] = usePersistentValue<ExpenseItem[]>("budgetNeeds", defaultNeeds);
  const [wantsExpenses, setWantsExpenses] = usePersistentValue<ExpenseItem[]>("budgetWants", []);
  const [emergencyFundPercentage, setEmergencyFundPercentage] = useState(50);
  const [otherSavingsPercentage, setOtherSavingsPercentage] = useState(50);
  
  // Simple flow state
  const [simpleTotalNeeds, setSimpleTotalNeeds] = usePersistentValue("budgetSimpleNeeds", 0);
  const [simpleTotalWants, setSimpleTotalWants] = usePersistentValue("budgetSimpleWants", 0);
  const [simpleTotalSavings, setSimpleTotalSavings] = usePersistentValue("budgetSimpleSavings", 0);

  // Global persistent values for cross-calculator sharing
  const [, setGlobalMonthlyIncome] = usePersistentValue("monthlyIncome", 0);
  const [, setGlobalTotalNeeds] = usePersistentValue("totalNeeds", 0);
  const [, setGlobalTotalWants] = usePersistentValue("totalWants", 0);
  const [, setGlobalTotalExpenses] = usePersistentValue("totalExpenses", 0);
  const [, setGlobalTotalSavings] = usePersistentValue("totalSavings", 0);
  const [, setGlobalEmergencyFundSavings] = usePersistentValue("emergencyFundSavings", 0);

  // Calculate totals based on flow type
  const totalNeeds = flowType === 'detailed' 
    ? needsExpenses.reduce((sum, item) => sum + item.amount, 0)
    : simpleTotalNeeds;
  const totalWants = flowType === 'detailed'
    ? wantsExpenses.reduce((sum, item) => sum + item.amount, 0)
    : simpleTotalWants;
  
  const totalExpenses = totalNeeds + totalWants;
  const remainingAfterExpenses = Math.max(0, income - totalExpenses);
  
  // Validation: expenses cannot exceed 150% of income
  const maxAllowedExpenses = income * 1.5;
  const isExpensesTooHigh = totalExpenses > maxAllowedExpenses;
  const isExpensesSameOrExceedIncome = totalExpenses >= income;

  // Calculate savings amounts based on flow type and remaining funds
  let totalSavings, emergencyFundAmount, otherSavingsAmount;
  
  if (flowType === 'simple') {
    totalSavings = simpleTotalSavings;
    emergencyFundAmount = (simpleTotalSavings * emergencyFundPercentage) / 100;
    otherSavingsAmount = (simpleTotalSavings * otherSavingsPercentage) / 100;
  } else {
    emergencyFundAmount = (remainingAfterExpenses * emergencyFundPercentage) / 100;
    otherSavingsAmount = (remainingAfterExpenses * otherSavingsPercentage) / 100;
    totalSavings = emergencyFundAmount + otherSavingsAmount;
  }

  // Update global persistent values for cross-calculator sharing
  const updateGlobalValues = useCallback(() => {
    setGlobalMonthlyIncome(income);
    setGlobalTotalNeeds(totalNeeds);
    setGlobalTotalWants(totalWants);
    setGlobalTotalExpenses(totalExpenses);
    setGlobalTotalSavings(totalSavings);
    setGlobalEmergencyFundSavings(emergencyFundAmount);
  }, [
    income, totalNeeds, totalWants, totalExpenses, totalSavings, emergencyFundAmount,
    setGlobalMonthlyIncome, setGlobalTotalNeeds, setGlobalTotalWants, 
    setGlobalTotalExpenses, setGlobalTotalSavings, setGlobalEmergencyFundSavings
  ]);

  // Update global values whenever calculations change
  useEffect(() => {
    if (income > 0) {
      updateGlobalValues();
    }
  }, [income, totalNeeds, totalWants, totalExpenses, totalSavings, emergencyFundAmount, updateGlobalValues]);

  const addExpenseItem = useCallback((type: 'needs' | 'wants') => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
    };

    if (type === 'needs') {
      setNeedsExpenses([...needsExpenses, newItem]);
    } else {
      setWantsExpenses([...wantsExpenses, newItem]);
    }
  }, [needsExpenses, wantsExpenses, setNeedsExpenses, setWantsExpenses]);

  const updateExpenseItem = useCallback((
    type: 'needs' | 'wants',
    id: string,
    field: 'name' | 'amount',
    value: string | number
  ) => {
    const updateList = type === 'needs' ? needsExpenses : wantsExpenses;
    const setList = type === 'needs' ? setNeedsExpenses : setWantsExpenses;
    
    const updated = updateList.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setList(updated);
  }, [needsExpenses, wantsExpenses, setNeedsExpenses, setWantsExpenses]);

  const deleteExpenseItem = useCallback((type: 'needs' | 'wants', id: string) => {
    if (type === 'needs') {
      setNeedsExpenses(needsExpenses.filter(item => item.id !== id));
    } else {
      setWantsExpenses(wantsExpenses.filter(item => item.id !== id));
    }
  }, [needsExpenses, wantsExpenses, setNeedsExpenses, setWantsExpenses]);

  const findBestRule = (): { rule: BudgetRule; score: number } => {
    if (income === 0) return { rule: budgetRules[0], score: 0 };
    
    const needsPercentage = (totalNeeds / income) * 100;
    const wantsPercentage = (totalWants / income) * 100;
    const savingsPercentage = (totalSavings / income) * 100;

    let bestRule = budgetRules[0];
    let bestScore = Infinity;

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

  const getNextRecommendation = (currentRule: string): string => {
    // First check if expenses exceed income - this takes priority
    if (totalExpenses > income) {
      return dict.budgetCalculator?.results?.overspendingAdvice || 
        "Your first priority should be reducing expenses to spend within your income. Consider cutting non-essential expenses and finding ways to increase your income.";
    }
    
    // Then follow normal budgeting rule progression
    if (currentRule === "80:20:0") return "70:20:10";
    if (currentRule === "70:20:10") return "50:30:20";
    return dict.budgetCalculator?.results?.goldStandard || "Well done! You've achieved the gold standard of budgeting.";
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ms-MY", {
      style: "currency",
      currency: "MYR",
    });
  };

  const InteractivePieChart = ({ 
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
    dict 
  }: {
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    totalNeeds: number;
    totalWants: number;
    totalSavings: number;
    needsExpenses: ExpenseItem[];
    wantsExpenses: ExpenseItem[];
    emergencyFundAmount: number;
    otherSavingsAmount: number;
    flowType: 'detailed' | 'simple';
    setFlowType: (type: 'detailed' | 'simple') => void;
    setStep: (step: number) => void;
    dict: any;
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

      if (segmentName === 'Needs') {
        return needsExpenses.filter(item => item.amount > 0);
      } else if (segmentName === 'Wants') {
        return wantsExpenses.filter(item => item.amount > 0);
      } else if (segmentName === 'Savings') {
        return [
          { id: 'emergency', name: 'Emergency Fund', amount: emergencyFundAmount },
          { id: 'other', name: 'Other Savings', amount: otherSavingsAmount }
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
    
    const data = drillDownData || [
      { 
        name: 'Needs', 
        value: needsPercentage, 
        amount: totalNeeds,
        color: '#ef4444' // red-500
      },
      { 
        name: 'Wants', 
        value: wantsPercentage, 
        amount: totalWants,
        color: '#3b82f6' // blue-500
      },
      { 
        name: 'Savings', 
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
              ? `${drillDownCategory} Breakdown`
              : (dict.budgetCalculator?.results?.yourBudget || "Your Current Budget")
            }
          </h3>
          {drillDownCategory && (
            <button
              onClick={() => setDrillDownCategory(null)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
            >
              ← Back to Overview
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
                ? 'Click any segment to see detailed information'
                : 'Click any segment to explore what\'s possible with detailed tracking'
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
                      View {selectedCategory} Breakdown Chart
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
                    Unlock Detailed {selectedCategory} Breakdown
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    See exactly where your {selectedCategory.toLowerCase()} money goes with interactive charts, 
                    individual expense tracking, and detailed insights to optimize your spending.
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
                    Switch to Detailed Tracking
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    Takes 2-3 minutes to set up • Get personalized recommendations
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderProgressBar = (used: number, total: number) => {
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

  const renderExpenseList = (
    expenses: ExpenseItem[], 
    type: 'needs' | 'wants',
    title: string,
    description: string
  ) => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = income - (type === 'needs' ? total : totalNeeds + total);
    
    // For progress bar, use total expenses when in wants screen to match validation messages
    const progressBarUsed = type === 'wants' ? totalExpenses : total;
    
    // Check if any expense name is blank
    const hasEmptyNames = expenses.some(item => !item.name.trim());

    return (
      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
          
          <div className={`mb-4 p-3 rounded-lg ${
            totalExpenses > maxAllowedExpenses
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : totalExpenses >= income
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                : 'bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className="flex justify-between text-sm mb-2">
              <span>Used: {formatCurrency(total)}</span>
              <span>Remaining: {formatCurrency(Math.max(0, remaining))}</span>
            </div>
            {renderProgressBar(progressBarUsed, income)}
            
            {totalExpenses > maxAllowedExpenses && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
                <p className="font-medium">⚠️ {dict.budgetCalculator?.validation?.tooHigh?.title || "Expenses Too High"}</p>
                <p className="mt-1">{dict.budgetCalculator?.validation?.tooHigh?.message || "Your total expenses exceed 150% of income."}</p>
              </div>
            )}
            
            {totalExpenses >= income && totalExpenses <= maxAllowedExpenses && (
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">💡 {dict.budgetCalculator?.validation?.exceedsIncome?.title || "Spending Equals or More Than Income"}</p>
                <p className="mt-1">{dict.budgetCalculator?.validation?.exceedsIncome?.message || "Consider reducing expenses to build savings."}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {expenses.map((item, index) => (
            <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dict.budgetCalculator?.labels?.expenseType || "Expense Type"} #{index + 1}
                </span>
                {expenses.length > 1 && (
                  <button
                    onClick={() => deleteExpenseItem(type, item.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                    title="Delete expense"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {dict.budgetCalculator?.labels?.expenseName || "Expense Name"}
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateExpenseItem(type, item.id, 'name', e.target.value)}
                    className={`input ${!item.name.trim() ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder={type === 'needs' ? 'e.g., Housing, Groceries, Transport' : 'e.g., Entertainment, Shopping, Dining'}
                    required
                  />

                </div>
                
                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {dict.budgetCalculator?.labels?.amount || "Amount (RM)"}
                  </label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateExpenseItem(type, item.id, 'amount', Number(e.target.value) || 0)}
                    className="input text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addExpenseItem(type)}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          {type === 'needs' 
            ? (dict.budgetCalculator?.buttons?.addNeed || "Add Essential Expense")
            : (dict.budgetCalculator?.buttons?.addWant || "Add Fun Expense")
          }
        </button>

        {hasEmptyNames && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>⚠️ Missing Information:</strong> Please fill in all expense names before continuing.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {dict.budgetCalculator?.buttons?.back || "Back"}
          </button>
          <button
            onClick={() => setStep(step + 1)}
            disabled={isExpensesTooHigh || hasEmptyNames}
            className={`flex-1 px-4 py-2 rounded-md transition ${
              isExpensesTooHigh || hasEmptyNames
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {dict.budgetCalculator?.buttons?.continue || "Continue"}
          </button>
        </div>
      </div>
    );
  };

  if (step === 1) {
    // Income Input & Flow Selection Step
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
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {dict.budgetCalculator?.buttons?.start || "Start Budgeting"}
          </button>
        </div>
      </section>
    );
  }

  if (step === 2) {
    if (flowType === 'simple') {
      // Simple Flow - All Totals Step
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
            <div className={`p-3 rounded-lg ${
              isExpensesTooHigh 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : isExpensesSameOrExceedIncome 
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <div className="flex justify-between text-sm mb-2">
                <span>Monthly Income:</span>
                <span className="font-medium">{formatCurrency(income)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Expenses:</span>
                <span className={`font-medium ${
                  isExpensesTooHigh ? 'text-red-600' : 
                  isExpensesSameOrExceedIncome ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatCurrency(simpleTotalNeeds + simpleTotalWants)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Savings:</span>
                <span className="font-medium">{formatCurrency(simpleTotalSavings)}</span>
              </div>
              
              {isExpensesTooHigh && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">⚠️ {dict.budgetCalculator?.validation?.tooHigh?.title || "Expenses Too High"}</p>
                  <p>{dict.budgetCalculator?.validation?.tooHigh?.message || "Your expenses are more than 150% of your income. Please reduce your expenses to continue."}</p>
                </div>
              )}
              
              {!isExpensesTooHigh && isExpensesSameOrExceedIncome && (
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">💡 {dict.budgetCalculator?.validation?.exceedsIncome?.title || "Spending Equals or More Than Income"}</p>
                  <p>{dict.budgetCalculator?.validation?.exceedsIncome?.message || "Your expenses are more than your income."}</p>
                </div>
              )}
              
              {!isExpensesTooHigh && simpleMaxSavings <= 0 && (
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">💡 {dict.budgetCalculator?.validation?.noSavingsAvailable?.title || "Spending Equals or More Than Income"}</p>
                  <p>{dict.budgetCalculator?.validation?.noSavingsAvailable?.message || "Savings can only be added when income exceeds expenses."}</p>
                </div>
              )}
            </div>

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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {dict.budgetCalculator?.buttons?.back || "Back"}
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={isExpensesTooHigh}
                className={`flex-1 px-4 py-2 rounded-md transition ${
                  isExpensesTooHigh
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {dict.budgetCalculator?.buttons?.seeResults || "See Results"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    // Detailed Flow - Needs Expenses Step
    return (
      <section className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="title">{dict.budgetCalculator?.steps?.needs?.title || "Essential Expenses (Needs)"}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dict.budgetCalculator?.steps?.needs?.description || "These are essential expenses you can't live without."}
          </p>
        </div>

        {renderExpenseList(
          needsExpenses,
          'needs',
          dict.budgetCalculator?.steps?.needs?.cardTitle || "Your Needs",
          dict.budgetCalculator?.steps?.needs?.cardDescription || "Housing, utilities, groceries, transport, etc."
        )}
      </section>
    );
  }

  if (step === 3 && flowType === 'detailed') {
    // Wants Expenses Step (Detailed Flow Only)
    return (
      <section className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="title">{dict.budgetCalculator?.steps?.wants?.title || "Fun Expenses (Wants)"}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dict.budgetCalculator?.steps?.wants?.description || "These are the fun stuff - entertainment, dining out, hobbies."}
          </p>
        </div>

        {renderExpenseList(
          wantsExpenses,
          'wants',
          dict.budgetCalculator?.steps?.wants?.cardTitle || "Your Wants",
          dict.budgetCalculator?.steps?.wants?.cardDescription || "Entertainment, dining out, shopping, hobbies, etc."
        )}
      </section>
    );
  }

  if (step === 4 && flowType === 'detailed') {
    // Savings Allocation Step (Detailed Flow Only)
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
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>{formatCurrency(unspentAmount)}</strong> unallocated will be added to your wants budget.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {dict.budgetCalculator?.buttons?.back || "Back"}
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              {dict.budgetCalculator?.buttons?.seeResults || "See Results"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (step === 5) {
    // Results Step
    const { rule: bestRule } = findBestRule();
    const needsPercentage = income > 0 ? (totalNeeds / income) * 100 : 0;
    const wantsPercentage = income > 0 ? (totalWants / income) * 100 : 0;
    const savingsPercentage = income > 0 ? (totalSavings / income) * 100 : 0;
    const nextRecommendation = getNextRecommendation(bestRule.name);

    return (
      <section className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="title">{dict.budgetCalculator?.results?.title || "Your Budget Analysis"}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dict.budgetCalculator?.results?.description || "Here's how your budget stacks up against popular budgeting rules."}
          </p>
        </div>

          {/* Closest Budget Rule */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700 rounded-xl p-6 shadow-lg">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 dark:bg-green-700/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/40 dark:bg-emerald-700/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                      {dict.budgetCalculator?.results?.bestMatch || "Closest Match"}
                    </h3>
                    <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                      {bestRule.name}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {dict.budgetCalculator?.results?.bestMatchDesc || "This budgeting rule aligns most with your current pattern"}
                  </p>
                </div>
              </div>
              
              {/* Comparison Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { 
                    label: 'Needs', 
                    ruleValue: bestRule.needs, 
                    userValue: Math.round(needsPercentage),
                    color: 'red',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l8-8" />
                      </svg>
                    )
                  },
                  { 
                    label: 'Wants', 
                    ruleValue: bestRule.wants, 
                    userValue: Math.round(wantsPercentage),
                    color: 'blue',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  },
                  { 
                    label: 'Savings', 
                    ruleValue: bestRule.savings, 
                    userValue: Math.round(savingsPercentage),
                    color: 'emerald',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )
                  }
                ].map((item, index) => {
                  const difference = Math.abs(item.ruleValue - item.userValue);
                  const isClose = difference <= 5;
                  
                  return (
                    <div key={item.label} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50 shadow-sm">
                      <div className={`w-10 h-10 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                        <div className={`text-${item.color}-600 dark:text-${item.color}-400`}>
                          {item.icon}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="mb-2">
                          <div className={`text-2xl font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                            {item.ruleValue}%
                          </div>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            {item.label}
                          </div>
                        </div>
                        
                        <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                          isClose 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
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
                          You: {item.userValue}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
          />



          {/* Next Step Recommendation */}
          {(() => {
            const isGoldStandard = bestRule.name === "50:30:20";
            const hasOverspending = totalExpenses > income;
            const nextRuleName = getNextRecommendation(bestRule.name);
            const nextRule = budgetRules.find(rule => rule.name === nextRuleName);
            
            if (hasOverspending) {
              return (
                <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-red-100 dark:from-red-900/30 dark:via-orange-900/20 dark:to-red-800/30 border-2 border-red-200 dark:border-red-700 rounded-xl p-6 shadow-lg">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 dark:bg-red-700/20 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/40 dark:bg-orange-700/20 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                            {dict.budgetCalculator?.results?.priorityAction || "Priority Action"}
                          </h3>
                          <span className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs font-semibold rounded-full">
                            URGENT
                          </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Your spending exceeds income - immediate action required
                        </p>
                      </div>
                    </div>

                    {/* Target Focus with Current as Context */}
                    <div className="mb-4">
                      {/* Primary Target Card - Highlighted */}
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border-2 border-orange-300 dark:border-orange-600 shadow-lg mb-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                      {/* Current Status - Secondary
                      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-red-200 dark:border-red-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Spending</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Above sustainable level</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              {Math.round((totalExpenses / income) * 100)}%
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
                              Overspending
                            </div>
                          </div>
                        </div>
                      </div> */}
                    </div>
                    
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50">
                      <p className="text-red-700 dark:text-red-300 font-medium mb-2">
                        Immediate Steps Required:
                      </p>
                      <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
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
            
            if (isGoldStandard) {
              return (
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700 rounded-xl shadow-lg">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 dark:bg-green-700/20 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/40 dark:bg-emerald-700/20 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
                            🎉 Perfect! You're Following the Gold Standard!
                          </h3>
                          <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                            50:30:20 Rule
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Excellent financial balance achieved
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[
                        { 
                          label: 'Needs', 
                          value: 50,
                          current: Math.round(needsPercentage),
                          color: 'red',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                          )
                        },
                        { 
                          label: 'Wants', 
                          value: 30,
                          current: Math.round(wantsPercentage),
                          color: 'blue',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                            </svg>
                          )
                        },
                        { 
                          label: 'Savings', 
                          value: 20,
                          current: Math.round(savingsPercentage),
                          color: 'emerald',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )
                        }
                      ].map((item, index) => {
                        const needsIncrease = item.current < item.value;
                        const needsDecrease = item.current > item.value;
                        const isOnTarget = item.current === item.value;
                        
                        return (
                          <div key={item.label} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50 shadow-sm">
                            <div className={`w-10 h-10 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                              <div className={`text-${item.color}-600 dark:text-${item.color}-400`}>
                                {item.icon}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="mb-2">
                                <div className={`text-2xl font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                                  {item.value}%
                                </div>
                                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                  Target {item.label}
                                </div>
                              </div>
                              
                              <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium ${
                                isOnTarget 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : (item.label === 'Savings' && needsIncrease) || ((item.label === 'Needs' || item.label === 'Wants') && needsDecrease)
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              }`}>
                                {(() => {
                                  const changeNeeded = Math.abs(item.value - item.current);
                                  if (isOnTarget) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Perfect!
                                      </>
                                    );
                                  } else if (item.label === 'Savings' && needsIncrease) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                        +{changeNeeded}%
                                      </>
                                    );
                                  } else if ((item.label === 'Needs' || item.label === 'Wants') && needsDecrease) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                        </svg>
                                        -{changeNeeded}%
                                      </>
                                    );
                                  } else if (item.label === 'Savings' && needsDecrease) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Maintain
                                      </>
                                    );
                                  } else {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Keep
                                      </>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50">
                      <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                        💡 To achieve the perfect 50:30:20 balance:
                      </p>
                      <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                        {[
                          { 
                            label: 'Needs', 
                            current: Math.round(needsPercentage), 
                            target: 50 
                          },
                          { 
                            label: 'Wants', 
                            current: Math.round(wantsPercentage), 
                            target: 30 
                          },
                          { 
                            label: 'Savings', 
                            current: Math.round(savingsPercentage), 
                            target: 20 
                          }
                        ].map((item, index) => {
                          const changeNeeded = item.target - item.current;
                          if (changeNeeded === 0) {
                            return (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                Keep {item.label.toLowerCase()} at {item.target}% - you're perfectly on target!
                              </li>
                            );
                          } else if (item.label === 'Needs' && changeNeeded < 0) {
                            return (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                Reduce essential expenses by {Math.abs(changeNeeded)}% to reach {item.target}%
                              </li>
                            );
                          } else if (item.label === 'Wants' && changeNeeded < 0) {
                            return (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                Reduce discretionary spending by {Math.abs(changeNeeded)}% to reach {item.target}%
                              </li>
                            );
                          } else if (item.label === 'Savings' && changeNeeded > 0) {
                            return (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                Increase savings by {changeNeeded}% to reach {item.target}%
                              </li>
                            );
                          } else if (item.label === 'Savings' && changeNeeded < 0) {
                            return (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                Maintain current savings level at {item.current}% (above target!)
                              </li>
                            );
                          } else {
                            return (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                Maintain current {item.label.toLowerCase()} at {item.current}%
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Show next rule recommendation
            return (
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-lg">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 dark:bg-blue-700/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/40 dark:bg-indigo-700/20 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                          {dict.budgetCalculator?.results?.nextStep || "Next Step"}
                        </h3>
                        <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                          {nextRuleName}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your journey to better financial balance
                      </p>
                    </div>
                  </div>
                  
                  {nextRule && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[
                        { 
                          label: 'Needs', 
                          value: nextRule.needs,
                          current: Math.round(needsPercentage),
                          color: 'red',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                          )
                        },
                        { 
                          label: 'Wants', 
                          value: nextRule.wants,
                          current: Math.round(wantsPercentage),
                          color: 'blue',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                            </svg>
                          )
                        },
                        { 
                          label: 'Savings', 
                          value: nextRule.savings,
                          current: Math.round(savingsPercentage),
                          color: 'emerald',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )
                        }
                      ].map((item, index) => {
                        const needsIncrease = item.current < item.value;
                        const needsDecrease = item.current > item.value;
                        const isOnTarget = item.current === item.value;
                        
                        return (
                          <div key={item.label} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50 shadow-sm">
                            <div className={`w-10 h-10 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                              <div className={`text-${item.color}-600 dark:text-${item.color}-400`}>
                                {item.icon}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="mb-2">
                                <div className={`text-2xl font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                                  {item.value}%
                                </div>
                                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                  Target {item.label}
                                </div>
                              </div>
                              
                              <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium ${
                                isOnTarget 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : (item.label === 'Savings' && needsIncrease) || ((item.label === 'Needs' || item.label === 'Wants') && needsDecrease)
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              }`}>
                                {(() => {
                                  const changeNeeded = Math.abs(item.value - item.current);
                                  if (isOnTarget) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Keep Same
                                      </>
                                    );
                                  } else if (item.label === 'Savings' && needsIncrease) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                        +{changeNeeded}%
                                      </>
                                    );
                                  } else if ((item.label === 'Needs' || item.label === 'Wants') && needsDecrease) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                        </svg>
                                        -{changeNeeded}%
                                      </>
                                    );
                                  } else if (item.label === 'Savings' && needsDecrease) {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Maintain
                                      </>
                                    );
                                  } else {
                                    return (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Keep
                                      </>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50">
                    <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
                      {`To achieve the ${nextRuleName} rule:`}
                    </p>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      {nextRule && [
                        { 
                          label: 'Needs', 
                          current: Math.round(needsPercentage), 
                          target: nextRule.needs 
                        },
                        { 
                          label: 'Wants', 
                          current: Math.round(wantsPercentage), 
                          target: nextRule.wants 
                        },
                        { 
                          label: 'Savings', 
                          current: Math.round(savingsPercentage), 
                          target: nextRule.savings 
                        }
                      ].map((item, index) => {
                        const changeNeeded = item.target - item.current;
                        if (changeNeeded === 0) {
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              Keep {item.label.toLowerCase()} at {item.target}% - you're on target!
                            </li>
                          );
                        } else if (item.label === 'Needs' && changeNeeded < 0) {
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              Reduce essential expenses by {Math.abs(changeNeeded)}% (from {item.current}% to {item.target}%)
                            </li>
                          );
                        } else if (item.label === 'Wants' && changeNeeded < 0) {
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              Reduce discretionary spending by {Math.abs(changeNeeded)}% (from {item.current}% to {item.target}%)
                            </li>
                          );
                        } else if (item.label === 'Savings' && changeNeeded > 0) {
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              Increase savings by {changeNeeded}% (from {item.current}% to {item.target}%)
                            </li>
                          );
                        } else if (item.label === 'Savings' && changeNeeded < 0) {
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              Maintain excellent savings rate at {item.current}% (above {item.target}% target!)
                            </li>
                          );
                        } else if (item.label === 'Needs' && changeNeeded > 0) {
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              Maintain current essential expenses at {item.current}% (below {item.target}% target!)
                            </li>
                          );
                        } else if (item.label === 'Wants' && changeNeeded > 0) {
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              Consider maintaining discretionary spending at {item.current}% (room for {changeNeeded}% more if desired)
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
          })()}

          {/* All Rules Comparison 
          <div className="card">
            <h3 className="font-semibold mb-4">{dict.budgetCalculator?.results?.allRules || "All Budgeting Rules"}</h3>
            <div className="space-y-3">
              {budgetRules.map((rule) => (
                <div 
                  key={rule.name} 
                  className={`p-3 rounded-lg border ${
                    rule.name === bestRule.name 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{rule.name}</span>
                    {rule.name === bestRule.name && (
                      <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Best Match
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {rule.needs}% needs • {rule.wants}% wants • {rule.savings}% savings
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {dict.budgetCalculator?.buttons?.startOver || "Start Over"}
              </button>
              {flowType === 'detailed' && (
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  {dict.budgetCalculator?.buttons?.adjustSavings || "Adjust Savings"}
                </button>
              )}
              {flowType === 'simple' && (
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
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
              className="w-full py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
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
  }

  return null;
}