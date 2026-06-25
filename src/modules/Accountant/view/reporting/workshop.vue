<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo xưởng dịch vụ"
      description="Theo dõi tiến độ sửa chữa, thời gian hoàn thành, doanh thu dịch vụ và phiếu quá hạn."
      icon="ri:tools-line"
    >
      <template #actions>
        <ReportPeriodSwitcher
          v-model="currentPeriod"
          v-model:start-date="periodStart"
          v-model:end-date="periodEnd"
          @update:modelValue="onPeriodChange"
        />
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Phiếu đang sửa chữa"
        :count="kpi.inProgressCount"
        description="Xe đang trong quy trình xử lý"
        icon="ri:tools-fill"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Thời gian hoàn thành TB"
        :count="`${kpi.avgCompletionHours}h`"
        description="Trung bình từ tiếp nhận đến hoàn tất"
        icon="ri:timer-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Doanh thu xưởng tháng này"
        :count="formatCurrency(kpi.monthlyRevenue)"
        description="Doanh thu dịch vụ trong tháng"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Phiếu quá hạn"
        :count="kpi.overdueCount"
        description="Cần ưu tiên kiểm tra"
        icon="ri:alarm-warning-line"
        :icon-style="
          kpi.overdueCount > 0 ? 'bg-report-red-dark' : 'bg-report-gray'
        "
      />
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>So sánh doanh thu: xưởng sửa chữa và bán xe</template>
      <ReportPlaceholder
        title="Chờ API thống kê xưởng dịch vụ"
        description="Biểu đồ sẽ so sánh doanh thu sửa chữa, phụ tùng và doanh thu bán xe theo kỳ."
        endpoint="GET /api/v1/Statistics/workshop-overview"
      />
    </ElCard>

    <ElCard class="reporting-card mt-4">
      <template #header>Phiếu sửa chữa đang thực hiện</template>
      <ElTable
        :data="repairOrders"
        class="reporting-table"
        v-loading="loading"
        empty-text="Không có phiếu sửa chữa đang thực hiện"
      >
        <ElTableColumn prop="orderCode" label="Mã phiếu" width="140" />
        <ElTableColumn prop="customerName" label="Khách hàng" />
        <ElTableColumn prop="vehicleInfo" label="Xe" />
        <ElTableColumn prop="technicianName" label="Thợ phụ trách" />
        <ElTableColumn prop="status" label="Trạng thái" width="140">
          <template #default="{ row }">
            <ElTag
              :type="statusType(row.status)"
              size="small"
              effect="light"
              round
              >{{ row.status }}</ElTag
            >
          </template>
        </ElTableColumn>
        <ElTableColumn prop="startedAt" label="Bắt đầu" width="120">
          <template #default="{ row }">{{
            formatDate(row.startedAt)
          }}</template>
        </ElTableColumn>
        <ElTableColumn prop="laborFee" label="Tiền công" width="120">
          <template #default="{ row }">{{
            formatCurrency(row.laborFee)
          }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { statisticsApi } from "@/api/operations";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import ReportPlaceholder from "./ReportPlaceholder.vue";

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref("");
const periodEnd = ref("");

const loading = ref(false);
const kpi = ref({
  inProgressCount: 0,
  avgCompletionHours: 0,
  monthlyRevenue: 0,
  overdueCount: 0,
});
const repairOrders = ref<
  Array<{
    id: number;
    orderCode: string;
    customerName: string;
    vehicleInfo: string;
    technicianName: string;
    status: string;
    startedAt: string;
    laborFee: number;
  }>
>([]);

function onPeriodChange() {
  // TODO: Pass period params to API when backend supports it
  // Expected: GET /api/v1/Statistics/workshop-overview?period=...&start=...&end=...
  loadData();
}

async function loadData() {
  loading.value = true;
  try {
    const data = await statisticsApi.getWorkshopOverview();
    kpi.value = data.kpi;
    repairOrders.value = data.repairOrders;
  } finally {
    loading.value = false;
  }
}

function statusType(
  status: string,
): "primary" | "success" | "info" | "danger" | "warning" {
  const map: Record<
    string,
    "primary" | "success" | "info" | "danger" | "warning"
  > = {
    "Đang sửa": "warning",
    "Chờ phụ tùng": "info",
    "Sẵn sàng bàn giao": "success",
    "Đã bàn giao": "success",
  };
  return map[status] || "info";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN");
}

onMounted(() => {
  loadData();
});
</script>
