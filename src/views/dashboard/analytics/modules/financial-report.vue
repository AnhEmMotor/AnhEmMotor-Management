<template>
  <div class="art-card p-5 overflow-hidden bg-white">
    <div class="art-card-header">
      <div class="title">
        <h4>9.3. Báo cáo Tài chính Chi tiết</h4>
        <p>P&L + thống kê theo nhân viên (Doanh số mang về vs Hoa hồng chi trả) - mock</p>
      </div>

      <div class="flex items-center gap-3">
        <ElTag type="info" effect="dark">Mock Only</ElTag>
      </div>
    </div>

    <ElDivider />

    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="12">
        <div class="font-medium mb-3">P&L (Profit and Loss)</div>
        <ElTable :data="plRows" border style="width: 100%">
          <ElTableColumn prop="label" label="Hạng mục" min-width="200" />
          <ElTableColumn prop="amount" label="Số tiền" min-width="160">
            <template #default="scope">{{ formatVnd(scope.row.amount) }}</template>
          </ElTableColumn>
        </ElTable>
      </ElCol>

      <ElCol :xs="24" :lg="12">
        <div class="font-medium mb-3">Thống kê theo nhân viên</div>
        <ElTable :data="employeeRows" border style="width: 100%">
          <ElTableColumn prop="employee" label="Nhân viên" min-width="170" />
          <ElTableColumn prop="revenue" label="Doanh số mang về" min-width="200">
            <template #default="scope">{{ formatVnd(scope.row.revenue) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="commission" label="Hoa hồng chi trả" min-width="190">
            <template #default="scope">
              <ElTag
                :type="scope.row.commission > 30_000_000 ? 'success' : 'warning'"
                effect="plain"
              >
                {{ formatVnd(scope.row.commission) }}
              </ElTag>
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="mt-4 text-xs text-g-500">
          Mock theo Workflow: Doanh số vs Hoa hồng chi trả.
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  function formatVnd(value: number): string {
    try {
      return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value) + 'đ'
    } catch {
      return `${Math.round(value)}đ`
    }
  }

  // mock base values (kết nối logic với dashboard tổng quan bằng cách dùng cùng số liệu giả định)
  const totalIncome = 10_920_000_000
  const totalExpense = 6_180_000_000
  const grossProfit = totalIncome - totalExpense
  const extraFees = 420_000_000
  const netProfit = grossProfit - extraFees

  const plRows = computed(() => {
    return [
      { label: 'Tổng thu (Income)', amount: totalIncome },
      { label: 'Tổng chi (Expenses)', amount: totalExpense },
      { label: 'Lợi nhuận gộp (Gross Profit)', amount: grossProfit },
      { label: 'Phí/chi phí phát sinh (mock)', amount: extraFees },
      { label: 'Lợi nhuận ròng (Net Profit)', amount: netProfit },
    ]
  })

  const employeeRows = computed(() => {
    return [
      { employee: 'Nguyễn A', revenue: 2_650_000_000, commission: 62_500_000 },
      { employee: 'Trần B', revenue: 1_980_000_000, commission: 41_000_000 },
      { employee: 'Lê C', revenue: 1_420_000_000, commission: 28_000_000 },
      { employee: 'Phạm D', revenue: 1_250_000_000, commission: 24_500_000 },
    ]
  })
</script>

<style scoped>
  .art-card {
    min-height: 520px;
  }
</style>
