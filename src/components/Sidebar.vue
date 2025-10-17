<template>
  <aside class="w-64 bg-white flex flex-col flex-shrink-0 border-r border-gray-200">
    <!-- Logo -->
    <div class="h-16 flex items-center justify-center px-4 border-b">
      <h1 class="text-2xl font-bold text-red-600">AnhEm Motor</h1>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto sidebar-scroll p-4">
      <ul class="space-y-2">
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
            <i class="fa-solid fa-chart-line w-6 text-xl text-center text-red-600"></i>
            <span>Báo cáo</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
            <i class="fa-solid fa-chart-pie w-6 text-xl text-center text-red-700"></i>
            <span>Phân Tích Doanh Thu</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
            <i class="fa-solid fa-box w-6 text-xl text-center text-red-600"></i>
            <span>Báo Cáo Sản Phẩm</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
            <i class="fa-solid fa-users w-6 text-xl text-center text-red-600"></i>
            <span>Quản lý Khách Hàng</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
            <i class="fa-solid fa-cart-shopping w-6 text-xl text-center text-red-600"></i>
            <span>Quản lý Đơn Hàng</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
            <i class="fa-solid fa-motorcycle w-6 text-xl text-center text-red-600"></i>
            <span>Quản lý Sản Phẩm</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
            <i class="fa-solid fa-box w-6 text-xl text-center text-red-600"></i>
            <span>Quản lý Kho</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg bg-red-100 text-red-700 transition-colors duration-200">
            <i class="fa-solid fa-gear w-6 text-xl text-center text-red-600"></i>
            <span>Cài đặt chung</span>
          </a>
        </li>
        <li class="mt-auto pt-4 border-t border-gray-200">
          <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-100 transition-colors duration-200 text-gray-800 hover:text-red-700 font-semibold">
            <i class="fa-solid fa-arrow-left w-6 text-xl text-center text-red-600"></i>
            <span>Quay về Trang chủ</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
// This component is purely presentational, so no script logic is needed.
</script>
