/**
 * TypeScript types for PriceExpose database models (PostgreSQL)
 */

export interface Provider {
  id: number;
  name: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DealClick {
  id: string;
  provider_id: number;
  selected_provider_id: number;
  selected_provider_price: number;
  property_id: string;
  travel_settings: string;
  booking_price: number;
  currency: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface PriceAlert {
  id: string;
  email: string;
  favorite_route: string;
  consent_given: boolean;
  is_active: boolean;
  unsubscribe_token?: string;
  subscribed_at: Date;
  last_alert_sent?: Date;
  alert_count: number;
  created_at: Date;
  updated_at: Date;
}
