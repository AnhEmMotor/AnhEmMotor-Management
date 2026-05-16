<template>
  <ArtResultPage
    type="success"
    :title="$t('admin.t120')"
    message="GửiTrang kết quảdùngởngượchồimộthệcộtHanhDongnhiệmvụcủaXuLyKetQua，nếuquảchỉlàrútđơnHanhDong，khiếndùng Message toànbộGợi ýngượchồilàCó thể。xámmàuđồngTênCó thểlấyHiển thịmộtvàibùđầycủaThongTin。"
    iconCode="ri:check-fill"
  >
    <template #content>
      <p>{{ $t('admin.t119') }}</p>
    </template>
    <template #buttons>
      <ElButton type="primary" v-ripple>Quay lạisửasửa</ElButton>
      <ElButton v-ripple>Xem</ElButton>
      <ElButton v-ripple>In ấn</ElButton>
    </template>
  </ArtResultPage>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ResultSuccess' })
</script>
