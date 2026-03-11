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
    <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full bg-white">
        <thead
          class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
        >
          <tr>
            <th class="py-3 px-6 text-left">Tên Nhân Viên</th>
            <th class="py-3 px-6 text-left">Email</th>
            <th class="py-3 px-6 text-left">Số Điện Thoại</th>
            <th class="py-3 px-6 text-left">Số vai trò</th>
            <th class="py-3 px-6 text-left">Trạng Thái</th>
            <th class="py-3 px-6 text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-if="isError">
            <td colspan="6">
              <div class="text-center py-12 text-red-500 font-medium">
                {{ errorMessage }}
              </div>
            </td>
          </tr>
          <template v-else-if="displayCustomers.length === 0">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="`skeleton-${i}`" class="border-b border-gray-100">
                <td class="py-3 px-6 text-left"><SkeletonLoader width="80%" height="16px" /></td>
                <td class="py-3 px-6 text-left"><SkeletonLoader width="90%" height="16px" /></td>
                <td class="py-3 px-6 text-left"><SkeletonLoader width="80%" height="16px" /></td>
                <td class="py-3 px-6 text-left">
                  <SkeletonLoader width="70%" height="24px" class="rounded-full" />
                </td>
                <td class="py-3 px-6 text-left">
                  <SkeletonLoader width="60%" height="24px" class="rounded-full" />
                </td>
                <td class="py-3 px-6 text-center">
                  <div class="flex justify-center gap-2">
                    <SkeletonLoader width="30px" height="20px" class="rounded" />
                    <SkeletonLoader width="30px" height="20px" class="rounded" />
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="6" class="text-center py-6 text-gray-500">
                Không tìm thấy nhân viên nào.
              </td>
            </tr>
          </template>
          <tr
            v-else
            v-for="customer in displayCustomers"
            :key="customer.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <td class="py-3 px-6 text-left">{{ customer.fullName }}</td>
            <td class="py-3 px-6 text-left">{{ customer.email }}</td>
            <td class="py-3 px-6 text-left">{{ customer.phoneNumber }}</td>
            <td class="py-3 px-6 text-left">
              <RoundBadge color="blue" class="text-xs font-semibold">
                {{ customer.roles?.length || 0 }} vai trò
              </RoundBadge>
            </td>
            <td class="py-3 px-6 text-left">
              <RoundBadge color="gray">{{
                statusText[customer.status] || customer.status
              }}</RoundBadge>
            </td>
            <td class="py-3 px-6">
              <div
                v-if="customer.id !== authStore.user?.id"
                class="flex justify-center items-center gap-3"
              >
                <button
                  v-if="hasPermission(Permissions.UsersEdit)"
                  @click="editCustomer(customer.id)"
                  class="text-blue-500 hover:text-blue-700 transition"
                  title="Sửa thông tin"
                >
                  <IconEdit class="w-5 h-5" />
                </button>
                <button
                  v-if="hasPermission(Permissions.UsersChangePassword)"
                  @click="changePasswordAction(customer.id)"
                  class="text-gray-500 hover:text-gray-700 transition"
                  title="Đổi mật khẩu"
                >
                  <IconKey class="w-5 h-5" />
                </button>
                <button
                  v-if="hasPermission(Permissions.UsersAssignRoles)"
                  @click="assignRolesAction(customer.id)"
                  class="text-green-500 hover:text-green-700 transition"
                  title="Phân quyền"
                >
                  <IconUser class="w-5 h-5" />
                </button>
                <button
                  v-if="hasPermission(Permissions.UsersEdit) && customer.status !== 'Banned'"
                  @click="promptBanUser(customer.id)"
                  class="text-red-500 hover:text-red-700 transition"
                  title="Khóa tài khoản"
                >
                  <IconLock class="w-5 h-5" />
                </button>
                <button
                  v-if="hasPermission(Permissions.UsersEdit) && customer.status === 'Banned'"
                  @click="promptUnbanUser(customer.id)"
                  class="text-green-600 hover:text-green-800 transition"
                  title="Mở khóa tài khoản"
                >
                  <IconCheckCircle class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
import UserForm from '@/components/users/UserForm.vue'
import UserChangePasswordModal from '@/components/users/UserChangePasswordModal.vue'
import UserAssignRoleModal from '@/components/users/UserAssignRoleModal.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconKey from '@/assets/icons/key.svg'
import IconLock from '@/assets/icons/login-lock.svg'
import IconUser from '@/assets/icons/IconUser.svg'
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { Permissions } from '@/constants/permissions'
import { useAuthStore } from '@/stores/useAuthStore'
import { useQueryClient, useMutation, useQuery } from '@tanstack/vue-query'
import * as userApi from '@/api/user'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { fetchRoles } from '@/api/role'
import { showConfirmation } from '@/composables/useConfirmationState'
import { usePermission } from '@/composables/usePermission'

const { hasPermission } = usePermission()

const authStore = useAuthStore()
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

const statusText = {
  Active: 'Hoạt Động',
  Banned: 'Đã Khóa',
}

const { data: rolesData } = useQuery({
  queryKey: ['roles'],
  queryFn: fetchRoles,
})

const availableRoles = computed(() => {
  const roles = rolesData.value?.data || []
  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
  }))
})

const fetchUsersWrapper = async (params) => {
  const filters = []

  if (params.status) {
    filters.push(`Status==${params.status}`)
    delete params.status
  }

  if (params.search) {
    filters.push(`Email@=${params.search}`)
    delete params.search
  }

  if (filters.length > 0) {
    params.filters = params.filters ? `${params.filters},${filters.join(',')}` : filters.join(',')
  }

  return userApi.fetchUsers(params)
}

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
  queryFn: fetchUsersWrapper,
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
      queryClient.prefetchQuery({ queryKey: userQueryKey, queryFn: () => userApi.getUserById(id) })
    } else {
      isFetchingDetail.value = true
      userData = await queryClient.fetchQuery({
        queryKey: userQueryKey,
        queryFn: () => userApi.getUserById(id),
      })
    }

    const rolesQueryKey = ['roles']
    const cachedRoles = queryClient.getQueryData(rolesQueryKey)
    if (cachedRoles) {
      queryClient.prefetchQuery({ queryKey: rolesQueryKey, queryFn: fetchRoles })
    } else {
      isFetchingDetail.value = true
      await queryClient.fetchQuery({ queryKey: rolesQueryKey, queryFn: fetchRoles })
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
  mutationFn: ({ userId, status }) => userApi.changeStatus(userId, { status }),
  onSuccess: () => {
    toast.success('Cập nhật trạng thái thành công')
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
  onError: (err) => {
    toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
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
      queryClient.prefetchQuery({ queryKey: userQueryKey, queryFn: () => userApi.getUserById(id) })
    } else {
      isFetchingDetail.value = true
      userData = await queryClient.fetchQuery({
        queryKey: userQueryKey,
        queryFn: () => userApi.getUserById(id),
      })
    }

    const rolesQueryKey = ['roles_list_modal', { page: 1, limit: 10 }]
    const cachedRoles = queryClient.getQueryData(rolesQueryKey)

    if (cachedRoles) {
      queryClient.prefetchQuery({
        queryKey: rolesQueryKey,
        queryFn: () => fetchRoles({ page: 1, limit: 10 }),
      })
    } else {
      isFetchingDetail.value = true
      await queryClient.fetchQuery({
        queryKey: rolesQueryKey,
        queryFn: () => fetchRoles({ page: 1, limit: 10 }),
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
  mutationFn: (userData) => userApi.updateUser(selectedUser.value.id, userData),
  onSuccess: async (data) => {
    queryClient.setQueryData(['user', selectedUser.value.id], data)
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Cập nhật người dùng thành công')
    showUserForm.value = false
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Cập nhật thất bại')
  },
})

const { isPending: isChangingPassword, mutate: doChangePassword } = useMutation({
  mutationFn: (data) => userApi.changePassword(data.userId, data.payload),
  onSuccess: () => {
    toast.success('Đổi mật khẩu thành công')
    showChangePasswordModal.value = false
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại')
  },
})

const { isPending: isAssigningRoles, mutate: doAssignRoles } = useMutation({
  mutationFn: (data) => userApi.assignRoles(data.userId, data.payload),
  onSuccess: async (data) => {
    queryClient.setQueryData(['user', selectedUser.value.id], data)
    await queryClient.invalidateQueries({ queryKey: ['users'] })

    toast.success('Gán vai trò thành công')
    showAssignRoleModal.value = false
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Gán vai trò thất bại')
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
