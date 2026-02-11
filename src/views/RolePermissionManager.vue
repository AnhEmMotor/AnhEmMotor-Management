<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import RoleList from '@/components/roles/RoleList.vue'
import RoleForm from '@/components/roles/RoleForm.vue'
import RoleDeleteModal from '@/components/roles/RoleDeleteModal.vue'
import RoleFilterButtons from '@/components/roles/RoleFilterButtons.vue'
import Button from '@/components/ui/button/Button.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconFileImport from '@/components/icons/IconFileImport.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'

const roles = ref([])

const availablePermissions = ref([
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

const showRoleForm = ref(false)
const showDeleteModal = ref(false)
const selectedRole = ref(null)
const isEditMode = ref(false)

const modalZIndex = ref(100)
const activeModalId = ref(null)
const isLoading = ref(false)
const isError = ref(false)
const errorMessage = ref('')

const selectedStatuses = ref([])
const toast = useToast()

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // Simulate Error
    throw new Error('Lỗi tải dữ liệu vai trò')

    // filteredRoles.value = [...roles.value]
  } catch (err) {
    isError.value = true
    errorMessage.value = 'Đã xảy ra lỗi trong quá trình tải dữ liệu vai trò.'
    toast.error('Đã xảy ra lỗi trong quá trình tải dữ liệu vai trò.')
  } finally {
    isLoading.value = false
  }
}

const handleExport = () => {
  toast.info('Chức năng xuất Excel đang phát triển')
}

const handleImport = (event) => {
  toast.info('Chức năng nhập Excel đang phát triển')
  event.target.value = ''
}

const applyFilters = () => {
  let result = [...roles.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (role) =>
        role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query),
    )
  }

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
  roles.value = roles.value.filter((r) => r.id !== selectedRole.value.id)
  applyFilters()
  showDeleteModal.value = false
  selectedRole.value = null
}

const handleSaveRole = (roleData) => {
  if (isEditMode.value) {
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
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0"
    >
      <div class="mb-6">
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

        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block h-6" />

        <span class="text-gray-600 font-medium mr-2 hidden sm:inline-block">Lọc trạng thái:</span>

        <RoleFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <div>
      <RoleList
        :roles="filteredRoles"
        :is-loading="isLoading"
        :is-error="isError"
        :error-message="errorMessage"
        @edit="handleEditRole"
        @delete="handleDeleteRole"
      />
    </div>

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

    <RoleDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :role="selectedRole"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
