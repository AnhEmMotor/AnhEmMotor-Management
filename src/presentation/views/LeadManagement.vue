<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useLeadStore } from '@stores/lead.store'
import { useUserStore } from '@stores/user.store'
import { useToast } from 'vue-toastification'
import Input from '@components/ui/input/BaseInput.vue'
import LeadCard from '@components/crm/LeadCard.vue'

const leadStore = useLeadStore()
const userStore = useUserStore()
const router = useRouter()
const toast = useToast()
const queryClient = useQueryClient()

const searchQuery = ref('')
const selectedStatus = ref('All')
const activeMenuId = ref(null)

// Advanced Filters
const filterSource = ref('')
const filterStaff = ref('')

// Bulk Selection
const selectedLeadIds = ref([])

// Assignment Modal State
const isAssignModalOpen = ref(false)
const leadToAssign = ref(null)
const selectedStaffId = ref(null)

const statusTabs = [
  { id: 'All', label: 'Tất cả' },
  { id: 'Urgent', label: 'Gấp' },
  { id: 'New', label: 'Mới' },
  { id: 'Consulting', label: 'Tư vấn' },
  { id: 'TestDriving', label: 'Lái thử' },
  { id: 'Negotiating', label: 'Thương lượng' },
  { id: 'Closed', label: 'Đã chốt' },
]

// Fetch Leads
const { data: leadsData, isLoading, refetch } = useQuery({
  queryKey: ['leads'],
  queryFn: () => leadStore.fetchLeads(),
})

// Fetch Staff
const { data: staffData } = useQuery({
  queryKey: ['staff-list'],
  queryFn: async () => {
    const res = await userStore.fetchBasicUsers({ filters: 'roles@=Sale' })
    return res.data
  }
})

const leads = computed(() => leadsData.value || [])
const staff = computed(() => staffData.value || [])

const getStaffLeadCount = (staffId) => {
  return leads.value.filter(l => l.assignedToId === staffId && l.status !== 'Closed').length
}

const isSlowCare = (lead) => {
  if (lead.status === 'Closed') return false
  const lastUpdate = new Date(lead.updatedAt || lead.createdAt)
  const now = new Date()
  return (now - lastUpdate) / 3600000 >= 24
}

const getCount = (status) => {
  if (status === 'All') return leads.value.length
  if (status === 'Urgent' || status === 'Gấp') return leads.value.filter(l => isSlowCare(l)).length
  return leads.value.filter(l => l.status === status).length
}

const filteredLeads = computed(() => {
  let list = [...leads.value]
  if (selectedStatus.value === 'Urgent' || selectedStatus.value === 'Gấp') {
    list = list.filter(l => isSlowCare(l))
  } else if (selectedStatus.value !== 'All') {
    list = list.filter(l => l.status === selectedStatus.value)
  }
  if (filterSource.value) list = list.filter(l => l.source === filterSource.value)
  if (filterStaff.value) list = list.filter(l => l.assignedToId === filterStaff.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(l => (l.fullName || '').toLowerCase().includes(q) || (l.phoneNumber || '').includes(q))
  }
  return list.sort((a, b) => isSlowCare(b) - isSlowCare(a))
})

const openAssignModal = (lead = null) => {
  leadToAssign.value = lead
  selectedStaffId.value = lead?.assignedToId || null
  isAssignModalOpen.value = true
}

const confirmAssign = async () => {
  if (!selectedStaffId.value) return
  try {
    if (leadToAssign.value) {
      await leadStore.assignLead(leadToAssign.value.id, selectedStaffId.value)
    } else {
      for (const id of selectedLeadIds.value) await leadStore.assignLead(id, selectedStaffId.value)
      selectedLeadIds.value = []
    }
    isAssignModalOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['leads'] })
    toast.success('Giao việc thành công!')
  } catch (err) { toast.error('Lỗi khi giao việc.') }
}

const openDetail = (lead) => {
  router.push(`/leads/${lead.id}`)
}

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

onMounted(() => {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) activeMenuId.value = null
  })
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-64px)] bg-[#fdfdfd] overflow-hidden w-full max-w-full relative">
    
    <header class="h-16 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-40 w-full overflow-hidden">
      <div class="flex items-center gap-4 min-w-0">
        <h1 class="text-xl font-black text-gray-900 tracking-tight italic uppercase shrink-0 leading-none">Lead Center</h1>
        <div class="hidden lg:flex items-center gap-2 border-l border-gray-100 pl-4">
          <div class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-500 shadow-sm">TẤT CẢ: {{ leads.length }}</div>
          <div class="px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-[10px] font-black text-red-600 shadow-sm">GẤP: {{ getCount('Urgent') }}</div>
        </div>
      </div>

      <div class="flex items-center gap-3 min-w-0 max-w-sm flex-1 justify-end">
        <div class="relative w-full max-w-[200px]">
          <Input v-model="searchQuery" type="text" placeholder="Tìm kiếm..." class="w-full !pl-8 !py-2 !rounded-lg bg-gray-50 border-transparent text-[11px] font-bold" />
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
        </div>
        <button @click="refetch()" class="w-8 h-8 rounded-lg border border-gray-100 text-gray-400 hover:text-red-600 flex items-center justify-center transition-all shrink-0"><font-awesome-icon :icon="['fas', 'rotate']" class="text-xs" /></button>
      </div>
    </header>

    <div class="shrink-0 bg-white border-b border-gray-50 px-6 py-3 flex items-center justify-between gap-4 z-30 shadow-sm w-full overflow-hidden">
       <div class="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0">
          <button v-for="tab in statusTabs" :key="tab.id" @click="selectedStatus = tab.id" :class="['px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg whitespace-nowrap italic leading-none', selectedStatus === tab.id ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-900']">
            {{ tab.label }}
          </button>
       </div>

       <div class="flex items-center gap-2 shrink-0 border-l border-gray-50 pl-4">
          <div class="flex items-center gap-2">
             <div class="relative">
                <select v-model="filterSource" class="bg-gray-100/50 border-none rounded-lg px-3 py-2 text-xs font-black outline-none focus:ring-1 focus:ring-red-500 min-w-[120px] max-w-[140px] appearance-none cursor-pointer">
                   <option value="">Nguồn khách</option>
                   <option value="Facebook">Facebook</option>
                   <option value="WebStore">Website</option>
                   <option value="Shop">Trực tiếp</option>
                </select>
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] pointer-events-none" />
             </div>
             <div class="relative">
                <select v-model="filterStaff" class="bg-gray-100/50 border-none rounded-lg px-3 py-2 text-xs font-black outline-none focus:ring-1 focus:ring-red-500 min-w-[130px] max-w-[150px] appearance-none cursor-pointer">
                   <option value="">Nhân viên</option>
                   <option v-for="s in staff" :key="s.id" :value="s.id">{{ s.fullName }}</option>
                </select>
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] pointer-events-none" />
             </div>
          </div>
          <button @click="filterSource=''; filterStaff=''; searchQuery='';" class="text-[10px] font-black text-red-500 uppercase px-1 hover:underline shrink-0">XÓA</button>
       </div>
    </div>

    <main class="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 bg-[#fdfdfd] w-full overflow-x-hidden">
      <div class="w-full mx-auto space-y-3 max-w-full overflow-x-hidden">
        <div v-if="isLoading" class="space-y-3"><div v-for="i in 8" :key="i" class="h-16 bg-white rounded-xl animate-pulse"></div></div>
        <div v-else class="space-y-3 w-full overflow-hidden">
           <LeadCard 
             v-for="lead in filteredLeads" :key="lead.id" :lead="lead" :activeMenuId="activeMenuId"
             :isSelected="selectedLeadIds.includes(lead.id)"
             @openDetail="openDetail" @toggleMenu="toggleMenu" @assign="openAssignModal"
             @select="(id) => selectedLeadIds.includes(id) ? selectedLeadIds = selectedLeadIds.filter(i => i !== id) : selectedLeadIds.push(id)"
             @refetch="refetch"
           />
        </div>
      </div>
    </main>

    <Teleport to="body">
      <div v-if="isAssignModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]" @click="isAssignModalOpen = false"></div>
        <div class="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
          <h2 class="text-lg font-black text-gray-900 uppercase italic mb-6">Giao việc</h2>
          <div class="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
             <div v-for="user in staff" :key="user.id" @click="selectedStaffId = user.id" :class="['p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between', selectedStaffId === user.id ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-transparent hover:bg-gray-100']">
                <p class="text-xs font-bold text-gray-900">{{ user.fullName }}</p>
                <span class="text-[8px] font-black px-2 py-0.5 rounded bg-white border border-gray-100">{{ getStaffLeadCount(user.id) }} khách</span>
             </div>
          </div>
          <div class="mt-8 flex gap-2">
             <button @click="isAssignModalOpen = false" class="flex-1 py-3 bg-gray-50 text-gray-400 rounded-xl font-bold text-[9px] uppercase">Hủy</button>
             <button @click="confirmAssign" class="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-[9px] uppercase shadow-lg shadow-gray-100">Xác nhận</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
