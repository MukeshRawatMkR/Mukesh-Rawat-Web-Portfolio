const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Project = require('../models/Project');
const ContactMessage = require('../models/ContactMessage');

// Sample data
const sampleProjects = [
  {
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product management, shopping cart, and payment integration.',
    imageURL: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe API'],
    githubURL: 'https://github.com/yourusername/ecommerce-platform',
    liveDemoURL: 'https://ecommerce-demo.yourdomain.com',
    featured: true,
    order: 1000,
    status: 'active',
  },
  {
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
    imageURL: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    techStack: ['React', 'Socket.io', 'Node.js', 'PostgreSQL', 'Redis'],
    githubURL: 'https://github.com/yourusername/task-manager',
    liveDemoURL: 'https://tasks.yourdomain.com',
    featured: true,
    order: 999,
    status: 'active',
  },
  {
    title: 'Weather Dashboard',
    description: 'A responsive weather dashboard that displays current weather, forecasts, and historical data with beautiful visualizations.',
    imageURL: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&h=600&fit=crop',
    techStack: ['Vue.js', 'Chart.js', 'OpenWeather API', 'CSS3'],
    githubURL: 'https://github.com/yourusername/weather-dashboard',
    liveDemoURL: 'https://weather.yourdomain.com',
    featured: false,
    order: 998,
    status: 'active',
  },
  {
    title: 'Blog Platform',
    description: 'A modern blog platform with markdown support, comments system, and admin panel for content management.',
    imageURL: 'https://images.unsplash.com/photo-1486312338219-ce68e2c6952e?w=800&h=600&fit=crop',
    techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'TailwindCSS'],
    githubURL: 'https://github.com/yourusername/blog-platform',
    liveDemoURL: 'https://blog.yourdomain.com',
    featured: false,
    order: 997,
    status: 'active',
  },
  {
    title: 'Social Media Analytics',
    description: 'An analytics dashboard for social media metrics with data visualization and reporting features.',
    imageURL: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    techStack: ['React', 'D3.js', 'Python', 'Flask', 'MongoDB'],
    githubURL: 'https://github.com/yourusername/social-analytics',
    liveDemoURL: 'https://analytics.yourdomain.com',
    featured: true,
    order: 996,
    status: 'active',
  },
];

const sampleContactMessages = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    message: 'Hi! I love your portfolio. I would like to discuss a potential project collaboration. Please get back to me when you have a chance.',
    status: 'new',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    message: 'We are looking for a full-stack developer for our startup. Your skills seem like a perfect match for what we need. Would you be interested in a full-time position?',
    status: 'read',
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    message: 'Excellent work on your projects! I am particularly impressed with your e-commerce platform. Could you share some insights about the architecture?',
    status: 'replied',
    replied: true,
    repliedAt: new Date(),
    notes: 'Sent detailed architecture explanation via email',
  },
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany();
    await Project.deleteMany();
    await ContactMessage.deleteMany();
    console.log('🗑️  Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const admin = await User.create({
      username: adminUsername,
      password: adminPassword,
      role: 'admin',
      email: 'admin@portfolio.com',
    });

    console.log(`👤 Admin user created: ${admin.username}`);
    return admin;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Seed projects
const seedProjects = async () => {
  try {
    const projects = await Project.insertMany(sampleProjects);
    console.log(`📁 ${projects.length} projects created`);
    return projects;
  } catch (error) {
    console.error('❌ Error creating projects:', error);
  }
};

// Seed contact messages
const seedContactMessages = async () => {
  try {
    const messages = await ContactMessage.insertMany(sampleContactMessages);
    console.log(`📧 ${messages.length} contact messages created`);
    return messages;
  } catch (error) {
    console.error('❌ Error creating contact messages:', error);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearData();
    
    const admin = await seedAdmin();
    const projects = await seedProjects();
    const messages = await seedContactMessages();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admin user: ${admin ? admin.username : 'Failed'}`);
    console.log(`   - Projects: ${projects ? projects.length : 0}`);
    console.log(`   - Contact messages: ${messages ? messages.length : 0}`);
    
    console.log('\n🔑 Admin Credentials:');
    console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    
    console.log('\n🚀 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--clear')) {
  // Only clear data
  connectDB().then(() => {
    clearData().then(() => {
      console.log('✅ Data cleared successfully');
      mongoose.connection.close();
    });
  });
} else {
  // Full seed
  seedDatabase();
}