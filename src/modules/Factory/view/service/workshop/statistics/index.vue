<template>
  <div class="resp-page p-4 statistics-container">
    <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <ElIcon class="text-success"><DataAnalysis /></ElIcon>
          Báo Cáo & Thống Kê Xưởng Dịch Vụ
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Xem phân tích chuyên sâu về doanh số, cơ cấu nguồn thu và năng suất hoạt động của xưởng.
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
        <ElButton :icon="Refresh" type="primary" :loading="loading" @click="loadData">
          Làm mới
        </ElButton>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
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
      <ArtStatsCard
        icon="ri:shield-star-line"
        icon-style="bg-info"
        title="Yêu Cầu Bảo Hành"
        :count="kpiData.warrantyCount"
        description="Số lượng yêu cầu bảo hành trong kỳ"
        :loading="loading"
      />
    </div>

    <div v-if="overdueTicketsData.length > 0 || partShortagesData.length > 0" class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <ElAlert
        v-if="overdueTicketsData.length > 0"
        title="Cảnh báo: Có phiếu quá hạn!"
        type="error"
        show-icon
        :closable="false"
      >
        <div class="mt-2 text-sm">
          Phát hiện {{ overdueTicketsData.length }} phiếu đã trễ hạn hoặc vượt quá thời gian dự kiến.
        </div>
      </ElAlert>
      <ElAlert
        v-if="partShortagesData.length > 0"
        title="Cảnh báo: Thiếu hụt phụ tùng!"
        type="warning"
        show-icon
        :closable="false"
      >
        <div class="mt-2 text-sm">
          Phát hiện {{ partShortagesData.length }} phụ tùng không đủ tồn kho để đáp ứng các phiếu sửa chữa hiện tại.
        </div>
      </ElAlert>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <ElCard class="lg:col-span-2 hide-header-border" shadow="hover">
        <template #header>
          <div class="font-bold text-slate-800">Doanh Thu 6 Tháng Gần Nhất</div>
        </template>
        <div class="h-80">
          <ArtLineChart
            :data="revenueTrendChartData.series"
            :x-axis-data="revenueTrendChartData.xAxis"
            :loading="loading"
            :colors="['#409eff', '#67c23a']"
            :show-legend="true"
          />
        </div>
      </ElCard>

      <ElCard class="hide-header-border" shadow="hover">
        <template #header>
          <div class="font-bold text-slate-800">Cơ Cấu Nguồn Thu</div>
        </template>
        <div class="h-80">
          <ArtRingChart
            :data="revenueSourceChartData"
            :loading="loading"
            :show-legend="true"
            legend-position="bottom"
            center-text="Tỷ lệ"
          />
        </div>
      </ElCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <ElCard class="hide-header-border" shadow="hover">
        <template #header>
          <div class="font-bold text-slate-800">Biểu Đồ Trạng Thái Phiếu Sửa Chữa</div>
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

      <ElCard class="hide-header-border" shadow="hover">
        <template #header>
          <div class="font-bold text-slate-800">Bảng Xếp Hạng Kỹ Thuật Viên</div>
        </template>
        <div class="h-72">
          <ElTable :data="technicianRankingsData" v-loading="loading" height="100%" size="small" stripe>
            <ElTableColumn type="index" label="Hạng" width="60" align="center" />
            <ElTableColumn prop="technicianName" label="Họ tên">
              <template #default="{ row }">
                <span class="font-semibold">{{ row.TechnicianName || row.technicianName }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="completedTickets" label="Phiếu HT" width="100" align="center">
              <template #default="{ row }">
                <ElTag type="success" size="small">{{ row.CompletedTickets ?? row.completedTickets }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="totalRevenue" label="Doanh thu" width="120" align="right">
              <template #default="{ row }">
                <span class="text-primary font-medium">{{ formatVnd(row.TotalRevenue ?? row.totalRevenue) }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { DataAnalysis, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { statisticsApi } from '@/api/operations';

import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue';
import ArtBarChart from '@/components/core/charts/art-bar-chart/index.vue';
import ArtLineChart from '@/components/core/charts/art-line-chart/index.vue';
import ArtRingChart from '@/components/core/charts/art-ring-chart/index.vue';

const loading = ref(false);
const dateRange = ref<[Date, Date]>([new Date(Date.now() - 30 * 24 * 3600 * 1000), new Date()]);

const kpiData = ref({
  cumulativeRevenue: 0,
  inProgressCount: 0,
  avgCompletionHours: 0,
  warrantyCount: 0,
  complaintsCount: 0,
});

const statusCounts = ref({
  pending: 0,
  inProgress: 0,
  qcPending: 0,
  completed: 0,
  cancelled: 0,
});

const revenueTrend = ref<{ dates: string[]; serviceRevenue: number[]; retailRevenue: number[] }>({
  dates: [],
  serviceRevenue: [],
  retailRevenue: [],
});

const revenueSourceChartData = ref<{ name: string; value: number }[]>([]);
const technicianRankingsData = ref<any[]>([]);
const overdueTicketsData = ref<any[]>([]);
const partShortagesData = ref<any[]>([]);

const formatVnd = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);
};

const formatHours = (value: number): string => {
  if (!value) return '0h';
  return `${value.toFixed(1)}h`;
};

const handleDateRangeChange = () => {
  loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    const fromStr = dateRange.value?.[0]?.toISOString();
    const toStr = dateRange.value?.[1]?.toISOString();
    const res = await statisticsApi.getWorkshopDashboardOverview(fromStr, toStr).catch(() => null);

    const data = res ? (res as any).data || res : null;
    if (!data) {
      resetData();
      return;
    }

    const kpiCards = data.KpiCards || data.kpiCards || {};
    kpiData.value = {
      cumulativeRevenue: kpiCards.CumulativeRevenue ?? kpiCards.cumulativeRevenue ?? 0,
      inProgressCount: kpiCards.InProgressCount ?? kpiCards.inProgressCount ?? 0,
      avgCompletionHours: kpiCards.AvgCompletionHours ?? kpiCards.avgCompletionHours ?? 0,
      warrantyCount: data.WarrantyRequestsCount ?? data.warrantyRequestsCount ?? 0,
      complaintsCount: data.ComplaintsCount ?? data.complaintsCount ?? 0,
    };

    const analytics = data.Analytics || data.analytics || {};

    const getPaymentMethodLabel = (val: string) => {
      if (!val) return 'Khác';
      const lowerVal = val.toLowerCase();
      if (lowerVal === 'cash') return 'Tiền mặt';
      if (lowerVal === 'banktransfer' || lowerVal === 'banktran') return 'Chuyển khoản';
      return val;
    };

        const revenueSources = analytics.RevenueSources || analytics.revenueSources || [];
    revenueSourceChartData.value = revenueSources.map((r: any) => ({
      name: getPaymentMethodLabel(r.Source || r.source || 'Khác'),
      value: r.Amount || r.amount || 0
    }));

    const trendData = analytics.RevenueTrend || analytics.revenueTrend;
    if (trendData && (trendData.Labels || trendData.labels)) {
      revenueTrend.value = {
        dates: trendData.Labels || trendData.labels || [],
        serviceRevenue: trendData.ServiceRevenue || trendData.serviceRevenue || [],
        retailRevenue: trendData.RetailRevenue || trendData.retailRevenue || [],
      };
    } else {
      revenueTrend.value = { dates: [], serviceRevenue: [], retailRevenue: [] };
    }

    const statusCountsData = analytics.RepairOrderStatusCounts || analytics.repairOrderStatusCounts || [];
    statusCounts.value = {
      pending: getStatusCount(statusCountsData, 'Cho sua chua'),
      inProgress: getStatusCount(statusCountsData, 'Dang sua chua'),
      qcPending: getStatusCount(statusCountsData, 'Cho nghiem thu'),
      completed: getStatusCount(statusCountsData, 'Da hoan thanh'),
      cancelled: getStatusCount(statusCountsData, 'Da huy phieu'),
    };

    const techRankings = data.Productivity?.TechnicianRankings || data.productivity?.technicianRankings || [];
    technicianRankingsData.value = techRankings;

    const alerts = data.Alerts || data.alerts || {};
    overdueTicketsData.value = alerts.OverdueTickets || alerts.overdueTickets || [];
    partShortagesData.value = alerts.PartShortages || alerts.partShortages || [];

  } catch (err: any) {
    ElMessage.error(err?.message || 'Không thể tải báo cáo thống kê');
    resetData();
  } finally {
    loading.value = false;
  }
};

const getStatusCount = (dataList: any[], targetStatus: string): number => {
  const item = dataList.find((x: any) => (x.Status || x.status) === targetStatus);
  return item ? (item.Count ?? item.count ?? 0) : 0;
};

const resetData = () => {
  kpiData.value = { cumulativeRevenue: 0, inProgressCount: 0, avgCompletionHours: 0, warrantyCount: 0, complaintsCount: 0 };
  statusCounts.value = { pending: 0, inProgress: 0, qcPending: 0, completed: 0, cancelled: 0 };
  revenueTrend.value = { dates: [], serviceRevenue: [], retailRevenue: [] };
  revenueSourceChartData.value = [];
  technicianRankingsData.value = [];
  overdueTicketsData.value = [];
  partShortagesData.value = [];
};

const revenueTrendChartData = computed(() => {
  return {
    xAxis: revenueTrend.value.dates.length > 0 ? revenueTrend.value.dates : ['Chưa có dữ liệu'],
    series: [
      {
        name: 'Doanh thu Xưởng Dịch Vụ',
        data: revenueTrend.value.serviceRevenue.length > 0 ? revenueTrend.value.serviceRevenue : [0],
      },
      {
        name: 'Doanh thu Bán Lẻ Phụ Tùng',
        data: revenueTrend.value.retailRevenue.length > 0 ? revenueTrend.value.retailRevenue : [0],
      },
    ],
  };
});

const statusBarChartData = computed(() => {
  return {
    categories: [
      'Chờ sửa chữa',
      'Đang sửa chữa',
      'Chờ nghiệm thu',
      'Đã hoàn thành',
      'Đã hủy phiếu',
    ],
    series: [
      {
        name: 'Số lượng phiếu',
        data: [
          {
            value: statusCounts.value.pending,
            itemStyle: { color: 'var(--el-color-warning)' },
          },
          {
            value: statusCounts.value.inProgress,
            itemStyle: { color: 'var(--el-color-primary)' },
          },
          {
            value: statusCounts.value.qcPending,
            itemStyle: { color: 'var(--el-color-info)' },
          },
          {
            value: statusCounts.value.completed,
            itemStyle: { color: 'var(--el-color-success)' },
          },
          {
            value: statusCounts.value.cancelled,
            itemStyle: { color: 'var(--el-text-color-placeholder)' },
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
