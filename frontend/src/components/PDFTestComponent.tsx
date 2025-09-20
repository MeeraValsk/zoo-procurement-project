import React from 'react';
import { Button } from '@/components/ui/button';
import { generateInvoicePDF } from './InvoicePDFGenerator';
import { Invoice, Order, User } from '@/types';

const PDFTestComponent: React.FC = () => {
  const testPDFGeneration = () => {
    // Create test data
    const testInvoice: Invoice = {
      _id: 'inv_001',
      invoiceId: 'INV-2024-001',
      orderId: 'ord_001',
      supplier: 'supplier_001',
      customer: 'Zoo Park Animal Care',
      amount: 15000,
      items: 'Premium Animal Feed Mix',
      status: 'Generated',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    const testOrder: Order = {
      _id: 'ord_001',
      orderId: 'ORD-2024-001',
      itemName: 'Premium Animal Feed Mix',
      quantity: 5,
      price: 3000,
      totalAmount: 15000,
      supplier: 'supplier_001',
      customer: 'Zoo Park Animal Care',
      department: 'Animal Care',
      status: 'Delivered',
      createdAt: new Date().toISOString(),
    };

    const testSupplier: User = {
      _id: 'supplier_001',
      username: 'supplier1',
      email: 'supplier@example.com',
      name: 'ABC Animal Feed Suppliers',
      role: 'supplier',
      speciality: 'Premium Animal Feed',
      contact: '+1-555-0123',
      address: '123 Feed Street, Supplier City, SC 12345',
      isActive: true,
    };

    // Generate PDF
    generateInvoicePDF(testInvoice, testOrder, testSupplier);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">PDF Generation Test</h2>
      <p className="mb-4">Click the button below to test PDF invoice generation:</p>
      <Button onClick={testPDFGeneration} className="bg-blue-600 hover:bg-blue-700">
        Generate Test Invoice PDF
      </Button>
    </div>
  );
};

export default PDFTestComponent;

