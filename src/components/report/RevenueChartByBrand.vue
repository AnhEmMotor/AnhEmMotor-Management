<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  chartData: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const chartContainer = ref(null)

const createChart = (data) => {
  if (!data || data.length === 0 || !chartContainer.value) {
    return
  }

  const container = d3.select(chartContainer.value)

  container.selectAll('*').remove()

  const margin = { top: 20, right: 30, bottom: 40, left: 80 }
  const containerRect = chartContainer.value.getBoundingClientRect()
  const width = containerRect.width - margin.left - margin.right
  const height = containerRect.height - margin.top - margin.bottom

  const svg = container
    .append('svg')
    .attr('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const y = d3
    .scaleBand()
    .range([0, height])
    .domain(data.map((d) => d.brand))
    .padding(0.1)

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.revenue)])
    .range([0, width])

  svg.append('g').call(d3.axisLeft(y))
  svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))

  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('y', (d) => y(d.brand))
    .attr('height', y.bandwidth())
    .attr('fill', '#3b82f6')
    .attr('width', 0)
    .transition()
    .duration(800)
    .attr('width', (d) => x(d.revenue))
}

onMounted(() => {
  createChart(props.chartData)
})

watch(
  () => props.chartData,
  (newData) => {
    createChart(newData)
  },
  { deep: true },
)
</script>
