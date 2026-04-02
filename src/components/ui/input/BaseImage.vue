<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <div
      v-if="localValue"
      class="mt-2 relative w-full h-48 border border-gray-300 rounded-md overflow-hidden"
    >
      <img :src="localValue" alt="Image preview" class="w-full h-full object-cover" />
      <button
        @click="clearImage"
        type="button"
        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600 focus:outline-none"
      >
        <IconCloseLine class="h-4 w-4" />
      </button>
    </div>

    <div
      v-else
      @click="openFilePicker"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="[
        'mt-2 relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer transition-colors',
        isDragging
          ? 'border-purple-600 bg-purple-50'
          : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400',
        isLoading ? 'pointer-events-none' : '',
      ]"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
      >
        <svg
          class="animate-spin h-8 w-8 text-purple-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      <div class="text-center p-4">
        <IconImagePlaceholder class="mx-auto h-12 w-12 text-gray-400" />
        <p class="mt-2 text-sm text-gray-600">
          <span class="font-medium text-purple-600">Nhấn để chọn</span> hoặc kéo thả ảnh vào đây
        </p>
        <p class="text-xs text-gray-500">PNG, JPG, GIF (TỐI ĐA 5MB)</p>
        <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
      </div>
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>

    <input type="file" ref="fileInput" @change="onFileSelected" class="hidden" accept="image/*" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import productService from '@/services/product.service'
import IconImagePlaceholder from '@/assets/icons/image-placeholder.svg'
import IconCloseLine from '@/assets/icons/close-line.svg'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const isDragging = ref(false)
const isLoading = ref(false)
const fileInput = ref(null)
const uploadError = ref('')
const initialImageUrl = ref(props.modelValue)

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

watch(
  () => props.modelValue,
  (newVal) => {
    initialImageUrl.value = newVal
  },
  { immediate: true },
)

const openFilePicker = () => {
  if (isLoading.value) return
  uploadError.value = ''
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const onDragOver = () => {
  if (!isLoading.value) {
    isDragging.value = true
  }
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (event) => {
  if (isLoading.value) return
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file) => {
  uploadError.value = ''
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Chỉ chấp nhận file hình ảnh.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'Lỗi: Ảnh nặng hơn 5MB.'
    return
  }

  uploadHandler(file)
}

const uploadHandler = async (file) => {
  isLoading.value = true
  uploadError.value = ''

  try {
    const response = await productService.uploadImage(file)
    localValue.value = response.publicUrl
    initialImageUrl.value = response.publicUrl
  } catch (apiError) {
    uploadError.value = `Lỗi upload: ${apiError.message}`
  } finally {
    isLoading.value = false
    if (fileInput.value) {
      fileInput.value.value = null
    }
  }
}

const clearImage = () => {
  localValue.value = ''
  initialImageUrl.value = ''
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = null
  }
}
</script>
