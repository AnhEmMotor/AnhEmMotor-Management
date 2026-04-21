<script setup>
import { ref, watch, computed } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import { useRoleStore } from '@/stores/role.store'

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
  permissionStructure: {
    type: Object,
    default: null,
  },
  isFetching: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save', 'activate', 'refresh'])
const roleStore = useRoleStore()

const formData = ref({
  name: '',
  permissions: [],
})

const errors = ref({
  name: '',
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
    permissions: [],
  }
  errors.value = {
    name: '',
  }
}

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      formData.value = {
        name: newRole.name || '',
        permissions: newRole.permissions || [],
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const togglePermission = (permissionId) => {
  formData.value.permissions = roleStore.resolveTogglePermission(
    formData.value.permissions,
    permissionId,
  )
}

const isPermissionSelected = (permissionId) => {
  return formData.value.permissions.includes(permissionId)
}

const selectAllInCategory = (category) => {
  const categoryPermissions = permissionsByCategory.value[category]
  formData.value.permissions = roleStore.resolveSelectAllInCategory(
    formData.value.permissions,
    categoryPermissions,
  )
}

const isCategoryAllSelected = (category) => {
  const categoryPermissions = permissionsByCategory.value[category]
  return categoryPermissions.every((p) => formData.value.permissions.includes(p.id))
}

const validateForm = () => {
  let isValid = true
  errors.value = {
    name: '',
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

  return isValid
}

const handleSave = () => {
  if (validateForm()) {
    emit('save', {
      name: formData.value.name.trim(),
      permissions: formData.value.permissions,
    })
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleRefresh = () => {
  if (props.role?.id) {
    emit('refresh', props.role.id)
  }
}
</script>

<template>
  <DraggableModal
    :zIndex="zIndex"
    width="800px"
    :isLoading="isFetching"
    :onRefresh="isEditMode ? handleRefresh : undefined"
    @close="handleClose"
    @activate="emit('activate')"
  >
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
                  <label
                    v-for="permission in permissions"
                    :key="permission.id"
                    :for="'permission-' + permission.id"
                    class="block px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer m-0"
                  >
                    <div class="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        :id="'permission-' + permission.id"
                        :checked="isPermissionSelected(permission.id)"
                        @change="togglePermission(permission.id)"
                        class="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-gray-800 text-sm">
                          {{ permission.name }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                          {{ permission.description }}
                        </div>
                      </div>
                    </div>
                  </label>
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


