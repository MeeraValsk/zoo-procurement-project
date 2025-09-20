import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '@/config/emailConfig';

// EmailJS configuration
const EMAILJS_SERVICE_ID = EMAIL_CONFIG.SERVICE_ID;
const EMAILJS_TEMPLATE_ID = EMAIL_CONFIG.TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = EMAIL_CONFIG.PUBLIC_KEY;

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailTemplateParams {
  to_email: string;
  to_name: string;
  invoice_id: string;
  order_id: string;
  supplier_name: string;
  total_amount: string;
  invoice_date: string;
  due_date: string;
  items: string;
  message?: string;
}

export class EmailService {
  static async sendInvoiceEmail(params: EmailTemplateParams): Promise<boolean> {
    try {
      const templateParams = {
        to_email: params.to_email,
        to_name: params.to_name,
        invoice_id: params.invoice_id,
        order_id: params.order_id,
        supplier_name: params.supplier_name,
        total_amount: params.total_amount,
        invoice_date: params.invoice_date,
        due_date: params.due_date,
        items: params.items,
        message: params.message || 'Please find your invoice attached. Thank you for your business!',
        from_name: 'Zoo Park Procurement Hub',
        reply_to: 'orders@zoopark.com'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendDeliveryNotification(
    supplierEmail: string,
    supplierName: string,
    orderId: string,
    invoiceId: string,
    totalAmount: number
  ): Promise<boolean> {
    const params: EmailTemplateParams = {
      to_email: supplierEmail,
      to_name: supplierName,
      invoice_id: invoiceId,
      order_id: orderId,
      supplier_name: supplierName,
      total_amount: `₹${totalAmount.toLocaleString()}`,
      invoice_date: new Date().toLocaleDateString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days from now
      items: 'Animal Feed Order',
      message: `Your order ${orderId} has been delivered successfully. Please find the invoice details below.`
    };

    return this.sendInvoiceEmail(params);
  }

  static async sendInvoiceVerificationNotification(
    supplierEmail: string,
    supplierName: string,
    invoiceId: string,
    status: string,
    notes?: string
  ): Promise<boolean> {
    const params: EmailTemplateParams = {
      to_email: supplierEmail,
      to_name: supplierName,
      invoice_id: invoiceId,
      order_id: 'N/A',
      supplier_name: supplierName,
      total_amount: 'N/A',
      invoice_date: new Date().toLocaleDateString(),
      due_date: 'N/A',
      items: 'Invoice Verification Update',
      message: `Your invoice ${invoiceId} has been ${status.toLowerCase()}. ${notes ? `Notes: ${notes}` : ''}`
    };

    return this.sendInvoiceEmail(params);
  }
}

export default EmailService;
