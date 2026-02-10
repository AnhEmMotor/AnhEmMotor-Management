import { computed, watch, onUnmounted, isRef } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { throttle } from '@/utils/debounceThrottle'

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

  const { data, isLoading, isError, error, refetch } = useQuery({
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
    refetch,
    items,
    totalCount,
    totalPages,
  }
}
