<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
        Quản lý Bài viết & Tin tức
      </h1>
      <button 
        @click="openAddModal"
        class="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2"
      >
        <span class="text-xl">+</span> Soạn bài viết mới
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng bài viết</p>
        <p class="text-3xl font-black text-gray-900 italic">24</p>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Đã xuất bản</p>
        <p class="text-3xl font-black text-green-600 italic">18</p>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Bản nháp</p>
        <p class="text-3xl font-black text-orange-500 italic">6</p>
      </div>
    </div>

    <!-- News List Table -->
    <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Hình ảnh</th>
              <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Tiêu đề</th>
              <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Tác giả</th>
              <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Trạng thái</th>
              <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngày đăng</th>
              <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="i in 5" :key="i" class="hover:bg-gray-50/80 transition-colors group">
              <td class="px-6 py-4">
                <div class="w-20 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-100">
                  <img src="https://picsum.photos/200/120" class="w-full h-full object-cover" />
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-black text-gray-900 uppercase italic line-clamp-1">Kỹ thuật bảo dưỡng xe côn tay đúng cách</p>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">/ky-thuat-bao-duong-xe-con-tay</p>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-bold text-gray-600">Anh Em Motor Admin</span>
              </td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full border border-green-100">Đã đăng</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 font-medium">19/04/2026</td>
              <td class="px-6 py-4 text-right space-x-2">
                <button class="p-2 text-gray-400 hover:text-blue-600 transition-colors"><IconEdit class="h-4 w-4" /></button>
                <button class="p-2 text-gray-400 hover:text-red-600 transition-colors"><IconTrash class="h-4 w-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Editor Modal (Mockup) -->
    <div v-if="showEditor" class="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-10">
      <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        <div class="p-8 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Soạn thảo nội dung</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tạo bài viết tư vấn kỹ thuật & tin tức</p>
          </div>
          <button @click="showEditor = false" class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
            <span class="text-2xl">×</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <!-- Main Content -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2 space-y-6">
              <div class="space-y-2">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Tiêu đề bài viết</label>
                <input type="text" v-model="form.title" class="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none transition-all" placeholder="Nhập tiêu đề hấp dẫn...">
              </div>
              
              <div class="space-y-2">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Nội dung chi tiết</label>
                <div class="w-full h-[400px] bg-gray-50 border-2 border-transparent rounded-3xl p-6 text-sm font-medium text-gray-600 overflow-y-auto">
                  <!-- Real editor would go here -->
                  Nội dung bài viết...
                </div>
              </div>
            </div>

            <!-- Sidebar Info -->
            <div class="space-y-8">
              <div class="space-y-4">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Hình ảnh bìa (Cover)</label>
                <div class="aspect-video w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-all cursor-pointer overflow-hidden group">
                  <div class="text-center group-hover:scale-110 transition-transform">
                    <span class="text-3xl block mb-2">📸</span>
                    <p class="text-[10px] font-black uppercase">Tải ảnh lên</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">SEO Metadata</label>
                <div class="p-6 rounded-3xl bg-gray-50 space-y-4">
                  <input type="text" placeholder="Meta Title" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-red-500/20">
                  <textarea placeholder="Meta Description" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-red-500/20 h-24"></textarea>
                  <input type="text" placeholder="Keywords (phân cách bằng dấu phẩy)" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-red-500/20">
                </div>
              </div>

              <div class="flex items-center justify-between p-6 rounded-3xl bg-red-50 border border-red-100">
                <span class="text-[11px] font-black text-red-700 uppercase tracking-widest italic">Xuất bản ngay</span>
                <button 
                  @click="form.isPublished = !form.isPublished"
                  class="w-12 h-6 rounded-full transition-all relative p-1"
                  :class="form.isPublished ? 'bg-red-600' : 'bg-gray-300'"
                >
                  <div class="w-4 h-4 bg-white rounded-full transition-all shadow-sm" :class="form.isPublished ? 'translate-x-6' : 'translate-x-0'"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 border-t border-gray-100 flex items-center justify-end gap-4 flex-shrink-0">
          <button @click="showEditor = false" class="px-8 py-3 bg-gray-100 text-gray-600 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">Hủy bỏ</button>
          <button @click="handleSave" class="px-10 py-3 bg-red-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200">Lưu & Đăng bài</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useNewsStore } from '@/stores/news.store'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconTrash from '@/assets/icons/IconTrash.svg'

const newsStore = useNewsStore()
const showEditor = ref(false)
const form = reactive({
  title: '',
  content: '',
  isPublished: true
})

const openAddModal = () => {
  showEditor.value = true
}

onMounted(() => {
  newsStore.fetchNews()
})

const handleSave = async () => {
  try {
    await newsStore.createNews({
      title: form.title,
      content: form.content,
      is_published: form.isPublished
    })
    showEditor.value = false
    newsStore.fetchNews()
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e5e7eb;
}
</style>


