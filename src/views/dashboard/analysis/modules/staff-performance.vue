<template>
  <div class="art-card p-5 h-full flex flex-col justify-between">
    <div>
      <div class="flex justify-between items-center mb-6">
        <h4 class="m-0 font-bold text-lg">HIỆU SUẤT SALE</h4>
        <span class="text-sm text-gray-500">— Tháng 5/2026</span>
      </div>

      <div class="space-y-4">
        <div
          v-for="(staff, index) in staffList"
          :key="index"
          class="flex items-center text-sm"
        >
          <div class="w-8 font-bold text-gray-500">#{{ index + 1 }}</div>
          <div class="w-24 truncate">{{ staff.name }}</div>
          <div class="flex-1 mx-2">
            <ElProgress
              :percentage="calculatePercentage(staff.amount, 50000000)"
              :color="staff.color"
              :show-text="false"
              :stroke-width="8"
            />
          </div>
          <div class="w-24 text-right font-medium">
            {{ formatCurrency(staff.amount) }}
          </div>
          <div class="w-28 text-right text-xs" :class="staff.statusColor">
            <span class="mr-1">{{ staff.icon }}</span> {{ staff.status }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-gray-100">
      <div class="flex justify-between text-sm mb-2">
        <span class="font-medium text-gray-600">Tổng team:</span>
        <span class="font-bold">91.000.000đ / 120.000.000đ</span>
      </div>
      <div class="flex items-center">
        <div class="flex-1 mr-3">
          <ElProgress
            :percentage="76"
            color="#67c23a"
            :show-text="false"
            :stroke-width="10"
          />
        </div>
        <div class="text-sm font-bold text-green-600">76% mục tiêu</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  period: {
    type: String,
    default: "today",
  },
});

const staffList = ref([
  {
    name: "Nguyễn A",
    amount: 42000000,
    status: "Vượt KPI",
    icon: "⭐",
    color: "#409eff",
    statusColor: "text-blue-500",
  },
  {
    name: "Trần B",
    amount: 31000000,
    status: "Đạt",
    icon: "✓",
    color: "#67c23a",
    statusColor: "text-green-500",
  },
  {
    name: "Lê C",
    amount: 18000000,
    status: "Cần cải thiện",
    icon: "⚠️",
    color: "#e6a23c",
    statusColor: "text-orange-500",
  },
]);

const calculatePercentage = (amount: number, max: number) => {
  return Number(Math.min((amount / max) * 100, 100).toFixed(1));
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};
</script>

<style scoped>
.art-card {
  background-color: var(--art-bg-color);
  border: 1px solid var(--art-border-color);
  border-radius: var(--art-border-radius);
}
</style>
