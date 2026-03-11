<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Dropdown from '@/components/ui/input/BaseDropdown.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import { useToast } from 'vue-toastification'
import { usePermission } from '@/composables/usePermission'
import { useQuery } from '@tanstack/vue-query'
import { getGenderOptions } from '@/api/options'
import { uploadUserAvatar } from '@/api/user'
import IconAvatarEdit from '@/assets/icons/avatar-edit.svg'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import DateTimePicker from '@/components/ui/input/DateTimePicker.vue'
import { Permissions } from '@/constants/permissions'

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
  isSaving: {
    type: Boolean,
    default: false,
  },
  isFetching: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save', 'activate', 'refresh'])
const toast = useToast()
const { hasPermission } = usePermission()

// Lấy danh sách giới tính từ API (Dùng chung bộ nhớ đệm)
const { data: genderOptions } = useQuery({
  queryKey: ['gender-options'],
  queryFn: getGenderOptions,
  staleTime: Infinity,
})

const formData = ref({
  code: '',
  name: '',
  gender: '',
  email: '',
  phone: '',
  status: 'active',
  roleIds: [],
  avatarUrl: '',
  dateOfBirth: '',
})

const errors = ref({
  code: '',
  name: '',
  gender: '',
  email: '',
  phone: '',
  roleIds: '',
})

const statusOptions = [
  { value: 'active', text: 'Hoạt động' },
  { value: 'new', text: 'Mới' },
  { value: 'inactive', text: 'Không hoạt động' },
]

const resetForm = () => {
  formData.value = {
    code: '',
    name: '',
    gender: '',
    email: '',
    phone: '',
    status: 'active',
    roleIds: [],
  }
  errors.value = {
    code: '',
    name: '',
    gender: '',
    email: '',
    phone: '',
    roleIds: '',
  }
}

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formData.value = {
        code: newUser.code || '',
        name: newUser.fullName || newUser.name || '',
        gender: newUser.gender || '',
        email: newUser.email || '',
        phone: newUser.phoneNumber || newUser.phone || '',
        status: (newUser.status || 'active').toLowerCase(),
        roleIds: newUser.roles ? [...newUser.roles] : newUser.roleIds ? [...newUser.roleIds] : [],
        avatarUrl: newUser.avatarUrl || '',
        dateOfBirth: newUser.dateOfBirth?.split('T')[0] || '',
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const fileInputRef = ref(null)
const isUploadingAvatar = ref(false)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const handleAvatarClick = () => {
  fileInputRef.value?.click()
}

const handleAvatarChange = async (event) => {
  if (!props.user?.id) return
  const file = event.target.files[0]
  if (!file) return

  try {
    isUploadingAvatar.value = true
    const newAvatarUrl = await uploadUserAvatar(props.user.id, file)
    formData.value.avatarUrl = newAvatarUrl
    toast.success('Cập nhật ảnh đại diện thành công')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Tải ảnh thất bại')
  } finally {
    isUploadingAvatar.value = false
    event.target.value = ''
  }
}

const validateForm = () => {
  let isValid = true
  errors.value = {
    code: '',
    name: '',
    gender: '',
    email: '',
    phone: '',
    roleIds: '',
  }

  if (!formData.value.gender || formData.value.gender === '') {
    errors.value.gender = 'Vui lòng chọn giới tính'
    isValid = false
  }

  if (!props.isEditMode) {
    if (!formData.value.code || formData.value.code.trim() === '') {
      errors.value.code = 'Mã khách hàng không được để trống'
      isValid = false
    }
  }

  if (!formData.value.name || formData.value.name.trim() === '') {
    errors.value.name = 'Tên khách hàng không được để trống'
    isValid = false
  }

  if (!formData.value.email || formData.value.email.trim() === '') {
    errors.value.email = 'Email không được để trống'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Email không hợp lệ'
    isValid = false
  }

  if (!formData.value.phone || formData.value.phone.trim() === '') {
    errors.value.phone = 'Số điện thoại không được để trống'
    isValid = false
  } else if (!/^[0-9]{10,11}$/.test(formData.value.phone)) {
    errors.value.phone = 'Số điện thoại phải có 10-11 chữ số'
    isValid = false
  }

  return isValid
}

const handleSave = () => {
  if (validateForm()) {
    emit('save', {
      code: formData.value.code.trim(),
      fullName: formData.value.name.trim(),
      gender: formData.value.gender,
      email: formData.value.email.trim(),
      phoneNumber: formData.value.phone.trim(),
      status: formData.value.status,
      roleNames: formData.value.roleIds,
      dateOfBirth: formData.value.dateOfBirth || null,
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

const handleRefresh = () => {
  if (props.isEditMode && props.user?.id) {
    emit('refresh', props.user.id)
  } else {
    resetForm()
    toast.info('Đã làm mới form')
  }
}
</script>

<template>
  <DraggableModal
    :zIndex="zIndex"
    width="700px"
    :onRefresh="handleRefresh"
    @close="handleClose"
    @activate="emit('activate')"
  >
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">
        {{ isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}
      </h3>
    </template>

    <template #body>
      <LoadingOverlay :show="isSaving || isUploadingAvatar || isFetching" />
      <div class="space-y-4 overflow-y-auto pr-2">
        <!-- Avatar Section for Edit Mode -->
        <div v-if="isEditMode" class="flex items-center gap-4 mb-6">
          <div class="relative">
            <template v-if="formData.avatarUrl">
              <img
                :src="
                  formData.avatarUrl.startsWith('http')
                    ? formData.avatarUrl
                    : `${apiUrl}${formData.avatarUrl.startsWith('/') ? '' : '/'}${formData.avatarUrl}`
                "
                alt="Avatar"
                class="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-white shadow-md"
              />
            </template>
            <template v-else>
              <div
                class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-3xl shrink-0 border-2 border-white shadow-md"
              >
                {{ formData.name?.charAt(0)?.toUpperCase() || 'A' }}
              </div>
            </template>
            <button
              class="absolute bottom-0 right-0 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
              title="Đổi ảnh đại diện"
              @click="handleAvatarClick"
            >
              <IconAvatarEdit class="h-3 w-3" />
            </button>
            <input
              type="file"
              ref="fileInputRef"
              class="hidden"
              accept="image/*"
              @change="handleAvatarChange"
            />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ formData.name || 'Người dùng' }}</h3>
            <p class="text-sm text-gray-500">{{ formData.email }}</p>
          </div>
        </div>

        <div v-if="!isEditMode">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mã khách hàng <span class="text-red-500">*</span>
          </label>
          <Input
            v-model="formData.code"
            placeholder="VD: KH001"
            :error="errors.code"
            inputClass="h-[42px] px-3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tên khách hàng <span class="text-red-500">*</span>
          </label>
          <Input
            v-model="formData.name"
            placeholder="Nhập tên khách hàng"
            :error="errors.name"
            inputClass="h-[42px] px-3"
          />
        </div>

        <div v-if="!isEditMode">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email <span class="text-red-500">*</span>
          </label>
          <Input
            v-model="formData.email"
            type="email"
            placeholder="example@email.com"
            :error="errors.email"
            inputClass="h-[42px] px-3"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Giới tính <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.gender"
              class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2 border h-[42px] appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:20px] transition-all duration-200"
              style="
                background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E&quot;);
              "
              :class="{ 'border-red-500': errors.gender }"
            >
              <option value="" disabled>Chọn giới tính</option>
              <option v-for="opt in genderOptions" :key="opt.key" :value="opt.key">
                {{ opt.label }}
              </option>
            </select>
            <p v-if="errors.gender" class="mt-1 text-sm text-red-500">{{ errors.gender }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="formData.phone"
              placeholder="0901234567"
              :error="errors.phone"
              inputClass="h-[42px] px-3"
            />
          </div>
        </div>

        <div>
          <DateTimePicker v-model="formData.dateOfBirth" label="Ngày sinh" />
        </div>
      </div>
    </template>

    <template #footer>
      <Button text="Hủy" color="gray" @click="handleClose" />
      <Button
        v-if="
          (isEditMode && hasPermission(Permissions.UsersEdit)) ||
          (!isEditMode && hasPermission(Permissions.UsersCreate))
        "
        :text="isEditMode ? 'Cập nhật' : 'Thêm mới'"
        color="primary"
        @click="handleSave"
      />
    </template>
  </DraggableModal>
</template>
