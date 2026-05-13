<script setup>
defineProps({
  title: String,
  description: String,
  image: String,
  slug: String
})
</script>

<template>
  <div class="space-y-4">
    <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Xem trước trên mạng xã hội</label>
    <div class="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      <div class="aspect-video bg-gray-100 overflow-hidden">
        <img v-if="image" :src="image" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
          <font-awesome-icon icon="image" class="text-4xl" />
        </div>
      </div>
      <div class="p-4 bg-gray-50/50">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">anhemmotor.com.vn</p>
        <h4 class="text-sm font-black text-gray-900 line-clamp-1 mb-1">{{ title || 'Tiêu đề bài viết sẽ hiển thị ở đây' }}</h4>
        <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">{{ description || 'Mô tả ngắn của bài viết giúp tăng tỷ lệ click khi chia sẻ trên Zalo, Facebook...' }}</p>
      </div>
    </div>
    
    <div class="p-4 rounded-2xl bg-blue-50 border border-blue-100">
      <div class="flex items-center gap-2 mb-2">
        <font-awesome-icon :icon="['fab', 'google']" class="text-blue-600 text-xs" />
        <span class="text-[10px] font-black text-blue-800 uppercase tracking-widest">Google Search Preview</span>
      </div>
      <p class="text-[11px] text-green-700 mb-0.5">https://anhemmotor.com.vn/news/{{ slug || 'duong-dan-bai-viet' }}</p>
      <h5 class="text-sm text-blue-700 font-bold hover:underline cursor-pointer line-clamp-1 mb-1">{{ title || 'Tiêu đề chuẩn SEO' }}</h5>
      <p class="text-xs text-gray-600 line-clamp-2">{{ description || 'Nội dung mô tả sẽ xuất hiện trong kết quả tìm kiếm của Google...' }}</p>
    </div>
  </div>
</template>
