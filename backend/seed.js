const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kanban';

const seedTasks = [
  {
    title: 'Set up project repository',
    description: 'Initialize Git repo, create README, and set up folder structure.',
    status: 'Done',
  },
  {
    title: 'Design database schema',
    description: 'Define Mongoose models and relationships for the Kanban board.',
    status: 'Done',
  },
  {
    title: 'Build REST API',
    description: 'Implement Express routes for CRUD operations on tasks.',
    status: 'In Progress',
  },
  {
    title: 'Implement drag-and-drop',
    description: 'Use HTML5 drag events to move tasks between board columns.',
    status: 'In Progress',
  },
  {
    title: 'Write unit tests',
    description: 'Cover API endpoints with Jest and Supertest.',
    status: 'To Do',
  },
  {
    title: 'Deploy to production',
    description: 'Containerize with Docker and deploy to a cloud provider.',
    status: 'To Do',
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  await Task.deleteMany({});
  console.log('🗑️  Cleared existing tasks');

  const created = await Task.insertMany(seedTasks);
  console.log(`🌱 Seeded ${created.length} tasks:`);
  created.forEach((t) => console.log(`   [${t.status}] ${t.title}`));

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
