import { defineStore } from 'pinia'
import { ref } from 'vue'
import bannerService from '@application/services/banner.service'

export const useBannerStore = defineStore('banner', () => {
  const isLoading = ref(false)
  const error = ref(null)
  const banners = ref([])

  const fetchBanners = async () => {
    isLoading.value = true
    try {
      const data = await bannerService.fetchBanners()
      banners.value = data || []
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createBanner = async (payload) => {
    isLoading.value = true
    try {
      return await bannerService.createBanner(payload)
    } finally {
      isLoading.value = false
    }
  }

  const deleteBanner = async (id) => {
    isLoading.value = true
    try {
      await bannerService.deleteBanner(id)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    banners,
    fetchBanners,
    createBanner,
    deleteBanner,
  }
})




