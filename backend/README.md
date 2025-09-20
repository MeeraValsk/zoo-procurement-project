# Zoo Procurement Hub - Backend API

This is the backend API for the Zoo Procurement Hub application.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Support for staff, suppliers, admin, and invoice team roles
- **Order Management**: Create, update, and track purchase orders
- **Invoice Management**: Handle invoice creation, verification, and payment tracking
- **Supplier Management**: Manage supplier information and ratings
- **Feed Type Management**: Catalog of available feed types and pricing

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/supplier-orders` - Get supplier's orders
- `GET /api/orders/status/:status` - Get orders by status
- `PUT /api/orders/:id/status` - Update order status

### Invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/supplier-invoices` - Get supplier's invoices
- `GET /api/invoices/status/:status` - Get invoices by status
- `PUT /api/invoices/:id/verify` - Verify invoice
- `PUT /api/invoices/:id/discrepancy` - Add discrepancy

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/speciality/:speciality` - Get suppliers by speciality
- `PUT /api/suppliers/:id` - Update supplier

### Feed Types
- `GET /api/feed-types` - Get all feed types
- `POST /api/feed-types` - Create new feed type
- `GET /api/feed-types/category/:category` - Get feed types by category

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/zoo-procure-hub
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

3. **Start MongoDB**:
   Make sure MongoDB is running on your system.

4. **Seed the database**:
   ```bash
   node scripts/seedData.js
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Database Models

### User
- Basic user information with role-based access
- Roles: staff, supplier, admin, invoice

### Order
- Purchase order information
- Links to requester and supplier
- Status tracking (Pending, Approved, etc.)

### Invoice
- Invoice information linked to orders
- Verification status and discrepancy tracking

### Supplier
- Supplier company information
- Speciality and rating system

### FeedType
- Catalog of available feed types
- Pricing and categorization

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

- Use `npm run dev` for development with auto-restart
- Use `npm start` for production
- The API includes CORS support for frontend integration