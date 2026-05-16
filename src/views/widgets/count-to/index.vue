<template>
  <div class="page-content mb-5">
    <div class="mb-15 text-center">
      <h1 class="my-4 text-2xl font-semibold leading-tight">{{ $t('admin.t228') }}</h1>
      <p class="m-0 text-base leading-relaxed text-g-700">{{ $t('admin.t229') }}</p>
    </div>

    <!-- Cơ bảndùngpháp -->
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">{{ $t('admin.t230') }}</h2>
      <div class="count">
        <ArtCountTo :target="1000" :duration="2000" />
      </div>
    </div>

    <!-- Có tiền tố hậu tố -->
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">{{ $t('admin.t231') }}</h2>
      <div class="count">
        <ArtCountTo :target="20000" :duration="2500" prefix="¥" suffix="nguyên" :decimals="2" />
      </div>
    </div>

    <!-- Dấu thập phân và dấu phân cách -->
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">{{ $t('admin.t232') }}</h2>
      <div class="count">
        <ArtCountTo :target="2023.45" :duration="3000" :decimals="2" separator="," />
      </div>
    </div>

    <!-- So sánh hiệu ứng hoạt ảnh -->
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">{{ $t('admin.t233') }}</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-8">
        <div class="text-center" v-for="easing in easingTypes" :key="easing.type">
          <div class="mb-3 text-sm font-medium text-g-700">{{ easing.name }}</div>
          <div class="count">
            <ArtCountTo :target="easingTarget" :duration="3000" :easing="easing.type" />
          </div>
        </div>
      </div>
      <div class="text-center">
        <ElButton @click="triggerEasing">{{ $t('admin.t234') }}</ElButton>
      </div>
    </div>

    <!-- Nút điều khiển -->
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">{{ $t('admin.t235') }}</h2>
      <div class="count">
        <ArtCountTo
          ref="countToRef"
          :target="controlTarget"
          :duration="2000"
          @started="handleAnimationStarted"
          @finished="handleAnimationFinished"
          @paused="handleAnimationPaused"
          @reset="handleAnimationReset"
        />
      </div>

      <div class="flex gap-3 justify-center">
        <ElButton @click="startCount">{{ $t('admin.t236') }}</ElButton>
        <ElButton @click="pauseCount">{{ $t('admin.t237') }}</ElButton>
        <ElButton @click="resetCount">{{ $t('admin.t238') }}</ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ArtCountTo from '@/components/core/text-effect/art-count-to/index.vue'

  defineOptions({ name: 'TemplateCountTo' })

  const controlTarget = ref(0)
  const countToRef = ref()
  const easingTarget = ref(0)

  /**
   * BộđộngHoatAnhloạikiểuCauHinh
   */
  const easingTypes = [
    { name: 'Linear', type: 'linear' },
    { name: 'Ease Out Cubic', type: 'easeOutCubic' },
    { name: 'Ease Out Expo', type: 'easeOutExpo' },
    { name: 'Ease Out Sine', type: 'easeOutSine' },
    { name: 'Ease In Out', type: 'easeInOutCubic' },
    { name: 'Ease In Quad', type: 'easeInQuad' }
  ] as const

  /**
   * Bắt đầukếsốHoatAnh
   */
  const startCount = () => {
    const newTarget = 5000
    controlTarget.value = newTarget
    countToRef.value?.start(newTarget)
  }

  /**
   * TamDungkếsốHoatAnh
   */
  const pauseCount = () => {
    countToRef.value?.pause()
  }

  /**
   * Đặt lạikếsốHoatAnh
   */
  const resetCount = () => {
    countToRef.value?.reset()
    controlTarget.value = 0
  }

  /**
   * Kích hoạtBộđộngHiệu quảdiễnthị
   * tại 0 và 1000 củagianChuyển đổi
   */
  const triggerEasing = () => {
    easingTarget.value = easingTarget.value === 0 ? 1000 : 0
  }

  /**
   * HoatAnhBắt đầuvềđiều
   * @param value mụctiêugiá trị
   */
  const handleAnimationStarted = (value: number) => {
    console.log('HoatAnhBắt đầu，mụctiêugiá trị:', value)
  }

  /**
   * HoatAnhhoànthànhvềđiều
   * @param value nhấtcuốigiá trị
   */
  const handleAnimationFinished = (value: number) => {
    console.log('HoatAnhhoànthành，nhấtcuốigiá trị:', value)
  }

  /**
   * HoatAnhTamDungvềđiều
   * @param value khitrướcgiá trị
   */
  const handleAnimationPaused = (value: number) => {
    console.log('HoatAnhTamDung，khitrướcgiá trị:', value)
  }

  /**
   * HoatAnhĐặt lạivềđiều
   */
  const handleAnimationReset = () => {
    console.log('HoatAnhĐãĐặt lại')
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .count {
    @apply p-5 
    mb-5 
    text-2xl 
    font-semibold 
    text-center
    bg-g-100
    rounded-lg 
    tabular-nums
    border border-g-300/60;
  }
</style>
