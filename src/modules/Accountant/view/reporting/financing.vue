<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo trả góp"
      description="Theo dõi hồ sơ tài chính, trạng thái giải ngân, tỷ lệ duyệt và tình trạng cavet."
      icon="ri:bank-line"
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
        title="Tổng hồ sơ trả góp"
        :count="kpi.totalApplications"
        description="Toàn bộ hồ sơ trong kỳ"
        icon="ri:file-list-3-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Đã giải ngân"
        :count="kpi.disbursedCount"
        description="Hồ sơ đã nhận tiền từ đối tác"
        icon="ri:bank-card-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Đang chờ giải ngân"
        :count="kpi.pendingCount"
        description="Cần theo dõi tiến độ ngân hàng"
        icon="ri:time-line"
        :icon-style="
          kpi.pendingCount > 0 ? 'bg-report-red-dark' : 'bg-report-gray'
        "
      />
      <ArtStatsCard
        title="Tỷ lệ duyệt thành công"
        :count="`${approvalRate}%`"
        description="Tính theo hồ sơ đã giải ngân"
        icon="ri:percent-line"
        icon-style="bg-report-red-dark"
      />
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Thị phần hồ sơ theo đối tác tài chính</template>
      <ReportPlaceholder
        title="Chờ API thống kê trả góp"
        description="Khi backend sẵn sàng, biểu đồ sẽ hiển thị tỷ trọng hồ sơ theo từng đối tác tài chính."
        endpoint="GET /api/v1/Statistics/financing-overview"
      />
    </ElCard>

    <ElCard class="reporting-card mt-4">
      <template #header>Danh sách hồ sơ trả góp</template>
      <ElTable
        :data="installments"
        class="reporting-table"
        v-loading="loading"
        empty-text="Chưa có dữ liệu hồ sơ trả góp"
      >
        <ElTableColumn prop="applicationCode" label="Mã hồ sơ" width="140" />
        <ElTableColumn prop="customerName" label="Khách hàng" />
        <ElTableColumn prop="partnerName" label="Đối tác tài chính" />
        <ElTableColumn prop="vehicleName" label="Xe" />
        <ElTableColumn prop="amount" label="Số tiền" width="140">
          <template #default="{ row }">{{
            formatCurrency(row.amount)
          }}</template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Trạng thái" width="160">
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
        <ElTableColumn prop="cavetStatus" label="Cavet" width="140">
          <template #default="{ row }">
            <ElTag
              v-if="row.cavetStatus"
              :type="cavetType(row.cavetStatus)"
              size="small"
              effect="light"
              round
            >
              {{ row.cavetStatus }}
            </ElTag>
            <span v-else>-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="Ngày tạo" width="120">
          <template #default="{ row }">{{
            formatDate(row.createdAt)
          }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { statisticsApi } from "@/api/operations";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import ReportPlaceholder from "./ReportPlaceholder.vue";

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref("");
const periodEnd = ref("");

const kpi = ref({
  totalApplications: 0,
  disbursedCount: 0,
  pendingCount: 0,
  overdueCount: 0,
});
const installments = ref<
  Array<{
    id: number;
    applicationCode: string;
    customerName: string;
    partnerName: string;
    vehicleName: string;
    amount: number;
    status: string;
    cavetStatus?: string;
    createdAt: string;
  }>
>([]);
const loading = ref(false);

const approvalRate = computed(() => {
  if (!kpi.value.totalApplications) return "0";
  return (
    (kpi.value.disbursedCount / kpi.value.totalApplications) *
    100
  ).toFixed(1);
});

function onPeriodChange() {
  // TODO: Pass period params to API when backend supports it
  // Expected: GET /api/v1/Statistics/financing-overview?period=...&start=...&end=...
  loadData();
}

async function loadData() {
  loading.value = true;
  try {
    const data = await statisticsApi.getFinancingOverview();
    kpi.value = data.kpi;
    installments.value = data.installments;
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
    "Chờ duyệt": "info",
    "Đã duyệt": "primary",
    "Chờ giải ngân": "warning",
    "Đã giải ngân": "success",
    "Từ chối": "danger",
  };
  return map[status] || "info";
}

function cavetType(
  status: string,
): "primary" | "success" | "info" | "danger" | "warning" {
  const map: Record<
    string,
    "primary" | "success" | "info" | "danger" | "warning"
  > = {
    "Công ty tài chính giữ": "warning",
    "Cửa hàng giữ hộ": "info",
    "Đã giao khách": "success",
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
