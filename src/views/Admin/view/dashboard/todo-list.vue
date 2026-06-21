<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>Cảnh báo hệ thống</h4>
        <p>Cần xử lý gấp: <span class="text-danger">5</span></p>
      </div>
    </div>

    <div class="h-[calc(100%-40px)] overflow-auto">
      <ElScrollbar>
        <div
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0"
          v-for="(item, index) in list"
          :key="index"
        >
          <div class="w-[calc(100%-40px)] pr-2">
            <p
              class="text-sm font-medium text-g-800 whitespace-nowrap overflow-hidden text-ellipsis"
              >{{ item.title }}</p
            >
            <p class="text-g-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{{
              item.desc
            }}</p>
          </div>
          <span class="text-theme cursor-pointer font-medium whitespace-nowrap">Xử lý</span>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import { ElScrollbar } from 'element-plus'

  interface AlertItem {
    title: string
    desc: string
  }

  const list = reactive<AlertItem[]>([
    {
      title: 'Hóa đơn lỗi chưa xử lý',
      desc: 'HĐ HD-092 bị từ chối do sai MST',
    },
    {
      title: 'Phiếu sửa chữa quá hạn',
      desc: 'Xe SH vào xưởng > 4h chưa xong',
    },
    {
      title: 'Hợp đồng sắp hết hạn',
      desc: 'HĐ NCC Honda VN hết sau 30 ngày',
    },
    {
      title: 'Tồn kho phụ tùng thấp',
      desc: 'Nhớt Castrol Power1 dưới định mức',
    },
    {
      title: 'Trễ hạn bàn giao xe',
      desc: 'Đơn DH-2026-902 trễ hẹn 1 ngày',
    },
    {
      title: 'Cảnh báo doanh thu',
      desc: 'Doanh thu hôm nay < 50% mục tiêu',
    },
  ])
</script>
