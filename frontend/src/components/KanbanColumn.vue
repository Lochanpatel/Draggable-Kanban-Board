<template>
  <div
    class="flex flex-col rounded-2xl border transition-all duration-200"
    :class="[columnBorder, columnBg, isDragOver ? dragOverClass : '']"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Column header -->
    <div class="flex items-center justify-between px-5 pt-5 pb-4">
      <div class="flex items-center gap-2.5">
        <!-- Icon circle -->
        <div class="w-7 h-7 rounded-xl flex items-center justify-center" :class="iconBgClass">
          <component :is="columnIcon" class="w-4 h-4" :class="iconColorClass" />
        </div>
        <h2 class="text-xs font-bold uppercase tracking-[0.15em]" :class="titleColorClass">
          {{ title }}
        </h2>
      </div>
      <!-- Count badge -->
      <span class="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg" :class="badgeClass">
        {{ tasks.length }}
      </span>
    </div>

    <!-- Divider with gradient -->
    <div class="mx-5 h-px mb-4" :class="dividerClass"></div>

    <!-- Task list / drop zone -->
    <div
      class="column-tasks flex flex-col gap-3 px-4 pb-5 min-h-32 transition-all duration-150"
    >
      <TaskCard
        v-for="task in tasks"
        :key="task._id"
        :task="task"
        @delete="$emit('delete-task', $event)"
      />

      <!-- Empty state -->
      <div
        v-if="tasks.length === 0 && !isDragOver"
        class="flex flex-col items-center justify-center py-10 text-white/15 text-xs gap-2 border border-dashed rounded-xl"
        :class="emptyBorderClass"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        No tasks yet
      </div>

      <!-- Drag-over drop placeholder -->
      <div
        v-if="isDragOver"
        class="flex items-center justify-center py-6 border-2 border-dashed rounded-xl"
        :class="dropPlaceholderClass"
      >
        <span class="text-xs font-medium" :class="titleColorClass">Drop here</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  title:  { type: String, required: true },
  status: { type: String, required: true },
  tasks:  { type: Array,  default: () => [] },
})

const emit = defineEmits(['task-dropped', 'delete-task'])
const isDragOver = ref(false)

function onDragOver(event) {
  event.preventDefault()
  isDragOver.value = true
}
function onDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragOver.value = false
  }
}
function onDrop(event) {
  isDragOver.value = false
  const taskId = event.dataTransfer.getData('taskId')
  if (taskId) emit('task-dropped', { taskId, newStatus: props.status })
}

// Inline SVG icons as render functions
const TodoIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'currentColor', viewBox: '0 0 20 20' }, [
  h('path', { 'fill-rule': 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z', 'clip-rule': 'evenodd' })
])
const InProgressIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'currentColor', viewBox: '0 0 20 20' }, [
  h('path', { d: 'M5 3a2 2 0 012-2h6a2 2 0 012 2v1h1a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h1V3zm2 0v1h6V3H7zm-3 4v9h12V7H4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z' })
])
const DoneIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'currentColor', viewBox: '0 0 20 20' }, [
  h('path', { 'fill-rule': 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', 'clip-rule': 'evenodd' })
])

const columnIcon = computed(() => ({ 'To Do': TodoIcon, 'In Progress': InProgressIcon, 'Done': DoneIcon }[props.status] ?? TodoIcon))

// Per-column theming: Rose / Violet / Cyan
const columnBg = computed(() => ({
  'To Do': 'bg-gradient-to-b from-rose-950/30 to-rose-950/10',
  'In Progress': 'bg-gradient-to-b from-violet-950/30 to-violet-950/10',
  'Done': 'bg-gradient-to-b from-cyan-950/30 to-cyan-950/10',
}[props.status] ?? 'bg-white/5'))

const columnBorder = computed(() => ({
  'To Do': 'border-rose-500/20',
  'In Progress': 'border-violet-500/20',
  'Done': 'border-cyan-500/20',
}[props.status] ?? 'border-white/10'))

const iconBgClass = computed(() => ({
  'To Do': 'bg-rose-500/15',
  'In Progress': 'bg-violet-500/15',
  'Done': 'bg-cyan-500/15',
}[props.status] ?? 'bg-white/10'))

const iconColorClass = computed(() => ({
  'To Do': 'text-rose-400',
  'In Progress': 'text-violet-400',
  'Done': 'text-cyan-400',
}[props.status] ?? 'text-white/50'))

const titleColorClass = computed(() => ({
  'To Do': 'text-rose-300',
  'In Progress': 'text-violet-300',
  'Done': 'text-cyan-300',
}[props.status] ?? 'text-white/60'))

const badgeClass = computed(() => ({
  'To Do': 'bg-rose-500/20 text-rose-300',
  'In Progress': 'bg-violet-500/20 text-violet-300',
  'Done': 'bg-cyan-500/20 text-cyan-300',
}[props.status] ?? 'bg-white/10 text-white/50'))

const dividerClass = computed(() => ({
  'To Do': 'bg-gradient-to-r from-transparent via-rose-500/30 to-transparent',
  'In Progress': 'bg-gradient-to-r from-transparent via-violet-500/30 to-transparent',
  'Done': 'bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent',
}[props.status] ?? 'bg-white/10'))

const emptyBorderClass = computed(() => ({
  'To Do': 'border-rose-500/10',
  'In Progress': 'border-violet-500/10',
  'Done': 'border-cyan-500/10',
}[props.status] ?? 'border-white/10'))

const dragOverClass = computed(() => ({
  'To Do': 'ring-2 ring-rose-500/50 scale-[1.01] shadow-lg shadow-rose-500/10',
  'In Progress': 'ring-2 ring-violet-500/50 scale-[1.01] shadow-lg shadow-violet-500/10',
  'Done': 'ring-2 ring-cyan-500/50 scale-[1.01] shadow-lg shadow-cyan-500/10',
}[props.status] ?? 'ring-2 ring-white/20 scale-[1.01]'))

const dropPlaceholderClass = computed(() => ({
  'To Do': 'border-rose-500/30 bg-rose-500/5',
  'In Progress': 'border-violet-500/30 bg-violet-500/5',
  'Done': 'border-cyan-500/30 bg-cyan-500/5',
}[props.status] ?? 'border-white/20'))
</script>
