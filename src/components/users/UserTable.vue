<template>
  <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <table class="min-w-full bg-white">
      <thead
        class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
      >
        <tr>
          <th class="py-3 px-6 text-left">Tên Nhân Viên</th>
          <th class="py-3 px-6 text-left">Email</th>
          <th class="py-3 px-6 text-left">Số Điện Thoại</th>
          <th class="py-3 px-6 text-left">Số vai trò</th>
          <th class="py-3 px-6 text-left">Trạng Thái</th>
          <th class="py-3 px-6 text-center">Thao Tác</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm font-light">
        <tr v-if="isError">
          <td colspan="6">
            <div class="text-center py-12 text-red-500 font-medium">
              {{ errorMessage }}
            </div>
          </td>
        </tr>
        <template v-else-if="users.length === 0">
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="`skeleton-${i}`" class="border-b border-gray-100">
              <td class="py-3 px-6 text-left"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="py-3 px-6 text-left"><SkeletonLoader width="90%" height="16px" /></td>
              <td class="py-3 px-6 text-left"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="py-3 px-6 text-left">
                <SkeletonLoader width="70%" height="24px" class="rounded-full" />
              </td>
              <td class="py-3 px-6 text-left">
                <SkeletonLoader width="60%" height="24px" class="rounded-full" />
              </td>
              <td class="py-3 px-6 text-center">
                <div class="flex justify-center gap-2">
                  <SkeletonLoader width="30px" height="20px" class="rounded" />
                  <SkeletonLoader width="30px" height="20px" class="rounded" />
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="text-center py-6 text-gray-500">
              Không tìm thấy nhân viên nào.
            </td>
          </tr>
        </template>
        <tr
          v-else
          v-for="user in users"
          :key="user.id"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-6 text-left">{{ user.fullName }}</td>
          <td class="py-3 px-6 text-left">{{ user.email }}</td>
          <td class="py-3 px-6 text-left">{{ user.phoneNumber }}</td>
          <td class="py-3 px-6 text-left">
            <RoundBadge color="blue" class="text-xs font-semibold">
              {{ user.roles?.length || 0 }} vai trò
            </RoundBadge>
          </td>
          <td class="py-3 px-6 text-left">
            <RoundBadge color="gray">{{ statusText[user.status] || user.status }}</RoundBadge>
          </td>
          <td class="py-3 px-6">
            <div v-if="user.id !== currentUserId" class="flex justify-center items-center gap-3">
              <button
                v-if="hasPermission(Permissions.UsersEdit)"
                @click="$emit('edit', user.id)"
                class="text-blue-500 hover:text-blue-700 transition"
                title="Sửa thông tin"
              >
                <IconEdit class="w-5 h-5" />
              </button>
              <button
                v-if="hasPermission(Permissions.UsersChangePassword)"
                @click="$emit('changePassword', user.id)"
                class="text-gray-500 hover:text-gray-700 transition"
                title="Đổi mật khẩu"
              >
                <IconKey class="w-5 h-5" />
              </button>
              <button
                v-if="hasPermission(Permissions.UsersAssignRoles)"
                @click="$emit('assignRoles', user.id)"
                class="text-green-500 hover:text-green-700 transition"
                title="Phân quyền"
              >
                <IconUser class="w-5 h-5" />
              </button>
              <button
                v-if="hasPermission(Permissions.UsersEdit) && user.status !== 'Banned'"
                @click="$emit('ban', user.id)"
                class="text-red-500 hover:text-red-700 transition"
                title="Khóa tài khoản"
              >
                <IconLock class="w-5 h-5" />
              </button>
              <button
                v-if="hasPermission(Permissions.UsersEdit) && user.status === 'Banned'"
                @click="$emit('unban', user.id)"
                class="text-green-600 hover:text-green-800 transition"
                title="Mở khóa tài khoản"
              >
                <IconCheckCircle class="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import RoundBadge from '@/components/ui/RoundBadge.vue'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconKey from '@/assets/icons/key.svg'
import IconLock from '@/assets/icons/login-lock.svg'
import IconUser from '@/assets/icons/IconUser.svg'
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

const { hasPermission } = usePermission()

defineProps({
  users: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  currentUserId: {
    type: String,
    default: '',
  },
})

defineEmits(['edit', 'changePassword', 'assignRoles', 'ban', 'unban'])

const statusText = {
  Active: 'Hoạt Động',
  Banned: 'Đã Khóa',
}
</script>
