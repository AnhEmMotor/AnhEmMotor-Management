<script setup>
import { ref, onBeforeUnmount, computed, onMounted } from 'vue'
import IconMaximize from '@/components/icons/IconMaximize.vue'
import IconMinimize from '@/components/icons/IconMinimize.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'

const props = defineProps({
  initialPosition: {
    type: Object,
    default: () => ({ x: 150, y: 150 }),
  },
  zIndex: {
    type: Number,
    default: 100,
  },
  onRefresh: {
    type: Function,
    required: false,
  },
  width: {
    type: String,
    default: '500px',
  },
})
const emit = defineEmits(['close', 'activate', 'refresh'])

// Check for refresh listener via props
const hasRefreshListener = computed(() => !!props.onRefresh)

const modalRef = ref(null)
const positionX = ref(props.initialPosition.x)
const positionY = ref(props.initialPosition.y)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const isMaximized = ref(false)
const previousPosition = ref({ x: 0, y: 0 })

// Initialize position on mount
onMounted(() => {
  positionX.value = props.initialPosition.x
  positionY.value = props.initialPosition.y
})

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
  if (isMaximized.value) {
    // Save current position before maximizing
    previousPosition.value.x = positionX.value
    previousPosition.value.y = positionY.value
    positionX.value = 0
    positionY.value = 0
  } else {
    // Restore previous position
    positionX.value = previousPosition.value.x
    positionY.value = previousPosition.value.y
  }
}

const startDrag = (event) => {
  if (isMaximized.value) return
  emit('activate')
  isDragging.value = true
  dragOffset.value.x = event.clientX - positionX.value
  dragOffset.value.y = event.clientY - positionY.value
  window.addEventListener('mousemove', doDrag)
  window.addEventListener('mouseup', stopDrag)
}

const doDrag = (event) => {
  if (!isDragging.value) return

  // Use requestAnimationFrame for smooth dragging
  requestAnimationFrame(() => {
    positionX.value = event.clientX - dragOffset.value.x
    positionY.value = event.clientY - dragOffset.value.y
  })
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', doDrag)
  window.removeEventListener('mouseup', stopDrag)
}
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', doDrag)
  window.removeEventListener('mouseup', stopDrag)
})
</script>

<template>
  <teleport to="body">
    <div
      ref="modalRef"
      class="draggable-modal-container"
      :class="{
        'is-maximized': isMaximized,
        'is-dragging': isDragging,
      }"
      :style="{
        top: positionY + 'px',
        left: positionX + 'px',
        zIndex: zIndex,
        width: isMaximized ? '100%' : width,
      }"
      @mousedown.self="emit('activate')"
    >
      <div class="modal-header" @mousedown="!isMaximized && startDrag($event)">
        <slot name="header">Tiêu đề</slot>
        <div class="modal-controls">
          <button v-if="hasRefreshListener" class="modal-control-button" @click="emit('refresh')">
            <IconRefresh />
          </button>
          <button class="modal-control-button" @click="toggleMaximize">
            <IconMinimize v-if="isMaximized" />
            <IconMaximize v-else />
          </button>
          <button class="modal-control-button" @click="emit('close')">
            <IconClose />
          </button>
        </div>
      </div>
      <div class="modal-body">
        <slot name="body">Nội dung.</slot>
      </div>
      <div class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.draggable-modal-container {
  position: fixed;
  width: 500px;
  min-height: 200px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}
.draggable-modal-container.is-dragging {
  transition: none;
}
.draggable-modal-container.is-maximized {
  width: 100%;
  height: 100%;
  border-radius: 0;
  box-shadow: none;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #e5e5e5;
  cursor: move;
  user-select: none;
}
.is-maximized .modal-header {
  cursor: default;
}
.modal-controls {
  display: flex;
  align-items: center;
}
.modal-control-button {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-control-button:hover {
  color: #000;
  background-color: #e5e5e5;
  border-radius: 4px;
}
.modal-body {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 20px;
  border-top: 1px solid #e5e5e5;
  background-color: #f7f7f7;
}
.modal-footer button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}
.modal-footer button.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
