<template>
    <div class="bg-gray-100 p-6 rounded-xl shadow-lg">
        <h2 class="text-3xl font-bold mb-4 text-center text-gray-800">Quản Lý Sản Phẩm</h2>
        <div class="flex justify-end mb-4">
            <button @click="$emit('add-product')" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md">
                Thêm Sản Phẩm Mới
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                    <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th class="py-3 px-6 text-left">Mã SP</th>
                        <th class="py-3 px-6 text-left">Tên Sản Phẩm</th>
                        <th class="py-3 px-6 text-left">Loại</th>
                        <th class="py-3 px-6 text-left">Giá</th>
                        <th class="py-3 px-6 text-left">Số Lượng</th>
                        <th class="py-3 px-6 text-center">Thao Tác</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light">
                     <tr v-for="product in products" :key="product.id" class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                        <td class="py-3 px-6 text-left whitespace-nowrap">{{ product.id }}</td>
                        <td class="py-3 px-6 text-left">{{ product.name }}</td>
                        <td class="py-3 px-6 text-left">{{ getProductType(product.type) }}</td>
                        <td class="py-3 px-6 text-left">{{ product.price.toLocaleString('vi-VN') }} VNĐ</td>
                        <td class="py-3 px-6 text-left">{{ product.stock }}</td>
                        <td class="py-3 px-6 text-center space-x-2">
                            <button @click="$emit('edit-product', product)" class="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200">Sửa</button>
                            <button @click="$emit('delete-product', product)" class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">Xóa</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
    products: Array
});

defineEmits(['add-product', 'edit-product', 'delete-product']);

function getProductType(type) {
    if (type === 'motorcycle') return 'Xe Máy';
    if (type === 'parts') return 'Phụ Tùng';
    return 'Phụ Kiện';
}
</script>
