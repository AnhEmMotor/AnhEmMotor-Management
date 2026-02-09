import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})
