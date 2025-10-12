<template>
  <aside class="w-72 bg-gray-50 border-l border-gray-200 flex flex-col p-3">
    <div class="space-y-3 text-xs flex-grow">
      <!-- Supplier Search -->
      <div class="relative">
        <input
          type="text"
          placeholder="Tìm nhà cung cấp"
          class="form-input pl-3 pr-7"
          v-model="supplierSearch"
        />
        <svg class="w-3.5 h-3.5 text-gray-400 absolute left-1 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <button class="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
      </div>

      <!-- Import Code -->
      <div>
        <label class="block text-[11px] font-medium text-gray-500 mb-1">Mã phiếu nhập</label>
        <input
          type="text"
          placeholder="Mã phiếu tự động"
          readonly
          class="form-input form-input-readonly"
        />
      </div>

      <!-- Order Code -->
      <div>
        <label class="block text-[11px] font-medium text-gray-500 mb-1">Mã đặt hàng nhập</label>
        <input type="text" class="form-input" v-model="orderCode" />
      </div>

      <div class="border-t border-gray-200 my-2"></div>

      <!-- Summary -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Trạng thái</span>
          <span class="font-semibold text-gray-800">Phiếu tạm</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Tổng tiền hàng</span>
          <span class="font-semibold text-gray-800">{{ formatNumber(totalGoods) }}</span>
        </div>

        <!-- Overall Discount -->
        <div class="space-y-1">
          <label class="block text-[11px] font-medium text-gray-500">Giảm giá</label>
          <div class="flex items-center">
            <input
              type="text"
              :value="formatNumber(overallDiscountValue)"
              class="form-input text-right flex-grow"
              @input="updateOverallDiscount"
            />
            <DiscountToggle
              v-model="overallDiscountType"
              @update:model-value="updateDiscountType"
              class="ml-1.5"
              width="80px"
            />
          </div>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600">Tiền giảm giá</span>
          <span class="font-semibold text-gray-800">{{ formatNumber(calculatedDiscount) }}</span>
        </div>

        <div class="flex justify-between items-center font-bold pt-1">
          <span class="text-gray-800">Cần trả NCC</span>
          <span class="text-red-600 text-base">{{ formatNumber(finalTotal) }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-[11px] font-medium text-gray-500 mb-1 mt-2">Ghi chú</label>
        <textarea rows="3" class="form-input resize-none" v-model="notes"></textarea>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-auto pt-3 border-t border-gray-200">
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('save-draft')"
          class="flex-1 flex items-center justify-center space-x-2 bg-white text-red-600 border border-red-600 font-semibold py-2 px-3 rounded-md hover:bg-red-50 transition duration-150"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          <span class="text-xs">Lưu tạm</span>
        </button>
        <button
          @click="$emit('complete')"
          class="flex-1 bg-red-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-red-700 transition duration-150 text-xs"
        >
          Hoàn thành
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useItemStore } from '@/stores/itemStore';
import { formatNumber } from '@/utils/formatters';
import DiscountToggle from '@/components/common/DiscountToggle.vue';

defineEmits(['save-draft', 'complete']);

const itemStore = useItemStore();
const {
  totalGoods,
  calculatedDiscount,
  finalTotal,
  overallDiscountValue,
  overallDiscountType
} = storeToRefs(itemStore);

const supplierSearch = ref('');
const orderCode = ref('');
const notes = ref('');

function updateOverallDiscount(event) {
  const value = event.target.value.replace(/[^0-9]/g, '');
  const numValue = value ? parseInt(value, 10) : 0;
  event.target.value = formatNumber(numValue);
  itemStore.setOverallDiscount(numValue);
}

function updateDiscountType(type) {
  itemStore.setOverallDiscount(overallDiscountValue.value, type);
}
</script>