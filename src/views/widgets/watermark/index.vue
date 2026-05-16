<template>
  <div class="page-content mb-5">
    <ElCard class="mb-7.5">
      <template #header>Cơ bảnVanBanWatermark</template>
      <ElWatermark content="Art Design Pro" :font="{ color: 'rgba(128, 128, 128, 0.2)' }">
        <div style="height: 200px"></div>
      </ElWatermark>
    </ElCard>

    <ElCard class="mb-7.5">
      <template #header>đadòngVanBanWatermark</template>
      <ElWatermark
        :content="['Art Design Pro', 'Tập trungNguoiDungthểnghiệm，Trực quanthiếtkế']"
        :font="{ fontSize: 16, color: 'rgba(128, 128, 128, 0.2)' }"
      >
        <div style="height: 200px"></div>
      </ElWatermark>
    </ElCard>

    <ElCard class="mb-7.5">
      <template #header>Hình ảnhWatermark</template>
      <ElWatermark :image="watermarkImage" :opacity="0.2" :width="80" :height="20">
        <div style="height: 200px"></div>
      </ElWatermark>
    </ElCard>

    <ElCard class="mb-7.5">
      <template #header>Tùy chỉnhKiểu dángWatermark</template>
      <ElWatermark
        content="Art Design Pro"
        :font="{
          fontSize: 20,
          fontFamily: 'Arial',
          color: 'rgba(255, 0, 0, 0.3)'
        }"
        :rotate="-22"
        :gap="[100, 100]"
      >
        <div style="height: 200px"></div>
      </ElWatermark>
    </ElCard>

    <ElButton
      :type="settingStore.watermarkVisible ? 'danger' : 'primary'"
      @click="handleWatermarkVisible"
    >
      {{ settingStore.watermarkVisible ? 'ẨntoànbộWatermark' : 'Hiển thịtoànbộWatermark' }}
    </ElButton>
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/store/modules/setting'

  defineOptions({ name: 'Watermark' })

  const settingStore = useSettingStore()

  const watermarkImage = ref('https://element-plus.org/images/element-plus-logo.svg')

  const handleWatermarkVisible = () => {
    useSettingStore().setWatermarkVisible(!settingStore.watermarkVisible)
    ElMessage.success(
      settingStore.watermarkVisible ? 'ĐãHiển thịtoànbộWatermark' : 'ĐãẨntoànbộWatermark'
    )
  }
</script>
