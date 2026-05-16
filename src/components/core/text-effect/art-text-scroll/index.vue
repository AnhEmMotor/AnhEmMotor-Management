<!-- VanBanCuộn -->
<template>
  <div
    ref="containerRef"
    class="relative overflow-hidden rounded-custom-sm border flex-c box-border text-sm"
    :class="themeClasses"
    :style="containerStyle"
  >
    <div class="flex-cc absolute left-0 h-full w-9 z-10" :style="{ backgroundColor: bgColor }">
      <ArtSvgIcon icon="ri:volume-down-line" class="text-lg" />
    </div>

    <div
      ref="contentRef"
      class="whitespace-nowrap inline-block transition-opacity duration-600 [&_a]:text-danger [&_a:hover]:underline [&_a:hover]:text-danger/80 px-9"
      :class="[contentClass, { 'opacity-0': !isReady, 'opacity-100': isReady }]"
      :style="contentStyle"
      @click="handleContentClick"
    >
      <!-- nguyênđầuNoiDung -->
      <span ref="textRef" class="inline-block">
        <slot>
          <span v-html="text"></span>
        </slot>
      </span>
      <!-- khắcNoiDungdùngởvôkheVòng lặp -->
      <span v-if="shouldClone" class="inline-block" :style="cloneSpacing">
        <slot>
          <span v-html="text"></span>
        </slot>
      </span>
    </div>

    <div
      v-if="showClose"
      class="flex-cc absolute right-0 h-full w-9 c-p"
      :style="{ backgroundColor: bgColor }"
      @click="handleClose"
    >
      <ArtSvgIcon icon="ri:close-fill" class="text-lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    useElementSize,
    useRafFn,
    useElementHover,
    useDebounceFn,
    useTimeoutFn
  } from '@vueuse/core'
  import { useSettingStore } from '@/store/modules/setting'

  type ThemeType =
    | 'theme'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'

  /**
   * vănquyểnCuộnComponentThuocTinhGiao diện (Interface)
   */
  export interface TextScrollProps {
    /** CuộnvănquyểnNoiDung */
    text?: string
    /** ChuDeloạikiểu */
    type?: ThemeType
    /** Cuộnphươnghướng */
    direction?: 'left' | 'right' | 'up' | 'down'
    /** CuộnTốc độ，đơnvị：tượngtố/giây */
    speed?: number
    /** ContainerChiều rộng */
    width?: string
    /** ContainerChiều cao */
    height?: string
    /** ChuộttiêutreodừnggiờlàphủTamDungCuộn */
    pauseOnHover?: boolean
    /** làphủHiển thịđóngđóngNút */
    showClose?: boolean
    /** đầucuốiCuộn（làkhiếnVanBanChưatrànra） */
    alwaysScroll?: boolean
  }

  const props = withDefaults(defineProps<TextScrollProps>(), {
    text: '',
    direction: 'left',
    speed: 80,
    width: '100%',
    height: '36px',
    pauseOnHover: true,
    type: 'theme',
    showClose: false,
    alwaysScroll: true
  })

  const emit = defineEmits<{
    close: []
  }>()

  const handleClose = () => {
    emit('close')
  }

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)

  const containerRef = ref<HTMLElement>()
  const contentRef = ref<HTMLElement>()
  const textRef = ref<HTMLElement>()
  const isReady = ref(false)

  const currentPosition = ref(0)
  const textSize = ref(0)
  const containerSize = ref(0)
  const shouldClone = ref(false)

  const isHorizontal = computed(() => props.direction === 'left' || props.direction === 'right')
  const isReverse = computed(() => props.direction === 'right' || props.direction === 'down')

  // khiếndùng VueUse của useElementSize Lắng ngheContainerthướctấcbiếnhóa
  const { width: containerWidth, height: containerHeight } = useElementSize(containerRef)

  // khiếndùng VueUse của useElementHover đoChuộttiêutreodừng
  const isHovered = useElementHover(containerRef)

  // kếlàphủứngnênTamDungHoatAnh
  const isPaused = computed(() => {
    // nếuquảChưaBật alwaysScroll，vừaVanBanChưasiêuraContainer，TamDungCuộn
    if (!props.alwaysScroll && textSize.value <= containerSize.value) {
      return true
    }
    return props.pauseOnHover && isHovered.value
  })

  // ChuDeKiểu dángảnhxạ
  const themeClasses = computed(() => {
    const themeMap: Record<ThemeType, string> = {
      theme: 'text-theme/90 !border-theme/50',
      primary: 'text-primary/90 !border-primary/50',
      secondary: 'text-secondary/90 !border-secondary/50',
      error: 'text-error/90 !border-error/50',
      info: 'text-info/90 !border-info/50',
      success: 'text-success/90 !border-success/50',
      warning: 'text-warning/90 !border-warning/50',
      danger: 'text-danger/90 !border-danger/50'
    }
    return themeMap[props.type] || themeMap.theme
  })

  // Nềnmàu
  const bgColor = computed(
    () =>
      `color-mix(in oklch, var(--color-${props.type}) ${isDark.value ? '25' : '10'}%, var(--art-color))`
  )

  const containerStyle = computed(() => ({
    width: props.width,
    height: props.height,
    backgroundColor: bgColor.value
  }))

  const contentClass = computed(() => {
    if (!isHorizontal.value) {
      return 'flex flex-col'
    }
    return ''
  })

  const contentStyle = computed(() => {
    const transform = isHorizontal.value
      ? `translateX(${currentPosition.value}px)`
      : `translateY(${currentPosition.value}px)`

    return {
      transform,
      willChange: 'transform'
    }
  })

  // khắcnguyêntốcủagian
  const cloneSpacing = computed(() => {
    const spacing = '2em'
    return isHorizontal.value ? { marginLeft: spacing } : { marginTop: spacing }
  })

  const measureSizes = () => {
    if (!containerRef.value || !textRef.value) return

    const text = textRef.value

    if (isHorizontal.value) {
      containerSize.value = containerWidth.value
      textSize.value = text.offsetWidth
    } else {
      containerSize.value = containerHeight.value
      textSize.value = text.offsetHeight
    }

    const isOverflow = textSize.value > containerSize.value
    shouldClone.value = isOverflow

    // cưtrongHiển thị
    currentPosition.value = (containerSize.value - textSize.value) / 2

    // đolượnghoànthànhsaumớiHiển thịNoiDung
    if (!isReady.value) {
      isReady.value = true
    }
  }

  // khiếndùng VueUse của useDebounceFn Phòngrungđolượng
  const debouncedMeasure = useDebounceFn(measureSizes, 150)

  let lastTimestamp = 0

  // khiếndùng VueUse của useRafFn thếđạitayđộng requestAnimationFrame
  const { pause, resume } = useRafFn(
    ({ timestamp }) => {
      if (!lastTimestamp) lastTimestamp = timestamp

      if (!isPaused.value) {
        const delta = (timestamp - lastTimestamp) / 1000
        const distance = props.speed * delta
        const spacing = textSize.value * 0.1

        currentPosition.value += isReverse.value ? distance : -distance

        // Vòng lặpbiêngiaođo
        if (isReverse.value) {
          if (currentPosition.value > containerSize.value) {
            currentPosition.value = -(textSize.value + spacing)
          }
        } else {
          if (currentPosition.value < -(textSize.value + spacing)) {
            currentPosition.value = containerSize.value
          }
        }
      }

      lastTimestamp = timestamp
    },
    { immediate: false }
  )

  const handleContentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'A') {
      e.stopPropagation()
    }
  }

  // Lắng ngheContainerthướctấcbiếnhóa
  watch([containerWidth, containerHeight], () => {
    debouncedMeasure()
  })

  // Lắng ngheThuocTinhbiếnhóa
  watch(
    () => [props.direction, props.speed, props.text],
    () => {
      measureSizes()
      lastTimestamp = 0
    }
  )

  // khiếndùng VueUse của useTimeoutFn thếđại setTimeout
  const { start: startMeasure } = useTimeoutFn(() => {
    measureSizes()
    // đolượnghoànthànhsaulậplàBắt đầuHoatAnh
    resume()
  }, 100)

  onMounted(() => {
    startMeasure()
  })

  onBeforeUnmount(() => {
    pause()
  })
</script>
