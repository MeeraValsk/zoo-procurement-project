// EmailJS Configuration
// Replace these with your actual EmailJS credentials
export const EMAIL_CONFIG = {
  SERVICE_ID: 'your_emailjs_service_id',
  TEMPLATE_ID: 'your_emailjs_template_id',
  PUBLIC_KEY: 'your_emailjs_public_key',
};

// Instructions for setting up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create an account and verify your email
// 3. Create a new service (Gmail, Outlook, etc.)
// 4. Create a new template with the following variables:
//    - {{to_email}}
//    - {{to_name}}
//    - {{invoice_id}}
//    - {{order_id}}
//    - {{supplier_name}}
//    - {{total_amount}}
//    - {{invoice_date}}
//    - {{due_date}}
//    - {{items}}
//    - {{message}}
//    - {{from_name}}
//    - {{reply_to}}
// 5. Copy the Service ID, Template ID, and Public Key
// 6. Update the values above

