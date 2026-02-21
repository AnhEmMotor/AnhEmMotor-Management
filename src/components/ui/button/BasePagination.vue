<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalPages: {
    type: Number,
    required: false,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:currentPage'])

const goToPage = (page) => {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('update:currentPage', props.currentPage + 1)
  }
}

const isPrevDisabled = computed(() => {
  return props.loading || props.currentPage <= 1
})

const isNextDisabled = computed(() => {
  return props.loading || props.currentPage >= props.totalPages
})

const pageNumbers = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (!total || total <= 0) return []
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total]
  }
  return [1, '...', current - 1, current, current + 1, '...', total]
})
</script>

<template>
  <div v-if="loading || totalPages > 1" class="mt-6 flex justify-center items-center h-10">
    <span v-if="loading" class="loader w-6 h-6 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></span>
    <div v-else-if="totalPages > 0" class="flex items-center space-x-2">
      <button
        @click="prevPage"
        :disabled="isPrevDisabled"
        class="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium rounded-md transition-colors duration-200 border"
        :class="isPrevDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:outline-none'"
      >
        <span>&larr;</span>
        <span class="ml-1 hidden sm:inline">Trước</span>
      </button>
      <div class="flex items-center space-x-1 sm:space-x-2">
        <template v-for="(page, index) in pageNumbers" :key="index">
          <span 
            v-if="page === '...'" 
            class="px-2 py-1.5 sm:px-3 sm:py-2 text-sm text-gray-500"
          >
            ...
          </span>
          <button
            v-else
            @click="goToPage(page)"
            class="inline-flex items-center justify-center min-w-[2rem] px-2 py-1.5 sm:min-w-[2.5rem] sm:px-3 sm:py-2 text-sm font-medium rounded-md transition-colors duration-200 border"
            :class="page === currentPage ? 'bg-red-600 text-white border-red-600 shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:outline-none'"
          >
            {{ page }}
          </button>
        </template>
      </div>
      <button
        @click="nextPage"
        :disabled="isNextDisabled"
        class="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium rounded-md transition-colors duration-200 border"
        :class="isNextDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:outline-none'"
      >
        <span class="mr-1 hidden sm:inline">Sau</span>
        <span>&rarr;</span>
      </button>
    </div>
  </div>
  <span v-else />
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
</style>
