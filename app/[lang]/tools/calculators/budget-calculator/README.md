# Budget Calculator - Modular Structure

## Overview

The budget calculator has been refactored to improve code organization and maintainability by extracting business logic, utilities, and components into separate modules.

## Directory Structure

```
budget-calculator/
├── components/
│   ├── index.ts                    # Component exports
│   ├── InteractivePieChart.tsx     # Interactive pie chart with drill-down
│   └── ProgressBar.tsx              # Progress bar component
├── hooks/
│   ├── index.ts                     # Hook exports
│   ├── useBudgetCalculations.ts    # Budget calculation logic
│   └── useExpenseManagement.ts     # Expense CRUD operations
├── utils/
│   ├── index.ts                     # Utility exports
│   └── budgetUtils.ts               # Currency formatting, rule finding
├── constants.ts                     # Budget rules and defaults
├── types.ts                          # TypeScript interfaces
└── page.tsx                         # Main calculator component
```

## Module Descriptions

### Types (`types.ts`)

- `ExpenseItem`: Individual expense structure
- `BudgetRule`: Budget rule definition (e.g., 50:30:20)
- `FlowType`: 'detailed' or 'simple' flow type
- `InteractivePieChartProps`: Props for pie chart component
- `PieChartData`: Data structure for pie chart segments

### Constants (`constants.ts`)

- `budgetRules`: Array of predefined budget rules
- `defaultNeeds`: Default essential expenses template

### Utilities (`utils/budgetUtils.ts`)

- `formatCurrency(amount)`: Formats numbers as MYR currency
- `findBestRule(income, totalNeeds, totalWants, totalSavings)`: Finds the closest matching budget rule
- `getNextRecommendation(currentRule, totalExpenses, income, dict)`: Generates budget recommendations

### Hooks

#### `useBudgetCalculations`

Calculates all budget-related metrics:

- Total needs, wants, and expenses
- Remaining after expenses
- Validation flags (expenses too high, etc.)
- Savings calculations

#### `useExpenseManagement`

Manages expense CRUD operations:

- `addExpenseItem(type)`: Adds new expense
- `updateExpenseItem(type, id, field, value)`: Updates expense
- `deleteExpenseItem(type, id)`: Deletes expense

### Components

#### `InteractivePieChart`

Feature-rich pie chart component with:

- Interactive hover effects
- Drill-down into expense categories
- Detailed breakdown views
- Smooth animations
- Flow type switching prompts

#### `ProgressBar`

Visual progress indicator showing:

- Budget usage percentage
- Color-coded status (green/yellow/red)
- Responsive to budget health

## Usage Example

```typescript
import { Inter activePieChart, ProgressBar } from "./components";
import { useBudgetCalculations, useExpenseManagement } from "./hooks";
import { formatCurrency, findBestRule } from "./utils";
import { budgetRules, defaultNeeds } from "./constants";

// In your component
const {
  totalNeeds,
  totalWants,
  totalExpenses,
  // ... other calculations
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

const { addExpenseItem, updateExpenseItem, deleteExpenseItem } =
  useExpenseManagement(
    needsExpenses,
    wantsExpenses,
    setNeedsExpenses,
    setWantsExpenses
  );
```

## Benefits of Modular Structure

1. **Separation of Concerns**: Business logic separated from UI logic
2. **Reusability**: Hooks and utils can be reused across components
3. **Testability**: Individual modules can be tested in isolation
4. **Maintainability**: Easier to locate and update specific functionality
5. **Type Safety**: Centralized type definitions ensure consistency
6. **Performance**: Memoized calculations prevent unnecessary re-renders

## Future Improvements

1. Create separate step components (IncomeStep, NeedsStep, WantsStep, etc.)
2. Extract results section into separate components
3. Add unit tests for hooks and utilities
4. Create storybook documentation for components
5. Add error boundary components
6. Implement proper error handling and validation schemas

## Migration Notes

The main `page.tsx` still contains the rendering logic for all steps. This is intentional to maintain the existing functionality while extracting reusable logic. Further refactoring could split the steps into separate components, but this adds complexity to state management.

## Development

To use these modules in the main component:

```typescript
import { InteractivePieChart } from "./components";
import { useBudgetCalculations } from "./hooks";
import { formatCurrency } from "./utils";
```

All exports are available through index files for clean imports.
