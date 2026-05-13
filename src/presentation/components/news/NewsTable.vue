<script setup>
defineProps({
  newsList: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-publish', 'quick-view'])

const togglePublish = (news) => {
  emit('toggle-publish', news)
}
</script>

<template>
  <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Hình ảnh</th>
            <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Thông tin bài viết</th>
            <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Lượt xem</th>
            <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Xuất bản</th>
            <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngày cập nhật</th>
            <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="news in newsList" :key="news.id" class="hover:bg-gray-50/80 transition-colors group">
            <td class="px-6 py-4">
              <div class="relative w-24 h-14 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                <img :src="news.coverImageUrl || 'https://picsum.photos/200/120'" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button @click="emit('quick-view', news)" class="p-2 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black">
                     <font-awesome-icon icon="eye" />
                   </button>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="max-w-md">
                <p class="text-sm font-black text-gray-900 uppercase italic line-clamp-1 group-hover:text-red-600 transition-colors">{{ news.title }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[9px] font-black px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md uppercase tracking-wider">{{ news.category || 'Chưa phân loại' }}</span>
                  <span class="text-[10px] text-gray-400 font-bold tracking-tight">/{{ news.slug }}</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="chart-line" class="text-gray-300 text-xs" />
                <span class="text-sm font-black text-gray-700 italic">{{ news.views || 0 }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <button 
                @click="togglePublish(news)"
                class="w-10 h-5 rounded-full transition-all relative p-1"
                :class="news.isPublished ? 'bg-green-500' : 'bg-gray-300'"
              >
                <div class="w-3 h-3 bg-white rounded-full transition-all shadow-sm" :class="news.isPublished ? 'translate-x-5' : 'translate-x-0'"></div>
              </button>
            </td>
            <td class="px-6 py-4">
              <p class="text-[13px] font-bold text-gray-700">
                <span class="text-red-600">{{ news.updatedAt ? new Date(news.updatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : (news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--/--') }}</span>
                <span class="text-gray-300 mx-2">-</span>
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">bởi {{ news.authorName || 'Admin' }}</span>
              </p>
            </td>
            <td class="px-6 py-4 text-right space-x-1">
              <button @click="emit('quick-view', news)" class="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Xem nhanh">
                <font-awesome-icon icon="magnifying-glass" />
              </button>
              <button @click="emit('edit', news)" class="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title="Chỉnh sửa">
                <font-awesome-icon icon="pen-to-square" />
              </button>
              <button @click="emit('delete', news.id)" class="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa bài viết">
                <font-awesome-icon icon="trash-can" />
              </button>
            </td>
          </tr>
          <tr v-if="newsList.length === 0">
            <td colspan="6" class="px-6 py-20 text-center">
              <div class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 text-3xl">
                  <font-awesome-icon icon="newspaper" />
                </div>
                <p class="text-sm font-black text-gray-400 uppercase tracking-widest">Không tìm thấy bài viết nào phù hợp</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
