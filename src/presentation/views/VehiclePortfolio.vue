<script setup>
import { onMounted, ref, watch } from 'vue'
import { useVehicleStore } from '@stores/vehicle.store'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import Input from '@components/ui/input/BaseInput.vue'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'
import { debounce } from 'lodash-es'

const vehicleStore = useVehicleStore()
const searchQuery = ref('')

const debouncedFetch = debounce((val) => {
  vehicleStore.fetchVehicles(val)
}, 500)

watch(searchQuery, (newVal) => {
  debouncedFetch(newVal)
})

onMounted(() => {
  vehicleStore.fetchVehicles()
})
</script>

<template>
  <div class="p-4 sm:p-6 rounded-2xl shadow-xl bg-white min-h-screen border border-gray-100 relative">
    <LoadingOverlay :show="vehicleStore.loading" message="Đang tải hồ sơ xe..." />

    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Quản lý Tài sản (Vehicle Portfolio)</h1>
        <p class="text-gray-500 font-medium">Lưu trữ thông tin xe khách đã mua và hồ sơ pháp lý</p>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
          + Thêm Hồ Sơ Xe
        </button>
      </div>
    </div>

    <div class="mb-8 relative max-w-2xl">
        <Input v-model="searchQuery" type="text" placeholder="Tra cứu theo Biển số, Số khung hoặc Tên khách hàng..." class="w-full !pl-12 !py-4 !rounded-2xl shadow-sm border-gray-100" />
        <font-awesome-icon icon="magnifying-glass" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
    </div>

    <div v-if="vehicleStore.vehicles.length > 0" class="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-100 shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Khách hàng</th>
            <th class="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Biển số</th>
            <th class="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Số khung / Số máy</th>
            <th class="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Ngày mua</th>
            <th class="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vehicleStore.vehicles" :key="v.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
            <td class="p-4">
              <div class="font-bold text-gray-800">{{ v.fullName }}</div>
              <div class="text-xs text-gray-400">{{ v.phoneNumber }}</div>
            </td>
            <td class="p-4">
              <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-black text-sm border border-slate-200">{{ v.licensePlate || 'CHƯA CÓ' }}</span>
            </td>
            <td class="p-4">
              <div class="text-xs font-medium text-gray-500 uppercase italic">VIN: {{ v.vinNumber }}</div>
              <div class="text-[10px] text-gray-400 uppercase italic">ENG: {{ v.engineNumber }}</div>
            </td>
            <td class="p-4">
              <div class="text-sm font-medium text-gray-600">{{ new Date(v.purchaseDate).toLocaleDateString('vi-VN') }}</div>
            </td>
            <td class="p-4 text-right">
              <button class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <font-awesome-icon icon="eye" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
        <div class="bg-white p-6 rounded-3xl shadow-sm inline-block mb-6">
            <IconEmptyBox class="h-16 w-16 text-gray-200" />
        </div>
        <p class="text-gray-400 font-bold text-xl uppercase italic">Chưa có hồ sơ xe nào</p>
        <p class="text-gray-400 mt-2">Dữ liệu sẽ hiển thị khi hợp đồng mua bán hoàn tất</p>
    </div>
  </div>
</template>

<style scoped>
.italic { font-style: italic; }
</style>

