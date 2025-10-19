<script setup>
import { ref } from 'vue'

// Define emits to communicate with the parent component
const emit = defineEmits(['open-modal'])

// Static product data from the original HTML
const products = ref([
  {
    id: 'SP000007',
    name: 'VS',
    lastImportPrice: '0',
    generalPrice: '50,000,000',
    recentImports: ['Không có'],
  },
  {
    id: 'SP000006',
    name: 'SH350i',
    lastImportPrice: '40,000,000',
    generalPrice: '50,000,000',
    recentImports: ['40,000,000 (PN0012)', '39,500,000 (PN0008)', '39,800,000 (PN0005)'],
  },
  {
    id: 'SP000004',
    name: 'AirBlade',
    lastImportPrice: '40,000,000',
    generalPrice: '40,000,000',
    recentImports: ['40,000,000 (PN0015)', '39,000,000 (PN0011)'],
  },
])

// Function to handle row click and emit event
function onRowClick(product) {
  emit('open-modal', product)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <!-- Table Header -->
      <thead class="bg-red-50">
        <tr class="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          <th scope="col" class="py-3 px-4 text-left border-b border-red-200">Mã hàng</th>
          <th scope="col" class="py-3 px-4 text-left border-b border-red-200">Tên hàng</th>
          <th scope="col" class="py-3 px-4 text-right border-b border-red-200">Giá nhập cuối</th>
          <th scope="col" class="py-3 px-4 text-right border-b border-red-200">Bảng giá chung</th>
        </tr>
      </thead>
      <!-- Table Body -->
      <tbody class="divide-y divide-gray-100">
        <tr
          v-for="product in products"
          :key="product.id"
          @click="onRowClick(product)"
          class="hover:bg-red-50/50 transition duration-150 cursor-pointer"
        >
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="font-medium text-gray-900">{{ product.id }}</span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="text-gray-700">{{ product.name }}</span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-right relative group">
            <span class="text-gray-700 cursor-pointer">{{ product.lastImportPrice }}</span>
            <div
              class="absolute hidden group-hover:block bottom-full mb-2 right-0 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg z-10"
            >
              <h4 class="font-bold mb-1">Giá nhập gần đây:</h4>
              <ul class="list-disc list-inside">
                <li v-for="(item, index) in product.recentImports" :key="index">{{ item }}</li>
              </ul>
            </div>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-right">
            <input
              type="text"
              :value="product.generalPrice"
              class="text-right w-36 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              @click.stop
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
