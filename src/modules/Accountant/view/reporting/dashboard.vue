<template>
  <div class="resp-page reporting-page">
    <ReportPageHeader
      title="Tổng quan điều hành"
      description="Theo dõi doanh thu, lợi nhuận, đơn hàng và cảnh báo tồn kho trong cùng một màn hình."
      icon="ri:dashboard-3-line"
    >
      <template #actions>
        <div class="reporting-actions">
          <ReportPeriodSwitcher
            v-model="currentPeriod"
            v-model:start-date="periodStart"
            v-model:end-date="periodEnd"
            @update:modelValue="onPeriodChange"
          />
          <ElButton type="primary" :disabled="loading" @click="exportDashboardExcel">
            <ArtSvgIcon icon="ri:file-excel-2-line" />
            Xuất Excel
          </ElButton>
        </div>
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid dashboard-report__kpis">
      <ArtStatsCard
        :title="kpiRevenue.title"
        :count="kpiRevenue.count"
        :description="kpiRevenue.description"
        icon="ri:money-dollar-circle-line"
        :icon-style="kpiRevenue.style"
        :loading="loading"
      />
      <ArtStatsCard
        :title="kpiProfit.title"
        :count="kpiProfit.count"
        :description="kpiProfit.description"
        icon="ri:line-chart-line"
        :icon-style="kpiProfit.style"
        :loading="loading"
      />
      <ArtStatsCard
        title="Đơn hàng chờ xử lý"
        :count="String(summary.pendingOrdersCount)"
        :description="`Quá hạn: ${summary.overdueOrdersCount} đơn`"
        icon="ri:timer-line"
        :icon-style="summary.overdueOrdersCount > 0 ? 'bg-report-red-dark' : 'bg-report-red-light'"
        :loading="loading"
      />
      <ArtStatsCard
        title="Cảnh báo tồn kho"
        :count="`Hết hàng: ${summary.outOfStockCount ?? 0}`"
        :description="`Sắp hết: ${summary.lowStockCount ?? 0} sản phẩm`"
        icon="ri:alarm-warning-line"
        :icon-style="
          (summary.outOfStockCount ?? 0) > 0
            ? 'bg-report-red-dark'
            : (summary.lowStockCount ?? 0) > 0
              ? 'bg-report-red-light'
              : 'bg-report-gray'
        "
        :loading="loading"
      />
    </div>

    <div class="reporting-section-grid three-columns dashboard-report__overview">
      <ElCard class="reporting-card dashboard-report__chart-card lg:col-span-2">
        <template #header>
          <div class="dashboard-report__card-header">
            <span>Biểu đồ doanh thu theo chu kỳ</span>
            <span>{{ selectedRangeLabel }}</span>
          </div>
        </template>
        <div
          v-show="dailyRevenue.length > 0"
          ref="revenueChartRef"
          class="reporting-chart dashboard-report__chart"
        ></div>
        <ElEmpty
          v-if="dailyRevenue.length === 0"
          description="Chưa có dữ liệu doanh thu trong kỳ này"
          :image-size="72"
        />
      </ElCard>
      <ElCard class="reporting-card dashboard-report__summary-card">
        <template #header>
          <div class="dashboard-report__card-header">
            <span>Tóm tắt vận hành</span>
            <span>{{ selectedRangeLabel }}</span>
          </div>
        </template>
        <div class="dashboard-report__summary-grid">
          <div class="dashboard-report__summary-item dashboard-report__summary-item--revenue">
            <div class="dashboard-report__summary-icon">
              <ArtSvgIcon icon="ri:money-dollar-circle-line" />
            </div>
            <div>
              <span>Doanh thu kỳ này</span>
              <strong>{{ formatCurrency(operationalSummary.revenue) }}</strong>
            </div>
          </div>
          <div class="dashboard-report__summary-item">
            <div>
              <span>{{ operationalSummary.comparisonLabel }}</span>
              <strong>{{ formatCurrency(operationalSummary.comparisonRevenue) }}</strong>
            </div>
          </div>
          <div class="dashboard-report__summary-item">
            <div>
              <span>Xe bán trong kỳ</span>
              <strong>{{ operationalSummary.vehiclesSold }}</strong>
            </div>
          </div>
          <div class="dashboard-report__summary-item">
            <div>
              <span>Tồn kho khả dụng</span>
              <strong>{{ summary.currentInventoryCount }}</strong>
            </div>
          </div>
          <div class="dashboard-report__summary-item">
            <div>
              <span>Tổng sản phẩm đang bán</span>
              <strong>{{ summary.totalSKUCount }}</strong>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <div class="reporting-section-grid two-columns dashboard-report__analysis">
      <ElCard class="reporting-card dashboard-report__chart-card">
        <template #header>
          <div class="dashboard-report__card-header">
            <span>Doanh thu theo thương hiệu</span>
            <span>{{ selectedRangeLabel }}</span>
          </div>
        </template>
        <div
          v-show="brandDistributionData.length > 0"
          ref="brandChartRef"
          class="reporting-chart dashboard-report__chart"
        ></div>
        <ElEmpty
          v-if="brandDistributionData.length === 0"
          description="Chưa có dữ liệu theo thương hiệu trong kỳ này"
          :image-size="72"
        />
      </ElCard>
      <ElCard class="reporting-card dashboard-report__table-card">
        <template #header>
          <div class="dashboard-report__card-header">
            <span>Hiệu suất Sale (Top Ranking)</span>
            <span>{{ selectedRangeLabel }}</span>
          </div>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full min-w-130 text-left text-sm">
            <thead>
              <tr
                class="border-b border-(--el-border-color-light) text-(--el-text-color-secondary)"
              >
                <th class="pb-2">Nhân viên</th>
                <th class="pb-2">Doanh số</th>
                <th class="pb-2">KPI</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="staff in topStaff"
                :key="staff.employeeName"
                class="border-b border-(--art-card-border) last:border-0"
              >
                <td class="py-2 font-medium">{{ staff.employeeName }}</td>
                <td class="py-2">{{ formatCurrency(staff.totalSales) }}</td>
                <td class="py-2">
                  <span :class="['px-2 py-1 rounded-full text-xs', getKpiClass(staff.kpiStatus)]">
                    {{ staff.kpiStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <ElEmpty v-if="topStaff.length === 0" description="Chưa có dữ liệu" :image-size="72" />
        </div>
      </ElCard>
    </div>

    <ElCard class="reporting-card dashboard-report__transactions">
      <template #header>Luồng nhật ký giao dịch gần nhất</template>
      <div class="overflow-x-auto">
        <table class="w-full min-w-170 text-left text-sm">
          <thead>
            <tr class="border-b border-(--el-border-color-light) text-(--el-text-color-secondary)">
              <th class="pb-2">Mốc giờ</th>
              <th class="pb-2">Khách hàng</th>
              <th class="pb-2">Sản phẩm</th>
              <th class="pb-2">Số tiền</th>
              <th class="pb-2">Sale phụ trách</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx.timestamp"
              class="border-b border-(--art-card-border) last:border-0 hover:bg-(--el-fill-color-light) transition-colors"
            >
              <td class="py-2 text-(--el-text-color-secondary)">
                {{ formatTime(tx.timestamp) }}
              </td>
              <td class="py-2 font-medium">{{ tx.customerName }}</td>
              <td class="py-2">{{ tx.productName }}</td>
              <td class="py-2 font-bold" :class="tx.isRevenue ? 'text-green-600' : 'text-red-600'">
                {{ tx.isRevenue ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
              </td>
              <td class="py-2">{{ tx.staffName }}</td>
            </tr>
          </tbody>
        </table>
        <ElEmpty v-if="transactions.length === 0" description="Chưa có dữ liệu" :image-size="72" />
      </div>
    </ElCard>

    <ElCard class="reporting-card mt-4">
      <template #header>Đơn hàng gần đây</template>
      <ElTable :data="recentOrders" class="reporting-table" empty-text="Chưa có dữ liệu">
        <ElTableColumn label="Mã đơn" min-width="120">
          <template #default="{ row }">{{ row.orderCode || `#${row.id}` }}</template>
        </ElTableColumn>
        <ElTableColumn prop="buyerName" label="Khách hàng" min-width="180" />
        <ElTableColumn prop="totalAmount" label="Số tiền" min-width="150" align="right">
          <template #default="{ row }">{{ formatCurrency(row.totalAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="statusId" label="Trạng thái" min-width="130">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ getOrderStatusLabel(row.statusId) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="Thời gian" min-width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue';
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue';
import { statisticsApi } from '@/api/operations';
import { useSettingStore } from '@/application/store/setting';
import { exportReportWorkbook } from '@/utils/report-excel';
import ReportPageHeader from './ReportPageHeader.vue';
import ReportPeriodSwitcher from './ReportPeriodSwitcher.vue';
import type { StaffPerformance, TransactionLog } from '@/services/analytics.types';
import type * as Statistical from '@/types/api/statistical';

type Period = 'today' | 'month' | 'year' | 'custom';

interface KpiCardData {
  title: string;
  count: string;
  description: string;
  style: string;
}

const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);

const revenueChartRef = ref<HTMLElement | null>(null);
const brandChartRef = ref<HTMLElement | null>(null);
let revenueChart: echarts.ECharts | null = null;
let brandChart: echarts.ECharts | null = null;
const recentOrders = ref<Statistical.RecentOrderResponse[]>([]);
const dailyRevenue = ref<Statistical.DailyRevenueResponse[]>([]);
const loading = ref(false);

const currentPeriod = ref<Period>('month');
const periodStart = ref(toDateInput(startOfMonth(new Date())));
const periodEnd = ref(toDateInput(new Date()));

const summary = ref<Statistical.DashboardStatsResponse>({
  todayRevenue: 0,
  revenueChangePercentage: 0,
  periodRevenue: 0,
  periodProfit: 0,
  monthlyRevenue: 0,
  todayProfit: 0,
  monthlyProfit: 0,
  lastMonthRevenue: 0,
  lastMonthProfit: 0,
  yearlyRevenue: 0,
  yearlyProfit: 0,
  lastYearRevenue: 0,
  lastYearProfit: 0,
  total7dRevenue: 0,
  total7dProfit: 0,
  bestDayRevenue: 0,
  overdueOrdersCount: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  overstockCount: 0,
  overdueDebtAmount: 0,
  todayVehiclesSold: 0,
  monthlyVehiclesSold: 0,
  currentInventoryCount: 0,
  totalSKUCount: 0,
  brandDistribution: [],
  activeInstallmentCount: 0,
  lateInstallmentCount: 0,
  totalCustomerDebt: 0,
  topSellingProducts: [],
  brandRevenueDistribution: [],
  todayActivities: [],
  pendingOrdersCount: 0,
  newCustomersCount: 0,
});
const topStaff = ref<StaffPerformance[]>([]);
const transactions = ref<TransactionLog[]>([]);

const selectedRangeLabel = computed(
  () => `${formatDate(periodStart.value)} - ${formatDate(periodEnd.value)}`
);

const brandDistributionData = computed(() => summary.value.brandRevenueDistribution || []);

const kpiRevenue = computed<KpiCardData>(() => {
  const p = currentPeriod.value;
  if (p === 'today') {
    const change = summary.value.revenueChangePercentage;
    const desc =
      change === 0
        ? 'Tương đương hôm qua'
        : `${change > 0 ? 'Tăng' : 'Giảm'} ${Math.abs(change).toFixed(1)}% so với hôm qua`;
    return {
      title: 'Doanh thu hôm nay',
      count: formatCurrency(summary.value.todayRevenue),
      description: desc,
      style: change < 0 ? 'bg-report-red-dark' : 'bg-report-red',
    };
  }
  if (p === 'month') {
    const cur = summary.value.monthlyRevenue;
    const prev = summary.value.lastMonthRevenue;
    let desc = `Tháng trước: ${formatCurrency(prev)}`;
    if (prev > 0) {
      const pct = ((cur - prev) / prev) * 100;
      desc = `Tháng trước: ${formatCurrency(prev)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
    }
    return {
      title: 'Doanh thu tháng này',
      count: formatCurrency(cur),
      description: desc,
      style: cur >= prev ? 'bg-report-red' : 'bg-report-red-dark',
    };
  }
  if (p === 'year') {
    const cur = summary.value.yearlyRevenue ?? 0;
    const prev = summary.value.lastYearRevenue ?? 0;
    let desc = `Năm trước: ${formatCurrency(prev)}`;
    if (prev > 0) {
      const pct = ((cur - prev) / prev) * 100;
      desc = `Năm trước: ${formatCurrency(prev)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
    }
    return {
      title: 'Doanh thu năm nay',
      count: formatCurrency(cur),
      description: desc,
      style: cur >= prev ? 'bg-report-red' : 'bg-report-red-dark',
    };
  }
  const cur = summary.value.periodRevenue ?? 0;
  return {
    title: 'Doanh thu kỳ chọn',
    count: formatCurrency(cur),
    description: `Kỳ: ${selectedRangeLabel.value}`,
    style: 'bg-report-red',
  };
});

const kpiProfit = computed<KpiCardData>(() => {
  const p = currentPeriod.value;
  if (p === 'today') {
    const prof = summary.value.todayProfit;
    const rev = summary.value.todayRevenue;
    const margin = rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0.0';
    return {
      title: 'Lợi nhuận hôm nay',
      count: formatCurrency(prof),
      description: `Biên lợi nhuận: ${margin}%`,
      style: prof >= 0 ? 'bg-report-red' : 'bg-report-red-dark',
    };
  }
  if (p === 'month') {
    const prof = summary.value.monthlyProfit;
    const prevProf = summary.value.lastMonthProfit;
    let desc = `Tháng trước: ${formatCurrency(prevProf)}`;
    if (prevProf > 0) {
      const pct = ((prof - prevProf) / prevProf) * 100;
      desc = `Tháng trước: ${formatCurrency(prevProf)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
    }
    return {
      title: 'Lợi nhuận tháng này',
      count: formatCurrency(prof),
      description: desc,
      style: prof >= 0 ? 'bg-report-red' : 'bg-report-red-dark',
    };
  }
  if (p === 'year') {
    const prof = summary.value.yearlyProfit ?? 0;
    const prevProf = summary.value.lastYearProfit ?? 0;
    let desc = `Năm trước: ${formatCurrency(prevProf)}`;
    if (prevProf > 0) {
      const pct = ((prof - prevProf) / prevProf) * 100;
      desc = `Năm trước: ${formatCurrency(prevProf)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
    }
    return {
      title: 'Lợi nhuận năm nay',
      count: formatCurrency(prof),
      description: desc,
      style: prof >= 0 ? 'bg-report-red' : 'bg-report-red-dark',
    };
  }
  const prof = summary.value.periodProfit ?? 0;
  const rev = summary.value.periodRevenue ?? 0;
  const margin = rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0.0';
  return {
    title: 'Lợi nhuận kỳ chọn',
    count: formatCurrency(prof),
    description: `Biên lợi nhuận: ${margin}%`,
    style: prof >= 0 ? 'bg-report-red' : 'bg-report-red-dark',
  };
});

const operationalSummary = computed(() => {
  const p = currentPeriod.value;
  if (p === 'today') {
    return {
      revenue: summary.value.todayRevenue,
      comparisonLabel: 'Lợi nhuận hôm nay',
      comparisonRevenue: summary.value.todayProfit,
      vehiclesSold: summary.value.todayVehiclesSold,
    };
  }
  if (p === 'year') {
    return {
      revenue: summary.value.yearlyRevenue ?? 0,
      comparisonLabel: 'Doanh thu năm trước',
      comparisonRevenue: summary.value.lastYearRevenue ?? 0,
      vehiclesSold: summary.value.monthlyVehiclesSold,
    };
  }
  if (p === 'custom') {
    return {
      revenue: summary.value.periodRevenue ?? 0,
      comparisonLabel: 'Lợi nhuận kỳ chọn',
      comparisonRevenue: summary.value.periodProfit ?? 0,
      vehiclesSold: summary.value.monthlyVehiclesSold,
    };
  }
  return {
    revenue: summary.value.monthlyRevenue,
    comparisonLabel: 'Doanh thu tháng trước',
    comparisonRevenue: summary.value.lastMonthRevenue,
    vehiclesSold: summary.value.monthlyVehiclesSold,
  };
});

function onPeriodChange(period?: Period) {
  if (period && period !== 'custom') setDateRange(period);
  void loadData();
}

function exportDashboardExcel() {
  exportReportWorkbook({
    fileName: `Tong_quan_dieu_hanh_${periodStart.value}_${periodEnd.value}`,
    sheets: [
      {
        name: 'Tổng quan',
        rows: [
          {
            'Từ ngày': periodStart.value,
            'Đến ngày': periodEnd.value,
            'Doanh thu kỳ chọn':
              currentPeriod.value === 'today'
                ? summary.value.todayRevenue
                : currentPeriod.value === 'month'
                  ? summary.value.monthlyRevenue
                  : currentPeriod.value === 'year'
                    ? (summary.value.yearlyRevenue ?? 0)
                    : (summary.value.periodRevenue ?? 0),
            'Lợi nhuận kỳ chọn':
              currentPeriod.value === 'today'
                ? summary.value.todayProfit
                : currentPeriod.value === 'month'
                  ? summary.value.monthlyProfit
                  : currentPeriod.value === 'year'
                    ? (summary.value.yearlyProfit ?? 0)
                    : (summary.value.periodProfit ?? 0),
            'Doanh thu hôm nay': summary.value.todayRevenue,
            'Doanh thu tháng': summary.value.monthlyRevenue,
            'Doanh thu năm': summary.value.yearlyRevenue ?? 0,
            'Lợi nhuận hôm nay': summary.value.todayProfit,
            'Lợi nhuận tháng': summary.value.monthlyProfit,
            'Lợi nhuận năm': summary.value.yearlyProfit ?? 0,
            'Xe bán hôm nay': summary.value.todayVehiclesSold,
            'Xe bán trong tháng': summary.value.monthlyVehiclesSold,
            'Đơn chờ xử lý': summary.value.pendingOrdersCount,
            'Đơn quá hạn': summary.value.overdueOrdersCount,
            'Tồn kho khả dụng': summary.value.currentInventoryCount,
            'SKU hết hàng': summary.value.outOfStockCount ?? 0,
            'SKU sắp hết': summary.value.lowStockCount ?? 0,
            'Tổng sản phẩm': summary.value.totalSKUCount,
          },
        ],
      },
      {
        name: 'Doanh thu theo ngày',
        rows: dailyRevenue.value.map((item) => ({
          Ngày: item.reportDay,
          'Doanh thu': item.totalRevenue,
        })),
      },
      {
        name: 'Doanh thu thương hiệu',
        rows: brandDistributionData.value.map((item: any) => ({
          'Thương hiệu': item.brandName || 'Khác',
          'Doanh thu': item.totalRevenue ?? item.revenue ?? 0,
          'Số lượng bán': item.quantitySold ?? 0,
        })),
      },
      {
        name: 'Hiệu suất nhân viên',
        rows: topStaff.value.map((item) => ({
          'Nhân viên': item.employeeName,
          'Chức vụ': item.role,
          'Doanh số': item.totalSales,
          'Mục tiêu': item.targetSales,
          'Hoa hồng': item.commissionPaid,
          'Trạng thái KPI': item.kpiStatus,
        })),
      },
      {
        name: 'Giao dịch gần nhất',
        rows: transactions.value.map((item) => ({
          'Thời gian': item.timestamp,
          'Khách hàng': item.customerName,
          'Sản phẩm': item.productName,
          'Loại giao dịch': item.isRevenue ? 'Thu' : 'Chi',
          'Số tiền': item.amount,
          'Trạng thái': item.status,
          'Nhân viên': item.staffName,
        })),
      },
      {
        name: 'Đơn hàng gần đây',
        rows: recentOrders.value.map((item) => ({
          'Mã đơn': item.orderCode || item.id,
          'Khách hàng': item.buyerName,
          'Số tiền': item.totalAmount,
          'Trạng thái': item.statusId,
          'Thời gian': item.createdAt,
        })),
      },
    ],
  });
}

async function loadData() {
  loading.value = true;
  try {
    const res = await statisticsApi.getDashboardOverview(periodStart.value, periodEnd.value);
    summary.value = res.summary;
    recentOrders.value = (res.recentOrders || []).slice(0, 10);
    dailyRevenue.value = res.dailyRevenue || [];
    topStaff.value = Array.isArray(res.topStaff) ? res.topStaff : [];
    transactions.value = Array.isArray(res.recentTransactions) ? res.recentTransactions : [];
    await nextTick();
    updateCharts();
  } catch (e) {
    console.error('Failed to load dashboard overview:', e);
    recentOrders.value = [];
    dailyRevenue.value = [];
    topStaff.value = [];
    transactions.value = [];
  } finally {
    loading.value = false;
  }
}

function updateCharts() {
  if (revenueChartRef.value) {
    if (!revenueChart) revenueChart = echarts.init(revenueChartRef.value);
    const data = dailyRevenue.value;
    revenueChart.setOption({
      backgroundColor: 'transparent',
      textStyle: { color: chartTextColor() },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const item = params[0];
          return `<div style="font-weight:600;margin-bottom:4px;">${item.name}</div>${item.marker} ${item.seriesName}: <b>${formatCurrency(Number(item.value) || 0)}</b>`;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.reportDay),
        axisTick: { alignWithLabel: true },
        axisLabel: { color: chartTextColor() },
        axisLine: { lineStyle: { color: chartAxisLineColor() } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: chartTextColor(),
          formatter: (val: number) => {
            if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
            if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} tr`;
            if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
            return `${val}đ`;
          },
        },
        splitLine: { lineStyle: { color: chartGridLineColor() } },
      },
      series: [
        {
          name: 'Doanh thu',
          type: 'line',
          smooth: true,
          data: data.map((d) => d.totalRevenue),
          itemStyle: { color: '#e84a4a' },
          lineStyle: { color: '#e84a4a', width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(232, 74, 74, 0.32)' },
              { offset: 1, color: 'rgba(232, 74, 74, 0.02)' },
            ]),
          },
        },
      ],
    });
  }
  if (brandChartRef.value) {
    if (!brandChart) brandChart = echarts.init(brandChartRef.value);
    const data = brandDistributionData.value.slice(0, 6);
    brandChart.setOption({
      backgroundColor: 'transparent',
      color: ['#e84a4a', '#ff6b6b', '#f97316', '#22c55e', '#3b82f6', '#a855f7'],
      textStyle: { color: chartTextColor() },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<div style="font-weight:600;margin-bottom:4px;">${params.name}</div>${params.marker} Doanh thu: <b>${formatCurrency(Number(params.value) || 0)}</b> (${params.percent}%)`;
        },
      },
      legend: { bottom: 0, textStyle: { color: chartTextColor() } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: data.map((d: any) => ({
            name: d.brandName || 'Khác',
            value: d.totalRevenue ?? d.revenue ?? 0,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
  }
}

function formatCurrency(value: number) {
  if (value == null) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getOrderStatusLabel(statusId?: string) {
  if (!statusId) return '-';
  const labels: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed_cod: 'Đã xác nhận (COD)',
    paid_processing: 'Đang xử lý',
    waiting_deposit: 'Chờ đặt cọc',
    deposit_paid: 'Đã đặt cọc',
    waiting_installment: 'Chờ duyệt trả góp',
    installment_approved: 'Đã duyệt trả góp',
    delivering: 'Đang giao hàng',
    waiting_pickup: 'Chờ lấy hàng',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
    refunding: 'Đang hoàn tiền',
    refunded: 'Đã hoàn tiền',
  };
  return labels[statusId.toLowerCase()] || statusId;
}

function getKpiClass(status: string) {
  switch (status) {
    case 'Vượt KPI':
      return 'bg-green-100 text-green-700';
    case 'Đạt':
      return 'bg-blue-100 text-blue-700';
    case 'Cần cải thiện':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700';
  }
}

function setDateRange(period: Period) {
  const today = new Date();

  if (period === 'today') {
    periodStart.value = toDateInput(today);
    periodEnd.value = toDateInput(today);
    return;
  }

  if (period === 'month') {
    periodStart.value = toDateInput(startOfMonth(today));
    periodEnd.value = toDateInput(today);
    return;
  }

  if (period === 'year') {
    periodStart.value = toDateInput(new Date(today.getFullYear(), 0, 1));
    periodEnd.value = toDateInput(today);
  }
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateInput(date: Date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function chartTextColor() {
  return isDark.value ? '#CBD5E1' : '#475569';
}

function chartAxisLineColor() {
  return isDark.value ? 'rgb(255 255 255 / 14%)' : '#E2E8F0';
}

function chartGridLineColor() {
  return isDark.value ? 'rgb(255 255 255 / 8%)' : '#F1F5F9';
}

function handleResize() {
  revenueChart?.resize();
  brandChart?.resize();
}

watch(isDark, async () => {
  await nextTick();
  updateCharts();
});

watch([periodStart, periodEnd], () => {
  if (currentPeriod.value === 'custom' && periodStart.value && periodEnd.value) {
    void loadData();
  }
});

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  revenueChart?.dispose();
  brandChart?.dispose();
});
</script>

<style scoped lang="scss">
.dashboard-report__kpis,
.dashboard-report__overview,
.dashboard-report__analysis,
.dashboard-report__transactions {
  margin-bottom: 16px;
}

.dashboard-report__kpis :deep(.art-card) {
  min-height: 126px;
}

.dashboard-report__kpis :deep(.art-stats-card__count) {
  font-size: 18px !important;
  line-height: 1.25;
}

.dashboard-report__summary-card :deep(.el-card__body) {
  padding: 14px;
}

.dashboard-report__summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.dashboard-report__summary-item {
  display: flex;
  min-width: 0;
  min-height: 76px;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-fill-color-lighter);

  &:first-child {
    grid-column: 1 / -1;
  }

  > div:last-child {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 4px;
  }

  span {
    overflow: hidden;
    color: var(--report-muted);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 16px;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dashboard-report__summary-item--revenue {
  border-color: rgb(232 74 74 / 24%);
  background: linear-gradient(135deg, rgb(232 74 74 / 10%), var(--el-fill-color-lighter));

  strong {
    color: #d63f3f;
    font-size: 20px;
  }
}

.dashboard-report__summary-icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: #e84a4a;
  background: rgb(232 74 74 / 12%);
  font-size: 18px;
}

.dashboard-report__card-header {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  span:last-child {
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    color: var(--report-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dashboard-report__chart {
  min-height: 300px;
}

.dashboard-report__table-card table,
.dashboard-report__transactions table {
  color: var(--report-muted-strong);
}

.dashboard-report__table-card th,
.dashboard-report__transactions th {
  color: var(--report-muted);
}

@media (width <= 767px) {
  .dashboard-report__chart {
    min-height: 240px;
  }

  .dashboard-report__summary-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-report__summary-item:first-child {
    grid-column: auto;
  }
}
</style>
