<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const user = ref({ ...authStore.user })
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Sync activeTab with URL query 'tab'
const activeTab = computed({
  get: () => route.query.tab || 'profile',
  set: (val) => router.replace({ query: { ...route.query, tab: val } })
})

const handleUpdateProfile = () => {
  // Placeholder for profile update logic
  console.log('Update profile:', user.value)
  alert('Tính năng cập nhật thông tin đang được phát triển')
}

const handleChangePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Mật khẩu mới không khớp')
    return
  }
  // Placeholder for password change logic
  console.log('Change password:', passwordForm.value)
  alert('Tính năng đổi mật khẩu đang được phát triển')
}
</script>

<template>
  <div class="p-6 bg-white rounded-xl shadow-sm">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Hồ sơ cá nhân</h1>

    <div class="flex border-b border-gray-200 mb-6">
      <button
        @click="activeTab = 'profile'"
        class="py-2 px-4 font-medium text-sm focus:outline-none transition-colors duration-200"
        :class="activeTab === 'profile' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'"
      >
        Thông tin cá nhân
      </button>
      <button
        @click="activeTab = 'password'"
        class="py-2 px-4 font-medium text-sm focus:outline-none transition-colors duration-200"
        :class="activeTab === 'password' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'"
      >
        Đổi mật khẩu
      </button>
    </div>

    <div v-if="activeTab === 'profile'" class="max-w-xl animate-fade-in-up">
      <div class="space-y-6">
        <!-- Avatar Section -->
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-3xl shrink-0 border-2 border-white shadow-md">
              {{ user.fullName?.charAt(0) || 'A' }}
            </div>
            <!-- Optional: Camera icon overlay for upload feature later -->
            <!-- <button class="absolute bottom-0 right-0 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition" title="Đổi ảnh đại diện">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button> -->
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ user.fullName }}</h3>
            <p class="text-sm text-gray-500">{{ user.role || 'Administrator' }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <Input v-model="user.fullName" placeholder="Nhập họ tên" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input v-model="user.email" type="email" disabled class="bg-gray-50 cursor-not-allowed" />
          </div>
          <div class="pt-4">
            <Button color="primary" text="Lưu thay đổi" @click="handleUpdateProfile" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'password'" class="max-w-xl animate-fade-in-up">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <Input v-model="passwordForm.currentPassword" type="password" placeholder="••••••" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <Input v-model="passwordForm.newPassword" type="password" placeholder="••••••" />
        </div>
        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
           <Input v-model="passwordForm.confirmPassword" type="password" placeholder="••••••" />
        </div>
        <div class="pt-4">
          <Button color="primary" text="Đổi mật khẩu" @click="handleChangePassword" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
