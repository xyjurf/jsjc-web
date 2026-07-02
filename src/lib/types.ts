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

export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  plan_id: string | null;
  plan_name: string;
  amount: number;
  status: "pending" | "paid" | "cancelled";
  pay_method: string;
  created_at: string;
  paid_at: string | null;
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
  created_at: string;
}
