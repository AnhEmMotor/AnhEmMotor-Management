<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, toRaw } from 'vue'
import * as d3 from 'd3'
const props = defineProps({
  revenueData: {
    type: Array,
    required: true,
  },
})
const chartContainer = ref(null)
const drawChart = (data) => {
  if (!chartContainer.value || !data || data.length === 0) return
  const rawData = toRaw(data)
  const container = d3.select(chartContainer.value)
  container.selectAll('*').remove()
  const margin = { top: 30, right: 30, bottom: 40, left: 50 }
  const width = chartContainer.value.clientWidth - margin.left - margin.right
  const height = 350 - margin.top - margin.bottom
  const svg = container
    .append('svg')
    .attr(
      'viewBox',
      `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
    )
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
  const parseDate = d3.timeParse('%Y-%m-%d')
  const processedData = rawData.map((d) => ({
    ...d,
    date: parseDate(d.date),
  }))
  const x = d3
    .scaleTime()
    .domain(d3.extent(processedData, (d) => d.date))
    .range([0, width])
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(processedData, (d) => d.revenue) * 1.1])
    .range([height, 0])
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat('%d/%m')))
  svg.append('g').call(d3.axisLeft(y).tickFormat((d) => `${d} tr`))
  const revenueLine = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.revenue))
    .curve(d3.curveMonotoneX)
  const profitLine = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.profit))
    .curve(d3.curveMonotoneX)
  const lines = [
    { data: processedData, line: revenueLine, color: '#3b82f6' }, // Blue for Revenue
    { data: processedData, line: profitLine, color: '#22c55e' }, // Green for Profit
  ]
  lines.forEach((pathInfo) => {
    const path = svg
      .append('path')
      .datum(pathInfo.data)
      .attr('fill', 'none')
      .attr('stroke', pathInfo.color)
      .attr('stroke-width', 2.5)
      .attr('d', pathInfo.line)
    const totalLength = path.node().getTotalLength()
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
  })
  const legend = svg.append('g').attr('transform', `translate(${width - 150}, -20)`)
  legend.append('rect').attr('x', 0).attr('width', 12).attr('height', 12).attr('fill', '#3b82f6')
  legend.append('text').attr('x', 20).attr('y', 10).text('Doanh thu').style('font-size', '12px')
  legend.append('rect').attr('x', 80).attr('width', 12).attr('height', 12).attr('fill', '#22c55e')
  legend.append('text').attr('x', 100).attr('y', 10).text('Lợi nhuận').style('font-size', '12px')
}
onMounted(() => {
  drawChart(props.revenueData)
})
watch(
  () => props.revenueData,
  (newData) => {
    drawChart(newData)
  },
  { deep: true },
)
</script>
