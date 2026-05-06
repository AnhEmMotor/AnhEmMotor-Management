<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useLeadStore } from '@stores/lead.store'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const leadStore = useLeadStore()
const toast = useToast()
const queryClient = useQueryClient()

const activeTab = ref('timeline')
const searchQuery = ref('')

// Fetch current lead
const { data: lead, isLoading } = useQuery({
  queryKey: ['lead', route.params.id],
  queryFn: () => leadStore.fetchLeadById(route.params.id),
  enabled: !!route.params.id
})

// Fetch all leads for the left sidebar
const { data: leadsData } = useQuery({
  queryKey: ['leads-sidebar'],
  queryFn: () => leadStore.fetchLeads()
})

const leads = computed(() => {
  const list = leadsData.value || []
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(l => l.fullName.toLowerCase().includes(q) || l.phoneNumber.includes(q))
})

const getStatusColor = (status) => {
  switch (status) {
    case 'New': return 'text-blue-600 bg-blue-50'
    case 'Consulting': return 'text-orange-600 bg-orange-50'
    case 'Closed': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'New': return 'Mới'
    case 'Consulting': return 'Đang tư vấn'
    case 'Closed': return 'Khách hàng chính thức'
    default: return status
  }
}

const selectLead = (id) => {
  router.push(`/leads/${id}`)
}
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] bg-[#f8fafc] overflow-hidden w-full max-w-full">
    
    <!-- 1. Left Column: Sidebar List (Fluid) -->
    <aside class="w-72 xl:w-80 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
      <div class="p-5 border-b border-gray-50">
        <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Danh sách hồ sơ</h2>
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Tìm khách hàng..."
            class="w-full pl-9 py-2 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:ring-1 focus:ring-red-500 transition-all"
          />
          <font-awesome-icon icon="magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        <div 
          v-for="l in leads" :key="l.id"
          @click="selectLead(l.id)"
          :class="[
            'p-3 rounded-xl cursor-pointer transition-all border flex items-center gap-3',
            l.id === route.params.id ? 'bg-red-50 border-red-100' : 'bg-transparent border-transparent hover:bg-gray-50'
          ]"
        >
          <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs shrink-0">
            {{ l.fullName.charAt(0) }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-black text-gray-900 truncate uppercase italic leading-none mb-1">{{ l.fullName }}</p>
            <p class="text-[10px] text-gray-400 font-bold">{{ l.phoneNumber }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 2. Main Content (Fluid Scrollable) -->
    <main class="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
      
      <!-- Center Column: Profile Info -->
      <div class="flex-[1.2] space-y-6 lg:space-y-8 min-w-0">
        
        <!-- Profile Core Card -->
        <div v-if="lead" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          
          <div class="w-24 h-24 rounded-3xl bg-gray-900 text-white flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-gray-200">
            {{ lead.fullName.charAt(0) }}
          </div>
          
          <h1 class="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">{{ lead.fullName }}</h1>
          <div :class="['inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6', getStatusColor(lead.status)]">
            {{ getStatusLabel(lead.status) }}
          </div>

          <div class="flex items-center justify-center gap-4">
             <a :href="`tel:${lead.phoneNumber}`" class="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"><font-awesome-icon icon="phone" /></a>
             <a :href="`https://zalo.me/${lead.phoneNumber}`" target="_blank" class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"><font-awesome-icon icon="comment-dots" /></a>
             <button class="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"><font-awesome-icon icon="envelope" /></button>
          </div>
        </div>

        <!-- Documentation Card -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 class="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 mb-8">
            <font-awesome-icon icon="id-card" class="text-red-600" />
            Hồ sơ làm biển số
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Địa chỉ chi tiết</label>
               <input type="text" placeholder="Số nhà, tổ..." class="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-1 focus:ring-red-500 transition-all" />
            </div>
            <div class="space-y-1.5">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phường/Xã (Biên Hòa)</label>
               <input type="text" placeholder="Trảng Dài..." class="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-1 focus:ring-red-500 transition-all" />
            </div>
            <div class="space-y-1.5">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Số CCCD</label>
               <input type="text" placeholder="075..." class="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-1 focus:ring-red-500 transition-all" />
            </div>
            <div class="space-y-1.5">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ngày cấp</label>
               <input type="date" class="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-1 focus:ring-red-500 transition-all" />
            </div>
          </div>
          
          <div class="mt-8 flex gap-4">
             <div class="flex-1 h-32 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-red-200 transition-colors cursor-pointer">
                <font-awesome-icon icon="cloud-arrow-up" class="text-gray-300 group-hover:text-red-500 transition-colors" />
                <span class="text-[9px] font-black text-gray-400 uppercase">Mặt trước CCCD</span>
             </div>
             <div class="flex-1 h-32 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-red-200 transition-colors cursor-pointer">
                <font-awesome-icon icon="cloud-arrow-up" class="text-gray-300 group-hover:text-red-500 transition-colors" />
                <span class="text-[9px] font-black text-gray-400 uppercase">Mặt sau CCCD</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Timeline & Interactions -->
      <div class="flex-1 space-y-6 lg:space-y-8 min-w-0">
        
        <!-- Navigation Tabs -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
           <button 
             v-for="t in ['timeline', 'ai', 'notes']" :key="t" @click="activeTab = t"
             :class="[
               'flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic whitespace-nowrap',
               activeTab === t ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
             ]"
           >
             <font-awesome-icon :icon="t === 'timeline' ? 'clock-rotate-left' : (t === 'ai' ? 'robot' : 'pen-to-square')" class="mr-2" />
             {{ t === 'timeline' ? 'Thời gian' : (t === 'ai' ? 'Trợ lý AI' : 'Ghi chú') }}
           </button>
        </div>

        <!-- Timeline Content -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[400px]">
           <div v-if="activeTab === 'timeline'" class="space-y-8">
              <div v-for="i in 3" :key="i" class="relative pl-8 border-l border-gray-100 pb-8 last:pb-0 last:border-none">
                 <div class="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-red-50"></div>
                 <div class="flex items-center justify-between mb-2">
                    <p class="text-[10px] font-black text-gray-900 uppercase">19:17 27/04/2026</p>
                    <span class="px-2 py-0.5 rounded bg-gray-50 text-[8px] font-black text-gray-400 uppercase">Cập nhật hệ thống</span>
                 </div>
                 <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p class="text-xs font-bold text-gray-600 italic">"Khách rất ưng ý, đang chờ duyệt hồ sơ vay trả góp từ ngân hàng HD Saison."</p>
                 </div>
              </div>
           </div>
           <div v-else class="flex flex-col items-center justify-center h-full text-center p-10 opacity-20">
              <font-awesome-icon icon="folder-open" class="text-5xl mb-4" />
              <p class="text-xs font-black uppercase tracking-widest">Đang phát triển dữ liệu</p>
           </div>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
