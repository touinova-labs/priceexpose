/**
 * Central exports for all database helpers
 * 
 * Usage:
 * import { logDealClick, createPriceAlert, getAllProviders } from '@/deal-finder/helpers';
 */

// Deal Click Helpers
export {
  logDealClick,
} from './dealClicks';

// Provider Helpers
export {
  getAllProviders,
  getOrCreateProvider,
} from './providers';

// Price Alert Helpers
export {
  createPriceAlert,
  getActiveAlerts,
  isEmailSubscribed,
  unsubscribeByToken,
  updateLastAlertSent,
  getAlertsForNotification,
} from './priceAlerts';
