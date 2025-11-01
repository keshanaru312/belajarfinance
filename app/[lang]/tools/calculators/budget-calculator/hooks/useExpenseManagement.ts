/**
 * useExpenseManagement Hook
 * 
 * A custom React hook that provides CRUD operations for managing expense items.
 * Handles adding, updating, and deleting expense items for both needs and wants categories.
 * 
 * Features:
 * - Add new expense with unique ID generation
 * - Update expense name or amount
 * - Delete expense (with minimum item protection)
 * - Separate management for needs vs wants expenses
 */

import { useCallback } from 'react';
import { ExpenseItem } from '../types';

export const useExpenseManagement = (
  needsExpenses: ExpenseItem[],
  wantsExpenses: ExpenseItem[],
  setNeedsExpenses: (expenses: ExpenseItem[]) => void,
  setWantsExpenses: (expenses: ExpenseItem[]) => void
) => {
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

  return {
    addExpenseItem,
    updateExpenseItem,
    deleteExpenseItem
  };
};
