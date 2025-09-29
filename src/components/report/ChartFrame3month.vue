<template>
  <div class="chart-wrapper">
    <div ref="chartContainer" class="chart-container"></div>
    <div ref="tooltip" class="tooltip"></div>
  </div>
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
const tooltip = ref(null)
const drawChart = (data) => {
  if (!chartContainer.value || !data || data.length === 0) return
  const rawData = toRaw(data)
  const container = d3.select(chartContainer.value)
  container.selectAll('*').remove()
  const margin = { top: 30, right: 30, bottom: 30, left: 50 }
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
  const subgroups = ['revenue', 'profit']
  const groups = rawData.map((d) => d.month)
  const x0 = d3.scaleBand().domain(groups).range([0, width]).padding(0.2)
  const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05)
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(rawData, (d) => d.revenue) * 1.1])
    .range([height, 0])
  const color = d3.scaleOrdinal().domain(subgroups).range(['#e53e3e', '#22c55e'])
  svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x0))
  svg.append('g').call(d3.axisLeft(y).tickFormat((d) => `${d} tr`))
  const tooltipDiv = d3.select(tooltip.value)
  const monthGroup = svg
    .selectAll('.month-group')
    .data(rawData)
    .enter()
    .append('g')
    .attr('class', 'month-group')
    .attr('transform', (d) => `translate(${x0(d.month)},0)`)
  monthGroup
    .selectAll('rect')
    .data((d) => subgroups.map((key) => ({ key, value: d[key] })))
    .enter()
    .append('rect')
    .attr('x', (d) => x1(d.key))
    .attr('y', height)
    .attr('width', x1.bandwidth())
    .attr('height', 0)
    .attr('fill', (d) => color(d.key))
    .on('mouseover', function (event, d) {
      tooltipDiv.transition().duration(200).style('opacity', 0.9)
      tooltipDiv
        .html(
          `<strong>${d.key === 'revenue' ? 'Doanh thu' : 'Lợi nhuận'}</strong><br/>${d.value} triệu`,
        )
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px')
      d3.select(this).style('opacity', 0.7)
    })
    .on('mouseout', function () {
      tooltipDiv.transition().duration(500).style('opacity', 0)
      d3.select(this).style('opacity', 1)
    })
    .transition()
    .duration(800)
    .attr('y', (d) => y(d.value))
    .attr('height', (d) => height - y(d.value))
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

<style scoped>
.tooltip {
  position: absolute;
  text-align: center;
  padding: 8px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
}
</style>
