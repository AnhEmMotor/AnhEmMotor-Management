<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
          <font-awesome-icon icon="newspaper" class="text-xl" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng bài viết</p>
          <p class="text-2xl font-black text-gray-900 italic">{{ stats.total }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
          <font-awesome-icon icon="check-circle" class="text-xl" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đã xuất bản</p>
          <p class="text-2xl font-black text-green-600 italic">{{ stats.published }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
          <font-awesome-icon icon="pencil" class="text-xl" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bản nháp</p>
          <p class="text-2xl font-black text-orange-500 italic">{{ stats.draft }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
          <font-awesome-icon icon="eye" class="text-xl" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng lượt xem</p>
          <p class="text-2xl font-black text-purple-600 italic">{{ stats.totalViews.toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
