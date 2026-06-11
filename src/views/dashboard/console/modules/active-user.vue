<template>
  <div class="art-card h-128 p-4 box-border mb-5 max-sm:mb-4">
    <div class="ml-1 mt-2">
      <h3 class="text-lg font-medium">Dashboard Xưởng (Workshop)</h3>
      <p class="mt-1 text-sm text-g-500">Tổng quan hoạt động dịch vụ sửa chữa</p>
    </div>

    <div class="flex flex-col gap-6 mt-8">
      <div class="flex-b p-4 rounded-lg bg-theme/10">
        <div>
          <p class="text-sm text-g-600 font-medium">Phiếu đang In Progress</p>
          <p class="text-2xl text-theme font-medium mt-1"
            >12 <span class="text-sm text-g-500">phiếu</span></p
          >
        </div>
        <ArtSvgIcon icon="ri:tools-line" class="text-3xl text-theme" />
      </div>

      <div class="flex-b p-4 rounded-lg bg-success/10">
        <div>
          <p class="text-sm text-g-600 font-medium">Thời gian TB hoàn thành</p>
          <p class="text-2xl text-success font-medium mt-1"
            >45 <span class="text-sm text-g-500">phút</span></p
          >
        </div>
        <ArtSvgIcon icon="ri:timer-line" class="text-3xl text-success" />
      </div>

      <div class="flex-b p-4 rounded-lg bg-warning/10">
        <div>
          <p class="text-sm text-g-600 font-medium">Doanh thu dịch vụ (Hôm nay)</p>
          <p class="text-2xl text-warning font-medium mt-1"
            >8.500.000 <span class="text-sm text-g-500">VNĐ</span></p
          >
        </div>
        <ArtSvgIcon icon="ri:hand-coin-line" class="text-3xl text-warning" />
      </div>
    </div>

    <div class="mt-6 border-t border-g-300 pt-4">
      <p class="text-sm font-medium text-g-700 mb-2">Tỷ trọng doanh thu dịch vụ</p>
      <ElProgress :percentage="15" :stroke-width="12" color="var(--art-success)">
        <span class="text-xs text-g-700">15%</span>
      </ElProgress>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElProgress } from 'element-plus'
</script>
