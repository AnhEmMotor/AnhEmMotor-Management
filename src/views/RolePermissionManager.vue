<script setup>
import Input from '@/components/ui/input/BaseInput.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRoleStore } from '@/stores/role.store'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import Button from '@/components/ui/button/BaseButton.vue'
import RoleList from '@/components/roles/RoleList.vue'
import RoleForm from '@/components/roles/RoleForm.vue'
import RoleDeleteModal from '@/components/roles/RoleDeleteModal.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import IconSearch from '@/assets/icons/search.svg'

const toast = useToast()
const queryClient = useQueryClient()
const roleStore = useRoleStore()

const showRoleForm = ref(false)
const showDeleteModal = ref(false)
const selectedRole = ref(null)
const isEditMode = ref(false)
const modalZIndex = ref(100)
const activeModalId = ref(null)
const isFetchingDetail = ref(false)

const { data: permissionStructure } = useQuery({
  queryKey: ['permissionStructure'],
  queryFn: () => roleStore.fetchPermissionStructure(),
  staleTime: Infinity,
})

const availablePermissions = computed(() => permissionStructure.value?.list || [])

const fetchRolesWrapper = async (params) => {
  return await roleStore.fetchRoles(params)
}

const {
  data: roles,
  isLoading,
  isError,
  error,
  pagination,
  searchRefs,
} = usePaginatedQuery({
  queryKey: ['roles'],
  queryFn: fetchRolesWrapper,
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
})

const errorMessage = computed(() => error.value?.message || 'Lỗi tải dữ liệu vai trò')

const displayRoles = computed(() => roles.value || [])

const handleExport = () => {
  toast.info('Chức năng xuất Excel đang phát triển')
}

const handleImport = (event) => {
  toast.info('Chức năng nhập Excel đang phát triển')
  event.target.value = ''
}

const deleteRoleMutation = useMutation({
  mutationFn: (id) => roleStore.deleteRole(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    toast.success('Xóa vai trò thành công')
    showDeleteModal.value = false
    selectedRole.value = null
  },
  onError: (error) => {
    toast.error(error.message || 'Lỗi khi xóa vai trò')
  },
})

const confirmDelete = () => {
  deleteRoleMutation.mutate(selectedRole.value.id)
}

const saveRoleMutation = useMutation({
  mutationFn: (roleData) => {
    if (isEditMode.value) {
      return roleStore.updateRole(selectedRole.value.id, roleData)
    }
    return roleStore.createRole(roleData)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    toast.success(isEditMode.value ? 'Cập nhật vai trò thành công' : 'Thêm vai trò thành công')
    showRoleForm.value = false
  },
  onError: (error) => {
    toast.error(error.message || 'Lỗi khi lưu vai trò')
  },
})

const handleSaveRole = (roleData) => {
  saveRoleMutation.mutate(roleData)
}

const handleActivateModal = (modalId) => {
  if (activeModalId.value !== modalId) {
    modalZIndex.value += 1
    activeModalId.value = modalId
  }
}

const handleAddRole = async () => {
  try {
    isFetchingDetail.value = true
    await roleStore.fetchPermissionStructure()
    isEditMode.value = false
    selectedRole.value = null
    showRoleForm.value = true
    activeModalId.value = 'form'
    modalZIndex.value = 100
  } catch {
    toast.error('Lỗi khi chuẩn bị dữ liệu vai trò')
  } finally {
    isFetchingDetail.value = false
  }
}

const handleEditRole = async (role) => {
  try {
    isFetchingDetail.value = true
    await roleStore.fetchPermissionStructure()

    showRoleForm.value = true

    const queryKey = ['role_permissions', role.id]
    let permissions
    const cachedData = queryClient.getQueryData(queryKey)

    if (cachedData) {
      permissions = cachedData
      queryClient.prefetchQuery({
        queryKey,
        queryFn: () => roleStore.fetchRolePermissions(role.id),
      })
    } else {
      isFetchingDetail.value = true
      permissions = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => roleStore.fetchRolePermissions(role.id),
      })
    }

    selectedRole.value = { ...role, permissions }
    isEditMode.value = true
    activeModalId.value = 'form'
    modalZIndex.value = 100
  } catch {
    toast.error('Lỗi khi tải thông tin vai trò')
    showRoleForm.value = false
  } finally {
    isFetchingDetail.value = false
  }
}

const handleRefreshRole = (id) => {
  const role = displayRoles.value.find((r) => r.id === id)
  if (role) {
    handleEditRole(role)
  }
}

const handleDeleteRole = (role) => {
  selectedRole.value = role
  showDeleteModal.value = true
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Quản lý Vai trò & Quyền hạn</h1>
        <p class="text-gray-600">Quản lý danh sách vai trò và phân quyền trong hệ thống</p>
      </div>

      <div class="flex flex-wrap gap-2 items-center">
        <Button text="Thêm vai trò mới" :icon="IconPlus" color="primary" @click="handleAddRole" />

        <label for="import-role-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-role-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button text="Export" :icon="IconFileExport" color="secondary" @click="handleExport" />
      </div>
    </div>

    <Input
      v-model="searchRefs.search"
      placeholder="Tìm kiếm vai trò..."
      :icon="IconSearch"
      class="mb-4"
      inputClass="h-11"
    />

    <div>
      <RoleList
        :roles="displayRoles"
        :is-loading="isLoading"
        :is-error="isError"
        :error-message="errorMessage"
        @edit="handleEditRole"
        @delete="handleDeleteRole"
      />
    </div>

    <div class="mt-4 flex flex-col sm:flex-row justify-end items-center text-sm text-gray-600">
      <Pagination
        :current-page="pagination.currentPage.value"
        :total-pages="pagination.totalPages.value"
        @page-changed="pagination.changePage"
      />
    </div>

    <LoadingOverlay :show="isFetchingDetail && !showRoleForm" />

    <RoleForm
      v-if="showRoleForm"
      :show="showRoleForm"
      :role="selectedRole"
      :isEditMode="isEditMode"
      :is-fetching="isFetchingDetail || saveRoleMutation.isPending.value"
      :availablePermissions="availablePermissions"
      :permissionStructure="permissionStructure"
      :zIndex="activeModalId === 'form' ? modalZIndex : modalZIndex - 1"
      @close="showRoleForm = false"
      @save="handleSaveRole"
      @refresh="handleRefreshRole"
      @activate="handleActivateModal('form')"
    />

    <RoleDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :role="selectedRole"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>


