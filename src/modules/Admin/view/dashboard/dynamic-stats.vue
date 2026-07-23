<template>
  <div class="resp-page art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>Hoạt động Hệ thống</h4>
        <p>Audit Log toàn bộ hệ thống</p>
      </div>
    </div>

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="3" animated />
    </div>
    <div v-else class="h-9/10 mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden whitespace-nowrap text-ellipsis last:border-b-0"
          v-for="(item, index) in list"
          :key="index"
        >
          <Badge status="info" :text="item.category" />
          <span class="mx-2 text-g-600">{{ item.action }}</span>
          <span class="text-theme">{{ item.targetType }}</span>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { fetchRecentAuditLogs } from "@/api/dashboard.api";

const CATEGORY_COLORS: Record<string, string> = {
  order: "text-blue-600",
  inventory: "text-amber-500",
  customer: "text-emerald-500",
  operations: "text-rose-500",
  finance: "text-purple-500",
};

interface AuditLogItem {
  timestamp: string;
  category: string;
  action: string;
  actorId: string | null;
  actorName: string;
  targetType: string;
  targetId: number | null;
  targetName: string;
  details: string;
}

const list = reactive<AuditLogItem[]>([]);
const isLoading = ref(false);

function fmtTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "target",
  });
}

const targetTypeLabel: Record<string, string> = {
  Order: "Đơn hàng",
  Vehicle: "Xe",
  Part: "Phụ tùng",
  Customer: "Khách hàng",
  Feedback: "Phản hồi",
  Appointment: "Lịch hẹn",
  FinanceContract: "Hợp đồng",
};

async function fetchData() {
  isLoading.value = true;
  try {
    const data = await fetchRecentAuditLogs(20);
    list.length = 0;
    data.forEach((log: AuditLogItem) => {
      list.push({ ...log });
    });
  } catch (error) {
    console.error("Failed to fetch recent audit logs:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>
