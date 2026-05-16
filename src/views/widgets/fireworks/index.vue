<template>
  <div class="page-content">
    <div class="mb-5">
      <ElSpace wrap>
        <ElButton :disabled="isLaunching" v-ripple @click="handleSingleLaunch">{{
          $t('admin.t240')
        }}</ElButton>
        <ElButton :disabled="isLaunching" v-ripple @click="handleImageLaunch(bp)">{{
          $t('admin.t241')
        }}</ElButton>
        <ElButton :disabled="isLaunching" v-ripple @click="handleMultipleLaunch('')">{{
          $t('admin.t242')
        }}</ElButton>
        <ElButton :disabled="isLaunching" v-ripple @click="handleImageLaunch(sd)">{{
          $t('admin.t243')
        }}</ElButton>
        <ElButton :disabled="isLaunching" v-ripple @click="handleMultipleLaunch(sd)">{{
          $t('admin.t244')
        }}</ElButton>
      </ElSpace>
    </div>

    <ElDescriptions
      :title="$t('admin.t249')"
      direction="vertical"
      :column="1"
      border
      style="margin-top: 50px"
    >
      <ElDescriptionsItem :label="$t('admin.t250')">{{ $t('admin.t245') }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('admin.t251')">{{ $t('admin.t246') }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('admin.t252')">{{ $t('admin.t247') }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('admin.t253')">{{ $t('admin.t248') }}</ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<script setup lang="ts">
  import { mittBus } from '@/utils/sys'
  import bp from '@imgs/ceremony/hb.png'
  import sd from '@imgs/ceremony/sd.png'

  defineOptions({ name: 'WidgetsFireworks' })

  const timerRef = ref<ReturnType<typeof setInterval> | null>(null)
  const isLaunching = ref(false)

  /**
   * Kích hoạtliềntiếplễhoaHiệu quả
   * @param count phátxạlầnsố
   * @param src Hình ảnhtàinguồnđường
   */
  const triggerFireworks = (count: number, src: string) => {
    // xóachiacủatrướccủađịnhgiờthiết bị
    if (timerRef.value) {
      clearInterval(timerRef.value)
      timerRef.value = null
    }

    isLaunching.value = true

    let fired = 0
    timerRef.value = setInterval(() => {
      mittBus.emit('triggerFireworks', src)
      fired++

      if (fired >= count) {
        clearInterval(timerRef.value!)
        timerRef.value = null
        isLaunching.value = false
      }
    }, 1000)
  }

  /**
   * phátxạđơnchiếclễhoa
   */
  const handleSingleLaunch = () => {
    mittBus.emit('triggerFireworks')
  }

  /**
   * phátxạđachiếclễhoa
   * @param src Hình ảnhtàinguồnđường
   */
  const handleMultipleLaunch = (src: string) => {
    triggerFireworks(10, src)
  }

  /**
   * phátxạmangHình ảnhcủalễhoa
   * @param src Hình ảnhtàinguồnđường
   */
  const handleImageLaunch = (src: string) => {
    mittBus.emit('triggerFireworks', src)
  }

  /**
   * ComponentUnmountgiờxóalýđịnhgiờthiết bị
   */
  onUnmounted(() => {
    if (timerRef.value) {
      clearInterval(timerRef.value)
      timerRef.value = null
    }
  })
</script>
