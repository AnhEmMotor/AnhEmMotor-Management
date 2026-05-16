<template>
  <ArtResultPage
    type="fail"
    :title="$t('admin.t118')"
    message="Vui lòngnhânđốiđồng thờisửasửalấydướiThongTinsau，lạitrùngmớiGửi。"
    iconCode="ri:close-fill"
  >
    <template #content>
      <p>{{ $t('admin.t115') }}</p>
      <p>
        <ArtSvgIcon icon="ri:close-circle-line" class="text-red-500 mr-1" />
        <span>{{ $t('admin.t116') }}</span>
      </p>
      <p>
        <ArtSvgIcon icon="ri:close-circle-line" class="text-red-500 mr-1" />
        <span>{{ $t('admin.t117') }}</span>
      </p>
    </template>
    <template #buttons>
      <ElButton type="primary" v-ripple>Quay lạisửasửa</ElButton>
      <ElButton v-ripple>Xem</ElButton>
    </template>
  </ArtResultPage>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ResultFail' })
</script>
