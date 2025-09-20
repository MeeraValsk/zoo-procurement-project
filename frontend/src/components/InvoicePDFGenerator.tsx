import jsPDF from 'jspdf';
import { Order, Invoice, User } from '@/types';

interface InvoicePDFGeneratorProps {
  invoice: Invoice;
  order: Order;
  supplier: User;
}

export class InvoicePDFGenerator {
  private doc: jsPDF;
  private currentY: number = 0;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;
  private contentWidth: number = 175; // A4 width - margins

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  generateInvoice(invoice: Invoice, order: Order, supplier: User): void {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = this.margin;

    // Header
    this.addHeader();
    this.addSpacing(10);

    // Invoice Details
    this.addInvoiceDetails(invoice, order);
    this.addSpacing(15);

    // Supplier Details
    this.addSupplierDetails(supplier);
    this.addSpacing(15);

    // Order Details
    this.addOrderDetails(order);
    this.addSpacing(15);

    // Items Table
    this.addItemsTable(order);
    this.addSpacing(15);

    // Totals
    this.addTotals(invoice, order);
    this.addSpacing(20);

    // Footer
    this.addFooter();

    // Save the PDF
    const fileName = `Invoice_${invoice.invoiceId || invoice._id}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(fileName);
  }

  private addHeader(): void {
    // Zoo Park Logo/Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ZOO PARK ANIMAL FOOD', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('PROCUREMENT HUB', this.margin, this.currentY);
    this.currentY += 8;

    // Invoice Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INVOICE', this.margin, this.currentY);
    this.currentY += 8;

    // Address
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('123 Zoo Park Avenue', this.margin, this.currentY);
    this.currentY += 4;
    this.doc.text('Wildlife District, City - 12345', this.margin, this.currentY);
    this.currentY += 4;
    this.doc.text('Phone: +1 (555) 123-4567 | Email: orders@zoopark.com', this.margin, this.currentY);
  }

  private addInvoiceDetails(invoice: Invoice, order: Order): void {
    const rightX = this.margin + this.contentWidth - 60;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Invoice Details', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Invoice ID
    this.doc.text('Invoice ID:', this.margin, this.currentY);
    this.doc.text(invoice.invoiceId || invoice._id, rightX, this.currentY);
    this.currentY += 5;

    // Order ID
    this.doc.text('Order ID:', this.margin, this.currentY);
    this.doc.text(order.orderId || order._id, rightX, this.currentY);
    this.currentY += 5;

    // Invoice Date
    this.doc.text('Invoice Date:', this.margin, this.currentY);
    this.doc.text(new Date(invoice.createdAt).toLocaleDateString(), rightX, this.currentY);
    this.currentY += 5;

    // Due Date
    this.doc.text('Due Date:', this.margin, this.currentY);
    this.doc.text(new Date(invoice.dueDate).toLocaleDateString(), rightX, this.currentY);
    this.currentY += 5;

    // Status
    this.doc.text('Status:', this.margin, this.currentY);
    this.doc.text(invoice.status || 'Generated', rightX, this.currentY);
  }

  private addSupplierDetails(supplier: User): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Supplier Details', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    this.doc.text(`Name: ${supplier.name}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Email: ${supplier.email}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Contact: ${supplier.contact || 'N/A'}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Speciality: ${supplier.speciality || 'N/A'}`, this.margin, this.currentY);
    if (supplier.address) {
      this.currentY += 5;
      this.doc.text(`Address: ${supplier.address}`, this.margin, this.currentY);
    }
  }

  private addOrderDetails(order: Order): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Order Details', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    this.doc.text(`Item: ${order.itemName}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Quantity: ${order.quantity} tonnes`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Price per Tonne: ₹${order.price?.toLocaleString() || 'N/A'}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Department: ${order.department || 'N/A'}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, this.margin, this.currentY);
  }

  private addItemsTable(order: Order): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Items', this.margin, this.currentY);
    this.currentY += 8;

    // Table header
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const tableStartY = this.currentY;
    const col1 = this.margin;
    const col2 = this.margin + 60;
    const col3 = this.margin + 100;
    const col4 = this.margin + 140;

    // Draw table lines
    this.doc.line(col1, tableStartY, col1 + this.contentWidth, tableStartY);
    this.doc.line(col1, tableStartY + 8, col1 + this.contentWidth, tableStartY + 8);
    this.doc.line(col1, tableStartY + 16, col1 + this.contentWidth, tableStartY + 16);
    this.doc.line(col1, tableStartY, col1, tableStartY + 16);
    this.doc.line(col2, tableStartY, col2, tableStartY + 16);
    this.doc.line(col3, tableStartY, col3, tableStartY + 16);
    this.doc.line(col4, tableStartY, col4, tableStartY + 16);
    this.doc.line(col1 + this.contentWidth, tableStartY, col1 + this.contentWidth, tableStartY + 16);

    // Header text
    this.doc.text('Item', col1 + 2, tableStartY + 6);
    this.doc.text('Quantity', col2 + 2, tableStartY + 6);
    this.doc.text('Price/Ton', col3 + 2, tableStartY + 6);
    this.doc.text('Total', col4 + 2, tableStartY + 6);

    // Item row
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(order.itemName || 'N/A', col1 + 2, tableStartY + 14);
    this.doc.text(`${order.quantity} tonnes`, col2 + 2, tableStartY + 14);
    this.doc.text(`₹${order.price?.toLocaleString() || 'N/A'}`, col3 + 2, tableStartY + 14);
    this.doc.text(`₹${order.totalAmount?.toLocaleString() || 'N/A'}`, col4 + 2, tableStartY + 14);

    this.currentY = tableStartY + 20;
  }

  private addTotals(invoice: Invoice, order: Order): void {
    const rightX = this.margin + this.contentWidth - 60;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Subtotal
    this.doc.text('Subtotal:', rightX, this.currentY);
    this.doc.text(`₹${order.totalAmount?.toLocaleString() || '0'}`, rightX + 40, this.currentY);
    this.currentY += 5;

    // Tax (if any)
    const tax = 0; // Assuming no tax for now
    if (tax > 0) {
      this.doc.text('Tax:', rightX, this.currentY);
      this.doc.text(`₹${tax.toLocaleString()}`, rightX + 40, this.currentY);
      this.currentY += 5;
    }

    // Total
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Total Amount:', rightX, this.currentY);
    this.doc.text(`₹${(invoice.amount || order.totalAmount || 0).toLocaleString()}`, rightX + 40, this.currentY);
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 30;

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Thank you for your business!', this.margin, footerY);
    this.doc.text('For any queries, contact us at orders@zoopark.com', this.margin, footerY + 4);
    this.doc.text('This is a computer-generated invoice.', this.margin, footerY + 8);
  }

  private addSpacing(space: number): void {
    this.currentY += space;
    
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }
}

// Utility function to generate invoice PDF
export const generateInvoicePDF = (invoice: Invoice, order: Order, supplier: User): void => {
  const generator = new InvoicePDFGenerator();
  generator.generateInvoice(invoice, order, supplier);
};

