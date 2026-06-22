<template>
  <div class="report-placeholder">
    <div class="report-placeholder__icon">
      <ArtSvgIcon :icon="icon" />
    </div>
    <div class="report-placeholder__content">
      <div class="report-placeholder__title">{{ title }}</div>
      <p v-if="description">{{ description }}</p>
      <code v-if="endpoint">{{ endpoint }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ReportPlaceholder" });

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    endpoint?: string;
    icon?: string;
  }>(),
  {
    icon: "ri:bar-chart-box-line",
  },
);
</script>

<style scoped lang="scss">
.report-placeholder {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-height: 108px;
  padding: 18px;
  color: #9ca3af;
  text-align: left;
  background: #111214;
  border: 1px dashed rgb(255 255 255 / 16%);
  border-radius: 12px;
}

.report-placeholder__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
  color: #ff6b6b;
  background: rgb(232 74 74 / 16%);
  border-radius: 10px;
}

.report-placeholder__title {
  font-size: 14px;
  font-weight: 700;
  color: #e5e7eb;
}

p {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
}

code {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  white-space: normal;
}
</style>
