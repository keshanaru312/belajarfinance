/**
 * Button Styles
 * 
 * Centralized button styling for consistent UX across the budget calculator.
 * Includes primary actions, secondary actions, and various states.
 */

export const buttonStyles = {
  // Primary action button (blue)
  primary: "w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition",
  primaryDisabled: "w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed transition",
  
  // Secondary/Back button (outlined)
  secondary: "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition",
  
  // Full width primary
  fullPrimary: "flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition",
  
  // Conditional styling for overspending
  conditional: (isExpensesTooHigh: boolean) => 
    `flex-1 px-4 py-2 rounded-md transition ${
      isExpensesTooHigh
        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        : 'bg-blue-500 text-white hover:bg-blue-600'
    }`,
  
  // Add item button (dashed border)
  addItem: "w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition flex items-center justify-center gap-2",
  
  // Delete button (red, icon only)
  delete: "text-red-500 hover:text-red-700 dark:hover:text-red-400 transition",
  
  // Mode switch button
  modeSwitch: "w-full py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition",
};

/**
 * Button container/group styles
 */
export const buttonGroupStyles = {
  horizontal: "flex gap-3",
  vertical: "space-y-3",
};
