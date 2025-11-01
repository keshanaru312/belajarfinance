/**
 * Alert & Validation Styles
 * 
 * Styling for validation messages, alerts, and informational banners.
 * Used throughout the budget calculator to provide user feedback.
 */

export const alertStyles = {
  // Critical error/overspending
  error: {
    container: "p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
    title: "font-medium mb-1 text-red-800 dark:text-red-200",
    message: "text-xs text-red-800 dark:text-red-200",
    banner: "mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200",
  },

  // Warning (yellow/orange)
  warning: {
    container: "p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",
    title: "font-medium mb-1 text-yellow-800 dark:text-yellow-200",
    message: "text-xs text-yellow-800 dark:text-yellow-200",
    banner: "mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200",
    card: "p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg",
  },

  // Info/Success (blue/green)
  info: {
    container: "p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20",
    title: "font-medium mb-1 text-blue-800 dark:text-blue-200",
    message: "text-xs text-blue-800 dark:text-blue-200",
  },

  success: {
    container: "p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
    title: "font-medium mb-1 text-green-800 dark:text-green-200",
    message: "text-xs text-green-800 dark:text-green-200",
  },
};

/**
 * Budget status indicators
 * Different color schemes based on spending level
 */
export const statusStyles = {
  // Overspending (red)
  overspending: {
    container: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
    text: "text-red-600 dark:text-red-400",
    value: "font-medium text-red-600",
  },

  // At or exceeding income (yellow)
  atLimit: {
    container: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-600 dark:text-yellow-400",
    value: "font-medium text-yellow-600",
  },

  // Under budget (green)
  healthy: {
    container: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-green-600 dark:text-green-400",
    value: "font-medium text-green-600",
  },

  // Neutral (gray)
  neutral: {
    container: "bg-gray-50 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    value: "font-medium",
  },
};
