/**
 * BảngCacheQuản lýmôkhối
 *
 * gợicungcaotínhnăngcủaBảngDữ liệuCachemáychế
 *
 * ## chủcầncôngnăng
 *
 * - ởTham sốcủatrínăngCachephímsinhthành（khiếndùng ohash）
 * - LRU（nhấtcậnnhấtthiểukhiếndùng）Cacheđàoloạisáchlược
 * - CachequakỳThoiGianQuản lý
 * - CacheKích thướchạnchếvàtừđộngxóalý
 * - ởTagcủaCachephầntổQuản lý
 * - đaloạiCachethấthiệusáchlược（xóakhôngnêncó、xóakhôngkhitrước、xóakhôngPhân trangbằng）
 * - CacheTruy cậpthốngkếvàmệnhtrongsuấtphầnphân
 * - CacheKích thướcđánh giá
 *
 * ## khiếndùngtrườngcảnh
 *
 * - BảngDữ liệucủaPhân trangCache
 * - bớtthiểutrùngphụccủa API Vui lòngcầu
 * - gợilênBảngChuyển đổivàQuay lạicủaứngTốc độ
 * - TimKiemđiềuphần tửbiếnhóagiờcủatrínăngCacheQuản lý
 * - Dữ liệuCập nhậtsaucủaCachethấthiệuXuLy
 *
 * ## Cachesáchlược
 *
 * - CLEAR_ALL: xóakhôngnêncóCache（thíchdùngởtoànbộDữ liệuCập nhật）
 * - CLEAR_CURRENT: chỉxóakhôngkhitrướcTìmhỏiđiềuphần tửcủaCache（thíchdùngởđơnđiềuDữ liệuCập nhật）
 * - CLEAR_PAGINATION: xóakhôngnêncóPhân trangCachenhưngLưugiữKhôngcùngTimKiemđiềuphần tử（thíchdùngởlôlượngHanhDong）
 * - KEEP_ALL: KhôngxóachiaCache（thíchdùngởchỉđọcHanhDong）
 *
 * @module utils/table/tableCache
 * @author Art Design Pro Team
 */
import { hash } from 'ohash'

// CachethấthiệusáchlượcchiếcBáo
export enum CacheInvalidationStrategy {
  /** xóakhôngnêncóCache */
  CLEAR_ALL = 'clear_all',
  /** chỉxóakhôngkhitrướcTìmhỏiđiềuphần tửcủaCache */
  CLEAR_CURRENT = 'clear_current',
  /** xóakhôngnêncóPhân trangCache（LưugiữKhôngcùngTimKiemđiềuphần tửcủaCache） */
  CLEAR_PAGINATION = 'clear_pagination',
  /** KhôngxóachiaCache */
  KEEP_ALL = 'keep_all'
}

// thôngdùng API ứngGiao diện (Interface)（kiêmdungKhôngcùngcủasauđầuứngcáchkiểu）
export interface ApiResponse<T = unknown> {
  records?: T[]
  data?: T[]
  total?: number
  current?: number
  size?: number
  [key: string]: unknown
}

// CachetồntrữGiao diện (Interface)
export interface CacheItem<T> {
  data: T[]
  response: ApiResponse<T>
  timestamp: number
  params: string
  // CacheTag，dùngởphầntổQuản lý
  tags: Set<string>
  // Truy cậplầnsố（dùngở LRU pháp）
  accessCount: number
  // nhấtsauTruy cậpThoiGian
  lastAccessTime: number
}

// ThêmcườngcủaCacheQuản lýloại
export class TableCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private cacheTime: number
  private maxSize: number
  private enableLog: boolean

  constructor(cacheTime = 5 * 60 * 1000, maxSize = 50, enableLog = false) {
    // MacDinh5phầnchuông，nhấtđa50điềuCache
    this.cacheTime = cacheTime
    this.maxSize = maxSize
    this.enableLog = enableLog
  }

  // trongbộNhatKyCông cụ
  private log(message: string, ...args: any[]) {
    if (this.enableLog) {
      console.log(`[TableCache] ${message}`, ...args)
    }
  }

  // sinhthànhổnđịnhcủaCachephím
  private generateKey(params: unknown): string {
    return hash(params)
  }

  // 🔧 Tốihóa：Thêmcườngloạikiểuantoàntính
  private generateTags(params: Record<string, unknown>): Set<string> {
    const tags = new Set<string>()

    // Thêm mớiTimKiemđiềuphần tửTag
    const searchKeys = Object.keys(params).filter(
      (key) =>
        !['current', 'size', 'total'].includes(key) &&
        params[key] !== undefined &&
        params[key] !== '' &&
        params[key] !== null
    )

    if (searchKeys.length > 0) {
      const searchTag = searchKeys.map((key) => `${key}:${String(params[key])}`).join('|')
      tags.add(`search:${searchTag}`)
    } else {
      tags.add('search:default')
    }

    // Thêm mớiPhân trangTag
    tags.add(`pagination:${params.size || 10}`)
    // Thêm mớithôngdùngPhân trangTag，dùngởxóalýnêncóPhân trangCache
    tags.add('pagination')

    return tags
  }

  // 🔧 Tốihóa：LRU Cachexóalý
  private evictLRU(): void {
    if (this.cache.size <= this.maxSize) return

    // tìmđếnnhấtthiểukhiếndùngcủaCachemục
    let lruKey = ''
    let minAccessCount = Infinity
    let oldestTime = Infinity

    for (const [key, item] of this.cache.entries()) {
      if (
        item.accessCount < minAccessCount ||
        (item.accessCount === minAccessCount && item.lastAccessTime < oldestTime)
      ) {
        lruKey = key
        minAccessCount = item.accessCount
        oldestTime = item.lastAccessTime
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
      this.log(`LRU xóalýCache: ${lruKey}`)
    }
  }

  // CaiDatCache
  set(params: unknown, data: T[], response: ApiResponse<T>): void {
    const key = this.generateKey(params)
    const tags = this.generateTags(params as Record<string, unknown>)
    const now = Date.now()

    // Tìmlàphủcầncầnxóalý
    this.evictLRU()

    this.cache.set(key, {
      data,
      response,
      timestamp: now,
      params: key,
      tags,
      accessCount: 1,
      lastAccessTime: now
    })
  }

  // LấyCache
  get(params: unknown): CacheItem<T> | null {
    const key = this.generateKey(params)
    const item = this.cache.get(key)

    if (!item) return null

    // Tìmlàphủquakỳ
    if (Date.now() - item.timestamp > this.cacheTime) {
      this.cache.delete(key)
      return null
    }

    // Cập nhậtTruy cậpthốngkế
    item.accessCount++
    item.lastAccessTime = Date.now()

    return item
  }

  // liệuTagxóachiaCache
  clearByTags(tags: string[]): number {
    let clearedCount = 0

    for (const [key, item] of this.cache.entries()) {
      // TìmlàphủBao gồmnhiệmýmộtchiếcTag
      const hasMatchingTag = tags.some((tag) =>
        Array.from(item.tags).some((itemTag) => itemTag.includes(tag))
      )

      if (hasMatchingTag) {
        this.cache.delete(key)
        clearedCount++
      }
    }

    return clearedCount
  }

  // xóachiakhitrướcTimKiemđiềuphần tửcủaCache
  clearCurrentSearch(params: unknown): number {
    const key = this.generateKey(params)
    const deleted = this.cache.delete(key)
    return deleted ? 1 : 0
  }

  // xóachiaPhân trangCache
  clearPagination(): number {
    return this.clearByTags(['pagination'])
  }

  // xóakhôngnêncóCache
  clear(): void {
    this.cache.clear()
  }

  // LấyCachethốngkếThongTin
  getStats(): { total: number; size: string; hitRate: string } {
    const total = this.cache.size
    let totalSize = 0
    let totalAccess = 0

    for (const item of this.cache.values()) {
      // đậmlượcđánh giáKích thước（JSONChuỗitrườngđộ）
      totalSize += JSON.stringify(item.data).length
      totalAccess += item.accessCount
    }

    // chuyểnđổivìngườiloạiCó thểđọccủaKích thước
    const sizeInKB = (totalSize / 1024).toFixed(2)
    const avgHits = total > 0 ? (totalAccess / total).toFixed(1) : '0'

    return {
      total,
      size: `${sizeInKB}KB`,
      hitRate: `${avgHits} avg hits`
    }
  }

  // xóalýquakỳCache
  cleanupExpired(): number {
    let cleanedCount = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheTime) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }
}
