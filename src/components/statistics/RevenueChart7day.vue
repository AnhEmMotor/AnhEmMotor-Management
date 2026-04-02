<template>
  <div ref="chartContainer" class="chart-container relative"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  revenueData: {
    type: Array,
    required: true,
  },
})

const chartContainer = ref(null)
let resizeObserver = null

const drawChart = (data) => {
  if (!chartContainer.value || !data || data.length === 0) return
  const rawData = toRaw(data)
  const container = d3.select(chartContainer.value)
  container.selectAll('*').remove()

  const margin = { top: 20, right: 20, bottom: 40, left: 55 }
  const width = chartContainer.value.clientWidth - margin.left - margin.right
  const height = 300 - margin.top - margin.bottom

  const svg = container
    .append('svg')
    .attr('width', chartContainer.value.clientWidth)
    .attr('height', 300)
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
    .domain([0, d3.max(processedData, (d) => d.revenue) * 1.15])
    .nice()
    .range([height, 0])

  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat('%d/%m')).tickSize(0))
    .select('.domain')
    .remove()

  svg
    .selectAll('.tick text')
    .attr('fill', '#6B7280')
    .attr('font-size', '11px')
    .attr('dy', '12px')

  svg
    .append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d} tr`).tickSize(-width))
    .select('.domain')
    .remove()

  svg.selectAll('.tick line').attr('stroke', '#E5E7EB').attr('stroke-dasharray', '3,3')
  svg.selectAll('.tick text').attr('fill', '#6B7280').attr('font-size', '11px')

  const revenueArea = d3
    .area()
    .x((d) => x(d.date))
    .y0(height)
    .y1((d) => y(d.revenue))
    .curve(d3.curveMonotoneX)

  svg
    .append('path')
    .datum(processedData)
    .attr('fill', 'rgba(239, 68, 68, 0.08)')
    .attr('d', revenueArea)

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
    { data: processedData, line: revenueLine, color: '#DC2626', label: 'Doanh thu' },
    { data: processedData, line: profitLine, color: '#F87171', label: 'Lợi nhuận' },
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
      .duration(1200)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
  })

  const tooltip = container
    .append('div')
    .attr('class', 'chart-tooltip')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('background', 'white')
    .style('border', '1px solid #E5E7EB')
    .style('border-radius', '8px')
    .style('padding', '10px 14px')
    .style('font-size', '12px')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')
    .style('z-index', '10')

  const verticalLine = svg
    .append('line')
    .attr('stroke', '#D1D5DB')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,4')
    .style('display', 'none')

  const bisect = d3.bisector((d) => d.date).left

  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'transparent')
    .on('mousemove', (event) => {
      const [mx] = d3.pointer(event)
      const x0 = x.invert(mx)
      const i = bisect(processedData, x0, 1)
      const d0 = processedData[i - 1]
      const d1 = processedData[i]
      if (!d0) return
      const d = d1 && x0 - d0.date > d1.date - x0 ? d1 : d0
      const formatDate = d3.timeFormat('%d/%m/%Y')

      tooltip
        .style('display', 'block')
        .style('left', `${x(d.date) + margin.left + 15}px`)
        .style('top', `${y(d.revenue) + margin.top - 10}px`)
        .html(
          `<div style="font-weight:600;color:#374151;margin-bottom:4px">${formatDate(d.date)}</div>` +
            `<div style="color:#DC2626">Doanh thu: <b>${d.revenue} tr</b></div>` +
            `<div style="color:#F87171">Lợi nhuận: <b>${d.profit} tr</b></div>`,
        )

      verticalLine
        .style('display', 'block')
        .attr('x1', x(d.date))
        .attr('x2', x(d.date))
        .attr('y1', 0)
        .attr('y2', height)
    })
    .on('mouseleave', () => {
      tooltip.style('display', 'none')
      verticalLine.style('display', 'none')
    })

  const legend = svg
    .append('g')
    .attr('transform', `translate(${width - 180}, -10)`)

  lines.forEach((l, i) => {
    const g = legend.append('g').attr('transform', `translate(${i * 100}, 0)`)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', 16)
      .attr('y1', 5)
      .attr('y2', 5)
      .attr('stroke', l.color)
      .attr('stroke-width', 2.5)
    g.append('text')
      .attr('x', 22)
      .attr('y', 9)
      .text(l.label)
      .style('font-size', '11px')
      .style('fill', '#6B7280')
  })
}

onMounted(() => {
  drawChart(props.revenueData)
  resizeObserver = new ResizeObserver(() => drawChart(props.revenueData))
  if (chartContainer.value) resizeObserver.observe(chartContainer.value)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

watch(() => props.revenueData, (newData) => drawChart(newData), { deep: true })
</script>
