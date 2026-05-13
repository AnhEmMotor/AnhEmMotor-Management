<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import SEOPreview from './SEOPreview.vue'
import BlockEditor from './BlockEditor.vue'
import { useNewsStore } from '@stores/news.store'

const newsStore = useNewsStore()

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'cancel', 'auto-save'])

const form = ref({
  id: null,
  title: '',
  slug: '',
  blocks: [],
  category: 'news',
  isPublished: false,
  publishedAt: null,
  coverImageUrl: '',
  metaTitle: '',
  metaDescription: '',
  tags: [],
  relatedProducts: [],
  ...props.initialData
})

// Initialize blocks from content if available
if (props.initialData?.content) {
  const rawContent = props.initialData.content.trim()
  if (rawContent.startsWith('[') && rawContent.endsWith(']')) {
    try {
      form.value.blocks = JSON.parse(rawContent)
    } catch (e) {
      console.error("Failed to parse blocks from content", e)
      form.value.blocks = [{ id: Date.now(), type: 'text', data: { text: rawContent } }]
    }
  } else {
    form.value.blocks = [{ id: Date.now(), type: 'text', data: { text: rawContent } }]
  }
} else if (!form.value.blocks || form.value.blocks.length === 0) {
  form.value.blocks = [
    { id: Date.now(), type: 'text', data: { text: '' } }
  ]
}

// Auto-slug logic
watch(() => form.value.title, (newTitle) => {
  if (!form.value.id || !form.value.slug) {
    form.value.slug = newTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
})

// Auto-save logic
let autoSaveInterval = null
onMounted(() => {
  autoSaveInterval = setInterval(() => {
    emit('auto-save', form.value)
  }, 30000)
})

onUnmounted(() => {
  if (autoSaveInterval) clearInterval(autoSaveInterval)
})

const handleSave = (status) => {
  const isPublished = status === 'publish'
  const payload = {
    id: form.value.id,
    title: form.value.title,
    slug: form.value.slug,
    content: JSON.stringify(form.value.blocks),
    cover_image_url: form.value.coverImageUrl,
    author_name: "Admin",
    is_published: isPublished,
    meta_title: form.value.metaTitle || form.value.title,
    meta_description: form.value.metaDescription,
    meta_keywords: ""
  }
  emit('save', payload)
}

const coverImageInput = ref(null)
const triggerFileUpload = () => coverImageInput.value?.click()

const showAlert = (msg) => window.alert(msg)

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const response = await newsStore.uploadCover(file)
    // Map whatever the server returns to the coverImageUrl
    const finalUrl = response.publicUrl || response.PublicUrl || response.url || (typeof response === 'string' ? response : null)
    if (finalUrl) {
      form.value.coverImageUrl = finalUrl
    } else {
      console.error("No URL found in response", response)
    }
  } catch (err) {
    console.error("Upload failed", err)
    showAlert("Không thể tải ảnh lên. Vui lòng thử lại.")
  } finally {
    // Reset input value to allow re-uploading same file
    event.target.value = ''
  }
}

const isFullScreen = ref(false)
</script>

<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
      <div class="px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="emit('cancel')" class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
            <font-awesome-icon icon="arrow-left" />
          </button>
          <div>
            <h2 class="text-xl font-black text-gray-900 uppercase tracking-tighter italic border-none">
              {{ form.id ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới' }}
            </h2>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="w-2 h-2 rounded-full" :class="form.isPublished ? 'bg-green-500' : 'bg-orange-500'"></span>
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {{ form.isPublished ? 'Đã xuất bản' : 'Đang soạn thảo' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100">
            <font-awesome-icon icon="bolt" class="text-[10px]" />
            AI Optimize
          </button>
          <button @click="handleSave('draft')" class="px-6 py-2.5 bg-white text-gray-600 font-bold text-xs uppercase tracking-widest rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
            Lưu nháp
          </button>
          <button @click="handleSave('publish')" class="px-8 py-2.5 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2">
            <font-awesome-icon icon="paper-plane" class="text-[10px]" />
            Xuất bản
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto p-8 custom-scrollbar">
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- LEFT COLUMN -->
          <div class="lg:col-span-8 space-y-8">
            <div class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Tiêu đề bài viết</label>
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-black text-gray-300 uppercase tracking-widest">Sử dụng mẫu:</span>
                  <select class="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none hover:bg-gray-100 transition-all">
                    <option value="">Trống</option>
                    <option value="compare">So sánh xe</option>
                    <option value="review">Đánh giá kỹ thuật</option>
                    <option value="promo">Tin khuyến mãi</option>
                  </select>
                </div>
              </div>
              <input type="text" v-model="form.title" placeholder="Nhập tiêu đề hấp dẫn..." class="w-full text-3xl font-black text-gray-900 outline-none border-none bg-transparent">
            </div>

            <div class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm" :class="{ 'fixed inset-0 z-[200] m-0 rounded-none overflow-y-auto': isFullScreen }">
              <div class="flex items-center justify-between mb-6">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nội dung bài viết</label>
                <button @click="isFullScreen = !isFullScreen" class="p-2 text-gray-400 hover:text-gray-900 transition-all">
                  <font-awesome-icon :icon="isFullScreen ? 'compress' : 'expand'" />
                </button>
              </div>
              <BlockEditor v-model="form.blocks" />
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="lg:col-span-4 space-y-8">
            <!-- Publishing & Category -->
            <div class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-tighter italic border-b border-gray-50 pb-4">Thiết lập bài viết</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Danh mục</label>
                  <select v-model="form.category" class="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-xs font-black text-gray-900 uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-500/10">
                    <option value="news">Tin tức</option>
                    <option value="promotion">Khuyến mãi</option>
                    <option value="technical">Kỹ thuật</option>
                    <option value="guide">Hướng dẫn</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Single Cover Image Section -->
            <div class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div class="flex items-center justify-between border-b border-gray-50 pb-4">
                <h3 class="text-sm font-black text-gray-900 uppercase tracking-tighter italic">Ảnh đại diện</h3>
                <span class="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md">1200x630px</span>
              </div>
              
              <div 
                @click="triggerFileUpload"
                class="aspect-[1200/630] bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 hover:border-red-200 transition-all group overflow-hidden relative"
              >
                <img v-if="form.coverImageUrl" :src="form.coverImageUrl" class="w-full h-full object-cover">
                <div v-else class="text-center space-y-4">
                  <div class="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <font-awesome-icon icon="cloud-arrow-up" class="text-2xl text-gray-300 group-hover:text-red-500" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-black text-gray-900 uppercase">Tải ảnh lên</p>
                    <p class="text-[10px] font-bold text-gray-400">JPG, PNG, WEBP</p>
                  </div>
                </div>
                <div v-if="form.coverImageUrl" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span class="text-[10px] font-black text-white uppercase tracking-widest">Thay đổi ảnh</span>
                </div>
              </div>

              <input 
                type="file" 
                ref="coverImageInput" 
                class="hidden" 
                accept="image/*"
                @change="handleCoverUpload"
              >
            </div>

            <!-- SEO Section -->
            <div class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-tighter italic border-b border-gray-50 pb-4">Cấu hình SEO</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Meta Title</label>
                  <input v-model="form.metaTitle" type="text" class="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/10">
                </div>
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Meta Description</label>
                  <textarea v-model="form.metaDescription" class="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/10 h-24 resize-none"></textarea>
                </div>
                <SEOPreview 
                  :title="form.metaTitle || form.title"
                  :description="form.metaDescription"
                  :image="form.coverImageUrl"
                  :slug="form.slug"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
</style>
