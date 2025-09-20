const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const FeedType = require('../models/FeedType');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo-procure-hub');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await FeedType.deleteMany({});

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'staff1',
        email: 'staff1@zoo.com',
        password: hashedPassword,
        name: 'John Smith',
        role: 'staff',
        zoo: 'City Zoo'
      },
      {
        username: 'supplier1',
        email: 'supplier1@greenfeed.com',
        password: hashedPassword,
        name: 'Green Feed Co.',
        role: 'supplier',
        company: 'Green Feed Company',
        speciality: 'Hay, Silage, Green Forages',
        contact: 'John Green',
        address: '123 Farm Road, Green Valley, CA 90210',
        rating: 4.8
      },
      {
        username: 'admin1',
        email: 'admin1@zoo.com',
        password: hashedPassword,
        name: 'Sarah Johnson',
        role: 'admin',
        zoo: 'City Zoo'
      },
      {
        username: 'invoice1',
        email: 'invoice1@zoo.com',
        password: hashedPassword,
        name: 'Mike Wilson',
        role: 'invoice',
        zoo: 'City Zoo'
      },
      {
        username: 'supplier2',
        email: 'supplier2@animalnutrition.com',
        password: hashedPassword,
        name: 'Animal Nutrition Ltd.',
        role: 'supplier',
        company: 'Animal Nutrition Ltd.',
        speciality: 'Fish Meal, Meat and Bone Meal',
        contact: 'Sarah Brown',
        address: '456 Industrial Park, Metro City, CA 90211',
        rating: 4.6
      },
      {
        username: 'supplier3',
        email: 'supplier3@premiumfeeds.com',
        password: hashedPassword,
        name: 'Premium Feeds Inc.',
        role: 'supplier',
        company: 'Premium Feeds Inc.',
        speciality: 'Groundnut Cake, Soybean Meal',
        contact: 'David Lee',
        address: '789 Feed Street, Agriculture District, CA 90212',
        rating: 4.9
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers.length);

    // Suppliers are now created as users with role 'supplier' above

    // Create feed types
    const feedTypes = [
      {
        name: 'Hay',
        pricePerTonne: 120,
        description: 'Dried grass for ruminants',
        category: 'Hay'
      },
      {
        name: 'Silage',
        pricePerTonne: 80,
        description: 'Fermented grass for cattle',
        category: 'Silage'
      },
      {
        name: 'Green Forages',
        pricePerTonne: 60,
        description: 'Fresh green plants',
        category: 'Green Forages'
      },
      {
        name: 'Straw',
        pricePerTonne: 40,
        description: 'Cereal crop residues',
        category: 'Straw'
      },
      {
        name: 'Pasture',
        pricePerTonne: 30,
        description: 'Grazing land management',
        category: 'Pasture'
      },
      {
        name: 'Fish Meal',
        pricePerTonne: 800,
        description: 'High protein fish-based feed',
        category: 'Fish Meal'
      },
      {
        name: 'Meat and Bone Meal',
        pricePerTonne: 600,
        description: 'Protein-rich animal byproduct',
        category: 'Meat Meal'
      },
      {
        name: 'Groundnut Cake',
        pricePerTonne: 400,
        description: 'Oilseed protein supplement',
        category: 'Protein Feeds'
      },
      {
        name: 'Soybean Meal',
        pricePerTonne: 350,
        description: 'Plant-based protein source',
        category: 'Protein Feeds'
      }
    ];

    const createdFeedTypes = await FeedType.insertMany(feedTypes);
    console.log('Feed types created:', createdFeedTypes.length);

    console.log('Database seeded successfully!');
    console.log('You can now login with:');
    console.log('Staff: staff1@zoo.com / password123');
    console.log('Suppliers: supplier1@greenfeed.com, supplier2@animalnutrition.com, supplier3@premiumfeeds.com / password123');
    console.log('Admin: admin1@zoo.com / password123');
    console.log('Invoice: invoice1@zoo.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
