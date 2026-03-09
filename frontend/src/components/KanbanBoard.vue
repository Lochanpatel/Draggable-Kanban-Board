<template>
  <div class="min-h-screen bg-mesh">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <header class="sticky top-0 z-20 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">

        <!-- Logo + Title -->
        <div class="flex items-center gap-3">
          <div class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            <!-- Glow dot -->
            <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black"></span>
          </div>
          <div>
            <h1 class="text-base font-bold text-white tracking-tight leading-tight">
              Kanban Board
            </h1>
            <p class="text-[11px] text-white/35 leading-tight">Drag tasks to update status</p>
          </div>
        </div>

        <!-- Total count pill -->
        <div class="hidden sm:flex items-center gap-4">
          <div class="flex items-center gap-2 text-xs text-white/40">
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            {{ tasks.length }} task{{ tasks.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Add Task button -->
        <button
          id="open-add-task-modal"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-150 active:scale-95"
          style="background: linear-gradient(135deg, #7c3aed, #db2777); box-shadow: 0 4px 24px rgba(139,92,246,0.35);"
          @click="showModal = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Task
        </button>
      </div>
    </header>

    <!-- ── Board ──────────────────────────────────────────────────────────── -->
    <main class="max-w-7xl mx-auto px-5 sm:px-8 py-8">

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="(color, n) in ['rose', 'violet', 'cyan']"
          :key="n"
          class="rounded-2xl border p-5 animate-pulse"
          :class="`bg-${color}-950/20 border-${color}-500/15`"
        >
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-xl bg-white/5"></div>
            <div class="h-3 w-20 bg-white/5 rounded-full"></div>
          </div>
          <div class="space-y-3">
            <div v-for="m in 2" :key="m" class="h-24 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Columns -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KanbanColumn
          v-for="col in columns"
          :key="col.status"
          :title="col.title"
          :status="col.status"
          :tasks="col.tasks"
          @task-dropped="handleTaskDrop"
          @delete-task="handleDeleteTask"
        />
      </div>

      <!-- Error state -->
      <div v-if="loadError" class="mt-10 flex flex-col items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-white/50 text-sm text-center">{{ loadError }}</p>
        <button
          class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition"
          @click="fetchTasks"
        >
          Retry
        </button>
      </div>
    </main>

    <!-- ── Add Task Modal ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/70 backdrop-blur-md"
            @click="closeModal"
          ></div>

          <!-- Modal card -->
          <div class="relative w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl"
               style="background: linear-gradient(135deg, rgba(15,10,30,0.95) 0%, rgba(20,10,40,0.95) 100%); box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15);">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-base font-bold text-white">New Task</h2>
                <p class="text-xs text-white/35 mt-0.5">Add a task to your board</p>
              </div>
              <button
                class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                @click="closeModal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleAddTask" class="flex flex-col gap-4">
              <!-- Title -->
              <div>
                <label class="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
                  Title <span class="text-rose-400 normal-case tracking-normal font-normal">*</span>
                </label>
                <input
                  id="task-title-input"
                  v-model="newTask.title"
                  type="text"
                  placeholder="e.g. Design landing page"
                  required
                  class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition border"
                  style="background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);"
                  @focus="e => e.target.style.borderColor='rgba(139,92,246,0.5)'"
                  @blur="e => e.target.style.borderColor='rgba(255,255,255,0.08)'"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Description</label>
                <textarea
                  id="task-desc-input"
                  v-model="newTask.description"
                  placeholder="Optional — add some context…"
                  rows="3"
                  class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition border resize-none"
                  style="background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);"
                  @focus="e => e.target.style.borderColor='rgba(139,92,246,0.5)'"
                  @blur="e => e.target.style.borderColor='rgba(255,255,255,0.08)'"
                ></textarea>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Initial Status</label>
                <select
                  id="task-status-select"
                  v-model="newTask.status"
                  class="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition border"
                  style="background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);"
                >
                  <option value="To Do" style="background:#1a0a2e;">🔴 To Do</option>
                  <option value="In Progress" style="background:#1a0a2e;">🟣 In Progress</option>
                  <option value="Done" style="background:#1a0a2e;">🩵 Done</option>
                </select>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  class="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 hover:text-white/80 transition"
                  @click="closeModal"
                >
                  Cancel
                </button>
                <button
                  id="submit-task-btn"
                  type="submit"
                  :disabled="isSaving"
                  class="flex-1 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style="background: linear-gradient(135deg, #7c3aed, #db2777); box-shadow: 0 4px 20px rgba(139,92,246,0.3);"
                >
                  {{ isSaving ? 'Creating…' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Toast Notifications ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <Transition name="toast">
          <div
            v-if="toast.visible"
            class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium min-w-56 shadow-2xl"
            :class="toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/25 text-emerald-200 shadow-emerald-500/10'
              : 'bg-rose-950/90 border-rose-500/25 text-rose-200 shadow-rose-500/10'"
          >
            <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                 :class="toast.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'">
              <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
            {{ toast.message }}
          </div>
        </Transition>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import { getTasks, createTask, updateTask, deleteTask } from '../api.js'

// ── State ─────────────────────────────────────────────────────────────────
const tasks = ref([])
const isLoading = ref(true)
const loadError = ref(null)
const isSaving = ref(false)
const showModal = ref(false)
const newTask = ref({ title: '', description: '', status: 'To Do' })

const toast = ref({ visible: false, message: '', type: 'success' })
let toastTimer = null

// ── Computed columns ─────────────────────────────────────────────────────
const columns = computed(() => [
  { title: 'To Do',       status: 'To Do',       tasks: tasks.value.filter(t => t.status === 'To Do') },
  { title: 'In Progress', status: 'In Progress',  tasks: tasks.value.filter(t => t.status === 'In Progress') },
  { title: 'Done',        status: 'Done',         tasks: tasks.value.filter(t => t.status === 'Done') },
])

// ── Toast helper ─────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { visible: true, message, type }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 3000)
}

// ── Data fetching ─────────────────────────────────────────────────────────
async function fetchTasks() {
  isLoading.value = true
  loadError.value = null
  try {
    tasks.value = await getTasks()
  } catch {
    loadError.value = 'Could not connect to the backend. Is the server running on port 5000?'
    showToast('Failed to load tasks', 'error')
  } finally {
    isLoading.value = false
  }
}
onMounted(fetchTasks)

// ── Drag-and-drop ─────────────────────────────────────────────────────────
async function handleTaskDrop({ taskId, newStatus }) {
  const task = tasks.value.find(t => t._id === taskId)
  if (!task || task.status === newStatus) return
  const prev = task.status
  task.status = newStatus
  try {
    await updateTask(taskId, { status: newStatus })
    showToast(`Moved to "${newStatus}"`)
  } catch {
    task.status = prev
    showToast('Failed to update task status', 'error')
  }
}

// ── Add task ──────────────────────────────────────────────────────────────
async function handleAddTask() {
  if (!newTask.value.title.trim() || isSaving.value) return
  isSaving.value = true
  try {
    const created = await createTask({ ...newTask.value })
    tasks.value.push(created)
    showToast('Task created!')
    closeModal()
  } catch {
    showToast('Failed to create task', 'error')
  } finally {
    isSaving.value = false
  }
}

// ── Delete task ───────────────────────────────────────────────────────────
async function handleDeleteTask(taskId) {
  const index = tasks.value.findIndex(t => t._id === taskId)
  if (index === -1) return
  const [removed] = tasks.value.splice(index, 1)
  try {
    await deleteTask(taskId)
    showToast('Task deleted')
  } catch {
    tasks.value.splice(index, 0, removed)
    showToast('Failed to delete task', 'error')
  }
}

// ── Modal helpers ─────────────────────────────────────────────────────────
function closeModal() {
  showModal.value = false
  newTask.value = { title: '', description: '', status: 'To Do' }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateY(12px) scale(0.92); }
.toast-leave-to { opacity: 0; transform: translateY(4px); }
</style>
