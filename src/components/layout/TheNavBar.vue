<script setup lang="ts">
import HomeSVG from '@/assets/svg/HomeSVG.vue'
import ReportSVG from '@/assets/svg/ReportSVG.vue'
import ProductSVG from '@/assets/svg/ProductSVG.vue'
import ClientSVG from '@/assets/svg/ClientSVG.vue'
import OrderSVG from '@/assets/svg/OrderSVG.vue'
import InputSVG from '@/assets/svg/InputSVG.vue'
</script>

<template>
  <div class="box-style">
    <h1 class="text-3xl font-bold mb-8">AnhEm Motor</h1>
    <nav class="w-full">
      <ul class="space-y-4">
        <li>
          <RouterLink to="/" class="router-link">
            <HomeSVG />
            <span>Trang chủ</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/xyz" class="router-link">
            <ReportSVG />
            <span>Báo cáo</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/xyz" class="router-link">
            <ReportSVG />
            <span>Phân Tích Doanh Thu</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/xyz" class="router-link">
            <ProductSVG />
            <span>Báo Cáo Sản Phẩm</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/customers" class="router-link">
            <ClientSVG />
            <span>Quản lý Khách Hàng</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/orders" class="router-link">
            <OrderSVG />
            <span>Quản lý Đơn Hàng</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/xyz" class="router-link">
            <InputSVG />
            <span>Quản lý Nhập Hàng</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/xyz" class="router-link">
            <ProductSVG />
            <span>Quản lý Sản Phẩm</span>
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
  @apply fixed left-0 top-0 w-64 h-full p-6 shadow-xl flex-shrink-0 flex flex-col items-center;
}

.router-link-active {
  @apply bg-gray-100 text-black;
}

.router-link {
  @apply flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200;
}
</style>
