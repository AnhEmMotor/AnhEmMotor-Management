import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, 
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false
        }
        return failureCount < 2 
      },
      refetchOnReconnect: true,
    },
  },
})