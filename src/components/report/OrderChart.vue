<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, toRaw } from 'vue'
import * as d3 from 'd3'
const props = defineProps({
  orderData: {
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
  const width = chartContainer.value.clientWidth
  const height = 350
  const radius = Math.min(width, height) / 2 - 20
  const svg = container
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)
  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null)
  const arc = d3
    .arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius)
  const arcs = svg.selectAll('.arc').data(pie(rawData)).enter().append('g').attr('class', 'arc')
  arcs
    .append('path')
    .attr('d', arc)
    .attr('fill', (d) => d.data.color)
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
    .attr('dy', '-0.5em')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .text(totalOrders)
  svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.0em')
    .style('font-size', '14px')
    .text('Tổng đơn')
  const legend = svg
    .selectAll('.legend')
    .data(rawData)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${-width / 2 + 20}, ${-height / 2 + 20 + i * 25})`)
  legend
    .append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', (d) => d.color)
    .attr('rx', 4)
  legend
    .append('text')
    .attr('x', 24)
    .attr('y', 13)
    .text((d) => d.status)
    .style('font-size', '14px')
}
onMounted(() => {
  drawChart(props.orderData)
})
watch(
  () => props.orderData,
  (newData) => {
    drawChart(newData)
  },
  { deep: true },
)
</script>
