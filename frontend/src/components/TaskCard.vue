<template>
  <div
    class="task-card group relative rounded-2xl p-4 cursor-grab active:cursor-grabbing select-none transition-all duration-200 border hover:shadow-lg hover:-translate-y-0.5"
    :class="[cardBorderClass, cardBgClass, isDragging ? 'opacity-30 scale-95 rotate-1' : '']"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- Status pill -->
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide mb-3 border"
      :class="statusPillClass"
    >
      <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="statusDotClass"></span>
      {{ task.status }}
    </span>

    <!-- Title -->
    <h3 class="text-sm font-semibold text-white/90 leading-snug mb-1.5 pr-5">
      {{ task.title }}
    </h3>

    <!-- Description -->
    <p v-if="task.description" class="text-xs text-white/40 leading-relaxed line-clamp-2">
      {{ task.description }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
      <div class="flex items-center gap-1.5 text-white/30">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
        </svg>
        <span class="text-[11px]">{{ formattedDate }}</span>
      </div>
    </div>

    <!-- Delete button -->
    <button
      id="delete-task-btn"
      class="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-all duration-150 w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-red-500/70 bg-white/5"
      title="Delete task"
      @click.stop="$emit('delete', task._id)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['delete'])
const isDragging = ref(false)

function onDragStart(event) {
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('taskId', props.task._id)
}

function onDragEnd() {
  isDragging.value = false
}

// Card background — subtle tinted glass per status
const cardBgClass = computed(() => {
  const map = {
    'To Do':       'bg-rose-950/20',
    'In Progress': 'bg-violet-950/20',
    'Done':        'bg-cyan-950/20',
  }
  return map[props.task.status] ?? 'bg-white/5'
})

// Border color
const cardBorderClass = computed(() => {
  const map = {
    'To Do':       'border-rose-500/15 hover:border-rose-500/35',
    'In Progress': 'border-violet-500/15 hover:border-violet-500/35',
    'Done':        'border-cyan-500/15 hover:border-cyan-500/35',
  }
  return map[props.task.status] ?? 'border-white/10'
})

// Status pill
const statusPillClass = computed(() => {
  const map = {
    'To Do':       'bg-rose-500/10 text-rose-300 border-rose-500/20',
    'In Progress': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    'Done':        'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  }
  return map[props.task.status] ?? 'bg-white/5 text-white/60 border-white/10'
})

const statusDotClass = computed(() => {
  const map = {
    'To Do':       'bg-rose-400',
    'In Progress': 'bg-violet-400',
    'Done':        'bg-cyan-400',
  }
  return map[props.task.status] ?? 'bg-white/40'
})

// Formatted date
const formattedDate = computed(() => {
  if (!props.task.createdAt) return ''
  return new Date(props.task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})
</script>
