<script setup>
import { ref, watch } from 'vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BaseTextarea from '@/components/ui/input/BaseTextarea.vue'
import BaseDropdown from '@/components/ui/input/BaseDropdown.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:dirty'])

const localProduct = ref({})
const initialDataJson = ref('')

const categoryOptions = [
  { value: 'Xe Máy', text: 'Xe Máy' },
  { value: 'Phụ Kiện', text: 'Phụ Kiện' },
  { value: 'Phụ Tùng', text: 'Phụ Tùng' },
]

watch(
  () => props.modelValue,
  (newVal) => {
    const copy = JSON.parse(JSON.stringify(newVal || {}))
    localProduct.value = copy
    initialDataJson.value = JSON.stringify(copy)
    emit('update:dirty', false)
  },
  { immediate: true, deep: true },
)

watch(
  localProduct,
  (newVal) => {
    emit('update:modelValue', newVal)
    const isNowDirty = JSON.stringify(newVal) !== initialDataJson.value
    emit('update:dirty', isNowDirty)
  },
  { deep: true },
)
</script>

<template>
  <form @submit.prevent id="product-form">
    <div class="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput
          label="Mã Sản Phẩm *"
          v-model="localProduct.code"
          placeholder="Bắt buộc"
          required
          :readonly="isEditMode"
        />
        <BaseInput
          label="Tên Sản Phẩm *"
          v-model="localProduct.name"
          placeholder="Bắt buộc"
          required
        />
        <BaseDropdown
          label="Danh Mục *"
          v-model="localProduct.category"
          :options="categoryOptions"
          placeholder="Chọn Danh Mục"
          required
        />
        <BaseInput
          label="Giá Bán *"
          type="number"
          v-model.number="localProduct.price"
          placeholder="Nhập giá bán"
          required
          :min="0"
        />
        <BaseInput
          label="Giá Vốn *"
          type="number"
          v-model.number="localProduct.cost"
          placeholder="Nhập giá vốn"
          required
          :min="0"
        />
        <BaseInput
          label="Số Lượng *"
          type="number"
          v-model.number="localProduct.quantity"
          placeholder="Nhập số lượng"
          required
          :min="0"
        />
      </div>
      <BaseTextarea
        label="Mô Tả Sản Phẩm"
        v-model="localProduct.description"
        placeholder="Nhập mô tả..."
        :rows="3"
      />
    </div>
  </form>
</template>
