<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  colors: {
    type: Array,
    default: () => ['#FECACA', '#F87171', '#DC2626'],
  },
  centerLabel: {
    type: String,
    default: '',
  },
  centerValue: {
    type: [String, Number],
    default: '',
  },
})

const chartRef = ref(null)
const containerRef = ref(null)
let resizeObserver = null

const drawChart = () => {
  if (!chartRef.value || !containerRef.value || !props.data.length) return

  d3.select(chartRef.value).selectAll('*').remove()

  const size = Math.min(containerRef.value.clientWidth, 280)
  const radius = size / 2
  const innerRadius = radius * 0.6

  const svg = d3
    .select(chartRef.value)
    .attr('width', size)
    .attr('height', size)
    .append('g')
    .attr('transform', `translate(${radius},${radius})`)

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null)
    .padAngle(0.03)

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius - 8).cornerRadius(4)

  const color = d3.scaleOrdinal().range(props.colors)

  svg
    .selectAll('path')
    .data(pie(props.data))
    .join('path')
    .attr('d', arc)
    .attr('fill', (d, i) => color(i))
    .attr('stroke', 'white')
    .attr('stroke-width', 2)

  if (props.centerValue) {
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', '#374151')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text(props.centerValue)

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .text(props.centerLabel)
  }
}

const legendItems = computed(() =>
  props.data.map((item, i) => ({
    label: item.label,
    value: item.value,
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
  <div ref="containerRef" class="w-full flex flex-col items-center">
    <svg ref="chartRef"></svg>
    <div class="flex flex-wrap justify-center gap-4 mt-4">
      <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm inline-block" :style="{ backgroundColor: item.color }"></span>
        <span class="text-xs text-gray-500">{{ item.label }} ({{ item.value }})</span>
      </div>
    </div>
  </div>
</template>
