/**
 * Biểu đồComponentloạikiểuĐịnh nghĩamôkhối
 *
 * gợicung ECharts Biểu đồComponentcủaĐầy đủloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - Cơ bảnBiểu đồCauHinhloạikiểu
 * - trạngảnhloạikiểuĐịnh nghĩa
 * - đườngảnhloạikiểuĐịnh nghĩa
 * - bánhđồ/hìnhđồLớpkiểuđịnhnghĩa
 * - Biểu đồ radarloạikiểuĐịnh nghĩa
 * - KđườngảnhloạikiểuĐịnh nghĩa
 * - Biểu đồ phân tánloạikiểuĐịnh nghĩa
 * - địaảnhBiểu đồloạikiểuĐịnh nghĩa
 * - Biểu đồ cột chồng hai chiềuloạikiểuĐịnh nghĩa
 * - Biểu đồChuDeCauHinhloạikiểu
 * - Biểu đồSuKienvềđiềuloạikiểu
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Biểu đồComponent Props loạikiểuhẹnthúc
 * - Biểu đồCauHinhloạikiểuĐịnh nghĩa
 * - Biểu đồDữ liệuKếtcấuĐịnh nghĩa
 * - Biểu đồSuKienXuLy
 *
 * @module types/component/chart
 * @author Art Design Pro Team
 */
import type { EChartsOption } from '@/plugins/echarts'

// ảnhví dụViTriloạikiểu
export type LegendPosition = 'bottom' | 'top' | 'left' | 'right'

export type SymbolType =
  | 'circle'
  | 'rect'
  | 'roundRect'
  | 'triangle'
  | 'diamond'
  | 'pin'
  | 'arrow'
  | 'none'

// Biểu đồChuDeCauHinh
export interface ChartThemeConfig {
  /** Biểu đồChiều cao */
  chartHeight: string
  /** Phông chữKích thước */
  fontSize: number
  /** Phông chữMàu sắc */
  fontColor: string
  /** ChuDeMàu sắc */
  themeColor: string
  /** Màu sắctổ */
  colors: string[]
}

// Biểu đồban đầuđầuhóavịmục
export interface UseChartOptions {
  /** ban đầuđầuhóavịmục */
  initOptions?: EChartsOption
  /** ban đầuđầuhóaThoiGian(ms) */
  initDelay?: number
  /** IntersectionObserverNgưỡng */
  threshold?: number
  /** làphủtừđộngứngChuDebiếnhóa */
  autoTheme?: boolean
}

// Cơ bảnBiểu đồ Props Giao diện (Interface) - thốngmộtnêncóBiểu đồcủaCơ bảnThuocTinh
export interface BaseChartProps {
  /** Biểu đồChiều cao */
  height?: string
  /** làphủĐang tải */
  loading?: boolean
  isEmpty?: boolean
  /** Màu sắcCauHinh */
  colors?: string[]
}

// TrụcđườngHiển thịkhốngchếGiao diện (Interface) - thốngmộtTrụcđườngđóngCauHinh
export interface AxisDisplayProps {
  /** làphủHiển thịTọatiêuTrụcTag */
  showAxisLabel?: boolean
  /** làphủHiển thịTọatiêuTrụcđường */
  showAxisLine?: boolean
  /** làphủHiển thịphầncắtđường */
  showSplitLine?: boolean
}

// nộpHiển thịkhốngchếGiao diện (Interface) - thốngmộtnộpđóngCauHinh
export interface InteractionProps {
  /** làphủHiển thịGợi ýKhung */
  showTooltip?: boolean
  /** làphủHiển thịảnhví dụ */
  showLegend?: boolean
  /** ảnhví dụViTri */
  legendPosition?: LegendPosition
}

// trạngảnhDữ liệumụcGiao diện (Interface)
export interface BarDataItem {
  /** hệcộtdanhtên */
  name: string
  /** Dữ liệugiá trị */
  data: number[]
  /** trạngảnhChiều rộng */
  barWidth?: string | number
  /** phầntổdanhtên */
  stack?: string
}

// trạngảnh Props Giao diện (Interface) - thốngmộttrạngảnhCauHinh
export interface BarChartProps extends BaseChartProps, AxisDisplayProps, InteractionProps {
  /** Biểu đồDữ liệu - chiếctrìđơntổDữ liệuhoặcđatổDữ liệu */
  data: number[] | BarDataItem[]
  /** XTrụcTagDữ liệu */
  xAxisData?: string[]
  /** trạngảnhChiều rộng */
  barWidth?: string | number
  /** làphủHiển thị */
  stack?: boolean
  /** Vai */
  borderRadius?: number | number[]
}

// đườngảnhDữ liệumụcGiao diện (Interface)
export interface LineDataItem {
  /** hệcộtdanhtên */
  name: string
  /** Dữ liệugiá trị */
  data: number[]
  /** đườngđiềuChiều rộng */
  lineWidth?: number
  /** làphủHiển thịđồngTênĐiền vào */
  showAreaColor?: boolean
  /** đồngTênKiểu dángCauHinh */
  areaStyle?: {
    /** biếnBắt đầuĐộ trong suốt */
    startOpacity?: number
    /** biếnKếtthúcĐộ trong suốt */
    endOpacity?: number
    /** Tùy chỉnh ECharts areaStyle CauHinh */
    custom?: any
  }
  /** làphủtrượtcongđường */
  smooth?: boolean
  /** Dữ liệuđiểmkýsố */
  symbol?: SymbolType
  /** Dữ liệuđiểmKích thước */
  symbolSize?: number
}

// đườngảnh Props Giao diện (Interface) - thốngmộtđườngảnhCauHinh
export interface LineChartProps extends BaseChartProps, AxisDisplayProps, InteractionProps {
  /** Biểu đồDữ liệu - chiếctrìđơntổDữ liệuhoặcđatổDữ liệu */
  data: number[] | LineDataItem[]
  /** XTrụcTagDữ liệu */
  xAxisData?: string[]
  /** đườngđiềuChiều rộng */
  lineWidth?: number
  /** làphủHiển thịđồngTênĐiền vào */
  showAreaColor?: boolean
  /** làphủtrượtcongđường */
  smooth?: boolean
  /** Dữ liệuđiểmkýsố */
  symbol?: SymbolType
  /** Dữ liệuđiểmKích thước */
  symbolSize?: number
  /** đaDữ liệuHoatAnhKhoảng cách（milligiây） */
  animationDelay?: number
}

// Biểu đồ radarDữ liệumụcGiao diện (Interface)
export interface RadarDataItem {
  /** hệcộtdanhtên */
  name: string
  /** Dữ liệugiá trị */
  value: number[]
}

// Biểu đồ radar Props Giao diện (Interface) - thốngmộtBiểu đồ radarCauHinh
export interface RadarChartProps extends BaseChartProps, InteractionProps {
  /** Biểu đồ radartiêuCauHinh */
  indicator?: Array<{ name: string; max: number }>
  /** Biểu đồDữ liệu */
  data?: RadarDataItem[]
}

// bánhđồ/hìnhđồDữ liệumụcGiao diện (Interface)
export interface PieDataItem {
  /** Dữ liệugiá trị */
  value: number
  /** Dữ liệudanhtên */
  name: string
}

// Biểu đồ vòng Props Giao diện (Interface) - thốngmộtBiểu đồ vòngCauHinh
export interface RingChartProps extends BaseChartProps, InteractionProps {
  /** Biểu đồDữ liệu */
  data: PieDataItem[]
  /** trongngoàinửa */
  radius?: string[]
  /** ViềnVai */
  borderRadius?: number
  /** Trung tâmvănquyển */
  centerText?: string
  /** làphủHiển thịTag */
  showLabel?: boolean
}

// KđườngảnhDữ liệumụcGiao diện (Interface)
export interface KLineDataItem {
  /** ThoiGianTag */
  time: string
  /** mởgiá */
  open: number
  /** Bộgiá */
  close: number
  /** nhấtcaogiá */
  high: number
  /** nhấtđêgiá */
  low: number
}

// Kđườngảnh Props Giao diện (Interface) - thốngmộtKđườngảnhCauHinh
export interface KLineChartProps extends BaseChartProps {
  /** Biểu đồDữ liệu */
  data?: KLineDataItem[]
  /** làphủHiển thịDữ liệuThu phóngkhốngphần tử */
  showDataZoom?: boolean
  /** Dữ liệuThu phóngban đầuđầuBắt đầuViTri */
  dataZoomStart?: number
  /** Dữ liệuThu phóngban đầuđầuKếtthúcViTri */
  dataZoomEnd?: number
}

// Biểu đồ phân tánDữ liệumụcGiao diện (Interface)
export interface ScatterDataItem {
  /** Tọatiêugiá trị [x, y] */
  value: number[]
}

// Biểu đồ phân tán Props Giao diện (Interface) - thốngmộtBiểu đồ phân tánCauHinh
export interface ScatterChartProps extends BaseChartProps, AxisDisplayProps, InteractionProps {
  /** Biểu đồDữ liệu */
  data?: ScatterDataItem[]
  /** điểmKích thước */
  symbolSize?: number
}

// đôiđốiso sánhảnh Props Giao diện (Interface) - thốngmộtđôiđốiso sánhảnhCauHinh
export interface DualBarCompareChartProps extends BaseChartProps {
  /** trênphươngDữ liệu */
  topData: number[]
  /** dướiphươngDữ liệu */
  bottomData: number[]
  /** XTrụcTagDữ liệu */
  xAxisData: string[]
  /** trênphươngtửMàu sắc */
  topColor?: string
  /** dướiphươngtửMàu sắc */
  bottomColor?: string
  /** trạngảnhChiều rộng */
  barWidth?: number
}

// địaảnhBiểu đồ Props Giao diện (Interface) - thốngmộtđịaảnhBiểu đồCauHinh
export interface MapChartProps extends BaseChartProps {
  /** địaảnhDữ liệu */
  mapData?: any[]
  /** vịtrongđồngTên */
  selectedRegion?: string
  /** làphủHiển thịTag */
  showLabels?: boolean
  /** làphủHiển thịđiểm */
  showScatter?: boolean
}

// Biểu đồ cột chồng hai chiều Props Giao diện (Interface)（ngườidiệnvàngchữthápKiểu dáng）
export interface BidirectionalBarChartProps
  extends BaseChartProps,
    AxisDisplayProps,
    InteractionProps {
  /** đúnghướngDữ liệu（LênHiển thị） */
  positiveData: number[]
  /** hướngDữ liệu（XuốngHiển thị） */
  negativeData: number[]
  /** XTrụcTagDữ liệu */
  xAxisData?: string[]
  /** đúnghướngDữ liệudanhtên */
  positiveName?: string
  /** hướngDữ liệudanhtên */
  negativeName?: string
  /** trạngảnhChiều rộng */
  barWidth?: string | number
  /** YTrụcnhấttiểugiá trị */
  yAxisMin?: number
  /** YTrụcnhấtđạigiá trị */
  yAxisMax?: number
  /** làphủHiển thịDữ liệuTag */
  showDataLabel?: boolean
  /** đúnghướngDữ liệuVaiCauHinh */
  positiveBorderRadius?: number | number[]
  /** hướngDữ liệuVaiCauHinh */
  negativeBorderRadius?: number | number[]
}

// Biểu đồCauHinhsinhthànhthiết bịHàmloạikiểu
export type ChartOptionGenerator = () => EChartsOption

// Biểu đồSuKienvềđiềuloạikiểu
export type ChartEventCallback = (params: any) => void

// Biểu đồLỗiThongTinGiao diện (Interface)
export interface ChartError {
  /** Lỗimã */
  code: string
  /** LỗiThongTin */
  message: string
  /** LỗiChiTiet */
  details?: any
}
