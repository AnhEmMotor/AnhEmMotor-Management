<template>
  <div>
    <!-- Mobile Header -->
    <div
      class="lg:hidden fixed top-0 left-0 w-full bg-white shadow-md z-30 h-16 flex items-center justify-between px-4"
    >
      <div class="flex items-center h-full py-2">
        <img src="/anhemmotor.webp" alt="AnhEm Motor Admin" class="h-full w-auto object-contain" />
      </div>
      <div class="flex items-center gap-3">
        <!-- User Info - Hidden on very small screens -->
        <div class="hidden sm:flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0"
          >
            {{ authStore.user?.fullName?.charAt(0) || 'A' }}
          </div>
          <span class="text-sm font-medium text-gray-700 truncate max-w-[120px]">
            {{ authStore.user?.fullName }}
          </span>
        </div>

        <!-- Logout Button - Always Visible -->
        <button
          @click="handleLogout"
          class="text-gray-500 hover:text-red-600 transition-colors p-1"
          title="Đăng xuất"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>

        <!-- Hamburger Menu -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-600 focus:outline-none ml-2">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col z-40 transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="p-6 flex flex-col items-center flex-shrink-0 relative">
        <!-- Close button for mobile -->
        <button
          @click="isMobileMenuOpen = false"
          class="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-gray-700"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <div class="mb-8 mt-2 lg:mt-8 px-4">
          <img src="/anhemmotor.webp" alt="AnhEm Motor Admin" class="h-16 w-auto object-contain" />
        </div>
      </div>

      <nav class="w-full flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <ul class="space-y-1">
          <li>
            <RouterLink
              to="/"
              class="flex items-center space-x-3 p-3 rounded-lg w-full font-medium"
              active-class=""
              exact
              :class="
                route.path === '/'
                  ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent'
              "
              @click="closeMobileMenu"
            >
              <IconHome class="flex-shrink-0" :class="route.path === '/' ? 'text-red-600' : 'text-gray-500'" />
              <span>Trang chủ</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/products"
              class="flex items-center space-x-3 p-3 rounded-lg w-full font-medium"
              active-class="bg-red-50 text-red-700 border-l-4 border-red-600"
              :class="
                route.path.startsWith('/products')
                  ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent'
              "
              @click="closeMobileMenu"
            >
              <IconProduct class="flex-shrink-0" :class="route.path.startsWith('/products') ? 'text-red-600' : 'text-gray-500'" />
              <span>Sản phẩm</span>
            </RouterLink>
          </li>

          <li>
            <button
              @click="toggleGroup('warehouse')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent"
              :class="{ 'text-red-700': isGroupActive('warehouse') }"
            >
              <div class="flex items-center space-x-3">
                <IconWarehouse class="flex-shrink-0" :class="isGroupActive('warehouse') ? 'text-red-600' : 'text-gray-500'" />
                <span>Kho vận</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('warehouse')" />
            </button>

            <ul v-if="openGroups.includes('warehouse')" class="mt-1 space-y-1 pl-3">
              <li>
                <RouterLink
                  to="/suppliers"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/suppliers'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Nhà cung cấp</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/inputs"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/inputs'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Nhập kho</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/price-management"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/price-management'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Thiết lập giá</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li>
            <button
              @click="toggleGroup('user')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent"
              :class="{ 'text-red-700': isGroupActive('user') }"
            >
              <div class="flex items-center space-x-3">
                <IconUser class="flex-shrink-0" :class="isGroupActive('user') ? 'text-red-600' : 'text-gray-500'" />
                <span>Người dùng</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('user')" />
            </button>

            <ul v-if="openGroups.includes('user')" class="mt-1 space-y-1 pl-3">
              <li>
                <RouterLink
                  to="/users"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/users'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Danh sách</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/permissions"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/permissions'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Vai trò & quyền hạn</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li>
            <RouterLink
              to="/orders"
              class="flex items-center space-x-3 p-3 rounded-lg w-full font-medium"
              active-class="bg-red-50 text-red-700 border-l-4 border-red-600"
              :class="
                route.path.startsWith('/orders')
                  ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent'
              "
              @click="closeMobileMenu"
            >
              <IconOrder class="flex-shrink-0" :class="route.path.startsWith('/orders') ? 'text-red-600' : 'text-gray-500'" />
              <span>Đơn hàng</span>
            </RouterLink>
          </li>

          <li>
            <button
              @click="toggleGroup('reports')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent"
              :class="{ 'text-red-700': isGroupActive('reports') }"
            >
              <div class="flex items-center space-x-3">
                <IconReport class="flex-shrink-0" :class="isGroupActive('reports') ? 'text-red-600' : 'text-gray-500'" />
                <span>Báo cáo</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('reports')" />
            </button>

            <ul v-if="openGroups.includes('reports')" class="mt-1 space-y-1 pl-3">
              <li>
                <RouterLink
                  to="/report-warehouse"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/report-warehouse'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Tồn kho</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/report-revenue"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/report-revenue'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Doanh thu</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/report-product"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/report-product'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Sản phẩm</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li>
            <RouterLink
              to="/settings"
              class="flex items-center space-x-3 p-3 rounded-lg w-full font-medium"
              active-class="bg-red-50 text-red-700 border-l-4 border-red-600"
              :class="
                route.path.startsWith('/settings')
                  ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent'
              "
              @click="closeMobileMenu"
            >
              <IconSettings class="flex-shrink-0" :class="route.path.startsWith('/settings') ? 'text-red-600' : 'text-gray-500'" />
              <span>Cài đặt</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="mt-auto w-full p-4 border-t border-gray-100 bg-gray-50/50">
        <LoadingOverlay :show="loading" message="Đang đăng xuất..." />
        <div class="flex items-center gap-3 w-full rounded-xl p-2">
          <div
            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0"
          >
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
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
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

const openGroups = ref([])
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const isMobileMenuOpen = ref(false)

const handleLogout = async () => {
  loading.value = true
  try {
    await authStore.logout()
    router.push('/login')
  } finally {
    loading.value = false
  }
}

// Group Routes Mapping
const groupRoutes = {
  warehouse: ['/suppliers', '/inputs', '/price-management'],
  user: ['/users', '/permissions'],
  reports: ['/report-warehouse', '/report-revenue', '/report-product'],
}

// Accordion Logic: Only one group open at a time
const toggleGroup = (group) => {
  const index = openGroups.value.indexOf(group)
  if (index > -1) {
    // If clicking open group, close it
    openGroups.value = []
  } else {
    // If clicking closed group, open it and close others
    openGroups.value = [group]
  }
}

// Check if a group has an active child
const isGroupActive = (group) => {
  return groupRoutes[group].some(path => route.path.startsWith(path))
}

const openActiveGroup = (path) => {
  for (const groupName in groupRoutes) {
    if (groupRoutes[groupName].some(p => path.startsWith(p))) {
      // Accordion: Set only this group as open
      openGroups.value = [groupName]
      return
    }
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

watch(
  () => route.path,
  (newPath) => {
    openActiveGroup(newPath)
  },
  { immediate: true },
)

// Close mobile menu when screen size changes to desktop
const  checkScreenSize = () => {
    if (window.innerWidth >= 1024) {
        isMobileMenuOpen.value = false
    }
}

onMounted(() => {
    window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
/* Custom scrollbar for sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
