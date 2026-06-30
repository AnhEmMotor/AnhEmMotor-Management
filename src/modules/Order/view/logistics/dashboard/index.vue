<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="flex items-center gap-3 flex-wrap">
      <ElButton
        v-for="t in ranges"
        :key="t.value"
        :type="t.value === range ? 'primary' : 'default'"
        size="small"
        @click="handleChangeRange(t.value)"
      >
        {{ t.label }}
      </ElButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        :title="$t('logistics.dashboard.fulfillmentWorkload')"
        :count="dashboard.summary.fulfillmentWorkload"
        icon="ri:truck-line"
        iconStyle="bg-primary"
        :class="
          dashboard.summary.fulfillmentWorkloadIsOverload ? 'bg-warning/10' : ''
        "
      />
      <ArtStatsCard
        :title="$t('logistics.dashboard.pendingCod')"
        :count="formatMoney(dashboard.summary.pendingUnreconciledCod)"
        icon="ri:bank-card-line"
        iconStyle="bg-info"
      />
      <ArtStatsCard
        :title="$t('logistics.dashboard.otifRate')"
        :count="`${(dashboard.summary.otifRate * 100).toFixed(1)}%`"
        icon="ri:time-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        :title="$t('logistics.dashboard.returnsClaimsRatio')"
        :count="`${(dashboard.summary.returnsClaimsRate * 100).toFixed(1)}%`"
        icon="ri:arrow-go-back-line"
        iconStyle="bg-danger"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ElCard class="art-table-card">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{
              $t("logistics.dashboard.fulfillmentFunnel")
            }}</span>
          </div>
        </template>

        <div ref="funnelChartRef" class="h-72 w-full"></div>
      </ElCard>

      <ElCard class="art-table-card">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{
              $t("logistics.dashboard.productionShippingCost")
            }}</span>
          </div>
        </template>

        <div ref="costChartRef" class="h-72 w-full"></div>
      </ElCard>
    </div>

    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">{{
            $t("logistics.dashboard.carrierScorecard")
          }}</span>
          <ElButton
            :loading="loading"
            @click="loadData"
            type="primary"
            size="small"
          >
            {{ $t("logistics.dashboard.refresh") }}
          </ElButton>
        </div>
      </template>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="dashboard.carrierScorecard"
        :columns="columns"
        :pagination="{
          current: 1,
          size: dashboard.carrierScorecard.length,
          total: dashboard.carrierScorecard.length,
        }"
      >
        <template #returnsRatio="{ row }">
          {{ (row.returnsRatio * 100).toFixed(1) }}%
        </template>
      </ArtTable>
    </ElCard>

    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-red-500">{{
            $t("logistics.dashboard.exceptionsLog")
          }}</span>
          <span class="text-xs text-red-400"
            >{{ dashboard.exceptions.length }}
            {{ $t("logistics.dashboard.items") }}</span
          >
        </div>
      </template>

      <ElAlert
        v-if="dashboard.exceptions.length === 0"
        type="success"
        show-icon
        :closable="false"
      >
        {{ $t("logistics.dashboard.noExceptions") }}
      </ElAlert>

      <ArtTable
        v-else
        ref="exTableRef"
        :loading="loading"
        :data="dashboard.exceptions"
        :columns="exceptionColumns"
        :pagination="{
          current: 1,
          size: dashboard.exceptions.length,
          total: dashboard.exceptions.length,
        }"
      />
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
import { ElCard, ElButton, ElAlert } from "element-plus";
import { useI18n } from "vue-i18n";
import * as echarts from "echarts";
import type { LogisticsDashboardResponse } from "@/domain/logistics/dashboard.types";
import { LogisticsService } from "@/services/logistics.service";
import { useSettingStore } from "@/application/store/setting";

type ArtTableColumn = any;

defineOptions({ name: "LogisticsDashboard" });

const { t } = useI18n();
const settingStore = useSettingStore();

const ranges = computed(() => [
  { value: "today", label: t("logistics.dashboard.today") },
  { value: "month", label: t("logistics.dashboard.thisMonth") },
  { value: "year", label: t("logistics.dashboard.thisYear") },
]);

type RangeValue = "today" | "month" | "year";
const range = ref<RangeValue>("today");

const loading = ref(false);

const dashboard = ref<LogisticsDashboardResponse>({
  summary: {
    fulfillmentWorkload: 0,
    pendingUnreconciledCod: 0,
    otifRate: 0,
    returnsClaimsRate: 0,
    fulfillmentWorkloadIsOverload: false,
  },
  fulfillmentFunnel: {},
  trends: [],
  carrierScorecard: [],
  exceptions: [],
});

const funnelChartRef = ref<HTMLDivElement | null>(null);
const costChartRef = ref<HTMLDivElement | null>(null);

let funnelChartInstance: echarts.ECharts | null = null;
let costChartInstance: echarts.ECharts | null = null;

const isDark = computed(() => settingStore.systemThemeType === "dark");

const getThemeColors = () => {
  if (isDark.value) {
    return {
      text: "#e5e6eb",
      line: "#333333",
      tooltipBg: "#1f1f1f",
      tooltipBorder: "#444444",
      itemColors: ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"],
    };
  } else {
    return {
      text: "#606266",
      line: "#e4e7ed",
      tooltipBg: "#ffffff",
      tooltipBorder: "#e4e7ed",
      itemColors: ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"],
    };
  }
};

const renderFunnelChart = () => {
  if (!funnelChartRef.value) return;

  if (!funnelChartInstance) {
    funnelChartInstance = echarts.init(funnelChartRef.value);
  }

  const colors = getThemeColors();
  const funnel = dashboard.value.fulfillmentFunnel || {};

  const funnelData = [
    {
      value: funnel.completed || 0,
      name: t("logistics.dashboard.status.completed") || "Thành công",
    },
    {
      value: funnel.shipping || 0,
      name: t("logistics.dashboard.status.shipping") || "Đang giao",
    },
    {
      value: funnel.packing || 0,
      name: t("logistics.dashboard.status.packing") || "Đang đóng gói",
    },
    {
      value: funnel.pendingPickup || 0,
      name: t("logistics.dashboard.status.pendingPickup") || "Chờ nhặt",
    },
    {
      value: funnel.returned || 0,
      name: t("logistics.dashboard.status.returned") || "Đã trả hàng",
    },
  ].filter((item) => item.value > 0);

  if (funnelData.length === 0) {
    funnelData.push({
      value: 0,
      name: t("logistics.dashboard.noData") || "Không có dữ liệu",
    });
  }

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} đơn ({d}%)",
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
    },
    legend: {
      orient: "horizontal",
      bottom: "0%",
      textStyle: { color: colors.text },
    },
    color: colors.itemColors,
    series: [
      {
        name: t("logistics.dashboard.fulfillmentFunnel"),
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark.value ? "#161618" : "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
            color: colors.text,
          },
        },
        labelLine: {
          show: false,
        },
        data: funnelData,
      },
    ],
  };

  funnelChartInstance.setOption(option);
};

const renderCostChart = () => {
  if (!costChartRef.value) return;

  if (!costChartInstance) {
    costChartInstance = echarts.init(costChartRef.value);
  }

  const colors = getThemeColors();
  const trends = dashboard.value.trends || [];

  const dates = trends.map((t) => t.dayLabel);
  const completedCounts = trends.map((t) => t.deliveredCount);
  const shippingCosts = trends.map((t) => t.shippingCost);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "8%",
      top: "12%",
      containLabel: true,
    },
    legend: {
      data: [
        t("logistics.dashboard.deliveredCount"),
        t("logistics.dashboard.shippingCost"),
      ],
      textStyle: { color: colors.text },
      bottom: "0%",
    },
    xAxis: [
      {
        type: "category",
        data: dates,
        axisPointer: { type: "shadow" },
        axisLabel: { color: colors.text },
        axisLine: { lineStyle: { color: colors.line } },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: t("logistics.dashboard.deliveredCount"),
        minInterval: 1,
        axisLabel: { color: colors.text },
        axisLine: { lineStyle: { color: colors.line } },
        splitLine: { lineStyle: { color: colors.line } },
      },
      {
        type: "value",
        name: t("logistics.dashboard.shippingCost") + " (VND)",
        axisLabel: {
          color: colors.text,
          formatter: (value: number) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
            if (value >= 1000) return (value / 1000).toFixed(0) + "K";
            return value.toString();
          },
        },
        axisLine: { lineStyle: { color: colors.line } },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: t("logistics.dashboard.deliveredCount"),
        type: "bar",
        data: completedCounts,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: "#409eff",
        },
      },
      {
        name: t("logistics.dashboard.shippingCost"),
        type: "line",
        yAxisIndex: 1,
        data: shippingCosts,
        smooth: true,
        lineStyle: { width: 3 },
        itemStyle: { color: "#67c23a" },
      },
    ],
  };

  costChartInstance.setOption(option);
};

const resizeCharts = () => {
  funnelChartInstance?.resize();
  costChartInstance?.resize();
};

const handleChartsUpdate = () => {
  nextTick(() => {
    renderFunnelChart();
    renderCostChart();
  });
};

watch(dashboard, handleChartsUpdate, { deep: true });
watch(isDark, handleChartsUpdate);

const columns = computed<ArtTableColumn[]>(() => [
  { label: t("logistics.dashboard.carrier"), prop: "carrier", minWidth: 160 },
  {
    label: t("logistics.dashboard.deliveredCount"),
    prop: "deliveredCount",
    minWidth: 160,
  },
  {
    label: t("logistics.dashboard.avgDeliveryDays"),
    prop: "avgDeliveryDays",
    minWidth: 190,
  },
  {
    label: t("logistics.dashboard.avgShippingCostPerOrder"),
    prop: "avgShippingCostPerOrder",
    minWidth: 190,
  },
  {
    label: t("logistics.dashboard.returnsRatio"),
    prop: "returnsRatio",
    useSlot: true,
    minWidth: 150,
  },
]);

const exceptionColumns = computed<ArtTableColumn[]>(() => [
  { label: t("logistics.dashboard.type"), prop: "type", minWidth: 160 },
  {
    label: t("logistics.dashboard.tracking"),
    prop: "trackingNumber",
    minWidth: 180,
  },
  { label: t("logistics.dashboard.message"), prop: "message", minWidth: 260 },
  {
    label: t("logistics.dashboard.createdAt"),
    prop: "createdAt",
    minWidth: 180,
  },
]);

const handleChangeRange = (value: string) => {
  range.value = value as RangeValue;
  void loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    dashboard.value = await LogisticsService.getDashboard(range.value);
  } finally {
    loading.value = false;
  }
};

const formatMoney = (value: number) => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  } catch {
    return value.toString();
  }
};

onMounted(() => {
  void loadData();
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  funnelChartInstance?.dispose();
  costChartInstance?.dispose();
});
</script>
