import { defineStore } from 'pinia'
import { ref } from 'vue'
import newsService from '@application/services/news.service'

export const useNewsStore = defineStore('news', () => {
  const isLoading = ref(false)
  const error = ref(null)
  const newsList = ref([])

  const fetchNews = async (params) => {
    isLoading.value = true
    try {
      const data = await newsService.fetchNews(params)
      newsList.value = data.items || []
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createNews = async (payload) => {
    isLoading.value = true
    try {
      return await newsService.createNews(payload)
    } finally {
      isLoading.value = false
    }
  }

  const updateNews = async (id, payload) => {
    isLoading.value = true
    try {
      return await newsService.updateNews(id, payload)
    } finally {
      isLoading.value = false
    }
  }

  const uploadCover = async (file) => {
    isLoading.value = true
    try {
      return await newsService.uploadCover(file)
    } finally {
      isLoading.value = false
    }
  }

  const deleteNews = async (id) => {
    isLoading.value = true
    try {
      await newsService.deleteNews(id)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    newsList,
    fetchNews,
    createNews,
    updateNews,
    uploadCover,
    deleteNews,
  }
})





