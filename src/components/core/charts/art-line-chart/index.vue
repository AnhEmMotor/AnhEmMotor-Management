<!-- đườngảnh，chiếctrìđatổDữ liệu，chiếctrìkiểuHoatAnhHiệu quả -->
<template>
  <div
    ref="chartRef"
    class="relative w-[calc(100%+10px)]"
    :style="{ height: props.height }"
    v-loading="props.loading"
  >
  </div>
</template>

<script setup lang="ts">
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import { getCssVar, hexToRgba } from '@/utils/ui'
  import { useChartOps, useChartComponent } from '@/hooks/core/useChart'
  import type { LineChartProps, LineDataItem } from '@/types/component/chart'

  defineOptions({ name: 'ArtLineChart' })

  const props = withDefaults(defineProps<LineChartProps>(), {
    // Cơ bảnCauHinh
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,

    // Dữ liệuCauHinh
    data: () => [0, 0, 0, 0, 0, 0, 0],
    xAxisData: () => [],
    lineWidth: 2.5,
    showAreaColor: false,
    smooth: true,
    symbol: 'none',
    symbolSize: 6,
    animationDelay: 200,

    // TrụcđườngHiển thịCauHinh
    showAxisLabel: true,
    showAxisLine: true,
    showSplitLine: true,

    // nộpCauHinh
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
  })

  // HoatAnhTrạng tháiQuản lý
  const isAnimating = ref(false)
  const animationTimers = ref<number[]>([])
  const animatedData = ref<number[] | LineDataItem[]>([])

  // xóalýnêncóđịnhgiờthiết bị
  const clearAnimationTimers = () => {
    animationTimers.value.forEach((timer) => clearTimeout(timer))
    animationTimers.value = []
  }

  // đoánlàphủvìđaDữ liệu（khiếndùng VueUse của computedEager Tốihóa）
  const isMultipleData = computed(() => {
    return (
      Array.isArray(props.data) &&
      props.data.length > 0 &&
      typeof props.data[0] === 'object' &&
      'name' in props.data[0]
    )
  })

  // Cachekếcủanhấtđạigiá trị，tránhmiễntrùngphụckế
  const maxValue = computed(() => {
    if (isMultipleData.value) {
      const multiData = props.data as LineDataItem[]
      return multiData.reduce((max, item) => {
        if (item.data?.length) {
          const itemMax = Math.max(...item.data)
          return Math.max(max, itemMax)
        }
        return max
      }, 0)
    } else {
      const singleData = props.data as number[]
      return singleData?.length ? Math.max(...singleData) : 0
    }
  })

  // ban đầuđầuhóaHoatAnhDữ liệu（Tốihóa：bớtthiểuđiềuphần tửđoán）
  const initAnimationData = (): number[] | LineDataItem[] => {
    if (isMultipleData.value) {
      const multiData = props.data as LineDataItem[]
      return multiData.map((item) => ({
        ...item,
        data: Array(item.data.length).fill(0)
      }))
    }
    const singleData = props.data as number[]
    return Array(singleData.length).fill(0)
  }

  // phụcchếthậtthựcDữ liệu（Tốihóa：khiếndùngKếtcấuhóakhắc）
  const copyRealData = (): number[] | LineDataItem[] => {
    if (isMultipleData.value) {
      return (props.data as LineDataItem[]).map((item) => ({ ...item, data: [...item.data] }))
    }
    return [...(props.data as number[])]
  }

  // LấyMàu sắcCauHinh（Tốihóa：CacheChuDemàu）
  const primaryColor = computed(() => getCssVar('--el-color-primary'))

  const getColor = (customColor?: string, index?: number): string => {
    if (customColor) return customColor
    if (index !== undefined) return props.colors![index % props.colors!.length]
    return primaryColor.value
  }

  // sinhthànhđồngTênKiểu dáng
  const generateAreaStyle = (item: LineDataItem, color: string) => {
    // nếuquảcó areaStyle CauHinh，hoặcHiểnkiểumởbậtrồiđồngTênMàu sắc，Hiển thịđồngTênKiểu dáng
    if (!item.areaStyle && !item.showAreaColor && !props.showAreaColor) return undefined

    const areaConfig = item.areaStyle || {}
    if (areaConfig.custom) return areaConfig.custom

    return {
      color: new graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: hexToRgba(color, areaConfig.startOpacity || 0.2).rgba
        },
        {
          offset: 1,
          color: hexToRgba(color, areaConfig.endOpacity || 0.02).rgba
        }
      ])
    }
  }

  // sinhthànhđơnDữ liệuđồngTênKiểu dáng
  const generateSingleAreaStyle = () => {
    if (!props.showAreaColor) return undefined

    const color = getColor(props.colors[0])
    return {
      color: new graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: hexToRgba(color, 0.2).rgba
        },
        {
          offset: 1,
          color: hexToRgba(color, 0.02).rgba
        }
      ])
    }
  }

  // xâyhệcộtCauHinh
  const createSeriesItem = (config: {
    name?: string
    data: number[]
    color?: string
    smooth?: boolean
    symbol?: string
    symbolSize?: number
    lineWidth?: number
    areaStyle?: any
  }) => {
    return {
      name: config.name,
      data: config.data,
      type: 'line' as const,
      color: config.color,
      smooth: config.smooth ?? props.smooth,
      symbol: config.symbol ?? props.symbol,
      symbolSize: config.symbolSize ?? props.symbolSize,
      lineStyle: {
        width: config.lineWidth ?? props.lineWidth,
        color: config.color
      },
      areaStyle: config.areaStyle,
      emphasis: {
        focus: 'series' as const,
        lineStyle: {
          width: (config.lineWidth ?? props.lineWidth) + 1
        }
      }
    }
  }

  // sinhthànhBiểu đồCauHinh
  const generateChartOptions = (isInitial = false): EChartsOption => {
    const options: EChartsOption = {
      animation: true,
      animationDuration: isInitial ? 0 : 1300,
      animationDurationUpdate: isInitial ? 0 : 1300,
      grid: getGridWithLegend(props.showLegend && isMultipleData.value, props.legendPosition, {
        top: 15,
        right: 15,
        left: 0
      }),
      tooltip: props.showTooltip ? getTooltipStyle() : undefined,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.xAxisData,
        axisTick: getAxisTickStyle(),
        axisLine: getAxisLineStyle(props.showAxisLine),
        axisLabel: getAxisLabelStyle(props.showAxisLabel)
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxValue.value,
        axisLabel: getAxisLabelStyle(props.showAxisLabel),
        axisLine: getAxisLineStyle(props.showAxisLine),
        splitLine: getSplitLineStyle(props.showSplitLine)
      }
    }

    // Thêm mớiảnhví dụCauHinh
    if (props.showLegend && isMultipleData.value) {
      options.legend = getLegendStyle(props.legendPosition)
    }

    // sinhthànhhệcộtDữ liệu
    if (isMultipleData.value) {
      const multiData = animatedData.value as LineDataItem[]
      options.series = multiData.map((item, index) => {
        const itemColor = getColor(props.colors[index], index)
        const areaStyle = generateAreaStyle(item, itemColor)

        return createSeriesItem({
          name: item.name,
          data: item.data,
          color: itemColor,
          smooth: item.smooth,
          symbol: item.symbol,
          lineWidth: item.lineWidth,
          areaStyle
        })
      })
    } else {
      // đơnDữ liệutình
      const singleData = animatedData.value as number[]
      const computedColor = getColor(props.colors[0])
      const areaStyle = generateSingleAreaStyle()

      options.series = [
        createSeriesItem({
          data: singleData,
          color: computedColor,
          areaStyle
        })
      ]
    }

    return options
  }

  // Cập nhậtBiểu đồ
  const updateChartOptions = (options: EChartsOption) => {
    initChart(options)
  }

  // ban đầuđầuhóaHoatAnhHàm（Tốihóa：thốngmộtđịnhgiờthiết bịQuản lý，bớtthiểutrongtồn）
  const initChartWithAnimation = () => {
    clearAnimationTimers()
    isAnimating.value = true

    // ban đầuđầuhóavì0giá trịDữ liệu
    animatedData.value = initAnimationData()
    updateChartOptions(generateChartOptions(true))

    if (isMultipleData.value) {
      // đaDữ liệukiểuHoatAnh
      const multiData = props.data as LineDataItem[]
      const currentAnimatedData = animatedData.value as LineDataItem[]

      multiData.forEach((item, index) => {
        const timer = window.setTimeout(
          () => {
            currentAnimatedData[index] = { ...item, data: [...item.data] }
            animatedData.value = [...currentAnimatedData]
            updateChartOptions(generateChartOptions(false))
          },
          index * props.animationDelay + 100
        )

        animationTimers.value.push(timer)
      })

      // tiêughiHoatAnhhoànthành
      const totalDelay = (multiData.length - 1) * props.animationDelay + 1500
      const finishTimer = window.setTimeout(() => {
        isAnimating.value = false
      }, totalDelay)
      animationTimers.value.push(finishTimer)
    } else {
      // đơnDữ liệurútđơnHoatAnh - khiếndùng nextTick Đảm bảoban đầuđầuTrạng tháiĐãRender
      nextTick(() => {
        animatedData.value = copyRealData()
        updateChartOptions(generateChartOptions(false))
        isAnimating.value = false
      })
    }
  }

  // khôngDữ liệuTìmHàm
  const checkIsEmpty = () => {
    // TìmđơnDữ liệutình
    if (Array.isArray(props.data) && typeof props.data[0] === 'number') {
      const singleData = props.data as number[]
      return !singleData.length || singleData.every((val) => val === 0)
    }

    // TìmđaDữ liệutình
    if (Array.isArray(props.data) && typeof props.data[0] === 'object') {
      const multiData = props.data as LineDataItem[]
      return (
        !multiData.length ||
        multiData.every((item) => !item.data?.length || item.data.every((val) => val === 0))
      )
    }

    return true
  }

  // khiếndùngmớicủaBiểu đồComponenttượng
  const {
    chartRef,
    initChart,
    getAxisLineStyle,
    getAxisLabelStyle,
    getAxisTickStyle,
    getSplitLineStyle,
    getTooltipStyle,
    getLegendStyle,
    getGridWithLegend,
    isEmpty
  } = useChartComponent({
    props,
    checkEmpty: checkIsEmpty,
    watchSources: [() => props.data, () => props.xAxisData, () => props.colors],
    onVisible: () => {
      // khiBiểu đồbiếnvìHiển thịgiờ，TìmlàphủvìkhôngDữ liệu
      if (!isEmpty.value) {
        initChartWithAnimation()
      }
    },
    generateOptions: () => generateChartOptions(false)
  })

  // Biểu đồRenderHàm（Tốihóa：PhòngthúcHoatAnhkỳgiantrùngphụcKích hoạt）
  const renderChart = () => {
    if (!isAnimating.value && !isEmpty.value) {
      initChartWithAnimation()
    }
  }

  // khiếndùng VueUse của watchDebounced TốihóaDữ liệuLắng nghe（tránhmiễnphimCập nhật）
  watch([() => props.data, () => props.xAxisData, () => props.colors], renderChart, { deep: true })

  // sinhmệnhtuầnkỳ
  onMounted(() => {
    renderChart()
  })

  onBeforeUnmount(() => {
    clearAnimationTimers()
  })
</script>
