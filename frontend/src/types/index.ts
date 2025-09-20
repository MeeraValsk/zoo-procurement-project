export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  name: string;
  role: 'staff' | 'supplier' | 'admin' | 'invoice';
  zoo?: string;
  company?: string;
  speciality?: string;
  contact?: string;
  address?: string;
  rating?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id?: string;
  id?: string;
  orderId?: string;
  itemName: string;
  quantity: number;
  price?: number;
  totalAmount?: number;
  supplier?: User | string;
  customer?: string;
  department?: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  _id?: string;
  id?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  orderId?: Order | string;
  supplier?: User | string;
  customer?: string;
  amount: number;
  items?: string;
  status: 'Generated' | 'Pending Verification' | 'Verified' | 'Discrepancy' | 'Sent';
  dueDate: string;
  receivedDate?: string;
  verificationNotes?: string;
  discrepancies?: string[];
  verifiedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedType {
  _id?: string;
  id?: string;
  name: string;
  pricePerTonne: number;
  description: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

