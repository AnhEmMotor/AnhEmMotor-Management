<script setup>
import { ref, onMounted } from 'vue'
import RoleList from '@/components/roles/RoleList.vue'
import RoleForm from '@/components/roles/RoleForm.vue'
import RoleDeleteModal from '@/components/roles/RoleDeleteModal.vue'
import RoleFilterButtons from '@/components/roles/RoleFilterButtons.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'

// Mock data - thay thế bằng API call thực tế
const roles = ref([
  {
    id: 1,
    name: 'Quản lý',
    description: 'Quyền quản lý toàn bộ hệ thống',
    permissionCount: 15,
    createdAt: '2025-01-10',
    status: 'active',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    id: 2,
    name: 'Quản kho',
    description: 'Quyền quản lý kho hàng và nhập xuất',
    permissionCount: 8,
    createdAt: '2025-01-15',
    status: 'active',
    permissions: [6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    id: 3,
    name: 'Nhân viên',
    description: 'Quyền cơ bản cho nhân viên',
    permissionCount: 5,
    createdAt: '2025-01-20',
    status: 'disabled',
    permissions: [1, 2, 14, 15, 16],
  },
])

// Mock permissions data
const availablePermissions = ref([
  // Sản phẩm
  {
    id: 1,
    name: 'Xem sản phẩm',
    description: 'Xem danh sách và chi tiết sản phẩm',
    category: 'Quản lý sản phẩm',
  },
  {
    id: 2,
    name: 'Thêm sản phẩm',
    description: 'Thêm sản phẩm mới vào hệ thống',
    category: 'Quản lý sản phẩm',
  },
  {
    id: 3,
    name: 'Sửa sản phẩm',
    description: 'Chỉnh sửa thông tin sản phẩm',
    category: 'Quản lý sản phẩm',
  },
  {
    id: 4,
    name: 'Xóa sản phẩm',
    description: 'Xóa sản phẩm khỏi hệ thống',
    category: 'Quản lý sản phẩm',
  },
  {
    id: 5,
    name: 'Xuất Excel sản phẩm',
    description: 'Xuất danh sách sản phẩm ra Excel',
    category: 'Quản lý sản phẩm',
  },

  // Kho
  { id: 6, name: 'Xem kho', description: 'Xem thông tin kho hàng', category: 'Quản lý kho' },
  {
    id: 7,
    name: 'Thêm phiếu nhập',
    description: 'Tạo phiếu nhập hàng mới',
    category: 'Quản lý kho',
  },
  {
    id: 8,
    name: 'Sửa phiếu nhập',
    description: 'Chỉnh sửa phiếu nhập hàng',
    category: 'Quản lý kho',
  },
  { id: 9, name: 'Xóa phiếu nhập', description: 'Xóa phiếu nhập hàng', category: 'Quản lý kho' },
  {
    id: 10,
    name: 'Quản lý nhà cung cấp',
    description: 'Quản lý danh sách nhà cung cấp',
    category: 'Quản lý kho',
  },
  { id: 11, name: 'Thiết lập giá', description: 'Thiết lập giá sản phẩm', category: 'Quản lý kho' },
  {
    id: 12,
    name: 'Kiểm kê kho',
    description: 'Thực hiện kiểm kê kho hàng',
    category: 'Quản lý kho',
  },
  {
    id: 13,
    name: 'Xuất Excel kho',
    description: 'Xuất báo cáo kho ra Excel',
    category: 'Quản lý kho',
  },

  // Đơn hàng
  {
    id: 14,
    name: 'Xem đơn hàng',
    description: 'Xem danh sách đơn hàng',
    category: 'Quản lý đơn hàng',
  },
  { id: 15, name: 'Tạo đơn hàng', description: 'Tạo đơn hàng mới', category: 'Quản lý đơn hàng' },
  {
    id: 16,
    name: 'Sửa đơn hàng',
    description: 'Chỉnh sửa thông tin đơn hàng',
    category: 'Quản lý đơn hàng',
  },
  { id: 17, name: 'Hủy đơn hàng', description: 'Hủy đơn hàng', category: 'Quản lý đơn hàng' },
  {
    id: 18,
    name: 'Xuất hóa đơn',
    description: 'Xuất hóa đơn cho đơn hàng',
    category: 'Quản lý đơn hàng',
  },

  // Người dùng
  {
    id: 19,
    name: 'Xem người dùng',
    description: 'Xem danh sách người dùng',
    category: 'Quản lý người dùng',
  },
  {
    id: 20,
    name: 'Thêm người dùng',
    description: 'Thêm người dùng mới',
    category: 'Quản lý người dùng',
  },
  {
    id: 21,
    name: 'Sửa người dùng',
    description: 'Chỉnh sửa thông tin người dùng',
    category: 'Quản lý người dùng',
  },
  {
    id: 22,
    name: 'Xóa người dùng',
    description: 'Xóa người dùng khỏi hệ thống',
    category: 'Quản lý người dùng',
  },
  {
    id: 23,
    name: 'Phân quyền',
    description: 'Phân quyền cho người dùng',
    category: 'Quản lý người dùng',
  },

  // Báo cáo
  {
    id: 24,
    name: 'Xem báo cáo doanh thu',
    description: 'Xem báo cáo doanh thu',
    category: 'Báo cáo',
  },
  {
    id: 25,
    name: 'Xem báo cáo sản phẩm',
    description: 'Xem báo cáo sản phẩm',
    category: 'Báo cáo',
  },
  { id: 26, name: 'Xem báo cáo kho', description: 'Xem báo cáo kho hàng', category: 'Báo cáo' },
  { id: 27, name: 'Xuất báo cáo', description: 'Xuất báo cáo ra file', category: 'Báo cáo' },
])

const filteredRoles = ref([])
const searchQuery = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')

// Modal states
const showRoleForm = ref(false)
const showDeleteModal = ref(false)
const selectedRole = ref(null)
const isEditMode = ref(false)

// Z-index management for modals
const modalZIndex = ref(100)
const activeModalId = ref(null)

const selectedStatuses = ref([])

onMounted(() => {
  filteredRoles.value = [...roles.value]
})

const applyFilters = () => {
  let result = [...roles.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (role) =>
        role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query),
    )
  }

  // Apply sort
  result.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  filteredRoles.value = result
}

// CRUD operations
const handleAddRole = () => {
  isEditMode.value = false
  selectedRole.value = null
  showRoleForm.value = true
  activeModalId.value = 'form'
  modalZIndex.value = 100
}

const handleEditRole = (role) => {
  isEditMode.value = true
  selectedRole.value = { ...role }
  showRoleForm.value = true
  activeModalId.value = 'form'
  modalZIndex.value = 100
}

const handleDeleteRole = (role) => {
  selectedRole.value = role
  showDeleteModal.value = true
  activeModalId.value = 'delete'
  modalZIndex.value = 100
}

const confirmDelete = () => {
  // Thực hiện xóa vai trò
  roles.value = roles.value.filter((r) => r.id !== selectedRole.value.id)
  applyFilters()
  showDeleteModal.value = false
  selectedRole.value = null
}

const handleSaveRole = (roleData) => {
  if (isEditMode.value) {
    // Update existing role
    const index = roles.value.findIndex((r) => r.id === selectedRole.value.id)
    if (index !== -1) {
      roles.value[index] = {
        ...roles.value[index],
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        permissionCount: roleData.permissions.length,
        status: roleData.status,
      }
    }
  } else {
    // Add new role
    const newRole = {
      id: Math.max(...roles.value.map((r) => r.id)) + 1,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      permissionCount: roleData.permissions.length,
      createdAt: new Date().toISOString().split('T')[0],
      status: roleData.status || 'active',
    }
    roles.value.push(newRole)
  }
  applyFilters()
  showRoleForm.value = false
}

const handleActivateModal = (modalId) => {
  if (activeModalId.value !== modalId) {
    modalZIndex.value += 1
    activeModalId.value = modalId
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col bg-gray-50 p-6 overflow-hidden">
    <!-- Header -->
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0"
    >
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Quản lý Vai trò & Quyền hạn</h1>
        <p class="text-gray-600">Quản lý danh sách vai trò và phân quyền trong hệ thống</p>
      </div>

      <!-- Filter and Actions -->
      <div class="flex justify-between items-center mb-6">
        <RoleFilterButtons v-model="selectedStatuses" />
        <span class="h-8 border-r-2 border-black-300 mx-2" />
        <BaseButton @click="handleAddRole" variant="primary" text="Thêm vai trò mới" />
      </div>
    </div>

    <!-- Role List -->
    <div class="flex-1 overflow-hidden">
      <RoleList :roles="filteredRoles" @edit="handleEditRole" @delete="handleDeleteRole" />
    </div>

    <!-- Role Form Modal -->
    <RoleForm
      v-if="showRoleForm"
      :show="showRoleForm"
      :role="selectedRole"
      :isEditMode="isEditMode"
      :availablePermissions="availablePermissions"
      :zIndex="activeModalId === 'form' ? modalZIndex : modalZIndex - 1"
      @close="showRoleForm = false"
      @save="handleSaveRole"
      @activate="handleActivateModal('form')"
    />

    <!-- Delete Confirmation Modal -->
    <RoleDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :role="selectedRole"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
