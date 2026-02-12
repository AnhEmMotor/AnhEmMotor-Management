<script setup>
import { ref, watch, computed } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Textarea from '@/components/ui/input/BaseTextarea.vue'
import Button from '@/components/ui/button/Button.vue'
import Dropdown from '../ui/input/BaseDropdown.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  role: {
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
  availablePermissions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save', 'activate'])

const formData = ref({
  name: '',
  description: '',
  permissions: [],
  status: 'active',
})

const errors = ref({
  name: '',
  description: '',
})

const permissionsByCategory = computed(() => {
  const grouped = {}
  props.availablePermissions.forEach((permission) => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = []
    }
    grouped[permission.category].push(permission)
  })
  return grouped
})

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    permissions: [],
    status: 'active',
  }
  errors.value = {
    name: '',
    description: '',
  }
}

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      formData.value = {
        name: newRole.name || '',
        description: newRole.description || '',
        permissions: newRole.permissions || [],
        status: newRole.status || 'active',
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const togglePermission = (permissionId) => {
  const index = formData.value.permissions.indexOf(permissionId)
  if (index > -1) {
    formData.value.permissions.splice(index, 1)
  } else {
    formData.value.permissions.push(permissionId)
  }
}

const isPermissionSelected = (permissionId) => {
  return formData.value.permissions.includes(permissionId)
}

const selectAllInCategory = (category) => {
  const categoryPermissions = permissionsByCategory.value[category]
  const allSelected = categoryPermissions.every((p) => formData.value.permissions.includes(p.id))

  if (allSelected) {
    categoryPermissions.forEach((p) => {
      const index = formData.value.permissions.indexOf(p.id)
      if (index > -1) {
        formData.value.permissions.splice(index, 1)
      }
    })
  } else {
    categoryPermissions.forEach((p) => {
      if (!formData.value.permissions.includes(p.id)) {
        formData.value.permissions.push(p.id)
      }
    })
  }
}

const isCategoryAllSelected = (category) => {
  const categoryPermissions = permissionsByCategory.value[category]
  return categoryPermissions.every((p) => formData.value.permissions.includes(p.id))
}

const validateForm = () => {
  let isValid = true
  errors.value = {
    name: '',
    description: '',
  }

  if (!formData.value.name || formData.value.name.trim() === '') {
    errors.value.name = 'Tên vai trò không được để trống'
    isValid = false
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Tên vai trò phải có ít nhất 2 ký tự'
    isValid = false
  } else if (formData.value.name.trim().length > 50) {
    errors.value.name = 'Tên vai trò không được vượt quá 50 ký tự'
    isValid = false
  }

  if (formData.value.description && formData.value.description.length > 255) {
    errors.value.description = 'Ghi chú không được vượt quá 255 ký tự'
    isValid = false
  }

  return isValid
}

const handleSave = () => {
  if (validateForm()) {
    emit('save', {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      permissions: formData.value.permissions,
      status: formData.value.status,
    })
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <DraggableModal :zIndex="zIndex" width="800px" @close="handleClose" @activate="emit('activate')">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">
        {{ isEditMode ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới' }}
      </h3>
    </template>

    <template #body>
      <div class="overflow-y-auto pr-2">
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-4">
            <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Thông tin vai trò</h4>
            <div>
              <Input
                v-model="formData.name"
                label="Tên vai trò"
                placeholder="Nhập tên vai trò (VD: Quản lý, Nhân viên, ...)"
                :error="errors.name"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
            </div>
            <div>
              <Textarea
                v-model="formData.description"
                label="Ghi chú"
                placeholder="Nhập mô tả về vai trò này..."
                :rows="3"
                :error="errors.description"
              />
              <p v-if="errors.description" class="mt-1 text-sm text-red-500">
                {{ errors.description }}
              </p>
              <p class="mt-1 text-sm text-gray-500">{{ formData.description.length }}/255 ký tự</p>
            </div>

            <div>
              <Dropdown
                v-model="formData.status"
                label="Trạng thái"
                :options="[
                  { value: 'active', text: 'Hoạt động' },
                  { value: 'disabled', text: 'Vô hiệu' },
                ]"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between border-b pb-2">
              <h4 class="text-md font-semibold text-gray-800">Phân quyền cho vai trò</h4>
              <span class="text-sm text-gray-600">
                Đã chọn: <strong class="text-blue-600">{{ formData.permissions.length }}</strong> /
                {{ availablePermissions.length }} quyền
              </span>
            </div>

            <div v-if="Object.keys(permissionsByCategory).length > 0" class="space-y-3">
              <div
                v-for="(permissions, category) in permissionsByCategory"
                :key="category"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:from-gray-200 hover:to-gray-100 transition-all"
                  @click="selectAllInCategory(category)"
                >
                  <div class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      :checked="isCategoryAllSelected(category)"
                      @click.stop="selectAllInCategory(category)"
                      class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <h5 class="font-semibold text-gray-800">{{ category }}</h5>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {{ permissions.length }} quyền
                    </span>
                  </div>
                  <span class="text-sm font-medium text-blue-600">
                    {{ permissions.filter((p) => isPermissionSelected(p.id)).length }} /
                    {{ permissions.length }}
                  </span>
                </div>

                <div class="bg-white divide-y divide-gray-100">
                  <div
                    v-for="permission in permissions"
                    :key="permission.id"
                    class="px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer"
                    @click="togglePermission(permission.id)"
                  >
                    <div class="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        :id="'permission-' + permission.id"
                        :checked="isPermissionSelected(permission.id)"
                        @click.stop="togglePermission(permission.id)"
                        class="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <label :for="'permission-' + permission.id" class="flex-1 cursor-pointer">
                        <div class="font-medium text-gray-800 text-sm">
                          {{ permission.name }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                          {{ permission.description }}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50"
            >
              <p class="text-sm">Không có quyền hạn nào trong hệ thống</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <Button text="Hủy" color="gray" @click="handleClose" />
      <Button :text="isEditMode ? 'Cập nhật' : 'Thêm mới'" color="primary" @click="handleSave" />
    </template>
  </DraggableModal>
</template>
