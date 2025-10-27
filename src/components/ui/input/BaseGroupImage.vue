<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <div
      @click="openFilePicker"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="[
        'mt-2 relative flex flex-col justify-center items-center w-full min-h-[10rem] border-2 border-dashed rounded-md cursor-pointer transition-colors',
        isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-gray-400',
        isLoading ? 'pointer-events-none' : '',
      ]"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-md"
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
          class="mx-auto h-10 w-10 text-gray-400"
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
          <span class="font-medium text-purple-600">Nhấn để chọn</span> hoặc kéo thả (nhiều) ảnh vào
          đây
        </p>
        <p class="text-xs text-gray-500">PNG, JPG, GIF (TỐI ĐA 5MB / ảnh)</p>
        <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      @change="onFileSelected"
      class="hidden"
      accept="image/*"
      multiple
    />

    <div
      v-if="localValue && localValue.length > 0"
      class="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
    >
      <div
        v-for="(url, index) in localValue"
        :key="index"
        class="relative w-full aspect-square border border-gray-200 rounded-md overflow-hidden shadow-sm"
      >
        <img :src="url" alt="Preview" class="w-full h-full object-cover" />
        <button
          @click="removeImage(index)"
          type="button"
          class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 leading-none hover:bg-red-600 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadFile, getPublicUrl, deleteFile } from '@/api/supabaseStorage'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  bucket: {
    type: String,
    default: 'photo-collection',
  },
})

const emit = defineEmits(['update:modelValue'])

const isDragging = ref(false)
const isLoading = ref(false)
const fileInput = ref(null)
const error = ref('')
const currentPaths = ref([])

const localValue = computed({
  get: () => props.modelValue || [],
  set: (value) => {
    emit('update:modelValue', value)
  },
})

const openFilePicker = () => {
  if (isLoading.value) return
  error.value = ''
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    processFiles(files)
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
  const files = event.dataTransfer.files
  if (files && files.length > 0) {
    processFiles(files)
  }
}

const processFiles = (files) => {
  error.value = ''
  let hadError = false
  const imageFiles = Array.from(files).filter((file) => {
    if (!file.type.startsWith('image/')) {
      hadError = true
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      console.warn(`Bỏ qua file ${file.name} vì quá nặng.`)
      hadError = true
      return false
    }
    return true
  })

  if (imageFiles.length === 0 && files.length > 0) {
    error.value = 'Tất cả file đều bị bỏ qua (không phải ảnh hoặc quá 5MB).'
    return
  }

  if (hadError) {
    error.value = 'Một số file bị bỏ qua (không phải ảnh hoặc quá 5MB).'
  }

  if (imageFiles.length > 0) {
    uploadFilesHandler(imageFiles)
  }

  if (fileInput.value) {
    fileInput.value.value = null
  }
}

const uploadFilesHandler = async (files) => {
  isLoading.value = true

  const uploadSingleFile = async (file) => {
    const path = await uploadFile(file, props.bucket)
    const url = getPublicUrl(path, props.bucket)
    return { url, path }
  }

  try {
    const uploadPromises = files.map((file) => uploadSingleFile(file))
    const results = await Promise.all(uploadPromises)

    const newUrls = results.map((r) => r.url)
    const newPaths = results.map((r) => r.path)

    localValue.value = [...localValue.value, ...newUrls]
    currentPaths.value = [...currentPaths.value, ...newPaths]
  } catch (apiError) {
    console.error('API Upload Error:', apiError)
    error.value = `Lỗi upload: ${apiError.message}`
  } finally {
    isLoading.value = false
  }
}

const removeImage = async (index) => {
  const newArray = [...localValue.value]
  const newPaths = [...currentPaths.value]

  const urlToRemove = newArray[index]
  const pathToRemove = newPaths[index]

  newArray.splice(index, 1)
  newPaths.splice(index, 1)

  localValue.value = newArray
  currentPaths.value = newPaths

  if (pathToRemove) {
    try {
      await deleteFile(pathToRemove, props.bucket)
    } catch (deleteError) {
      console.error('Lỗi khi xóa file:', deleteError)
      error.value = 'Lỗi khi xóa ảnh cũ khỏi server.'
    }
  }
}
</script>
