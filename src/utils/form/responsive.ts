/**
 * FormứngkiểuBố cụcCông cụmôkhối
 *
 * gợicungFormmụctạiKhôngcùngmàn hìnhmànthướctấcdướicủatrínăngBố cụckế
 *
 * ## chủcầncôngnăng
 *
 * - ứngkiểuđoánđiểmQuản lý（xs/sm/md/lg/xl）
 * - FormcộtRộngtừđộnggiảmcấp（tránhmiễntiểumàn hìnhmànépthụt）
 * - ởNgưỡngcủatrínăng span kế
 * - ứngkiểukếthiết bịcôngxưởngHàm
 * - Có thểCauHinhcủađoánđiểmquy
 *
 * ## khiếndùngtrườngcảnh
 *
 * - FormComponentứngkiểuBố cục
 * - TimKiemFormtừthíchứng
 * - DiđộngđầuFormTốihóa
 * - đaDanh sáchđơnBố cục
 *
 * ## đoánđiểmMô tả（ở Element Plus Grid 24 lướicáchHeThong）：
 * - xs (taymáy): < 768px，tiểuở 12 giờgiảmcấpvì 24（đầyRộng）
 * - sm (bản): ≥ 768px，tiểuở 12 giờgiảmcấpvì 12（nửaRộng）
 * - md (trongbằngmàn hìnhmàn): ≥ 992px，tiểuở 8 giờgiảmcấpvì 8（baphầncủamộtRộng）
 * - lg (đạimàn hìnhmàn): ≥ 1200px，thẳngtiếpkhiếndùngCaiDatcủa span
 * - xl (siêuđạimàn hìnhmàn): ≥ 1920px，thẳngtiếpkhiếndùngCaiDatcủa span
 *
 * ## Cốt lõicôngnăng
 *
 * - calculateResponsiveSpan: kếứngkiểucộtRộng
 * - createResponsiveSpanCalculator: xây span kếthiết bị（khatronghóa）
 *
 * @module utils/form/responsive
 * @author Art Design Pro Team
 */

/**
 * ứngkiểuđoánđiểmloạikiểu
 */
export type ResponsiveBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * đoánđiểmCauHinhảnhxạ
 */
interface BreakpointConfig {
  /** nhấttiểu span Ngưỡng */
  threshold: number
  /** giảmcấpsaucủa span giá trị */
  fallback: number
}

/**
 * ứngkiểuđoánđiểmCauHinh
 */
const BREAKPOINT_CONFIG: Record<ResponsiveBreakpoint, BreakpointConfig | null> = {
  xs: { threshold: 12, fallback: 24 }, // taymáy：tiểuở 12 giờkhiếndùngđầyRộng
  sm: { threshold: 12, fallback: 12 }, // bản：tiểuở 12 giờkhiếndùngnửaRộng
  md: { threshold: 8, fallback: 8 }, // trongbằngmàn hìnhmàn：tiểuở 8 giờkhiếndùngbaphầncủamộtRộng
  lg: null, // đạimàn hìnhmàn：thẳngtiếpkhiếndùngCaiDatcủa span
  xl: null // siêuđạimàn hìnhmàn：thẳngtiếpkhiếndùngCaiDatcủa span
}

/**
 * kếứngkiểucộtRộng
 *
 * liệumàn hìnhmànthướctấctrínănggiảmcấp，tránhmiễntiểumàn hìnhmàntrênFormmụcbịépthụtquatiểu
 *
 * @param itemSpan FormmụcTùy chỉnhcủa span giá trị
 * @param defaultSpan MacDinhcủa span giá trị
 * @param breakpoint khitrướcđoánđiểm
 * @returns kếsaucủa span giá trị
 *
 * @example
 * ```ts
 * // tại xs đoánđiểmdưới，span vì 6 sẽgiảmcấpvì 24（đầyRộng）
 * calculateResponsiveSpan(6, 6, 'xs') // 24
 *
 * // tại md đoánđiểmdưới，span vì 6 sẽgiảmcấpvì 8（baphầncủamộtRộng）
 * calculateResponsiveSpan(6, 6, 'md') // 8
 *
 * // tại lg đoánđiểmdưới，thẳngtiếpkhiếndùngnguyênđầu span
 * calculateResponsiveSpan(6, 6, 'lg') // 6
 * ```
 */
export function calculateResponsiveSpan(
  itemSpan: number | undefined,
  defaultSpan: number,
  breakpoint: ResponsiveBreakpoint
): number {
  const finalSpan = itemSpan ?? defaultSpan
  const config = BREAKPOINT_CONFIG[breakpoint]

  // nếuquảkhôngcóCauHinh（lg/xl），thẳngtiếpQuay lạinguyênđầu span
  if (!config) {
    return finalSpan
  }

  // nếuquả span tiểuởNgưỡng，khiếndùnggiảmcấpgiá trị
  return finalSpan >= config.threshold ? finalSpan : config.fallback
}

/**
 * xâyứngkiểu span kếthiết bị
 *
 * Quay lạimộtchiếcHàm，dùngởkếđịnhđoánđiểmdướicủa span giá trị
 *
 * @param defaultSpan MacDinhcủa span giá trị
 * @returns span kếHàm
 *
 * @example
 * ```ts
 * const getColSpan = createResponsiveSpanCalculator(6)
 * getColSpan(undefined, 'xs') // 24
 * getColSpan(8, 'md') // 8
 * getColSpan(12, 'lg') // 12
 * ```
 */
export function createResponsiveSpanCalculator(defaultSpan: number) {
  return (itemSpan: number | undefined, breakpoint: ResponsiveBreakpoint): number => {
    return calculateResponsiveSpan(itemSpan, defaultSpan, breakpoint)
  }
}
