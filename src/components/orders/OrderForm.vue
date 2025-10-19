<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  zIndex: { type: Number, default: 100 },
})
const emit = defineEmits(['close', 'save', 'activate'])

const customerName = ref('')
const productName = ref('')
const price = ref(0)

watch(
  () => props.show,
  (val) => {
    if (!val) {
      // reset
      customerName.value = ''
      productName.value = ''
      price.value = 0
    }
  },
)

function submit() {
  if (!customerName.value || !productName.value) {
    alert('Vui lòng nhập tên khách hàng và tên sản phẩm')
    return
  }
  emit('save', {
    customerName: customerName.value,
    productName: productName.value,
    price: Number(price.value) || 0,
  })
}
</script>

<template>
  <DraggableModal v-if="show" :zIndex="zIndex" @close="$emit('close')" @activate="$emit('activate')">
    <template #header>
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold">Tạo Đơn Mới</h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Tên khách hàng</label>
          <input v-model="customerName" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Tên sản phẩm</label>
          <input v-model="productName" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Giá (VNĐ)</label>
          <input v-model.number="price" type="number" class="w-full border rounded px-3 py-2" />
        </div>
      </div>
    </template>

    <template #footer>
      <button class="px-4 py-2 border rounded" @click="$emit('close')">Huỷ</button>
      <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="submit">Lưu</button>
    </template>
  </DraggableModal>
</template>

<style scoped>
.w-full {
  width: 100%;
}
</style>
