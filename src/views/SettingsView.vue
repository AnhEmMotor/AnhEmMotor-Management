<script setup>
import { useToast } from 'vue-toastification'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import settingService from '@/services/setting.service'
import categoryService from '@/services/category.service'
import settingMapper from '@/mappers/setting.mapper'
import { useCategoryStore } from '@/stores/category.store'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import SettingsForm from '@/components/settings/SettingsForm.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

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

const {
  data: categories,
  isFetching: isFetchingCategories,
  searchRefs: categorySearchRefs,
  pagination: categoryPagination,
} = usePaginatedQuery({
  queryKey: ['categories-limits-v3'],
  queryFn: (query) => categoryStore.fetchCategories(query),
  itemsPerPage: 5,
  useLocalPagination: false,
  searchFields: [{ key: 'search', debounce: 400 }],
  queryOptions: { placeholderData: keepPreviousData },
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
        :pagination="categoryPagination"
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
