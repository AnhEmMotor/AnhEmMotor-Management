<script setup>
import { ref, computed, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useLeadStore } from '@stores/lead.store'
import { useToast } from 'vue-toastification'
import BaseInput from '@components/ui/input/BaseInput.vue'

const leadStore = useLeadStore()
const toast = useToast()
const queryClient = useQueryClient()

const activeTab = ref('Timeline')
const searchQuery = ref('')
const selectedCustomerId = ref(null)
const isSaving = ref(false)
const newNote = ref('')

const tabs = [
  { id: 'Timeline', label: 'Dòng thời gian', icon: 'clock-rotate-left' },
  { id: 'AI', label: 'AI Insight', icon: 'robot' },
  { id: 'Notes', label: 'Ghi chú', icon: 'pen-nib' },
  { id: 'Assets', label: 'Hồ sơ xe', icon: 'motorcycle' },
]

const registrationSteps = [
  { id: 1, label: 'Thu hồ sơ' },
  { id: 2, label: 'Nộp thuế' },
  { id: 3, label: 'Bấm biển' },
  { id: 4, label: 'Hoàn tất' }
]
const currentStep = ref(2)
const districts = ['TP. Biên Hòa', 'Huyện Vĩnh Cửu', 'Huyện Trảng Bom', 'Huyện Long Thành', 'Huyện Nhơn Trạch']

const { data: leadsData, isLoading } = useQuery({
  queryKey: ['customers-list'],
  queryFn: () => leadStore.fetchLeads(),
})

const customers = computed(() => {
  const list = leadsData.value || []
  return list.filter(l => l.status === 'Closed' || l.score >= 80)
})

const filteredCustomersList = computed(() => {
  let list = customers.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.fullName.toLowerCase().includes(q) || c.phoneNumber.includes(q))
  }
  return list
})

const selectedCustomer = computed(() => {
  if (!selectedCustomerId.value && customers.value.length > 0) return customers.value[0]
  return customers.value.find(c => c.id === selectedCustomerId.value) || customers.value[0]
})

const form = ref({})
watch(selectedCustomer, (newVal) => {
  if (newVal) {
    selectedCustomerId.value = newVal.id
    form.value = { ...newVal }
  }
}, { immediate: true })

const sortedActivities = computed(() => {
  if (!selectedCustomer.value?.activities) return []
  return [...selectedCustomer.value.activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const getActivityStyles = (type) => {
  switch (type) {
    case 'Appointment': return { color: 'text-red-600', bg: 'bg-red-50', icon: 'calendar-check', border: 'border-red-100' }
    case 'Consulting': return { color: 'text-green-600', bg: 'bg-green-50', icon: 'phone-volume', border: 'border-green-100' }
    case 'TestDrive': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: 'motorcycle', border: 'border-blue-100' }
    default: return { color: 'text-gray-400', bg: 'bg-gray-50', icon: 'circle-info', border: 'border-gray-50' }
  }
}

const handleSave = async () => {
  isSaving.value = true
  try {
    await leadStore.updateLead(form.value)
    toast.success('Thành công!')
  } catch (error) { toast.error('Lỗi.') }
  finally { isSaving.value = false }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-[#fdfdfd] w-full max-w-full relative">
    
    <!-- SIDEBAR -->
    <aside class="w-64 xl:w-72 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-gray-50">
        <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Hồ sơ khách hàng</h2>
        <div class="relative">
          <input 
            v-model="searchQuery" type="text" placeholder="Tìm tên, SĐT..."
            class="w-full pl-9 py-2.5 bg-gray-50 border-transparent rounded-xl text-[11px] font-bold focus:bg-white transition-all outline-none"
          />
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]" />
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        <div 
          v-for="customer in filteredCustomersList" :key="customer.id"
          @click="selectedCustomerId = customer.id"
          :class="[
            'p-3 rounded-xl cursor-pointer transition-all border flex items-center gap-3',
            selectedCustomerId === customer.id ? 'bg-red-50 border-red-100' : 'bg-transparent border-transparent hover:bg-gray-50'
          ]"
        >
          <div class="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-black shrink-0">
            {{ customer.fullName.charAt(0) }}
          </div>
          <div class="min-w-0">
            <h4 class="text-[11px] font-black text-gray-900 truncate uppercase italic leading-none mb-1">{{ customer.fullName }}</h4>
            <div class="flex items-center gap-2">
               <span class="text-[9px] text-gray-400 font-bold">{{ customer.phoneNumber }}</span>
               <span class="text-[8px] font-black text-red-500 italic">Pts: {{ customer.score }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN AREA -->
    <main v-if="selectedCustomer" class="flex-1 flex overflow-hidden bg-[#fdfdfd]">
      
      <!-- Center (Identity & Docs) -->
      <div class="w-full lg:basis-[40%] xl:basis-[35%] shrink-0 border-r border-gray-50 overflow-y-auto no-scrollbar p-6 space-y-6">
         <!-- Profile Card -->
         <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div class="absolute top-2 right-2 w-10 h-10 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center shadow-md">
               <span class="text-[14px] font-black italic leading-none">{{ selectedCustomer.score }}</span>
            </div>
            <div class="w-20 h-20 bg-gray-900 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4">
               {{ selectedCustomer.fullName?.charAt(0) }}
            </div>
            <h2 class="text-lg font-black text-gray-900 uppercase italic tracking-tighter mb-2 truncate px-2">{{ selectedCustomer.fullName }}</h2>
            <div class="flex flex-wrap justify-center gap-1 mb-5">
               <span class="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-100">CHÍNH THỨC</span>
               <span class="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">#WinnerX</span>
            </div>
            <div class="flex justify-center gap-2">
               <a :href="`tel:${selectedCustomer.phoneNumber}`" class="flex-1 py-2.5 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-md text-[10px] font-black uppercase"><font-awesome-icon :icon="['fas', 'phone']" /> Gọi</a>
               <a :href="`https://zalo.me/${selectedCustomer.phoneNumber}`" target="_blank" class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-md text-[10px] font-black uppercase"><font-awesome-icon :icon="['fas', 'comment-dots']" /> Zalo PC</a>
            </div>
         </div>

         <!-- Registration -->
         <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 class="text-[9px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2 mb-2"><font-awesome-icon :icon="['fas', 'file-invoice']" /> Hồ sơ làm biển số</h3>
            <!-- Stepper -->
            <div class="relative pt-2 pb-6 px-1">
               <div class="absolute left-0 right-0 top-3.5 h-0.5 bg-gray-100"></div>
               <div class="absolute left-0 top-3.5 h-0.5 bg-red-600 transition-all duration-700" :style="{ width: (currentStep/3)*100 + '%' }"></div>
               <div class="flex justify-between relative">
                  <div v-for="step in registrationSteps" :key="step.id" class="flex flex-col items-center">
                     <div :class="['w-2.5 h-2.5 rounded-full border-2 transition-all', step.id <= currentStep ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200']"></div>
                     <span class="text-[6px] font-black uppercase mt-2 text-gray-400 absolute -bottom-4 whitespace-nowrap">{{ step.label }}</span>
                  </div>
               </div>
            </div>
            <div class="space-y-3 pt-4">
               <BaseInput v-model="form.addressDetail" label="Địa chỉ" class="!text-[10px]" />
               <div class="space-y-1">
                  <label class="text-[8px] font-black uppercase text-gray-400 ml-1">Quận/Huyện</label>
                  <select v-model="form.district" class="w-full px-3 py-2 bg-gray-50 rounded-lg text-xs font-bold outline-none border-none appearance-none cursor-pointer">
                     <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
                  </select>
               </div>
               <BaseInput v-model="form.identificationNumber" label="Số CCCD" class="!text-[10px]" />
               <div class="grid grid-cols-2 gap-2">
                  <div class="h-20 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300 hover:border-red-100 transition-all cursor-pointer"><font-awesome-icon :icon="['fas', 'plus']" class="text-[10px] mb-1" /><span class="text-[6px] font-black uppercase">Mặt trước</span></div>
                  <div class="h-20 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300 hover:border-red-100 transition-all cursor-pointer"><font-awesome-icon :icon="['fas', 'plus']" class="text-[10px] mb-1" /><span class="text-[6px] font-black uppercase">Mặt sau</span></div>
               </div>
               <button @click="handleSave" class="w-full py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-600 shadow-md transition-all">Lưu hồ sơ</button>
            </div>
         </div>
      </div>

      <!-- Right (Timeline) -->
      <div class="flex-1 overflow-hidden flex flex-col bg-white">
         
         <!-- SLIM TABS (Fixed Height & Gap) -->
         <div class="h-14 shrink-0 bg-white border-b border-gray-50 flex items-center px-4 gap-1 z-30">
            <button 
              v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
              :class="[
                'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap shrink-0',
                activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <font-awesome-icon :icon="['fas', tab.icon]" class="text-[10px]" />
              {{ tab.label }}
            </button>
         </div>

         <!-- CONTENT SCROLL AREA -->
         <div class="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8">
            <div v-if="activeTab === 'Timeline'" class="space-y-8">
               <div v-for="act in sortedActivities" :key="act.id" class="relative pl-8 border-l border-gray-50 pb-8 last:pb-0 last:border-none">
                  <div :class="['absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full shadow-sm', getActivityStyles(act.activityType).bg, getActivityStyles(act.activityType).color === 'text-red-600' ? 'bg-red-600 ring-4 ring-red-50' : 'bg-gray-300']"></div>
                  <div class="flex items-center justify-between mb-2">
                     <p class="text-[10px] font-black text-gray-900 uppercase italic">{{ formatDateTime(act.createdAt) }}</p>
                     <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase', getActivityStyles(act.activityType).bg, getActivityStyles(act.activityType).color]">
                        {{ act.activityType }}
                     </span>
                  </div>
                  <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                     <p class="text-[11px] font-bold text-gray-700 italic leading-snug">"{{ act.description }}"</p>
                  </div>
               </div>
            </div>

            <div v-if="activeTab === 'AI'" class="space-y-6">
               <div class="bg-gray-900 p-8 rounded-3xl text-white">
                  <h4 class="text-[9px] font-black uppercase tracking-widest text-red-500 mb-4 italic">AI Intelligence Summary</h4>
                  <p class="text-lg font-black italic tracking-tight leading-relaxed">"Khách đang phân vân giữa CBR150R và R15, quan tâm nhiều đến mức tiêu hao xăng và bảo dưỡng."</p>
               </div>
            </div>

            <div v-if="activeTab === 'Notes'" class="space-y-4">
               <textarea v-model="newNote" placeholder="Ghi chú mật..." class="w-full h-32 bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold italic outline-none"></textarea>
               <button class="px-6 py-2 bg-gray-900 text-white text-[9px] font-black uppercase rounded-lg">Lưu</button>
            </div>

            <div v-if="activeTab === 'Assets'" class="grid grid-cols-2 gap-4">
               <div class="bg-gray-50 p-6 rounded-2xl border border-gray-50 text-center opacity-30"><font-awesome-icon :icon="['fas', 'folder-open']" class="text-3xl mb-2" /><p class="text-[10px] font-black uppercase">Đang tải hồ sơ xe...</p></div>
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
