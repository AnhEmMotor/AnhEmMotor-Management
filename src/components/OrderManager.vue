<template>
    <div class="bg-gray-100 p-6 rounded-xl shadow-lg">
        <h2 class="text-3xl font-bold mb-4 text-center text-gray-800">{{ title }}</h2>
        <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h3 class="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Danh Sách Đơn Hàng</h3>
            <div class="flex space-x-2">
                <button @click="setFilter('all')" :class="getFilterButtonClass('all')">Tất Cả</button>
                <button v-for="(statusInfo, statusKey) in availableStatuses" :key="statusKey" @click="setFilter(statusKey)" :class="getFilterButtonClass(statusKey)">
                    {{ statusInfo.text }}
                </button>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                    <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th class="py-3 px-6 text-left">Mã ĐH</th>
                        <th class="py-3 px-6 text-left">Khách Hàng</th>
                        <th class="py-3 px-6 text-left">Ngày Đặt</th>
                        <th class="py-3 px-6 text-left">Trạng Thái</th>
                        <th class="py-3 px-6 text-left">Tổng Tiền</th>
                        <th class="py-3 px-6 text-center">Thao Tác</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light">
                    <tr v-for="order in filteredOrders" :key="order.id" class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                        <td class="py-3 px-6 text-left whitespace-nowrap">{{ order.id }}</td>
                        <td class="py-3 px-6 text-left">{{ order.customerName }}</td>
                        <td class="py-3 px-6 text-left">{{ order.date }}</td>
                        <td class="py-3 px-6 text-left">
                            <span class="px-2 py-1 font-semibold leading-tight rounded-full" :class="getStatusInfo(order.type, order.status).color">
                                {{ getStatusInfo(order.type, order.status).text }}
                            </span>
                        </td>
                        <td class="py-3 px-6 text-left">{{ order.total.toLocaleString('vi-VN') }} VNĐ</td>
                        <td class="py-3 px-6 text-center">
                            <button @click="$emit('view-details', order)" class="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200">Chi Tiết</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { statusMaps, getStatusInfo } from '../utils/statusHelper';

const props = defineProps({
    orders: Array,
    title: String,
    type: String
});

defineEmits(['view-details']);

const currentFilter = ref('all');

const availableStatuses = computed(() => statusMaps[props.type] || {});

const filteredOrders = computed(() => {
    if (currentFilter.value === 'all') {
        return props.orders;
    }
    return props.orders.filter(order => order.status === currentFilter.value);
});

function setFilter(status) {
    currentFilter.value = status;
}

function getFilterButtonClass(status) {
    const baseClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200';
    if (currentFilter.value === status) {
        return `${baseClass} bg-red-500 text-white hover:bg-red-600`;
    }
    return `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`;
}
</script>
