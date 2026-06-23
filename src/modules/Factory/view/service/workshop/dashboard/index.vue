<template>
  <div class="p-4 dashboard-workshop">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold">
            {{ $t("menus.service.workshop.dashboard") }}
          </h1>
          <div
            class="flex items-center gap-2 bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-200 shadow-sm relative overflow-hidden"
          >
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-xs font-semibold tracking-wide"
              >LIVE / THỜI GIAN THỰC</span
            >
          </div>
        </div>
        <p class="mt-1 text-sm text-slate-500">
          Dashboard quản lý xưởng: KPI tiến độ, cảnh báo phiếu quá hạn/vật tư và
          analytics doanh thu dịch vụ.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Cycle -->
        <ElRadioGroup v-model="cycle" @change="handleCycleChange">
          <ElRadioButton value="today">Hôm nay</ElRadioButton>
          <ElRadioButton value="this_month">Tháng này</ElRadioButton>
          <ElRadioButton value="this_year">Năm này</ElRadioButton>
          <ElRadioButton value="custom">Tuỳ chọn</ElRadioButton>
        </ElRadioGroup>

        <template v-if="cycle === 'custom'">
          <ElDatePicker
            v-model="fromDate"
            type="date"
            placeholder="Từ ngày"
            class="w-40"
            @change="handleDateChange"
          />
          <ElDatePicker
            v-model="toDate"
            type="date"
            placeholder="Đến ngày"
            class="w-40"
            @change="handleDateChange"
          />
        </template>

        <ElButton
          :icon="Refresh"
          type="primary"
          :loading="loading"
          @click="refresh"
        >
          Làm mới
        </ElButton>
      </div>
    </div>

    <!-- KPI Cards (Module 6) -->
    <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <ArtStatsCard
        icon-style="bg-primary"
        title="Phiếu đang sửa chữa"
        :count="kpi.inProgress"
        description="Số lượng xe trên bàn nâng"
        :loading="loading"
      />
      <ArtStatsCard
        icon-style="bg-warning"
        title="Thời gian hoàn thành TB"
        :count="formatHours(kpi.avgFinishHours)"
        description="Trung bình từ lúc bắt đầu đến hoàn tất"
        :loading="loading"
      />
      <ArtStatsCard
        icon-style="bg-success"
        title="Doanh thu dịch vụ"
        :count="formatVnd(kpi.serviceRevenue)"
        description="Tổng doanh thu theo chu kỳ"
        :loading="loading"
      />
      <ArtStatsCard
        icon-style="bg-danger"
        title="Doanh thu bán xe"
        :count="formatVnd(analytics.revenueComparison.retailRevenue)"
        description="Doanh thu bán xe hiện tại"
        :loading="loading"
      />
    </div>

    <!-- Alerts -->
    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ElCard class="lg:col-span-1">
        <template #header>
          <span class="font-semibold">Cảnh báo phiếu quá hạn</span>
        </template>

        <div v-if="alerts.overdue.length === 0" class="text-sm text-slate-500">
          Không có phiếu quá hạn.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="o in alerts.overdue"
            :key="o.ticketId"
            class="rounded-lg border border-slate-200 p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold">#{{ o.ticketId }}</div>
              <ElTag type="danger" effect="dark">
                Quá hạn: {{ o.overdueHours }} giờ
              </ElTag>
            </div>
            <div class="mt-2 text-xs text-slate-500">
              Khách hàng:
              <span class="font-medium text-slate-700">{{
                o.customerName
              }}</span>
            </div>
            <div class="mt-1 text-xs text-slate-500">
              Trạng thái: {{ o.status }}
            </div>
          </div>
        </div>
      </ElCard>

      <ElCard class="lg:col-span-1">
        <template #header>
          <span class="font-semibold">Cảnh báo thiếu vật tư</span>
        </template>

        <div
          v-if="alerts.partsShortage.length === 0"
          class="text-sm text-slate-500"
        >
          Không thiếu vật tư.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="p in alerts.partsShortage"
            :key="p.ticketId + '_' + p.partName"
            class="rounded-lg border border-slate-200 p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold">#{{ p.ticketId }}</div>
              <div class="flex gap-2">
                <ElTag type="danger" effect="dark">Thiếu</ElTag>
                <ElButton size="small" type="primary" link
                  >Đặt hàng bổ sung</ElButton
                >
              </div>
            </div>
            <div class="mt-1 text-xs text-slate-500">
              Hạng mục: {{ p.partName }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              Thiếu: {{ p.requiredQuantity }} (Còn: {{ p.availableQuantity }})
            </div>
          </div>
        </div>
      </ElCard>

      <!-- Warranty & complaints (merged into workshop dashboard) -->
      <ElCard class="lg:col-span-1" :class="{ 'mt-0': true }">
        <template #header>
          <span class="font-semibold">Bảo trì &amp; đánh giá dịch vụ</span>
        </template>

        <div
          v-if="warrantyAndComplaints.loading"
          class="text-sm text-slate-500"
        >
          Đang tải...
        </div>
        <div v-else>
          <div class="grid grid-cols-1 gap-3">
            <div class="rounded-lg border border-slate-200 p-3">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold">
                  Yêu cầu bảo hành kỹ thuật
                </div>
                <ElTag type="warning" effect="dark">
                  {{ warrantyAndComplaints.warrantyRequestsCount }}
                </ElTag>
              </div>
              <div class="mt-1 text-xs text-slate-500">
                Ưu tiên xử lý các yêu cầu quá hạn.
              </div>
            </div>

            <div class="rounded-lg border border-slate-200 p-3">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold">
                  Đánh giá &amp; khiếu nại từ khách
                </div>
                <ElTag type="danger" effect="dark">
                  {{ warrantyAndComplaints.complaintsCount }}
                </ElTag>
              </div>
              <div class="mt-1 text-xs text-slate-500">
                Theo dõi mức độ hài lòng và phản hồi.
              </div>
            </div>

            <ElTable
              v-if="warrantyAndComplaints.recentItems.length > 0"
              :data="warrantyAndComplaints.recentItems"
              border
              style="width: 100%"
            >
              <ElTableColumn prop="ticketId" label="Mã" min-width="120" />
              <ElTableColumn prop="type" label="Loại" min-width="160" />
              <ElTableColumn
                prop="customerName"
                label="Khách hàng"
                min-width="180"
              />
              <ElTableColumn prop="status" label="Trạng thái" min-width="140" />
            </ElTable>
            <div v-else class="text-center text-sm text-slate-400 py-4">
              Chưa có dữ liệu gần đây.
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- Charts -->
    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ElCard class="lg:col-span-2 overflow-hidden relative">
        <template #header>
          <span class="font-semibold"
            >Doanh thu dịch vụ vs doanh thu bán xe</span
          >
        </template>

        <div class="h-96">
          <ArtLineChart
            :data="serviceVsSalesChart.data"
            :x-axis-data="serviceVsSalesChart.xAxisData"
            :loading="loading"
            :colors="['#f56c6c', '#409eff']"
            :show-legend="true"
            legend-position="top"
          />
        </div>
      </ElCard>

      <ElCard class="overflow-hidden relative hide-floating-icons">
        <template #header>
          <span class="font-semibold">Cơ cấu nguồn thu</span>
        </template>

        <div class="h-96">
          <ArtRingChart
            :data="revenueSourceChart"
            :loading="loading"
            :radius="['45%', '70%']"
            :colors="['#409eff', '#67c23a', '#e6a23c', '#f56c6c']"
            :show-legend="true"
            legend-position="bottom"
          />
        </div>
      </ElCard>
    </div>

    <div class="mt-6">
      <ElCard class="overflow-hidden relative">
        <template #header>
          <span class="font-semibold">Bảng trưng bày theo trạng thái</span>
        </template>

        <div class="h-72">
          <ArtBarChart
            :data="statusBarChart.series"
            :x-axis-data="statusBarChart.categories"
            :loading="loading"
            :show-legend="false"
          />
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";

import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ArtBarChart from "@/components/core/charts/art-bar-chart/index.vue";
import ArtLineChart from "@/components/core/charts/art-line-chart/index.vue";
import ArtRingChart from "@/components/core/charts/art-ring-chart/index.vue";

import { statisticsApi } from "@/api/statistics.api";

type RepairOrderStatus =
  | "Pending"
  | "InProgress"
  | "QcPending"
  | "Completed"
  | "Cancelled";

type Cycle = "today" | "this_month" | "this_year" | "custom";

type OverdueAlert = {
  repairOrderId: number;
  ticketId: string;
  licensePlate: string;
  customerName: string;
  status: RepairOrderStatus;
  overdueHours: number;
  expectedCompletionTime: string;
};

type PartsShortageAlert = {
  affectedRepairOrderId: number;
  ticketId: string;
  partName: string;
  productVariantId: number;
  productVariantName: string;
  shortCount: number;
  requiredQuantity: number;
  availableQuantity: number;
};

const loading = ref(false);

// (B) Date cycle state
const cycle = ref<Cycle>("this_month");
const fromDate = ref<Date | null>(new Date());
const toDate = ref<Date | null>(new Date());

function handleCycleChange() {
  refresh();
}

function handleDateChange() {
  refresh();
}

// KPI (Module 6)
const kpi = ref({
  inProgress: 0,
  avgFinishHours: 0,
  serviceRevenue: 0,
  serviceRevenueVsTargetPct: 0,
});

const analytics = ref({
  revenueComparison: {
    workshopRevenue: 0,
    retailRevenue: 0,
  },
});

// Alerts
const alerts = ref({
  overdue: [] as OverdueAlert[],
  partsShortage: [] as PartsShortageAlert[],
});

// Technician performance table
const technicianRows = ref<any[]>([]);

// Warranty & complaints (merged into workshop dashboard)
const warrantyAndComplaints = ref({
  loading: false,
  warrantyRequestsCount: 0,
  complaintsCount: 0,
  recentItems: [] as Array<{
    ticketId: string;
    type: string;
    customerName: string;
    status: string;
  }>,
});

const statusBarChart = computed(() => {
  const mock = {
    pending: 8,
    inProgress: 5,
    qcPending: 3,
    completed: 22,
    cancelled: 1,
  };

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
        name: "Số lượng",
        data: [
          {
            value: mock.pending,
            itemStyle: { color: "var(--el-color-warning)" },
          },
          {
            value: mock.inProgress,
            itemStyle: { color: "var(--el-color-primary)" },
          },
          {
            value: mock.qcPending,
            itemStyle: { color: "var(--el-color-info)" },
          },
          {
            value: mock.completed,
            itemStyle: { color: "var(--el-color-success)" },
          },
          {
            value: mock.cancelled,
            itemStyle: { color: "var(--el-text-color-placeholder)" },
          },
        ],
      },
    ],
  };
});

// Charts
const serviceVsSalesChart = computed(() => {
  return {
    xAxisData: ["T1", "T2", "T3", "T4", "T5", "T6"],
    data: [
      {
        name: "Doanh thu dịch vụ",
        data: [12, 14, 16, 18, 20, 22],
      },
      {
        name: "Doanh thu bán xe",
        data: [10, 13, 15, 14, 18, 19],
      },
    ],
  };
});

const revenueSourceChart = computed(() => {
  return [
    { value: 45, name: "Xe máy" },
    { value: 25, name: "Phụ tùng" },
    { value: 20, name: "Phụ kiện" },
    { value: 10, name: "Dịch vụ GTGT" },
  ];
});

function formatVnd(value: number): string {
  try {
    return (
      new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
        value,
      ) + "đ"
    );
  } catch {
    return `${Math.round(value)}đ`;
  }
}

function formatHours(value: number): string {
  if (!value || Number.isNaN(value)) return "0h";
  return `${Math.round(value)}h`;
}

const refresh = async () => {
  loading.value = true;
  try {
    const res = await statisticsApi.getDashboardOverview().catch(() => null);

    const mock = {
      inProgress: 12,
      avgFinishHours: 36,
      serviceRevenue: 120_000_000,
      serviceRevenueVsTargetPct: 85,
      revenueComparison: {
        workshopRevenue: 80_000_000,
        retailRevenue: 40_000_000,
      },
      overdue: [
        {
          repairOrderId: 205,
          ticketId: "TICK-001",
          licensePlate: "51A-123.45",
          customerName: "Nguyễn Văn A",
          status: "InProgress" as RepairOrderStatus,
          overdueHours: 14,
          expectedCompletionTime: new Date().toISOString(),
        },
      ] as OverdueAlert[],
      partsShortage: [
        {
          affectedRepairOrderId: 206,
          ticketId: "TICK-002",
          partName: "Mâm phanh DID",
          productVariantId: 999,
          productVariantName: "Mâm phanh DID (phụ tùng)",
          shortCount: 2,
          requiredQuantity: 5,
          availableQuantity: 3,
        },
      ] as PartsShortageAlert[],
      technicians: [
        {
          technician: "Anh Khoa",
          completed: 16,
          inProgress: 6,
          revenue: 84_000_000,
          customerSatisfaction: 82,
        },
        {
          technician: "Bảo Trí",
          completed: 11,
          inProgress: 8,
          revenue: 56_000_000,
          customerSatisfaction: 74,
        },
        {
          technician: "Minh Long",
          completed: 7,
          inProgress: 9,
          revenue: 34_000_000,
          customerSatisfaction: 88,
        },
      ],
    };

    if (!res) {
      kpi.value = {
        inProgress: mock.inProgress,
        avgFinishHours: mock.avgFinishHours,
        serviceRevenue: mock.serviceRevenue,
        serviceRevenueVsTargetPct: mock.serviceRevenueVsTargetPct,
      };
      analytics.value.revenueComparison = mock.revenueComparison;
      alerts.value = {
        overdue: mock.overdue,
        partsShortage: mock.partsShortage,
      };
      technicianRows.value = mock.technicians;
      return;
    }

    const asAny = res as any;

    kpi.value = {
      inProgress: Number(asAny?.inProgressCount ?? mock.inProgress),
      avgFinishHours: Number(asAny?.avgFinishHours ?? mock.avgFinishHours),
      serviceRevenue: Number(asAny?.serviceRevenue ?? mock.serviceRevenue),
      serviceRevenueVsTargetPct: Number(
        asAny?.serviceRevenueVsTargetPct ?? mock.serviceRevenueVsTargetPct,
      ),
    };

    if (asAny?.revenueComparison) {
      analytics.value.revenueComparison = asAny.revenueComparison;
    } else {
      analytics.value.revenueComparison = mock.revenueComparison;
    }

    alerts.value = {
      overdue: (asAny?.overdueRepairOrders as OverdueAlert[]) ?? mock.overdue,
      partsShortage:
        (asAny?.partsShortage as PartsShortageAlert[]) ?? mock.partsShortage,
    };

    technicianRows.value =
      (asAny?.technicianPerformance as any[]) ?? mock.technicians;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.dashboard-workshop {
  /* Dọn dẹp/ẩn các icon lạ (widget thả nổi) đè lên viền */
  & :deep([id*="waifu"]),
  & :deep([class*="waifu"]),
  & :deep([id*="live2d"]),
  & :deep([class*="live2d"]),
  & :deep(.lonely-island-widget),
  & :deep(#island-god) {
    display: none !important;
  }
}
:deep(.el-card) {
  overflow: hidden !important;
}
</style>
