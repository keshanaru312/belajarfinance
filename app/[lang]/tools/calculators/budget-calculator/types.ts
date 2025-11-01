/**
 * Type Definitions for Budget Calculator
 * 
 * This file contains all TypeScript interfaces and type definitions used throughout
 * the budget calculator application. These types ensure type safety and provide
 * clear contracts for data structures used across components.
 */

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface BudgetRule {
  name: string;
  needs: number;
  wants: number;
  savings: number;
}

export type FlowType = 'detailed' | 'simple';

export interface InteractivePieChartProps {
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
  flowType: FlowType;
  setFlowType: (type: FlowType) => void;
  setStep: (step: number) => void;
  dict: any;
  formatCurrency: (amount: number) => string;
}

export interface PieChartData {
  name: string;
  value: number;
  amount: number;
  color: string;
  [key: string]: string | number;
}
