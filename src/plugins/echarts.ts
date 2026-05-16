/**
 * ECharts chènphần tửCauHinh
 *
 * cầnNhập file ECharts Biểu đồvàComponent，bớttiểumởbaothểtích。
 * chỉDangKymụcmụctrongthựctếkhiếndùngcủaBiểu đồloạikiểuvàComponent。
 *
 * @module plugins/echarts
 * @author Art Design Pro Team
 */

// ECharts cầnNhập fileCauHinh
import * as echarts from 'echarts/core'

// Nhập fileBiểu đồloạikiểu
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  CandlestickChart
} from 'echarts/charts'

// Nhập fileComponent
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  ToolboxComponent,
  BrushComponent,
  GeoComponent,
  VisualMapComponent
} from 'echarts/components'

// Nhập fileRenderthiết bị
import { CanvasRenderer } from 'echarts/renderers'

// DangKytấtcầncủaComponent
echarts.use([
  // Biểu đồloạikiểu
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  CandlestickChart,

  // Component
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  ToolboxComponent,
  BrushComponent,
  GeoComponent,
  VisualMapComponent,

  // Renderthiết bị
  CanvasRenderer
])

// Xuất file echarts thựcví dụvàloạikiểu
export { echarts }
export type { EChartsOption, BarSeriesOption } from 'echarts'

// Xuất filelệdùngcủaảnhhìnhCông cụ
export const graphic = echarts.graphic
