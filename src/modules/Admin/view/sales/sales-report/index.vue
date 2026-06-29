<template>
  <div class="sales-report-page">
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
            {{ kpis.revenueChange >= 0 ? "▲" : "▼" }}
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
            {{ kpis.profitChange >= 0 ? "▲" : "▼" }}
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
            {{ kpis.orderChange >= 0 ? "▲" : "▼" }}
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
            {{ kpis.cancelledOrders > 0 ? "Cần xử lý" : "Không có" }}
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
            {{ kpis.aovChange >= 0 ? "▲" : "▼" }}
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
        <ElTable
          :data="topMotorbikes"
          style="width: 100%"
          size="small"
          :show-header="true"
        >
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
            <template #default="{ row }">{{
              formatCurrency(row.revenue)
            }}</template>
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
        <ElTable
          :data="topParts"
          style="width: 100%"
          size="small"
          :show-header="true"
        >
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
            <template #default="{ row }">{{
              formatCurrency(row.revenue)
            }}</template>
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
              <span v-if="idx === 0" class="rank-badge rank-badge--gold"
                >🥇</span
              >
              <span v-else-if="idx === 1" class="rank-badge rank-badge--silver"
                >🥈</span
              >
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
      <ElTable
        :data="paginatedDetailData"
        style="width: 100%"
        border
        size="small"
      >
        <ElTableColumn label="Ngày" min-width="120" align="center">
          <template #default="{ row }">{{ formatDate(row.date) }}</template>
        </ElTableColumn>
        <ElTableColumn label="Doanh thu Xe máy" min-width="160" align="right">
          <template #default="{ row }">{{
            formatCurrency(row.motorbikeRevenue)
          }}</template>
        </ElTableColumn>
        <ElTableColumn label="Doanh thu Phụ tùng" min-width="160" align="right">
          <template #default="{ row }">{{
            formatCurrency(row.partsRevenue)
          }}</template>
        </ElTableColumn>
        <ElTableColumn label="Doanh thu Dịch vụ" min-width="160" align="right">
          <template #default="{ row }">{{
            formatCurrency(row.serviceRevenue)
          }}</template>
        </ElTableColumn>
        <ElTableColumn label="Tổng doanh thu" min-width="160" align="right">
          <template #default="{ row }">
            <span class="font-bold">{{
              formatCurrency(row.totalRevenue)
            }}</span>
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
        <ElTableColumn
          label="Thao tác"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <ElButton
              type="primary"
              link
              size="small"
              @click="handleViewDetail(row)"
            >
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
    <ElDrawer
      v-model="drawerVisible"
      title="Chi tiết doanh thu ngày"
      size="40%"
    >
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
            <span class="font-bold">{{
              formatCurrency(drawerData.motorbikeRevenue)
            }}</span>
          </div>
          <div class="breakdown-row">
            <span>⚙️ Doanh thu Phụ tùng:</span>
            <span class="font-bold">{{
              formatCurrency(drawerData.partsRevenue)
            }}</span>
          </div>
          <div class="breakdown-row">
            <span>🛠️ Doanh thu Dịch vụ:</span>
            <span class="font-bold">{{
              formatCurrency(drawerData.serviceRevenue)
            }}</span>
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
          <ElTable
            :data="drawerData.orders"
            style="width: 100%"
            size="small"
            border
          >
            <ElTableColumn label="Mã đơn" width="120">
              <template #default="{ row }">
                <span class="font-medium text-primary">#{{ row.id }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Loại" width="120" align="center">
              <template #default="{ row }">
                <ElTag :type="getOrderTypeTag(row.type)" size="small">{{
                  row.typeLabel
                }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Khách hàng" min-width="150">
              <template #default="{ row }">{{ row.customer }}</template>
            </ElTableColumn>
            <ElTableColumn label="Số tiền" width="140" align="right">
              <template #default="{ row }">{{
                formatCurrency(row.amount)
              }}</template>
            </ElTableColumn>
            <ElTableColumn label="Trạng thái" width="120" align="center">
              <template #default="{ row }">
                <ElTag :type="getStatusTag(row.status)" size="small">{{
                  row.status
                }}</ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import {
  Download,
  Document,
  Money,
  TrendCharts,
  ShoppingCart,
  CloseBold,
  Search,
  ShoppingBag,
} from "@element-plus/icons-vue";
import { statisticsApi } from "@/api/operations/statistics.api";
import type {
  AdminRevenueAnalysisResponse,
  DailyRevenueDetailResponse,
} from "@/types/api/statistical";

defineOptions({ name: "SalesReport" });

const USE_MOCK = true;

// Filter state
const filterBranch = ref("all");
const filterPeriod = ref("month");
const filterCategory = ref("all");

// Table state
const tableSearch = ref("");
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

// Mock KPI data
const kpis = ref({
  grossRevenue: 2500000000,
  revenueChange: 12.5,
  grossProfit: 450000000,
  profitChange: 8.4,
  totalOrders: 620,
  orderChange: -2.1,
  cancelledOrders: 12,
  aov: 4032258,
  aovChange: 5.3,
});

// Mock revenue trend data (daily for current month)
const revenueTrendData = ref([
  { date: "2026-06-01", motorbike: 85000000, parts: 4200000, service: 2100000 },
  { date: "2026-06-02", motorbike: 92000000, parts: 5100000, service: 1800000 },
  { date: "2026-06-03", motorbike: 78000000, parts: 3800000, service: 2500000 },
  {
    date: "2026-06-04",
    motorbike: 110000000,
    parts: 6200000,
    service: 3100000,
  },
  {
    date: "2026-06-05",
    motorbike: 125000000,
    parts: 7500000,
    service: 2800000,
  },
  { date: "2026-06-06", motorbike: 98000000, parts: 5400000, service: 2200000 },
  {
    date: "2026-06-07",
    motorbike: 105000000,
    parts: 6800000,
    service: 3500000,
  },
  { date: "2026-06-08", motorbike: 88000000, parts: 4500000, service: 1900000 },
  {
    date: "2026-06-09",
    motorbike: 115000000,
    parts: 7200000,
    service: 3000000,
  },
  {
    date: "2026-06-10",
    motorbike: 132000000,
    parts: 8100000,
    service: 2700000,
  },
  { date: "2026-06-11", motorbike: 97000000, parts: 5500000, service: 2400000 },
  {
    date: "2026-06-12",
    motorbike: 108000000,
    parts: 6900000,
    service: 3200000,
  },
  {
    date: "2026-06-13",
    motorbike: 121000000,
    parts: 7800000,
    service: 2900000,
  },
  {
    date: "2026-06-14",
    motorbike: 135000000,
    parts: 8500000,
    service: 3600000,
  },
  {
    date: "2026-06-15",
    motorbike: 142000000,
    parts: 9200000,
    service: 3100000,
  },
  {
    date: "2026-06-16",
    motorbike: 118000000,
    parts: 7100000,
    service: 2700000,
  },
  {
    date: "2026-06-17",
    motorbike: 128000000,
    parts: 8000000,
    service: 3400000,
  },
  {
    date: "2026-06-18",
    motorbike: 105000000,
    parts: 6700000,
    service: 2500000,
  },
  {
    date: "2026-06-19",
    motorbike: 138000000,
    parts: 8800000,
    service: 3800000,
  },
  {
    date: "2026-06-20",
    motorbike: 145000000,
    parts: 9500000,
    service: 3200000,
  },
  {
    date: "2026-06-21",
    motorbike: 122000000,
    parts: 7800000,
    service: 2900000,
  },
  {
    date: "2026-06-22",
    motorbike: 130000000,
    parts: 8200000,
    service: 3500000,
  },
  {
    date: "2026-06-23",
    motorbike: 140000000,
    parts: 9000000,
    service: 3100000,
  },
  {
    date: "2026-06-24",
    motorbike: 150000000,
    parts: 9800000,
    service: 4000000,
  },
  {
    date: "2026-06-25",
    motorbike: 155000000,
    parts: 10200000,
    service: 3800000,
  },
  {
    date: "2026-06-26",
    motorbike: 148000000,
    parts: 9500000,
    service: 3500000,
  },
]);

// Mock top motorbikes
const topMotorbikes = ref([
  { name: "Honda Winner X V3", quantity: 45, revenue: 675000000 },
  { name: "Yamaha Exciter 155", quantity: 38, revenue: 532000000 },
  { name: "Honda Air Blade 160", quantity: 32, revenue: 416000000 },
  { name: "Yamaha Sirius", quantity: 28, revenue: 252000000 },
  { name: "Honda Vision", quantity: 25, revenue: 212500000 },
]);

// Mock top parts
const topParts = ref([
  { name: "Nhớt Castrol 10W40 (1L)", quantity: 320, revenue: 38400000 },
  { name: "Lốp Michelin City Pro", quantity: 85, revenue: 34000000 },
  { name: "Phuộc trước YSS", quantity: 42, revenue: 29400000 },
  { name: "Mũ bảo hiểm BOSS", quantity: 56, revenue: 25200000 },
  { name: "Gương chiếu hậu LED", quantity: 120, revenue: 21600000 },
]);

// Mock top employees
const topEmployees = ref([
  {
    id: 1,
    name: "Nguyễn Văn A",
    role: "Trưởng ca bán xe",
    revenue: 485000000,
    orderCount: 42,
  },
  {
    id: 2,
    name: "Trần Thị B",
    role: "Tư vấn phụ tùng",
    revenue: 320000000,
    orderCount: 156,
  },
  {
    id: 3,
    name: "Lê Văn C",
    role: "Kỹ thuật viên xưởng",
    revenue: 280000000,
    orderCount: 89,
  },
]);

// Detail data for table
const detailData = ref<any[]>([]);

const filteredDetailData = computed(() => {
  let data = detailData.value;
  if (filterCategory.value !== "all") {
    data = data.map((item) => {
      let catRevenue = 0;
      if (filterCategory.value === "motorbike")
        catRevenue = item.motorbikeRevenue;
      else if (filterCategory.value === "parts") catRevenue = item.partsRevenue;
      else if (filterCategory.value === "service")
        catRevenue = item.serviceRevenue;
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

function generateMockOrders(date: string, totalRevenue: number) {
  const orders: any[] = [];
  const count = Math.floor(Math.random() * 5) + 3;
  const types = [
    { type: "motorbike", label: "Bán xe" },
    { type: "parts", label: "Phụ tùng" },
    { type: "service", label: "Dịch vụ" },
  ];
  const names = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Văn Cường",
    "Phạm Thị Dung",
    "Hoàng Văn Em",
  ];
  const statuses = ["Đã thanh toán", "Chưa TT", "COD"];

  for (let i = 0; i < count; i++) {
    const typeInfo = types[Math.floor(Math.random() * types.length)];
    orders.push({
      id: Math.floor(Math.random() * 9000) + 1000,
      type: typeInfo.type,
      typeLabel: typeInfo.label,
      customer: names[Math.floor(Math.random() * names.length)],
      amount:
        Math.floor(totalRevenue / count / 1000) * 1000 +
        Math.floor(Math.random() * 500000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return orders;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getOrderTypeTag(type: string): "success" | "warning" | "info" {
  const map: Record<string, "success" | "warning" | "info"> = {
    motorbike: "success",
    parts: "warning",
    service: "info",
  };
  return map[type] || "info";
}

function getStatusTag(status: string): "success" | "warning" | "info" {
  const map: Record<string, "success" | "warning" | "info"> = {
    "Đã thanh toán": "success",
    "Chưa TT": "warning",
    COD: "info",
  };
  return map[status] || "info";
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
  ElMessage.success("Đang xuất Excel... (chức năng demo)");
}

function handleExportPdf() {
  ElMessage.success("Đang xuất PDF... (chức năng demo)");
}

async function fetchData() {
  try {
    if (USE_MOCK) {
      detailData.value = revenueTrendData.value.map((item) => ({
        date: item.date,
        motorbikeRevenue: item.motorbike,
        partsRevenue: item.parts,
        serviceRevenue: item.service,
        totalRevenue: item.motorbike + item.parts + item.service,
        orderCount: Math.floor(Math.random() * 20) + 10,
        orders: generateMockOrders(
          item.date,
          item.motorbike + item.parts + item.service,
        ),
      }));
      return;
    }
    const res: AdminRevenueAnalysisResponse =
      await statisticsApi.getRevenueAnalysis();

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
            ? Math.round(
                Number(res.summary.monthlyRevenue) /
                  res.summary.pendingOrdersCount,
              )
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
        name: p.productName || "",
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
    console.error("Failed to fetch sales report:", error);
    ElMessage.error("Không thể tải dữ liệu báo cáo");
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
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          let html = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((p: any) => {
            html += `${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}<br/>`;
          });
          return html;
        },
      },
      legend: {
        data: ["Xe máy", "Phụ tùng", "Dịch vụ xưởng"],
        textStyle: { color: "var(--el-text-color-secondary, #909399)" },
        top: 0,
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: { color: "var(--el-text-color-secondary, #909399)" },
        axisLine: {
          lineStyle: { color: "var(--el-border-color-light, #e4e7ed)" },
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "var(--el-text-color-secondary, #909399)",
          formatter: (v: number) =>
            v >= 1000000 ? `${v / 1000000}tr` : `${v / 1000}k`,
        },
        splitLine: {
          lineStyle: { color: "var(--el-border-color-lighter, #f0f0f0)" },
        },
      },
      series: [
        {
          name: "Xe máy",
          type: "line",
          smooth: true,
          data: revenueTrendData.value.map((r) => r.motorbike),
          itemStyle: { color: "#409eff" },
          lineStyle: { color: "#409eff" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(64, 158, 255, 0.25)" },
              { offset: 1, color: "rgba(64, 158, 255, 0)" },
            ]),
          },
        },
        {
          name: "Phụ tùng",
          type: "line",
          smooth: true,
          data: revenueTrendData.value.map((r) => r.parts),
          itemStyle: { color: "#67c23a" },
          lineStyle: { color: "#67c23a" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(103, 194, 58, 0.2)" },
              { offset: 1, color: "rgba(103, 194, 58, 0)" },
            ]),
          },
        },
        {
          name: "Dịch vụ xưởng",
          type: "line",
          smooth: true,
          data: revenueTrendData.value.map((r) => r.service),
          itemStyle: { color: "#e6a23c" },
          lineStyle: { color: "#e6a23c" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(230, 162, 60, 0.2)" },
              { offset: 1, color: "rgba(230, 162, 60, 0)" },
            ]),
          },
        },
      ],
    });
  }

  if (pieChartRef.value) {
    if (!pieChart) pieChart = echarts.init(pieChartRef.value);
    const totalMotorbike = revenueTrendData.value.reduce(
      (s, r) => s + r.motorbike,
      0,
    );
    const totalParts = revenueTrendData.value.reduce((s, r) => s + r.parts, 0);
    const totalService = revenueTrendData.value.reduce(
      (s, r) => s + r.service,
      0,
    );
    const grandTotal = totalMotorbike + totalParts + totalService;
    pieChart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: (params: any) =>
          `${params.name}<br/>${formatCurrency(params.value)} (${((params.value / grandTotal) * 100).toFixed(1)}%)`,
      },
      legend: {
        orient: "vertical",
        right: 10,
        top: "center",
        textStyle: { color: "var(--el-text-color-regular, #606266)" },
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: "var(--el-bg-color-overlay, #fff)",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            color: "var(--el-text-color-regular, #606266)",
          },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: "bold" },
          },
          data: [
            {
              value: totalMotorbike,
              name: "Xe máy",
              itemStyle: { color: "#409eff" },
            },
            {
              value: totalParts,
              name: "Phụ tùng",
              itemStyle: { color: "#67c23a" },
            },
            {
              value: totalService,
              name: "Dịch vụ xưởng",
              itemStyle: { color: "#e6a23c" },
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
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
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
