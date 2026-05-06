<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNewsStore } from '@stores/news.store'
import NewsStats from '@components/news/NewsStats.vue'
import NewsFilters from '@components/news/NewsFilters.vue'
import NewsTable from '@components/news/NewsTable.vue'
import NewsEditorForm from '@components/news/NewsEditorForm.vue'

const newsStore = useNewsStore()
const isEditing = ref(false)
const currentNews = ref(null)
const activeFilters = ref({ category: '', status: '', dateRange: '' })

// Stats calculation
const stats = computed(() => ({
  total: newsStore.newsList.length,
  published: newsStore.newsList.filter(n => n.isPublished).length,
  draft: newsStore.newsList.filter(n => !n.isPublished).length,
  totalViews: newsStore.newsList.reduce((acc, n) => acc + (n.views || 0), 0)
}))

// Filtered news list
const filteredNewsList = computed(() => {
  return newsStore.newsList.filter(news => {
    const matchCategory = !activeFilters.value.category || news.category === activeFilters.value.category
    const matchStatus = !activeFilters.value.status || 
      (activeFilters.value.status === 'published' && news.isPublished) ||
      (activeFilters.value.status === 'draft' && !news.isPublished)
    return matchCategory && matchStatus
  })
})

onMounted(() => {
  newsStore.fetchNews()
})

const openAddView = () => {
  currentNews.value = null
  isEditing.value = true
}

const openEditView = (news) => {
  currentNews.value = { ...news }
  isEditing.value = true
}

const handleSave = async (formData) => {
  try {
    if (formData.id) {
      await newsStore.updateNews(formData.id, formData)
    } else {
      await newsStore.createNews(formData)
    }
    isEditing.value = false
    newsStore.fetchNews()
  } catch (err) {
    console.error(err)
  }
}

const togglePublish = async (news) => {
  try {
    await newsStore.updateNews(news.id, { isPublished: !news.isPublished })
    newsStore.fetchNews()
  } catch (err) {
    console.error(err)
  }
}

const handleQuickView = (news) => {
  // Use local development URL for the store app
  window.open(`http://localhost:3000/news/${news.slug}`, '_blank')
}
</script>

<template>
  <div class="h-full">
    <!-- LIST VIEW -->
    <div v-if="!isEditing" class="space-y-8 animate-in fade-in duration-500">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
            Quản lý Bài viết
          </h1>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Hệ thống quản trị nội dung thông minh</p>
        </div>
        <button 
          @click="openAddView"
          class="px-8 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center gap-3 group"
        >
          <span class="text-xl group-hover:rotate-90 transition-transform">+</span> 
          Soạn bài viết mới
        </button>
      </div>

      <!-- Stats -->
      <NewsStats :stats="stats" />

      <!-- Filters -->
      <NewsFilters @filter="f => activeFilters = f" />

      <!-- Table -->
      <NewsTable 
        :news-list="filteredNewsList"
        @edit="openEditView"
        @delete="id => newsStore.deleteNews(id)"
        @toggle-publish="togglePublish"
        @quick-view="handleQuickView"
      />
    </div>

    <!-- EDITOR VIEW -->
    <div v-else class="fixed inset-0 z-[100] animate-in slide-in-from-right duration-500">
       <NewsEditorForm 
         :initial-data="currentNews"
         @save="handleSave"
         @cancel="isEditing = false"
         @auto-save="data => console.log('Auto-saving...', data)"
       />
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.5s;
}
</style>
