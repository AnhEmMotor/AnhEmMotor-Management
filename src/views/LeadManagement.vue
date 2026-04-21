<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useLeadStore } from '@/stores/lead.store'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import Input from '@/components/ui/input/BaseInput.vue'

const leadStore = useLeadStore()

const searchQuery = ref('')

const { data: leadsData, isLoading, isError, refetch } = useQuery({
  queryKey: ['leads'],
  queryFn: () => leadStore.fetchLeads(),
})

const leads = computed(() => leadsData.value || [])

const filteredLeads = computed(() => {
  if (!searchQuery.value) return leads.value
  const q = searchQuery.value.toLowerCase()
  return leads.value.filter(
    (l) =>
      l.fullName.toLowerCase().includes(q) ||
      l.phoneNumber.includes(q) ||
      l.email.toLowerCase().includes(q)
  )
})

const getStatusColor = (status) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Consulting': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'TestDriving': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'Negotiating': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Closed': return 'bg-green-100 text-green-700 border-green-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'New': return 'Mới'
    case 'Consulting': return 'Đang tư vấn'
    case 'TestDriving': return 'Đang lái thử'
    case 'Negotiating': return 'Đang thương lượng'
    case 'Closed': return 'Đã chốt'
    default: return status
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-2xl shadow-xl bg-white min-h-screen border border-gray-100">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Hồ sơ khách hàng tiềm năng</h1>
        <p class="text-gray-500 font-medium">Theo dõi và quản lý phễu khách hàng (Sales Pipeline)</p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="refetch" 
          class="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-100"
          title="Làm mới"
        >
          <font-awesome-icon icon="rotate" />
        </button>
      </div>
    </div>

    <div class="mb-8">
      <div class="relative max-w-2xl">
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
          class="w-full !pl-12 !py-4 !rounded-2xl shadow-sm border-gray-100"
        />
        <font-awesome-icon icon="magnifying-glass" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div v-if="isError" class="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
        <p class="text-red-600 font-bold text-lg">Đã xảy ra lỗi khi lấy dữ liệu Leads</p>
        <button @click="refetch" class="mt-4 text-red-700 underline font-black uppercase text-xs tracking-widest">Thử lại</button>
      </div>

      <template v-else-if="filteredLeads.length === 0">
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="p-6 bg-gray-50 rounded-3xl animate-pulse flex gap-6">
            <div class="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            <div class="flex-1 space-y-3">
              <div class="h-6 bg-gray-200 rounded-lg w-1/4"></div>
              <div class="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
          <div class="bg-white p-6 rounded-3xl shadow-sm inline-block mb-6">
            <IconEmptyBox class="h-16 w-16 text-gray-200" />
          </div>
          <p class="text-gray-400 font-bold text-xl uppercase italic">Không tìm thấy khách hàng nào</p>
        </div>
      </template>

      <div v-else class="space-y-4">
        <div 
          v-for="lead in filteredLeads" 
          :key="lead.id"
          class="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6"
        >
          <!-- Score Badge -->
          <div class="flex-shrink-0">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex flex-col items-center justify-center text-white shadow-lg group-hover:from-red-600 group-hover:to-rose-700 transition-all duration-500">
              <span class="text-[10px] font-black uppercase tracking-tighter opacity-60">Score</span>
              <span class="text-xl font-black italic tracking-tighter leading-none">{{ lead.score }}</span>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-lg font-black text-gray-900 uppercase italic truncate">{{ lead.fullName }}</h3>
              <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border', getStatusColor(lead.status)]">
                {{ getStatusLabel(lead.status) }}
              </span>
            </div>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-gray-500">
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="phone" class="text-xs text-gray-300" />
                <span>{{ lead.phoneNumber }}</span>
              </div>
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="envelope" class="text-xs text-gray-300" />
                <span class="truncate">{{ lead.email || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="clock" class="text-xs text-gray-300" />
                <span>{{ formatDate(lead.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Timeline Summary -->
          <div class="md:w-64 border-l border-gray-50 pl-6 hidden lg:block">
            <p class="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">Hoạt động gần nhất</p>
            <div v-if="lead.activities?.length > 0" class="space-y-2">
              <div class="text-[11px] font-bold text-gray-600 line-clamp-2 italic leading-relaxed">
                "{{ lead.activities[lead.activities.length - 1].description }}"
              </div>
              <p class="text-[9px] text-gray-400">{{ formatDate(lead.activities[lead.activities.length - 1].createdAt) }}</p>
            </div>
            <p v-else class="text-[11px] text-gray-300 italic">Chưa có hoạt động</p>
          </div>

          <!-- Actions -->
          <div class="flex-shrink-0 flex gap-2">
            <button class="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100 flex items-center justify-center">
              <font-awesome-icon icon="eye" />
            </button>
            <button class="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100 flex items-center justify-center">
              <font-awesome-icon icon="ellipsis-vertical" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.italic {
  font-style: italic;
}
</style>
