<template>
  <div class="page-content space-y-5">
    <!-- Cơ bảndùngpháp -->
    <ArtTextScroll
      :text="$t('admin.t269')"success" :text="$t('admin.t270')" />

    <ArtTextScroll type="warning" :text="$t('admin.t271')" />

    <ArtTextScroll type="danger" :text="$t('admin.t272')" />

    <ArtTextScroll type="info" :text="$t('admin.t273')" />

    <!-- Có thểđóngđóng -->
    <ArtTextScroll :text="$t('admin.t274')" @close="handleClose" />

    <!-- Tùy chỉnhTốc độvàphươnghướng -->
    <ArtTextScroll
      type="warning"
      :text="$t('admin.t275')"
      :speed="30"
      direction="right"
    />

    <ArtTextScroll
      :text="$t('admin.t276')"
      @close="handleClose"
      :alwaysScroll="false"
    />

    <ArtTextScroll type="danger" direction="up" :speed="30" :text="$t('admin.t277')" />

    <ArtTextScroll type="info" direction="down" :speed="30" :text="$t('admin.t278')" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'WidgetsTextScroll' })

  /**
   * XuLyđóngđóngSuKien
   */
  const handleClose = () => {
    console.log('vănquyểnCuộnComponentĐãđóngđóng')
    ElMessage.info('Đãđóngđóng')
  }
</script>
