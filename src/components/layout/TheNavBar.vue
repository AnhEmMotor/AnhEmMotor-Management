<script setup lang="js">
import { ref } from 'vue'
import IconHome from '@/components/icons/IconHome.vue'
import IconReport from '@/components/icons/IconReport.vue'
import IconProduct from '@/components/icons/IconProduct.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconOrder from '@/components/icons/IconOrder.vue'
import IconUpArrow from '@/components/icons/IconUpArrow.vue'
import IconWarehouse from '@/components/icons/IconWarehouse.vue'
import IconSettings from '@/components/icons/IconSettings.vue'

const openGroups = ref([])

const toggleGroup = (group) => {
  const index = openGroups.value.indexOf(group)
  if (index > -1) {
    openGroups.value.splice(index, 1)
  } else {
    openGroups.value.push(group)
  }
}
</script>

<template>
  <div class="box-style">
    <h1 class="text-2xl font-bold mb-8">AnhEm Motor Admin</h1>
    <nav class="w-full">
      <ul class="space-y-2">
        <li>
          <RouterLink to="/" class="router-link">
            <IconHome />
            <span>Trang chủ</span>
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/products" class="router-link">
            <IconProduct />
            <span>Quản lý sản phẩm</span>
          </RouterLink>
        </li>

        <li>
          <button @click="toggleGroup('warehouse')" class="menu-group-button">
            <div class="flex items-center space-x-3">
              <IconWarehouse />
              <span>Quản lý kho</span>
            </div>

            <IconUpArrow :isOpen="openGroups.includes('warehouse')" />
          </button>

          <ul v-if="openGroups.includes('warehouse')" class="mt-2 space-y-2 pl-5">
            <li>
              <RouterLink to="/suppliers" class="router-link-child">
                <span>Quản lý nhà cung cấp</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/inputs" class="router-link-child">
                <span>Quản lý phiếu nhập kho</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/price-management" class="router-link-child">
                <span>Thiết lập giá bán</span>
              </RouterLink>
            </li>
          </ul>
        </li>

        <li>
          <button @click="toggleGroup('user')" class="menu-group-button">
            <div class="flex items-center space-x-3">
              <IconUser />
              <span>Quản lý người dùng</span>
            </div>

            <IconUpArrow :isOpen="openGroups.includes('user')" />
          </button>

          <ul v-if="openGroups.includes('user')" class="mt-2 space-y-2 pl-5">
            <li>
              <RouterLink to="/users" class="router-link-child">
                <span>Quản lý thông tin & vai trò người dùng</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/permissions" class="router-link-child">
                <span>Quản lý danh sách vai trò & quyền hạn của vai trò</span>
              </RouterLink>
            </li>
          </ul>
        </li>

        <li>
          <RouterLink to="/orders" class="router-link">
            <IconOrder />
            <span>Quản lý đơn hàng</span>
          </RouterLink>
        </li>

        <li>
          <button @click="toggleGroup('reports')" class="menu-group-button">
            <div class="flex items-center space-x-3">
              <IconReport />
              <span>Báo cáo</span>
            </div>

            <IconUpArrow :isOpen="openGroups.includes('reports')" />
          </button>

          <ul v-if="openGroups.includes('reports')" class="mt-2 space-y-2 pl-5">
            <li>
              <RouterLink to="/report-warehouse" class="router-link-child">
                <span>Báo cáo kho</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/report-revenue" class="router-link-child">
                <span>Phân tích doanh thu</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/report-product" class="router-link-child">
                <span>Báo cáo sản phẩm</span>
              </RouterLink>
            </li>
          </ul>
        </li>

        <li>
          <RouterLink to="/settings" class="router-link">
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

.text-black {
  color: #000000 !important;
}

.text-red-600-icon {
  color: #dc2626 !important;
}

.hover\:bg-gray-200:hover {
  background-color: #e5e7eb !important;
}

h1 {
  color: red;
}

.box-style {
  @apply fixed left-0 top-0 w-84 h-full p-6 shadow-xl flex-shrink-0 flex flex-col items-center bg-white;
}

.router-link {
  @apply flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full;
}

.menu-group-button {
  @apply flex items-center justify-between space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full cursor-pointer;
}

.router-link-child {
  @apply flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-sm;
}

.router-link-active {
  @apply bg-gray-200 text-black font-semibold;
}

.router-link-active:has(+ .router-link-child) .menu-group-button,
.router-link-child.router-link-active {
  @apply bg-gray-100 text-black;
}

.menu-group-button:focus {
  outline: none;
}
</style>
