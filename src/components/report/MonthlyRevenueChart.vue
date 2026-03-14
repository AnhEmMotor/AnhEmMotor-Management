<template>
  <div class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md h-80 sm:h-96 flex flex-col">
    <div class="flex items-center justify-between mb-4 shrink-0">
      <h3 class="text-base sm:text-lg font-semibold text-gray-700">So Sánh Doanh Thu Theo Tháng</h3>
      <span class="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">{{ new Date().getFullYear() }}</span>
    </div>
    <div ref="chartContainer" class="w-full h-full min-h-[220px] sm:min-h-[250px] flex-1 relative min-w-0"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  monthlyData: {
    type: Array,
    required: true,
  },
})

const chartContainer = ref(null)
let resizeObserver = null

const drawChart = (data) => {
  if (!chartContainer.value || !data || data.length === 0) return
  const rawData = toRaw(data).slice(-12) // Giới hạn 12 tháng gần nhất
  const container = d3.select(chartContainer.value)
  container.selectAll('*').remove()

  const cw = chartContainer.value.clientWidth
  const ch = chartContainer.value.clientHeight || 250
  
  const isMobile = cw < 500
  const margin = { top: isMobile ? 35 : 20, right: 10, bottom: 25, left: 45 }

  const width = Math.max(0, cw - margin.left - margin.right)
  const height = Math.max(0, ch - margin.top - margin.bottom)

  if (width <= 0 || height <= 0) return

  const svg = container
    .append('svg')
    .attr('width', cw)
    .attr('height', ch)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // X scale mapping (Theo Nhãn Tháng)
  const x0 = d3
    .scaleBand()
    .domain(rawData.map((d) => d.reportMonth))
    .range([0, width])
    .padding(0.2)

  // Sub-scale cho 2 cột Doanh thu & Lợi nhuận nằm sát nhau trong 1 tháng
  const categories = ['revenue', 'profit']
  const x1 = d3
    .scaleBand()
    .domain(categories)
    .range([0, x0.bandwidth()])
    .padding(0.05)

  // Y Scale value mapping
  const maxVal = d3.max(rawData, (d) => Math.max(d.totalRevenue || 0, d.totalProfit || 0))
  const y = d3
    .scaleLinear()
    .domain([0, maxVal * 1.1])
    .nice()
    .range([height, 0])

  // Custom Colors
  const getFill = (category) => (category === 'revenue' ? '#DC2626' : '#F87171')

  // Add Y axis lines
  svg.selectAll('.y-grid-line')
    .data(y.ticks(5))
    .enter()
    .append('line')
    .attr('class', 'y-grid-line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))
    .attr('stroke', '#E5E7EB')
    .attr('stroke-dasharray', '3,3')

  // Y axis labels
  svg
    .append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${(d / 1000000).toFixed(0)}M`).tickSize(0))
    .select('.domain')
    .remove()

  svg.selectAll('.tick text').attr('fill', '#6B7280').attr('font-size', '10px').attr('dx', '-5px')

  // X axis
  const parseMonth = (str) => {
    if (!str) return ''
    const parts = str.split('-') // Expected "2024-03" -> "T3"
    return parts.length > 1 ? `T${parseInt(parts[1])}` : str
  }

  // Optimize label density based on screen
  const skipMod = isMobile ? Math.ceil(rawData.length / 6) : 1
  
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x0)
      .tickFormat((d, i) => (i % skipMod === 0 ? parseMonth(d) : ''))
      .tickSize(4)
    )
    .select('.domain')
    .attr('stroke', '#D1D5DB')

  svg.selectAll('.tick line').attr('stroke', '#D1D5DB')

  // Bars Group
  const monthGroups = svg
    .selectAll('.month-group')
    .data(rawData)
    .enter()
    .append('g')
    .attr('class', 'month-group')
    .attr('transform', (d) => `translate(${x0(d.reportMonth)},0)`)

  // Draw Bars
  categories.forEach(category => {
    monthGroups.selectAll(`.bar-${category}`)
    .data((d) => [d])
    .enter()
    .append('rect')
    .attr('class', `bar-${category}`)
    .attr('x', x1(category))
    .attr('y', height)
    .attr('width', x1.bandwidth())
    .attr('height', 0)
    .attr('fill', getFill(category))
    .attr('rx', 3) // Rounded corners at top
    .attr('ry', 3)
    .transition()
    .duration(800)
    .delay((d, i) => i * 40)
    .attr('y', (d) => y(category === 'revenue' ? (d.totalRevenue || 0) : (d.totalProfit || 0)))
    .attr('height', (d) => Math.max(0, height - y(category === 'revenue' ? (d.totalRevenue || 0) : (d.totalProfit || 0))))
  })

  // Tooltip
  const tooltip = container
    .append('div')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('background', 'white')
    .style('border', '1px solid #E5E7EB')
    .style('border-radius', '8px')
    .style('padding', '8px 12px')
    .style('font-size', '12px')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')
    .style('z-index', '10')

  // Hover Interactions
  monthGroups
    .append('rect')
    .attr('width', x0.bandwidth())
    .attr('height', height)
    .attr('fill', 'transparent')
    .on('mousemove', function (event, d) {
      d3.select(this.parentNode).selectAll('rect:not([fill="transparent"])').attr('opacity', 0.8)
      
      const rev = ((d.totalRevenue || 0) / 1000000).toFixed(1)
      const pro = ((d.totalProfit || 0) / 1000000).toFixed(1)

      const mx = event.pageX || d3.pointer(event)[0] + margin.left
      let left = mx < cw / 2 ? d3.pointer(event)[0] + margin.left + 20 : d3.pointer(event)[0] + margin.left - 130

      tooltip
        .style('display', 'block')
        .style('left', `${left}px`)
        .style('top', `${Math.max(0, d3.pointer(event)[1] - 40)}px`)
        .html(
          `<div style="font-weight:600;margin-bottom:4px;color:#374151">Tháng ${d.reportMonth}</div>` +
          `<div style="color:#DC2626">DT: <b>${rev}M</b></div>` +
          `<div style="color:#F87171">LN: <b>${pro}M</b></div>`
        )
    })
    .on('mouseleave', function () {
      d3.select(this.parentNode).selectAll('rect:not([fill="transparent"])').attr('opacity', 1.0)
      tooltip.style('display', 'none')
    })
    
  // Responsive legend
  const legendX = isMobile ? Math.max(0, (width / 2) - 80) : width - 160
  const legendY = isMobile ? -30 : -15
  
  const legend = svg
    .append('g')
    .attr('transform', `translate(${legendX}, ${legendY})`)

  const legendItems = [
    { label: 'Doanh thu', color: '#DC2626' },
    { label: 'Lợi nhuận', color: '#F87171' }
  ]

  legendItems.forEach((l, i) => {
    const g = legend.append('g').attr('transform', `translate(${i * 85}, 0)`)
    g.append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('y', 0)
      .attr('rx', 2)
      .attr('fill', l.color)
    g.append('text')
      .attr('x', 16)
      .attr('y', 9)
      .text(l.label)
      .style('font-size', '11px')
      .style('fill', '#6B7280')
  })
}

onMounted(() => {
  drawChart(props.monthlyData)
  resizeObserver = new ResizeObserver(() => drawChart(props.monthlyData))
  if (chartContainer.value) resizeObserver.observe(chartContainer.value)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

watch(() => props.monthlyData, (newData) => drawChart(newData), { deep: true })
</script>
