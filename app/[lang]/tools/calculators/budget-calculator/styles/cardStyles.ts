/**
 * Card Styles
 * 
 * Centralized card styling classes for the budget calculator.
 * Provides consistent visual design across all components with support for dark mode.
 * 
 * Card Types:
 * - Success (Green): Positive outcomes, best matches, achievements
 * - Warning (Orange/Red): Alerts, overspending, urgent actions
 * - Info (Blue): Recommendations, next steps, guidance
 * - Neutral (Gray): Standard content containers
 */

/**
 * Gradient card with decorative background elements
 * Used for major result/recommendation cards
 */
export const cardStyles = {
  // Success/Achievement cards (Green theme)
  success: {
    container: "relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700 rounded-xl p-6 shadow-lg",
    decorTop: "absolute top-0 right-0 w-32 h-32 bg-green-200/30 dark:bg-green-700/20 rounded-full -translate-y-16 translate-x-16",
    decorBottom: "absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/40 dark:bg-emerald-700/20 rounded-full translate-y-12 -translate-x-12",
    icon: "w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md",
    iconColor: "text-white",
    title: "text-lg font-bold text-green-900 dark:text-green-100",
    description: "text-sm text-green-700 dark:text-green-300",
    badge: "px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full",
    content: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50",
  },

  // Warning/Urgent cards (Red/Orange theme)
  warning: {
    container: "relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-red-100 dark:from-red-900/30 dark:via-orange-900/20 dark:to-red-800/30 border-2 border-red-200 dark:border-red-700 rounded-xl p-6 shadow-lg",
    decorTop: "absolute top-0 right-0 w-32 h-32 bg-red-200/30 dark:bg-red-700/20 rounded-full -translate-y-16 translate-x-16",
    decorBottom: "absolute bottom-0 left-0 w-24 h-24 bg-orange-200/40 dark:bg-orange-700/20 rounded-full translate-y-12 -translate-x-12",
    icon: "w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md",
    iconColor: "text-white",
    title: "text-lg font-bold text-red-900 dark:text-red-100",
    description: "text-sm text-red-700 dark:text-red-300",
    badge: "px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs font-semibold rounded-full",
    content: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50",
    urgentCard: "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border-2 border-orange-300 dark:border-orange-600 shadow-lg",
    urgentIcon: "w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md",
  },

  // Info/Guidance cards (Blue theme)
  info: {
    container: "relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-lg",
    decorTop: "absolute top-0 right-0 w-32 h-32 bg-blue-200/30 dark:bg-blue-700/20 rounded-full -translate-y-16 translate-x-16",
    decorBottom: "absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/40 dark:bg-indigo-700/20 rounded-full translate-y-12 -translate-x-12",
    icon: "w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md",
    iconColor: "text-white",
    title: "text-lg font-bold text-blue-900 dark:text-blue-100",
    description: "text-sm text-blue-700 dark:text-blue-300",
    badge: "px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full",
    content: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-gray-700/50",
  },

  // Neutral/Standard cards
  neutral: {
    container: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md",
    content: "bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4",
  },
};

/**
 * Category-specific icon backgrounds
 * Used for needs/wants/savings comparisons
 */
export const categoryStyles = {
  needs: {
    iconBg: "w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center",
    iconColor: "text-red-600 dark:text-red-400",
    value: "text-2xl font-bold text-red-600 dark:text-red-400",
    label: "text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide",
  },
  wants: {
    iconBg: "w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center",
    iconColor: "text-blue-600 dark:text-blue-400",
    value: "text-2xl font-bold text-blue-600 dark:text-blue-400",
    label: "text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide",
  },
  savings: {
    iconBg: "w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    value: "text-2xl font-bold text-emerald-600 dark:text-emerald-400",
    label: "text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide",
  },
};

/**
 * Status badge styles
 * Used for on-target, needs-change indicators
 */
export const badgeStyles = {
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};
