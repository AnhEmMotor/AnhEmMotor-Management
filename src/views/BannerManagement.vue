<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
          Quản lý Banner & Khuyến mãi
        </h1>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Thiết lập trải nghiệm thị giác cho trang chủ</p>
      </div>
      <button 
        @click="openAddModal"
        class="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2"
      >
        <span class="text-xl">+</span> Thêm Banner mới
      </button>
    </div>

    <!-- Active Banners Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div v-for="i in 2" :key="i" class="group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:border-red-500/30 transition-all">
        <div class="aspect-[21/9] bg-gray-100 relative overflow-hidden">
          <img src="https://picsum.photos/800/340" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div class="absolute top-6 left-6 flex gap-2">
            <span class="px-3 py-1 bg-green-500 text-white text-[9px] font-black uppercase rounded-full">Đang hiển thị</span>
            <span class="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-full border border-white/30">HomeTop</span>
          </div>
        </div>
        
        <div class="p-8 flex items-center justify-between">
          <div class="space-y-2">
            <h3 class="text-lg font-black text-gray-900 uppercase italic">Siêu ưu đãi Winner X - Hè 2026</h3>
            <div class="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>Từ: 01/04/2026</span>
              <span>Đến: 30/04/2026</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"><Icon name="fa6-solid:pen" /></button>
            <button class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all"><Icon name="fa6-solid:trash" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Cấu hình Banner</h2>
          <button @click="showModal = false" class="text-3xl text-gray-400 hover:text-gray-900">×</button>
        </div>

        <div class="p-8 space-y-8">
          <div class="space-y-2">
            <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Tiêu đề Banner</label>
            <input type="text" v-model="form.title" class="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="VD: Khuyến mãi tháng 4">
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Vị trí hiển thị</label>
              <select class="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none">
                <option>HomeTop (Trang chủ - Đầu)</option>
                <option>HomeMiddle (Trang chủ - Giữa)</option>
                <option>ProductSidebar (Trang sản phẩm)</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Thứ tự (Display Order)</label>
              <input type="number" class="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" value="1">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngày bắt đầu</label>
              <input type="date" class="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none">
            </div>
            <div class="space-y-2">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngày kết thúc</label>
              <input type="date" class="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none">
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Hình ảnh Banner</label>
            <div class="w-full h-40 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-all cursor-pointer">
              <span class="text-3xl mb-2">🖼️</span>
              <p class="text-[10px] font-black uppercase">Tải lên (Recommended: 1920x600)</p>
            </div>
          </div>
        </div>

        <div class="p-8 border-t border-gray-100 flex items-center justify-end gap-4">
          <button @click="showModal = false" class="px-8 py-3 bg-gray-100 text-gray-600 font-black text-[11px] uppercase tracking-widest rounded-2xl">Hủy</button>
          <button @click="handleSave" class="px-10 py-3 bg-gray-900 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-gray-200">Lưu Banner</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useBannerStore } from '@/stores/banner.store'

const bannerStore = useBannerStore()
const showModal = ref(false)
const form = reactive({
  title: '',
})

const openAddModal = () => {
  showModal.value = true
}

onMounted(() => {
  bannerStore.fetchBanners()
})

const handleSave = async () => {
  try {
    await bannerStore.createBanner({
      title: form.title,
      // ... other fields
    })
    showModal.value = false
    bannerStore.fetchBanners()
  } catch (err) {
    console.error(err)
  }
}
</script>


