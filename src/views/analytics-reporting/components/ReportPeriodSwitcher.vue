<script setup lang="ts">
  type Period = 'today' | 'month' | 'year' | 'custom'

  defineProps<{
    modelValue: Period
    startDate?: string
    endDate?: string
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: Period]
    'update:startDate': [value: string]
    'update:endDate': [value: string]
  }>()

  function select(value: string | number | boolean | undefined) {
    emit('update:modelValue', value as Period)
  }
</script>

<template>
  <div class="report-period-switcher">
    <ElRadioGroup :model-value="modelValue" @update:model-value="select">
      <ElRadioButton value="today">Hôm nay</ElRadioButton>
      <ElRadioButton value="month">Tháng này</ElRadioButton>
      <ElRadioButton value="year">Năm nay</ElRadioButton>
      <ElRadioButton value="custom">Tùy chọn</ElRadioButton>
    </ElRadioGroup>

    <div v-if="modelValue === 'custom'" class="report-period-switcher__custom">
      <ElDatePicker
        :model-value="startDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="Từ ngày"
        popper-class="reporting-date-popper"
        class="report-period-switcher__date"
        @update:model-value="(value: string) => emit('update:startDate', value)"
      />
      <ElDatePicker
        :model-value="endDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="Đến ngày"
        popper-class="reporting-date-popper"
        class="report-period-switcher__date"
        @update:model-value="(value: string) => emit('update:endDate', value)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .report-period-switcher {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    width: fit-content;
    max-width: 100%;
  }

  .report-period-switcher__custom {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .report-period-switcher__date {
    width: 150px;
  }

  :deep(.el-radio-group) {
    display: grid;
    grid-template-columns: repeat(4, minmax(88px, 1fr));
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  :deep(.el-radio-button) {
    width: 100%;
  }

  :deep(.el-radio-button__inner) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 34px;
    padding: 0 14px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    color: var(--el-text-color-regular);
    text-align: center;
    white-space: nowrap;
    background: var(--el-fill-color-light);
    border: 0;
    border-left: 1px solid var(--el-border-color-lighter);
    border-radius: 0;
    box-shadow: none !important;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-left: 0;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    color: #fff;
    background: #e84a4a;
  }

  :deep(.el-input__wrapper) {
    min-height: 34px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    color: var(--el-text-color-primary);
  }

  :global(html.dark) {
    .report-period-switcher :deep(.el-radio-group) {
      border-color: rgb(255 255 255 / 14%);
    }

    .report-period-switcher :deep(.el-radio-button__inner) {
      color: #cbd5e1;
      background: #101114;
      border-left-color: rgb(255 255 255 / 14%);
    }

    .report-period-switcher :deep(.el-input__wrapper) {
      background: #101114;
      border-color: rgb(255 255 255 / 14%);
    }

    .report-period-switcher :deep(.el-input__inner) {
      color: #f8fafc;
    }
  }

  @media (width <= 767px) {
    .report-period-switcher {
      justify-content: flex-start;
      width: 100%;
    }

    :deep(.el-radio-group) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .report-period-switcher__date {
      width: 100%;
      max-width: 180px;
    }
  }
</style>
