<template>
  <div class="fixed inset-0 z-[400] flex items-center justify-center p-4 lg:p-8">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-md transition-all duration-500"
      @click="$emit('close')"
    ></div>

    <div
      class="bg-white rounded-[2rem] w-full max-w-[1000px] h-fit overflow-hidden relative z-10 flex flex-col shadow-2xl border border-gray-100"
    >
      <!-- Header -->
      <div class="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-30">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <font-awesome-icon icon="crop-simple" class="text-lg" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 uppercase tracking-tight">
              Cắt chỉnh banner
            </h3>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Định dạng: <span class="text-red-600">{{ initialType === 'desktop' ? 'Desktop (1920x600)' : 'Mobile (750x1000)' }}</span>
            </p>
          </div>
        </div>
        
        <button
          @click="$emit('close')"
          class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <!-- Main Workspace -->
      <div class="p-8 flex justify-center bg-gray-50">
        <ArtCutterImg
          :imgUrl="imageSrc"
          :boxWidth="800"
          :boxHeight="500"
          :cutWidth="cropConfig.width"
          :cutHeight="cropConfig.height"
          :quality="1"
          :tool="true"
          :showPreview="false"
          :originalGraph="false"
          @update:imgUrl="handleCropSuccess"
        >
          <template #choose>
            <div class="hidden"></div>
          </template>
        </ArtCutterImg>
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 border-t border-gray-100 flex items-center justify-between bg-white">
        <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
          <font-awesome-icon icon="info-circle" class="text-blue-500" />
          Kéo thả khung để chọn vùng hiển thị, sau đó nhấn "Xác nhận" trong công cụ
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="$emit('close')"
            class="px-8 py-3 bg-gray-100 text-gray-500 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ArtCutterImg from '../ui/ArtCutterImg.vue'

const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  },
  initialType: {
    type: String,
    default: 'desktop'
  }
})

const emit = defineEmits(['close', 'apply'])

const cropConfig = computed(() => {
  if (props.initialType === 'desktop') {
    return { width: 640, height: 200 } // 3.2:1 ratio (scaled down for editor)
  }
  return { width: 300, height: 400 } // 3:4 ratio (scaled down for editor)
})

const handleCropSuccess = (dataURL) => {
  // Convert base64 to blob
  fetch(dataURL)
    .then(res => res.blob())
    .then(blob => {
      emit('apply', {
        blob,
        url: dataURL,
        type: props.initialType
      })
    })
}
</script>

<style scoped>
:deep(.cutter-container) {
  justify-content: center;
}

:deep(.cutter-component) {
  margin-right: 0 !important;
}

:deep(.img-cutter) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

:deep(.i-dialog-footer) {
  margin-top: 20px !important;
}
</style>
