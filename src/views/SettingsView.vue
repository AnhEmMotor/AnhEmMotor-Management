<script setup>
import { useToast } from 'vue-toastification'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import settingService from '@application/services/setting.service'
import settingMapper from '@infrastructure/mappers/setting.mapper'
import SettingsForm from '@/components/settings/SettingsForm.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

const toast = useToast()
const queryClient = useQueryClient()

const { isPending: isLoading, data: settings } = useQuery({
  queryKey: ['settings'],
  queryFn: async () => {
    const data = await settingService.fetchSettings()
    return settingMapper.toModel(data)
  },
  staleTime: 1000 * 60 * 5,
})

const { isPending: isSaving, mutate: saveSettings } = useMutation({
  mutationFn: async (newSettings) => {
    const dto = settingMapper.toDTO(newSettings)
    const data = await settingService.updateSettings(dto)
    return settingMapper.toModel(data)
  },
  onSuccess: (updatedData) => {
    queryClient.setQueryData(['settings'], updatedData)
    toast.success('Đã lưu cài đặt thành công!')
  },
  onError: (error) => {
    toast.error(error.message || 'Lỗi khi lưu cài đặt')
  },
})

const handleSave = (newSettings) => {
  saveSettings(newSettings)
}

const handleReset = () => {
  queryClient.invalidateQueries({ queryKey: ['settings'] })
  toast.info('Đã khôi phục dữ liệu từ máy chủ')
}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex items-start justify-between mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-200"
    >
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Cài Đặt Bán Hàng</h1>
        <p class="text-gray-500 text-sm">
          Quản lý quy tắc đặt cọc, giới hạn đơn hàng và cảnh báo tồn kho
        </p>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonLoader height="320px" className="rounded-lg" />
        <div class="space-y-6">
          <SkeletonLoader height="180px" className="rounded-lg" />
          <SkeletonLoader height="220px" className="rounded-lg" />
        </div>
      </div>
    </template>

    <template v-else-if="settings">
      <SettingsForm
        :settings="settings"
        :isSaving="isSaving"
        @save="handleSave"
        @reset="handleReset"
      />
    </template>
  </div>
</template>




