<script setup lang="js">
import { ref, watch } from 'vue'
import IconHome from '@/components/icons/IconHome.vue'
import IconReport from '@/components/icons/IconReport.vue'
import IconProduct from '@/components/icons/IconProduct.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconOrder from '@/components/icons/IconOrder.vue'
import IconUpArrow from '@/components/icons/IconUpArrow.vue'
import IconWarehouse from '@/components/icons/IconWarehouse.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter, useRoute } from 'vue-router'
import BaseLoadingOverlay from '@/components/ui/BaseLoadingOverlay.vue'

const openGroups = ref([])
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const handleLogout = async () => {
  loading.value = true
  try {
    await authStore.logout()
    router.push('/login')
  } finally {
    loading.value = false
  }
}

const toggleGroup = (group) => {
  const index = openGroups.value.indexOf(group)
  if (index > -1) {
    openGroups.value.splice(index, 1)
  } else {
    openGroups.value.push(group)
  }
}

const groupRoutes = {
  warehouse: ['/suppliers', '/inputs', '/price-management'],
  user: ['/users', '/permissions'],
  reports: ['/report-warehouse', '/report-revenue', '/report-product'],
}

const openActiveGroup = (path) => {
  for (const groupName in groupRoutes) {
    if (groupRoutes[groupName].includes(path)) {
      if (!openGroups.value.includes(groupName)) {
        openGroups.value.push(groupName)
      }
      return
    }
  }
}

watch(
  () => route.path,
  (newPath) => {
    openActiveGroup(newPath)
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="fixed left-0 top-0 w-84 h-full p-6 shadow-xl flex-shrink-0 flex flex-col items-center bg-white"
  >
    <BaseLoadingOverlay :show="loading" message="Đang đăng xuất..." />
    <h1 class="text-2xl font-bold mb-8 mt-8 text-red-500">AnhEm Motor Admin</h1>
    <nav class="w-full">
      <ul class="space-y-2">
        <li>
          <RouterLink
            to="/"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full"
            active-class=" "
            exact-active-class="bg-gray-200 text-black font-semibold"
          >
            <IconHome />
            <span>Trang chủ</span>
          </RouterLink>
        </li>

        <li>
          <RouterLink
            to="/products"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full"
          >
            <IconProduct />
            <span>Quản lý sản phẩm</span>
          </RouterLink>
        </li>

        <li>
          <button
            @click="toggleGroup('warehouse')"
            class="flex items-center justify-between space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full cursor-pointer"
          >
            <div class="flex items-center space-x-3">
              <IconWarehouse />
              <span>Quản lý kho</span>
            </div>

            <IconUpArrow :isOpen="openGroups.includes('warehouse')" />
          </button>

          <ul v-if="openGroups.includes('warehouse')" class="mt-2 space-y-2 pl-5">
            <li>
              <RouterLink
                to="/suppliers"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Quản lý nhà cung cấp</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/inputs"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Quản lý phiếu nhập kho</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/price-management"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Thiết lập giá bán</span>
              </RouterLink>
            </li>
          </ul>
        </li>

        <li>
          <button
            @click="toggleGroup('user')"
            class="flex items-center justify-between space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full cursor-pointer"
          >
            <div class="flex items-center space-x-3">
              <IconUser />
              <span>Quản lý người dùng</span>
            </div>

            <IconUpArrow :isOpen="openGroups.includes('user')" />
          </button>

          <ul v-if="openGroups.includes('user')" class="mt-2 space-y-2 pl-5">
            <li>
              <RouterLink
                to="/users"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Quản lý thông tin & vai trò người dùng</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/permissions"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Quản lý danh sách vai trò & quyền hạn của vai trò</span>
              </RouterLink>
            </li>
          </ul>
        </li>

        <li>
          <RouterLink
            to="/orders"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full"
          >
            <IconOrder />
            <span>Quản lý đơn hàng</span>
          </RouterLink>
        </li>

        <li>
          <button
            @click="toggleGroup('reports')"
            class="flex items-center justify-between space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full cursor-pointer"
          >
            <div class="flex items-center space-x-3">
              <IconReport />
              <span>Báo cáo</span>
            </div>

            <IconUpArrow :isOpen="openGroups.includes('reports')" />
          </button>

          <ul v-if="openGroups.includes('reports')" class="mt-2 space-y-2 pl-5">
            <li>
              <RouterLink
                to="/report-warehouse"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Báo cáo kho</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/report-revenue"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Phân tích doanh thu</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/report-product"
                class="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm"
              >
                <span>Báo cáo sản phẩm</span>
              </RouterLink>
            </li>
          </ul>
        </li>

        <li>
          <RouterLink
            to="/settings"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full"
          >
            <IconSettings />
            <span>Cài đặt chung</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
    
    <div class="mt-auto w-full p-4">
      <div class="flex items-center gap-3 w-full rounded-xl p-3">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
          {{ authStore.user?.fullName?.charAt(0) || 'A' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ authStore.user?.fullName || 'Admin User' }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ authStore.user?.role || 'Administrator' }}
          </p>
        </div>
        
        <button
          @click="handleLogout"
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all duration-200 shrink-0"
          title="Đăng xuất"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
@reference "../../assets/main.css";

.router-link-active {
  @apply bg-gray-200 text-black font-semibold;
}
</style>
