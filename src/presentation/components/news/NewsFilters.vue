<script setup>
import { ref } from 'vue'

const emit = defineEmits(['filter'])

const filters = ref({
  category: '',
  status: '',
  dateRange: ''
})

const handleFilter = () => {
  emit('filter', filters.value)
}

const clearFilters = () => {
  filters.value = { category: '', status: '', dateRange: '' }
  handleFilter()
}
</script>

<template>
  <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-6">
    <div class="flex-1 min-w-[200px]">
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Danh mục</label>
      <select 
        v-model="filters.category" 
        @change="handleFilter"
        class="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500/10 transition-all"
      >
        <option value="">Tất cả danh mục</option>
        <option value="promotion">Khuyến mãi</option>
        <option value="technical">Tư vấn kỹ thuật</option>
        <option value="news">Tin tức thị trường</option>
      </select>
    </div>

    <div class="flex-1 min-w-[200px]">
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Trạng thái</label>
      <select 
        v-model="filters.status" 
        @change="handleFilter"
        class="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500/10 transition-all"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="published">Đã xuất bản</option>
        <option value="draft">Bản nháp</option>
        <option value="scheduled">Đã hẹn giờ</option>
      </select>
    </div>

    <div class="flex-1 min-w-[200px]">
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Khoảng thời gian</label>
      <div class="relative">
        <input 
          type="text" 
          v-model="filters.dateRange"
          placeholder="Chọn ngày..."
          class="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500/10 transition-all pl-10"
        >
        <font-awesome-icon icon="calendar" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
      </div>
    </div>

    <div class="flex items-end h-full pt-6">
      <button 
        @click="clearFilters"
        class="px-6 py-2.5 text-gray-400 font-bold text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors"
      >
        Xóa bộ lọc
      </button>
    </div>
  </div>
</template>
