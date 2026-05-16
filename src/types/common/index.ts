/**
 * thôngdùngloạikiểuĐịnh nghĩamôkhối
 *
 * gợicungmụcmụctronglệdùngcủathôngdùngloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - Trạng tháiLớpkiểu（Bật/Tắt）
 * - GioiTinhloạikiểu
 * - xếpthứphươnghướngloạikiểu
 * - HanhDongloạikiểu（ThêmxóasửaTìm）
 * - Ghi chéploạikiểu（phímgiá trịđối）
 * - ThoiGianphạmviloạikiểu
 * - vănphần tửThongTinloạikiểu
 * - Tọatiêuvàthướctấcloạikiểu
 * - ứngkiểuđoánđiểmloạikiểu
 * - ChuDevàNgôn ngữloạikiểu
 * - cảnhvàPopuploạikiểu
 *
 * ## khiếndùngtrườngcảnh
 *
 * - thôngdùngDữ liệuKếtcấuĐịnh nghĩa
 * - loạikiểuhẹnthúcvàGợi ý
 * - bớtthiểutrùngphụcloạikiểuĐịnh nghĩa
 *
 * @module types/common/index
 * @author Art Design Pro Team
 */

// Xuất fileứngloạikiểu
export * from './response'

// Trạng tháiloạikiểu
export type Status = 0 | 1 // 0: Tắt, 1: Bật

// GioiTinhloạikiểu
export type Gender = 'male' | 'female' | 'unknown'

// xếpthứphươnghướng
export type SortOrder = 'ascending' | 'descending'

// HanhDongloạikiểu
export type ActionType = 'create' | 'update' | 'delete' | 'view'

// Có thểvịcủaGhi chéploạikiểu
export type Recordable<T = any> = Record<string, T>

// phímgiá trịđốiloạikiểu
export type KeyValue<T = any> = {
  key: string
  value: T
  label?: string
}

// ThoiGianphạmviloạikiểu
export interface TimeRange {
  startTime: string
  endTime: string
}

// vănphần tửloạikiểu
export interface FileInfo {
  name: string
  url: string
  size: number
  type: string
  lastModified?: number
}

// Tọatiêuloạikiểu
export interface Position {
  x: number
  y: number
}

// thướctấcloạikiểu
export interface Size {
  width: number
  height: number
}

// ứngkiểuđoánđiểmloạikiểu
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ChuDeloạikiểu
export type ThemeMode = 'light' | 'dark' | 'auto'

// Ngôn ngữloạikiểu
export type Language = 'zh-CN' | 'en-US'

// cảnhloạikiểu
export type Environment = 'development' | 'production' | 'test'

// Popuploạikiểu
export type DialogType = 'add' | 'edit'
