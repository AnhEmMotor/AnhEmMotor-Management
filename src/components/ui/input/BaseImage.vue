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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
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
        isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-gray-400',
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
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="mt-2 text-sm text-gray-600">
          <span class="font-medium text-purple-600">Nhấn để chọn</span> hoặc kéo thả ảnh vào đây
        </p>
        <p class="text-xs text-gray-500">PNG, JPG, GIF (TỐI ĐA 5MB)</p>
        <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
      </div>
    </div>

    <input type="file" ref="fileInput" @change="onFileSelected" class="hidden" accept="image/*" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import * as storageApi from '@/api/supabaseStorage'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])
const store = useStore()
const bucketName = 'cover'

const isDragging = ref(false)
const isLoading = ref(false)
const fileInput = ref(null)
const error = ref('')
const initialImageUrl = ref(props.modelValue)

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// === SỬA LỖI: Loại bỏ điều kiện IF để luôn đồng bộ ===
watch(
  () => props.modelValue,
  (newVal) => {
    // Luôn cập nhật initialImageUrl khi modelValue thay đổi
    initialImageUrl.value = newVal
  },
  { immediate: true },
)
// =======================================================================

const openFilePicker = () => {
  if (isLoading.value) return
  error.value = ''
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
  error.value = ''
  if (!file.type.startsWith('image/')) {
    error.value = 'Chỉ chấp nhận file hình ảnh.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Lỗi: Ảnh nặng hơn 5MB.'
    return
  }

  uploadHandler(file)
}

const uploadHandler = async (file) => {
  isLoading.value = true
  error.value = ''

  try {
    // 1. Xóa ảnh cũ (Nếu tồn tại và không phải placeholder)
    if (
      initialImageUrl.value &&
      initialImageUrl.value !== localValue.value &&
      !initialImageUrl.value.includes('placehold.co')
    ) {
      await store.dispatch('products/deleteProductImage', {
        url: initialImageUrl.value,
        bucket: bucketName,
      })
    }

    // 2. Upload file mới -> Lấy path
    const filePath = await storageApi.uploadFile(file, bucketName)

    // 3. Lấy Public URL từ path
    const publicUrl = storageApi.getPublicUrl(filePath, bucketName)

    // 4. Cập nhật giá trị bằng Public URL
    localValue.value = publicUrl
    initialImageUrl.value = publicUrl // Đặt URL mới làm URL ban đầu
  } catch (apiError) {
    console.error('API Upload Error:', apiError)
    error.value = `Lỗi upload: ${apiError.message}`
  } finally {
    isLoading.value = false
  }
}

const clearImage = async () => {
  // 1. Xóa ảnh khỏi Storage (Nếu có URL)
  if (localValue.value && !localValue.value.includes('placehold.co')) {
    await store.dispatch('products/deleteProductImage', {
      url: localValue.value,
      bucket: bucketName,
    })
  }

  // 2. Reset giá trị trong Form
  localValue.value = ''
  initialImageUrl.value = ''
  error.value = ''

  if (fileInput.value) {
    fileInput.value.value = null
  }
}
</script>
