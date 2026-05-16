<!-- Cắt ảnhComponent github: https://github.com/acccccccb/vue-img-cutter/tree/master -->
<template>
  <div class="cutter-container">
    <div class="cutter-component">
      <div class="title">{{ title }}</div>
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
          <ElButton type="primary" plain v-ripple>{{ $t('admin.t14') }}</ElButton>
        </template>
        <template #cancel>
          <ElButton type="danger" plain v-ripple>xóachia</ElButton>
        </template>
        <template #confirm>
          <!-- <ElButton type="primary" style="margin-left: 10px">Xác định</ElButton> -->
          <div></div>
        </template>
      </ImgCutter>
    </div>

    <div v-if="showPreview" class="preview-container">
      <div class="title">{{ previewTitle }}</div>
      <div
        class="preview-box"
        :style="{
          width: `${cutterProps.cutWidth}px`,
          height: `${cutterProps.cutHeight}px`
        }"
      >
        <img class="preview-img" :src="temImgPath" alt="Xem trướcảnh" v-if="temImgPath" />
      </div>
      <ElButton class="download-btn" @click="downloadImg" :disabled="!temImgPath" v-ripple
        >Tải xuốngHình ảnh</ElButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import ImgCutter from 'vue-img-cutter'

  defineOptions({ name: 'ArtCutterImg' })

  interface CutterProps {
    // Cơ bảnCauHinh
    /** làphủmôtháiKhung */
    isModal?: boolean
    /** làphủHiển thịThanh công cụ */
    tool?: boolean
    /** Thanh công cụNềnmàu */
    toolBgc?: string
    /** TieuDe */
    title?: string
    /** Xem trướcTieuDe */
    previewTitle?: string
    /** làphủHiển thịXem trước */
    showPreview?: boolean

    // thướctấcđóng
    /** ContainerChiều rộng */
    boxWidth?: number
    /** ContainerChiều cao */
    boxHeight?: number
    /** CắtChiều rộng */
    cutWidth?: number
    /** CắtChiều cao */
    cutHeight?: number
    /** làphủcho phéphứaKích thướcđiềuchỉnh */
    sizeChange?: boolean

    // DiđộngvàThu phóng
    /** làphủcho phéphứaDiđộng */
    moveAble?: boolean
    /** làphủcho phéphứaHình ảnhDiđộng */
    imgMove?: boolean
    /** làphủcho phéphứaThu phóng */
    scaleAble?: boolean

    // Hình ảnhđóng
    /** làphủHiển thịnguyênđầuHình ảnh */
    originalGraph?: boolean
    /** làphủcho phéphứavượtTên */
    crossOrigin?: boolean
    /** vănphần tửloạikiểu */
    fileType?: 'png' | 'jpeg' | 'webp'
    /** chấtlượng */
    quality?: number

    // Watermark
    /** Watermarkvănquyển */
    watermarkText?: string
    /** WatermarkPhông chữKích thước */
    watermarkFontSize?: number
    /** WatermarkMàu sắc */
    watermarkColor?: string

    // nóanh ấycôngnăng
    /** làphủLưutồnCắtViTri */
    saveCutPosition?: boolean
    /** làphủXem trướcmôkiểu */
    previewMode?: boolean

    // NhậpHình ảnh
    imgUrl?: string
  }

  interface CutterResult {
    fileName: string
    file: File
    blob: Blob
    dataURL: string
  }

  const props = withDefaults(defineProps<CutterProps>(), {
    // Cơ bảnCauHinhMacDinhgiá trị
    isModal: false,
    tool: true,
    toolBgc: '#fff',
    title: '',
    previewTitle: '',
    showPreview: true,

    // thướctấcđóngMacDinhgiá trị
    boxWidth: 700,
    boxHeight: 458,
    cutWidth: 470,
    cutHeight: 270,
    sizeChange: true,

    // DiđộngvàThu phóngMacDinhgiá trị
    moveAble: true,
    imgMove: true,
    scaleAble: true,

    // Hình ảnhđóngMacDinhgiá trị
    originalGraph: true,
    crossOrigin: true,
    fileType: 'png',
    quality: 0.9,

    // WatermarkMacDinhgiá trị
    watermarkText: '',
    watermarkFontSize: 20,
    watermarkColor: '#ffffff',

    // nóanh ấycôngnăngMacDinhgiá trị
    saveCutPosition: true,
    previewMode: true
  })

  const emit = defineEmits(['update:imgUrl', 'error', 'imageLoadComplete', 'imageLoadError'])

  const temImgPath = ref('')
  const imgCutterModal = ref()

  // kếThuocTinh：chỉnhhợpnêncóImgCuttercủaprops
  const cutterProps = computed(() => ({
    ...props,
    WatermarkText: props.watermarkText,
    WatermarkFontSize: props.watermarkFontSize,
    WatermarkColor: props.watermarkColor
  }))

  // Hình ảnhtrướcLoading
  function preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  // ban đầuđầuhóaCắtthiết bị
  async function initImgCutter() {
    if (props.imgUrl) {
      try {
        await preloadImage(props.imgUrl)
        imgCutterModal.value?.handleOpen({
          name: 'Ảnh bìaHình ảnh',
          src: props.imgUrl
        })
      } catch (error) {
        emit('error', error)
        console.error('Hình ảnhLoadingThatBai:', error)
      }
    }
  }

  // sinhmệnhtuầnkỳHook
  onMounted(() => {
    if (props.imgUrl) {
      temImgPath.value = props.imgUrl
      initImgCutter()
    }
  })

  // Lắng ngheHình ảnhURLbiếnhóa
  watch(
    () => props.imgUrl,
    (newVal) => {
      if (newVal) {
        temImgPath.value = newVal
        initImgCutter()
      }
    }
  )

  // thựcgiờXem trước
  function cutterPrintImg(result: { dataURL: string }) {
    temImgPath.value = result.dataURL
  }

  // Cắthoànthành
  function cutDownImg(result: CutterResult) {
    emit('update:imgUrl', result.dataURL)
  }

  // Hình ảnhLoadinghoànthành
  function handleImageLoadComplete(result: any) {
    emit('imageLoadComplete', result)
  }

  // Hình ảnhLoadingThatBai
  function handleImageLoadError(error: any) {
    emit('error', error)
    emit('imageLoadError', error)
  }

  // xóachianêncó
  function handleClearAll() {
    temImgPath.value = ''
  }

  // Tải xuốngHình ảnh
  function downloadImg() {
    console.log('Tải xuốngHình ảnh')
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
    }

    .cutter-component {
      margin-right: 30px;
    }

    .preview-container {
      .preview-box {
        background-color: var(--art-active-color) !important;

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
      color: var(--el-color-primary) !important;
      background-color: var(--el-color-primary-light-9) !important;
      border: 1px solid var(--el-color-primary-light-4) !important;
    }

    :deep(.dockBtnScrollBar) {
      margin: 0 10px 0 6px;
      background-color: var(--el-color-primary-light-1);
    }

    :deep(.scrollBarControl) {
      border-color: var(--el-color-primary);
    }

    :deep(.closeIcon) {
      line-height: 15px !important;
    }
  }

  .dark {
    .cutter-container {
      :deep(.toolBox) {
        border: transparent;
      }

      :deep(.dialogMain) {
        background-color: transparent !important;
      }

      :deep(.i-dialog-footer) {
        .btn {
          background-color: var(--el-color-primary) !important;
          border: transparent;
        }
      }
    }
  }
</style>
