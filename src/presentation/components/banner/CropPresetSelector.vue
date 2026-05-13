<template>
  <div class="flex flex-col gap-3">
    <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1">
      Tỷ lệ khung hình
    </p>
    <div class="flex flex-col gap-2">
      <button
        v-for="p in presets"
        :key="p.name"
        @click="$emit('select', p)"
        class="group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10"
        :class="selectedRatio === p.ratio ? 'bg-[#e31837] text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
      >
        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors"
          :class="selectedRatio === p.ratio ? 'border-white/20 bg-white/10' : 'border-white/5 bg-black/20'"
        >
          <font-awesome-icon :icon="p.icon" class="text-sm" />
        </div>
        <div class="flex-1 text-left">
          <p class="text-[11px] font-black uppercase tracking-tight leading-none mb-1">{{ p.name }}</p>
          <p class="text-[8px] font-bold opacity-50 uppercase tracking-widest">{{ p.label }}</p>
        </div>
        <div 
          v-if="selectedRatio === p.ratio" 
          class="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full"
        ></div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  presets: {
    type: Array,
    required: true
  },
  selectedRatio: {
    type: Number,
    default: null
  }
})

defineEmits(['select'])
</script>
