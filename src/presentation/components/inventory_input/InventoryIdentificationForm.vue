<script setup>
import { ref, computed, reactive, watch } from 'vue'
import Button from '@components/ui/button/BaseButton.vue'
import Input from '@components/ui/input/BaseInput.vue'
import { useInputStore } from '@stores/input.store'
import { usePaginatedQuery } from '@composables/usePaginatedQuery'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'complete', 'close'])

const inputStore = useInputStore()
const currentStep = ref(1)

const localData = reactive({
  supplier: props.modelValue.supplier || null,
  model: props.modelValue.model || null,
  costPrice: props.modelValue.costPrice || 0,
  units: props.modelValue.units || []
})

// Step 1: Search Supplier & Product
const {
  data: suppliers,
  searchRefs: supplierSearchRefs,
} = usePaginatedQuery({
  queryKey: ['active-suppliers-lite'],
  queryFn: (params) => inputStore.searchSuppliers(params),
  itemsPerPage: 5,
})

const {
  data: products,
  searchRefs: productSearchRefs,
} = usePaginatedQuery({
  queryKey: ['vehicle-models-lite'],
  queryFn: (params) => inputStore.searchProducts({ ...params, categoryGroup: 'Vehicle' }),
  itemsPerPage: 5,
})

const nextStep = () => {
  if (currentStep.value < 4) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const addUnit = () => {
  localData.units.push({
    frameNo: '',
    engineNo: '',
    quality: 'New 100%',
    location: 'Showroom',
    keyCount: 2,
    notes: ''
  })
}

const removeUnit = (index) => {
  localData.units.splice(index, 1)
}

const handleComplete = () => {
  emit('complete', localData)
}

const selectSupplier = (s) => {
  localData.supplier = s
  supplierSearchRefs.search = s.name
}

const selectProduct = (p) => {
  localData.model = p
  productSearchRefs.search = p.name
}

const isDuplicate = (val, field, index) => {
  if (!val) return false
  return localData.units.some((u, i) => i !== index && u[field] === val)
}

watch(localData, (newVal) => {
  emit('update:modelValue', JSON.parse(JSON.stringify(newVal)))
}, { deep: true })

</script>

<template>
  <div class="flex flex-col h-full min-h-[500px]">
    <!-- Step Indicator -->
    <div class="flex items-center justify-between mb-8 px-4">
      <div v-for="step in 4" :key="step" class="flex items-center">
        <div 
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
            currentStep >= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
          ]"
        >
          {{ step }}
        </div>
        <div v-if="step < 4" :class="['w-12 h-1 mx-2 rounded', currentStep > step ? 'bg-red-600' : 'bg-gray-200']"></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <!-- Step 1: Tiếp nhận & Khởi tạo -->
      <div v-if="currentStep === 1" class="space-y-6">
        <h3 class="text-lg font-bold text-gray-800">Bước 1: Tiếp nhận & Khởi tạo</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <label class="block text-sm font-medium text-gray-700">Chọn Nhà cung cấp</label>
            <div class="relative">
              <Input v-model="supplierSearchRefs.search" placeholder="Tìm NCC..." />
              <div v-if="supplierSearchRefs.search && !localData.supplier" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <div v-for="s in suppliers" :key="s.id" @click="selectSupplier(s)" class="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0">
                  {{ s.name }}
                </div>
              </div>
            </div>
            <div v-if="localData.supplier" class="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              Đã chọn: <strong>{{ localData.supplier.name }}</strong>
            </div>
          </div>

          <div class="space-y-4">
            <label class="block text-sm font-medium text-gray-700">Chọn Dòng xe</label>
            <div class="relative">
              <Input v-model="productSearchRefs.search" placeholder="Tìm mẫu xe..." />
              <div v-if="productSearchRefs.search && !localData.model" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <div v-for="p in products" :key="p.id" @click="selectProduct(p)" class="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0">
                  {{ p.name }}
                </div>
              </div>
            </div>
            <div v-if="localData.model" class="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              Mẫu: <strong>{{ localData.model.name }}</strong>
            </div>
          </div>
        </div>
        <div class="max-w-xs">
          <Input label="Giá vốn nhập (VNĐ)" type="number" v-model="localData.costPrice" />
        </div>
      </div>

      <!-- Step 2: Định danh & Kiểm tra -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">Bước 2: Định danh & Kiểm tra (Số khung/máy)</h3>
          <Button text="Thêm xe (+)" color="primary" @click="addUnit" />
        </div>
        
        <div v-if="localData.units.length === 0" class="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
          Chưa có xe nào được thêm. Vui lòng nhấn "Thêm xe" hoặc quét mã QR.
        </div>

        <div v-for="(unit, index) in localData.units" :key="index" class="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
          <button @click="removeUnit(index)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
            ✕
          </button>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="space-y-1">
              <Input label="Số Khung" v-model="unit.frameNo" :class="{'border-red-500 bg-red-50': isDuplicate(unit.frameNo, 'frameNo', index)}" placeholder="Nhập hoặc quét QR" />
              <p v-if="isDuplicate(unit.frameNo, 'frameNo', index)" class="text-[10px] text-red-500 font-bold">⚠️ Số khung bị trùng lặp!</p>
            </div>
            <div class="space-y-1">
              <Input label="Số Máy" v-model="unit.engineNo" :class="{'border-red-500 bg-red-50': isDuplicate(unit.engineNo, 'engineNo', index)}" placeholder="Nhập hoặc quét QR" />
              <p v-if="isDuplicate(unit.engineNo, 'engineNo', index)" class="text-[10px] text-red-500 font-bold">⚠️ Số máy bị trùng lặp!</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Chất lượng</label>
              <select v-model="unit.quality" class="w-full p-2 border border-gray-300 rounded text-sm">
                <option>Mới 100%</option>
                <option>Trầy xước nhẹ</option>
                <option>Cũ/Đã qua sử dụng</option>
              </select>
            </div>
            <Input label="Số chìa khóa" type="number" v-model="unit.keyCount" />
          </div>
        </div>
      </div>

      <!-- Step 3: Phân bổ vị trí & Lưu kho -->
      <div v-if="currentStep === 3" class="space-y-6">
        <h3 class="text-lg font-bold text-gray-800">Bước 3: Phân bổ vị trí & Lưu kho</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100 border-b">
              <th class="p-3 text-left">Số Khung / Máy</th>
              <th class="p-3 text-left">Vị trí lưu kho</th>
              <th class="p-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(unit, index) in localData.units" :key="index" class="border-b">
              <td class="p-3">
                <div class="font-medium">{{ unit.frameNo || 'Chưa nhập' }}</div>
                <div class="text-xs text-gray-500">{{ unit.engineNo }}</div>
              </td>
              <td class="p-3">
                <select v-model="unit.location" class="p-1 border rounded text-xs">
                  <option>Khu trưng bày</option>
                  <option>Kho dự phòng</option>
                  <option>Kho xưởng dịch vụ</option>
                </select>
              </td>
              <td class="p-3">
                <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Available</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Step 4: Hoàn tất & Chốt sổ -->
      <div v-if="currentStep === 4" class="space-y-6">
        <h3 class="text-lg font-bold text-gray-800">Bước 4: Hoàn tất & Chốt sổ</h3>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p class="text-sm text-red-700 font-medium">
            Lưu ý: Sau khi nhấn "Hoàn tất", hệ thống sẽ tự động cộng kho và sinh Nhật ký nhập hàng không thể sửa xóa.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="p-4 border rounded-lg bg-gray-50">
            <div class="text-gray-500 mb-1">Nhà cung cấp</div>
            <div class="font-bold text-gray-800 text-lg">{{ localData.supplier?.name }}</div>
          </div>
          <div class="p-4 border rounded-lg bg-gray-50">
            <div class="text-gray-500 mb-1">Dòng xe</div>
            <div class="font-bold text-gray-800 text-lg">{{ localData.model?.name }}</div>
          </div>
          <div class="p-4 border rounded-lg bg-gray-50">
            <div class="text-gray-500 mb-1">Tổng số lượng</div>
            <div class="font-bold text-gray-800 text-lg">{{ localData.units.length }} xe</div>
          </div>
          <div class="p-4 border rounded-lg bg-gray-50">
            <div class="text-gray-500 mb-1">Tổng giá trị nhập</div>
            <div class="font-bold text-red-600 text-lg">{{ (localData.costPrice * localData.units.length).toLocaleString() }} VNĐ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-4 border-t border-gray-100 flex justify-between items-center">
      <Button text="Đóng" color="gray" @click="emit('close')" />
      <div class="flex gap-2">
        <Button v-if="currentStep > 1" text="Quay lại" color="secondary" @click="prevStep" />
        <Button v-if="currentStep < 4" text="Tiếp theo" color="primary" @click="nextStep" />
        <Button v-else text="Hoàn tất nhập kho" color="primary" @click="handleComplete" />
      </div>
    </div>
  </div>
</template>
