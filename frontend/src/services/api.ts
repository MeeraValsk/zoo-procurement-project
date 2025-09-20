const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('zoo-procure-token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: { user: any; token: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      this.token = response.data.token;
      localStorage.setItem('zoo-procure-token', response.data.token);
    }

    return response;
  }

  async register(userData: any) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: { user: any; token: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success) {
      this.token = response.data.token;
      localStorage.setItem('zoo-procure-token', response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request<{
      success: boolean;
      data: { user: any };
    }>('/auth/profile');
  }

  async updateProfile(userData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { user: any };
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Order endpoints
  async createOrder(orderData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { order: any };
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Update order method
  async updateOrder(orderId: string, orderData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { order: any };
    }>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  // Delete order method
  async deleteOrder(orderId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async getOrders() {
    return this.request<{
      success: boolean;
      data: { orders: any[] };
    }>('/orders');
  }

  async getMyOrders() {
    return this.request<{
      success: boolean;
      data: { orders: any[] };
    }>('/orders/my-orders');
  }

  async getSupplierOrders() {
    return this.request<{
      success: boolean;
      data: { orders: any[] };
    }>('/orders/supplier-orders');
  }

  async getOrdersByStatus(status: string) {
    return this.request<{
      success: boolean;
      data: { orders: any[] };
    }>(`/orders/status/${status}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: { order: any };
    }>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getOrderStats() {
    return this.request<{
      success: boolean;
      data: { stats: any[] };
    }>('/orders/stats');
  }

  // Invoice endpoints
  async createInvoice(invoiceData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { invoice: any };
    }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async getInvoices() {
    return this.request<{
      success: boolean;
      data: { invoices: any[] };
    }>('/invoices');
  }

  async getSupplierInvoices() {
    return this.request<{
      success: boolean;
      data: { invoices: any[] };
    }>('/invoices/supplier-invoices');
  }

  async getInvoicesByStatus(status: string) {
    return this.request<{
      success: boolean;
      data: { invoices: any[] };
    }>(`/invoices/status/${status}`);
  }

  async verifyInvoice(invoiceId: string, verificationNotes?: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: { invoice: any };
    }>(`/invoices/${invoiceId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verificationNotes }),
    });
  }

  async addDiscrepancy(invoiceId: string, discrepancy: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: { invoice: any };
    }>(`/invoices/${invoiceId}/discrepancy`, {
      method: 'PUT',
      body: JSON.stringify({ discrepancy }),
    });
  }

  async getInvoiceStats() {
    return this.request<{
      success: boolean;
      data: { stats: any[] };
    }>('/invoices/stats');
  }

  // Supplier endpoints
  async getSuppliers() {
    return this.request<{
      success: boolean;
      data: { suppliers: any[] };
    }>('/auth/suppliers');
  }

  async getSuppliersBySpeciality(speciality: string) {
    return this.request<{
      success: boolean;
      data: { suppliers: any[] };
    }>(`/auth/suppliers/speciality/${speciality}`);
  }

  // Note: Supplier management is now handled through User management APIs
  // Use createUser, updateUser, deleteUser with role: 'supplier'

  // Feed Type endpoints
  async getFeedTypes() {
    return this.request<{
      success: boolean;
      data: { feedTypes: any[] };
    }>('/feed-types');
  }

  async getFeedTypesByCategory(category: string) {
    return this.request<{
      success: boolean;
      data: { feedTypes: any[] };
    }>(`/feed-types/category/${category}`);
  }

  async createFeedType(feedTypeData: any) {
    // Map pricePerTon to pricePerTonne for backend compatibility
    const { pricePerTon, ...restData } = feedTypeData;
    const mappedData = {
      ...restData,
      ...(pricePerTon !== undefined && { pricePerTonne: pricePerTon })
    };

    return this.request<{
      success: boolean;
      message: string;
      data: { feedType: any };
    }>('/feed-types', {
      method: 'POST',
      body: JSON.stringify(mappedData),
    });
  }

  // User Management APIs
  async getUsers() {
    return this.request<{
      success: boolean;
      data: { users: any[] };
      message?: string;
    }>('/auth/users', {
      method: 'GET',
    });
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.request<{
      success: boolean;
      data: { user: any };
      message?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  }) {
    return this.request<{
      success: boolean;
      data: { user: any };
      message?: string;
    }>(`/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request<{
      success: boolean;
      message?: string;
    }>(`/auth/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateFeedType(feedId: string, feedData: {
    name?: string;
    pricePerTon?: number;
    description?: string;
    category?: string;
    isActive?: boolean;
  }) {
    // Map pricePerTon to pricePerTonne for backend compatibility
    const { pricePerTon, ...restData } = feedData;
    const mappedData = {
      ...restData,
      ...(pricePerTon !== undefined && { pricePerTonne: pricePerTon })
    };

    return this.request<{
      success: boolean;
      data: { feedType: any };
      message?: string;
    }>(`/feed-types/${feedId}`, {
      method: 'PUT',
      body: JSON.stringify(mappedData),
    });
  }

  async deleteFeedType(feedId: string) {
    return this.request<{
      success: boolean;
      message?: string;
    }>(`/feed-types/${feedId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  logout() {
    this.token = null;
    localStorage.removeItem('zoo-procure-token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('zoo-procure-token', token);
  }

  getToken() {
    return this.token;
  }
}

export default new ApiService();