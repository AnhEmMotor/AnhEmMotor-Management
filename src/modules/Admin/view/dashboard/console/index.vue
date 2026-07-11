<template>
  <div>
    <div class="page-title">
      <h1>Trung tâm thống kê</h1>
      <p class="sub-title">
        Tổng hợp nhanh doanh số, tồn kho và cảnh báo trong chu kỳ đang chọn
      </p>
    </div>
    <div class="console-card">
      <div class="grid-period">
        <div class="period-options">
          <ElRadioGroup
            v-model="activePeriod"
            size="small"
            @change="onPeriodChange"
          >
            <ElRadioButton value="today">Hôm nay</ElRadioButton>
            <ElRadioButton value="week">Tuần này</ElRadioButton>
            <ElRadioButton value="month">Tháng này</ElRadioButton>
            <ElRadioButton value="year">Năm nay</ElRadioButton>
          </ElRadioGroup>
          <ElDatePicker
            v-model="customRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            size="small"
            value-format="YYYY-MM-DD"
            @change="onCustomRangeChange"
          />
        </div>
        <div class="price-unit">
          Đơn vị:
          <ElSelect v-model="priceUnit" size="small" style="width: 140px">
            <ElOption label="VND" value="VND" />
            <ElOption label="USD" value="USD" />
          </ElSelect>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const activePeriod = ref("today");
const customRange = ref<[string, string] | null>(null);
const priceUnit = ref("VND");

function onPeriodChange() {
  // placeholder
}

function onCustomRangeChange() {
  // placeholder
}
</script>
