<template>
  <div class="reporting-page reporting-page--financial">
    <ReportPageHeader
      title="Báo cáo tài chính"
      description="Tổng hợp P&L và chi phí vận hành để theo dõi hiệu quả tài chính theo kỳ."
      icon="ri:money-dollar-box-line"
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

    <div class="reporting-kpi-grid reporting-page__kpi">
      <ArtStatsCard
        title="Tổng thu nhập"
        :count="formatCurrency(pnlData.totalRevenue)"
        :description="`Kỳ ${pnlData.period || 'hiện tại'}`"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Giá vốn hàng bán"
        :count="formatCurrency(pnlData.totalCostOfGoodsSold)"
        :description="`Biên gộp: ${grossMarginLabel}`"
        icon="ri:shopping-bag-3-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Chi phí vận hành"
        :count="formatCurrency(pnlData.totalOperatingExpenses)"
        :description="`Hạng mục: ${pnlData.expenseDetails.length}`"
        icon="ri:wallet-3-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Lợi nhuận ròng"
        :count="formatCurrency(pnlData.netProfit)"
        :description="`Biên ròng: ${netMarginLabel}`"
        icon="ri:line-chart-line"
        :icon-style="pnlData.netProfit >= 0 ? 'bg-report-red' : 'bg-report-gray'"
      />
    </div>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card reporting-page__summary">
        <template #header>
          <div class="reporting-page__summary-header">
            <span class="reporting-page__summary-title">Tổng quan nhanh</span>
            <span class="reporting-page__summary-period">{{ periodLabel }}</span>
          </div>
        </template>
        <div class="reporting-page__summary-grid">
          <div class="reporting-page__summary-row">
            <span class="reporting-muted">Lợi nhuận gộp</span>
            <strong class="text-report-red-light">{{ formatCurrency(pnlData.grossProfit) }}</strong>
          </div>
          <div class="reporting-page__summary-row">
            <span class="reporting-muted">Biên lợi nhuận gộp</span>
            <strong>{{ grossMarginLabel }}</strong>
          </div>
          <div class="reporting-page__summary-row">
            <span class="reporting-muted">Tổng chi phí vận hành</span>
            <strong class="text-report-red-light">{{
              formatCurrency(pnlData.totalOperatingExpenses)
            }}</strong>
          </div>
          <div class="reporting-page__summary-row">
            <span class="reporting-muted">Số khoản chi đã ghi nhận</span>
            <strong>{{ expenses.length }}</strong>
          </div>
          <div class="reporting-page__summary-row reporting-page__summary-row--accent">
            <span>Lợi nhuận ròng cuối kỳ</span>
            <strong class="text-report-red">{{ formatCurrency(pnlData.netProfit) }}</strong>
          </div>
        </div>
      </ElCard>

      <ElCard class="reporting-card reporting-page__tabs">
        <template #header>
          <ElTabs v-model="activeTab" @tab-change="onTabChange" class="reporting-page__tabs-nav">
            <ElTabPane label="Báo cáo P&L" name="pnl" />
            <ElTabPane label="Chi phí vận hành" name="expense" />
          </ElTabs>
        </template>

        <PnlReportComponent
          v-show="activeTab === 'pnl'"
          :report="pnlData"
          :loading="loading"
          @load="loadPnlReport"
        />
        <ExpenseTable
          v-show="activeTab === 'expense'"
          :expenses="expenses"
          :loading="loading"
          @add="openExpenseForm"
          @delete="deleteExpense"
        />
      </ElCard>
    </div>

    <ElDialog
      v-model="isFormVisible"
      title="Ghi nhận khoản chi"
      width="520px"
      class="reporting-dialog"
      destroy-on-close
      align-center
    >
      <ExpenseForm @close="isFormVisible = false" @submit="handleAddExpense" />
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { AnalyticsService } from '@/services/analytics.service'
  import type { PnlReport, Expense } from '@/services/analytics.types'
  import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue'
  import ReportPageHeader from '../components/ReportPageHeader.vue'
  import ReportPeriodSwitcher from '../components/ReportPeriodSwitcher.vue'
  import PnlReportComponent from '../pnl/index.vue'
  import ExpenseTable from '../expense/index.vue'
  import ExpenseForm from '../expense/expense-form.vue'

  type ExpenseFormData = {
    name: string
    category: number
    amount: number
    expenseDate: string
    note?: string
  }

  const activeTab = ref<'pnl' | 'expense'>('pnl')
  const currentPeriod = ref<'today' | 'month' | 'year' | 'custom'>('month')
  const periodStart = ref('')
  const periodEnd = ref('')
  const loading = ref(false)
  const pnlData = ref<PnlReport>({
    period: '',
    totalRevenue: 0,
    totalCostOfGoodsSold: 0,
    totalOperatingExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    expenseDetails: [],
  })
  const expenses = ref<Expense[]>([])
  const isFormVisible = ref(false)

  const grossMarginLabel = computed(() =>
    formatPercent(pnlData.value.grossProfit, pnlData.value.totalRevenue),
  )
  const netMarginLabel = computed(() =>
    formatPercent(pnlData.value.netProfit, pnlData.value.totalRevenue),
  )
  const periodLabel = computed(() => {
    if (currentPeriod.value === 'today') return 'Hôm nay'
    if (currentPeriod.value === 'month') return 'Tháng này'
    if (currentPeriod.value === 'year') return 'Năm nay'
    if (currentPeriod.value === 'custom' && periodStart.value && periodEnd.value) {
      return `${periodStart.value} → ${periodEnd.value}`
    }
    return pnlData.value.period || 'Kỳ hiện tại'
  })

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
  }

  function formatPercent(numerator: number, denominator: number) {
    if (!denominator) return '0%'
    const pct = (numerator / denominator) * 100
    return `${pct.toFixed(1)}%`
  }

  function onPeriodChange() {
    // TODO: Pass period params to API when backend supports it
    // Expected: GET /api/v1/Statistics/financial-pnl?period=...&start=...&end=...
    loadData()
  }

  async function loadData() {
    if (activeTab.value === 'pnl') {
      await loadPnlReport()
    } else {
      await loadExpenses()
    }
  }

  function onTabChange(tab: string | number) {
    if (tab === 'expense') {
      loadExpenses()
    } else {
      loadData()
    }
  }

  async function loadPnlReport(month?: number, year?: number) {
    loading.value = true
    try {
      const [defaultYear, defaultMonth] = new Date()
        .toISOString()
        .slice(0, 7)
        .split('-')
        .map(Number)
      pnlData.value = await AnalyticsService.getPnlReport(
        month ?? defaultMonth,
        year ?? defaultYear,
      )
    } finally {
      loading.value = false
    }
  }

  async function loadExpenses() {
    loading.value = true
    try {
      expenses.value = await AnalyticsService.getExpenses()
    } finally {
      loading.value = false
    }
  }

  function openExpenseForm() {
    isFormVisible.value = true
  }

  async function handleAddExpense(formData: ExpenseFormData) {
    await AnalyticsService.createExpense(formData)
    await loadExpenses()
    isFormVisible.value = false
  }

  async function deleteExpense(id: number) {
    try {
      await ElMessageBox.confirm('Bạn có chắc chắn muốn xóa khoản chi này?', 'Xác nhận xóa', {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      })
    } catch {
      return
    }
    await AnalyticsService.deleteExpense(id)
    await loadExpenses()
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .reporting-page__kpi {
    margin-bottom: 16px;
  }

  .reporting-page__summary {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .reporting-page__summary-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    justify-content: space-between;
  }

  .reporting-page__summary-title {
    font-weight: 700;
    color: var(--art-color);
  }

  .reporting-page__summary-period {
    font-size: 12px;
    font-weight: 600;
    color: #ff6b6b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .reporting-page__summary-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .reporting-page__summary-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px dashed rgb(var(--art-color-rgb), 8%);
  }

  .reporting-page__summary-row:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .reporting-page__summary-row--accent {
    padding: 12px 16px;
    margin-top: 4px;
    color: var(--art-color);
    background: linear-gradient(135deg, rgb(232 74 74 / 18%), rgb(255 107 107 / 6%));
    border: 1px solid rgb(232 74 74 / 32%);
    border-radius: 12px;
  }

  .reporting-page__summary-row--accent:last-child {
    padding-bottom: 12px;
  }

  .reporting-page__summary-row--accent strong {
    font-size: 18px;
    font-weight: 800;
  }

  .reporting-page__tabs :deep(.el-card__header) {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .reporting-page__tabs-nav :deep(.el-tabs__header) {
    margin: 0;
  }

  .reporting-page__tabs-nav :deep(.el-tabs__nav-wrap::after) {
    background-color: transparent;
  }

  .reporting-page__tabs-nav :deep(.el-tabs__item) {
    height: 44px;
    font-size: 14px;
    line-height: 44px;
  }
</style>
