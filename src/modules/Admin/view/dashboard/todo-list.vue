<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>Cảnh báo hệ thống</h4>
        <p>
          Cần xử lý gấp: <span class="text-danger">{{ totalAlerts }}</span>
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="3" animated />
    </div>
    <div v-else class="h-[calc(100%-40px)] overflow-auto">
      <ElScrollbar>
        <div
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0"
          v-for="(item, index) in list"
          :key="index"
        >
          <div class="w-[calc(100%-40px)] pr-2">
            <p
              class="text-sm font-medium text-g-800 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{ item.title }}
            </p>
            <p
              class="text-g-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{ item.desc }}
            </p>
          </div>
          <span class="text-theme cursor-pointer font-medium whitespace-nowrap"
            >Xử lý</span
          >
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { fetchDashboardSummary } from "@/api/dashboard.api";

interface AlertItem {
  title: string;
  desc: string;
}

const list = reactive<AlertItem[]>([]);
const isLoading = ref(false);
const totalAlerts = ref(0);

function buildAlerts(data: any) {
  list.length = 0;
  if (data.alertsCount > 0) {
    list.push({
      title: "Có cảnh báo mới",
      desc: `Hệ thống phát hiện ${data.alertsCount} cảnh báo cần xem xét`,
    });
  }
  if (data.newComplaintsCount > 0) {
    list.push({
      title: "Khiếu nại mới",
      desc: `${data.newComplaintsCount} khiếu nại từ khách hàng cần phản hồi`,
    });
  }
  if (data.delayedLoansCount > 0) {
    list.push({
      title: "Trả góp trễ hạn",
      desc: `${data.delayedLoansCount} khách hàng trả góp trễ hạn`,
    });
  }
  if (data.lowStockVehiclesCount > 0) {
    list.push({
      title: "Tồn kho xe thấp",
      desc: `${data.lowStockVehiclesCount} mẫu xe tồn kho dưới mức an toàn`,
    });
  }
  if (data.missedAppointmentsCount > 0) {
    list.push({
      title: "Lịch hẹn bị bỏ lỡ",
      desc: `${data.missedAppointmentsCount} lịch hẹn đã bị bỏ lỡ`,
    });
  }
  if (data.isRevenueAlert) {
    list.push({
      title: "Cảnh báo doanh thu",
      desc: "Doanh thu hiện tại thấp hơn 50% mục tiêu tháng",
    });
  }
  if (data.isPendingAlert) {
    list.push({
      title: "Đơn hàng quá hạn",
      desc: "Có đơn hàng đang chờ quá thời gian cho phép",
    });
  }
  if (data.isStockAlert) {
    list.push({
      title: "Tồn kho phụ tùng thấp",
      desc: "Một số phụ tùng sắp hết, cần nhập thêm",
    });
  }
  // Add generic if empty
  if (list.length === 0) {
    list.push({
      title: "Không có cảnh báo",
      desc: "Mọi hoạt động đều bình thường",
    });
  }
}

async function fetchData() {
  isLoading.value = true;
  try {
    // Lấy dữ liệu 30 ngày gần đây
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const data = await fetchDashboardSummary(start, end);
    totalAlerts.value = data.alertsCount || 0;
    buildAlerts(data);
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>
