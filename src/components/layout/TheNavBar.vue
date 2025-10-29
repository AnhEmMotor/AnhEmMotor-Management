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
import { useRoute } from 'vue-router'

const openGroups = ref([])
const route = new useRoute()

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
    <h1 class="text-2xl font-bold mb-8 text-red-500">AnhEm Motor Admin</h1>
    <nav class="w-full">
      <ul class="space-y-2">
        <li>
          <RouterLink
            to="/"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full"
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
  </div>
</template>

<style lang="css" scoped>
@reference "../../assets/main.css";

.router-link-active {
  @apply bg-gray-200 text-black font-semibold;
}
</style>
