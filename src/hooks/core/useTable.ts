/**
 * useTable - xínghiệpcấpBảngDữ liệuQuản lýphươngán
 *
 * côngnăngĐầy đủcủaBảngDữ liệuQuản lýgiảiphươngán，chuyênvìsauchiếcQuản lýHeThongthiếtkế。
 * phongrồiBảngmởpháttrongcủanêncólệthấycầncầu，đểbạnTập trungởnghiệpvụLogic。
 *
 * ## chủcầncôngnăng
 *
 * 1. Dữ liệuQuản lý - từđộngXuLy API Vui lòngcầu、ứngchuyểnđổi、LoadingTrạng tháivàXuLy lỗi
 * 2. Phân trangkhốngchế - từđộngcùngbướcPhân trangTrạng thái、DiđộngđầuthíchPhân、trínăngtrangmãbiêngiaoXuLy
 * 3. TimKiemcôngnăng - PhòngrungTimKiemTốihóa、Tham sốQuản lý、mộtphímĐặt lại、Tham sốqualọc
 * 4. CacheHeThong - trínăngVui lòngcầuCache、đaloạixóalýsáchlược、từđộngquakỳQuản lý、thốngkếThongTin
 * 5. Làm mớisáchlược - gợicung 5 loạiLàm mớiphươngphápthíchPhânkhôngcùngnghiệpvụtrườngcảnh（mớiThêm/hơnmới/Xóa/tayđộng/địnhthời）
 * 6. cộtCauHinhQuản lý - Hoạt độngHiểnthị/ẩngiấucột、cộtxếpthứ、CauHinhtrìlâuhóa、lôlượngHanhDong（Có thểvị）
 *
 * @module useTable
 * @author Art Design Pro Team
 */

import { ref, reactive, computed, onMounted, onUnmounted, nextTick, readonly } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useTableColumns } from './useTableColumns'
import type { ColumnOption } from '@/types/component'
import {
  TableCache,
  CacheInvalidationStrategy,
  type ApiResponse
} from '../../utils/table/tableCache'
import {
  type TableError,
  defaultResponseAdapter,
  extractTableData,
  updatePaginationFromResponse,
  createSmartDebounce,
  createErrorHandler
} from '../../utils/table/tableUtils'
import { tableConfig } from '../../utils/table/tableConfig'

// loạikiểuđẩyXuấtCông cụloạikiểu
type InferApiParams<T> = T extends (params: infer P) => any ? P : never
type InferApiResponse<T> = T extends (params: any) => Promise<infer R> ? R : never
type InferRecordType<T> = T extends Api.Common.PaginatedResponse<infer U> ? U : never

// TốihóacủaCauHinhGiao diện (Interface) - chiếctrìtừđộngloạikiểuđẩyXuất
export interface UseTableConfig<
  TApiFn extends (params: any) => Promise<any> = (params: any) => Promise<any>,
  TRecord = InferRecordType<InferApiResponse<TApiFn>>,
  TParams = InferApiParams<TApiFn>,
  TResponse = InferApiResponse<TApiFn>
> {
  // Cốt lõiCauHinh
  core: {
    /** API Vui lòngcầuHàm */
    apiFn: TApiFn
    /** MacDinhVui lòngcầuTham số */
    apiParams?: Partial<TParams>
    /** xếpchia apiParams trongcủaThuocTinh */
    excludeParams?: string[]
    /** làphủlậplàLoadingDữ liệu */
    immediate?: boolean
    /** cộtCauHinhcôngxưởngHàm */
    columnsFactory?: () => ColumnOption<TRecord>[]
    /** Tùy chỉnhPhân trangchữđoạnảnhxạ */
    paginationKey?: {
      /** khitrướctrangmãchữđoạndanh，MacDinhvì 'current' */
      current?: string
      /** mỗitrangđiềuSốđoạndanh，MacDinhvì 'size' */
      size?: string
    }
  }

  // Dữ liệuXuLy
  transform?: {
    /** Dữ liệuchuyểnđổiHàm */
    dataTransformer?: (data: TRecord[]) => TRecord[]
    /** ứngDữ liệuthíchPhânthiết bị */
    responseAdapter?: (response: TResponse) => ApiResponse<TRecord>
  }

  // tínhnăngTốihóa
  performance?: {
    /** làphủBậtCache */
    enableCache?: boolean
    /** CacheThoiGian（milligiây） */
    cacheTime?: number
    /** PhòngrungThoiGian（milligiây） */
    debounceTime?: number
    /** nhấtđạiCacheđiềusốhạnchế */
    maxCacheSize?: number
  }

  // sinhmệnhtuầnkỳHook
  hooks?: {
    /** Dữ liệuLoadingThanhCongvềđiều（chỉmạnglạcVui lòngcầuThanhConggiờKích hoạt） */
    onSuccess?: (data: TRecord[], response: ApiResponse<TRecord>) => void
    /** XuLy lỗivềđiều */
    onError?: (error: TableError) => void
    /** Cachemệnhtrongvềđiều（từCacheLấyDữ liệugiờKích hoạt） */
    onCacheHit?: (data: TRecord[], response: ApiResponse<TRecord>) => void
    /** LoadingTrạng tháibiếnhóavềđiều */
    onLoading?: (loading: boolean) => void
    /** Đặt lạiFormvềđiềuHàm */
    resetFormCallback?: () => void
  }

  // điềuthửCauHinh
  debug?: {
    /** làphủBậtNhatKynhậpra */
    enableLog?: boolean
    /** NhatKycấptính */
    logLevel?: 'info' | 'warn' | 'error'
  }
}

export function useTable<TApiFn extends (params: any) => Promise<any>>(
  config: UseTableConfig<TApiFn>
) {
  return useTableImpl(config)
}

/**
 * useTable củaCốt lõithựchiện - cườngđạicủaBảngDữ liệuQuản lý Hook
 *
 * gợicungĐầy đủcủaBảnggiảiphươngán，baobao：
 * - Dữ liệuLấyvớiCache
 * - Phân trangkhốngchế
 * - TimKiemcôngnăng
 * - trínăngLàm mớisáchlược
 * - XuLy lỗi
 * - cộtCauHinhQuản lý
 */
function useTableImpl<TApiFn extends (params: any) => Promise<any>>(
  config: UseTableConfig<TApiFn>
) {
  type TRecord = InferRecordType<InferApiResponse<TApiFn>>
  type TParams = InferApiParams<TApiFn>
  const {
    core: {
      apiFn,
      apiParams = {} as Partial<TParams>,
      excludeParams = [],
      immediate = true,
      columnsFactory,
      paginationKey
    },
    transform: { dataTransformer, responseAdapter = defaultResponseAdapter } = {},
    performance: {
      enableCache = false,
      cacheTime = 5 * 60 * 1000,
      debounceTime = 300,
      maxCacheSize = 50
    } = {},
    hooks: { onSuccess, onError, onCacheHit, resetFormCallback } = {},
    debug: { enableLog = false } = {}
  } = config

  // Phân trangchữđoạndanhCauHinh：TốikhiếndùngtruyềnvàocủaCauHinh，Nếu khôngkhiếndùngtoànbộCauHinh
  const pageKey = paginationKey?.current || tableConfig.paginationKey.current
  const sizeKey = paginationKey?.size || tableConfig.paginationKey.size

  // ứngkiểuKích hoạtthiết bị，dùngởtayđộngCập nhậtCachethốngkếThongTin
  const cacheUpdateTrigger = ref(0)

  // NhatKyCông cụHàm
  const logger = {
    log: (message: string, ...args: unknown[]) => {
      if (enableLog) {
        console.log(`[useTable] ${message}`, ...args)
      }
    },
    warn: (message: string, ...args: unknown[]) => {
      if (enableLog) {
        console.warn(`[useTable] ${message}`, ...args)
      }
    },
    error: (message: string, ...args: unknown[]) => {
      if (enableLog) {
        console.error(`[useTable] ${message}`, ...args)
      }
    }
  }

  // Cachethựcví dụ
  const cache = enableCache ? new TableCache<TRecord>(cacheTime, maxCacheSize, enableLog) : null

  // LoadingTrạng tháimáy
  type LoadingState = 'idle' | 'loading' | 'success' | 'error'
  const loadingState = ref<LoadingState>('idle')
  const loading = computed(() => loadingState.value === 'loading')

  // LỗiTrạng thái
  const error = ref<TableError | null>(null)

  // BảngDữ liệu
  const data = ref<TRecord[]>([])

  // Vui lòngcầuHủykhốngchếthiết bị
  let abortController: AbortController | null = null

  // Cachexóalýđịnhgiờthiết bị
  let cacheCleanupTimer: NodeJS.Timeout | null = null

  // TimKiemTham số
  const searchParams = reactive(
    Object.assign(
      {
        [pageKey]: 1,
        [sizeKey]: 10
      },
      apiParams || {}
    ) as TParams
  )

  // Phân trangCauHinh
  const pagination = reactive<Api.Common.PaginationParams>({
    current: ((searchParams as Record<string, unknown>)[pageKey] as number) || 1,
    size: ((searchParams as Record<string, unknown>)[sizeKey] as number) || 10,
    total: 0
  })

  // DiđộngđầuPhân trang (ứngkiểu)
  const { width } = useWindowSize()
  const mobilePagination = computed(() => ({
    ...pagination,
    small: width.value < 768
  }))

  // cộtCauHinh
  const columnConfig = columnsFactory ? useTableColumns<TRecord>(columnsFactory) : null
  const columns = columnConfig?.columns
  const columnChecks = columnConfig?.columnChecks

  // làphủcóDữ liệu
  const hasData = computed(() => data.value.length > 0)

  // CachethốngkếThongTin
  const cacheInfo = computed(() => {
    // ylạiKích hoạtthiết bị，Đảm bảoCachebiếnhóagiờtrùngmớikế
    void cacheUpdateTrigger.value
    if (!cache) return { total: 0, size: '0KB', hitRate: '0 avg hits' }
    return cache.getStats()
  })

  // XuLy lỗiHàm
  const handleError = createErrorHandler(onError, enableLog)

  // xóalýCache，liệuKhôngcùngcủanghiệpvụtrườngcảnhChọntínhđịaxóalýCache
  const clearCache = (strategy: CacheInvalidationStrategy, context?: string): void => {
    if (!cache) return

    let clearedCount = 0

    switch (strategy) {
      case CacheInvalidationStrategy.CLEAR_ALL:
        cache.clear()
        logger.log(`xóakhôngnêncóCache - ${context || ''}`)
        break

      case CacheInvalidationStrategy.CLEAR_CURRENT:
        clearedCount = cache.clearCurrentSearch(searchParams)
        logger.log(`xóakhôngkhitrướcTimKiemCache ${clearedCount} điều - ${context || ''}`)
        break

      case CacheInvalidationStrategy.CLEAR_PAGINATION:
        clearedCount = cache.clearPagination()
        logger.log(`xóakhôngPhân trangCache ${clearedCount} điều - ${context || ''}`)
        break

      case CacheInvalidationStrategy.KEEP_ALL:
      default:
        logger.log(`Duy trìCacheKhôngbiến - ${context || ''}`)
        break
    }
    // tayđộngKích hoạtCacheTrạng tháiCập nhật
    cacheUpdateTrigger.value++
  }

  // LấyDữ liệucủaCốt lõiPhuongThuc
  const fetchData = async (
    params?: Partial<TParams>,
    useCache = enableCache
  ): Promise<ApiResponse<TRecord>> => {
    // HủytrênmộtchiếcVui lòngcầu
    if (abortController) {
      abortController.abort()
    }

    // xâymớicủaHủykhốngchếthiết bị
    const currentController = new AbortController()
    abortController = currentController

    // Trạng tháimáy：vàovào loading Trạng thái
    loadingState.value = 'loading'
    error.value = null

    try {
      let requestParams = Object.assign(
        {},
        searchParams,
        {
          [pageKey]: pagination.current,
          [sizeKey]: pagination.size
        },
        params || {}
      ) as TParams

      // lọcchiaKhôngcầncầncủaTham số
      if (excludeParams.length > 0) {
        const filteredParams = { ...requestParams }
        excludeParams.forEach((key) => {
          delete (filteredParams as Record<string, unknown>)[key]
        })
        requestParams = filteredParams as TParams
      }

      // TìmCache
      if (useCache && cache) {
        const cachedItem = cache.get(requestParams)
        if (cachedItem) {
          data.value = cachedItem.data
          updatePaginationFromResponse(pagination, cachedItem.response)

          // sửaphục：tránhmiễntrùngphụcCaiDatcùngcủagiá trị，PhòngthúcứngkiểuVòng lặpCập nhật
          const paramsRecord = searchParams as Record<string, unknown>
          if (paramsRecord[pageKey] !== pagination.current) {
            paramsRecord[pageKey] = pagination.current
          }
          if (paramsRecord[sizeKey] !== pagination.size) {
            paramsRecord[sizeKey] = pagination.size
          }

          // Trạng tháimáy：Cachemệnhtrong，vàovào success Trạng thái
          loadingState.value = 'success'

          // CachemệnhtronggiờKích hoạtchuyêncửacủavềđiều，màKhônglà onSuccess
          if (onCacheHit) {
            onCacheHit(cachedItem.data, cachedItem.response)
          }

          logger.log(`Cachemệnhtrong`)
          return cachedItem.response
        }
      }

      const response = await apiFn(requestParams)

      // TìmVui lòngcầulàphủbịHủy
      if (currentController.signal.aborted) {
        throw new Error('Vui lòngcầuĐãHủy')
      }

      // khiếndùngứngthíchPhânthiết bịchuyểnđổivìtiêuthuậncáchkiểu
      const standardResponse = responseAdapter(response)

      // XuLyứngDữ liệu
      let tableData = extractTableData(standardResponse)

      // Ứng dụngDữ liệuchuyểnđổiHàm
      if (dataTransformer) {
        tableData = dataTransformer(tableData)
      }

      // Cập nhậtTrạng thái
      data.value = tableData
      updatePaginationFromResponse(pagination, standardResponse)

      // sửaphục：tránhmiễntrùngphụcCaiDatcùngcủagiá trị，PhòngthúcứngkiểuVòng lặpCập nhật
      const paramsRecord = searchParams as Record<string, unknown>
      if (paramsRecord[pageKey] !== pagination.current) {
        paramsRecord[pageKey] = pagination.current
      }
      if (paramsRecord[sizeKey] !== pagination.size) {
        paramsRecord[sizeKey] = pagination.size
      }

      // CacheDữ liệu
      if (useCache && cache) {
        cache.set(requestParams, tableData, standardResponse)
        // tayđộngKích hoạtCacheTrạng tháiCập nhật
        cacheUpdateTrigger.value++
        logger.log(`Dữ liệuĐãCache`)
      }

      // Trạng tháimáy：Yêu cầu thành công，vàovào success Trạng thái
      loadingState.value = 'success'

      // ThanhCongvềđiều
      if (onSuccess) {
        onSuccess(tableData, standardResponse)
      }

      return standardResponse
    } catch (err) {
      if (err instanceof Error && err.message === 'Vui lòngcầuĐãHủy') {
        // Vui lòngcầubịHủy，vềđến idle Trạng thái
        loadingState.value = 'idle'
        return { records: [], total: 0, current: 1, size: 10 }
      }

      // Trạng tháimáy：Yêu cầu thất bại，vàovào error Trạng thái
      loadingState.value = 'error'
      data.value = []
      const tableError = handleError(err, 'LấyBảngDữ liệuThatBai')
      throw tableError
    } finally {
      // chỉcókhitrướckhốngchếthiết bịlàsốngnhảycủamớixóakhông
      if (abortController === currentController) {
        abortController = null
      }
    }
  }

  // LấyDữ liệu (Duy trìkhitrướctrang)
  const getData = async (params?: Partial<TParams>): Promise<ApiResponse<TRecord> | void> => {
    try {
      return await fetchData(params)
    } catch {
      // LỗiĐãtại fetchData trongXuLy
      return Promise.resolve()
    }
  }

  // Phân trangLấyDữ liệu (Đặt lạiđếnthứmộttrang) - chuyêncửadùngởTimKiemtrườngcảnh
  const getDataByPage = async (params?: Partial<TParams>): Promise<ApiResponse<TRecord> | void> => {
    pagination.current = 1
    ;(searchParams as Record<string, unknown>)[pageKey] = 1

    // TimKiemgiờxóakhôngkhitrướcTimKiemđiềuphần tửcủaCache，Đảm bảoLấynhấtmớiDữ liệu
    clearCache(CacheInvalidationStrategy.CLEAR_CURRENT, 'TimKiemDữ liệu')

    try {
      return await fetchData(params, false) // TimKiemgiờKhôngkhiếndùngCache
    } catch {
      // LỗiĐãtại fetchData trongXuLy
      return Promise.resolve()
    }
  }

  // trínăngPhòngrungTimKiemHàm
  const debouncedGetDataByPage = createSmartDebounce(getDataByPage, debounceTime)

  // Đặt lạiTimKiemTham số
  const resetSearchParams = async (): Promise<void> => {
    // HủyPhòngrungcủaTimKiem
    debouncedGetDataByPage.cancel()

    // LưutồnPhân trangđóngcủaMacDinhgiá trị
    const paramsRecord = searchParams as Record<string, unknown>
    const defaultPagination = {
      [pageKey]: 1,
      [sizeKey]: (paramsRecord[sizeKey] as number) || 10
    }

    // xóakhôngnêncóTimKiemTham số
    Object.keys(searchParams).forEach((key) => {
      delete paramsRecord[key]
    })

    // trùngmớiCaiDatMacDinhTham số
    Object.assign(searchParams, apiParams || {}, defaultPagination)

    // Đặt lạiPhân trang
    pagination.current = 1
    pagination.size = defaultPagination[sizeKey] as number

    // xóakhôngLỗiTrạng thái
    error.value = null

    // xóakhôngCache
    clearCache(CacheInvalidationStrategy.CLEAR_ALL, 'Đặt lạiTimKiem')

    // trùngmớiLấyDữ liệu
    await getData()

    // ThựcdòngĐặt lạivềđiều
    if (resetFormCallback) {
      await nextTick()
      resetFormCallback()
    }
  }

  // thếđổiTimKiemTham số：thíchdùngởFormTìmhỏi，tránhmiễncũchữđoạntàngiữ
  const replaceSearchParams = (params?: Partial<TParams>): void => {
    const paramsRecord = searchParams as Record<string, unknown>
    const currentSize = pagination.size || ((paramsRecord[sizeKey] as number) ?? 10)

    Object.keys(searchParams).forEach((key) => {
      if (key !== pageKey && key !== sizeKey) {
        delete paramsRecord[key]
      }
    })

    Object.assign(
      searchParams,
      {
        [pageKey]: 1,
        [sizeKey]: currentSize
      },
      params || {}
    )

    pagination.current = 1
    pagination.size = currentSize
  }

  // Phòngtrùngphụcđiềudùngcủatiêuchí
  let isCurrentChanging = false

  // XuLyPhân trangKích thướcbiếnhóa
  const handleSizeChange = async (newSize: number): Promise<void> => {
    if (newSize <= 0) return

    debouncedGetDataByPage.cancel()

    const paramsRecord = searchParams as Record<string, unknown>
    pagination.size = newSize
    pagination.current = 1
    paramsRecord[sizeKey] = newSize
    paramsRecord[pageKey] = 1

    clearCache(CacheInvalidationStrategy.CLEAR_CURRENT, 'Phân trangKích thướcbiếnhóa')

    await getData()
  }

  // XuLykhitrướctrangbiếnhóa
  const handleCurrentChange = async (newCurrent: number): Promise<void> => {
    if (newCurrent <= 0) return

    // sửaphục：Phòngthúctrùngphụcđiềudùng
    if (isCurrentChanging) {
      return
    }

    // sửaphục：nếuquảkhitrướctrangkhôngcóbiếnhóa，KhôngcầncầntrùngmớiVui lòngcầu
    if (pagination.current === newCurrent) {
      logger.log('Phân trangtrangmãChưabiếnhóa，nhảyquaVui lòngcầu')
      return
    }

    try {
      isCurrentChanging = true

      // sửaphục：chỉCập nhậttấtcầncủaTrạng thái
      const paramsRecord = searchParams as Record<string, unknown>
      pagination.current = newCurrent
      // chỉcókhi searchParams củaPhân trangchữđoạnvớimớigiá trịKhôngcùnggiờmớiCập nhật
      if (paramsRecord[pageKey] !== newCurrent) {
        paramsRecord[pageKey] = newCurrent
      }

      await getData()
    } finally {
      isCurrentChanging = false
    }
  }

  // kimđốiKhôngcùngnghiệpvụtrườngcảnhcủaLàm mớiPhuongThuc

  // Thêm mớisauLàm mới：vềđếnthứmộttrangđồng thờixóakhôngPhân trangCache（thíchdùngởThêm mớiDữ liệusau）
  const refreshCreate = async (): Promise<void> => {
    debouncedGetDataByPage.cancel()
    pagination.current = 1
    ;(searchParams as Record<string, unknown>)[pageKey] = 1
    clearCache(CacheInvalidationStrategy.CLEAR_PAGINATION, 'Thêm mớiDữ liệu')
    await getData()
  }

  // Cập nhậtsauLàm mới：Duy trìkhitrướctrang，chỉxóakhôngkhitrướcTimKiemCache（thíchdùngởCập nhậtDữ liệusau）
  const refreshUpdate = async (): Promise<void> => {
    clearCache(CacheInvalidationStrategy.CLEAR_CURRENT, 'Chỉnh sửaDữ liệu')
    await getData()
  }

  // XóasauLàm mới：trínăngXuLytrangmã，tránhmiễnkhôngtrangmặt（thíchdùngởXóaDữ liệusau）
  const refreshRemove = async (): Promise<void> => {
    const { current } = pagination

    // xóachiaCacheđồng thờiLấynhấtmớiDữ liệu
    clearCache(CacheInvalidationStrategy.CLEAR_CURRENT, 'XóaDữ liệu')
    await getData()

    // nếuquảkhitrướctrangvìkhôngvừaKhônglàthứmộttrang，vềđếntrênmộttrang
    if (data.value.length === 0 && current > 1) {
      pagination.current = current - 1
      ;(searchParams as Record<string, unknown>)[pageKey] = current - 1
      await getData()
    }
  }

  // toànlượngLàm mới：xóakhôngnêncóCache，trùngmớiLấyDữ liệu（thíchdùngởtayđộngLàm mớiNút）
  const refreshData = async (): Promise<void> => {
    debouncedGetDataByPage.cancel()
    clearCache(CacheInvalidationStrategy.CLEAR_ALL, 'tayđộngLàm mới')
    await getData()
  }

  // nhẹlượngLàm mới：chỉxóakhôngkhitrướcTimKiemđiềuphần tửcủaCache，Duy trìPhân trangTrạng thái（thíchdùngởđịnhgiờLàm mới）
  const refreshSoft = async (): Promise<void> => {
    clearCache(CacheInvalidationStrategy.CLEAR_CURRENT, 'mềmLàm mới')
    await getData()
  }

  // HủykhitrướcVui lòngcầu
  const cancelRequest = (): void => {
    if (abortController) {
      abortController.abort()
    }
    debouncedGetDataByPage.cancel()
  }

  // xóakhôngDữ liệu
  const clearData = (): void => {
    data.value = []
    error.value = null
    clearCache(CacheInvalidationStrategy.CLEAR_ALL, 'xóakhôngDữ liệu')
  }

  // xóalýĐãquakỳcủaCacheđiềumục，giảiphóngtrongtồnkhônggian
  const clearExpiredCache = (): number => {
    if (!cache) return 0
    const cleanedCount = cache.cleanupExpired()
    if (cleanedCount > 0) {
      // tayđộngKích hoạtCacheTrạng tháiCập nhật
      cacheUpdateTrigger.value++
    }
    return cleanedCount
  }

  // CaiDatđịnhkỳxóalýquakỳCache
  if (enableCache && cache) {
    cacheCleanupTimer = setInterval(() => {
      const cleanedCount = cache.cleanupExpired()
      if (cleanedCount > 0) {
        logger.log(`từđộngxóalý ${cleanedCount} điềuquakỳCache`)
        // tayđộngKích hoạtCacheTrạng tháiCập nhật
        cacheUpdateTrigger.value++
      }
    }, cacheTime / 2) // mỗinửachiếcCachetuầnkỳxóalýmộtlần
  }

  // MountgiờtừđộngLoadingDữ liệu
  if (immediate) {
    onMounted(async () => {
      await getData()
    })
  }

  // ComponentUnmountgiờtriệtxóalý
  onUnmounted(() => {
    cancelRequest()
    if (cache) {
      cache.clear()
    }
    if (cacheCleanupTimer) {
      clearInterval(cacheCleanupTimer)
    }
  })

  // TốihóacủaQuay lạigiá trịKếtcấu
  return {
    // Dữ liệuđóng
    /** BảngDữ liệu */
    data,
    /** Dữ liệuLoadingTrạng thái */
    loading: readonly(loading),
    /** LỗiTrạng thái */
    error: readonly(error),
    /** Dữ liệulàphủvìkhông */
    isEmpty: computed(() => data.value.length === 0),
    /** làphủcóDữ liệu */
    hasData,

    // Phân trangđóng
    /** Phân trangTrạng tháiThongTin */
    pagination: readonly(pagination),
    /** DiđộngđầuPhân trangCauHinh */
    paginationMobile: mobilePagination,
    /** trangmặtKích thướcbiếnhóaXuLy */
    handleSizeChange,
    /** khitrướctrangbiếnhóaXuLy */
    handleCurrentChange,

    // TimKiemđóng - thốngmộttrướchậu tố
    /** TimKiemTham số */
    searchParams,
    /** thếđổiTimKiemTham số（thíchdùngởFormTìmhỏi，tránhmiễncũchữđoạntàngiữ） */
    replaceSearchParams,
    /** Đặt lạiTimKiemTham số */
    resetSearchParams,

    // Dữ liệuHanhDong - hơnminhChínhcủaHanhDongýảnh
    /** LoadingDữ liệu */
    fetchData: getData,
    /** LấyDữ liệu */
    getData: getDataByPage,
    /** LấyDữ liệu（Phòngrung） */
    getDataDebounced: debouncedGetDataByPage,
    /** xóakhôngDữ liệu */
    clearData,

    // Làm mớisáchlược
    /** toànlượngLàm mới：xóakhôngnêncóCache，trùngmớiLấyDữ liệu（thíchdùngởtayđộngLàm mớiNút） */
    refreshData,
    /** nhẹlượngLàm mới：chỉxóakhôngkhitrướcTimKiemđiềuphần tửcủaCache，Duy trìPhân trangTrạng thái（thíchdùngởđịnhgiờLàm mới） */
    refreshSoft,
    /** Thêm mớisauLàm mới：vềđếnthứmộttrangđồng thờixóakhôngPhân trangCache（thíchdùngởThêm mớiDữ liệusau） */
    refreshCreate,
    /** Cập nhậtsauLàm mới：Duy trìkhitrướctrang，chỉxóakhôngkhitrướcTimKiemCache（thíchdùngởCập nhậtDữ liệusau） */
    refreshUpdate,
    /** XóasauLàm mới：trínăngXuLytrangmã，tránhmiễnkhôngtrangmặt（thíchdùngởXóaDữ liệusau） */
    refreshRemove,

    // Cachekhốngchế
    /** CachethốngkếThongTin */
    cacheInfo,
    /** xóachiaCache，liệuKhôngcùngcủanghiệpvụtrườngcảnhChọntínhđịaxóalýCache： */
    clearCache,
    // chiếctrì4loạixóalýsáchlược
    // clearCache(CacheInvalidationStrategy.CLEAR_ALL, 'tayđộngLàm mới')     // xóakhôngnêncóCache
    // clearCache(CacheInvalidationStrategy.CLEAR_CURRENT, 'TimKiemDữ liệu') // chỉxóakhôngkhitrướcTimKiemđiềuphần tửcủaCache
    // clearCache(CacheInvalidationStrategy.CLEAR_PAGINATION, 'Thêm mớiDữ liệu') // xóakhôngPhân trangđóngCache
    // clearCache(CacheInvalidationStrategy.KEEP_ALL, 'Duy trìCache')      // KhôngxóalýnhiệmnàoCache
    /** xóalýĐãquakỳcủaCacheđiềumục，giảiphóngtrongtồnkhônggian */
    clearExpiredCache,

    // Vui lòngcầukhốngchế
    /** HủykhitrướcVui lòngcầu */
    cancelRequest,

    // cộtCauHinh (nếuquảgợicungrồi columnsFactory)
    ...(columnConfig && {
      /** BảngcộtCauHinh */
      columns,
      /** cộtHiển thịkhốngchế */
      columnChecks,
      /** Thêm mớicột */
      addColumn: columnConfig.addColumn,
      /** Xóacột */
      removeColumn: columnConfig.removeColumn,
      /** Chuyển đổicộtHiển thịTrạng thái */
      toggleColumn: columnConfig.toggleColumn,
      /** Cập nhậtcộtCauHinh */
      updateColumn: columnConfig.updateColumn,
      /** lôlượngCập nhậtcộtCauHinh */
      batchUpdateColumns: columnConfig.batchUpdateColumns,
      /** trùngmớixếpthứcột */
      reorderColumns: columnConfig.reorderColumns,
      /** LấyđịnhcộtCauHinh */
      getColumnConfig: columnConfig.getColumnConfig,
      /** LấynêncócộtCauHinh */
      getAllColumns: columnConfig.getAllColumns,
      /** Đặt lạinêncócộtCauHinhđếnMacDinhTrạng thái */
      resetColumns: columnConfig.resetColumns
    })
  }
}

// trùngmớiXuất fileloạikiểuvàchiếcBáo，phươngtiệnkhiếndùng
export { CacheInvalidationStrategy } from '../../utils/table/tableCache'
export type { ApiResponse, CacheItem } from '../../utils/table/tableCache'
export type { BaseRequestParams, TableError } from '../../utils/table/tableUtils'
