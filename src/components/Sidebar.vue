<template>
  <!-- Sidebar -->
  <div class="w-64 bg-white text-black p-6 shadow-xl flex flex-col items-center">
    <!-- Sử dụng một div để tránh lỗi CSS h1 { color: red !important; } ghi đè trong Vue scope -->
    <div class="text-3xl font-bold mb-8 text-gray-800 sidebar-title">AnhEm Motor</div>
    <nav class="w-full">
      <ul class="space-y-4">
        <li v-for="item in menuItems" :key="item.name">
          <a :href="item.href" :class="['flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200', { 'bg-gray-100 text-black': item.isActive }]">
            <i :class="[item.iconClass, 'text-red-600']"></i>
            <span>{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      // Giả lập dữ liệu menu, mục "Quản lý Sản Phẩm" được đánh dấu là active
      menuItems: [
        { name: 'Trang chủ', href: 'index.html', iconClass: 'fas fa-home', isActive: false },
        { name: 'Báo cáo', href: 'report.html', iconClass: 'fas fa-chart-line', isActive: false },
        { name: 'Phân Tích Doanh Thu', href: 'revenue.html', iconClass: 'fas fa-chart-bar', isActive: false },
        { name: 'Báo Cáo Sản Phẩm', href: 'inventory.html', iconClass: 'fas fa-box-open', isActive: false },
        { name: 'Quản lý Khách Hàng', href: 'quanlykh.html', iconClass: 'fas fa-users', isActive: false },
        { name: 'Quản lý Đơn Hàng', href: 'order1.html', iconClass: 'fas fa-shopping-cart', isActive: false },
        { name: 'Quản lý Nhập Hàng', href: 'nhaphang.html', iconClass: 'fas fa-truck-loading', isActive: false },
        { name: 'Quản lý Sản Phẩm', href: 'quanlysp.html', iconClass: 'fas fa-tools', isActive: true }, // Active Item
      ]
    };
  }
};
</script>

<style scoped>
/* Đảm bảo style CSS bị ghi đè trước đó được áp dụng đúng cho tiêu đề */
.sidebar-title {
  color: red !important;
}
</style>
