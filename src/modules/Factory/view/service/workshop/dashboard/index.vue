<template>
  <div class="resp-page p-4 dashboard-workshop">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold">
            {{ $t("menus.service.workshop.dashboard") }}
          </h1>
          <div
            class="flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-sm relative overflow-hidden bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
          >
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-xs font-semibold tracking-wide"
              >LIVE / THỜI GIAN THỰC</span
            >
          </div>
        </div>
        <p class="mt-1 text-sm text-g-500">
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
        icon="ri:tools-line"
        icon-style="bg-primary"
        title="Phiếu đang sửa chữa"
        :count="kpi.inProgress"
        description="Số lượng xe trên bàn nâng"
        :loading="loading"
      />
      <ArtStatsCard
        icon="ri:time-line"
        icon-style="bg-warning"
        title="Thời gian hoàn thành TB"
        :count="formatHours(kpi.avgFinishHours)"
        description="Trung bình từ lúc bắt đầu đến hoàn tất"
        :loading="loading"
      />
      <ArtStatsCard
        icon="ri:money-dollar-circle-line"
        icon-style="bg-success"
        title="Doanh thu dịch vụ"
        :count="formatVnd(kpi.serviceRevenue)"
        description="Tổng doanh thu theo chu kỳ"
        :loading="loading"
      />
      <ArtStatsCard
        icon="ri:shopping-cart-2-line"
        icon-style="bg-danger"
        title="Doanh thu bán xe"
        :count="formatVnd(analytics.revenueComparison.retailRevenue)"
        description="Doanh thu bán xe hiện tại"
        :loading="loading"
      />
    </div>

    <!-- Alerts -->
    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 items-start">
      <ElCard class="lg:col-span-1">
        <template #header>
          <span class="font-semibold">Cảnh báo phiếu quá hạn</span>
        </template>

        <div v-if="alerts.overdue.length === 0" class="text-sm text-g-500">
          Không có phiếu quá hạn.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="o in alerts.overdue"
            :key="o.ticketId"
            class="rounded-lg border border-border p-3 bg-box dark:!bg-[#1c1c20] dark:!border-[#333]"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-g-900">
                #{{ o.ticketId }}
              </div>
              <ElTag type="danger" effect="dark">
                Quá hạn: {{ o.overdueHours }} giờ
              </ElTag>
            </div>
            <div class="mt-2 text-xs text-g-500">
              Khách hàng:
              <span class="font-medium text-g-700">{{ o.customerName }}</span>
            </div>
            <div class="mt-1 text-xs text-g-500">
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
          class="text-sm text-g-500"
        >
          Không thiếu vật tư.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="p in alerts.partsShortage"
            :key="p.ticketId + '_' + p.partName"
            class="rounded-lg border border-border p-3 bg-box dark:!bg-[#1c1c20] dark:!border-[#333]"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-g-900">
                #{{ p.ticketId }}
              </div>
              <div class="flex gap-2">
                <ElTag type="danger" effect="dark">Thiếu</ElTag>
                <ElButton size="small" type="primary" link
                  >Đặt hàng bổ sung</ElButton
                >
              </div>
            </div>
            <div class="mt-1 text-xs text-g-500">
              Hạng mục: {{ p.partName }}
            </div>
            <div class="mt-1 text-xs text-g-500">
              Thiếu: {{ p.requiredQuantity }} (Còn: {{ p.availableQuantity }})
            </div>
          </div>
        </div>
      </ElCard>

      <!-- Warranty & complaints (merged into workshop dashboard) -->
      <ElCard class="lg:col-span-1" :class="{ 'mt-0': true }">
        <template #header>
          <span class="font-semibold">Đánh giá & khiếu nại dịch vụ</span>
        </template>

        <div v-if="warrantyAndComplaints.loading" class="text-sm text-g-500">
          Đang tải...
        </div>
        <div v-else>
          <div class="grid grid-cols-1 gap-3">
            <div
              class="rounded-lg border border-border p-3 bg-box dark:!bg-[#1c1c20] dark:!border-[#333]"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold text-g-900">
                  Yêu cầu bảo hành kỹ thuật
                </div>
                <ElTag type="warning" effect="dark">
                  {{ warrantyAndComplaints.warrantyRequestsCount }}
                </ElTag>
              </div>
              <div class="mt-1 text-xs text-g-500">
                Ưu tiên xử lý các yêu cầu quá hạn.
              </div>
            </div>

            <div
              class="rounded-lg border border-border p-3 bg-box dark:!bg-[#1c1c20] dark:!border-[#333]"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold text-g-900">
                  Đánh giá &amp; khiếu nại từ khách
                </div>
                <ElTag type="danger" effect="dark">
                  {{ warrantyAndComplaints.complaintsCount }}
                </ElTag>
              </div>
              <div class="mt-1 text-xs text-g-500">
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
            <div v-else class="text-center text-sm text-g-400 py-4">
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
            >Biểu đồ so sánh doanh thu xưởng theo tháng</span
          >
        </template>

        <div class="h-72">
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

        <div class="h-72">
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

import { statisticsApi } from "@/api/operations";

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
  const now = new Date();
  if (cycle.value === "today") {
    fromDate.value = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    toDate.value = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
  } else if (cycle.value === "this_month") {
    fromDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
    toDate.value = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  } else if (cycle.value === "this_year") {
    fromDate.value = new Date(now.getFullYear(), 0, 1);
    toDate.value = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
  refresh();
}

function handleDateChange() {
  if (cycle.value !== "custom") {
    cycle.value = "custom";
  }
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
  revenueSources: [] as Array<{ source: string; amount: number }>,
  revenueTrend: {
    labels: [] as string[],
    serviceRevenue: [] as number[],
    retailRevenue: [] as number[],
  },
  repairOrderStatusCounts: [] as Array<{ status: string; count: number }>,
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
  const dataMap = new Map(
    analytics.value.repairOrderStatusCounts.map((x) => [x.status, x.count]),
  );

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
            value: dataMap.get("Chờ sửa chữa") || 0,
            itemStyle: { color: "var(--el-color-warning)" },
          },
          {
            value: dataMap.get("Đang sửa chữa") || 0,
            itemStyle: { color: "var(--el-color-primary)" },
          },
          {
            value: dataMap.get("Chờ nghiệm thu") || 0,
            itemStyle: { color: "var(--el-color-info)" },
          },
          {
            value: dataMap.get("Đã hoàn thành") || 0,
            itemStyle: { color: "var(--el-color-success)" },
          },
          {
            value: dataMap.get("Đã hủy phiếu") || 0,
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
    xAxisData: analytics.value.revenueTrend.labels,
    data: [
      {
        name: "Doanh thu dịch vụ",
        data: analytics.value.revenueTrend.serviceRevenue,
      },
      {
        name: "Doanh thu phụ tùng",
        data: analytics.value.revenueTrend.retailRevenue,
      },
    ],
  };
});

const revenueSourceChart = computed(() => {
  return analytics.value.revenueSources.map((s) => ({
    value: s.amount,
    name: s.source,
  }));
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
    const fromStr = fromDate.value ? fromDate.value.toISOString() : undefined;
    const toStr = toDate.value ? toDate.value.toISOString() : undefined;
    const res = await statisticsApi
      .getWorkshopDashboardOverview(fromStr, toStr)
      .catch(() => null);

    if (!res) {
      kpi.value = {
        inProgress: 0,
        avgFinishHours: 0,
        serviceRevenue: 0,
        serviceRevenueVsTargetPct: 0,
      };
      analytics.value.revenueComparison = {
        workshopRevenue: 0,
        retailRevenue: 0,
      };
      alerts.value = {
        overdue: [],
        partsShortage: [],
      };
      technicianRows.value = [];
      warrantyAndComplaints.value = {
        loading: false,
        warrantyRequestsCount: 0,
        complaintsCount: 0,
        recentItems: [],
      };
      return;
    }

    const asAny = res as any;

    kpi.value = {
      inProgress: Number(
        asAny?.KpiCards?.InProgressCount ??
          asAny?.kpiCards?.inProgressCount ??
          0,
      ),
      avgFinishHours: Number(
        asAny?.KpiCards?.AvgCompletionHours ??
          asAny?.kpiCards?.avgCompletionHours ??
          0,
      ),
      serviceRevenue: Number(
        asAny?.KpiCards?.CumulativeRevenue ??
          asAny?.kpiCards?.cumulativeRevenue ??
          0,
      ),
      serviceRevenueVsTargetPct: 0,
    };

    const revComparison =
      asAny?.Analytics?.RevenueComparison ??
      asAny?.analytics?.revenueComparison;
    if (revComparison) {
      analytics.value.revenueComparison = {
        workshopRevenue: Number(
          revComparison.WorkshopRevenue ?? revComparison.workshopRevenue ?? 0,
        ),
        retailRevenue: Number(
          revComparison.RetailRevenue ?? revComparison.retailRevenue ?? 0,
        ),
      };
    } else {
      analytics.value.revenueComparison = {
        workshopRevenue: 0,
        retailRevenue: 0,
      };
    }

    const rawRevenueSources =
      asAny?.Analytics?.RevenueSources ??
      asAny?.analytics?.revenueSources ??
      [];
    analytics.value.revenueSources = rawRevenueSources.map((s: any) => ({
      source: s.Source ?? s.source ?? "Không rõ",
      amount: Number(s.Amount ?? s.amount ?? 0),
    }));

    const rawRevenueTrend =
      asAny?.Analytics?.RevenueTrend ?? asAny?.analytics?.revenueTrend;
    if (rawRevenueTrend) {
      analytics.value.revenueTrend = {
        labels: rawRevenueTrend.Labels ?? rawRevenueTrend.labels ?? [],
        serviceRevenue:
          rawRevenueTrend.ServiceRevenue ??
          rawRevenueTrend.serviceRevenue ??
          [],
        retailRevenue:
          rawRevenueTrend.RetailRevenue ?? rawRevenueTrend.retailRevenue ?? [],
      };
    }

    const rawStatusCounts =
      asAny?.Analytics?.RepairOrderStatusCounts ??
      asAny?.analytics?.repairOrderStatusCounts ??
      [];
    analytics.value.repairOrderStatusCounts = rawStatusCounts.map((s: any) => ({
      status: s.Status ?? s.status ?? "Không rõ",
      count: Number(s.Count ?? s.count ?? 0),
    }));

    const rawOverdue =
      (asAny?.Alerts?.OverdueTickets ?? asAny?.alerts?.overdueTickets) || [];
    alerts.value.overdue =
      rawOverdue.length > 0
        ? rawOverdue.map((o: any) => {
            const ticketId = o.TicketId ?? o.ticketId ?? 0;
            const expectedCompletionTime =
              o.ExpectedCompletionTime ?? o.expectedCompletionTime;
            const overdueHours = expectedCompletionTime
              ? Math.max(
                  0,
                  Math.floor(
                    (Date.now() - new Date(expectedCompletionTime).getTime()) /
                      (1000 * 60 * 60),
                  ),
                )
              : 0;
            return {
              repairOrderId: ticketId,
              ticketId: `TICK-${String(ticketId).padStart(3, "0")}`,
              licensePlate: "",
              customerName: o.CustomerName ?? o.customerName ?? "",
              status: o.Status ?? o.status ?? "Pending",
              overdueHours,
              expectedCompletionTime:
                expectedCompletionTime ?? new Date().toISOString(),
            };
          })
        : [];

    const rawParts =
      (asAny?.Alerts?.PartShortages ?? asAny?.alerts?.partShortages) || [];
    alerts.value.partsShortage =
      rawParts.length > 0
        ? rawParts.map((p: any) => {
            const ticketId = p.TicketId ?? p.ticketId ?? 0;
            const req = p.RequiredQuantity ?? p.requiredQuantity ?? 0;
            const avail = p.AvailableQuantity ?? p.availableQuantity ?? 0;
            return {
              affectedRepairOrderId: ticketId,
              ticketId: `TICK-${String(ticketId).padStart(3, "0")}`,
              partName: p.PartName ?? p.partName ?? "",
              productVariantId: 0,
              productVariantName: p.PartName ?? p.partName ?? "",
              shortCount: Math.max(0, req - avail),
              requiredQuantity: req,
              availableQuantity: avail,
            };
          })
        : [];

    const rawTechnicians =
      (asAny?.Productivity?.TechnicianRankings ??
        asAny?.productivity?.technicianRankings) ||
      [];
    technicianRows.value =
      rawTechnicians.length > 0
        ? rawTechnicians.map((t: any) => ({
            technician: t.TechnicianName ?? t.technicianName ?? "Unknown",
            completed: t.CompletedTickets ?? t.completedTickets ?? 0,
            inProgress: 0,
            revenue: t.TotalRevenue ?? t.totalRevenue ?? 0,
            customerSatisfaction:
              100 - (t.ComplaintRate ?? t.complaintRate ?? 0) * 100,
          }))
        : [];

    warrantyAndComplaints.value = {
      loading: false,
      warrantyRequestsCount:
        asAny?.WarrantyRequestsCount ?? asAny?.warrantyRequestsCount ?? 0,
      complaintsCount: asAny?.ComplaintsCount ?? asAny?.complaintsCount ?? 0,
      recentItems: asAny?.RecentItems ?? asAny?.recentItems ?? [],
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  handleCycleChange();
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

/* Kích hoạt chế độ tối (bắt buộc) cho các thẻ/card trong Dashboard nếu global CSS Tailwind chưa load kịp */
:global(html.dark) .dashboard-workshop {
  --default-box-color: #161618 !important;
  --default-bg-color: #070707 !important;
  --el-bg-color-overlay: #1d1e1f !important;
  --el-text-color-primary: #e5e6eb !important;
  --el-border-color-light: #414243 !important;
}

:global(html.dark) .dashboard-workshop :deep(.el-card) {
  background-color: #1d1e1f !important;
  border-color: #414243 !important;
  color: #e5e6eb !important;
}

:global(html.dark) .dashboard-workshop :deep(.el-card__header) {
  border-bottom-color: #414243 !important;
}

:global(html.dark) .dashboard-workshop :deep(.art-card) {
  background-color: #1d1e1f !important;
  border-color: #414243 !important;
}

:global(html.dark) .dashboard-workshop :deep(.art-card p) {
  color: #e5e6eb !important;
}

:global(html.dark) .dashboard-workshop .text-g-900 {
  color: #e5e6eb !important;
}

:global(html.dark) .dashboard-workshop .bg-green-50 {
  background-color: rgb(22 101 52 / 30%) !important;
  color: #4ade80 !important;
  border-color: rgb(21 128 61 / 50%) !important;
}
</style>
