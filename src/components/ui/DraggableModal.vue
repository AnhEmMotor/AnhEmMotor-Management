<script setup>
import { ref, onBeforeUnmount } from 'vue'
import IconMaximize from '@/components/icons/IconMaximize.vue'
import IconMinimize from '@/components/icons/IconMinimize.vue'
import IconClose from '@/components/icons/IconClose.vue'

const props = defineProps({
  initialPosition: {
    type: Object,
    default: () => ({ x: 150, y: 150 }),
  },
  zIndex: {
    type: Number,
    default: 100,
  },
})
const emit = defineEmits(['close', 'activate'])
const modalRef = ref(null)
const position = ref({ x: props.initialPosition.x, y: props.initialPosition.y })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const isMaximized = ref(false)
const previousPosition = ref(null)
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
  if (isMaximized.value) {
    previousPosition.value = { x: position.value.x, y: position.value.y }
    position.value = { x: 0, y: 0 }
  } else {
    position.value = previousPosition.value
    previousPosition.value = null
  }
}
const startDrag = (event) => {
  if (isMaximized.value) return
  emit('activate')
  isDragging.value = true
  dragOffset.value.x = event.clientX - position.value.x
  dragOffset.value.y = event.clientY - position.value.y
  window.addEventListener('mousemove', doDrag)
  window.addEventListener('mouseup', stopDrag)
}
const doDrag = (event) => {
  if (isDragging.value) {
    position.value.x = event.clientX - dragOffset.value.x
    position.value.y = event.clientY - dragOffset.value.y
  }
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
      :style="{ top: position.y + 'px', left: position.x + 'px', zIndex: zIndex }"
      @mousedown.self="emit('activate')"
    >
      <div class="modal-header" @mousedown="!isMaximized && startDrag($event)">
        <slot name="header">Tiêu đề</slot>
        <div class="modal-controls">
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
