<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h2 class="text-3xl font-bold text-center text-gray-800">Danh Sách Người Dùng</h2>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <Button text="Thêm mới" :icon="IconPlus" color="primary" @click="openAddModal" />

        <label for="import-user-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-user-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button text="Export" :icon="IconFileExport" color="secondary" @click="handleExport" />

        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block h-6" />

        <span class="text-gray-600 font-medium mr-2 hidden sm:inline-block">Lọc trạng thái:</span>

        <UserFilterButtons v-model="selectedStatuses" multiple />
      </div>
    </div>
    <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full bg-white">
        <thead class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200">
          <tr>
            <th class="py-3 px-6 text-left">Tên Nhân Viên</th>
            <th class="py-3 px-6 text-left">Email</th>
            <th class="py-3 px-6 text-left">Số Điện Thoại</th>
            <th class="py-3 px-6 text-left">Vai trò</th>
            <th class="py-3 px-6 text-left">Trạng Thái</th>
            <th class="py-3 px-6 text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="`skeleton-${i}`" class="border-b border-gray-100">
              <td class="py-3 px-6 text-left"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="py-3 px-6 text-left"><SkeletonLoader width="90%" height="16px" /></td>
              <td class="py-3 px-6 text-left"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="py-3 px-6 text-left"><SkeletonLoader width="70%" height="24px" class="rounded-full" /></td>
              <td class="py-3 px-6 text-left"><SkeletonLoader width="60%" height="24px" class="rounded-full" /></td>
              <td class="py-3 px-6 text-center">
                <div class="flex justify-center gap-2">
                  <SkeletonLoader width="30px" height="20px" class="rounded" />
                  <SkeletonLoader width="30px" height="20px" class="rounded" />
                </div>
              </td>
            </tr>
          </template>

          <tr v-else-if="isError">
            <td colspan="6">
              <div class="text-center py-12 text-red-500 font-medium">
                {{ errorMessage }}
              </div>
            </td>
          </tr>
          <tr v-else-if="displayCustomers.length === 0">
            <td colspan="6" class="text-center py-6 text-gray-500">
              Không tìm thấy nhân viên nào.
            </td>
          </tr>
          <tr v-else v-for="customer in displayCustomers" :key="customer.id" class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-6 text-left">{{ customer.name }}</td>
            <td class="py-3 px-6 text-left">{{ customer.email }}</td>
            <td class="py-3 px-6 text-left">{{ customer.phone }}</td>
            <td class="py-3 px-6 text-left">
              <div class="flex flex-wrap gap-1">
                <RoundBadge
                  v-for="roleId in customer.roleIds"
                  :key="roleId"
                  color="gray"
                  class="text-xs"
                >
                  {{ availableRoles.find((r) => r.id === roleId)?.name }}
                </RoundBadge>
              </div>
            </td>
            <td class="py-3 px-6 text-left">
              <RoundBadge color="gray">{{ statusText[customer.status] }}</RoundBadge>
            </td>
            <td class="py-3 px-6">
              <div class="flex justify-center gap-2">
                <SmallNoBgButton @click="editCustomer(customer.id)">Sửa</SmallNoBgButton>
                <SmallNoBgButton color="red" @click="deleteCustomer(customer.id)">Xóa</SmallNoBgButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UserForm
      v-if="showUserForm"
      :show="showUserForm"
      :user="selectedUser"
      :isEditMode="isEditMode"
      :availableRoles="availableRoles"
      :zIndex="activeModalId === 'form' ? modalZIndex : modalZIndex - 1"
      @close="showUserForm = false"
      @save="handleSaveUser"
      @activate="handleActivateModal('form')"
    />

    <UserDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :user="selectedUser"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import UserFilterButtons from '@/components/users/UserFilterButtons.vue'
import UserForm from '@/components/users/UserForm.vue'
import UserDeleteModal from '@/components/users/UserDeleteModal.vue'
import Button from '@/components/ui/button/Button.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconFileImport from '@/components/icons/IconFileImport.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'

const allCustomers = ref([])

const availableRoles = ref([
  { id: 1, name: 'Quản lý', description: 'Quyền quản lý toàn bộ hệ thống', permissionCount: 15 },
  { id: 2, name: 'Quản kho', description: 'Quyền quản lý kho hàng', permissionCount: 8 },
  { id: 3, name: 'Nhân viên', description: 'Quyền cơ bản', permissionCount: 5 },
])

const isLoading = ref(false)
const isError = ref(false)
const errorMessage = ref('')
const selectedStatuses = ref(['active', 'new', 'inactive'])
const toast = useToast()
const displayCustomers = ref([])

const showUserForm = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)
const isEditMode = ref(false)
const modalZIndex = ref(100)
const activeModalId = ref(null)

const statusText = {
  active: 'Hoạt Động',
  new: 'Mới',
  inactive: 'Không Hoạt Động',
}

const fetchData = async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    /*
     * Simulate Error
     * Remove this line to test success case
     */
    throw new Error('Lỗi kết nối CSDL')
    
    // displayCustomers.value = allCustomers.value
  } catch {
    isError.value = true
    errorMessage.value = 'Đã xảy ra lỗi trong quá trình tải dữ liệu.'
    toast.error('Đã xảy ra lỗi trong quá trình tải dữ liệu.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const openAddModal = () => {
  isEditMode.value = false
  selectedUser.value = null
  showUserForm.value = true
  activeModalId.value = 'form'
  modalZIndex.value = 100
}

const editCustomer = (id) => {
  const customer = allCustomers.value.find((c) => c.id === id)
  if (customer) {
    isEditMode.value = true
    selectedUser.value = JSON.parse(JSON.stringify(customer))
    showUserForm.value = true
    activeModalId.value = 'form'
    modalZIndex.value = 100
  }
}

const deleteCustomer = (id) => {
  const customer = allCustomers.value.find((c) => c.id === id)
  if (customer) {
    selectedUser.value = customer
    showDeleteModal.value = true
    activeModalId.value = 'delete'
    modalZIndex.value = 100
  }
}

const handleSaveUser = (userData) => {
  if (isEditMode.value) {
    const index = allCustomers.value.findIndex((c) => c.id === selectedUser.value.id)
    if (index !== -1) {
      allCustomers.value[index] = {
        ...allCustomers.value[index],
        ...userData,
      }
    }
  } else {
    const newUser = {
      id: String(Math.max(...allCustomers.value.map((c) => parseInt(c.id))) + 1),
      ...userData,
    }
    allCustomers.value.push(newUser)
  }
  displayCustomers.value = allCustomers.value
  showUserForm.value = false
}

const confirmDelete = () => {
  allCustomers.value = allCustomers.value.filter((c) => c.id !== selectedUser.value.id)
  displayCustomers.value = allCustomers.value
  showDeleteModal.value = false
  selectedUser.value = null
}

const handleActivateModal = (modalId) => {
  if (activeModalId.value !== modalId) {
    modalZIndex.value += 1
    activeModalId.value = modalId
  }
}

const handleExport = () => {
  toast.info('Chức năng xuất Excel đang phát triển')
}

const handleImport = () => {
  toast.info('Chức năng nhập Excel đang phát triển')
}
</script>
