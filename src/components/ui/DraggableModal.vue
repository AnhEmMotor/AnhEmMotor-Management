<script setup>
import { ref, onBeforeUnmount, computed, onMounted, nextTick } from 'vue'
import IconMaximize from '@/components/icons/IconMaximize.vue'
import IconMinimize from '@/components/icons/IconMinimize.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'

const props = defineProps({
  initialPosition: {
    type: Object,
    default: null,
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
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close', 'activate', 'refresh'])

const hasRefreshListener = computed(() => !!props.onRefresh)

const modalRef = ref(null)
const positionX = ref(0)
const positionY = ref(0)
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const isMaximized = ref(false)
const isReady = ref(false)
const isAnimated = ref(false)
const previousPosition = ref({ x: 0, y: 0 })

const modalWidth = ref(0)
const modalHeight = ref(0)
const resizeStartData = ref({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0, handle: '' })

const MIN_WIDTH = 300
const MIN_HEIGHT = 200

const parseInitialWidth = () => {
  const w = props.width
  if (w.endsWith('px')) return parseInt(w)
  if (w.endsWith('vw')) return (window.innerWidth * parseInt(w)) / 100
  return 500
}

const enableAnimation = () => {
  requestAnimationFrame(() => {
    isAnimated.value = true
  })
}

onMounted(async () => {
  modalWidth.value = parseInitialWidth()

  if (props.initialPosition) {
    positionX.value = props.initialPosition.x
    positionY.value = props.initialPosition.y
    await nextTick()
    if (modalRef.value) {
      modalHeight.value = modalRef.value.getBoundingClientRect().height
    }
    isReady.value = true
    enableAnimation()
    return
  }

  await nextTick()
  if (modalRef.value) {
    const rect = modalRef.value.getBoundingClientRect()
    modalHeight.value = rect.height
    positionX.value = Math.max(0, (window.innerWidth - rect.width) / 2)
    positionY.value = Math.max(0, (window.innerHeight - rect.height) / 2)
  }
  isReady.value = true
  enableAnimation()
})

const toggleMaximize = () => {
  if (props.disabled) return
  isMaximized.value = !isMaximized.value
  if (isMaximized.value) {
    previousPosition.value.x = positionX.value
    previousPosition.value.y = positionY.value
    positionX.value = 0
    positionY.value = 0
  } else {
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

const startResize = (handle, event) => {
  if (isMaximized.value || props.disabled) return
  event.preventDefault()
  event.stopPropagation()
  emit('activate')
  isResizing.value = true

  resizeStartData.value = {
    x: event.clientX,
    y: event.clientY,
    w: modalWidth.value,
    h: modalHeight.value || (modalRef.value ? modalRef.value.getBoundingClientRect().height : 400),
    px: positionX.value,
    py: positionY.value,
    handle,
  }

  window.addEventListener('mousemove', doResize)
  window.addEventListener('mouseup', stopResize)
}

const doResize = (event) => {
  if (!isResizing.value) return

  requestAnimationFrame(() => {
    const { x, y, w, h, px, py, handle } = resizeStartData.value
    const dx = event.clientX - x
    const dy = event.clientY - y

    let newW = w
    let newH = h
    let newX = px
    let newY = py

    if (handle.includes('right')) {
      newW = Math.max(MIN_WIDTH, w + dx)
    }
    if (handle.includes('left')) {
      newW = Math.max(MIN_WIDTH, w - dx)
      if (newW > MIN_WIDTH) newX = px + dx
    }
    if (handle.includes('bottom')) {
      newH = Math.max(MIN_HEIGHT, h + dy)
    }
    if (handle.includes('top') && handle !== 'top') {
      newH = Math.max(MIN_HEIGHT, h - dy)
      if (newH > MIN_HEIGHT) newY = py + dy
    }
    if (handle === 'top') {
      newH = Math.max(MIN_HEIGHT, h - dy)
      if (newH > MIN_HEIGHT) newY = py + dy
    }

    modalWidth.value = newW
    modalHeight.value = newH
    positionX.value = newX
    positionY.value = newY
  })
}

const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', doResize)
  window.removeEventListener('mouseup', stopResize)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', doDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', doResize)
  window.removeEventListener('mouseup', stopResize)
})
</script>

<template>
  <teleport to="body">
    <div
      ref="modalRef"
      class="draggable-modal-container"
      :class="{
        'is-maximized': isMaximized,
        'is-dragging': isDragging || isResizing,
        'is-ready': isReady,
        'is-animated': isAnimated,
        'is-disabled': disabled,
      }"
      :style="{
        top: positionY + 'px',
        left: positionX + 'px',
        zIndex: zIndex,
        width: isMaximized ? '100%' : modalWidth + 'px',
        height: isMaximized ? '100%' : (modalHeight > 0 ? modalHeight + 'px' : 'auto'),
      }"
      @mousedown.self="emit('activate')"
    >
      <template v-if="!isMaximized">
        <div class="resize-handle resize-top" @mousedown="startResize('top', $event)"></div>
        <div class="resize-handle resize-right" @mousedown="startResize('right', $event)"></div>
        <div class="resize-handle resize-bottom" @mousedown="startResize('bottom', $event)"></div>
        <div class="resize-handle resize-left" @mousedown="startResize('left', $event)"></div>
        <div class="resize-handle resize-top-left" @mousedown="startResize('top-left', $event)"></div>
        <div class="resize-handle resize-top-right" @mousedown="startResize('top-right', $event)"></div>
        <div class="resize-handle resize-bottom-left" @mousedown="startResize('bottom-left', $event)"></div>
        <div class="resize-handle resize-bottom-right" @mousedown="startResize('bottom-right', $event)"></div>
      </template>

      <div class="modal-header" @mousedown="!isMaximized && startDrag($event)">
        <slot name="header">Tiêu đề</slot>
        <div class="modal-controls">
          <button v-if="hasRefreshListener && !disabled" class="modal-control-button" @click="emit('refresh')">
            <IconRefresh />
          </button>
          <button class="modal-control-button" :disabled="disabled" @click="toggleMaximize">
            <IconMinimize v-if="isMaximized" />
            <IconMaximize v-else />
          </button>
          <button class="modal-control-button" @click="emit('close')">
            <IconClose />
          </button>
        </div>
      </div>
      <div class="modal-body" :class="{ 'pointer-events-none': disabled }">
        <slot name="body">Nội dung.</slot>
      </div>
      <div class="modal-footer" :class="{ 'is-footer-disabled': disabled }">
        <slot name="footer"></slot>
      </div>

      <div v-if="disabled" class="disabled-overlay"></div>
    </div>
  </teleport>
</template>

<style scoped>
.draggable-modal-container {
  position: fixed;
  min-height: 200px;
  min-width: 300px;
  max-height: 90vh;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
}
.draggable-modal-container.is-ready {
  opacity: 1;
}
.draggable-modal-container.is-animated {
  transition: all 0.2s ease-in-out;
}
.draggable-modal-container.is-dragging {
  transition: none;
}
.draggable-modal-container.is-maximized {
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  top: 0 !important;
  left: 0 !important;
  border-radius: 0;
  box-shadow: none;
  transform: none;
}

.draggable-modal-container.is-disabled {
  opacity: 0.7;
}

.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
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
  position: relative;
  z-index: 2;
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
.modal-control-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.modal-control-button:disabled:hover {
  color: #666;
  background-color: transparent;
}
.modal-body {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
  position: relative;
}
.modal-body.pointer-events-none {
  pointer-events: none;
  user-select: none;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 20px;
  border-top: 1px solid #e5e5e5;
  background-color: #f7f7f7;
  position: relative;
  z-index: 2;
}
.modal-footer.is-footer-disabled {
  pointer-events: none;
  opacity: 0.4;
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

.resize-handle {
  position: absolute;
  z-index: 10;
}
.resize-top {
  top: -3px;
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: n-resize;
}
.resize-bottom {
  bottom: -3px;
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: s-resize;
}
.resize-left {
  left: -3px;
  top: 8px;
  bottom: 8px;
  width: 6px;
  cursor: w-resize;
}
.resize-right {
  right: -3px;
  top: 8px;
  bottom: 8px;
  width: 6px;
  cursor: e-resize;
}
.resize-top-left {
  top: -4px;
  left: -4px;
  width: 12px;
  height: 12px;
  cursor: nw-resize;
}
.resize-top-right {
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  cursor: ne-resize;
}
.resize-bottom-left {
  bottom: -4px;
  left: -4px;
  width: 12px;
  height: 12px;
  cursor: sw-resize;
}
.resize-bottom-right {
  bottom: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  cursor: se-resize;
}
</style>
