<template>
  <div class="resp-page sales-report-page">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-bar__left">
        <ElSelect
          v-model="filterBranch"
          placeholder="Toàn hệ thống"
          size="default"
          clearable
          style="width: 180px"
          @change="handleFilterChange"
        >
          <ElOption label="Toàn hệ thống" value="all" />
          <ElOption label="Chi nhánh Biên Hòa" value="bienhoa" />
          <ElOption label="Chi nhánh Thống Nhất" value="thongnhat" />
        </ElSelect>
        <ElSelect
          v-model="filterPeriod"
          placeholder="Tháng này"
          size="default"
          style="width: 150px"
          @change="handleFilterChange"
        >
          <ElOption label="Hôm nay" value="today" />
          <ElOption label="Tuần này" value="week" />
          <ElOption label="Tháng này" value="month" />
          <ElOption label="Năm nay" value="year" />
        </ElSelect>
        <ElSelect
          v-model="filterCategory"
          placeholder="Tất cả danh mục"
          size="default"
          clearable
          style="width: 180px"
          @change="handleFilterChange"
        >
          <ElOption label="Tất cả danh mục" value="all" />
          <ElOption label="Xe máy" value="motorbike" />
          <ElOption label="Phụ tùng" value="parts" />
          <ElOption label="Dịch vụ xưởng" value="service" />
        </ElSelect>
      </div>
      <div class="filter-bar__right">
        <ElButton type="primary" @click="handleExportExcel">
          <ElIcon class="mr-1"><Download /></ElIcon>
          Xuất Excel
        </ElButton>
        <ElButton @click="handleExportPdf">
          <ElIcon class="mr-1"><Document /></ElIcon>
          Xuất PDF
        </ElButton>
      </div>
    </div>
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-card--revenue">
        <div class="kpi-card__icon">
          <ElIcon :size="28"><Money /></ElIcon>
        </div>
        <div class="kpi-card__content">
          <div class="kpi-card__label">Tổng doanh thu</div>
          <div class="kpi-card__value">
            {{ formatCurrency(kpis.grossRevenue) }}
          </div>
          <div
            class="kpi-card__change"
            :class="kpis.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            {{ kpis.revenueChange >= 0 ? '▲' : '▼' }}
            {{ Math.abs(kpis.revenueChange).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-card--profit">
        <div class="kpi-card__icon">
          <ElIcon :size="28"><TrendCharts /></ElIcon>
        </div>
        <div class="kpi-card__content">
          <div class="kpi-card__label">Lợi nhuận gộp</div>
          <div class="kpi-card__value">
            {{ formatCurrency(kpis.grossProfit) }}
          </div>
          <div
            class="kpi-card__change"
            :class="kpis.profitChange >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            {{ kpis.profitChange >= 0 ? '▲' : '▼' }}
            {{ Math.abs(kpis.profitChange).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-card--orders">
        <div class="kpi-card__icon">
          <ElIcon :size="28"><ShoppingCart /></ElIcon>
        </div>
        <div class="kpi-card__content">
          <div class="kpi-card__label">Tổng số đơn hàng</div>
          <div class="kpi-card__value">{{ kpis.totalOrders }}</div>
          <div
            class="kpi-card__change"
            :class="kpis.orderChange >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            {{ kpis.orderChange >= 0 ? '▲' : '▼' }}
            {{ Math.abs(kpis.orderChange).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-card--cancelled">
        <div class="kpi-card__icon">
          <ElIcon :size="28"><CloseBold /></ElIcon>
        </div>
        <div class="kpi-card__content">
          <div class="kpi-card__label">Đơn hủy</div>
          <div class="kpi-card__value">{{ kpis.cancelledOrders }}</div>
          <div class="kpi-card__change text-red-500">
            {{ kpis.cancelledOrders > 0 ? 'Cần xử lý' : 'Không có' }}
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-card--aov">
        <div class="kpi-card__icon">
          <ElIcon :size="28"><ShoppingBag /></ElIcon>
        </div>
        <div class="kpi-card__content">
          <div class="kpi-card__label">Giá trị đơn TB (AOV)</div>
          <div class="kpi-card__value">{{ formatCurrency(kpis.aov) }}</div>
          <div
            class="kpi-card__change"
            :class="kpis.aovChange >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            {{ kpis.aovChange >= 0 ? '▲' : '▼' }}
            {{ Math.abs(kpis.aovChange).toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Revenue Trend Chart -->
      <ElCard class="chart-card">
        <template #header>
          <div class="chart-card__header">
            <span>📊 Xu hướng doanh thu</span>
          </div>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </ElCard>

      <!-- Revenue Structure Pie Chart -->
      <ElCard class="chart-card">
        <template #header>
          <div class="chart-card__header">
            <span>🍕 Cơ cấu doanh thu theo ngành hàng</span>
          </div>
        </template>
        <div ref="pieChartRef" class="chart-container"></div>
      </ElCard>
    </div>

    <!-- Top Rankings -->
    <div class="rankings-grid">
      <!-- Top 5 Motorbikes -->
      <ElCard class="ranking-card">
        <template #header>
          <div class="ranking-card__header">
            <span>🏍️ Top 5 dòng xe bán chạy nhất</span>
          </div>
        </template>
        <ElTable :data="topMotorbikes" style="width: 100%" size="small" :show-header="true">
          <ElTableColumn type="index" label="#" width="50" align="center" />
          <ElTableColumn label="Dòng xe" min-width="180">
            <template #default="{ row }">
              <span class="font-medium">{{ row.name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Số lượng" width="100" align="right">
            <template #default="{ row }">{{ row.quantity }} chiếc</template>
          </ElTableColumn>
          <ElTableColumn label="Doanh thu" width="140" align="right">
            <template #default="{ row }">{{ formatCurrency(row.revenue) }}</template>
          </ElTableColumn>
        </ElTable>
      </ElCard>

      <!-- Top 5 Parts -->
      <ElCard class="ranking-card">
        <template #header>
          <div class="ranking-card__header">
            <span>⚙️ Top 5 phụ tùng bán chạy</span>
          </div>
        </template>
        <ElTable :data="topParts" style="width: 100%" size="small" :show-header="true">
          <ElTableColumn type="index" label="#" width="50" align="center" />
          <ElTableColumn label="Phụ tùng" min-width="180">
            <template #default="{ row }">
              <span class="font-medium">{{ row.name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Số lượng" width="100" align="right">
            <template #default="{ row }">{{ row.quantity }} sp</template>
          </ElTableColumn>
          <ElTableColumn label="Doanh thu" width="140" align="right">
            <template #default="{ row }">{{ formatCurrency(row.revenue) }}</template>
          </ElTableColumn>
        </ElTable>
      </ElCard>

      <!-- Top 3 Employees -->
      <ElCard class="ranking-card">
        <template #header>
          <div class="ranking-card__header">
            <span>👑 Top 3 nhân viên xuất sắc nhất tháng</span>
          </div>
        </template>
        <div class="top-employees">
          <div
            v-for="(emp, idx) in topEmployees"
            :key="emp.id"
            class="employee-item"
            :class="'employee-item--' + (idx + 1)"
          >
            <div class="employee-item__rank">
              <span v-if="idx === 0" class="rank-badge rank-badge--gold">🥇</span>
              <span v-else-if="idx === 1" class="rank-badge rank-badge--silver">🥈</span>
              <span v-else class="rank-badge rank-badge--bronze">🥉</span>
            </div>
            <div class="employee-item__info">
              <div class="employee-item__name">{{ emp.name }}</div>
              <div class="employee-item__role">{{ emp.role }}</div>
            </div>
            <div class="employee-item__stats">
              <div class="employee-item__revenue">
                {{ formatCurrency(emp.revenue) }}
              </div>
              <div class="employee-item__orders">{{ emp.orderCount }} đơn</div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- Detailed Data Table -->
    <ElCard class="detail-card">
      <template #header>
        <div class="detail-card__header">
          <span>📝 Bảng số liệu chi tiết theo ngày</span>
          <ElInput
            v-model="tableSearch"
            placeholder="Tìm kiếm..."
            size="small"
            style="width: 220px"
            clearable
            @input="handleTableSearch"
          >
            <template #prefix>
              <ElIcon><Search /></ElIcon>
            </template>
          </ElInput>
        </div>
      </template>
      <ElTable :data="paginatedDetailData" style="width: 100%" border size="small">
        <ElTableColumn label="Ngày" min-width="120" align="center">
          <template #default="{ row }">{{ formatDate(row.date) }}</template>
        </ElTableColumn>
        <ElTableColumn label="Doanh thu Xe máy" min-width="160" align="right">
          <template #default="{ row }">{{ formatCurrency(row.motorbikeRevenue) }}</template>
        </ElTableColumn>
        <ElTableColumn label="Doanh thu Phụ tùng" min-width="160" align="right">
          <template #default="{ row }">{{ formatCurrency(row.partsRevenue) }}</template>
        </ElTableColumn>
        <ElTableColumn label="Doanh thu Dịch vụ" min-width="160" align="right">
          <template #default="{ row }">{{ formatCurrency(row.serviceRevenue) }}</template>
        </ElTableColumn>
        <ElTableColumn label="Tổng doanh thu" min-width="160" align="right">
          <template #default="{ row }">
            <span class="font-bold">{{ formatCurrency(row.totalRevenue) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Số đơn" min-width="90" align="center">
          <template #default="{ row }">{{ row.orderCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="Giá trị đơn TB" min-width="140" align="right">
          <template #default="{ row }">{{
            formatCurrency(Math.round(row.totalRevenue / row.orderCount))
          }}</template>
        </ElTableColumn>
        <ElTableColumn label="Thao tác" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="handleViewDetail(row)">
              Xem
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="pagination-wrap">
        <ElPagination
          v-model:current-page="tablePage"
          v-model:page-size="tablePageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredDetailData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>

    <!-- Detail Drawer -->
    <ElDrawer v-model="drawerVisible" title="Chi tiết doanh thu ngày" size="40%">
      <div v-if="drawerData" class="drawer-detail">
        <div class="drawer-detail__header">
          <div class="drawer-detail__date">
            {{ formatDate(drawerData.date) }}
          </div>
          <div class="drawer-detail__total">
            {{ formatCurrency(drawerData.totalRevenue) }}
          </div>
        </div>
        <ElDivider />
        <div class="drawer-detail__breakdown">
          <div class="breakdown-row">
            <span>🏍️ Doanh thu Xe máy:</span>
            <span class="font-bold">{{ formatCurrency(drawerData.motorbikeRevenue) }}</span>
          </div>
          <div class="breakdown-row">
            <span>⚙️ Doanh thu Phụ tùng:</span>
            <span class="font-bold">{{ formatCurrency(drawerData.partsRevenue) }}</span>
          </div>
          <div class="breakdown-row">
            <span>🛠️ Doanh thu Dịch vụ:</span>
            <span class="font-bold">{{ formatCurrency(drawerData.serviceRevenue) }}</span>
          </div>
          <ElDivider />
          <div class="breakdown-row breakdown-row--total">
            <span>Tổng cộng:</span>
            <span>{{ formatCurrency(drawerData.totalRevenue) }}</span>
          </div>
        </div>
        <div class="drawer-detail__orders">
          <h4 class="mb-3 font-bold text-gray-700">
            Danh sách đơn hàng ({{ drawerData.orderCount }})
          </h4>
          <ElTable :data="drawerData.orders" style="width: 100%" size="small" border>
            <ElTableColumn label="Mã đơn" width="120">
              <template #default="{ row }">
                <span class="font-medium text-primary">#{{ row.id }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Loại" width="120" align="center">
              <template #default="{ row }">
                <ElTag :type="getOrderTypeTag(row.type)" size="small">{{ row.typeLabel }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Khách hàng" min-width="150">
              <template #default="{ row }">{{ row.customer }}</template>
            </ElTableColumn>
            <ElTableColumn label="Số tiền" width="140" align="right">
              <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
            </ElTableColumn>
            <ElTableColumn label="Trạng thái" width="120" align="center">
              <template #default="{ row }">
                <ElTag :type="getStatusTag(row.status)" size="small">{{ row.status }}</ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import {
  Download,
  Document,
  Money,
  TrendCharts,
  ShoppingCart,
  CloseBold,
  Search,
  ShoppingBag,
} from '@element-plus/icons-vue';
import { statisticsApi } from '@/api/operations/statistics.api';
import type {
  AdminRevenueAnalysisResponse,
  DailyRevenueDetailResponse,
} from '@/types/api/statistical';

defineOptions({ name: 'SalesReport' });

// Filter state
const filterBranch = ref('all');
const filterPeriod = ref('month');
const filterCategory = ref('all');

// Table state
const tableSearch = ref('');
const tablePage = ref(1);
const tablePageSize = ref(10);

// Drawer state
const drawerVisible = ref(false);
const drawerData = ref<any>(null);

// Chart refs
const trendChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let trendChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

const kpis = ref({
  grossRevenue: 0,
  revenueChange: 0,
  grossProfit: 0,
  profitChange: 0,
  totalOrders: 0,
  orderChange: 0,
  cancelledOrders: 0,
  aov: 0,
  aovChange: 0,
});

const revenueTrendData = ref<any[]>([]);

const topMotorbikes = ref<any[]>([]);

const topParts = ref<any[]>([]);

const topEmployees = ref<any[]>([]);

// Detail data for table
const detailData = ref<any[]>([]);

const filteredDetailData = computed(() => {
  let data = detailData.value;
  if (filterCategory.value !== 'all') {
    data = data.map((item) => {
      let catRevenue = 0;
      if (filterCategory.value === 'motorbike') catRevenue = item.motorbikeRevenue;
      else if (filterCategory.value === 'parts') catRevenue = item.partsRevenue;
      else if (filterCategory.value === 'service') catRevenue = item.serviceRevenue;
      return { ...item, totalRevenue: catRevenue };
    });
  }
  if (tableSearch.value) {
    const q = tableSearch.value.toLowerCase();
    data = data.filter((item) => item.date.toLowerCase().includes(q));
  }
  return data;
});

const paginatedDetailData = computed(() => {
  const start = (tablePage.value - 1) * tablePageSize.value;
  return filteredDetailData.value.slice(start, start + tablePageSize.value);
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getOrderTypeTag(type: string): 'success' | 'warning' | 'info' {
  const map: Record<string, 'success' | 'warning' | 'info'> = {
    motorbike: 'success',
    parts: 'warning',
    service: 'info',
  };
  return map[type] || 'info';
}

function getStatusTag(status: string): 'success' | 'warning' | 'info' {
  const map: Record<string, 'success' | 'warning' | 'info'> = {
    'Đã thanh toán': 'success',
    'Chưa TT': 'warning',
    COD: 'info',
  };
  return map[status] || 'info';
}

function handleFilterChange() {
  tablePage.value = 1;
}

function handleTableSearch() {
  tablePage.value = 1;
}

function handleSizeChange() {
  tablePage.value = 1;
}

function handlePageChange() {
  // handled by v-model
}

function handleViewDetail(row: any) {
  drawerData.value = row;
  drawerVisible.value = true;
}

function handleExportExcel() {
  ElMessage.success('Đang xuất Excel... (chức năng demo)');
}

function handleExportPdf() {
  ElMessage.success('Đang xuất PDF... (chức năng demo)');
}

async function fetchData() {
  try {
    const res: AdminRevenueAnalysisResponse = await statisticsApi.getRevenueAnalysis();

    if (res.summary) {
      kpis.value = {
        grossRevenue: Number(res.summary.monthlyRevenue || 0),
        revenueChange: Number(res.summary.revenueChangePercentage || 0),
        grossProfit: Number(res.summary.monthlyProfit || 0),
        profitChange: 0,
        totalOrders: res.summary.pendingOrdersCount || 0,
        orderChange: 0,
        cancelledOrders: res.summary.overdueOrdersCount || 0,
        aov:
          res.summary.monthlyRevenue && res.summary.pendingOrdersCount
            ? Math.round(Number(res.summary.monthlyRevenue) / res.summary.pendingOrdersCount)
            : 0,
        aovChange: 0,
      };
    }

    if (res.revenueTrend && res.revenueTrend.length > 0) {
      revenueTrendData.value = res.revenueTrend.map((r) => ({
        date: r.reportDay,
        motorbike: 0,
        parts: 0,
        service: 0,
      }));
    }

    if (res.topProductsByRevenue && res.topProductsByRevenue.length > 0) {
      topMotorbikes.value = res.topProductsByRevenue.slice(0, 5).map((p) => ({
        name: p.productName || '',
        quantity: p.unitsSold || 0,
        revenue: Number(p.revenue || 0),
      }));
      topParts.value = [];
    }

    if (res.dailyTableData && res.dailyTableData.length > 0) {
      const mapped = res.dailyTableData.map((r) => ({
        date: r.reportDay,
        motorbikeRevenue: 0,
        partsRevenue: 0,
        serviceRevenue: 0,
        totalRevenue: Number(r.totalRevenue || 0),
        orderCount: r.orderCount || 0,
        orders: [],
      }));
      detailData.value.splice(0, detailData.value.length, ...mapped);
    }
  } catch (error) {
    console.error('Failed to fetch sales report:', error);
    ElMessage.error('Không thể tải dữ liệu báo cáo');
  }
}

function renderCharts() {
  if (trendChartRef.value) {
    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value);
    }
    const dates = revenueTrendData.value.map((r) => {
      const d = new Date(r.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    trendChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let html = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((p: any) => {
            html += `${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}<br/>`;
          });
          return html;
        },
      },
      legend: {
        data: ['Xe máy', 'Phụ tùng', 'Dịch vụ xưởng'],
        textStyle: { color: 'var(--el-text-color-secondary, #909399)' },
        top: 0,
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: { color: 'var(--el-text-color-secondary, #909399)' },
        axisLine: {
          lineStyle: { color: 'var(--el-border-color-light, #e4e7ed)' },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'var(--el-text-color-secondary, #909399)',
          formatter: (v: number) => (v >= 1000000 ? `${v / 1000000}tr` : `${v / 1000}k`),
        },
        splitLine: {
          lineStyle: { color: 'var(--el-border-color-lighter, #f0f0f0)' },
        },
      },
      series: [
        {
          name: 'Xe máy',
          type: 'line',
          smooth: true,
          data: revenueTrendData.value.map((r) => r.motorbike),
          itemStyle: { color: '#409eff' },
          lineStyle: { color: '#409eff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.25)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0)' },
            ]),
          },
        },
        {
          name: 'Phụ tùng',
          type: 'line',
          smooth: true,
          data: revenueTrendData.value.map((r) => r.parts),
          itemStyle: { color: '#67c23a' },
          lineStyle: { color: '#67c23a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(103, 194, 58, 0.2)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0)' },
            ]),
          },
        },
        {
          name: 'Dịch vụ xưởng',
          type: 'line',
          smooth: true,
          data: revenueTrendData.value.map((r) => r.service),
          itemStyle: { color: '#e6a23c' },
          lineStyle: { color: '#e6a23c' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(230, 162, 60, 0.2)' },
              { offset: 1, color: 'rgba(230, 162, 60, 0)' },
            ]),
          },
        },
      ],
    });
  }

  if (pieChartRef.value) {
    if (!pieChart) pieChart = echarts.init(pieChartRef.value);
    const totalMotorbike = revenueTrendData.value.reduce((s, r) => s + r.motorbike, 0);
    const totalParts = revenueTrendData.value.reduce((s, r) => s + r.parts, 0);
    const totalService = revenueTrendData.value.reduce((s, r) => s + r.service, 0);
    const grandTotal = totalMotorbike + totalParts + totalService;
    pieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) =>
          `${params.name}<br/>${formatCurrency(params.value)} (${((params.value / grandTotal) * 100).toFixed(1)}%)`,
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: 'var(--el-text-color-regular, #606266)' },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: 'var(--el-bg-color-overlay, #fff)',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            color: 'var(--el-text-color-regular, #606266)',
          },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' },
          },
          data: [
            {
              value: totalMotorbike,
              name: 'Xe máy',
              itemStyle: { color: '#409eff' },
            },
            {
              value: totalParts,
              name: 'Phụ tùng',
              itemStyle: { color: '#67c23a' },
            },
            {
              value: totalService,
              name: 'Dịch vụ xưởng',
              itemStyle: { color: '#e6a23c' },
            },
          ],
        },
      ],
    });
  }
}

function handleResize() {
  trendChart?.resize();
  pieChart?.resize();
}

onMounted(async () => {
  await fetchData();
  renderCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  pieChart?.dispose();
});
</script>
<style scoped lang="scss">
.sales-report-page {
  padding: 16px;
  padding-bottom: 28px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 14px 18px;
  background: var(--el-bg-color-overlay, #fff);
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: 10px;

  &__left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  &__right {
    display: flex;
    gap: 8px;
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  background: var(--el-bg-color-overlay, #fff);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__value {
    font-size: 20px;
    font-weight: 800;
    color: var(--el-text-color-primary, #303133);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__change {
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
  }

  &--revenue &__icon {
    color: #409eff;
    background: rgb(64 158 255 / 14%);
  }

  &--profit &__icon {
    color: #67c23a;
    background: rgb(103 194 58 / 14%);
  }

  &--orders &__icon {
    color: #e6a23c;
    background: rgb(230 162 60 / 14%);
  }

  &--cancelled &__icon {
    color: #f56c6c;
    background: rgb(245 108 108 / 14%);
  }

  &--aov &__icon {
    color: #909399;
    background: rgb(144 147 153 / 14%);
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 14px 18px;
    font-weight: 700;
    color: var(--el-text-color-primary, #303133);
    border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  }

  :deep(.el-card__body) {
    padding: 18px;
  }
}

.chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  width: 100%;
  min-height: 320px;
}

.rankings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.ranking-card {
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 14px 18px;
    font-weight: 700;
    color: var(--el-text-color-primary, #303133);
    border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.top-employees {
  padding: 12px 18px;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);

  &:last-child {
    border-bottom: 0;
  }

  &__rank {
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-weight: 700;
    font-size: 15px;
    color: var(--el-text-color-primary, #303133);
  }

  &__role {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    margin-top: 2px;
  }

  &__stats {
    text-align: right;
    flex-shrink: 0;
  }

  &__revenue {
    font-weight: 700;
    font-size: 15px;
    color: #f56c6c;
  }

  &__orders {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    margin-top: 2px;
  }

  &--1 {
    background: rgb(250 219 20 / 6%);
    margin: 0 -18px;
    padding: 14px 18px;
    border-radius: 8px;
  }

  &--2 {
    background: rgb(192 192 192 / 5%);
    margin: 0 -18px;
    padding: 14px 18px;
    border-radius: 8px;
  }

  &--3 {
    background: rgb(205 127 50 / 5%);
    margin: 0 -18px;
    padding: 14px 18px;
    border-radius: 8px;
  }
}

.rank-badge {
  font-size: 24px;
}

.detail-card {
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 14px 18px;
    font-weight: 700;
    color: var(--el-text-color-primary, #303133);
    border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  }

  :deep(.el-card__body) {
    padding: 18px;
  }
}

.detail-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.drawer-detail {
  padding: 8px;

  &__header {
    text-align: center;
    margin-bottom: 8px;
  }

  &__date {
    font-size: 14px;
    color: #909399;
  }

  &__total {
    font-size: 28px;
    font-weight: 800;
    color: #f56c6c;
    margin-top: 6px;
  }
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  color: var(--el-text-color-regular, #606266);

  &--total {
    font-size: 16px;
    font-weight: 800;
    color: var(--el-text-color-primary, #303133);
    border-top: 2px solid var(--el-border-color-light, #e4e7ed);
    padding-top: 12px;
    margin-top: 4px;
  }
}

.drawer-detail__orders {
  margin-top: 20px;
}

@media (width >= 768px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rankings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .rankings-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
