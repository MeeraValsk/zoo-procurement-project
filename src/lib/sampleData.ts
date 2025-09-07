// Sample data for initial setup and testing
export const sampleSuppliers = [
  {
    name: "Green Feed Co.",
    contact_person: "John Smith",
    email: "john@greenfeed.com",
    phone: "+91-9876543210",
    address: "123 Farm Road, Agricultural District, Mumbai 400001",
    rating: 4.8,
    total_orders: 156,
    total_revenue: 2450000,
    is_active: true
  },
  {
    name: "Animal Nutrition Ltd.",
    contact_person: "Sarah Johnson",
    email: "sarah@animalnutrition.com", 
    phone: "+91-9876543211",
    address: "456 Feed Street, Industrial Area, Delhi 110001",
    rating: 4.6,
    total_orders: 134,
    total_revenue: 1890000,
    is_active: true
  },
  {
    name: "Farm Fresh Feeds",
    contact_person: "Michael Brown",
    email: "michael@farmfresh.com",
    phone: "+91-9876543212", 
    address: "789 Nutrition Avenue, Feed Complex, Bangalore 560001",
    rating: 4.9,
    total_orders: 98,
    total_revenue: 1520000,
    is_active: true
  },
  {
    name: "Natural Feed Corp",
    contact_person: "Emma Wilson",
    email: "emma@naturalfeed.com",
    phone: "+91-9876543213",
    address: "321 Organic Lane, Green Valley, Chennai 600001", 
    rating: 4.4,
    total_orders: 67,
    total_revenue: 980000,
    is_active: false
  }
];

export const sampleUsers = [
  {
    email: "staff@zoo.com",
    password: "password123",
    full_name: "John Doe",
    role: "staff" as const,
    organization: "Central Zoo",
    phone: "+91-9876543200"
  },
  {
    email: "supplier@feeds.com", 
    password: "password123",
    full_name: "Green Feed Manager",
    role: "supplier" as const,
    organization: "Green Feed Co.",
    phone: "+91-9876543210"
  },
  {
    email: "invoice@zoo.com",
    password: "password123", 
    full_name: "Jane Smith",
    role: "invoice_team" as const,
    organization: "Central Zoo Finance",
    phone: "+91-9876543201"
  },
  {
    email: "admin@zoo.com",
    password: "password123",
    full_name: "Admin User", 
    role: "admin" as const,
    organization: "Zoo Management",
    phone: "+91-9876543202"
  }
];

export const sampleFeedPricing = [
  { feed_type: "hay", price_per_tonne: 8500, minimum_quantity: 5 },
  { feed_type: "silage", price_per_tonne: 6200, minimum_quantity: 10 },
  { feed_type: "green_forages", price_per_tonne: 4800, minimum_quantity: 20 },
  { feed_type: "straw", price_per_tonne: 3200, minimum_quantity: 15 },
  { feed_type: "pasture", price_per_tonne: 5500, minimum_quantity: 25 },
  { feed_type: "fish_meal", price_per_tonne: 45000, minimum_quantity: 2 },
  { feed_type: "meat_and_bone_meal", price_per_tonne: 38000, minimum_quantity: 3 },
  { feed_type: "groundnut_cake", price_per_tonne: 28000, minimum_quantity: 5 },
  { feed_type: "soybean_meal", price_per_tonne: 32000, minimum_quantity: 5 }
];

export const feedTypeLabels = {
  hay: "Hay",
  silage: "Silage", 
  green_forages: "Green Forages",
  straw: "Straw",
  pasture: "Pasture",
  fish_meal: "Fish Meal",
  meat_and_bone_meal: "Meat and Bone Meal", 
  groundnut_cake: "Groundnut Cake",
  soybean_meal: "Soybean Meal"
};

export const orderStatusLabels = {
  pending: "Pending",
  approved: "Approved", 
  accepted: "Accepted",
  in_transit: "In Transit",
  delivered: "Delivered",
  rejected: "Rejected"
};

export const invoiceStatusLabels = {
  pending: "Pending",
  under_review: "Under Review",
  verified: "Verified", 
  paid: "Paid",
  discrepancy: "Discrepancy",
  rejected: "Rejected"
};