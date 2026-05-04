<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/ui/button/BaseButton.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import IconAvatarEdit from '@/assets/icons/avatar-edit.svg'
import { useToast } from 'vue-toastification'
import { useQuery } from '@tanstack/vue-query'
import userService from '@/services/user.service'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import DateTimePicker from '@/components/ui/input/DateTimePicker.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

const toast = useToast()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const user = computed(() => authStore.user || {})
const apiUrl = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:3000'

const activeTab = computed({
  get: () => route.query.tab || 'profile',
  set: (val) => router.replace({ query: { ...route.query, tab: val } }),
})

const { data: genderOptions, isLoading: isGendersLoading } = useQuery({
  queryKey: ['gender-options'],
  queryFn: () => userService.getGenderOptions(),
  enabled: computed(() => activeTab.value === 'profile'),
})

const profileForm = ref({
  fullName: user.value.fullName || '',
  gender: user.value.gender || '',
  phoneNumber: user.value.phoneNumber || '',
  dateOfBirth: user.value.dateOfBirth?.split('T')[0] || '',
})

watch(
  user,
  (newUser) => {
    if (newUser && !profileForm.value.fullName && !profileForm.value.phoneNumber) {
      profileForm.value = {
        fullName: newUser.fullName || '',
        gender: newUser.gender || '',
        phoneNumber: newUser.phoneNumber || '',
        dateOfBirth: newUser.dateOfBirth?.split('T')[0] || '',
      }
    }
  },
  { immediate: true },
)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const fileInputRef = ref(null)
const isUploadingAvatar = ref(false)
const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)

const handleUpdateProfile = async () => {
  if (profileForm.value.phoneNumber && profileForm.value.phoneNumber.trim() !== '') {
    if (!/^\d{10,11}$/.test(profileForm.value.phoneNumber)) {
      toast.error('Số điện thoại phải có 10-11 chữ số')
      return
    }
  }

  try {
    isUpdatingProfile.value = true
    await authStore.updateProfile(profileForm.value)
    toast.success('Cập nhật thông tin thành công')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Cập nhật thất bại')
  } finally {
    isUpdatingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Mật khẩu mới không khớp')
    return
  }
  try {
    isChangingPassword.value = true
    await authStore.changePassword(passwordForm.value)
    toast.success('Đổi mật khẩu thành công')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    const errorData = error.response?.data
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      errorData.errors.forEach((err) => {
        toast.error(err.message || err.field || 'Đổi mật khẩu thất bại')
      })
    } else {
      toast.error(errorData?.message || 'Đổi mật khẩu thất bại')
    }
  } finally {
    isChangingPassword.value = false
  }
}

const handleAvatarClick = () => {
  fileInputRef.value?.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    isUploadingAvatar.value = true
    await authStore.uploadAvatar(file)
    toast.success('Tải lên ảnh đại diện thành công')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Tải ảnh thất bại')
  } finally {
    isUploadingAvatar.value = false
    event.target.value = ''
  }
}
</script>

<template>
  <div class="p-6 bg-white rounded-xl shadow-sm">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Hồ sơ cá nhân</h1>

    <div class="flex border-b border-gray-200 mb-6">
      <button
        @click="activeTab = 'profile'"
        class="py-2 px-4 font-medium text-sm focus:outline-none transition-colors duration-200"
        :class="
          activeTab === 'profile'
            ? 'text-red-600 border-b-2 border-red-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Thông tin cá nhân
      </button>
      <button
        @click="activeTab = 'password'"
        class="py-2 px-4 font-medium text-sm focus:outline-none transition-colors duration-200"
        :class="
          activeTab === 'password'
            ? 'text-red-600 border-b-2 border-red-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Đổi mật khẩu
      </button>
    </div>

    <div v-if="activeTab === 'profile'" class="max-w-xl">
      <LoadingOverlay :show="isUploadingAvatar || isUpdatingProfile" />

      <template v-if="isGendersLoading && !genderOptions">
        <div class="space-y-6">
          <div class="flex items-center gap-4">
            <SkeletonLoader width="80px" height="80px" class="rounded-full" />
            <div class="space-y-2">
              <SkeletonLoader width="150px" height="24px" />
              <SkeletonLoader width="200px" height="16px" />
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <SkeletonLoader width="80px" height="16px" class="mb-2" />
              <SkeletonLoader width="100%" height="42px" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SkeletonLoader width="80px" height="16px" class="mb-2" />
                <SkeletonLoader width="100%" height="42px" />
              </div>
              <div>
                <SkeletonLoader width="80px" height="16px" class="mb-2" />
                <SkeletonLoader width="100%" height="42px" />
              </div>
            </div>
            <div>
              <SkeletonLoader width="80px" height="16px" class="mb-2" />
              <SkeletonLoader width="100%" height="42px" />
            </div>
            <div class="pt-4">
              <SkeletonLoader width="120px" height="42px" />
            </div>
          </div>
        </div>
      </template>

      <div v-else class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="relative">
            <template v-if="user.avatarUrl">
              <img
                :src="
                  user.avatarUrl.startsWith('http')
                    ? user.avatarUrl
                    : `${apiUrl}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`
                "
                alt="Avatar"
                class="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-white shadow-md"
              />
            </template>
            <template v-else>
              <div
                class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-3xl shrink-0 border-2 border-white shadow-md"
              >
                {{ user.fullName?.charAt(0)?.toUpperCase() || 'A' }}
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
            <h3 class="text-lg font-semibold text-gray-800">{{ user.fullName || 'Người dùng' }}</h3>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <Input
              v-model="profileForm.fullName"
              placeholder="Nhập họ tên"
              inputClass="h-[42px] px-3"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <select
                v-model="profileForm.gender"
                class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2 border h-[42px] appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:20px] transition-all duration-200 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%221.5%22%20stroke%3D%22%236B7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19.5%208.25-7.5%207.5-7.5-7.5%22%20%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="" disabled>Chọn giới tính</option>
                <option v-for="opt in genderOptions" :key="opt.key" :value="opt.key">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <Input
                v-model="profileForm.phoneNumber"
                placeholder="Nhập số điện thoại"
                inputClass="h-[42px] px-3"
              />
            </div>
          </div>
          <div>
            <DateTimePicker v-model="profileForm.dateOfBirth" label="Ngày sinh" />
          </div>
          <div class="pt-4">
            <Button color="primary" text="Lưu thay đổi" @click="handleUpdateProfile" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'password'" class="max-w-xl">
      <LoadingOverlay :show="isChangingPassword" />
      <form class="space-y-4" @submit.prevent="handleChangePassword">
        <input
          type="text"
          name="username"
          :value="user.email"
          autocomplete="username"
          class="hidden"
          style="display: none"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <Input
            autocomplete="current-password"
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="••••••"
            inputClass="h-[42px] px-3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <Input
            autocomplete="new-password"
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="••••••"
            inputClass="h-[42px] px-3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
          <Input
            autocomplete="new-password"
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="••••••"
            inputClass="h-[42px] px-3"
          />
        </div>

        <div class="pt-4">
          <Button color="primary" text="Đổi mật khẩu" type="submit" />
        </div>
      </form>
    </div>
  </div>
</template>
