<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      @click.self="handleClose"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-3 border-b flex-shrink-0">
          <h2 class="text-base font-semibold text-gray-800">Tạo hàng hóa</h2>
          <button @click="handleClose" class="text-gray-400 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleSave" class="p-4 overflow-y-auto">
          <div class="grid grid-cols-3 gap-5">
            <!-- Left Column - Main Info -->
            <div class="col-span-2 space-y-4">
              <!-- Item Name -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Tên hàng <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  v-model="formData.name"
                  placeholder="Bắt buộc"
                  class="form-input border-red-400"
                  required
                />
              </div>

              <!-- Group and Brand -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    Nhóm hàng <span class="text-red-500">*</span>
                  </label>
                  <select v-model="formData.group" class="form-input" required>
                    <option value="">Chọn nhóm hàng</option>
                    <option value="Xe máy">Xe máy</option>
                    <option value="Phụ tùng">Phụ tùng</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Thương hiệu</label>
                  <select v-model="formData.brand" class="form-input">
                    <option value="">Chọn thương hiệu</option>
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Suzuki">Suzuki</option>
                  </select>
                </div>
              </div>

              <!-- Selling Price Section -->
              <div class="border rounded-md">
                <div class="p-3 border-b bg-gray-50">
                  <h3 class="text-sm font-semibold">Giá bán</h3>
                </div>
                <div class="p-3 space-y-2">
                  <label class="block text-xs font-medium text-gray-600">Giá bán</label>
                  <input
                    type="text"
                    :value="formatNumber(formData.sellingPrice)"
                    @input="updateSellingPrice"
                    class="form-input w-full text-right"
                  />
                </div>
              </div>

              <!-- Inventory Section -->
              <div class="border rounded-md">
                <div class="p-3 border-b bg-gray-50">
                  <h3 class="text-sm font-semibold">Tồn kho</h3>
                </div>
                <div class="p-3 grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Tồn kho ban đầu</label>
                    <input
                      type="text"
                      :value="formatNumber(formData.initialStock)"
                      @input="updateInitialStock"
                      class="form-input text-right"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Đơn vị tính</label>
                    <input
                      type="text"
                      v-model="formData.unit"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Images -->
            <div class="col-span-1">
              <div class="border rounded-md p-3 space-y-3 bg-gray-50 h-full">
                <input
                  type="file"
                  ref="imageInput"
                  multiple
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
                
                <div class="image-preview-container">
                  <div
                    v-for="(image, index) in previewImages"
                    :key="index"
                    class="image-preview-item"
                  >
                    <img v-if="image" :src="image" alt="Preview" />
                    <div v-else class="image-preview-placeholder">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  @click="$refs.imageInput.click()"
                  class="w-full bg-white border border-gray-300 text-gray-700 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-100"
                >
                  Thêm ảnh
                </button>
                <p class="text-xs text-center text-gray-500">Mỗi ảnh không quá 2 MB</p>
              </div>
            </div>
          </div>
        </form>

        <!-- Modal Footer -->
        <div class="flex justify-between items-center p-3 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
          <div></div>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              @click="handleClose"
              class="text-sm bg-white border border-gray-300 text-gray-700 font-semibold py-1.5 px-4 rounded-md hover:bg-gray-100"
            >
              Bỏ qua
            </button>
            <button
              type="button"
              @click="handleSave"
              class="text-sm bg-red-600 text-white font-semibold py-1.5 px-4 rounded-md hover:bg-red-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { formatNumber } from '@/utils/formatters';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const isVisible = ref(props.modelValue);
const imageInput = ref(null);

const formData = ref({
  name: '',
  group: '',
  brand: '',
  sellingPrice: 0,
  initialStock: 0,
  unit: 'Cái'
});

const previewImages = ref([null, null, null]);

watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal;
  if (!newVal) {
    resetForm();
  }
});

function updateSellingPrice(event) {
  const value = event.target.value.replace(/[^0-9]/g, '');
  const numValue = value ? parseInt(value, 10) : 0;
  formData.value.sellingPrice = numValue;
  event.target.value = formatNumber(numValue);
}

function updateInitialStock(event) {
  const value = event.target.value.replace(/[^0-9]/g, '');
  const numValue = value ? parseInt(value, 10) : 0;
  formData.value.initialStock = numValue;
  event.target.value = formatNumber(numValue);
}

function handleImageUpload(event) {
  const files = Array.from(event.target.files).slice(0, 3);
  previewImages.value = [null, null, null];
  
  files.forEach((file, index) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh không được vượt quá 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value[index] = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function handleSave() {
  if (!formData.value.name || !formData.value.group) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    return;
  }

  emit('save', {
    name: formData.value.name,
    unit: formData.value.unit,
    quantity: formData.value.initialStock,
    sellingPrice: formData.value.sellingPrice
  });

  handleClose();
}

function handleClose() {
  emit('update:modelValue', false);
}

function resetForm() {
  formData.value = {
    name: '',
    group: '',
    brand: '',
    sellingPrice: 0,
    initialStock: 0,
    unit: 'Cái'
  };
  previewImages.value = [null, null, null];
}
</script>