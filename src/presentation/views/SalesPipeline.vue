<script setup>
import { onMounted } from 'vue'
import { useLeadStore } from '@stores/lead.store'
import { useToast } from 'vue-toastification'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'

const leadStore = useLeadStore()
const toast = useToast()

onMounted(() => {
  leadStore.fetchPipeline()
})

const handleReset = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa sạch TOÀN BỘ dữ liệu khách hàng không?')) return
  try {
    await leadStore.resetLeads()
    toast.success('Đã dọn dẹp sạch hệ thống.')
    leadStore.fetchPipeline()
  } catch (err) {
    toast.error('Lỗi khi reset dữ liệu.')
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-2xl shadow-xl bg-white min-h-screen border border-gray-100 relative">
    <LoadingOverlay :show="leadStore.loading" message="Đang tải dữ liệu Pipeline..." />
    
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Tiến độ mua hàng (Sales Pipeline)</h1>
        <p class="text-gray-500 font-medium">Theo dõi luồng chốt sale qua từng giai đoạn</p>
      </div>
      <button 
        @click="handleReset"
        class="bg-gray-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2"
      >
        <font-awesome-icon icon="trash-can" />
        Reset Pipeline
      </button>
    </div>

    <!-- Kanban Board -->
    <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      <div v-for="col in leadStore.pipeline" :key="col.status" class="w-80 flex-shrink-0 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col h-[calc(100vh-200px)]">
        <h3 class="font-bold text-gray-700 mb-4 flex justify-between items-center">
          <span>{{ col.statusDisplayName }}</span>
          <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ col.leads.length }}</span>
        </h3>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar space-y-3">
           <template v-if="col.leads.length > 0">
             <div v-for="lead in col.leads" :key="lead.id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-move group">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-tighter">#{{ lead.id }}</span>
                  <div class="flex gap-1">
                    <div v-for="i in 5" :key="i" class="w-1.5 h-1.5 rounded-full" :class="i <= (lead.score / 20) ? 'bg-red-500' : 'bg-gray-200'"></div>
                  </div>
                </div>
                <h4 class="font-bold text-gray-800 group-hover:text-red-600 transition-colors">{{ lead.fullName }}</h4>
                <p class="text-sm text-gray-500 mb-2">{{ lead.phoneNumber }}</p>
                
                <!-- Assigned Staff Badge -->
                <div v-if="lead.assignedTo" class="flex items-center gap-1.5 mb-3 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 w-fit">
                  <font-awesome-icon icon="user-tie" class="text-[8px] text-indigo-400" />
                  <span class="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{{ lead.assignedTo.fullName }}</span>
                </div>

                <div class="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                  <span>{{ lead.source }}</span>
                  <span>{{ new Date(lead.createdAt).toLocaleDateString('vi-VN') }}</span>
                </div>
             </div>
           </template>
           <template v-else>
             <div class="h-full bg-gray-100/30 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4">
                <IconEmptyBox class="h-8 w-8 text-gray-300 mb-2" />
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Trống</p>
             </div>
           </template>
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
