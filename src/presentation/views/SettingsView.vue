<script setup>
import { reactive, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import settingService from '@application/services/setting.service'
import categoryService from '@application/services/category.service'
import settingMapper from '@infrastructure/mappers/setting.mapper'
import { useCategoryStore } from '@stores/category.store'
import SettingsForm from '@components/settings/SettingsForm.vue'
import SkeletonLoader from '@components/ui/SkeletonLoader.vue'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'

const toast = useToast()
const queryClient = useQueryClient()
const categoryStore = useCategoryStore()

const { isPending: isLoadingSettings, data: settings } = useQuery({
  queryKey: ['settings'],
  queryFn: async () => {
    const data = await settingService.fetchSettings()
    return settingMapper.toModel(data)
  },
})

const { data: rawCategories, isPending: isFetchingCategories } = useQuery({
  queryKey: ['categoriesAllSettings'],
  queryFn: () => categoryStore.getAllCategories(),
})

const categorySearchRefs = reactive({ search: '' })

const categories = computed(() => {
  if (!rawCategories.value) return []
  const search = categorySearchRefs.search.toLowerCase()
  if (!search) return rawCategories.value
  return rawCategories.value.filter(c => 
    c.name.toLowerCase().includes(search) || 
    c.description?.toLowerCase().includes(search)
  )
})

const { isPending: isSavingSettings, mutate: saveSettings } = useMutation({
  mutationFn: async (dto) => {
    return await settingService.updateSettings(dto)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['settings'] })
    toast.success('Cập nhật cài đặt hệ thống thành công!')
  },
  onError: (error) => toast.error(error.message || 'Lỗi khi lưu cài đặt'),
})

const { isPending: isSavingCategory, mutate: saveCategoryLimit } = useMutation({
  mutationFn: async ({ id, limit, name, description }) => {
    return await categoryService.updateCategory(id, {
      name,
      description,
      maxPurchaseQuantity: limit,
    })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categories-limits'] })
    toast.success('Cập nhật giới hạn thể loại thành công!')
  },
  onError: (error) => toast.error(error.message || 'Lỗi khi cập nhật giới hạn'),
})

const handleSaveDeposit = (depositData) => {
  saveSettings({
    Order_value_exceeds: depositData.maxOrder.toString(),
    Deposit_ratio: depositData.deposit.toString(),
  })
}

const handleSaveStock = (stockLevel) => {
  saveSettings({
    Inventory_alert_level: stockLevel.toString(),
  })
}

const handleSaveCategoryLimit = (category) => {
  saveCategoryLimit({
    id: category.id,
    limit: category.maxPurchaseQuantity,
    name: category.name,
    description: category.description,
  })
}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay :show="isSavingSettings || isSavingCategory" message="Đang xử lý yêu cầu..." />

    <div
      class="flex items-start justify-between mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-200"
    >
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Cài Đặt Bán Hàng</h1>
        <p class="text-gray-500 text-sm">
          Quản lý quy tắc đặt cọc, giới hạn đơn hàng theo thể loại và cảnh báo tồn kho
        </p>
      </div>
    </div>

    <template v-if="isLoadingSettings && !settings">
      <div class="space-y-8">
        <SkeletonLoader height="200px" className="rounded-lg" />
        <SkeletonLoader height="400px" className="rounded-lg" />
      </div>
    </template>

    <template v-else-if="settings">
      <SettingsForm
        :settings="settings"
        :categories="categories"
        :searchRefs="categorySearchRefs"
        :isSavingSettings="isSavingSettings"
        :isSavingCategory="isSavingCategory"
        :isFetchingCategories="isFetchingCategories"
        @update:search="val => categorySearchRefs.search = val"
        @saveDeposit="handleSaveDeposit"
        @saveStock="handleSaveStock"
        @saveCategoryLimit="handleSaveCategoryLimit"
      />
    </template>
  </div>
</template>
