<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  color: {
    type: String,
    default: '#DC2626',
  },
  formatValue: {
    type: Function,
    default: (v) => `${v} tr`,
  },
})

const chartRef = ref(null)
const containerRef = ref(null)
let resizeObserver = null

const drawChart = () => {
  if (!chartRef.value || !containerRef.value || !props.data.length) return

  d3.select(chartRef.value).selectAll('*').remove()

  const margin = { top: 5, right: 60, bottom: 5, left: 120 }
  const containerWidth = containerRef.value.clientWidth
  const barHeight = 28
  const gap = 8
  const height = props.data.length * (barHeight + gap) - gap + margin.top + margin.bottom
  const width = containerWidth - margin.left - margin.right

  const svg = d3
    .select(chartRef.value)
    .attr('width', containerWidth)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d[props.valueKey]) * 1.1])
    .range([0, width])

  const y = d3
    .scaleBand()
    .domain(props.data.map((d) => d[props.labelKey]))
    .range([0, height - margin.top - margin.bottom])
    .padding(0.2)

  svg
    .selectAll('rect.bg')
    .data(props.data)
    .join('rect')
    .attr('class', 'bg')
    .attr('x', 0)
    .attr('y', (d) => y(d[props.labelKey]))
    .attr('width', width)
    .attr('height', y.bandwidth())
    .attr('fill', '#F3F4F6')
    .attr('rx', 4)

  svg
    .selectAll('rect.bar')
    .data(props.data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d) => y(d[props.labelKey]))
    .attr('width', 0)
    .attr('height', y.bandwidth())
    .attr('fill', props.color)
    .attr('rx', 4)
    .transition()
    .duration(800)
    .attr('width', (d) => x(d[props.valueKey]))

  svg
    .selectAll('text.label')
    .data(props.data)
    .join('text')
    .attr('class', 'label')
    .attr('x', -8)
    .attr('y', (d) => y(d[props.labelKey]) + y.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#374151')
    .attr('font-size', '12px')
    .text((d) => {
      const label = d[props.labelKey]
      return label.length > 16 ? `${label.slice(0, 16)}…` : label
    })

  svg
    .selectAll('text.value')
    .data(props.data)
    .join('text')
    .attr('class', 'value')
    .attr('x', (d) => x(d[props.valueKey]) + 6)
    .attr('y', (d) => y(d[props.labelKey]) + y.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#6B7280')
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .text((d) => props.formatValue(d[props.valueKey]))
}

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
    <svg ref="chartRef"></svg>
  </div>
</template>
