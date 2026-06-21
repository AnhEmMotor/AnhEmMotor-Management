<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo nhân sự & hoa hồng"
      description="Theo dõi doanh số theo nhân viên, hoa hồng chi trả và trạng thái KPI trong kỳ."
      icon="ri:team-line"
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
      <ElTable
        :data="performance"
        class="reporting-table"
        empty-text="Không có dữ liệu hiệu suất cho khoảng thời gian này"
      >
        <ElTableColumn prop="employeeName" label="Nhân viên" min-width="220" />
        <ElTableColumn prop="role" label="Vai trò" min-width="180" />
        <ElTableColumn prop="totalSales" label="Doanh số mang về" min-width="170" align="right">
          <template #default="{ row }">{{ formatCurrency(row.totalSales) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="commissionPaid" label="Hoa hồng chi trả" min-width="170" align="right">
          <template #default="{ row }">
            <span class="font-semibold text-primary">{{ formatCurrency(row.commissionPaid) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="kpiStatus" label="Trạng thái KPI" min-width="150" align="center">
          <template #default="{ row }">
            <ElTag :type="getKpiTagType(row.kpiStatus)" effect="light" round>
              {{ row.kpiStatus }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { AnalyticsService } from '@/services/analytics.service'
  import type { StaffPerformance } from '@/services/analytics.types'
  import ReportPageHeader from './ReportPageHeader.vue'
  import ReportPeriodSwitcher from './ReportPeriodSwitcher.vue'

  const currentPeriod = ref<'today' | 'month' | 'year' | 'custom'>('month')
  const periodStart = ref(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  )
  const periodEnd = ref(new Date().toISOString().split('T')[0])
  const performance = ref<StaffPerformance[]>([])

  function onPeriodChange() {
    // TODO: Pass period params to API when backend supports it
    // Expected: GET /api/v1/Statistics/staff-performance?start=...&end=...
    loadPerformance()
  }

  async function loadPerformance() {
    performance.value = await AnalyticsService.getStaffPerformance(
      periodStart.value,
      periodEnd.value,
    )
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  function getKpiTagType(status: string): 'primary' | 'success' | 'info' | 'danger' | 'warning' {
    switch (status) {
      case 'Vượt KPI':
        return 'success'
      case 'Đạt':
        return 'primary'
      case 'Cần cải thiện':
        return 'danger'
      default:
        return 'info'
    }
  }

  onMounted(loadPerformance)
</script>
