import { computed, ref, reactive, watch, unref, onUnmounted } from 'vue'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'

function useDebouncedRef(sourceRef, delay = 400) {
  const debounced = ref(sourceRef.value)
  let timer = null

  watch(sourceRef, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return debounced
}

function cleanParams(obj) {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value
    }
  }
  return result
}

export function usePaginatedQuery({
  queryKey,
  queryFn,
  itemsPerPage = 10,
  filters = {},
  queryOptions = {},
  useLocalPagination = false,
  searchFields = [],
  filterFields = [],
  sortableFields = [],
}) {
  const route = useRoute()
  const router = useRouter()
  const queryClient = useQueryClient()

  const localPage = ref(1)
  const lastValidTotalPages = ref(1)
  const hasEverLoaded = ref(false)

  let isInternalRouteUpdate = false

  const isRedirecting = ref(false)

  const parseSortString = (sortStr) => {
    if (!sortStr) return {}
    const result = {}
    sortStr.split(',').forEach((part) => {
      const [field, dir] = part.split(':')
      if (field && (dir === 'asc' || dir === 'desc')) {
        result[field.trim()] = dir
      }
    })
    return result
  }

  const buildSortString = (sortObj) => {
    const parts = Object.entries(sortObj)
      .filter(([field]) => sortableFields.includes(field))
      .map(([field, dir]) => `${field}:${dir}`)
    return parts.length > 0 ? parts.join(',') : ''
  }

  const sortState = ref(useLocalPagination ? {} : parseSortString(route.query.sort))

  const toggleSort = (field) => {
    if (!sortableFields.includes(field)) return
    const current = sortState.value[field]
    const newState = { ...sortState.value }
    if (!current) {
      newState[field] = 'asc'
    } else if (current === 'asc') {
      newState[field] = 'desc'
    } else {
      delete newState[field]
    }
    sortState.value = newState
  }

  const getSortDirection = (field) => {
    return sortState.value[field] || null
  }

  const isSortable = (field) => {
    return sortableFields.includes(field)
  }

  const searchRefs = reactive({})
  const searchDebouncedRefs = {}

  searchFields.forEach(({ key, debounce: debounceMs = 400 }) => {
    const initialValue = (!useLocalPagination && route.query[key]) || ''
    const inputRef = ref(initialValue)
    const debouncedValue = useDebouncedRef(inputRef, debounceMs)
    searchRefs[key] = inputRef
    searchDebouncedRefs[key] = debouncedValue
  })

  const filterRefs = reactive({})

  filterFields.forEach(({ key }) => {
    const initialValue = (!useLocalPagination && route.query[key]) || ''
    filterRefs[key] = ref(initialValue)
  })

  const currentPage = computed({
    get: () => {
      if (useLocalPagination) return localPage.value
      return Math.max(1, Number(route.query.page) || 1)
    },
    set: (val) => {
      if (useLocalPagination) {
        localPage.value = val
      } else {
        syncToUrl({ page: val })
      }
    },
  })

  const syncToUrl = (overrides = {}) => {
    if (useLocalPagination) return

    const queryObj = { ...route.query }

    if ('page' in overrides) {
      queryObj.page = overrides.page
    }

    searchFields.forEach(({ key }) => {
      const val = searchDebouncedRefs[key].value
      if (val) {
        queryObj[key] = val
      } else {
        delete queryObj[key]
      }
    })

    filterFields.forEach(({ key }) => {
      const val = filterRefs[key]
      if (val !== '' && val !== null && val !== undefined) {
        queryObj[key] = val
      } else {
        delete queryObj[key]
      }
    })

    const sortStr = buildSortString(sortState.value)
    if (sortStr) {
      queryObj.sort = sortStr
    } else {
      delete queryObj.sort
    }

    Object.entries(overrides).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        queryObj[k] = v
      } else {
        delete queryObj[k]
      }
    })

    isInternalRouteUpdate = true
    isRedirecting.value = true
    router.replace({ query: queryObj }).finally(() => {
      isInternalRouteUpdate = false
      setTimeout(() => {
        isRedirecting.value = false
      }, 0)
    })
  }

  if (!useLocalPagination) {
    watch(
      () => route.query,
      (newQuery) => {
        if (isInternalRouteUpdate) return

        searchFields.forEach(({ key }) => {
          const urlVal = newQuery[key] || ''
          if (searchRefs[key] !== urlVal) {
            searchRefs[key] = urlVal
          }
          if (searchDebouncedRefs[key].value !== urlVal) {
            searchDebouncedRefs[key].value = urlVal
          }
        })
        filterFields.forEach(({ key }) => {
          const urlVal = newQuery[key] || ''
          if (filterRefs[key] !== urlVal) {
            filterRefs[key] = urlVal
          }
        })

        const newSort = parseSortString(newQuery.sort)
        sortState.value = newSort
      },
      { deep: true },
    )
  }

  searchFields.forEach(({ key }) => {
    watch(searchDebouncedRefs[key], () => {
      if (!useLocalPagination) {
        syncToUrl({ page: 1 })
      } else {
        localPage.value = 1
      }
    })
  })

  filterFields.forEach(({ key }) => {
    watch(
      () => filterRefs[key],
      () => {
        if (!useLocalPagination) {
          syncToUrl({ page: 1 })
        } else {
          localPage.value = 1
        }
      },
    )
  })

  watch(
    sortState,
    () => {
      if (!useLocalPagination) {
        syncToUrl({ page: 1 })
      } else {
        localPage.value = 1
      }
    },
    { deep: true },
  )

  const validFilters = computed(() => unref(filters))

  const queryParams = computed(() => {
    const params = {
      page: currentPage.value,
      limit: unref(itemsPerPage),
      ...validFilters.value,
    }

    searchFields.forEach(({ key }) => {
      const val = searchDebouncedRefs[key].value
      if (val) params[key] = val
    })

    filterFields.forEach(({ key }) => {
      const val = filterRefs[key]
      if (val !== '' && val !== null && val !== undefined) {
        params[key] = val
      }
    })

    const sortStr = buildSortString(sortState.value)
    if (sortStr) params.sort = sortStr

    return cleanParams(params)
  })

  const { data, isLoading, isError, error, isPlaceholderData, isFetching } = useQuery({
    queryKey: computed(() => [...unref(queryKey), queryParams.value]),
    queryFn: () => queryFn(queryParams.value),
    placeholderData: keepPreviousData,
    ...queryOptions,
  })

  const paginationData = computed(() => data.value?.pagination || {})

  const totalPages = computed(() => {
    const pages = paginationData.value.totalPages
    if (typeof pages === 'number') return pages
    return lastValidTotalPages.value || 1
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

  watch(
    data,
    (val) => {
      if (val) {
        hasEverLoaded.value = true
      }
    },
    { immediate: true },
  )

  const isPotentiallyInvalid = computed(() => {
    return currentPage.value > lastValidTotalPages.value
  })

  if (!useLocalPagination) {
    watch(
      () => Number(route.query.page),
      (rawPage) => {
        if (!Number.isNaN(rawPage) && rawPage < 1) {
          syncToUrl({ page: 1 })
        }
      },
      { immediate: true },
    )
  }

  watch([currentPage, totalPages, isLoading, data], ([page, total, loading, currentData]) => {
    if (useLocalPagination) return
    if (!loading && currentData && page > total && total > 0) {
      syncToUrl({ page: total })
    }
  })

  watch(
    [data, currentPage, totalPages, queryParams, isPotentiallyInvalid],
    ([newData, page, total, params, invalid]) => {
      if (newData && !invalid) {
        if (page < total) {
          const nextPageParams = { ...params, page: page + 1 }
          queryClient.prefetchQuery({
            queryKey: [...unref(queryKey), nextPageParams],
            queryFn: () => queryFn(nextPageParams),
            staleTime: 5000,
          })
        }

        if (page > 1) {
          const prevPageParams = { ...params, page: page - 1 }
          queryClient.prefetchQuery({
            queryKey: [...unref(queryKey), prevPageParams],
            queryFn: () => queryFn(prevPageParams),
            staleTime: 5000,
          })
        }
      }
    },
  )

  const changePage = (page) => {
    const target = Math.max(1, Math.min(page, totalPages.value))
    currentPage.value = target
  }
  const shouldShowLoading = computed(() => {
    if (isRedirecting.value) return true

    if (unref(totalPages) > 0 && currentPage.value > unref(totalPages)) {
      return true
    }

    const currentData = data.value?.data || []
    if (unref(isFetching) && currentData.length === 0) {
      return true
    }

    return !hasEverLoaded.value && (unref(isLoading) || isPotentiallyInvalid.value)
  })

  return {
    data: computed(() => data.value?.data || []),
    isLoading: shouldShowLoading,
    isOriginalLoading: isLoading,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    searchRefs,
    filterRefs,
    sortState,
    toggleSort,
    getSortDirection,
    isSortable,
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
