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
        :count="formatShortCurrency(mockSummary.totalInvoiced)"
        description="Đã phát hành"
        icon="ri:file-list-3-line"
        icon-style="bg-report-blue"
      />
      <ArtStatsCard
        title="Đã thu đủ"
        :count="formatShortCurrency(mockSummary.collectedCash)"
        description="Đã hạch toán"
        icon="ri:safe-2-line"
        icon-style="bg-report-green"
      />
      <ArtStatsCard
        title="Dòng tiền đang treo"
        :count="formatShortCurrency(mockSummary.pendingTransit)"
        description="COD & Trả góp"
        icon="ri:timer-line"
        icon-style="bg-report-orange"
      />
      <ArtStatsCard
        title="Hóa đơn hủy / Lỗi"
        :count="formatShortCurrency(mockSummary.canceledAmount)"
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
        :data="filteredInvoices"
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
    </ElCard>

    <!-- DRAWER: CHI TIẾT HÓA ĐƠN -->
    <ElDrawer v-model="drawerVisible" title="Chi tiết hóa đơn" size="400px">
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

// --- MOCK DATA ---
const mockSummary = {
  totalInvoiced: 8550000000,
  collectedCash: 7120000000,
  pendingTransit: 1300000000,
  canceledAmount: 130000000,
};

// Dữ liệu biểu đồ Line (Offline vs Online)
const mockTrendData = Array.from({ length: 30 }, (_, i) => {
  const day = `Ngày ${String(i + 1).padStart(2, "0")}`;
  const offlineRev = Math.floor(Math.random() * 200000000) + 100000000;
  const onlineRev = Math.floor(Math.random() * 80000000) + 20000000;
  return { day, offlineRev, onlineRev };
});

const mockProductData = [
  { name: "Khối Xe máy", value: 7800000000 },
  { name: "Khối Phụ tùng", value: 750000000 },
];

const mockPaymentData = [
  { name: "Tiền mặt", value: 35 },
  { name: "Chuyển khoản QR", value: 40 },
  { name: "Trả góp tài chính", value: 20 },
  { name: "Quẹt thẻ POS", value: 5 },
];

const mockInvoices = [
  {
    id: "INV-2026-001",
    date: "30/06/2026",
    channel: "Offline",
    category: "Xe máy",
    paymentMethod: "Trả góp HD Saison",
    amount: 45000000,
    status: "Đã thu đủ",
    customerName: "Nguyễn Trung Hiếu",
    details: {
      customerName: "Nguyễn Trung Hiếu",
      cccd: "079090123456",
      productName: "Honda SH 160i 2026",
      vin: "RLH1234567890ABC",
      engineNo: "JF91E123456",
    },
  },
  {
    id: "INV-2026-002",
    date: "30/06/2026",
    channel: "Online",
    category: "Phụ tùng",
    paymentMethod: "Chuyển khoản QR",
    amount: 350000,
    status: "Chờ đối soát COD",
    customerName: "Lê Trần",
    details: {
      shippingProvider: "Giao Hàng Tiết Kiệm",
      trackingCode: "GHTK-1829399491",
      items: [
        { name: "Nhớt Motul 300V", sku: "MT-300V-1L", qty: 1 },
        { name: "Lọc nhớt Honda", sku: "FLT-HD-001", qty: 1 },
      ],
    },
  },
  {
    id: "INV-2026-003",
    date: "29/06/2026",
    channel: "Offline",
    category: "Phụ tùng",
    paymentMethod: "Tiền mặt",
    amount: 120000,
    status: "Đã hủy",
    customerName: "Khách lẻ",
    details: {
      shippingProvider: "Mua trực tiếp",
      trackingCode: "N/A",
      items: [{ name: "Gương hậu Vision", sku: "MR-VS-02", qty: 1 }],
    },
  },
  {
    id: "INV-2026-004",
    date: "28/06/2026",
    channel: "Online",
    category: "Xe máy",
    paymentMethod: "Quẹt thẻ POS",
    amount: 82000000,
    status: "Lỗi thanh toán",
    customerName: "Trần Minh",
    details: {
      customerName: "Trần Minh Đức",
      cccd: "001090111222",
      productName: "Vespa Sprint 125",
      vin: "ZAPM123456789",
      engineNo: "ENG-VES-9988",
    },
  },
  {
    id: "INV-2026-005",
    date: "28/06/2026",
    channel: "Offline",
    category: "Xe máy",
    paymentMethod: "Chuyển khoản QR",
    amount: 55000000,
    status: "Đã thu đủ",
    customerName: "Phạm Hùng",
    details: {
      customerName: "Phạm Hùng Cường",
      cccd: "031090333444",
      productName: "Yamaha Exciter 155",
      vin: "RLY1234567890DEF",
      engineNo: "ENG-EX-1234",
    },
  },
];

const filteredInvoices = computed(() => {
  if (!searchQuery.value) return mockInvoices;
  const q = searchQuery.value.toLowerCase();
  return mockInvoices.filter(
    (i) =>
      i.id.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q),
  );
});

function openDetail(row: any) {
  selectedInvoice.value = row;
  drawerVisible.value = true;
}

function onPeriodChange() {
  // Mock refresh
}

function renderCharts() {
  // 1. Line Chart: Xu hướng kênh
  if (trendChartRef.value) {
    if (!trendChart) trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
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
        data: mockTrendData.map((d) => d.day),
        axisLabel: { color: chartTextColor },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: chartTextColor },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      series: [
        {
          name: "Offline (Tại quầy)",
          type: "line",
          smooth: true,
          data: mockTrendData.map((d) => d.offlineRev),
          itemStyle: { color: "#22c55e" }, // Xanh lục
          lineStyle: { color: "#22c55e", width: 3 },
        },
        {
          name: "Online (Web/App)",
          type: "line",
          smooth: true,
          data: mockTrendData.map((d) => d.onlineRev),
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
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: "3%", right: "10%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { color: chartTextColor },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      yAxis: {
        type: "category",
        data: mockProductData.map((r) => r.name),
        axisLabel: { color: chartTextColor },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      series: [
        {
          type: "bar",
          data: mockProductData.map((r) => r.value),
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
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "item", formatter: "{b}: {c}%" },
      legend: { bottom: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "60%"],
          center: ["50%", "45%"],
          data: mockPaymentData.map((d) => ({
            name: d.name,
            value: d.value,
          })),
          label: {
            formatter: "{b}: {c}%",
            color: chartTextColor,
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
  setTimeout(() => {
    renderCharts();
  }, 100);
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
/* Optional styles to make the icons in the drawer header display block */
.i-ri-motorbike-line,
.i-ri-settings-4-line {
  display: inline-block;
}
</style>
