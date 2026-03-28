<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import InventoryInputForm from './InventoryInputForm.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import Button from '@/components/ui/button/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({ supplier: '', products: {} }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  onRefresh: {
    type: Function,
    default: undefined,
  },
})

const emit = defineEmits(['close', 'save', 'complete'])

const localData = ref({ ...props.data })
const showProductModal = ref(false)
const currentProductData = ref({
  code: '',
  name: '',
  category: '',
  price: 0,
  quantity: 1,
  unitPrice: 0,
})

watch(
  () => props.data,
  (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal))
  },
  { deep: true },
)

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  emit('save', localData.value)
}

const handleComplete = () => {
  emit('complete', localData.value)
}

const openProductModal = () => {
  currentProductData.value = {
    code: '',
    name: '',
    category: '',
    price: 0,
    quantity: 1,
    unitPrice: 0,
  }
  showProductModal.value.ref = true
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
}

const saveNewProduct = () => {
  if (!currentProductData.value.code || !currentProductData.value.name) {
    return
  }
  localData.value.products.push({
    id: Date.now() + Math.random(),
    code: currentProductData.value.code,
    name: currentProductData.value.name,
    quantity: currentProductData.value.quantity || 1,
    unitPrice: currentProductData.value.unitPrice || 0,
    total: (currentProductData.value.quantity || 1) * (currentProductData.value.unitPrice || 0),
  })
  closeProductModal()
}
</script>

<template>
  <div v-if="show">
    <DraggableModal
      :key="isEditMode ? `edit-${localData.id}` : 'new'"
      :z-index="1000"
      width="70vw"
      :disabled="showProductModal"
      :onRefresh="onRefresh"
      :isLoading="isLoading"
      @close="handleClose"
    >
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ isEditMode ? 'Chỉnh sửa phiếu nhập' : 'Tạo phiếu nhập hàng' }}
        </h3>
      </template>

      <template #body>
        <InventoryInputForm
          v-model="localData"
          :is-edit-mode="isEditMode"
          :errors="errors"
          @add-product="openProductModal"
        />
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <Button text="Hủy" color="gray" @click="handleClose" :disabled="isLoading" />
          <Button
            text="Lưu tạm"
            color="secondary"
            @click="handleSave"
            :loading="isLoading"
            :disabled="isLoading"
          />
          <Button
            text="Hoàn thành"
            color="primary"
            @click="handleComplete"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </div>
      </template>
    </DraggableModal>

    <DraggableModal v-if="showProductModal" :z-index="1001" width="72vw" @close="closeProductModal">
      <template #header>
        <h3 class="text-lg font-semibold">Thêm sản phẩm mới</h3>
      </template>

      <template #body>
        <ProductForm v-model="currentProductData" :is-edit-mode="false" />
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <Button text="Hủy" color="gray" @click="closeProductModal" />
          <Button text="Thêm sản phẩm" color="primary" @click="saveNewProduct" />
        </div>
      </template>
    </DraggableModal>
  </div>
</template>
