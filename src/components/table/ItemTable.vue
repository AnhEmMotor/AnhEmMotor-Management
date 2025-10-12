<template>
  <main class="flex-1 flex flex-col bg-white">
    <!-- Table Header -->
    <div class="flex-shrink-0 border-b border-gray-200">
      <div class="grid grid-cols-12 gap-3 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div class="col-span-1">STT</div>
        <div class="col-span-2">Mã hàng</div>
        <div class="col-span-2">Tên hàng</div>
        <div class="col-span-1">ĐVT</div>
        <div class="col-span-1 text-right">Số lượng</div>
        <div class="col-span-1 text-right">Đơn giá</div>
        <div class="col-span-2 text-right">Giảm giá</div>
        <div class="col-span-2 text-right">Thành tiền</div>
      </div>
    </div>

    <!-- Table Content Body -->
    <div class="flex-1 overflow-y-auto" @click="closeAllPopups">
      <ItemRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        :ref="el => { if (el) rowRefs[item.id] = el }"
        @toggle-popup="handlePopupToggle"
      />
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useItemStore } from '@/stores/itemStore';
import ItemRow from './ItemRow.vue';

const itemStore = useItemStore();
const { items } = storeToRefs(itemStore);
const rowRefs = ref({});

function handlePopupToggle(itemId) {
  // Close all other popups
  Object.keys(rowRefs.value).forEach(id => {
    if (parseInt(id) !== itemId && rowRefs.value[id]) {
      rowRefs.value[id].closePopup();
    }
  });
}

function closeAllPopups() {
  Object.values(rowRefs.value).forEach(row => {
    if (row) row.closePopup();
  });
}
</script>