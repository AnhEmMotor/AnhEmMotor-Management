<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h2 class="text-3xl font-bold text-center text-gray-800">Danh Sách Người Dùng</h2>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <div class="flex items-center gap-2">
          <span class="text-gray-600 font-medium whitespace-nowrap">Trạng thái:</span>
          <UserFilterButtons v-model="filterRefs.status" />
        </div>
      </div>
    </div>

    <Input
      v-model="searchRefs.search"
      placeholder="Tìm kiếm theo email..."
      class="mb-4"
      inputClass="h-11"
    />

    <UserTable
      :users="displayCustomers"
      :isLoading="isLoading"
      :isError="isError"
      :errorMessage="errorMessage"
      :currentUserId="authStore.user?.id"
      @edit="editCustomer"
      @changePassword="changePasswordAction"
      @assignRoles="assignRolesAction"
      @ban="promptBanUser"
      @unban="promptUnbanUser"
    />

    <div class="mt-4 flex flex-col sm:flex-row justify-end items-center text-sm text-gray-600">
      <Pagination
        :current-page="pagination.currentPage.value"
        :total-pages="pagination.totalPages.value"
        @page-changed="pagination.changePage"
      />
    </div>

    <LoadingOverlay :show="isFetchingDetail" message="Đang tải dữ liệu người dùng..." />

    <UserForm
      v-if="showUserForm"
      :key="selectedUser?.id || 'new'"
      :show="showUserForm"
      :user="selectedUser"
      :isEditMode="isEditMode"
      :availableRoles="availableRoles"
      :is-saving="isUpdating"
      :is-fetching="isFetchingDetail"
      :zIndex="activeModalId === 'form' ? modalZIndex : modalZIndex - 1"
      @close="showUserForm = false"
      @save="handleSaveUser"
      @refresh="editCustomer"
      @activate="activeModalId = 'form'"
    />

    <UserChangePasswordModal
      v-if="showChangePasswordModal"
      :show="showChangePasswordModal"
      :userId="selectedUser?.id"
      :userName="selectedUser?.userName"
      :is-saving="isChangingPassword"
      @close="showChangePasswordModal = false"
      @save="handleSavePassword"
    />

    <UserAssignRoleModal
      v-if="showAssignRoleModal"
      :show="showAssignRoleModal"
      :userId="selectedUser?.id"
      :initialRoles="selectedUser?.roles"
      :is-saving="isAssigningRoles"
      @close="showAssignRoleModal = false"
      @save="handleSaveRoles"
      @refresh="assignRolesAction"
    />
  </div>
</template>

<script setup>
import UserFilterButtons from '@/components/users/UserFilterButtons.vue'
import UserTable from '@/components/users/UserTable.vue'
import UserForm from '@/components/users/UserForm.vue'
import UserChangePasswordModal from '@/components/users/UserChangePasswordModal.vue'
import UserAssignRoleModal from '@/components/users/UserAssignRoleModal.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useRoleStore } from '@/stores/role.store'
import { useQueryClient, useMutation, useQuery } from '@tanstack/vue-query'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { showConfirmation } from '@/composables/useConfirmationState'
import userMapper from '@/mappers/user.mapper'

const authStore = useAuthStore()
const userStore = useUserStore()
const roleStore = useRoleStore()
const queryClient = useQueryClient()
const toast = useToast()

const showUserForm = ref(false)
const selectedUser = ref(null)
const isEditMode = ref(false)
const modalZIndex = ref(100)
const activeModalId = ref(null)
const showChangePasswordModal = ref(false)
const showAssignRoleModal = ref(false)
const isFetchingDetail = ref(false)

const { data: rolesData } = useQuery({
  queryKey: ['roles'],
  queryFn: () => roleStore.fetchRoles({ page: 1, limit: 100 }),
})

const availableRoles = computed(() => {
  return userMapper.toRoleOptions(rolesData.value?.data)
})

const {
  data: usersData,
  isLoading,
  isError,
  error,
  pagination,
  searchRefs,
  filterRefs,
} = usePaginatedQuery({
  queryKey: ['users'],
  queryFn: (params) => userStore.fetchUsers(params),
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
  filterFields: [{ key: 'status' }],
})

const errorMessage = computed(
  () => error.value?.message || 'Đã xảy ra lỗi trong quá trình tải dữ liệu.',
)
const displayCustomers = computed(() => usersData.value || [])

const editCustomer = async (id) => {
  try {
    const userQueryKey = ['user', id]
    let userData
    const cachedUser = queryClient.getQueryData(userQueryKey)

    if (cachedUser) {
      userData = cachedUser
      queryClient.prefetchQuery({
        queryKey: userQueryKey,
        queryFn: () => userStore.getUserById(id),
      })
    } else {
      isFetchingDetail.value = true
      userData = await queryClient.fetchQuery({
        queryKey: userQueryKey,
        queryFn: () => userStore.getUserById(id),
      })
    }

    const rolesQueryKey = ['roles']
    const cachedRoles = queryClient.getQueryData(rolesQueryKey)
    if (!cachedRoles) {
      isFetchingDetail.value = true
      await queryClient.fetchQuery({
        queryKey: rolesQueryKey,
        queryFn: () => roleStore.fetchRoles({ page: 1, limit: 100 }),
      })
    }

    showUserForm.value = true
    isEditMode.value = true
    selectedUser.value = userData
    activeModalId.value = 'form'
    modalZIndex.value = 100
  } catch {
    toast.error('Lỗi khi tải thông tin người dùng')
    showUserForm.value = false
  } finally {
    isFetchingDetail.value = false
  }
}

const changeStatusMutation = useMutation({
  mutationFn: ({ userId, status }) => userStore.changeStatus(userId, status),
  onSuccess: () => {
    toast.success('Cập nhật trạng thái thành công')
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
  onError: (err) => {
    toast.error(err.message || 'Lỗi khi cập nhật trạng thái')
  },
})

const promptBanUser = async (id) => {
  const confirmed = await showConfirmation(
    'Xác nhận khóa',
    'Bạn có chắc chắn muốn khóa tài khoản này?',
  )
  if (!confirmed) return
  changeStatusMutation.mutate({ userId: id, status: 'Banned' })
}

const promptUnbanUser = async (id) => {
  const confirmed = await showConfirmation(
    'Xác nhận mở khóa',
    'Bạn có chắc chắn muốn mở khóa tài khoản này?',
  )
  if (!confirmed) return
  changeStatusMutation.mutate({ userId: id, status: 'Active' })
}

const changePasswordAction = (id) => {
  selectedUser.value = { id }
  showChangePasswordModal.value = true
}

const assignRolesAction = async (id) => {
  try {
    const userQueryKey = ['user', id]
    const cachedUser = queryClient.getQueryData(userQueryKey)
    let userData

    if (cachedUser) {
      userData = cachedUser
      queryClient.prefetchQuery({
        queryKey: userQueryKey,
        queryFn: () => userStore.getUserById(id),
      })
    } else {
      isFetchingDetail.value = true
      userData = await queryClient.fetchQuery({
        queryKey: userQueryKey,
        queryFn: () => userStore.getUserById(id),
      })
    }

    selectedUser.value = userData
    showAssignRoleModal.value = true
  } catch {
    toast.error('Lỗi khi chuẩn bị dữ liệu gán vai trò')
    showAssignRoleModal.value = false
  } finally {
    isFetchingDetail.value = false
  }
}

const { isPending: isUpdating, mutate: doUpdateUser } = useMutation({
  mutationFn: (userData) => userStore.updateUser(selectedUser.value.id, userData),
  onSuccess: async (data) => {
    queryClient.setQueryData(['user', selectedUser.value.id], data)
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Cập nhật người dùng thành công')
    showUserForm.value = false
  },
  onError: (error) => {
    toast.error(error.message || 'Cập nhật thất bại')
  },
})

const { isPending: isChangingPassword, mutate: doChangePassword } = useMutation({
  mutationFn: (data) => userStore.resetPassword(data.userId, data.payload),
  onSuccess: () => {
    toast.success('Đổi mật khẩu thành công')
    showChangePasswordModal.value = false
  },
  onError: (error) => {
    toast.error(error.message || 'Đổi mật khẩu thất bại')
  },
})

const { isPending: isAssigningRoles, mutate: doAssignRoles } = useMutation({
  mutationFn: (data) => userStore.assignRoles(data.userId, data.payload.roleIds),
  onSuccess: async (data) => {
    queryClient.setQueryData(['user', selectedUser.value.id], data)
    await queryClient.invalidateQueries({ queryKey: ['users'] })

    toast.success('Gán vai trò thành công')
    showAssignRoleModal.value = false
  },
  onError: (error) => {
    toast.error(error.message || 'Gán vai trò thất bại')
  },
})

const handleSavePassword = (payload) => {
  doChangePassword({ userId: selectedUser.value.id, payload })
}

const handleSaveRoles = (payload) => {
  doAssignRoles({ userId: selectedUser.value.id, payload })
}

const handleSaveUser = (userData) => {
  doUpdateUser(userData)
}
</script>
