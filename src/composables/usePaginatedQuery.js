import { computed, ref, watch, unref } from 'vue'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'

export function usePaginatedQuery({
  queryKey,
  queryFn,
  itemsPerPage = 10,
  filters = {},
  queryOptions = {},
  useLocalPagination = false,
}) {
  const route = useRoute()
  const router = useRouter()
  const queryClient = useQueryClient()

  const localPage = ref(1)

  const lastValidTotalPages = ref(1)

  const currentPage = computed({
    get: () => {
      if (useLocalPagination) return localPage.value
      return Number(route.query.page) || 1
    },
    set: (val) => {
      if (useLocalPagination) {
        localPage.value = val
      } else {
        router.replace({
          query: { ...route.query, page: val },
        })
      }
    },
  })

  /* Search Logic */
  const searchTerm = ref(route.query.search || '')
  const debouncedSearch = ref(searchTerm.value)
  let searchTimeout

  watch(searchTerm, (val) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearch.value = val
    }, queryOptions.debounce || 300)
  })

  /* Params construction */
  /* Params construction */
  const validFilters = computed(() => unref(filters))

  const allFilters = computed(() => {
    const f = { ...validFilters.value }
    if (debouncedSearch.value) {
      f.search = debouncedSearch.value
    }
    return f
  })

  // Filters + Page + Limit
  const queryParams = computed(() => {
    // If syncing to URL, derive params from URL to ensure atomic update (Page 1 + New Filters)
    if (queryOptions.syncFiltersToUrl) {
      const { page: _page, _limit, ...otherParams } = route.query
      
      /*
       * We need to ensure we capture all potential filters from URL
       * But we also need to respect potentially complex objects in otherParams?
       * Sieve params are usually strings/arrays.
       */
      
      // Should we merge validFilters keys? No, validFilters triggered change. URL is source of truth.
      
      return {
        page: currentPage.value, // Already synced to URL/Local
        limit: unref(itemsPerPage),
        // Ensure search is included if present in URL
        ...otherParams, 
      }
    }
    
    // Legacy behavior: Derive from local state
    return {
      page: currentPage.value,
      limit: unref(itemsPerPage),
      ...allFilters.value,
    }
  })

  const { data, isLoading, isError, error, isPlaceholderData, isFetching } = useQuery({
    queryKey: computed(() => [...unref(queryKey), queryParams.value]),
    queryFn: () => queryFn(queryParams.value),
    placeholderData: keepPreviousData,
    ...queryOptions,
  })

  const paginationData = computed(() => data.value?.pagination || {})

  const totalPages = computed(() => {
    return paginationData.value.totalPages || lastValidTotalPages.value || 1
  })

  watch(
    () => paginationData.value.totalPages,
    (newTotal) => {
      if (newTotal && newTotal > 0) {
        lastValidTotalPages.value = newTotal
      }
    },
    { immediate: true },
  )

  const isPotentiallyInvalid = computed(() => {
    return currentPage.value > lastValidTotalPages.value
  })

  watch([currentPage, totalPages, isLoading, data], ([page, total, loading, currentData]) => {
    if (useLocalPagination) return
    if (!loading && currentData && page > total && total > 0) {
      router.replace({
        query: { ...route.query, page: total },
      })
    }
  })

  watch(
    [data, currentPage, totalPages, queryParams, validFilters, isPotentiallyInvalid],
    ([newData, page, total, params, invalid]) => {
      if (newData && !invalid) {
        if (page < total) {
          const nextPageParams = { ...params, page: page + 1 }
          queryClient.prefetchQuery({
            queryKey: [...unref(queryKey), nextPageParams],
            queryFn: () => queryFn(nextPageParams),
          })
        }

        if (page > 1) {
          const prevPageParams = { ...params, page: page - 1 }
          queryClient.prefetchQuery({
            queryKey: [...unref(queryKey), prevPageParams],
            queryFn: () => queryFn(prevPageParams),
          })
        }
      }
    },
  )

  const changePage = (page) => {
    const target = Math.max(1, Math.min(page, totalPages.value))
    currentPage.value = target
  }

  /*
   * Existing watcher for Page 1 reset is redundant if we use syncFiltersToUrl because URL update triggers page reset naturally?
   * No. If we update URL page=1, that triggers page reset.
   * But if syncFiltersToUrl is FALSE, we still need the existing watcher.
   * So we should make the existing watcher conditional or smarter.
   */

  // Optimize: Sync filters to URL (if enabled)
  if (queryOptions.syncFiltersToUrl) {
    console.log('[usePaginatedQuery] Sync filters enabled');
    watch(
      allFilters,
      (newFilters) => {
        const query = { ...route.query }
        
        Object.keys(newFilters).forEach(key => {
          const value = newFilters[key]
          if (value !== undefined && value !== null && value !== '') {
             // Handle arrays as comma-separated strings
             if (Array.isArray(value)) {
               if (value.length > 0) {
                 query[key] = value.join(',')
               } else {
                 delete query[key]
               }
             } else {
               query[key] = value
             }
          } else {
             delete query[key]
          }
        })
        
        if (!newFilters.search) delete query.search
        
        query.page = 1
        router.replace({ query }).catch(() => {})
      },
      { deep: true }
    )
  } else {
    // Legacy behavior
    watch(
      allFilters,
      () => {
        changePage(1)
      },
      { deep: true },
    )
  }

  const shouldShowLoading = computed(
    () =>
      unref(isLoading) ||
      isPotentiallyInvalid.value ||
      (data.value && currentPage.value > totalPages.value && totalPages.value > 0),
  )

  return {
    data: computed(() => data.value?.data || []),
    isLoading: shouldShowLoading,
    isOriginalLoading: isLoading,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    searchTerm,

    pagination: {
      currentPage,
      totalPages,
      totalCount: computed(() => paginationData.value.totalCount || 0),
      changePage,
      nextPage: () => changePage(currentPage.value + 1),
      prevPage: () => changePage(currentPage.value - 1),
      isFirstPage: computed(() => currentPage.value <= 1),
      isLastPage: computed(() => currentPage.value >= totalPages.value),
      hasNextPage: computed(() => currentPage.value < totalPages.value),
      hasPrevPage: computed(() => currentPage.value > 1),
    },
  }
}
