"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { usePersistentValue } from "@/hooks/usePersistentValue";

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

        <div className="space-y-6">
          {/* Your Current Budget */}
          <div className="card">
            <h3 className="font-semibold mb-4">{dict.budgetCalculator?.results?.yourBudget || "Your Current Budget"}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Needs:</span>
                <span>{needsPercentage.toFixed(1)}% ({formatCurrency(totalNeeds)})</span>
              </div>
              <div className="flex justify-between">
                <span>Wants:</span>
                <span>{wantsPercentage.toFixed(1)}% ({formatCurrency(totalWants)})</span>
              </div>
              <div className="flex justify-between">
                <span>Savings:</span>
                <span>{savingsPercentage.toFixed(1)}% ({formatCurrency(totalSavings)})</span>
              </div>
            </div>
          </div>

          {/* Best Match
          <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">
              {dict.budgetCalculator?.results?.bestMatch || "Best Match"}: {bestRule.name}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              {dict.budgetCalculator?.results?.bestMatchDesc || "This budgeting rule is closest to your current spending pattern."}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Needs: {bestRule.needs}%</span>
                <span>Wants: {bestRule.wants}%</span>
                <span>Savings: {bestRule.savings}%</span>
              </div>
            </div>
          </div> */}

          {/* Recommendation */}
          <div className={`card ${
            totalExpenses > income 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : nextRecommendation.includes("Well done") || nextRecommendation.includes("Tahniah")
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              totalExpenses > income 
                ? 'text-red-800 dark:text-red-200'
                : nextRecommendation.includes("Well done") || nextRecommendation.includes("Tahniah")
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-blue-800 dark:text-blue-200'
            }`}>
              {totalExpenses > income 
                ? (dict.budgetCalculator?.results?.priorityAction || "Priority Action")
                : (dict.budgetCalculator?.results?.nextStep || "Next Step")
              }
            </h3>
            <p className={`text-sm ${
              totalExpenses > income 
                ? 'text-red-700 dark:text-red-300'
                : nextRecommendation.includes("Well done") || nextRecommendation.includes("Tahniah")
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-blue-700 dark:text-blue-300'
            }`}>
              {totalExpenses > income 
                ? nextRecommendation
                : nextRecommendation.includes("Well done") || nextRecommendation.includes("Tahniah")
                  ? nextRecommendation
                  : `${dict.budgetCalculator?.results?.aspireFor || "Consider working towards"} ${nextRecommendation} ${dict.budgetCalculator?.results?.forBetter || "for better financial balance"}.`
              }
            </p>
          </div>

          {/* All Rules Comparison */}
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
          </div>

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