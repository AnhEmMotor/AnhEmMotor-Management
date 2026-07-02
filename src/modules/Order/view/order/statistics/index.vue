<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header & Quick Search -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1 max-w-xl">
        <ElInput
          v-model="searchQuery"
          size="large"
          placeholder="Tìm kiếm siêu tốc theo Mã đơn hoặc SĐT khách hàng..."
          prefix-icon="Search"
          clearable
        />
      </div>
      <div class="flex items-center gap-2">
        <h2
          class="m-0 text-xl font-bold uppercase tracking-wide hidden md:block"
        >
          Trung Tâm Điều Phối & Thống Kê
        </h2>
        <ElButton type="primary" plain @click="resetAutoRefresh">
          <ArtSvgIcon icon="ri:refresh-line" class="mr-2" />
          Tự động làm mới: {{ countdownTimer }}s
        </ElButton>
      </div>
    </div>

    <!-- HÀNG ĐỢI CÔNG VIỆC CẦN XỬ LÝ NGAY -->
    <div class="flex items-center justify-between mt-2">
      <span class="font-semibold text-lg uppercase">
        📊 Hàng Đợi Công Việc Cần Xử Lý Ngay
      </span>
      <span class="text-xs text-gray-500"
        >(Click vào số để mở danh sách đơn)</span
      >
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- ĐƠN MỚI CHỜ DUYỆT -->
      <ArtStatsCard
        title="ĐƠN MỚI CHỜ DUYỆT"
        :count="workload.pendingOrders"
        icon="ri:inbox-unarchive-line"
        iconStyle="bg-primary"
        textColor="#409eff"
        class="cursor-pointer"
        @click="handleFilter('pending')"
      />
      <!-- TRỄ LỊCH SLA -->
      <ArtStatsCard
        title="TRỄ LỊCH SLA"
        :count="workload.slaDelayed"
        icon="ri:alarm-warning-line"
        iconStyle="bg-danger"
        textColor="#f56c6c"
        boxStyle="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10"
        class="cursor-pointer animate-pulse"
        @click="handleFilter('sla')"
      />
      <!-- ĐƠN LỖI TIỀN -->
      <ArtStatsCard
        title="ĐƠN LỖI TIỀN"
        :count="workload.paymentErrors"
        icon="ri:money-cny-circle-line"
        iconStyle="bg-warning"
        textColor="#e6a23c"
        class="cursor-pointer"
        @click="handleFilter('payment')"
      />
      <!-- ĐÒI ĐỔI TRẢ -->
      <ArtStatsCard
        title="ĐÒI ĐỔI TRẢ"
        :count="workload.returnRequests"
        icon="ri:arrow-go-back-line"
        iconStyle="bg-purple-500"
        textColor="#9c27b0"
        class="cursor-pointer"
        @click="handleFilter('return')"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- ĐỒ THỊ LƯỢNG ĐƠN THEO GIỜ IN-DAY -->
      <ElCard class="art-table-card lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold uppercase"
              >📈 Đồ Thị Lượng Đơn Theo Giờ (In-day)</span
            >
          </div>
        </template>
        <div ref="hourlyChartRef" class="h-64 w-full"></div>
      </ElCard>

      <!-- HIỆU SUẤT TRỰC ĐƠN HÔM NAY & TỶ LỆ NHẬN HÀNG -->
      <div class="flex flex-col gap-4">
        <ElCard class="art-table-card">
          <template #header>
            <span class="font-semibold uppercase"
              >🏆 Hiệu Suất Trực Đơn Hôm Nay</span
            >
          </template>
          <div class="flex flex-col gap-3 py-2">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Mục tiêu ngày:</span>
              <span class="font-bold">{{ productivity.target }} đơn</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Đã duyệt hoàn tất:</span>
              <span class="font-bold text-green-500"
                >{{ productivity.completed }} đơn</span
              >
            </div>
            <div class="mt-2">
              <div class="flex justify-between items-center mb-1 text-xs">
                <span>Tiến độ hoàn thành</span>
                <span class="font-bold">{{ productivityProgress }}%</span>
              </div>
              <ElProgress
                :percentage="productivityProgress"
                :stroke-width="12"
                status="success"
                :show-text="false"
              />
            </div>
          </div>
        </ElCard>

        <ElCard class="art-table-card flex-1">
          <template #header>
            <span class="font-semibold uppercase">Tỷ lệ P.Thức Nhận Hàng</span>
          </template>
          <div ref="methodChartRef" class="h-40 w-full"></div>
        </ElCard>
      </div>
    </div>

    <!-- DANH SÁCH ĐƠN HÀNG CẦN CHÚ Ý ĐẶC BIỆT -->
    <ElCard class="flex-1 art-table-card border-red-200 dark:border-red-900">
      <template #header>
        <div class="flex items-center justify-between">
          <span
            class="font-semibold text-red-500 uppercase flex items-center gap-2"
          >
            🚨 Danh Sách Đơn Hàng Cần Chú Ý Đặc Biệt (CRITICAL ORDERS)
          </span>
          <span class="text-xs text-red-400">
            {{ filteredExceptions.length }} ca cần giải quyết
          </span>
        </div>
      </template>

      <ElAlert
        v-if="filteredExceptions.length === 0"
        type="success"
        show-icon
        :closable="false"
      >
        Tuyệt vời! Hiện tại không có đơn hàng ngoại lệ nào cần xử lý.
      </ElAlert>

      <ArtTable
        v-else
        :data="filteredExceptions"
        :columns="exceptionColumns"
        :pagination="{
          current: 1,
          size: filteredExceptions.length,
          total: filteredExceptions.length,
        }"
      >
        <template #issue="{ row }">
          <span :class="getIssueColor(row.type)">{{ row.issue }}</span>
        </template>
        <template #action>
          <ElButton size="small" type="primary" plain>Xử lý ngay</ElButton>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
  nextTick,
} from "vue";
import {
  ElCard,
  ElButton,
  ElAlert,
  ElInput,
  ElProgress,
  ElNotification,
} from "element-plus";
import * as echarts from "echarts";
import { useSettingStore } from "@/application/store/setting";
import { Search } from "@element-plus/icons-vue";
import { orderStatisticsApi } from "@/api/operations/order-statistics.api";

defineOptions({ name: "OrderStatisticsDashboard" });

const settingStore = useSettingStore();
const isDark = computed(() => settingStore.systemThemeType === "dark");

// --- STATE ---
const searchQuery = ref("");
const countdownTimer = ref(30);
let timerInterval: ReturnType<typeof setInterval> | null = null;
const activeFilter = ref<string | null>(null);

const hourlyChartRef = ref<HTMLDivElement | null>(null);
const methodChartRef = ref<HTMLDivElement | null>(null);

let hourlyChartInstance: echarts.ECharts | null = null;
let methodChartInstance: echarts.ECharts | null = null;

// --- API DATA ---
const workload = ref({
  pendingOrders: 0,
  slaDelayed: 0,
  paymentErrors: 0,
  returnRequests: 0,
});
const productivity = ref({ target: 0, completed: 0 });
const hourlyData = ref<{ hour: string; count: number }[]>([]);
const exceptionOrders = ref<
  {
    id: number;
    customerName: string;
    issue: string;
    type: string;
    waitTime: string;
  }[]
>([]);
const loadingStats = ref(false);

const loadStats = async () => {
  loadingStats.value = true;
  try {
    const res = await orderStatisticsApi.getStatistics();
    const d = res;
    workload.value = {
      pendingOrders: d.pendingOrders,
      slaDelayed: d.slaDelayed,
      paymentErrors: d.paymentErrors,
      returnRequests: d.returnRequests,
    };
    productivity.value = { target: d.targetToday, completed: d.completedToday };
    hourlyData.value = d.hourlyData;
    exceptionOrders.value = d.exceptionOrders.map((e: any) => ({
      ...e,
      waitTime: "",
    }));

    nextTick(() => {
      renderHourlyChart();
    });
  } catch (error) {
    console.error("Failed to load order statistics:", error);
  } finally {
    loadingStats.value = false;
  }
};
// --- COMPUTED ---
const productivityProgress = computed(() => {
  const { target, completed } = productivity.value;
  return Math.round((completed / target) * 100);
});

const filteredExceptions = computed(() => {
  let list = exceptionOrders.value;

  if (activeFilter.value) {
    list = list.filter((item) => item.type === activeFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (item) =>
        String(item.id).toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q),
    );
  }

  return list;
});

const exceptionColumns = computed(() => [
  { label: "Mã đơn", prop: "id", minWidth: 120 },
  { label: "Khách hàng", prop: "customerName", minWidth: 150 },
  { label: "Vấn đề gặp phải", prop: "issue", useSlot: true, minWidth: 250 },
  { label: "Thời gian chờ", prop: "waitTime", minWidth: 150 },
  {
    label: "Thao tác",
    prop: "action",
    useSlot: true,
    minWidth: 120,
    align: "center",
  },
]);

// --- METHODS ---
const handleFilter = (type: string) => {
  if (activeFilter.value === type) {
    activeFilter.value = null; // Toggle off
  } else {
    activeFilter.value = type;
  }
};

const getIssueColor = (type: string) => {
  switch (type) {
    case "sla":
      return "text-red-500 font-semibold";
    case "payment":
      return "text-orange-500 font-semibold";
    case "return":
      return "text-purple-500 font-semibold";
    default:
      return "text-gray-700 dark:text-gray-300";
  }
};

const checkSLAAlerts = () => {
  if (workload.value.slaDelayed > 0) {
    ElNotification({
      title: "Cảnh báo SLA",
      message: `Có ${workload.value.slaDelayed} đơn hàng trễ lịch cần xử lý ngay!`,
      type: "error",
      duration: 5000,
    });
    // Optional: Simulate ping sound
    try {
      const audio = new Audio("/ping.mp3");
      audio
        .play()
        .catch((e) => console.warn("Audio autoplay blocked by browser", e));
    } catch (e) {}
  }
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  countdownTimer.value = 30;
  timerInterval = setInterval(() => {
    countdownTimer.value--;
    if (countdownTimer.value <= 0) {
      // Simulate API Refresh
      countdownTimer.value = 30;
      // In a real app, call API here
      console.log("Auto-refreshing data...");
      loadStats();
    }
  }, 1000);
};

const resetAutoRefresh = () => {
  startTimer();
  console.log("Manual refresh triggered");
};

// --- CHARTS ---
const getThemeColors = () => {
  if (isDark.value) {
    return {
      text: "#e5e6eb",
      line: "#333333",
      tooltipBg: "#1f1f1f",
      tooltipBorder: "#444444",
      barColor: "#409eff",
      pieColors: ["#409eff", "#67c23a"],
    };
  } else {
    return {
      text: "#606266",
      line: "#e4e7ed",
      tooltipBg: "#ffffff",
      tooltipBorder: "#e4e7ed",
      barColor: "#409eff",
      pieColors: ["#409eff", "#67c23a"],
    };
  }
};

const renderHourlyChart = () => {
  if (!hourlyChartRef.value) return;
  if (!hourlyChartInstance)
    hourlyChartInstance = echarts.init(hourlyChartRef.value);

  const colors = getThemeColors();
  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: hourlyData.value.map((h) => h.hour),
      axisLabel: { color: colors.text },
      axisLine: { lineStyle: { color: colors.line } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: colors.text },
      axisLine: { lineStyle: { color: colors.line } },
      splitLine: { lineStyle: { color: colors.line } },
    },
    series: [
      {
        data: hourlyData.value.map((h) => h.count),
        type: "bar",
        itemStyle: {
          color: colors.barColor,
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: colors.text,
        },
      },
    ],
  };
  hourlyChartInstance.setOption(option);
};

const renderMethodChart = () => {
  if (!methodChartRef.value) return;
  if (!methodChartInstance)
    methodChartInstance = echarts.init(methodChartRef.value);

  const colors = getThemeColors();
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}%",
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
    },
    color: colors.pieColors,
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark.value ? "#161618" : "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        data: [
          { value: 65, name: "Giao tận nhà" },
          { value: 35, name: "Nhận tại cửa hàng" },
        ],
      },
    ],
  };
  methodChartInstance.setOption(option);
};

const resizeCharts = () => {
  hourlyChartInstance?.resize();
  methodChartInstance?.resize();
};

watch(isDark, () => {
  nextTick(() => {
    renderHourlyChart();
    renderMethodChart();
  });
});

onMounted(() => {
  startTimer();
  loadStats();
  nextTick(() => {
    renderHourlyChart();
    renderMethodChart();
  });
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
  window.removeEventListener("resize", resizeCharts);
  hourlyChartInstance?.dispose();
  methodChartInstance?.dispose();
});
</script>
