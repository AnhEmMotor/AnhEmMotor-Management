<template>
  <div class="page-content mb-5" element-loading-:text="$t('admin.t220')">
    <ArtMapChart />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'TemplateMap' })

  /**
   * khácbướcLoadingđịaảnhComponent
   * bớtthiểuban đầuđầuLoadingthểtích
   */
  const ArtMapChart = defineAsyncComponent(
    () => import('@/components/core/charts/art-map-chart/index.vue')
  )
</script>
