<script setup>
import { ref } from 'vue'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import Input from '@/components/ui/input/BaseInput.vue'
</script>

<template>
  <div class="p-4 sm:p-6 rounded-2xl shadow-xl bg-white min-h-screen border border-gray-100">
    <div class="mb-8 flex justify-between items-end">
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
        <Input type="text" placeholder="Tra cứu theo Biển số, Số khung hoặc Tên khách hàng..." class="w-full !pl-12 !py-4 !rounded-2xl shadow-sm border-gray-100" />
        <font-awesome-icon icon="magnifying-glass" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
    </div>

    <div class="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
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
