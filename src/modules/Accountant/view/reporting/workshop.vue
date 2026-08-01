<template>
  <div class="resp-page reporting-page">
    <ReportPageHeader
      title="Báo cáo xưởng dịch vụ"
      description="Theo dõi tiến độ sửa chữa, thời gian hoàn thành, doanh thu dịch vụ và phiếu quá hạn."
      icon="ri:tools-line"
    >
      <template #actions>
        <div class="reporting-actions">
          <ReportPeriodSwitcher
            v-model="currentPeriod"
            v-model:start-date="periodStart"
            v-model:end-date="periodEnd"
            @update:modelValue="onPeriodChange"
          />
          <ElButton
            type="primary"
            :disabled="loading"
            @click="exportWorkshopExcel"
          >
            <ArtSvgIcon icon="ri:file-excel-2-line" />
            Xuất Excel
          </ElButton>
        </div>
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
      <ArtBarChart
        :data="chartData"
        :x-axis-data="chartXAxisData"
        :show-legend="true"
        height="350px"
        :loading="loading"
        :colors="['#409EFF', '#67C23A']"
      />
    </ElCard>

    <ElCard class="reporting-card mt-4">
      <template #header>Phiếu sửa chữa đang thực hiện</template>
      <ElTable
        :data="paginatedRepairOrders"
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

      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="repairOrders.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { statisticsApi } from "@/api/operations";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ArtBarChart from "@/components/core/charts/art-bar-chart/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import { exportReportWorkbook } from "@/utils/report-excel";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";

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
const chartData = ref([
  { name: "Doanh thu xưởng", data: [] as number[] },
  { name: "Doanh thu bán xe", data: [] as number[] },
]);
const chartXAxisData = ref<string[]>([]);
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

const currentPage = ref(1);
const pageSize = ref(10);

const paginatedRepairOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return repairOrders.value.slice(start, start + pageSize.value);
});

function onPeriodChange() {
  loadData();
}

function exportWorkshopExcel() {
  exportReportWorkbook({
    fileName: `Bao_cao_xuong_${new Date().toISOString().slice(0, 10)}`,
    sheets: [
      {
        name: "Tổng quan",
        rows: [
          {
            "Phiếu đang sửa": kpi.value.inProgressCount,
            "Thời gian hoàn thành TB (giờ)": kpi.value.avgCompletionHours,
            "Doanh thu xưởng": kpi.value.monthlyRevenue,
            "Phiếu quá hạn": kpi.value.overdueCount,
          },
        ],
      },
      {
        name: "Phiếu sửa chữa",
        rows: repairOrders.value.map((item) => ({
          "Mã phiếu": item.orderCode,
          "Khách hàng": item.customerName,
          "Thông tin xe": item.vehicleInfo,
          "Kỹ thuật viên": item.technicianName,
          "Trạng thái": item.status,
          "Ngày bắt đầu": item.startedAt,
          "Tiền công": item.laborFee,
        })),
      },
      {
        name: "So sánh doanh thu",
        rows: chartXAxisData.value.map((month, index) => ({
          Tháng: month,
          "Doanh thu xưởng": chartData.value[0]?.data[index] ?? 0,
          "Doanh thu bán xe": chartData.value[1]?.data[index] ?? 0,
        })),
      },
    ],
  });
}

async function loadData() {
  loading.value = true;
  try {
    const data = await statisticsApi.getWorkshopOverview(
      currentPeriod.value === "custom" ? undefined : currentPeriod.value,
      periodStart.value,
      periodEnd.value,
    );
    kpi.value = data.kpi;
    repairOrders.value = data.repairOrders;

    if (data.revenueComparisonChart) {
      chartXAxisData.value = data.revenueComparisonChart.map((x) => x.month);
      chartData.value = [
        {
          name: "Doanh thu xưởng",
          data: data.revenueComparisonChart.map((x) => x.workshopRevenue),
        },
        {
          name: "Doanh thu bán xe",
          data: data.revenueComparisonChart.map((x) => x.retailRevenue),
        },
      ];
    }
  } catch (error) {
    // Fallback error handling
    kpi.value = {
      inProgressCount: 0,
      avgCompletionHours: 0,
      monthlyRevenue: 0,
      overdueCount: 0,
    };
    repairOrders.value = [];
    chartXAxisData.value = [];
    chartData.value = [
      { name: "Doanh thu xưởng", data: [] },
      { name: "Doanh thu bán xe", data: [] },
    ];
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
