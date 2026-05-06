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

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import ImgCutter from 'vue-img-cutter'

  defineOptions({ name: 'ArtCutterImg' })

  interface CutterProps {
    // Cơ bản CauHinh
    /** là phủ mô thái Khung */
    isModal?: boolean
    /** là phủ Hiển thị Thanh công cụ */
    tool?: boolean
    /** Thanh công cụ Nền màu */
    toolBgc?: string
    /** TieuDe */
    title?: string
    /** Xem trước TieuDe */
    previewTitle?: string
    /** là phủ Hiển thị Xem trước */
    showPreview?: boolean

    // thướctấcđóng
    /** Container Chiều rộng */
    boxWidth?: number
    /** Container Chiều cao */
    boxHeight?: number
    /** Cắt Chiều rộng */
    cutWidth?: number
    /** Cắt Chiều cao */
    cutHeight?: number
    /** là phủ cho phép hứa Kích thước điềuchỉnh */
    sizeChange?: boolean

    // Diđộng và Thu phóng
    /** là phủ cho phép hứa Diđộng */
    moveAble?: boolean
    /** là phủ cho phép hứa Hình ảnh Diđộng */
    imgMove?: boolean
    /** là phủ cho phép hứa Thu phóng */
    scaleAble?: boolean

    // Hình ảnh đóng
    /** là phủ Hiển thị nguyên đầu Hình ảnh */
    originalGraph?: boolean
    /** là phủ cho phép hứa vượt Tên */
    crossOrigin?: boolean
    /** văn phần tử loại kiểu */
    fileType?: 'png' | 'jpeg' | 'webp'
    /** chất lượng */
    quality?: number

    // Watermark
    /** Watermark văn quyển */
    watermarkText?: string
    /** Watermark Phông chữ Kích thước */
    watermarkFontSize?: number
    /** Watermark Màu sắc */
    watermarkColor?: string

    // nó anh ấy công năng
    /** là phủ Lưu tồn Cắt ViTri */
    saveCutPosition?: boolean
    /** là phủ Xem trước mô kiểu */
    previewMode?: boolean

    // Nhập Hình ảnh
    imgUrl?: string
  }

  interface CutterResult {
    fileName: string
    file: File
    blob: Blob
    dataURL: string
  }

  const props = withDefaults(defineProps<CutterProps>(), {
    // Cơ bản CauHinh MacDinh giá trị
    isModal: false,
    tool: true,
    toolBgc: '#fff',
    title: '',
    previewTitle: '',
    showPreview: true,

    // thướctấcđóng MacDinh giá trị
    boxWidth: 700,
    boxHeight: 458,
    cutWidth: 470,
    cutHeight: 270,
    sizeChange: true,

    // Diđộng và Thu phóng MacDinh giá trị
    moveAble: true,
    imgMove: true,
    scaleAble: true,

    // Hình ảnh đóng MacDinh giá trị
    originalGraph: true,
    crossOrigin: true,
    fileType: 'png',
    quality: 0.9,

    // Watermark MacDinh giá trị
    watermarkText: '',
    watermarkFontSize: 20,
    watermarkColor: '#ffffff',

    // nó anh ấy công năng MacDinh giá trị
    saveCutPosition: true,
    previewMode: true
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
  function preloadImage(url: string): Promise<void> {
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
  function cutterPrintImg(result: { dataURL: string }) {
    temImgPath.value = result.dataURL
  }

  // Cắt hoàn thành
  function cutDownImg(result: CutterResult) {
    emit('update:imgUrl', result.dataURL)
  }

  // Hình ảnh Loading hoàn thành
  function handleImageLoadComplete(result: any) {
    emit('imageLoadComplete', result)
  }

  // Hình ảnh Loading thất bại
  function handleImageLoadError(error: any) {
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

<style lang="scss" scoped>
  .cutter-container {
    display: flex;
    flex-flow: row wrap;

    .title {
      padding-bottom: 10px;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .cutter-component {
      margin-right: 30px;
    }

    .preview-container {
      .preview-box {
        background-color: #f5f7fa;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        overflow: hidden;

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .download-btn {
        display: block;
        margin: 20px auto;
      }
    }

    :deep(.toolBoxControl) {
      z-index: 100;
    }

    :deep(.dockMain) {
      right: 0;
      bottom: -40px;
      left: 0;
      z-index: 10;
      padding: 0;
      background-color: transparent !important;
      opacity: 1;
    }

    :deep(.copyright) {
      display: none !important;
    }

    :deep(.i-dialog-footer) {
      margin-top: 60px !important;
    }

    :deep(.dockBtn) {
      height: 26px;
      padding: 0 10px;
      font-size: 12px;
      line-height: 26px;
    }

    :deep(.dockBtnScrollBar) {
      margin: 0 10px 0 6px;
    }

    :deep(.closeIcon) {
      line-height: 15px !important;
    }
  }
</style>
