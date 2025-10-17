<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BaseDropdown from '@/components/ui/input/BaseDropdown.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Object,
    default: null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  zIndex: {
    type: Number,
    default: 100,
  },
  availableRoles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save', 'activate'])

// Form data
const formData = ref({
  code: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
  roleIds: [],
})

const errors = ref({
  code: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  roleIds: '',
})

const statusOptions = [
  { value: 'active', text: 'Hoạt động' },
  { value: 'new', text: 'Mới' },
  { value: 'inactive', text: 'Không hoạt động' },
]

// Function definitions first
const resetForm = () => {
  formData.value = {
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    roleIds: [],
  }
  errors.value = {
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    roleIds: '',
  }
}

// Watch for prop changes
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formData.value = {
        code: newUser.code || '',
        name: newUser.name || '',
        email: newUser.email || '',
        phone: newUser.phone || '',
        address: newUser.address || '',
        // Clone arrays/objects to avoid mutating parent data directly
        status: newUser.status || 'active',
        roleIds: newUser.roleIds ? [...newUser.roleIds] : [],
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const validateForm = () => {
  let isValid = true
  errors.value = {
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    roleIds: '',
  }

  // Validate code
  if (!props.isEditMode) {
    if (!formData.value.code || formData.value.code.trim() === '') {
      errors.value.code = 'Mã khách hàng không được để trống'
      isValid = false
    }
  }

  // Validate name
  if (!formData.value.name || formData.value.name.trim() === '') {
    errors.value.name = 'Tên khách hàng không được để trống'
    isValid = false
  }

  // Validate email
  if (!formData.value.email || formData.value.email.trim() === '') {
    errors.value.email = 'Email không được để trống'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Email không hợp lệ'
    isValid = false
  }

  // Validate phone
  if (!formData.value.phone || formData.value.phone.trim() === '') {
    errors.value.phone = 'Số điện thoại không được để trống'
    isValid = false
  } else if (!/^[0-9]{10,11}$/.test(formData.value.phone)) {
    errors.value.phone = 'Số điện thoại phải có 10-11 chữ số'
    isValid = false
  }

  // Validate address
  if (!formData.value.address || formData.value.address.trim() === '') {
    errors.value.address = 'Địa chỉ không được để trống'
    isValid = false
  }

  // Validate roles
  if (formData.value.roleIds.length === 0) {
    errors.value.roleIds = 'Vui lòng chọn ít nhất một vai trò'
    isValid = false
  }

  return isValid
}

const handleSave = () => {
  if (validateForm()) {
    emit('save', {
      code: formData.value.code.trim(),
      name: formData.value.name.trim(),
      email: formData.value.email.trim(),
      phone: formData.value.phone.trim(),
      address: formData.value.address.trim(),
      status: formData.value.status,
      roleIds: formData.value.roleIds,
    })
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const toggleRole = (roleId) => {
  const index = formData.value.roleIds.indexOf(roleId)
  if (index > -1) {
    formData.value.roleIds.splice(index, 1)
  } else {
    formData.value.roleIds.push(roleId)
  }
}

const isRoleSelected = (roleId) => {
  return formData.value.roleIds.includes(roleId)
}
</script>

<template>
  <DraggableModal
    :zIndex="zIndex"
    :initialPosition="{ x: 300, y: 50 }"
    width="700px"
    @close="handleClose"
    @activate="emit('activate')"
  >
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">
        {{ isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}
      </h3>
    </template>

    <template #body>
      <div class="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        <!-- Mã khách hàng -->
        <div v-if="!isEditMode">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mã khách hàng <span class="text-red-500">*</span>
          </label>
          <BaseInput v-model="formData.code" placeholder="VD: KH001" :error="errors.code" />
          <p v-if="errors.code" class="mt-1 text-sm text-red-500">{{ errors.code }}</p>
        </div>

        <!-- Tên khách hàng -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tên khách hàng <span class="text-red-500">*</span>
          </label>
          <BaseInput
            v-model="formData.name"
            placeholder="Nhập tên khách hàng"
            :error="errors.name"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email <span class="text-red-500">*</span>
          </label>
          <BaseInput
            v-model="formData.email"
            type="email"
            placeholder="example@email.com"
            :error="errors.email"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
        </div>

        <!-- Số điện thoại -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại <span class="text-red-500">*</span>
          </label>
          <BaseInput v-model="formData.phone" placeholder="0901234567" :error="errors.phone" />
          <p v-if="errors.phone" class="mt-1 text-sm text-red-500">{{ errors.phone }}</p>
        </div>

        <!-- Địa chỉ -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ <span class="text-red-500">*</span>
          </label>
          <BaseInput
            v-model="formData.address"
            placeholder="Nhập địa chỉ"
            :error="errors.address"
          />
          <p v-if="errors.address" class="mt-1 text-sm text-red-500">{{ errors.address }}</p>
        </div>

        <!-- Trạng thái -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái <span class="text-red-500">*</span>
          </label>
          <BaseDropdown
            v-model="formData.status"
            :options="statusOptions"
            placeholder="Chọn trạng thái"
          />
        </div>

        <!-- Vai trò -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Vai trò <span class="text-red-500">*</span>
          </label>
          <div class="border rounded-lg p-4 bg-gray-50">
            <div v-if="availableRoles.length === 0" class="text-sm text-gray-500 text-center py-4">
              Không có vai trò nào. Vui lòng tạo vai trò trước.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="role in availableRoles"
                :key="role.id"
                class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  :id="'role-' + role.id"
                  :checked="isRoleSelected(role.id)"
                  @change="toggleRole(role.id)"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label :for="'role-' + role.id" class="flex-1 cursor-pointer">
                  <div class="font-medium text-gray-800">{{ role.name }}</div>
                  <div class="text-xs text-gray-500">{{ role.description }}</div>
                </label>
                <span class="text-xs text-gray-400">{{ role.permissionCount }} quyền</span>
              </div>
            </div>
          </div>
          <p v-if="errors.roleIds" class="mt-1 text-sm text-red-500">{{ errors.roleIds }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton text="Hủy" color="gray" @click="handleClose" />
      <BaseButton
        :text="isEditMode ? 'Cập nhật' : 'Thêm mới'"
        color="primary"
        @click="handleSave"
      />
    </template>
  </DraggableModal>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
