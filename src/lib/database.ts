import { supabase, type Order, type Supplier, type Invoice, type FeedPricing, type Notification, type FeedType, type OrderStatus, type InvoiceStatus } from './supabase';

export class DatabaseService {
  // Orders
  static async createOrder(orderData: {
    supplier_id: string;
    feed_type: FeedType;
    quantity: number;
    price_per_tonne: number;
    reason: string;
    delivery_date?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const total_amount = orderData.quantity * orderData.price_per_tonne;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        staff_id: user.id,
        total_amount,
        ...orderData
      })
      .select(`
        *,
        staff:profiles(*),
        supplier:suppliers(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async getOrders(filters?: {
    staff_id?: string;
    supplier_id?: string;
    status?: OrderStatus;
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        staff:profiles(*),
        supplier:suppliers(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.staff_id) query = query.eq('staff_id', filters.staff_id);
    if (filters?.supplier_id) query = query.eq('supplier_id', filters.supplier_id);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Suppliers
  static async getSuppliers(activeOnly = true) {
    let query = supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createSupplier(supplierData: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
  }) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSupplier(id: string, updates: Partial<Supplier>) {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Feed Pricing
  static async getFeedPricing(supplierId?: string) {
    let query = supabase
      .from('feed_pricing')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('is_available', true)
      .order('feed_type');

    if (supplierId) query = query.eq('supplier_id', supplierId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async updateFeedPricing(id: string, updates: {
    price_per_tonne?: number;
    minimum_quantity?: number;
    is_available?: boolean;
  }) {
    const { data, error } = await supabase
      .from('feed_pricing')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Invoices
  static async createInvoice(invoiceData: {
    order_id: string;
    amount: number;
    invoice_date: string;
    due_date?: string;
    notes?: string;
  }) {
    // Get order details to extract supplier_id
    const { data: order } = await supabase
      .from('orders')
      .select('supplier_id')
      .eq('id', invoiceData.order_id)
      .single();

    if (!order) throw new Error('Order not found');

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        supplier_id: order.supplier_id
      })
      .select(`
        *,
        order:orders(*),
        supplier:suppliers(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async getInvoices(filters?: {
    supplier_id?: string;
    status?: InvoiceStatus;
  }) {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        order:orders(*),
        supplier:suppliers(*),
        verifier:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.supplier_id) query = query.eq('supplier_id', filters.supplier_id);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, notes?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const updates: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (notes) updates.notes = notes;
    
    if (status === 'verified' && user) {
      updates.verified_by = user.id;
      updates.verified_at = new Date().toISOString();
    }
    
    if (status === 'paid') {
      updates.payment_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Notifications
  static async createNotification(notificationData: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    reference_id?: string;
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  static async getOrderAnalytics(startDate?: string, endDate?: string) {
    let query = supabase
      .from('orders')
      .select('*');

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;
    if (error) throw error;

    // Process analytics data
    const totalOrders = data.length;
    const totalRevenue = data.reduce((sum, order) => sum + order.total_amount, 0);
    const statusCounts = data.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const feedTypeCounts = data.reduce((acc, order) => {
      acc[order.feed_type] = (acc[order.feed_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue,
      statusCounts,
      feedTypeCounts,
      orders: data
    };
  }
}