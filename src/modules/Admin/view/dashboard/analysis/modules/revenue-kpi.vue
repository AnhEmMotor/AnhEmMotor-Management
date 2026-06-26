<template>
  <ElRow :gutter="20">
    <!-- Card 1: Doanh thu thực tế -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24" class="mb-4">
      <div class="art-card h-full p-4 flex flex-col justify-between">
        <div>
          <p
            class="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold"
          >
            DOANH THU THỰC TẾ
          </p>
          <div class="text-2xl font-bold mb-2">85.500.000đ</div>
          <div class="text-sm mb-4">
            <span class="text-green-500 font-bold">▲ +12%</span> so với hôm qua
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>Mục tiêu ngày: 100tr</span>
            <span>85%</span>
          </div>
          <ElProgress
            :percentage="85"
            :show-text="false"
            color="#409eff"
            :stroke-width="8"
          />
        </div>
      </div>
    </ElCol>

    <!-- Card 2: Lợi nhuận ròng -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24" class="mb-4">
      <div class="art-card h-full p-4 flex flex-col justify-between">
        <div>
          <p
            class="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold"
          >
            LỢI NHUẬN RÒNG
          </p>
          <div class="text-2xl font-bold mb-2">18.200.000đ</div>
        </div>
        <div class="text-sm">
          <div class="mb-1">Biên lợi nhuận: 21%</div>
          <div class="text-red-500 font-bold">
            ▼ -3%
            <span class="text-gray-600 dark:text-gray-300 font-normal"
              >so với hôm qua</span
            >
          </div>
        </div>
      </div>
    </ElCol>

    <!-- Card 3: Tiền đang treo -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24" class="mb-4">
      <div class="art-card h-full p-4 flex flex-col justify-between">
        <div>
          <p
            class="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold"
          >
            TIỀN ĐANG TREO
          </p>
          <div class="text-2xl font-bold mb-2 text-orange-500">42.000.000đ</div>
        </div>
        <div class="text-sm space-y-1">
          <div class="flex justify-between">
            <span>• Cọc giữ xe:</span>
            <span class="font-medium">12.000.000đ</span>
          </div>
          <div class="flex justify-between">
            <span>• Chờ NH giải ngân:</span>
            <span class="font-medium">30.000.000đ</span>
          </div>
        </div>
      </div>
    </ElCol>

    <!-- Card 4: Cảnh báo cần xử lý -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24" class="mb-4">
      <div class="art-card h-full p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold">
          CẦN XỬ LÝ
        </p>
        <ul class="text-sm space-y-2 mt-3 cursor-pointer">
          <li class="flex items-center hover:text-blue-500 transition-colors">
            <span class="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span class="font-bold mr-1">2</span> Khiếu nại mới
          </li>
          <li class="flex items-center hover:text-blue-500 transition-colors">
            <span class="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
            <span class="font-bold mr-1">1</span> NH chậm giải ngân
          </li>
          <li class="flex items-center hover:text-blue-500 transition-colors">
            <span class="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
            <span class="font-bold mr-1">3</span> Xe sắp hết hàng
          </li>
          <li
            class="flex items-center hover:text-blue-500 transition-colors text-gray-400"
          >
            <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span class="font-bold mr-1">0</span> Lịch hẹn bị bỏ lỡ
          </li>
        </ul>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
defineProps({
  period: {
    type: String,
    default: "today",
  },
});
</script>

<style scoped>
.art-card {
  background-color: var(--art-bg-color);
  border: 1px solid var(--art-border-color);
  border-radius: var(--art-border-radius);
}
</style>
