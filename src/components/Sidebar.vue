<template>
    <div class="w-72 bg-white text-gray-800 p-6 shadow-xl flex-shrink-0 flex flex-col items-center fixed top-0 left-0 h-full">
        <h1 class="text-3xl font-bold mb-8 text-center text-red-700">AnhEm Motor</h1>
        <nav class="w-full">
            <ul class="space-y-4">
                <!-- Static links -->
                <li>
                    <a href="report.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
                        <i class="fa-solid fa-chart-line w-6 text-xl text-center text-red-600"></i>
                        <span>Báo cáo</span>
                    </a>
                </li>
                <li>
                    <a href="revenue.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
                        <i class="fa-solid fa-chart-pie w-6 text-xl text-center text-red-600"></i>
                        <span>Phân Tích Doanh Thu</span>
                    </a>
                </li>
                 <li>
                    <a href="inventory.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
                        <i class="fa-solid fa-box w-6 text-xl text-center text-red-600"></i>
                        <span>Báo Cáo Sản Phẩm</span>
                    </a>
                </li>
                 <li>
                    <a href="quanlykh.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
                        <i class="fa-solid fa-users w-6 text-xl text-center text-red-600"></i>
                        <span>Quản lý Khách Hàng</span>
                    </a>
                </li>

                <!-- Order Management Dropdown -->
                <li>
                    <a href="#" @click.prevent="navigate('dashboard')" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
                        <div class="flex items-center space-x-3">
                            <i class="fa-solid fa-cart-shopping w-6 text-xl text-center text-red-600"></i>
                            <span>Quản lý đơn hàng</span>
                        </div>
                        <svg class="h-4 w-4 transform transition-transform duration-200 text-gray-500" :class="{'rotate-90': orderDropdownOpen}" @click.stop="toggleOrderDropdown">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                    <ul v-show="orderDropdownOpen" class="ml-8 mt-2 space-y-2">
                        <li>
                            <a href="#" @click.prevent="navigate('motorcycle')" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <span>ĐH Xe Máy</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" @click.prevent="navigate('parts')" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <span>ĐH Phụ Tùng</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" @click.prevent="navigate('accessories')" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <span>ĐH Phụ Kiện</span>
                            </a>
                        </li>
                    </ul>
                </li>
                 <li>
                    <a href="quanlysp.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
                        <i class="fa-solid fa-motorcycle w-6 text-xl text-center text-red-600"></i>
                        <span>Quản lý Sản Phẩm</span>
                    </a>
                </li>
                 <!-- Warehouse Management Dropdown -->
                <li>
                    <a href="#" @click.prevent="navigate('warehouse')" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-800">
                        <div class="flex items-center space-x-3">
                           <i class="fa-solid fa-warehouse w-6 text-xl text-center text-red-600"></i>
                            <span>Quản lý kho</span>
                        </div>
                         <svg class="h-4 w-4 transform transition-transform duration-200 text-gray-500" :class="{'rotate-90': warehouseDropdownOpen}" @click.stop="toggleWarehouseDropdown">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                    <ul v-show="warehouseDropdownOpen" class="ml-8 mt-2 space-y-2">
                        <li>
                            <a href="NCC.html" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <span>Nhà cung cấp</span>
                            </a>
                        </li>
                        <li>
                            <a href="import.html" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <span>Nhập hàng</span>
                            </a>
                        </li>
                        <li>
                            <a href="cost.html" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <span>Thiết lập giá</span>
                            </a>
                        </li>
                    </ul>
                </li>

                <li class="mt-auto pt-4 border-t border-gray-200">
                    <a href="index.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-100 transition-colors duration-200 text-gray-800 hover:text-red-700 font-semibold">
                        <i class="fa-solid fa-arrow-left w-6 text-xl text-center text-red-600"></i>
                        <span>Quay về Trang chủ</span>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['navigate']);
const orderDropdownOpen = ref(true);
const warehouseDropdownOpen = ref(false);

function navigate(view) {
    emit('navigate', view);
}

function toggleOrderDropdown() {
    orderDropdownOpen.value = !orderDropdownOpen.value;
}
function toggleWarehouseDropdown() {
    warehouseDropdownOpen.value = !warehouseDropdownOpen.value;
}
</script>
