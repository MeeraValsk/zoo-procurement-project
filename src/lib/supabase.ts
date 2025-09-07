import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserRole = 'staff' | 'supplier' | 'invoice_team' | 'admin';
export type OrderStatus = 'pending' | 'approved' | 'accepted' | 'in_transit' | 'delivered' | 'rejected';
export type InvoiceStatus = 'pending' | 'under_review' | 'verified' | 'paid' | 'discrepancy' | 'rejected';
export type FeedType = 'hay' | 'silage' | 'green_forages' | 'straw' | 'pasture' | 'fish_meal' | 'meat_and_bone_meal' | 'groundnut_cake' | 'soybean_meal';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  total_orders: number;
  total_revenue: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  staff_id: string;
  supplier_id: string;
  feed_type: FeedType;
  quantity: number;
  price_per_tonne: number;
  total_amount: number;
  reason: string;
  status: OrderStatus;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  staff?: Profile;
  supplier?: Supplier;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  supplier_id: string;
  amount: number;
  invoice_date: string;
  due_date?: string;
  status: InvoiceStatus;
  verified_by?: string;
  verified_at?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  order?: Order;
  supplier?: Supplier;
  verifier?: Profile;
}

export interface FeedPricing {
  id: string;
  supplier_id?: string;
  feed_type: FeedType;
  price_per_tonne: number;
  minimum_quantity: number;
  is_available: boolean;
  effective_date: string;
  created_at: string;
  updated_at: string;
  // Relations
  supplier?: Supplier;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  reference_id?: string;
  created_at: string;
}