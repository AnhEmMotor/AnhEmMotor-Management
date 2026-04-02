<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  keys: {
    type: Array,
    default: () => ['inStock', 'lowStock', 'outOfStock'],
  },
  labels: {
    type: Array,
    default: () => ['Còn hàng', 'Sắp hết', 'Hết hàng'],
  },
  colors: {
    type: Array,
    default: () => ['#FECACA', '#F87171', '#DC2626'],
  },
})

const chartRef = ref(null)
const containerRef = ref(null)
let resizeObserver = null

const margin = { top: 20, right: 20, bottom: 40, left: 50 }

const drawChart = () => {
  if (!chartRef.value || !containerRef.value || !props.data.length) return

  d3.select(chartRef.value).selectAll('*').remove()

  const containerWidth = containerRef.value.clientWidth
  const width = containerWidth - margin.left - margin.right
  const height = 280 - margin.top - margin.bottom

  const svg = d3
    .select(chartRef.value)
    .attr('width', containerWidth)
    .attr('height', 280)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const stack = d3.stack().keys(props.keys)
  const stackedData = stack(props.data)

  const x = d3
    .scaleBand()
    .domain(props.data.map((d) => d.name))
    .range([0, width])
    .padding(0.35)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1]) * 1.1])
    .nice()
    .range([height, 0])

  const color = d3.scaleOrdinal().domain(props.keys).range(props.colors)

  svg
    .selectAll('g.layer')
    .data(stackedData)
    .join('g')
    .attr('class', 'layer')
    .attr('fill', (d) => color(d.key))
    .selectAll('rect')
    .data((d) => d)
    .join('rect')
    .attr('x', (d) => x(d.data.name))
    .attr('y', (d) => y(d[1]))
    .attr('height', (d) => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth())
    .attr('rx', 4)

  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select('.domain')
    .remove()

  svg
    .selectAll('.tick text')
    .attr('fill', '#6B7280')
    .attr('font-size', '12px')
    .attr('dy', '12px')

  svg
    .append('g')
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat(d3.format('d'))
        .tickSize(-width),
    )
    .select('.domain')
    .remove()

  svg.selectAll('.tick line').attr('stroke', '#E5E7EB').attr('stroke-dasharray', '3,3')
  svg.selectAll('.tick text').attr('fill', '#6B7280').attr('font-size', '11px')
}

const legendItems = computed(() =>
  props.keys.map((key, i) => ({
    key,
    label: props.labels[i],
    color: props.colors[i],
  })),
)

onMounted(() => {
  drawChart()
  resizeObserver = new ResizeObserver(() => drawChart())
  if (containerRef.value) resizeObserver.observe(containerRef.value)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

watch(() => props.data, drawChart, { deep: true })
</script>

<template>
  <div ref="containerRef" class="w-full">
    <div class="flex items-center gap-4 mb-3">
      <div v-for="item in legendItems" :key="item.key" class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm inline-block" :style="{ backgroundColor: item.color }"></span>
        <span class="text-xs text-gray-500">{{ item.label }}</span>
      </div>
    </div>
    <svg ref="chartRef"></svg>
  </div>
</template>
