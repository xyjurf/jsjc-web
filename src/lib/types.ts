export type PlanCategory = "cycle" | "traffic";

export interface Plan {
  id: string;
  name: string;
  category: PlanCategory;
  period: string;
  price: number;
  traffic_gb: number;
  is_unlimited_period: boolean;
  speed_mbps: number;
  device_limit: number;
  features: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilling"
  | "completed"
  | "failed"
  | "cancelled";

export interface DeliveryData {
  subscription_links?: string[];
  subscription_keys?: string[];
  config_texts?: string[];
  remark?: string;
}

export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  plan_id: string | null;
  plan_name: string;
  amount: number;
  status: OrderStatus;
  pay_method: string;
  created_at: string;
  paid_at: string | null;
  upstream_order_id: string | null;
  delivery_data: DeliveryData | null;
  fulfillment_attempts: number;
  fulfillment_error: string | null;
  fulfilled_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  order_id: string | null;
  plan_name: string;
  traffic_gb: number;
  traffic_used_gb: number;
  status: "active" | "expired";
  starts_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  balance: number;
  role: "user" | "admin";
  created_at: string;
}

export interface PlanMapping {
  id: string;
  local_plan_id: string;
  upstream_plan_name: string;
  upstream_plan_url: string | null;
  upstream_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: "order" | "system" | "promo";
  is_read: boolean;
  created_at: string;
}
