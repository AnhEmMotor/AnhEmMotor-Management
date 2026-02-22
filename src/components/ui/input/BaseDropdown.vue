<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Vui lòng chọn',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const selectId = computed(() => `base-dropdown-${Math.random().toString(36).substring(2, 9)}`)

const isOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  if (props.readonly || props.loading) return
  isOpen.value = !isOpen.value
}

const selectOption = (value) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const selectedText = computed(() => {
  if (props.loading && !props.options.length) return 'Đang tải...'
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.text : props.placeholder
})

const pageNumbers = computed(() => {
  if (!props.pagination) return []
  const total = props.pagination.totalPages.value
  const current = props.pagination.currentPage.value
  if (!total || total <= 0) return []
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 2) {
    return [1, 2, 3, '...', total]
  }
  if (current >= total - 1) {
    return [1, '...', total - 2, total - 1, total]
  }
  return [1, '...', current, '...', total]
})

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="w-full relative" ref="dropdownRef">
    <label v-if="label" :for="selectId" class="block text-xs font-medium text-gray-500 mb-1">
      {{ label }}
    </label>
    
    <!-- Trigger Button -->
    <button
      type="button"
      :id="selectId"
      @click="toggleDropdown"
      :disabled="readonly || loading"
      class="w-full p-1.5 border border-gray-300 rounded-md text-sm text-left focus:ring-red-500 focus:border-red-500 flex justify-between items-center transition-colors"
      :class="{ 
        'bg-gray-100 cursor-not-allowed text-gray-400': readonly || loading,
        'bg-white text-gray-800': !readonly && !loading,
        'ring-2 ring-red-500 border-red-500': !isOpen && error,
        'ring-2 ring-red-500 border-transparent': isOpen
      }"
    >
      <span class="truncate" :class="{ 'text-gray-400': !modelValue && !loading }">{{ selectedText }}</span>
      <span class="pointer-events-none flex items-center pl-2">
        <span v-if="loading" class="loader w-4 h-4 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></span>
        <svg v-else class="h-4 w-4 text-gray-500 transition-transform duration-200" :class="{ 'transform rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </span>
    </button>
    
    <!-- Dropdown Menu -->
    <div 
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col overflow-hidden"
    >
      <!-- Options List -->
      <ul class="max-h-56 overflow-y-auto py-1 focus:outline-none flex-1">
        <li v-if="options.length === 0" class="text-gray-500 text-sm px-3 py-2 text-center">
          {{ loading ? 'Đang tải...' : 'Không có dữ liệu' }}
        </li>
        <li
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option.value)"
          class="px-3 py-2 text-sm cursor-pointer transition-colors duration-150 relative select-none"
          :class="{
            'bg-red-50 text-red-700 font-medium': modelValue === option.value,
            'text-gray-700 hover:bg-gray-100 hover:text-gray-900': modelValue !== option.value
          }"
        >
          <span class="block truncate">{{ option.text }}</span>
          <span v-if="modelValue === option.value" class="absolute inset-y-0 right-0 flex items-center pr-3 text-red-600">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </span>
        </li>
      </ul>
      
      <!-- Internal Pagination Controls -->
      <div 
        v-if="pagination && (loading || pagination.totalPages.value > 1)" 
        class="border-t border-gray-100 bg-gray-50 px-2 py-2 flex justify-center sm:justify-end items-center"
        @click.stop
      >
        <span v-if="loading && options.length > 0" class="loader w-4 h-4 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin mr-2"></span>
        <div v-if="pagination.totalPages.value > 0" class="flex items-center space-x-1">
          <button
            @click.prevent="pagination.prevPage()"
            :disabled="pagination.isFirstPage.value || loading"
            class="inline-flex items-center justify-center px-1.5 py-1 text-[11px] font-medium rounded transition-colors duration-200 border"
            :class="pagination.isFirstPage.value || loading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600 focus:ring-1 focus:ring-red-500 focus:outline-none'"
            title="Trang trước"
          >
            &larr;
          </button>
          <div class="flex items-center space-x-1 px-1">
            <template v-for="(page, index) in pageNumbers" :key="index">
              <span 
                v-if="page === '...'" 
                class="px-1 py-1 text-[11px] text-gray-500"
              >
                ...
              </span>
              <button
                v-else
                @click.prevent="pagination.changePage(page)"
                :disabled="loading"
                class="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-1 text-[11px] font-medium rounded transition-colors duration-200 border"
                :class="[
                  page === pagination.currentPage.value ? 'bg-red-600 text-white border-red-600 shadow-sm focus:outline-none' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none',
                  loading ? 'opacity-70 cursor-wait' : ''
                ]"
              >
                {{ page }}
              </button>
            </template>
          </div>
          <button
            @click.prevent="pagination.nextPage()"
            :disabled="pagination.isLastPage.value || loading"
            class="inline-flex items-center justify-center px-1.5 py-1 text-[11px] font-medium rounded transition-colors duration-200 border"
            :class="pagination.isLastPage.value || loading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600 focus:ring-1 focus:ring-red-500 focus:outline-none'"
            title="Trang sau"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<style scoped>
.loader {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Custom scrollbar for dropdown menu */
ul::-webkit-scrollbar {
  width: 6px;
}
ul::-webkit-scrollbar-track {
  background: transparent;
}
ul::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 10px;
}
ul:hover::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
}
</style>
