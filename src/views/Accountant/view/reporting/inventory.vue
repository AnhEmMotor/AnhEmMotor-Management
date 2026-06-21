<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo tồn kho"
      description="Theo dõi hiệu suất sản phẩm, sức khỏe tồn kho, tỷ lệ hàng sắp hết và giá trị hàng tồn."
      icon="ri:archive-stack-line"
    >
      <template #actions>
        <ReportPeriodSwitcher
          v-model="currentPeriod"
          v-model:start-date="periodStart"
          v-model:end-date="periodEnd"
          @update:modelValue="onPeriodChange"
        />
      </template>
    </ReportPageHeader>

    <ElCard class="reporting-card">
      <ElTabs v-model="activeTab" class="reporting-tabs">
        <ElTabPane label="Báo cáo sản phẩm" name="product">
          <ProductReport />
        </ElTabPane>
        <ElTabPane label="Báo cáo kho hàng" name="warehouse">
          <WarehouseReport />
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ReportPageHeader from './ReportPageHeader.vue'
  import ReportPeriodSwitcher from './ReportPeriodSwitcher.vue'
  import ProductReport from './product-report.vue'
  import WarehouseReport from './warehouse-report.vue'

  const activeTab = ref('product')
  const currentPeriod = ref<'today' | 'month' | 'year' | 'custom'>('month')
  const periodStart = ref('')
  const periodEnd = ref('')

  function onPeriodChange() {
    // TODO: Pass period params to child reports when backend supports it
    // Expected: GET /api/v1/Statistics/product-report?period=...&start=...&end=...
  }
</script>
