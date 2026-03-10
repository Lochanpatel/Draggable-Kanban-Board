const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kanban';

const seedTasks = [
  // ── To Do ──────────────────────────────────────────────
  {
    title: 'Design homepage wireframes',
    description: 'Create low-fidelity wireframes for the landing page. Include hero, features, and pricing sections.',
    status: 'To Do',
  },
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions to run tests and auto-deploy to Railway on every push to main.',
    status: 'To Do',
  },
  {
    title: 'Write API documentation',
    description: 'Document all REST endpoints using Postman or Swagger. Include request/response examples.',
    status: 'To Do',
  },
  // ── In Progress ────────────────────────────────────────
  {
    title: 'Build REST API',
    description: 'Implement Express routes for CRUD operations on tasks with proper error handling.',
    status: 'In Progress',
  },
  {
    title: 'Implement drag-and-drop',
    description: 'Use HTML5 drag events to move task cards between board columns with optimistic UI updates.',
    status: 'In Progress',
  },
  {
    title: 'Responsive mobile layout',
    description: 'Ensure the board looks great on phones and tablets using Tailwind responsive utilities.',
    status: 'In Progress',
  },
  // ── Done ──────────────────────────────────────────────
  {
    title: 'Set up project repository',
    description: 'Initialise Git repo, create README with setup instructions, configure .gitignore.',
    status: 'Done',
  },
  {
    title: 'Design database schema',
    description: 'Define Mongoose models and relationships for tasks — title, description, status, timestamps.',
    status: 'Done',
  },
  {
    title: 'Deploy backend to Railway',
    description: 'Containerised the Node/Express server and deployed to Railway with MongoDB Atlas connection.',
    status: 'Done',
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
