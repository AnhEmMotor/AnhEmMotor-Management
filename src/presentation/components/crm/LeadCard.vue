<script setup>
import { computed } from 'vue'

const props = defineProps({
  lead: {
    type: Object,
    required: true
  },
  activeMenuId: {
    type: [Number, String],
    default: null
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['openDetail', 'toggleMenu', 'refresh', 'assign', 'select'])

const scoreConfig = computed(() => {
  const score = props.lead.score || 0
  if (score >= 80) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' }
  if (score >= 40) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' }
  return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' }
})

const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / 60000)
  if (diffInMinutes < 60) return `${diffInMinutes}p`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes/60)}h`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

const isDelayed = computed(() => {
  if (props.lead.status === 'Closed') return false
  const lastUpdate = new Date(props.lead.updatedAt || props.lead.createdAt)
  const now = new Date()
  return (now - lastUpdate) / 3600000 >= 24
})
</script>

<template>
  <div 
    class="group bg-white h-16 rounded-xl border border-gray-100 flex items-center px-4 gap-4 transition-all hover:border-red-200 hover:shadow-sm w-full overflow-hidden box-border"
    :class="[isSelected ? 'border-red-200 bg-red-50/5 ring-1 ring-red-100' : '']"
  >
    <!-- Column 1: Select & Score -->
    <div class="flex items-center gap-3 shrink-0">
      <input 
        type="checkbox" :checked="isSelected" @change="emit('select', lead.id)"
        class="w-4 h-4 rounded border-gray-300 text-red-600 shrink-0"
      />
      <div 
        class="w-11 h-11 rounded-lg flex flex-col items-center justify-center border shrink-0 shadow-sm"
        :class="[scoreConfig.bg, scoreConfig.text, scoreConfig.border]"
      >
        <span class="text-[7px] font-black uppercase opacity-40 leading-none mb-0.5">Pts</span>
        <span class="text-lg font-black italic leading-none">{{ lead.score || 0 }}</span>
      </div>
    </div>

    <!-- Column 2: Name -->
    <div class="flex-[1.2] min-w-0 flex items-center gap-2">
      <h3 class="text-base font-black text-gray-900 tracking-tight truncate group-hover:text-red-600 transition-colors uppercase italic leading-none">
        {{ lead.fullName }}
      </h3>
      <div v-if="isDelayed" class="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"></div>
    </div>

    <!-- Column 3: Contact -->
    <div class="flex-1 min-w-0 flex items-center gap-2">
      <span class="text-sm font-black text-gray-900 tracking-tighter truncate">{{ lead.phoneNumber }}</span>
      <div class="hidden sm:flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100">
         <a :href="`tel:${lead.phoneNumber}`" class="text-gray-300 hover:text-green-500"><font-awesome-icon :icon="['fas', 'phone']" class="text-[9px]" /></a>
      </div>
    </div>

    <!-- Column 4: Metadata -->
    <div class="hidden lg:flex flex-1 min-w-0 items-center gap-2 border-l border-gray-50 pl-4">
       <div class="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase truncate">
          <font-awesome-icon :icon="['fas', 'motorcycle']" class="text-[8px] opacity-20" />
          <span class="truncate">{{ lead.interestedVehicle || 'Chưa chọn' }}</span>
       </div>
    </div>

    <!-- Column 5: Staff & Activity -->
    <div class="flex-[1.2] min-w-0 flex items-center justify-end gap-4 border-l border-gray-50 pl-4">
       <div class="hidden xl:block text-right min-w-0 flex-1">
          <p class="text-[10px] font-bold text-gray-400 italic truncate mb-0.5">"{{ lead.activities?.length > 0 ? lead.activities[lead.activities.length - 1].description : 'Mới' }}"</p>
          <p class="text-[8px] text-gray-300 font-bold uppercase">{{ getTimeAgo(lead.updatedAt || lead.createdAt) }}</p>
       </div>

       <div class="shrink-0">
          <button v-if="!lead.assignedTo && lead.status !== 'Closed'" @click.stop="emit('assign', lead)" class="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase shadow-sm">Giao việc</button>
          <div v-else-if="lead.assignedTo" @click.stop="emit('assign', lead)" class="flex items-center gap-2 cursor-pointer shrink-0">
             <div class="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-[9px] font-bold border border-gray-100 shadow-sm">
                {{ lead.assignedTo.fullName.charAt(0) }}
             </div>
          </div>
       </div>
    </div>

    <!-- Column 6: Final Actions -->
    <div class="shrink-0 flex items-center justify-end gap-2 pl-2 w-[110px]">
       <button @click="emit('openDetail', lead)" class="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-600 shadow-sm flex-1">Chi tiết</button>
       <div class="relative menu-container">
          <button @click.stop="emit('toggleMenu', lead.id)" class="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-900 rounded-lg transition-all">
             <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" class="text-xs" />
          </button>
       </div>
    </div>
  </div>
</template>

<style scoped>
.box-border { box-sizing: border-box; }
</style>
