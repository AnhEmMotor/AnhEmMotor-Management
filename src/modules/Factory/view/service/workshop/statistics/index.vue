<template>
  <div class="p-4 statistics-container">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <ElIcon class="text-success"><DataAnalysis /></ElIcon>
          Báo Cáo & Thống Kê Xưởng Dịch Vụ
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Xem phân tích chuyên sâu về doanh số, cơ cấu nguồn thu và năng suất
          hoạt động của xưởng.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="Tới"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          @change="handleDateRangeChange"
          size="default"
          class="!w-72"
        />
        <ElButton
          :icon="Refresh"
          type="primary"
          :loading="loading"
          @click="loadData"
        >
          Làm mới
        </ElButton>
      </div>
    </div>

    <!-- Summary Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <ArtStatsCard
        icon="ri:money-dollar-circle-line"
        icon-style="bg-success"
        title="Tổng Doanh Thu Dịch Vụ"
        :count="formatVnd(kpiData.cumulativeRevenue)"
        description="Tổng doanh thu cộng dồn theo chu kỳ"
        :loading="loading"
      />
      <ArtStatsCard
        icon="ri:tools-line"
        icon-style="bg-primary"
        title="Số Xe Đang Sửa Chữa"
        :count="kpiData.inProgressCount"
        description="Số lượng xe hiện tại trên bàn nâng"
        :loading="loading"
      />
      <ArtStatsCard
        icon="ri:time-line"
        icon-style="bg-warning"
        title="Thời Gian Hoàn Thành TB"
        :count="formatHours(kpiData.avgCompletionHours)"
        description="Thời gian trung bình xử lý phiếu sửa chữa"
        :loading="loading"
      />
    </div>

    <!-- Charts Section -->
    <div class="mb-6">
      <!-- Monthly Sales Comparison Line Chart -->
      <ElCard class="hide-header-border" shadow="hover">
        <template #header>
          <div class="font-bold text-slate-800">
            Tình Hình Doanh Thu Theo Tuần
          </div>
        </template>
        <div class="h-80">
          <ArtLineChart
            :data="revenueTrendChartData.series"
            :x-axis-data="revenueTrendChartData.xAxis"
            :loading="loading"
            :colors="['#67c23a', '#409eff']"
            :show-legend="true"
          />
        </div>
      </ElCard>
    </div>

    <!-- Status Breakdown Bar Chart -->
    <ElCard class="hide-header-border" shadow="hover">
      <template #header>
        <div class="font-bold text-slate-800">
          Biểu Đồ Trạng Thái Phiếu Sửa Chữa
        </div>
      </template>
      <div class="h-72">
        <ArtBarChart
          :data="statusBarChartData.series"
          :x-axis-data="statusBarChartData.categories"
          :loading="loading"
          :show-legend="false"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { DataAnalysis, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { statisticsApi } from "@/api/operations";

import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ArtBarChart from "@/components/core/charts/art-bar-chart/index.vue";
import ArtLineChart from "@/components/core/charts/art-line-chart/index.vue";
import dayjs from "dayjs";

const loading = ref(false);
const dateRange = ref<[Date, Date]>([
  new Date(Date.now() - 30 * 24 * 3600 * 1000), // Last 30 days
  new Date(),
]);

const kpiData = ref({
  cumulativeRevenue: 0,
  inProgressCount: 0,
  avgCompletionHours: 0,
});

const statusCounts = ref({
  pending: 0,
  inProgress: 0,
  qcPending: 0,
  completed: 0,
  cancelled: 0,
});

const revenueTrend = ref<{ dates: string[]; amounts: number[] }>({
  dates: [],
  amounts: [],
});

// Format VND Helper
const formatVnd = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Format Hours Helper
const formatHours = (value: number): string => {
  if (!value) return "0h";
  return `${value.toFixed(1)}h`;
};

// Handle Date filter changes
const handleDateRangeChange = () => {
  loadData();
};

// Load Stats from API
const loadData = async () => {
  loading.value = true;
  try {
    const fromStr = dateRange.value?.[0]?.toISOString();
    const toStr = dateRange.value?.[1]?.toISOString();
    const res = await statisticsApi
      .getWorkshopDashboardOverview(fromStr, toStr)
      .catch(() => null);

    if (res && res.data) {
      const data = res.data;

      // Extract Status Breakdown
      const breakdowns = data.statusBreakdowns || [];
      const getStatusCount = (statusName: string) => {
        const item = breakdowns.find((b: any) => b.status === statusName);
        return item ? item.statusCount : 0;
      };

      const inProgressCount =
        getStatusCount("In-Progress") || getStatusCount("Đang sửa chữa");

      // Map KPI
      kpiData.value = {
        cumulativeRevenue: data.financialSummary?.totalRevenue || 0,
        inProgressCount: inProgressCount,
        avgCompletionHours: data.summaryCards?.avgCompletionHours || 0,
      };

      // Map Status Counts for Bar Chart
      statusCounts.value = {
        pending:
          getStatusCount("Pending") || getStatusCount("Chờ sửa chữa") || 0,
        inProgress: inProgressCount,
        qcPending:
          getStatusCount("QC-Pending") || getStatusCount("Chờ nghiệm thu") || 0,
        completed:
          getStatusCount("Completed") || getStatusCount("Đã hoàn thành") || 0,
        cancelled:
          getStatusCount("Cancelled") || getStatusCount("Đã hủy phiếu") || 0,
      };

      // Map Daily Revenues for Line Chart
      const dailyRevenues = data.dailyRevenues || [];
      revenueTrend.value = {
        dates: dailyRevenues.map((d: any) =>
          dayjs(d.revenueDate).format("DD/MM"),
        ),
        amounts: dailyRevenues.map((d: any) => d.dailyRevenue),
      };
    } else {
      // Fallback
      kpiData.value = {
        cumulativeRevenue: 0,
        inProgressCount: 0,
        avgCompletionHours: 0,
      };
      statusCounts.value = {
        pending: 0,
        inProgress: 0,
        qcPending: 0,
        completed: 0,
        cancelled: 0,
      };
      revenueTrend.value = { dates: [], amounts: [] };
    }
  } catch (err: any) {
    ElMessage.error(err?.message || "Không thể tải báo cáo thống kê");
  } finally {
    loading.value = false;
  }
};

const revenueTrendChartData = computed(() => {
  return {
    xAxis:
      revenueTrend.value.dates.length > 0
        ? revenueTrend.value.dates
        : ["Chưa có dữ liệu"],
    series: [
      {
        name: "Doanh thu dịch vụ (VNĐ)",
        data:
          revenueTrend.value.amounts.length > 0
            ? revenueTrend.value.amounts
            : [0],
      },
    ],
  };
});

const statusBarChartData = computed(() => {
  return {
    categories: [
      "Chờ sửa chữa",
      "Đang sửa chữa",
      "Chờ nghiệm thu",
      "Đã hoàn thành",
      "Đã hủy phiếu",
    ],
    series: [
      {
        name: "Số lượng phiếu",
        data: [
          {
            value: statusCounts.value.pending,
            itemStyle: { color: "var(--el-color-warning)" },
          },
          {
            value: statusCounts.value.inProgress,
            itemStyle: { color: "var(--el-color-primary)" },
          },
          {
            value: statusCounts.value.qcPending,
            itemStyle: { color: "var(--el-color-info)" },
          },
          {
            value: statusCounts.value.completed,
            itemStyle: { color: "var(--el-color-success)" },
          },
          {
            value: statusCounts.value.cancelled,
            itemStyle: { color: "var(--el-text-color-placeholder)" },
          },
        ],
      },
    ],
  };
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.statistics-container {
  min-height: 100%;
}
</style>
