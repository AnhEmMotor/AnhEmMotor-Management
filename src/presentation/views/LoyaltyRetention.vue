<script setup>
import { onMounted, ref, watch } from 'vue'
import { useLoyaltyStore } from '@stores/loyalty.store'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import Input from '@components/ui/input/BaseInput.vue'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'
import { debounce } from 'lodash-es'

const loyaltyStore = useLoyaltyStore()
const searchQuery = ref('')

const debouncedFetch = debounce((val) => {
  loyaltyStore.fetchMembers(val)
}, 500)

watch(searchQuery, (newVal) => {
  debouncedFetch(newVal)
})

onMounted(() => {
  loyaltyStore.fetchMembers()
})

const getTierClass = (tier) => {
  switch (tier) {
    case 'Kim cương': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'Vàng': return 'bg-yellow-50 text-yellow-600 border-yellow-100'
    case 'Bạc': return 'bg-gray-100 text-gray-600 border-gray-200'
    default: return 'bg-gray-50 text-gray-400 border-gray-100'
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-2xl shadow-xl bg-white min-h-screen border border-gray-100 relative">
    <LoadingOverlay :show="loyaltyStore.loading" message="Đang tải dữ liệu hội viên..." />

    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Chăm sóc & Ưu đãi (Loyalty)</h1>
        <p class="text-gray-500 font-medium">Quản lý điểm thưởng, hạng thành viên và voucher</p>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-sm sm:text-base">
          Thiết lập Nhắc lịch
        </button>
        <button class="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 text-sm sm:text-base">
          + Phát hành Voucher
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-6 border-b border-gray-100 mb-8 px-2 overflow-x-auto no-scrollbar">
      <button class="py-3 px-2 border-b-2 border-red-600 font-bold text-red-600 whitespace-nowrap text-sm sm:text-base">Thành viên & Điểm</button>
      <button class="py-3 px-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap text-sm sm:text-base">Kho Voucher</button>
      <button class="py-3 px-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap text-sm sm:text-base">Lịch nhắc tự động</button>
    </div>

    <div class="mb-8 relative max-w-2xl">
        <Input v-model="searchQuery" type="text" placeholder="Tìm kiếm hội viên theo Tên hoặc SĐT..." class="w-full !pl-12 !py-4 !rounded-2xl shadow-sm border-gray-100" />
        <font-awesome-icon icon="magnifying-glass" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
    </div>

    <div v-if="loyaltyStore.members.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <div v-for="m in loyaltyStore.members" :key="m.id" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xl">
              {{ m.fullName.charAt(0) }}
            </div>
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border" :class="getTierClass(m.tier)">
              {{ m.tier }}
            </span>
          </div>
          
          <h4 class="font-bold text-gray-900 text-lg mb-1 group-hover:text-red-600 transition-colors">{{ m.fullName }}</h4>
          <p class="text-sm text-gray-400 font-medium mb-6">{{ m.phoneNumber }}</p>
          
          <div class="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Điểm tích lũy</p>
              <p class="text-2xl font-black text-gray-900">{{ m.points }} <span class="text-sm text-gray-400 ml-1">pts</span></p>
            </div>
            <button class="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm">
              <font-awesome-icon icon="ellipsis-vertical" />
            </button>
          </div>
       </div>
    </div>

    <div v-else class="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
        <div class="bg-white p-6 rounded-3xl shadow-sm inline-block mb-6">
            <IconEmptyBox class="h-16 w-16 text-gray-200" />
        </div>
        <p class="text-gray-400 font-bold text-xl uppercase italic">Chưa có dữ liệu hội viên</p>
    </div>
  </div>
</template>

<style scoped>
.italic { font-style: italic; }
</style>

