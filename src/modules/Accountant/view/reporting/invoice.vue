<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Thống kê hóa đơn"
      description="Quản lý và đối soát dòng tiền đa kênh từ hóa đơn bán hàng và dịch vụ."
      icon="ri:bill-line"
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

    <!-- TẦNG 1: 4 THẺ CHỈ SỐ KPI NHANH -->
    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng giá trị hóa đơn"
        :count="formatShortCurrency(summaryData.totalInvoiced)"
        description="Đã phát hành"
        icon="ri:file-list-3-line"
        icon-style="bg-report-blue"
      />
      <ArtStatsCard
        title="Đã thu đủ"
        :count="formatShortCurrency(summaryData.collectedCash)"
        description="Đã hạch toán"
        icon="ri:safe-2-line"
        icon-style="bg-report-green"
      />
      <ArtStatsCard
        title="Dòng tiền đang treo"
        :count="formatShortCurrency(summaryData.pendingTransit)"
        description="COD & Trả góp"
        icon="ri:timer-line"
        icon-style="bg-report-orange"
      />
      <ArtStatsCard
        title="Hóa đơn hủy / Lỗi"
        :count="formatShortCurrency(summaryData.canceledAmount)"
        description="Cần kiểm tra"
        icon="ri:error-warning-line"
        icon-style="bg-report-red"
      />
    </div>

    <!-- TẦNG 2: BIỂU ĐỒ XU HƯỚNG FULL-WIDTH -->
    <ElCard class="reporting-card mt-4">
      <template #header>Biến động doanh thu hóa đơn theo kênh</template>
      <div ref="trendChartRef" class="reporting-chart"></div>
    </ElCard>

    <!-- TẦNG 3: CẶP ĐÔI BIỂU ĐỒ PHÂN TÍCH TỶ LỆ (CHIA ĐÔI 50/50) -->
    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Cơ cấu dòng sản phẩm</template>
        <div ref="productChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Cơ cấu phương thức thanh toán</template>
        <div ref="paymentChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <!-- TẦNG 4: BẢNG DỮ LIỆU CHI TIẾT (ĐẨY XUỐNG ĐÁY TRANG) -->
    <ElCard class="reporting-card mt-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span>Bảng kê chi tiết hóa đơn</span>
          <div class="flex gap-2">
            <ElInput
              v-model="searchQuery"
              placeholder="Tìm mã hóa đơn, tên KH..."
              class="w-64"
            >
              <template #prefix>
                <div class="i-ri-search-line"></div>
              </template>
            </ElInput>
            <ElButton type="primary" plain>
              <div class="i-ri-file-excel-2-line mr-1"></div>
              Xuất Excel
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable
        :data="paginatedInvoices"
        class="reporting-table"
        empty-text="Không tìm thấy hóa đơn"
      >
        <ElTableColumn prop="id" label="Mã hóa đơn" min-width="130" />
        <ElTableColumn prop="date" label="Ngày tạo" min-width="110" />
        <ElTableColumn prop="channel" label="Kênh" min-width="120">
          <template #default="{ row }">
            <span>{{
              row.channel === "Offline" ? "🏪 Tại quầy" : "🌐 Online"
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="category" label="Loại hàng" min-width="120">
          <template #default="{ row }">
            <span>{{
              row.category === "Xe máy" ? "🏍️ Xe máy" : "⚙️ Phụ tùng"
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="paymentMethod"
          label="Phương thức"
          min-width="150"
        />
        <ElTableColumn
          prop="amount"
          label="Tổng tiền"
          min-width="140"
          align="right"
        >
          <template #default="{ row }">
            <span class="font-semibold">{{ formatCurrency(row.amount) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Trạng thái" min-width="180" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)" effect="dark" round>
              <span v-if="row.status.includes('Đã thu đủ')">🟢 </span>
              <span v-else-if="row.status.includes('Chờ đối soát')">🟡 </span>
              <span v-else-if="row.status.includes('Đã hủy')">🔴 </span>
              <span v-else-if="row.status.includes('Lỗi')">❌ </span>
              {{ row.status }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="Thao tác"
          width="120"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <ElButton link type="primary" @click="openDetail(row)"
              >Chi tiết</ElButton
            >
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredInvoices.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>

    <!-- DRAWER: CHI TIẾT HÓA ĐƠN -->
    <ElDrawer
      v-model="drawerVisible"
      title="Chi tiết hóa đơn"
      size="400px"
      append-to-body
    >
      <template v-if="selectedInvoice">
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold">{{ selectedInvoice.id }}</h3>
            <ElTag :type="getStatusType(selectedInvoice.status)">{{
              selectedInvoice.status
            }}</ElTag>
          </div>
          <p class="text-sm text-gray-500">
            Ngày tạo: {{ selectedInvoice.date }}
          </p>
        </div>

        <div class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="text-gray-500">Kênh bán:</span>
              <span class="font-medium">{{
                selectedInvoice.channel === "Offline" ? "Tại quầy" : "Online"
              }}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-500">Loại hàng:</span>
              <span class="font-medium">{{ selectedInvoice.category }}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-500">Thanh toán:</span>
              <span class="font-medium">{{
                selectedInvoice.paymentMethod
              }}</span>
            </div>
            <div class="flex justify-between border-t pt-2 mt-2">
              <span class="text-gray-500">Tổng tiền:</span>
              <span class="font-bold text-primary">{{
                formatCurrency(selectedInvoice.amount)
              }}</span>
            </div>
          </div>

          <!-- Thông tin chuyên sâu (Drill-down) -->
          <div
            v-if="selectedInvoice.category === 'Xe máy'"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <h4
              class="font-semibold mb-3 border-b pb-2 flex items-center gap-2"
            >
              <div class="i-ri-motorbike-line"></div>
              Chi tiết xe bán
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Khách hàng:</span
                ><span>{{ selectedInvoice.details.customerName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">CCCD:</span
                ><span>{{ selectedInvoice.details.cccd }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Tên xe:</span
                ><span>{{ selectedInvoice.details.productName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số khung:</span
                ><span>{{ selectedInvoice.details.vin }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số máy:</span
                ><span>{{ selectedInvoice.details.engineNo }}</span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <h4
              class="font-semibold mb-3 border-b pb-2 flex items-center gap-2"
            >
              <div class="i-ri-settings-4-line"></div>
              Chi tiết phụ tùng & Vận đơn
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Vận chuyển:</span
                ><span>{{ selectedInvoice.details.shippingProvider }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Mã vận đơn:</span
                ><span class="text-blue-500 cursor-pointer">{{
                  selectedInvoice.details.trackingCode
                }}</span>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-xs text-gray-500 mb-2 uppercase font-semibold">
                Danh sách phụ tùng
              </p>
              <div
                v-for="(item, idx) in selectedInvoice.details.items"
                :key="idx"
                class="flex justify-between text-sm py-1 border-b border-dashed border-gray-100 last:border-0"
              >
                <span>{{ item.qty }}x {{ item.name }}</span>
                <span class="text-gray-500">{{ item.sku }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import { statisticsApi } from "@/api/operations";

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0],
);
const periodEnd = ref(new Date().toISOString().split("T")[0]);
const searchQuery = ref("");
const drawerVisible = ref(false);
const selectedInvoice = ref<any>(null);

// Refs cho ECharts
const trendChartRef = ref<HTMLElement | null>(null);
const productChartRef = ref<HTMLElement | null>(null);
const paymentChartRef = ref<HTMLElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let productChart: echarts.ECharts | null = null;
let paymentChart: echarts.ECharts | null = null;

const chartTextColor = "#aeb0bd";
const chartAxisLineColor = "rgba(255, 255, 255, 0.16)";
const chartGridLineColor = "rgba(255, 255, 255, 0.1)";

const summaryData = ref({
  totalInvoiced: 0,
  collectedCash: 0,
  pendingTransit: 0,
  canceledAmount: 0,
});

const trendData = ref<any[]>([]);
const productData = ref<any[]>([]);
const paymentData = ref<any[]>([]);
const invoicesData = ref<any[]>([]);
const isLoading = ref(false);

const filteredInvoices = computed(() => {
  if (!searchQuery.value) return invoicesData.value;
  const q = searchQuery.value.toLowerCase();
  return invoicesData.value.filter(
    (i) =>
      i.id.toLowerCase().includes(q) ||
      i.details?.customerName?.toLowerCase().includes(q),
  );
});

const currentPage = ref(1);
const pageSize = ref(10);

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredInvoices.value.slice(start, end);
});

function openDetail(row: any) {
  selectedInvoice.value = row;
  drawerVisible.value = true;
}

async function onPeriodChange() {
  isLoading.value = true;
  try {
    const res = await statisticsApi.getInvoiceOverview(
      periodStart.value,
      periodEnd.value,
    );
    summaryData.value = res.kpi;
    trendData.value = res.trendData;
    productData.value = res.productData;
    paymentData.value = res.paymentData;
    invoicesData.value = res.invoicesData;
    renderCharts();
  } catch (error) {
    console.error("Failed to load invoice overview", error);
  } finally {
    isLoading.value = false;
  }
}

function renderCharts() {
  // 1. Line Chart: Xu hướng kênh
  if (trendChartRef.value) {
    if (!trendChart) trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor, fontSize: 13 },
      tooltip: { trigger: "axis" },
      legend: { top: 0, textStyle: { color: chartTextColor } },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "5%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: trendData.value.map((d) => d.day),
        axisLabel: { color: chartTextColor, fontSize: 13 },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: chartTextColor, fontSize: 13 },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      series: [
        {
          name: "Offline (Tại quầy)",
          type: "line",
          smooth: true,
          data: trendData.value.map((d) => d.offlineRev),
          itemStyle: { color: "#22c55e" }, // Xanh lục
          lineStyle: { color: "#22c55e", width: 3 },
        },
        {
          name: "Online (Web/App)",
          type: "line",
          smooth: true,
          data: trendData.value.map((d) => d.onlineRev),
          itemStyle: { color: "#3b82f6" }, // Xanh dương
          lineStyle: { color: "#3b82f6", width: 3 },
        },
      ],
    });
  }

  // 2. Bar Chart: Cơ cấu dòng sản phẩm
  if (productChartRef.value) {
    if (!productChart) productChart = echarts.init(productChartRef.value);
    productChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor, fontSize: 13 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: "3%", right: "10%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { color: chartTextColor, fontSize: 13 },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      yAxis: {
        type: "category",
        data: productData.value.map((r) => r.name),
        axisLabel: { color: chartTextColor, fontSize: 13 },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      series: [
        {
          type: "bar",
          data: productData.value.map((r) => r.value),
          itemStyle: { color: "#e84a4a", borderRadius: [0, 4, 4, 0] },
          barWidth: "40%",
        },
      ],
    });
  }

  // 3. Pie Chart: Phương thức thanh toán
  if (paymentChartRef.value) {
    if (!paymentChart) paymentChart = echarts.init(paymentChartRef.value);
    paymentChart.setOption({
      backgroundColor: "transparent",
      color: ["#e84a4a", "#3b82f6", "#22c55e", "#f97316", "#a855f7"],
      textStyle: { color: chartTextColor, fontSize: 13 },
      tooltip: { trigger: "item", formatter: "{b}: {c}%" },
      legend: { bottom: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "60%"],
          center: ["50%", "45%"],
          data: paymentData.value.map((d) => ({
            name: d.name,
            value: d.value,
          })),
          label: {
            formatter: "{b}: {c}%",
            color: chartTextColor,
            fontSize: 14,
          },
        },
      ],
    });
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatShortCurrency(value: number) {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2).replace(/\.00$/, "") + " Tỷ đ";
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(0) + " Triệu đ";
  }
  return formatCurrency(value);
}

function getStatusType(status: string) {
  if (status.includes("Đã thu đủ")) return "success";
  if (status.includes("Chờ đối soát")) return "warning";
  if (status.includes("Đã hủy")) return "danger";
  if (status.includes("Lỗi")) return "info";
  return "primary";
}

function handleResize() {
  trendChart?.resize();
  productChart?.resize();
  paymentChart?.resize();
}

onMounted(() => {
  onPeriodChange();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  trendChart?.dispose();
  productChart?.dispose();
  paymentChart?.dispose();
});
</script>

<style scoped>
@reference '@styles/core/tailwind.css';

/* Optional styles to make the icons in the drawer header display block */
.i-ri-motorbike-line,
.i-ri-settings-4-line {
  display: inline-block;
}
</style>
