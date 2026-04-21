<script setup>
import { ref } from 'vue'
import IconEmptyBox from '@/assets/icons/empty-box.svg'

const columns = ref([
  { id: 'new', name: 'Mới', items: [] },
  { id: 'consulting', name: 'Đang tư vấn', items: [] },
  { id: 'testdriving', name: 'Đang lái thử', items: [] },
  { id: 'deposited', name: 'Đã đặt cọc', items: [] },
  { id: 'paperwork', name: 'Đang chờ giấy tờ', items: [] },
  { id: 'delivered', name: 'Đã giao xe', items: [] }
])
</script>

<template>
  <div class="p-4 sm:p-6 rounded-2xl shadow-xl bg-white min-h-screen border border-gray-100">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Tiến độ mua hàng (Sales Pipeline)</h1>
        <p class="text-gray-500 font-medium">Theo dõi luồng chốt sale qua từng giai đoạn</p>
      </div>
    </div>

    <!-- Kanban Board Placeholder -->
    <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      <div v-for="col in columns" :key="col.id" class="w-72 flex-shrink-0 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col h-[70vh]">
        <h3 class="font-bold text-gray-700 mb-4">{{ col.name }} <span class="text-gray-400 font-normal text-sm ml-1">0</span></h3>
        <div class="flex-1 bg-gray-100/50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4">
           <IconEmptyBox class="h-8 w-8 text-gray-300 mb-2" />
           <p class="text-xs text-gray-400 font-medium text-center">Kéo thả thẻ khách hàng vào đây</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.italic { font-style: italic; }
.custom-scrollbar::-webkit-scrollbar { height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
</style>
