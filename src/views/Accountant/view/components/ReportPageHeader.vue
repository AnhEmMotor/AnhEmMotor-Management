<template>
  <div class="report-page-header">
    <div class="report-page-header__content">
      <div class="report-page-header__eyebrow">Thá»‘ng kÃª &amp; BÃ¡o cÃ¡o</div>
      <div class="report-page-header__title-row">
        <div v-if="icon" class="report-page-header__icon">
          <ArtSvgIcon :icon="icon" />
        </div>
        <h1>{{ title }}</h1>
      </div>
      <p v-if="description">{{ description }}</p>
    </div>

    <div v-if="$slots.actions" class="report-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import '@/views/Accountant/logic/reporting.scss'

  defineOptions({ name: 'ReportPageHeader' })

  defineProps<{
    title: string
    description?: string
    icon?: string
  }>()
</script>

<style scoped lang="scss">
  .report-page-header {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .report-page-header__content {
    flex: 1 1 520px;
    min-width: 260px;
  }

  .report-page-header__eyebrow {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #ff5a5a;
    text-transform: uppercase;
    letter-spacing: 0;
  }

  .report-page-header__title-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .report-page-header__icon {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 22px;
    color: #ff6b6b;
    background: rgb(232 74 74 / 18%);
    border-radius: 12px;
    box-shadow: none;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.25;
    color: #f8fafc;
  }

  p {
    max-width: 760px;
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 1.6;
    color: #9ca3af;
  }

  .report-page-header__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    align-self: flex-start;
    justify-content: flex-end;
    min-height: auto;
    padding-top: 10px;
  }

  @media (width <= 767px) {
    .report-page-header__actions {
      align-self: stretch;
      justify-content: flex-start;
      width: 100%;
      min-height: auto;
      padding-top: 0;
    }
  }
</style>
