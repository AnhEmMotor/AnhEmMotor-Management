<!-- ThẻComponent -->
<template>
  <div class="art-card-sm flex-c flex-col pb-6" :style="{ height: height }">
    <div class="flex-c flex-col gap-4 text-center">
      <div class="w-45">
        <img :src="image" :alt="title" class="w-full h-full object-contain" />
      </div>
      <div class="box-border px-4">
        <p class="mb-2 text-lg font-semibold text-g-800">{{ title }}</p>
        <p class="m-0 text-sm text-g-600">{{ description }}</p>
      </div>
      <div class="flex-c gap-3">
        <div
          v-if="cancelButton?.show"
          class="inline-block h-9 px-3 text-sm/9 c-p select-none rounded-md border border-g-300"
          :style="{
            backgroundColor: cancelButton?.color,
            color: cancelButton?.textColor
          }"
          @click="handleCancel"
        >
          {{ cancelButton?.text }}
        </div>
        <div
          v-if="button?.show"
          class="inline-block h-9 px-3 text-sm/9 c-p select-none rounded-md"
          :style="{ backgroundColor: button?.color, color: button?.textColor }"
          @click="handleClick"
        >
          {{ button?.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // Nhập fileMacDinhIcon
  import defaultIcon from '@imgs/3d/icon1.webp'

  defineOptions({ name: 'ArtCardBanner' })

  // Định nghĩaThẻComponentcủaThuocTinhGiao diện (Interface)
  interface CardBannerProps {
    /** Chiều cao */
    height?: string
    /** Hình ảnhđường */
    image?: string
    /** TieuDevănquyển */
    title: string
    /** Mô tảvănquyển */
    description: string
    /** chủNútCauHinh */
    button?: {
      /** làphủHiển thị */
      show?: boolean
      /** Nútvănquyển */
      text?: string
      /** NềnMàu sắc */
      color?: string
      /** VanBanMàu sắc */
      textColor?: string
    }
    /** HủyNútCauHinh */
    cancelButton?: {
      /** làphủHiển thị */
      show?: boolean
      /** Nútvănquyển */
      text?: string
      /** NềnMàu sắc */
      color?: string
      /** VanBanMàu sắc */
      textColor?: string
    }
  }

  // Định nghĩaComponentThuocTinhMacDinhgiá trị
  withDefaults(defineProps<CardBannerProps>(), {
    height: '24rem',
    image: defaultIcon,
    title: '',
    description: '',
    // chủNútMacDinhCauHinh
    button: () => ({
      show: true,
      text: 'XemChiTiet',
      color: 'var(--theme-color)',
      textColor: '#fff'
    }),
    // HủyNútMacDinhCauHinh
    cancelButton: () => ({
      show: false,
      text: 'Hủy',
      color: '#f5f5f5',
      textColor: '#666'
    })
  })

  // Định nghĩaComponentSuKien
  const emit = defineEmits<{
    (e: 'click'): void // chủNútNhấnSuKien
    (e: 'cancel'): void // HủyNútNhấnSuKien
  }>()

  // chủNútNhấnXuLyHàm
  const handleClick = () => {
    emit('click')
  }

  // HủyNútNhấnXuLyHàm
  const handleCancel = () => {
    emit('cancel')
  }
</script>
