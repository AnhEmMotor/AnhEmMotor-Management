<script setup>
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import productService from '@application/services/product.service'
import axiosInstance from '@infrastructure/api/axios'
import { useToast } from 'vue-toastification'

import Button from '@/components/ui/button/BaseButton.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconDelete from '@/assets/icons/IconTrash.svg'

const queryClient = useQueryClient()
const toast = useToast()

const isModalVisible = ref(false)
const searchQuery = ref('')
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingId = ref(null)
const formValue = ref({ name: '' })

// Fetch Options and find VehicleType
const { data: optionsData, isLoading } = useQuery({
  queryKey: ['productAllOptions'],
  queryFn: () => productService.getOptions(),
  staleTime: 5 * 60 * 1000,
})

const vehicleTypeOption = computed(() => {
  const rawData = optionsData.value?.data || optionsData.value
  const options = Array.isArray(rawData) ? rawData : []
  return options.find(o => 
    o.name === 'VehicleType' || 
    o.name === 'Loại xe' || 
    o.name?.toLowerCase().includes('loại') ||
    o.name?.toLowerCase().includes('type')
  )
})

const vehicleTypes = computed(() => {
  const values = vehicleTypeOption.value?.values || vehicleTypeOption.value?.optionValues || []
  if (!searchQuery.value) return values
  return values.filter(v => v.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const openAddModal = () => {
  editingId.value = null
  formValue.value = { name: '' }
  isModalOpen.value = true
}

const openEditModal = (item) => {
  editingId.value = item.id
  formValue.value = { name: item.name }
  isModalOpen.value = true
}

const handleSave = async () => {
  if (!formValue.value.name.trim()) {
    toast.error('Vui lòng nhập tên loại xe')
    return
  }

  isSaving.value = true
  try {
    const payload = {
      optionId: vehicleTypeOption.value?.id || 0,
      name: formValue.value.name.trim()
    }

    if (editingId.value) {
      await productService.updateOptionValue(editingId.value, payload)
      toast.success('Cập nhật loại xe thành công')
    } else {
      await productService.createOptionValue(payload)
      toast.success('Thêm loại xe mới thành công')
    }

    await queryClient.invalidateQueries({ queryKey: ['productAllOptions'] })
    isModalOpen.value = false
  } catch (error) {
    console.error('Save error:', error)
    toast.error('Có lỗi xảy ra khi lưu dữ liệu')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa loại xe này?')) return

  try {
    await productService.deleteOptionValue(id)
    toast.success('Xóa loại xe thành công')
    await queryClient.invalidateQueries({ queryKey: ['productAllOptions'] })
  } catch (error) {
    console.error('Delete error:', error)
    toast.error('Có lỗi xảy ra khi xóa dữ liệu')
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý Loại xe</h1>
        <p class="text-gray-500 mt-1">Quản lý danh sách các dòng xe (Xe ga, Xe số, Tay côn...)</p>
      </div>
      <Button
        text="Thêm loại xe"
        :icon="IconPlus"
        color="primary"
        @click="openAddModal()"
      />
    </div>

    <div class="mb-6 max-w-md">
      <Input
        v-model="searchQuery"
        placeholder="Tìm kiếm loại xe..."
        type="text"
      />
    </div>

    <div class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50">
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tên loại xe</th>
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider w-32 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="isLoading">
            <td colspan="2" class="px-6 py-12 text-center text-gray-400">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="vehicleTypes.length === 0">
            <td colspan="2" class="px-6 py-12 text-center text-gray-400">Chưa có dữ liệu loại xe nào</td>
          </tr>
          <tr v-for="item in vehicleTypes" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4 font-medium text-gray-800">{{ item.name }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditModal(item)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Sửa"
                >
                  <IconEdit class="w-5 h-5" />
                </button>
                <button
                  @click="handleDelete(item.id)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <IconDelete class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">{{ editingId ? 'Sửa loại xe' : 'Thêm loại xe mới' }}</h2>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tên loại xe <span class="text-red-500">*</span></label>
            <Input
              v-model="formValue.name"
              placeholder="VD: Xe tay ga"
              @keyup.enter="handleSave"
            />
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50/50 flex justify-end gap-3">
          <Button text="Hủy" color="secondary" @click="isModalOpen = false" />
          <Button
            :text="editingId ? 'Cập nhật' : 'Lưu lại'"
            color="primary"
            :loading="isSaving"
            @click="handleSave"
          />
        </div>
      </div>
    </div>
  </div>
</template>
