<script setup>
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import productService from '@application/services/product.service'
import { useToast } from 'vue-toastification'

import Button from '@components/ui/button/BaseButton.vue'
import Input from '@components/ui/input/BaseInput.vue'
import BaseImage from '@components/ui/input/BaseImage.vue'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconDelete from '@/assets/icons/IconTrash.svg'

const queryClient = useQueryClient()
const toast = useToast()

const searchQuery = ref('')
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingId = ref(null)
const formValue = ref({ 
  name: '', 
  description: '', 
  imageUrl: '', 
  seoTitle: '', 
  seoDescription: '', 
  isActive: true 
})

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
  formValue.value = { 
    name: '', 
    description: '', 
    imageUrl: '', 
    seoTitle: '', 
    seoDescription: '', 
    isActive: true 
  }
  isModalOpen.value = true
}

const openEditModal = (item) => {
  editingId.value = item.id
  formValue.value = { 
    name: item.name,
    description: item.description || '',
    imageUrl: item.imageUrl || '',
    seoTitle: item.seoTitle || '',
    seoDescription: item.seoDescription || '',
    isActive: item.isActive ?? true,
    colorCode: item.colorCode // Preserve if exists
  }
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
      ...formValue.value,
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
const handleNameInput = () => {
  if (!editingId.value) {
    formValue.value.seoTitle = formValue.value.name
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
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider w-20">Icon</th>
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tên loại xe</th>
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Mô tả</th>
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Sản phẩm</th>
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Trạng thái</th>
            <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider w-32 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="isLoading">
            <td colspan="5" class="px-6 py-12 text-center text-gray-400">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="vehicleTypes.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-400">Chưa có dữ liệu loại xe nào</td>
          </tr>
          <tr v-for="item in vehicleTypes" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4">
              <div class="w-10 h-10 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full h-full object-cover" />
                <span v-else class="text-[10px] text-gray-400 italic text-center">No Icon</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="font-bold text-gray-800">{{ item.name }}</div>
              <div class="text-[10px] text-blue-500 font-mono" v-if="item.seoTitle">{{ item.seoTitle }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :title="item.description">
              {{ item.description || 'Chưa có mô tả' }}
            </td>
            <td class="px-6 py-4 text-center">
              <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                {{ item.productCount || 0 }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span 
                class="px-2 py-1 rounded-full text-[10px] font-bold uppercase"
                :class="item.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'"
              >
                {{ item.isActive ? 'Kinh doanh' : 'Tạm ẩn' }}
              </span>
            </td>
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
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">{{ editingId ? 'Sửa loại xe' : 'Thêm loại xe mới' }}</h2>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <!-- Left Side: Basic Info -->
            <div class="col-span-2 sm:col-span-1 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tên loại xe <span class="text-red-500">*</span></label>
                <Input
                  v-model="formValue.name"
                  placeholder="VD: Xe tay ga"
                  @input="handleNameInput"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả đặc điểm</label>
                <textarea
                  v-model="formValue.description"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none h-24 resize-none"
                  placeholder="Nhập đặc điểm loại xe để tư vấn khách hàng..."
                />
              </div>

              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="vtype-active" 
                  v-model="formValue.isActive"
                  class="w-4 h-4 text-blue-600 rounded"
                >
                <label for="vtype-active" class="text-sm font-bold text-gray-700 cursor-pointer">Cho phép kinh doanh</label>
              </div>
            </div>

            <!-- Right Side: Visual & SEO -->
            <div class="col-span-2 sm:col-span-1 space-y-4">
              <div>
                <BaseImage
                  label="Biểu tượng (Icon)"
                  v-model="formValue.imageUrl"
                />
              </div>

              <div class="bg-blue-50 p-4 rounded-xl space-y-3">
                <h3 class="text-xs font-bold text-blue-700 uppercase tracking-wider">Cấu hình SEO Meta</h3>
                <div>
                  <label class="block text-[10px] font-bold text-blue-600 mb-1 uppercase">SEO Title</label>
                  <Input v-model="formValue.seoTitle" placeholder="Tiêu đề hiển thị Google..." />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-blue-600 mb-1 uppercase">SEO Description</label>
                  <textarea
                    v-model="formValue.seoDescription"
                    class="w-full border border-blue-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-blue-400 outline-none h-16 resize-none"
                    placeholder="Mô tả ngắn cho Google..."
                  />
                </div>
              </div>
            </div>
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

