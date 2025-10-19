<script setup>
import { ref } from 'vue'
import ProductHistoryPriceModal from '@/components/price_management/ProductHistoryPriceModal.vue'
import PriceModal from '@/components/price_management/PriceModal.vue'

// State to manage modal visibility and data
const isModalVisible = ref(false)
const selectedProduct = ref(null)

// Data for price history, similar to the original JS
const priceHistoryData = {
  SP000007: {
    name: 'VS',
    oldPrices: [],
  },
  SP000006: {
    name: 'SH350i',
    oldPrices: [
      {
        price: '48,000,000',
        date: '01/05/2024',
      },
      {
        price: '47,500,000',
        date: '15/03/2024',
      },
    ],
  },
  SP000004: {
    name: 'AirBlade',
    oldPrices: [
      {
        price: '39,500,000',
        date: '12/04/2024',
      },
    ],
  },
}

// Function to handle opening the modal
const handleOpenModal = (product) => {
  const history = priceHistoryData[product.id]
  selectedProduct.value = {
    ...product,
    history: history ? history.oldPrices : [],
  }
  isModalVisible.value = true
}

// Function to handle closing the modal
const handleCloseModal = () => {
  isModalVisible.value = false
  selectedProduct.value = null
}
</script>

<template>
  <main class="flex-1 p-4 sm:p-8 overflow-y-auto">
    <div class="max-w-6xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
      <!-- Header Section -->
      <header class="p-4 sm:p-6 border-b border-red-100">
        <h1 class="text-2xl font-bold text-gray-800">Thiết Lập Giá Hàng Hóa</h1>
      </header>
      <!-- Search/Filter Section -->
      <div class="p-4 sm:p-6 border-b-4 border-red-500/20">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Input Mã hàng -->
          <input
            type="text"
            placeholder="Tìm mã hàng"
            class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
            aria-label="Tìm kiếm mã hàng"
          />
          <!-- Input Tên hàng -->
          <input
            type="text"
            placeholder="Tìm tên hàng"
            class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
            aria-label="Tìm kiếm tên hàng"
          />
        </div>
      </div>

      <!-- Product Table Component -->
      <ProductHistoryPriceModal @open-modal="handleOpenModal" />

      <!-- Footer/Pagination Placeholder -->
      <div class="p-4 sm:p-6 border-t border-gray-200 text-center text-sm text-gray-500">
        Hiển thị 1 - 3 trên 25 mục.
      </div>
    </div>
  </main>
  <!-- Price Details Modal Component -->
  <PriceModal :is-visible="isModalVisible" :product="selectedProduct" @close="handleCloseModal" />
</template>
