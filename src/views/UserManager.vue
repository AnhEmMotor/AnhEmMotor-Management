<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h2 class="title-style">Quản Lý Khách Hàng</h2>
      </div>
      <div class="action-button-style">
        <BaseActionButton text="Thêm mới" icon="fas fa-plus" color="blue" @click="openAddModal" />
        <UserFilterButtons v-model="selectedStatuses" multiple />
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="table-style">
        <thead class="table-header-style">
          <tr>
            <th class="normal-cell-style">Mã KH</th>
            <th class="normal-cell-style">Tên Khách Hàng</th>
            <th class="normal-cell-style">Email</th>
            <th class="normal-cell-style">Số Điện Thoại</th>
            <th class="normal-cell-style">Vai trò</th>
            <th class="normal-cell-style">Trạng Thái</th>
            <th class="center-cell-style">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="table-body-style">
          <tr v-if="displayCustomers.length === 0">
            <td colspan="7" class="not-found-text-style">Không tìm thấy khách hàng nào.</td>
          </tr>
          <tr v-for="customer in displayCustomers" :key="customer.id" class="table-row-style">
            <td class="normal-cell-style whitespace-nowrap">{{ customer.code }}</td>
            <td class="normal-cell-style">{{ customer.name }}</td>
            <td class="normal-cell-style">{{ customer.email }}</td>
            <td class="normal-cell-style">{{ customer.phone }}</td>
            <td class="normal-cell-style">
              <div class="flex flex-wrap gap-1">
                <RoundBadge
                  v-for="roleId in customer.roleIds"
                  :key="roleId"
                  color="blue"
                  class="text-xs"
                >
                  {{ availableRoles.find((r) => r.id === roleId)?.name }}
                </RoundBadge>
              </div>
            </td>
            <td class="normal-cell-style">
              <RoundBadge :color="statusColors[customer.status]">{{
                statusText[customer.status]
              }}</RoundBadge>
            </td>
            <td class="center-cell-style space-x-2">
              <BaseSmallNoBgButton @click="editCustomer(customer.id)">Sửa</BaseSmallNoBgButton>
              <BaseSmallNoBgButton color="red" @click="deleteCustomer(customer.id)">
                Xóa
              </BaseSmallNoBgButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- User Form Modal -->
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

    <!-- Delete Confirmation Modal -->
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
import BaseActionButton from '@/components/ui/button/BaseButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import { onMounted, ref } from 'vue'

const allCustomers = ref([
  {
    id: '1',
    code: 'KH001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    status: 'active',
    roleIds: [1, 2],
  },
  {
    id: '2',
    code: 'KH002',
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phone: '0912345678',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    status: 'new',
    roleIds: [3],
  },
  {
    id: '3',
    code: 'KH003',
    name: 'Lê Văn Cường',
    email: 'cuong.le@example.com',
    phone: '0987654321',
    address: '789 Đường KLM, Quận 3, TP.HCM',
    status: 'inactive',
    roleIds: [2, 3],
  },
  {
    id: '4',
    code: 'KH004',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@example.com',
    phone: '0978123456',
    address: '101 Đường DEF, Quận 4, TP.HCM',
    status: 'active',
    roleIds: [1],
  },
  {
    id: '5',
    code: 'KH005',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@example.com',
    phone: '0934567890',
    address: '212 Đường GHI, Quận 5, TP.HCM',
    status: 'new',
    roleIds: [1, 2, 3],
  },
])

// Mock roles data - should come from API
const availableRoles = ref([
  { id: 1, name: 'Quản lý', description: 'Quyền quản lý toàn bộ hệ thống', permissionCount: 15 },
  { id: 2, name: 'Quản kho', description: 'Quyền quản lý kho hàng', permissionCount: 8 },
  { id: 3, name: 'Nhân viên', description: 'Quyền cơ bản', permissionCount: 5 },
])

const selectedStatuses = ref(['active', 'new', 'inactive'])
const displayCustomers = ref([])

// Modal states
const showUserForm = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)
const isEditMode = ref(false)
const modalZIndex = ref(100)
const activeModalId = ref(null)

const statusColors = {
  active: 'green',
  new: 'yellow',
  inactive: 'red',
}

const statusText = {
  active: 'Hoạt Động',
  new: 'Mới',
  inactive: 'Không Hoạt Động',
}

onMounted(() => {
  displayCustomers.value = allCustomers.value
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
    selectedUser.value = { ...customer }
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
    // Update existing user
    const index = allCustomers.value.findIndex((c) => c.id === selectedUser.value.id)
    if (index !== -1) {
      allCustomers.value[index] = {
        ...allCustomers.value[index],
        ...userData,
      }
    }
  } else {
    // Add new user
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

const getRoleNames = (roleIds) => {
  return availableRoles.value
    .filter((role) => roleIds.includes(role.id))
    .map((role) => role.name)
    .join(', ')
}
</script>

<style scoped>
@reference "../assets/main.css";
.box-style {
  @apply bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold text-center text-gray-800;
}
.content-box-style {
  @apply flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0;
}
.sub-title-style {
  @apply text-2xl font-semibold text-gray-800;
}
.text-style {
  @apply text-sm text-gray-500;
}
.text-bold-style {
  @apply font-medium text-gray-700;
}
.action-button-style {
  @apply flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto;
}
.normal-cell-style {
  @apply py-3 px-6 text-left;
}
.center-cell-style {
  @apply py-3 px-6 text-center;
}
.table-style {
  @apply min-w-full bg-white rounded-lg overflow-hidden shadow-sm;
}
.table-header-style {
  @apply bg-gray-200 text-gray-600 uppercase text-sm leading-normal;
}
.table-body-style {
  @apply text-gray-600 text-sm font-light;
}
.not-found-text-style {
  @apply text-center py-6 text-gray-500;
}
.table-row-style {
  @apply border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200;
}
</style>
