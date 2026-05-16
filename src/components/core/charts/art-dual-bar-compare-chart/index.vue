<!-- Biểu đồ cột chồng hai chiều -->
<template>
  <div ref="chartRef" :style="{ height: props.height }" v-loading="props.loading"> </div>
</template>

<script setup lang="ts">
  import { useChartOps, useChartComponent } from '@/hooks/core/useChart'
  import type { EChartsOption, BarSeriesOption } from '@/plugins/echarts'
  import type { BidirectionalBarChartProps } from '@/types/component/chart'

  defineOptions({ name: 'ArtDualBarCompareChart' })

  const props = withDefaults(defineProps<BidirectionalBarChartProps>(), {
    // Cơ bảnCauHinh
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,

    // Dữ liệuCauHinh
    positiveData: () => [],
    negativeData: () => [],
    xAxisData: () => [],
    positiveName: 'đúnghướngDữ liệu',
    negativeName: 'hướngDữ liệu',
    barWidth: 16,
    yAxisMin: -100,
    yAxisMax: 100,

    // Kiểu dángCauHinh
    showDataLabel: false,
    positiveBorderRadius: () => [10, 10, 0, 0],
    negativeBorderRadius: () => [0, 0, 10, 10],

    // TrụcđườngHiển thịCauHinh
    showAxisLabel: true,
    showAxisLine: false,
    showSplitLine: false,

    // nộpCauHinh
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
  })

  // xâyhệcộtCauHinhcủagiúpHàm
  const createSeriesConfig = (config: {
    name: string
    data: number[]
    borderRadius: number | number[]
    labelPosition: 'top' | 'bottom'
    colorIndex: number
    formatter?: (params: unknown) => string
  }): BarSeriesOption => {
    const { fontColor } = useChartOps()
    const animationConfig = getAnimationConfig()

    return {
      name: config.name,
      type: 'bar',
      stack: 'total',
      barWidth: props.barWidth,
      barGap: '-100%',
      data: config.data,
      itemStyle: {
        borderRadius: config.borderRadius,
        color: props.colors[config.colorIndex]
      },
      label: {
        show: props.showDataLabel,
        position: config.labelPosition,
        formatter:
          config.formatter ||
          ((params: unknown) => String((params as Record<string, unknown>).value)),
        color: fontColor,
        fontSize: 12
      },
      ...animationConfig
    }
  }

  // khiếndùngBiểu đồComponenttượng
  const {
    chartRef,
    getAxisLineStyle,
    getAxisLabelStyle,
    getAxisTickStyle,
    getSplitLineStyle,
    getAnimationConfig,
    getTooltipStyle,
    getLegendStyle,
    getGridWithLegend
  } = useChartComponent({
    props,
    checkEmpty: () => {
      return (
        props.isEmpty ||
        !props.positiveData.length ||
        !props.negativeData.length ||
        (props.positiveData.every((val) => val === 0) &&
          props.negativeData.every((val) => val === 0))
      )
    },
    watchSources: [
      () => props.positiveData,
      () => props.negativeData,
      () => props.xAxisData,
      () => props.colors
    ],
    generateOptions: (): EChartsOption => {
      // XuLyhướngDữ liệu，Đảm bảovìgiá trị
      const processedNegativeData = props.negativeData.map((val) => (val > 0 ? -val : val))

      // TốihóacủaGridCauHinh
      const gridConfig = {
        top: props.showLegend ? 50 : 20,
        right: 0,
        left: 0,
        bottom: 0, // ThêmthêmPhía dướigian
        containLabel: true
      }

      const options: EChartsOption = {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        grid: getGridWithLegend(props.showLegend, props.legendPosition, gridConfig),

        // TốihóacủaGợi ýKhungCauHinh
        tooltip: props.showTooltip
          ? {
              ...getTooltipStyle(),
              trigger: 'axis',
              axisPointer: {
                type: 'none' // đichiathịđường
              }
            }
          : undefined,

        // ảnhví dụCauHinh
        legend: props.showLegend
          ? {
              ...getLegendStyle(props.legendPosition),
              data: [props.negativeName, props.positiveName]
            }
          : undefined,

        // XTrụcCauHinh
        xAxis: {
          type: 'category',
          data: props.xAxisData,
          axisTick: getAxisTickStyle(),
          axisLine: getAxisLineStyle(props.showAxisLine),
          axisLabel: getAxisLabelStyle(props.showAxisLabel),
          boundaryGap: true
        },

        // YTrụcCauHinh
        yAxis: {
          type: 'value',
          min: props.yAxisMin,
          max: props.yAxisMax,
          axisLabel: getAxisLabelStyle(props.showAxisLabel),
          axisLine: getAxisLineStyle(props.showAxisLine),
          splitLine: getSplitLineStyle(props.showSplitLine)
        },

        // hệcộtCauHinh
        series: [
          // hướngDữ liệuhệcột
          createSeriesConfig({
            name: props.negativeName,
            data: processedNegativeData,
            borderRadius: props.negativeBorderRadius,
            labelPosition: 'bottom',
            colorIndex: 1,
            formatter: (params: unknown) =>
              String(Math.abs((params as Record<string, unknown>).value as number))
          }),
          // đúnghướngDữ liệuhệcột
          createSeriesConfig({
            name: props.positiveName,
            data: props.positiveData,
            borderRadius: props.positiveBorderRadius,
            labelPosition: 'top',
            colorIndex: 0
          })
        ]
      }

      return options
    }
  })
</script>
