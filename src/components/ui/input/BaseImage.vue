<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <!-- Vùng hiển thị ảnh (nếu có) -->
    <div
      v-if="localValue"
      class="mt-2 relative w-full h-48 border border-gray-300 rounded-md overflow-hidden"
    >
      <img :src="localValue" alt="Image preview" class="w-full h-full object-cover" />
      <!-- Nút Xóa ảnh -->
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

    <!-- Vùng kéo thả (nếu chưa có ảnh) -->
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
      <!-- Lớp phủ Loading Spinner -->
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

      <!-- Nội dung kéo thả -->
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

    <!-- Input file ẩn -->
    <input type="file" ref="fileInput" @change="onFileSelected" class="hidden" accept="image/*" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const isDragging = ref(false)
const isLoading = ref(false) // Thêm trạng thái loading
const fileInput = ref(null)
const error = ref('')

const localValue = computed({
  get: () => props.modelValue,
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

// 1. Hàm XỬ LÝ FILE (Validation)
const processFile = (file) => {
  error.value = ''
  if (!file.type.startsWith('image/')) {
    error.value = 'Chỉ chấp nhận file hình ảnh.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    // 5MB
    error.value = 'Lỗi: Ảnh nặng hơn 5MB.'
    return // Chặn file nặng
  }

  // Nếu file hợp lệ, gọi hàm upload
  uploadHandler(file)
}

// 2. Hàm UPLOAD (Đây là nơi bạn sẽ sửa)
const uploadHandler = async (file) => {
  isLoading.value = true
  error.value = ''

  // =================================================================
  // === LOGIC UPLOAD HIỆN TẠI (CHUYỂN SANG BASE64 ĐỂ DEMO) =========
  // =================================================================
  // Sau này bạn SẼ XÓA/COMMENT phần này
  const reader = new FileReader()
  reader.onload = (e) => {
    localValue.value = e.target.result // Emit chuỗi Base64
    isLoading.value = false
  }
  reader.onerror = (e) => {
    error.value = 'Đã xảy ra lỗi khi đọc file.'
    console.error('FileReader error:', e)
    isLoading.value = false
  }
  reader.readAsDataURL(file)
  // === KẾT THÚC LOGIC BASE64 ========================================

  /*
  // =================================================================
  // === VÍ DỤ LOGIC UPLOAD BẰNG API THẬT (SAU NÀY BẠN MỞ RA) =======
  // =================================================================
  try {
    // 1. (Tùy chọn) Tạo FormData
    const formData = new FormData();
    formData.append('image', file); // 'image' là key mà API mong đợi
    formData.append('productId', 'id_san_pham_nao_do'); // Gửi thêm data (nếu cần)

    // 2. Gọi API upload
    // Thay thế '/api/upload-image' bằng URL API thật của bạn
    const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        // headers: {
        //   'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`, // Thêm token (nếu cần)
        // }
    });

    if (!response.ok) {
        // Ném lỗi nếu server trả về 4xx, 5xx
        const errData = await response.json();
        throw new Error(errData.message || `Lỗi ${response.status}`);
    }

    // 3. Nhận kết quả
    const result = await response.json();
    
    // 4. Lấy URL từ server trả về và emit
    if (result.url) {
        localValue.value = result.url; // Emit URL thật từ server
        error.value = '';
    } else {
        throw new Error('Server không trả về URL ảnh.');
    }

  } catch (apiError) {
      console.error("API Upload Error:", apiError);
      error.value = `Lỗi upload: ${apiError.message}`;
  } finally {
      isLoading.value = false;
  }
  // === KẾT THÚC VÍ DỤ API ===========================================
  */
}

const clearImage = () => {
  localValue.value = ''
  error.value = ''
  // Reset input file để có thể chọn lại cùng 1 file
  if (fileInput.value) {
    fileInput.value.value = null
  }
}
</script>
