<template>
  <DraggableModal width="600px" @close="$emit('close')" :onRefresh="handleRefresh">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">Gán vai trò cho người dùng</h3>
    </template>
    <template #body>
      <LoadingOverlay :show="isSaving || isLoading" />
      <div class="space-y-4">
        <!-- Search bar for roles -->
        <Input
          v-model="searchRefs.roleName"
          placeholder="Tìm kiếm vai trò..."
          class="mb-2"
          :icon="IconSearch"
        />

        <div class="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
          <table class="min-w-full bg-white divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Chọn
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tên vai trò
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="role in roles" :key="role.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-2">
                  <input
                    type="checkbox"
                    :value="role.id"
                    v-model="selectedRoleIds"
                    class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </td>
                <td class="px-4 py-2 font-medium text-gray-900">{{ role.name }}</td>
              </tr>
              <tr v-if="roles.length === 0 && !isLoading">
                <td colspan="2" class="px-4 py-4 text-center text-gray-500">
                  Không tìm thấy vai trò nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end items-center text-sm text-gray-500">
          <BasePagination
            v-if="pagination.totalPages.value > 1"
            :current-page="pagination.currentPage.value"
            :total-pages="pagination.totalPages.value"
            @page-changed="pagination.changePage"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton text="Hủy" color="secondary" @click="$emit('close')" />
        <BaseButton text="Lưu thay đổi" color="primary" :loading="isSaving" @click="handleSave" />
      </div>
    </template>
  </DraggableModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import IconSearch from '@/assets/icons/search.svg'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { fetchRoles } from '@/api/role'
import { useQueryClient } from '@tanstack/vue-query'

const props = defineProps({
  show: Boolean,
  userId: String,
  isSaving: Boolean,
  initialRoles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save', 'refresh'])
const queryClient = useQueryClient()

const selectedRoleIds = ref([])

// Sử dụng usePaginatedQuery để quản lý danh sách vai trò
// Lưu ý: Backend fetchRoles hiện tại trả về mảng phẳng, ta bọc lại để dùng với pagination local
const fetchRolesWrapper = async (params) => {
  return fetchRoles(params)
}

const {
  data: roles,
  isFetching,
  searchRefs,
  pagination,
} = usePaginatedQuery({
  queryKey: ['roles_list_modal'],
  queryFn: fetchRolesWrapper,
  itemsPerPage: 10,
  useLocalPagination: true,
  searchFields: [{ key: 'name', debounce: 300 }],
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      selectedRoleIds.value = (props.initialRoles || []).map((id) => id.toLowerCase())
    }
  },
  { immediate: true },
)

const handleRefresh = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['roles_list_modal'] }),
    queryClient.invalidateQueries({ queryKey: ['user', props.userId] }),
  ])
  emit('refresh', props.userId)
}

const handleSave = () => {
  emit('save', { roleIds: selectedRoleIds.value })
}
</script>
