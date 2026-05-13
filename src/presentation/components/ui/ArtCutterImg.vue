<!-- Cắt ảnh Component github: https://github.com/acccccccb/vue-img-cutter/tree/master -->
<template>
  <div class="cutter-container">
    <div class="cutter-component">
      <div v-if="title" class="title">{{ title }}</div>
      <ImgCutter
        ref="imgCutterModal"
        @cutDown="cutDownImg"
        @onPrintImg="cutterPrintImg"
        @onImageLoadComplete="handleImageLoadComplete"
        @onImageLoadError="handleImageLoadError"
        @onClearAll="handleClearAll"
        v-bind="cutterProps"
        class="img-cutter"
      >
        <template #choose>
          <slot name="choose">
            <ElButton type="primary" plain>Chọn ảnh</ElButton>
          </slot>
        </template>
        <template #cancel>
          <slot name="cancel">
            <ElButton type="danger" plain>Xóa tất cả</ElButton>
          </slot>
        </template>
        <template #confirm>
          <slot name="confirm">
             <div></div>
          </slot>
        </template>
      </ImgCutter>
    </div>

    <div v-if="showPreview" class="preview-container">
      <div v-if="previewTitle" class="title">{{ previewTitle }}</div>
      <div
        class="preview-box"
        :style="{
          width: `${cutterProps.cutWidth}px`,
          height: `${cutterProps.cutHeight}px`
        }"
      >
        <img class="preview-img" :src="temImgPath" alt="Xem trước ảnh" v-if="temImgPath" />
      </div>
      <ElButton class="download-btn" @click="downloadImg" :disabled="!temImgPath"
        >Tải xuống hình ảnh</ElButton
      >
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import ImgCutter from 'vue-img-cutter'

  defineOptions({ name: 'ArtCutterImg' })

  const props = defineProps({
    // Cơ bản CauHinh
    isModal: { type: Boolean, default: false },
    tool: { type: Boolean, default: true },
    toolBgc: { type: String, default: '#fff' },
    title: { type: String, default: '' },
    previewTitle: { type: String, default: '' },
    showPreview: { type: Boolean, default: true },

    // thướctấcđóng
    boxWidth: { type: Number, default: 700 },
    boxHeight: { type: Number, default: 458 },
    cutWidth: { type: Number, default: 470 },
    cutHeight: { type: Number, default: 270 },
    sizeChange: { type: Boolean, default: true },

    // Diđộng và Thu phóng
    moveAble: { type: Boolean, default: true },
    imgMove: { type: Boolean, default: true },
    scaleAble: { type: Boolean, default: true },

    // Hình ảnh đóng
    originalGraph: { type: Boolean, default: true },
    crossOrigin: { type: Boolean, default: true },
    fileType: { type: String, default: 'png' },
    quality: { type: Number, default: 0.9 },

    // Watermark
    watermarkText: { type: String, default: '' },
    watermarkFontSize: { type: Number, default: 20 },
    watermarkColor: { type: String, default: '#ffffff' },

    // nó anh ấy công năng
    saveCutPosition: { type: Boolean, default: true },
    previewMode: { type: Boolean, default: true },

    // Nhập Hình ảnh
    imgUrl: { type: String, default: '' }
  })

  const emit = defineEmits(['update:imgUrl', 'error', 'imageLoadComplete', 'imageLoadError'])

  const temImgPath = ref('')
  const imgCutterModal = ref()

  // kế ThuocTinh：chỉnh hợp nên có ImgCutter của props
  const cutterProps = computed(() => ({
    ...props,
    WatermarkText: props.watermarkText,
    WatermarkFontSize: props.watermarkFontSize,
    WatermarkColor: props.watermarkColor
  }))

  // Hình ảnh trước Loading
  function preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  // ban đầu đầu hóa Cắt thiết bị
  async function initImgCutter() {
    if (props.imgUrl) {
      try {
        await preloadImage(props.imgUrl)
        imgCutterModal.value?.handleOpen({
          name: 'Ảnh banner',
          src: props.imgUrl
        })
      } catch (error) {
        emit('error', error)
        console.error('Hình ảnh Loading thất bại:', error)
      }
    }
  }

  // sinhmệnhtuầnkỳ Hook
  onMounted(() => {
    if (props.imgUrl) {
      temImgPath.value = props.imgUrl
      initImgCutter()
    }
  })

  // Lắng nghe Hình ảnh URL biếnhóa
  watch(
    () => props.imgUrl,
    (newVal) => {
      if (newVal) {
        temImgPath.value = newVal
        initImgCutter()
      }
    }
  )

  // thực giờ Xem trước
  function cutterPrintImg(result) {
    temImgPath.value = result.dataURL
  }

  // Cắt hoàn thành
  function cutDownImg(result) {
    emit('update:imgUrl', result.dataURL)
  }

  // Hình ảnh Loading hoàn thành
  function handleImageLoadComplete(result) {
    emit('imageLoadComplete', result)
  }

  // Hình ảnh Loading thất bại
  function handleImageLoadError(error) {
    emit('error', error)
    emit('imageLoadError', error)
  }

  // xóa chia nên có
  function handleClearAll() {
    temImgPath.value = ''
  }

  // Tải xuống Hình ảnh
  function downloadImg() {
    const a = document.createElement('a')
    a.href = temImgPath.value
    a.download = 'image.png'
    a.click()
  }
</script>

<style scoped>
  .cutter-container {
    display: flex;
    flex-flow: row wrap;
  }

  .cutter-container .title {
    padding-bottom: 10px;
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }

  .cutter-container .cutter-component {
    margin-right: 30px;
  }

  .cutter-container .preview-container .preview-box {
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
  }

  .cutter-container .preview-container .preview-box .preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .cutter-container .preview-container .download-btn {
    display: block;
    margin: 20px auto;
  }

  .cutter-container :deep(.toolBoxControl) {
    z-index: 100;
  }

  .cutter-container :deep(.dockMain) {
    right: 0;
    bottom: -40px;
    left: 0;
    z-index: 10;
    padding: 0;
    background-color: transparent !important;
    opacity: 1;
  }

  .cutter-container :deep(.copyright) {
    display: none !important;
  }

  .cutter-container :deep(.i-dialog-footer) {
    margin-top: 60px !important;
  }

  .cutter-container :deep(.dockBtn) {
    height: 26px;
    padding: 0 10px;
    font-size: 12px;
    line-height: 26px;
  }

  .cutter-container :deep(.dockBtnScrollBar) {
    margin: 0 10px 0 6px;
  }

  .cutter-container :deep(.closeIcon) {
    line-height: 15px !important;
  }
</style>
