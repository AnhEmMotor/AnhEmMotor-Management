import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, 
      gcTime: Infinity,
      refetchOnWindowFocus: true,
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