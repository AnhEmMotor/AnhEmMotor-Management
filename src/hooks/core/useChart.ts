import { ref, onUnmounted, nextTick, watch, computed, onMounted } from "vue";
import * as echarts from "echarts";
import { storeToRefs } from "pinia";
import { useWindowSize } from "@vueuse/core";
import { useSettingStore } from "@/application/store/setting";
import { getCssVar } from "@/utils/ui";

export interface ChartOptions {
  [key: string]: any;
}

export const useChartOps = () => ({
  chartHeight: "16rem",
  fontSize: 13,
  fontColor: "#999",
  themeColor: getCssVar("--el-color-primary-light-1"),
  colors: [
    getCssVar("--el-color-primary-light-1"),
    "#4ABEFF",
    "#EDF2FF",
    "#14DEBA",
    "#FFAF20",
    "#FA8A6C",
    "#FFAF20",
  ],
});

export function useChart(options: any = {}) {
  const { initOptions = {}, initDelay = 0 } = options;
  const { isDark } = storeToRefs(useSettingStore());
  const chartRef = ref<HTMLElement | null>(null);
  let chartInstance: echarts.ECharts | null = null;
  let currentTheme: "dark" | "light" | null = null;
  let resizeTimer: number | null = null;

  const { width, height } = useWindowSize();

  const initChart = (customOptions: any = {}, clear = false) => {
    if (!chartRef.value) return;

    const theme = isDark.value ? "dark" : "light";

    if (chartInstance && currentTheme !== theme) {
      destroyChart();
    }

    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value, theme, initOptions);
      currentTheme = theme;
    }

    if (clear) {
      chartInstance.clear();
    }

    chartInstance.setOption(customOptions);
  };

  const handleResize = () => {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      chartInstance?.resize();
    }, 100);
  };

  const destroyChart = () => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
      currentTheme = null;
    }
  };

  const getAnimationConfig = (delay = 50, duration = 1500) => ({
    animationDelay: (idx: number) => idx * delay + 200,
    animationDuration: (idx: number) => duration - 50 * idx,
    animationEasing: "exponentialOut" as const,
  });

  const getTooltipStyle = (
    trigger: "axis" | "item" | "none" = "axis",
    extra = {},
  ) => ({
    trigger: trigger as any,
    backgroundColor: isDark.value
      ? "rgba(0, 0, 0, 0.8)"
      : "rgba(255, 255, 255, 0.9)",
    borderColor: isDark.value ? "#333" : "#ddd",
    borderWidth: 1,
    textStyle: {
      color: isDark.value ? "#fff" : "#333",
    },
    ...extra,
  });

  const getAxisLineStyle = (show = true) => ({
    show,
    lineStyle: {
      color: isDark.value ? "#444" : "#EDEDED",
    },
  });

  const getSplitLineStyle = (show = true) => ({
    show,
    lineStyle: {
      color: isDark.value ? "#444" : "#EDEDED",
      type: "dashed" as const,
    },
  });

  const getAxisLabelStyle = (show = true) => {
    const { fontColor, fontSize } = useChartOps();
    return {
      show,
      color: fontColor,
      fontSize,
    };
  };

  const getLegendStyle = (position = "bottom", extra = {}) => {
    const base = {
      textStyle: { color: isDark.value ? "#fff" : "#333" },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      ...extra,
    };

    const posMap: any = {
      bottom: { bottom: 0, left: "center", orient: "horizontal" },
      top: { top: 0, left: "center", orient: "horizontal" },
      left: { left: 0, top: "center", orient: "vertical" },
      right: { right: 0, top: "center", orient: "vertical" },
    };

    return { ...base, ...posMap[position], icon: "roundRect" };
  };

  const getGridWithLegend = (
    showLegend: boolean,
    position = "bottom",
    baseGrid = {},
  ) => {
    const grid = {
      top: 15,
      right: 15,
      bottom: 8,
      left: 0,
      containLabel: true,
      ...baseGrid,
    };

    if (!showLegend) return grid;

    const offsetMap: any = {
      bottom: { bottom: 40 },
      top: { top: 40 },
      left: { left: 120 },
      right: { right: 120 },
    };

    return { ...grid, ...offsetMap[position] };
  };

  watch([width, height], handleResize);

  onMounted(() => {
    if (initDelay > 0) {
      setTimeout(() => initChart(), initDelay);
    }
  });

  onUnmounted(destroyChart);

  return {
    chartRef,
    isDark,
    initChart,
    destroyChart,
    handleResize,
    getAnimationConfig,
    getTooltipStyle,
    getAxisLineStyle,
    getSplitLineStyle,
    getAxisLabelStyle,
    getAxisTickStyle: () => ({ show: false }),
    getLegendStyle,
    getGridWithLegend,
    getChartInstance: () => chartInstance,
  };
}

export function useChartComponent(config: any) {
  const {
    props,
    generateOptions,
    checkEmpty,
    watchSources = [],
    chartOptions = {},
  } = config;
  const chartCore = useChart(chartOptions);
  const { initChart, isDark } = chartCore;

  const isEmpty = computed(
    () => !!props.isEmpty || (!!checkEmpty && checkEmpty()),
  );

  const updateChart = () => {
    nextTick(() => {
      if (isEmpty.value) {
        chartCore.getChartInstance()?.clear();
      } else {
        initChart(generateOptions());
      }
    });
  };

  watch([() => props.data, ...watchSources], updateChart, { deep: true });
  watch(isDark, updateChart);

  onMounted(updateChart);

  return {
    ...chartCore,
    isEmpty,
    updateChart,
  };
}
