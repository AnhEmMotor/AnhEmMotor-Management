<template>
    <div>
        <!-- Stats Section -->
        <div class="bg-gray-100 p-6 rounded-xl shadow-lg mb-8">
            <h2 class="text-3xl font-bold mb-4 text-center text-gray-800">Bảng Điều Khiển Tổng Quan</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-blue-100 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <span class="text-4xl font-bold text-blue-600">{{ totalOrders }}</span>
                    <span class="text-sm font-medium text-blue-800 mt-1">Tổng Số Đơn Hàng</span>
                </div>
                <div class="bg-green-100 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <span class="text-4xl font-bold text-green-600">{{ completedOrders }}</span>
                    <span class="text-sm font-medium text-green-800 mt-1">Đã Hoàn Thành</span>
                </div>
                <div class="bg-yellow-100 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <span class="text-4xl font-bold text-yellow-600">{{ pendingOrders }}</span>
                    <span class="text-sm font-medium text-yellow-800 mt-1">Đang Chờ Xử Lý</span>
                </div>
                <div class="bg-red-100 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <span class="text-4xl font-bold text-red-600">{{ cancelledOrders }}</span>
                    <span class="text-sm font-medium text-red-800 mt-1">Đã Hủy</span>
                </div>
            </div>
        </div>

        <!-- My Orders Section -->
        <div class="bg-gray-100 p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Đơn Hàng Của Tôi</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead>
                        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Mã ĐH</th>
                            <th class="py-3 px-6 text-left">Ngày Đặt</th>
                            <th class="py-3 px-6 text-left">Sản phẩm</th>
                            <th class="py-3 px-6 text-left">Trạng Thái</th>
                            <th class="py-3 px-6 text-left">Tổng Tiền</th>
                            <th class="py-3 px-6 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 text-sm font-light">
                       <tr v-for="order in sortedCustomerOrders" :key="order.id" class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                           <td class="py-3 px-6 text-left whitespace-nowrap">{{ order.id }}</td>
                           <td class="py-3 px-6 text-left">{{ order.date }}</td>
                           <td class="py-3 px-6 text-left">{{ order.products.length }} sản phẩm ({{ getProductType(order.type) }})</td>
                           <td class="py-3 px-6 text-left">
                               <span class="px-2 py-1 font-semibold leading-tight rounded-full" :class="getStatusInfo(order.type, order.status).color">
                                   {{ getStatusInfo(order.type, order.status).text }}
                               </span>
                           </td>
                           <td class="py-3 px-6 text-left">{{ order.total.toLocaleString('vi-VN') }} VNĐ</td>
                           <td class="py-3 px-6 text-center">
                                <button v-if="getStatusInfo(order.type, order.status).canCancel" @click="$emit('cancel-order', order)" class="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200">Hủy Đơn</button>
                                <span v-else class="text-gray-400">Không thể hủy</span>
                           </td>
                       </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import { statusMaps, getStatusInfo } from '../utils/statusHelper';

const props = defineProps({
    orders: Array
});

const totalOrders = computed(() => props.orders.length);
const completedOrders = computed(() => props.orders.filter(o => o.status === 'completed' || o.status === 'delivered').length);
const pendingOrders = computed(() => props.orders.filter(o => ['confirmed', 'unconfirmed', 'shipping'].includes(o.status)).length);
const cancelledOrders = computed(() => 0); // Placeholder

const sortedCustomerOrders = computed(() => {
    return [...props.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
});

function getProductType(type) {
    if (type === 'motorcycle') return 'Xe Máy';
    if (type === 'parts') return 'Phụ Tùng';
    return 'Phụ Kiện';
}
</script>
