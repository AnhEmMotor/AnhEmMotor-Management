<script setup>
import { ref } from 'vue'
import { useNewsStore } from '@stores/news.store'

const newsStore = useNewsStore()

const showAlert = (msg) => {
  window.alert(msg)
}

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const blocks = ref(props.modelValue.length > 0 ? props.modelValue : [
  { id: Date.now(), type: 'text', data: { text: '' } }
])

const addBlock = (type, index) => {
  const newBlock = {
    id: Date.now(),
    type,
    data: getDefaultData(type)
  }
  if (index === -1) {
    blocks.value.push(newBlock)
  } else {
    blocks.value.splice(index + 1, 0, newBlock)
  }
  emitUpdate()
}

const removeBlock = (index) => {
  if (blocks.value.length > 1) {
    blocks.value.splice(index, 1)
    emitUpdate()
  }
}

const moveBlock = (index, direction) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < blocks.value.length) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[newIndex]
    blocks.value[newIndex] = temp
    emitUpdate()
  }
}

const getDefaultData = (type) => {
  switch (type) {
    case 'heading': return { level: 2, text: '' }
    case 'text': return { text: '' }
    case 'image': return { url: '', caption: '', alt: '' }
    case 'video': return { url: '', type: 'youtube' }
    case 'product': return { productId: null, name: '', price: '', image: '' }
    case 'gallery': return { images: [] }
    case 'ai-suggest': return { prompt: '', result: '' }
    default: return {}
  }
}

const emitUpdate = () => {
  emit('update:modelValue', blocks.value)
}

// Custom directive for auto-resizing textarea
const vAutosize = {
  updated: (el) => {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  },
  mounted: (el) => {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
}

defineExpose({
  addBlock
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-6 min-h-[600px] space-y-6">
    <!-- COMPACT PERSISTENT TOOLBAR (RED BOX) -->
    <div class="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-1">
        <button @click="addBlock('text', -1)" class="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 rounded-xl transition-all group">
          <font-awesome-icon icon="align-left" class="text-xs text-blue-600" />
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600">Văn bản</span>
        </button>
        <div class="w-px h-4 bg-gray-100"></div>
        <button @click="addBlock('heading', -1)" class="flex items-center gap-2 px-3 py-1.5 hover:bg-purple-50 rounded-xl transition-all group">
          <font-awesome-icon icon="heading" class="text-xs text-purple-600" />
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-purple-600">Tiêu đề</span>
        </button>
        <div class="w-px h-4 bg-gray-100"></div>
        <button @click="addBlock('image', -1)" class="flex items-center gap-2 px-3 py-1.5 hover:bg-green-50 rounded-xl transition-all group">
          <font-awesome-icon icon="image" class="text-xs text-green-600" />
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-green-600">Hình ảnh</span>
        </button>
        <div class="w-px h-4 bg-gray-100"></div>
        <button @click="addBlock('product', -1)" class="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 rounded-xl transition-all group">
          <font-awesome-icon icon="motorcycle" class="text-xs text-red-600" />
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-red-600">Thẻ Xe</span>
        </button>
        <div class="w-px h-4 bg-gray-100"></div>
        <button @click="addBlock('video', -1)" class="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-xl transition-all group">
          <font-awesome-icon icon="video" class="text-xs text-gray-700" />
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">Video</span>
        </button>
        <div class="w-px h-4 bg-gray-100"></div>
        <button @click="addBlock('ai-suggest', -1)" class="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 rounded-xl transition-all group">
          <font-awesome-icon icon="bolt" class="text-xs text-indigo-600" />
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600">AI Gợi ý</span>
        </button>
      </div>
      <div class="pr-4 flex items-center gap-2">
         <span class="text-[9px] font-black text-gray-300 uppercase tracking-widest">Editor Tools</span>
         <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
      </div>
    </div>

    <!-- BLOCKS LIST -->
    <div class="pt-6 space-y-6">
      <div v-for="(block, index) in blocks" :key="block.id" class="group relative">
      <!-- Block Controls -->
      <div class="absolute -left-12 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="moveBlock(index, -1)" class="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all">
          <font-awesome-icon icon="chevron-up" class="text-[10px]" />
        </button>
        <button @click="removeBlock(index)" class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
          <font-awesome-icon icon="trash-can" class="text-[10px]" />
        </button>
        <button @click="moveBlock(index, 1)" class="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all">
          <font-awesome-icon icon="chevron-down" class="text-[10px]" />
        </button>
      </div>

      <!-- Block Content -->
      <div class="px-4 py-2 rounded-2xl transition-all border-2 border-transparent hover:border-gray-50/50">
        <!-- HEADING BLOCK -->
        <template v-if="block.type === 'heading'">
          <input 
            v-model="block.data.text" 
            placeholder="Tiêu đề mục..."
            class="w-full bg-transparent border-none outline-none font-black text-gray-900 placeholder:text-gray-200"
            :class="block.data.level === 2 ? 'text-2xl italic uppercase tracking-tight' : 'text-xl'"
            @input="emitUpdate"
          >
        </template>

        <!-- TEXT BLOCK -->
        <template v-else-if="block.type === 'text'">
          <textarea 
            v-model="block.data.text"
            placeholder="Bắt đầu viết nội dung..."
            class="w-full bg-transparent border-none outline-none text-base text-gray-600 leading-relaxed resize-none overflow-hidden"
            rows="1"
            v-autosize
            @input="emitUpdate"
          ></textarea>
        </template>

        <!-- IMAGE BLOCK -->
        <template v-else-if="block.type === 'image'">
          <div class="space-y-3">
             <div class="aspect-video bg-gray-50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-100 flex items-center justify-center group/img relative">
                <img v-if="block.data.url" :src="block.data.url" class="w-full h-full object-cover">
                <div v-else class="text-center text-gray-300">
                   <font-awesome-icon icon="image" class="text-4xl mb-2" />
                   <p class="text-[10px] font-black uppercase tracking-widest">Tải ảnh lên</p>
                </div>
                <input 
                  type="file" 
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  @change="async e => { 
                    const file = e.target.files[0]; 
                    if(file) {
                      try {
                        const response = await newsStore.uploadCover(file);
                        block.data.url = response.publicUrl || response.PublicUrl || response.url || response;
                        emitUpdate();
                      } catch (err) {
                        console.error('Upload failed:', err);
                        showAlert('Tải ảnh lên thất bại. Vui lòng thử lại.');
                      }
                    } 
                  }"
                >
             </div>
             <div class="flex items-center gap-4 mt-2 px-4">
               <input 
                 v-model="block.data.caption" 
                 placeholder="Ghi chú ảnh..."
                 class="flex-1 text-xs font-bold text-gray-500 italic outline-none border-none bg-transparent"
                 @input="emitUpdate"
               >
               <div class="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  <span class="text-[8px] font-black text-gray-300 uppercase">ALT:</span>
                  <input 
                    v-model="block.data.alt" 
                    placeholder="SEO tag"
                    class="w-20 text-[9px] font-black text-red-400 outline-none border-none bg-transparent"
                    @input="emitUpdate"
                  >
               </div>
             </div>
          </div>
        </template>

        <!-- PRODUCT BLOCK (Special for AnhEmMotor) -->
        <template v-else-if="block.type === 'product'">
          <div class="bg-red-50/50 p-6 rounded-[2.5rem] border border-red-100 flex items-center gap-8 group/prod relative">
            <div class="w-40 h-28 rounded-3xl bg-white shadow-sm overflow-hidden border border-red-50 flex-shrink-0">
               <img v-if="block.data.image" :src="block.data.image" class="w-full h-full object-cover">
               <div v-else class="w-full h-full flex items-center justify-center text-red-200 text-3xl">
                  <font-awesome-icon icon="motorcycle" />
               </div>
            </div>
            <div class="flex-1 space-y-2">
               <input 
                 v-model="block.data.name" 
                 placeholder="Tên xe máy (VD: Honda Winner X 2024)"
                 class="w-full bg-transparent border-none outline-none text-xl font-black text-gray-900 uppercase italic"
                 @input="emitUpdate"
               >
               <div class="flex items-center gap-4">
                  <input 
                    v-model="block.data.price" 
                    placeholder="Giá bán (VD: 45.000.000đ)"
                    class="bg-transparent border-none outline-none text-lg font-black text-red-600 italic"
                    @input="emitUpdate"
                  >
                  <button class="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-red-200">Mua ngay</button>
               </div>
            </div>
          </div>
        </template>

        <!-- VIDEO BLOCK -->
        <template v-else-if="block.type === 'video'">
          <div class="space-y-4 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
             <div class="flex items-center gap-3 mb-2">
                <font-awesome-icon icon="video" class="text-red-600" />
                <span class="text-[11px] font-black text-gray-400 uppercase tracking-widest">Video Embed (YouTube / TikTok)</span>
             </div>
             <div v-if="!block.data.url" class="relative">
                <input 
                  v-model="block.data.url" 
                  placeholder="Dán link YouTube hoặc TikTok vào đây..."
                  class="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/10"
                  @input="emitUpdate"
                >
             </div>
             <div v-else class="aspect-video bg-black rounded-3xl overflow-hidden relative group/vid">
                <div class="absolute inset-0 flex items-center justify-center text-white/50">
                   <font-awesome-icon icon="play" class="text-6xl" />
                </div>
                <div class="absolute top-4 right-4 z-10 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                   <button @click="block.data.url = ''; emitUpdate()" class="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                      <font-awesome-icon icon="trash-can" />
                   </button>
                </div>
                <p class="absolute bottom-4 left-6 text-white text-[10px] font-black uppercase tracking-widest">{{ block.data.url }}</p>
             </div>
          </div>
        </template>

        <!-- AI ASSISTANT BLOCK -->
        <template v-else-if="block.type === 'ai-suggest'">
          <div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-xl shadow-indigo-100">
             <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
             <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                   <font-awesome-icon icon="robot" class="text-white" />
                </div>
                <h4 class="text-sm font-black uppercase tracking-tighter italic">AI Writing Assistant</h4>
             </div>
             <div class="space-y-4 relative z-10">
                <p class="text-xs font-bold text-white/80 leading-relaxed">Gợi ý tiêu đề chuẩn SEO cho nội dung trên:</p>
                <ul class="space-y-2">
                   <li class="p-3 bg-white/10 rounded-xl text-xs font-black cursor-pointer hover:bg-white/20 transition-all border border-white/10 flex items-center justify-between group/ai">
                      <span>1. Đánh giá chi tiết Honda Winner X 2024: Có đáng đồng tiền bát gạo?</span>
                      <font-awesome-icon icon="check" class="opacity-0 group-hover/ai:opacity-100" />
                   </li>
                   <li class="p-3 bg-white/10 rounded-xl text-xs font-black cursor-pointer hover:bg-white/20 transition-all border border-white/10 flex items-center justify-between group/ai">
                      <span>2. So sánh Winner X và SH: Lựa chọn nào cho phượt thủ 2024?</span>
                      <font-awesome-icon icon="check" class="opacity-0 group-hover/ai:opacity-100" />
                   </li>
                </ul>
                <div class="flex items-center gap-4 pt-4 border-t border-white/10">
                   <button class="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">Tóm tắt bài viết</button>
                   <button class="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">Kiểm tra lỗi chính tả</button>
                </div>
             </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.2s;
}
</style>
