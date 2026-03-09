import axios from 'axios'

// In production, VITE_API_URL is set in Vercel/hosting dashboard.
// Locally it falls back to localhost:5000.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Fetch all tasks from the database.
 * @returns {Promise<Array>} Array of task objects
 */
export const getTasks = () => api.get('/tasks').then((res) => res.data)

/**
 * Create a new task.
 * @param {{ title: string, description?: string, status?: string }} data
 * @returns {Promise<Object>} The created task
 */
export const createTask = (data) => api.post('/tasks', data).then((res) => res.data)

/**
 * Partially update a task (title, description, or status).
 * @param {string} id - Task MongoDB ObjectId
 * @param {{ title?: string, description?: string, status?: string }} data
 * @returns {Promise<Object>} The updated task
 */
export const updateTask = (id, data) =>
  api.patch(`/tasks/${id}`, data).then((res) => res.data)

/**
 * Delete a task by its ID.
 * @param {string} id - Task MongoDB ObjectId
 * @returns {Promise<Object>} Deletion confirmation message
 */
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then((res) => res.data)
