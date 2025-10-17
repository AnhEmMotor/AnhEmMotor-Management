<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'

defineProps({
  currentSort: {
    type: String,
    default: 'name',
  },
  sortOrder: {
    type: String,
    default: 'asc',
  },
})

const emit = defineEmits(['search', 'sort'])

const searchQuery = ref('')

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleSort = (field) => {
  emit('sort', field)
}
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- Search Input -->
    <div class="relative">
      <BaseInput
        v-model="searchQuery"
        placeholder="Tìm kiếm vai trò..."
        @input="handleSearch"
        class="w-80"
      />
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- Sort Buttons -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">Sắp xếp:</span>
      <button
        @click="handleSort('name')"
        class="px-3 py-2 text-sm rounded-lg border transition-colors duration-200"
        :class="
          currentSort === 'name'
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        "
      >
        Tên
        <span v-if="currentSort === 'name'">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </span>
      </button>
      <button
        @click="handleSort('createdAt')"
        class="px-3 py-2 text-sm rounded-lg border transition-colors duration-200"
        :class="
          currentSort === 'createdAt'
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        "
      >
        Ngày tạo
        <span v-if="currentSort === 'createdAt'">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </span>
      </button>
      <button
        @click="handleSort('permissionCount')"
        class="px-3 py-2 text-sm rounded-lg border transition-colors duration-200"
        :class="
          currentSort === 'permissionCount'
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        "
      >
        Số quyền
        <span v-if="currentSort === 'permissionCount'">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
