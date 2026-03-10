const https = require('https')

const API_HOST = 'draggable-kanban-board-production.up.railway.app'

// First, delete all existing tasks then seed fresh ones
const freshTasks = [
  { title: 'Design homepage wireframes',  description: 'Create low-fidelity wireframes for the landing page — hero, features, and pricing sections.', status: 'To Do' },
  { title: 'Set up CI/CD pipeline',       description: 'Configure GitHub Actions to run tests and auto-deploy to Railway on every push to main.', status: 'To Do' },
  { title: 'Write API documentation',     description: 'Document all REST endpoints using Swagger, with request and response body examples.', status: 'To Do' },
  { title: 'Build REST API',              description: 'Implement Express routes for CRUD operations on tasks with proper error handling.', status: 'In Progress' },
  { title: 'Implement drag-and-drop',     description: 'Use HTML5 drag events to move task cards between columns with optimistic UI updates.', status: 'In Progress' },
  { title: 'Responsive mobile layout',    description: 'Ensure the board looks great on phones and tablets using Tailwind responsive utilities.', status: 'In Progress' },
  { title: 'Set up project repository',   description: 'Initialise Git repo, create README with setup instructions, and configure .gitignore.', status: 'Done' },
  { title: 'Design database schema',      description: 'Define Mongoose Task model: title, description, status enum (To Do/In Progress/Done), timestamps.', status: 'Done' },
  { title: 'Deploy backend to Railway',   description: 'Deploy the Node/Express server to Railway with MongoDB Atlas environment variables.', status: 'Done' },
]

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null
    const opts = {
      hostname: API_HOST, path, method,
      headers: { 'Content-Type': 'application/json', ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}) }
    }
    const req = https.request(opts, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch { resolve(data) } })
    })
    req.on('error', reject)
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

;(async () => {
  // Fetch all existing tasks and delete them
  console.log('🗑️  Clearing existing tasks...')
  const existing = await request('GET', '/api/tasks')
  if (Array.isArray(existing)) {
    for (const t of existing) {
      await request('DELETE', `/api/tasks/${t._id}`)
      console.log(`   Deleted: ${t.title}`)
    }
  }

  // Seed fresh tasks
  console.log(`\n🌱 Seeding ${freshTasks.length} tasks...`)
  for (const task of freshTasks) {
    const created = await request('POST', '/api/tasks', task)
    if (created._id) {
      console.log(`  ✅ [${created.status}] ${created.title}`)
    } else {
      console.log(`  ❌ Failed:`, created)
    }
  }
  console.log('\n🎉 Done!')
})()
