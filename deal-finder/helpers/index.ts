/**
 * Central exports for all database helpers
 * 
 * Usage:
 * import { logDealClick, createPriceAlert, getAllProviders } from '@/deal-finder/helpers';
 */

// Deal Click Helpers
export {
  logDealClick,
  getAllProviders,
} from './dealClicks';

// Price Alert Helpers
export {
  createPriceAlert,
  getActiveAlerts,
  isEmailSubscribed,
  unsubscribeByToken,
  updateLastAlertSent,
  getAlertsForNotification,
} from './priceAlerts';
