<template>
    <div v-if="visible" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="modal-content bg-white w-full max-w-xl p-8 rounded-xl shadow-2xl">
            <div class="flex justify-between items-center mb-6 border-b pb-3">
                <h2 class="text-2xl font-bold text-gray-800">{{ modalTitle }}</h2>
                <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
            </div>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label for="product-id" class="block text-sm font-medium text-gray-700">Mã Sản Phẩm</label>
                    <input type="text" v-model="form.id" id="product-id" name="id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" :disabled="isEditing" required>
                </div>
                <div>
                    <label for="product-name" class="block text-sm font-medium text-gray-700">Tên Sản Phẩm</label>
                    <input type="text" v-model="form.name" id="product-name" name="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                </div>
                <div>
                    <label for="product-type" class="block text-sm font-medium text-gray-700">Loại</label>
                    <select v-model="form.type" id="product-type" name="type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                        <option value="motorcycle">Xe Máy</option>
                        <option value="parts">Phụ Tùng</option>
                        <option value="accessories">Phụ Kiện</option>
                    </select>
                </div>
                <div>
                    <label for="product-price" class="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
                    <input type="number" v-model.number="form.price" id="product-price" name="price" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                </div>
                <div>
                    <label for="product-stock" class="block text-sm font-medium text-gray-700">Số Lượng</label>
                    <input type="number" v-model.number="form.stock" id="product-stock" name="stock" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" @click="$emit('close')" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200">
                        Hủy
                    </button>
                    <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200">
                        Lưu Sản Phẩm
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
    visible: Boolean,
    product: Object
});

const emit = defineEmits(['close', 'save']);

const form = ref({
    id: '',
    name: '',
    type: 'motorcycle',
    price: 0,
    stock: 0
});

const isEditing = computed(() => !!props.product);
const modalTitle = computed(() => isEditing.value ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới');

watch(() => props.product, (newProduct) => {
    if (newProduct) {
        form.value = { ...newProduct };
    } else {
        // Reset form for new product
        form.value = {
            id: '',
            name: '',
            type: 'motorcycle',
            price: 0,
            stock: 0
        };
    }
});

function handleSubmit() {
    emit('save', form.value);
}
</script>
