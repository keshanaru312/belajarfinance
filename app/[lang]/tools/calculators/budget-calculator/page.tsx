/**
 * Budget Calculator - Main Application Component
 * 
 * A comprehensive budget planning tool that helps users understand and optimize their spending.
 * 
 * Features:
 * - Two flow types: Simple (quick totals) or Detailed (item-by-item tracking)
 * - Multi-step wizard interface for easy data entry
 * - Real-time budget analysis against popular budgeting rules (50:30:20, 70:20:10, 80:20:0)
 * - Interactive visualizations with drill-down capabilities
 * - Personalized recommendations based on spending patterns
 * - Persistent state across sessions
 * - Multi-language support (EN/BM)
 * 
 * This main component handles:
 * - State management and routing between steps
 * - Data persistence across calculator sessions
 * - Global state sharing with other calculators
 * - Step orchestration and navigation logic
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { usePersistentValue } from "@/hooks/usePersistentValue";
import {
  Step1IncomeInput,
  Step2SimpleFlow,
  Step2NeedsFlow,
  Step3WantsFlow,
  Step4SavingsFlow,
  Step5Results
} from "./components";
import { useExpenseManagement, useBudgetCalculations } from "./hooks";
import { defaultNeeds } from "./constants";
import type { ExpenseItem } from "./types";

export const runtime = "edge";

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

  // Use custom hooks for calculations
  const {
    totalNeeds,
    totalWants,
    totalExpenses,
    remainingAfterExpenses,
    maxAllowedExpenses,
    isExpensesTooHigh,
    isExpensesSameOrExceedIncome,
    totalSavings,
    emergencyFundAmount,
    otherSavingsAmount
  } = useBudgetCalculations(
    income,
    flowType,
    needsExpenses,
    wantsExpenses,
    simpleTotalNeeds,
    simpleTotalWants,
    simpleTotalSavings,
    emergencyFundPercentage,
    otherSavingsPercentage
  );

  // Use expense management hook
  const { addExpenseItem, updateExpenseItem, deleteExpenseItem } = useExpenseManagement(
    needsExpenses,
    wantsExpenses,
    setNeedsExpenses,
    setWantsExpenses
  );

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

  // Step 1: Income Input & Flow Selection
  if (step === 1) {
    return (
      <Step1IncomeInput
        income={income}
        setIncome={setIncome}
        flowType={flowType}
        setFlowType={setFlowType}
        setStep={setStep}
        dict={dict}
      />
    );
  }

  // Step 2: Branch between Simple or Detailed flow
  if (step === 2) {
    if (flowType === 'simple') {
      return (
        <Step2SimpleFlow
          income={income}
          simpleTotalNeeds={simpleTotalNeeds}
          setSimpleTotalNeeds={setSimpleTotalNeeds}
          simpleTotalWants={simpleTotalWants}
          setSimpleTotalWants={setSimpleTotalWants}
          simpleTotalSavings={simpleTotalSavings}
          setSimpleTotalSavings={setSimpleTotalSavings}
          isExpensesTooHigh={isExpensesTooHigh}
          isExpensesSameOrExceedIncome={isExpensesSameOrExceedIncome}
          setStep={setStep}
          dict={dict}
        />
      );
    }

    // Detailed flow - Needs expenses
    return (
      <Step2NeedsFlow
        needsExpenses={needsExpenses}
        income={income}
        totalNeeds={totalNeeds}
        totalExpenses={totalExpenses}
        maxAllowedExpenses={maxAllowedExpenses}
        isExpensesTooHigh={isExpensesTooHigh}
        setStep={setStep}
        addExpenseItem={addExpenseItem}
        updateExpenseItem={updateExpenseItem}
        deleteExpenseItem={deleteExpenseItem}
        dict={dict}
      />
    );
  }

  // Step 3: Wants expenses (Detailed flow only)
  if (step === 3 && flowType === 'detailed') {
    return (
      <Step3WantsFlow
        wantsExpenses={wantsExpenses}
        income={income}
        totalNeeds={totalNeeds}
        totalExpenses={totalExpenses}
        maxAllowedExpenses={maxAllowedExpenses}
        isExpensesTooHigh={isExpensesTooHigh}
        setStep={setStep}
        addExpenseItem={addExpenseItem}
        updateExpenseItem={updateExpenseItem}
        deleteExpenseItem={deleteExpenseItem}
        dict={dict}
      />
    );
  }

  // Step 4: Savings allocation (Detailed flow only)
  if (step === 4 && flowType === 'detailed') {
    return (
      <Step4SavingsFlow
        income={income}
        totalExpenses={totalExpenses}
        remainingAfterExpenses={remainingAfterExpenses}
        maxAllowedExpenses={maxAllowedExpenses}
        emergencyFundPercentage={emergencyFundPercentage}
        setEmergencyFundPercentage={setEmergencyFundPercentage}
        otherSavingsPercentage={otherSavingsPercentage}
        setOtherSavingsPercentage={setOtherSavingsPercentage}
        setStep={setStep}
        dict={dict}
      />
    );
  }

  // Step 5: Results
  if (step === 5) {
    // Results Step - Comprehensive budget analysis and recommendations
    return (
      <Step5Results
        income={income}
        totalNeeds={totalNeeds}
        totalWants={totalWants}
        totalSavings={totalSavings}
        totalExpenses={totalExpenses}
        needsExpenses={needsExpenses}
        wantsExpenses={wantsExpenses}
        emergencyFundAmount={emergencyFundAmount}
        otherSavingsAmount={otherSavingsAmount}
        flowType={flowType}
        setFlowType={setFlowType}
        setStep={setStep}
        dict={dict}
      />
    );
  }

  return null;
}