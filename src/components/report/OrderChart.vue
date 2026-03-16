<template>
  <div class="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-4">
    <!-- Pie Chart Container -->
    <div ref="pieContainer" class="w-full sm:w-1/2 md:w-5/12 h-48 sm:h-full shrink-0 flex flex-col items-center justify-center relative"></div>

    <!-- Custom Vue Legend -->
    <div class="w-full sm:w-1/2 md:w-7/12 flex-1 mt-2 sm:mt-0 px-2 sm:px-4 max-h-48 sm:max-h-full overflow-y-auto no-scrollbar">
      <div class="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 gap-y-3 gap-x-2">
        <template v-for="(item, index) in validOrderData" :key="index">
          <div class="flex items-center gap-2 text-xs sm:text-sm">
            <div class="w-3 h-3 sm:w-4 sm:h-4 rounded shrink-0" :style="{ backgroundColor: item.color || '#d1d5db' }"></div>
            <span class="text-gray-700 truncate" :title="item.status">{{ item.status }}</span>
            <span class="font-semibold text-gray-900 ml-auto">{{ item.value }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, toRaw, computed } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  orderData: {
    type: Array,
    required: true,
  },
})

const pieContainer = ref(null)
let resizeObserver = null

const validOrderData = computed(() => {
  if (!props.orderData) return []
  /*
   * Optionally filter out 0 values if you prefer, but legend might want to show them 
   * Let's keep all or specifically sort them by value
   */
  return [...props.orderData].sort((a, b) => b.value - a.value).filter(x => x.value > 0)
})

const drawChart = (data) => {
  if (!pieContainer.value || !data || data.length === 0) return
  const rawData = toRaw(data).filter(d => d.value > 0)

  const container = d3.select(pieContainer.value)
  container.selectAll('*').remove()

  const width = pieContainer.value.clientWidth
  const height = pieContainer.value.clientHeight
  const radius = Math.min(width, height) / 2 - 5

  if (width <= 0 || height <= 0) return

  const svg = container
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null)

  const arc = d3
    .arc()
    .innerRadius(radius * 0.55)
    .outerRadius(radius)

  if (rawData.length === 0) return

  const arcs = svg.selectAll('.arc').data(pie(rawData)).enter().append('g').attr('class', 'arc')

  arcs
    .append('path')
    .attr('d', arc)
    .attr('fill', (d) => d.data.color || '#d1d5db')
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .transition()
    .duration(1000)
    .attrTween('d', (d) => {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
      return (t) => arc(i(t))
    })

  const totalOrders = d3.sum(rawData, (d) => d.value)

  svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.1em')
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('fill', '#1f2937')
    .text(totalOrders)

  svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.3em')
    .style('font-size', '12px')
    .style('fill', '#6b7280')
    .text('Tổng đơn')
}

onMounted(() => {
  drawChart(props.orderData)

  resizeObserver = new ResizeObserver(() => {
    drawChart(props.orderData)
  })

  if (pieContainer.value) {
    resizeObserver.observe(pieContainer.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(
  () => props.orderData,
  (newData) => {
    drawChart(newData)
  },
  { deep: true },
)
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
