<template>
  <!-- Sidebar -->
  <div
    class="w-72 bg-white text-gray-800 p-6 shadow-xl flex-shrink-0 flex flex-col items-center fixed top-0 left-0 h-full"
  >
    <h1 class="text-3xl font-bold mb-8 text-center text-red-700">AnhEm Motor</h1>
    <nav class="w-full">
      <ul class="space-y-4">
        <!-- Trong ứng dụng thực tế, bạn sẽ dùng <router-link> thay vì <a>. -->
        <li v-for="item in navItems" :key="item.name">
          <a
            :href="item.href"
            :class="[
              'flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200',
              item.name === 'Báo cáo'
                ? 'bg-white text-red-700' 
                : 'hover:bg-gray-200 text-gray-800',
              item.name === 'Phân Tích Doanh Thu' ? 'text-gray-500' : 'text-gray-800'
            ]"
          >
            <i :class="[item.icon, 'w-6 text-xl text-center text-red-600', item.name === 'Báo cáo' ? 'text-red-700' : '']"></i>
            <span>{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const navItems = computed(() => [
  { name: 'Trang chủ', href: 'index.html', icon: 'fa-solid fa-house' },
  { name: 'Báo cáo', href: 'report.html', icon: 'fa-solid fa-chart-line' },
  { name: 'Phân Tích Doanh Thu', href: 'revenue.html', icon: 'fa-solid fa-chart-pie' },
  { name: 'Báo Cáo Sản Phẩm', href: 'inventory.html', icon: 'fa-solid fa-box' },
  { name: 'Quản lý Khách Hàng', href: 'quanlykh.html', icon: 'fa-solid fa-users' },
  { name: 'Quản lý Đơn Hàng', href: 'order1.html', icon: 'fa-solid fa-cart-shopping' },
  { name: 'Quản lý Nhập Hàng', href: 'nhaphang.html', icon: 'fa-solid fa-truck-ramp-box' },
  { name: 'Quản lý Sản Phẩm', href: 'quanlysp.html', icon: 'fa-solid fa-motorcycle' },
]);
</script>

<style scoped>
/* CSS overrides from the original file applied here */
.bg-red-100 {
    background-color: white !important; /* Đã chuyển thành class trực tiếp trong template */
}

/* Lưu ý: Trong file HTML gốc, class .text-gray-500 bị override
  để có màu nền là #f3f4f6 (màu nền body).
  Tôi sẽ áp dụng override này trực tiếp cho link 'Phân Tích Doanh Thu'
  để đảm bảo giao diện chính xác.
*/
a.text-gray-500 {
    background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));
}
</style>
