<template>
  <div class="resp-page reporting-page">
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
        <ElButton
          type="success"
          :disabled="!installments.length"
          @click="exportFinancingExcel"
        >
          <ArtSvgIcon icon="ri:file-excel-2-line" />
          Xuất Excel
        </ElButton>
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
import { AnalyticsService } from "@/services/analytics.service";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import ReportPlaceholder from "./ReportPlaceholder.vue";
import { exportReportWorkbook } from "@/utils/report-excel";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";

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
const approvalRate = ref(0);

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

function statusType(status: string) {
  const map: Record<string, "success" | "warning" | "danger" | "info"> = {
    "Đã giải ngân": "success",
    "Đang chờ": "warning",
    Từ_chối: "danger",
  };
  return map[status] || "info";
}

function cavetType(status: string) {
  const map: Record<string, "success" | "warning" | "danger" | "info"> = {
    "Đã cấp": "success",
    "Đang xử lý": "warning",
    Từ_chối: "danger",
  };
  return map[status] || "info";
}

async function loadData() {
  loading.value = true;
  try {
    const res = await AnalyticsService.getDashboardSummary();
    kpi.value = {
      totalApplications: res.activeInstallmentCount + res.lateInstallmentCount,
      disbursedCount: 0,
      pendingCount: res.activeInstallmentCount,
      overdueCount: res.lateInstallmentCount,
    };
    approvalRate.value = 0;
    installments.value = [];
  } catch {
    kpi.value = {
      totalApplications: 0,
      disbursedCount: 0,
      pendingCount: 0,
      overdueCount: 0,
    };
    installments.value = [];
  } finally {
    loading.value = false;
  }
}

function onPeriodChange() {
  loadData();
}

function exportFinancingExcel() {
  exportReportWorkbook({
    fileName: "Bao_cao_tra_gop",
    sheets: [
      {
        name: "Ho so tra gop",
        rows: installments.value.map((row) => ({
          Ma_ho_so: row.applicationCode,
          Khach_hang: row.customerName,
          Doi_tac: row.partnerName,
          Xe: row.vehicleName,
          So_tien: row.amount,
          Trang_thai: row.status,
          Cavet: row.cavetStatus ?? "",
          Ngay_tao: row.createdAt,
        })),
      },
    ],
  });
}

onMounted(() => {
  loadData();
});
</script>
