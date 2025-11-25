/**
 * @file usePaginatedQuery.js
 * @description Composable tùy chỉnh cho Vue 3 và Tanstack Query để quản lý
 * logic phân trang, lọc, và prefetching dữ liệu.
 *
 * @example
 * // Bên trong component
 * import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
 * import { computed, ref } from 'vue'
 *
 * // 1. Định nghĩa các Refs cho việc phân trang và lọc
 * const page = computed(() => parseInt(route.query.page) || 1)
 * const itemsPerPage = ref(20)
 * const searchTerm = ref(route.query.search || '')
 * const selectedStatuses = ref(route.query.statuses ? route.query.statuses.split(',') : [])
 *
 * // 2. Gom các filter vào một computed object
 * const filters = computed(() => ({
 * search: searchTerm.value,
 * statuses: selectedStatuses.value,
 * }))
 *
 * // 3. Định nghĩa hàm fetch (thường là gọi API hoặc Vuex action)
 * const fetchSuppliersFn = (params) => {
 * // params sẽ là: { page, itemsPerPage, search, statuses }
 * return store.dispatch('suppliers/fetchSuppliers', params)
 * }
 *
 * // 4. Định nghĩa hàm map dữ liệu trả về
 * // Composable cần biết đâu là mảng items và đâu là tổng số lượng (count)
 * const supplierDataMapper = (data) => ({
 * items: data?.suppliers || [],
 * count: data?.count,
 * })
 *
 * // 5. Sử dụng composable
 * const {
 * items: suppliers,
 * totalPages,
 * isLoading,
 * isError,
 * error,
 * } = usePaginatedQuery({
 * queryKeyBase: ref('suppliers'), // Base key cho Tanstack Query
 * filters: filters,               // Computed ref chứa các filter
 * page: page,                     // Ref trang hiện tại
 * itemsPerPage: itemsPerPage,     // Ref số lượng mỗi trang
 * fetchFn: fetchSuppliersFn,      // Hàm gọi API
 * dataMapper: supplierDataMapper, // Hàm biến đổi dữ liệu
 * })
 *
 */
import { computed, watch, onUnmounted, isRef } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { throttle } from '@/utils/debounceThrottle'

/**
 * Quản lý logic query phân trang với Tanstack Query, bao gồm prefetching.
 * @param {object} options - Các tùy chọn cho composable.
 * @param {string|string[]|import('vue').Ref<string|string[]>} options.queryKeyBase - Key cơ sở cho query. Sẽ được tự động kết hợp với page và filters.
 * @param {object|import('vue').Ref<object>} options.filters - Một object (hoặc Ref) chứa tất cả các tham số filter (ví dụ: search, status).
 * @param {import('vue').Ref<number>} options.page - Ref của trang hiện tại.
 * @param {import('vue').Ref<number>} options.itemsPerPage - Ref của số lượng item mỗi trang.
 * @param {Function} options.fetchFn - Hàm async để fetch dữ liệu. Nhận một object chứa: { page, itemsPerPage, ...filters }.
 * @param {Function} options.dataMapper - Hàm để biến đổi dữ liệu trả về từ fetchFn. Phải trả về một object có dạng: { items: Array<any>, count: number | null }.
 * @param {number} [options.prefetchThrottleWait=600] - Thời gian (ms) throttle cho việc prefetch.
 * @param {boolean} [options.keepPreviousData=true] - Giữ dữ liệu cũ khi đang tải trang mới (khuyến nghị: true).
 * @returns {{
 * data: import('vue').Ref<any>,
 * isLoading: import('vue').Ref<boolean>,
 * isError: import('vue').Ref<boolean>,
 * error: import('vue').Ref<any>,
 * items: import('vue').ComputedRef<Array<any>>,
 * totalCount: import('vue').ComputedRef<number|null>,
 * totalPages: import('vue').ComputedRef<number|null>
 * }}
 */
export function usePaginatedQuery(options) {
  const {
    queryKeyBase,
    filters,
    page,
    itemsPerPage,
    fetchFn,
    dataMapper,
    prefetchThrottleWait = 600,
    keepPreviousData = true,
  } = options

  const queryClient = useQueryClient()

  const queryKey = computed(() => {
    const base = isRef(queryKeyBase) ? queryKeyBase.value : queryKeyBase
    const baseKey = Array.isArray(base) ? base : [base]
    return [...baseKey, page.value, isRef(filters) ? filters.value : filters]
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      fetchFn({
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        ...(isRef(filters) ? filters.value : filters),
      }),
    keepPreviousData: keepPreviousData,
  })

  const mappedData = computed(() => {
    if (!data.value) return { items: [], count: null }
    return dataMapper(data.value)
  })

  const items = computed(() => mappedData.value.items)
  const totalCount = computed(() => mappedData.value.count)

  const totalPages = computed(() => {
    if (totalCount.value == null) return null
    return Math.max(1, Math.ceil(totalCount.value / itemsPerPage.value))
  })

  const throttledPrefetch = throttle((currentPage, total) => {
    if (!data.value || !total || total <= 1) return

    const base = isRef(queryKeyBase) ? queryKeyBase.value : queryKeyBase
    const baseKey = Array.isArray(base) ? base : [base]
    const currentFilters = isRef(filters) ? filters.value : filters

    if (currentPage < total) {
      const nextPage = currentPage + 1
      queryClient.prefetchQuery({
        queryKey: [...baseKey, nextPage, currentFilters],
        queryFn: () =>
          fetchFn({
            page: nextPage,
            itemsPerPage: itemsPerPage.value,
            ...currentFilters,
          }),
      })
    }
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      queryClient.prefetchQuery({
        queryKey: [...baseKey, prevPage, currentFilters],
        queryFn: () =>
          fetchFn({
            page: prevPage,
            itemsPerPage: itemsPerPage.value,
            ...currentFilters,
          }),
      })
    }
  }, prefetchThrottleWait)

  watch(
    data,
    () => {
      if (page.value && totalPages.value) {
        throttledPrefetch(page.value, totalPages.value)
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (throttledPrefetch && throttledPrefetch.cancel) {
      throttledPrefetch.cancel()
    }
  })

  return {
    data,
    isLoading,
    isError,
    error,
    items,
    totalCount,
    totalPages,
  }
}
