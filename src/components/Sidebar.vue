<script setup>
import { ref } from 'vue';

const isWarehouseMenuOpen = ref(true); // Default to open as in the original design

function toggleWarehouseMenu() {
  isWarehouseMenuOpen.value = !isWarehouseMenuOpen.value;
}
</script>

<template>
  <aside class="w-64 bg-white p-5 shadow-lg flex-shrink-0" style="height: max-content;">
    <div class="text-2xl font-bold text-red-600 mb-10">AnhEm Motor</div>
    <nav>
      <ul class="space-y-2">
        <li>
          <a href="report.html" class="flex items-center gap-3 p-3 rounded-lg text-gray-700 bg-gray-100 font-semibold">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
            <span>Báo cáo</span>
          </a>
        </li>
        <li>
          <a href="revenue.html" class="flex items-center gap-3 p-3 rounded-lg text-gray-700 bg-gray-100 font-semibold">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
            </svg>
            <span>Phân Tích Doanh Thu</span>
          </a>
        </li>
        <li>
          <a href="inventory.html"
            class="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 13v-1m4 1v-3m4 3V8M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z">
              </path>
            </svg>
            <span>Báo Cáo Sản Phẩm</span>
          </a>
        </li>
        <li>
          <a href="quanlykh.html"
            class="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
              </path>
            </svg>
            <span>Quản lý Khách Hàng</span>
          </a>
        </li>
        <li>
          <a href="order1.html"
            class="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
              </path>
            </svg>
            <span>Quản lý Đơn Hàng</span>
          </a>
        </li>
        <li>
          <a href="quanlysp.html"
            class="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
              </path>
            </svg>
            <span>Quản lý Sản Phẩm</span>
          </a>
        </li>
        <li>
          <button @click="toggleWarehouseMenu"
            class="w-full flex items-center justify-between p-3 rounded-lg text-red-600 font-semibold hover:bg-gray-100 transition-colors">
            <span class="flex items-center gap-3">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4">
                </path>
              </svg>
              <span>Quản lý kho</span>
            </span>
            <svg class="w-5 h-5 text-red-500 transition-transform"
              :class="{ 'rotate-180': isWarehouseMenuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <ul v-show="isWarehouseMenuOpen" class="pl-6 mt-2 space-y-1">
            <li><a href="NCC.html" class="block p-3 rounded-lg text-gray-600 hover:bg-gray-100">Nhà cung cấp</a></li>
            <li><a href="import.html" class="block p-3 rounded-lg text-gray-600 hover:bg-gray-100">Nhập kho</a></li>
            <li><a href="cost.html" class="block p-3 rounded-lg font-bold text-red-600 bg-red-50">Thiết lập giá</a></li>
          </ul>
        </li>
        <li class="mt-auto pt-4 border-t border-gray-200">
          <a href="index.html"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-100 transition-colors duration-200 text-gray-800 hover:text-red-700 font-semibold">
            <i class="fa-solid fa-arrow-left w-6 text-xl text-center text-red-600"></i>
            <span>Quay về Trang chủ</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>
