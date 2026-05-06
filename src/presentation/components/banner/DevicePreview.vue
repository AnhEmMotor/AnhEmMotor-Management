<template>
  <div class="flex flex-col gap-6">
    <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1">
      Xem trước thiết bị
    </p>
    
    <div class="space-y-6">
      <!-- Desktop Preview Card -->
      <div class="group relative overflow-hidden rounded-[2rem] bg-black/40 border border-white/5 p-4 transition-all hover:border-red-500/30">
        <div class="flex items-center justify-between mb-3 px-2">
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="desktop" class="text-[10px] text-gray-400" />
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Desktop View</span>
          </div>
          <span class="text-[8px] font-bold text-gray-600">1920 x 600</span>
        </div>
        
        <div class="aspect-[1920/600] w-full bg-gray-900 rounded-xl overflow-hidden relative border border-white/5 shadow-inner">
          <img 
            v-if="src" 
            :src="src" 
            class="w-full h-full object-cover"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <div class="w-1/2 h-1 bg-white/5 rounded-full animate-pulse"></div>
          </div>
          <!-- Safe Area Hint -->
          <div class="absolute inset-0 border border-dashed border-white/10 pointer-events-none m-2 rounded-lg"></div>
        </div>
      </div>

      <!-- Mobile Preview Card -->
      <div class="group relative overflow-hidden rounded-[2.5rem] bg-black/40 border border-white/5 p-4 transition-all hover:border-red-500/30 w-full max-w-[280px] mx-auto">
        <div class="flex items-center justify-between mb-3 px-2">
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="mobile-screen" class="text-[10px] text-gray-400" />
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mobile View</span>
          </div>
          <span class="text-[8px] font-bold text-gray-600">750 x 1000</span>
        </div>
        
        <div class="aspect-[750/1000] w-full bg-gray-900 rounded-[2rem] overflow-hidden relative border border-white/5 shadow-inner">
          <img 
            v-if="src" 
            :src="src" 
            class="w-full h-full object-cover"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <div class="w-1/3 h-1 bg-white/5 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  src: {
    type: String,
    default: null
  }
})
</script>
