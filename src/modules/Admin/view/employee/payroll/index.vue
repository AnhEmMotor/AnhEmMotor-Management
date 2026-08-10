<template>
  <main class="resp-page hr-payroll-container reporting-page">
    <section class="payroll-hero" aria-labelledby="payroll-page-title">
      <div>
        <span class="payroll-hero__eyebrow">Quản trị nhân sự</span>
        <h1 id="payroll-page-title">{{ $t('menus.hr.payroll') }}</h1>
        <p>Tổng hợp lương cơ bản và hoa hồng theo từng kỳ chi trả.</p>
      </div>
      <div class="payroll-hero__actions">
        <span class="payroll-period-badge">
          <ArtSvgIcon icon="ri:calendar-check-line" />
          Kỳ {{ selectedMonthYear.month }}/{{ selectedMonthYear.year }}
        </span>
        <ElButton :loading="loading" @click="loadData">
          <ArtSvgIcon icon="ri:refresh-line" />
          Tải lại
        </ElButton>
        <ElButton type="primary" :disabled="loading" @click="exportPayrollExcel">
          <ArtSvgIcon icon="ri:file-excel-2-line" />
          Xuất Excel
        </ElButton>
      </div>
    </section>

    <el-card shadow="never" class="reporting-card payroll-content-card">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-4 reporting-kpi-grid payroll-kpi-grid"
      >
        <ArtStatsCard
          title="Tổng quỹ lương"
          :count="formatCurrency(stats.totalPayroll)"
          icon="ri:money-dollar-circle-line"
          iconStyle="bg-primary"
        />
        <ArtStatsCard
          title="Đã thanh toán"
          :count="formatCurrency(stats.paid)"
          icon="ri:checkbox-circle-line"
          iconStyle="bg-success"
        />
        <ArtStatsCard
          title="Chờ thanh toán"
          :count="formatCurrency(stats.pending)"
          icon="ri:time-line"
          iconStyle="bg-warning"
        />
        <ArtStatsCard
          title="Nhân viên"
          :count="stats.employeeCount"
          icon="ri:group-line"
          iconStyle="bg-info"
        />
      </div>

      <div class="payroll-filter-panel mb-4">
        <div class="payroll-section-heading">
          <div>
            <span class="payroll-section-heading__icon">
              <ArtSvgIcon icon="ri:filter-3-line" />
            </span>
            <div>
              <h2>Kỳ lương và nhân sự</h2>
              <p>Chọn tháng hoặc tìm nhanh theo tên nhân viên.</p>
            </div>
          </div>
          <span>{{ pagination.total }} kết quả</span>
        </div>
        <ArtSearchBar
          v-model="searchForm"
          :items="searchItems"
          :label-width="120"
          :span="8"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>

      <ElCard class="flex-1 art-table-card payroll-table-card">
        <div class="payroll-section-heading payroll-section-heading--table">
          <div>
            <span class="payroll-section-heading__icon">
              <ArtSvgIcon icon="ri:file-list-3-line" />
            </span>
            <div>
              <h2>Chi tiết bảng lương</h2>
              <p>Lương cơ bản + hoa hồng đủ điều kiện của từng nhân viên.</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: center">
            <ElButton
              type="primary"
              v-ripple
              :disabled="!data.some((item) => item.confirmedCommission > 0)"
              class="payroll-approve-all"
              :icon="Check"
              @click="handleApproveAll"
            >
              {{ isAdmin ? 'Duyệt chi tất cả' : 'Gửi duyệt tất cả' }}
            </ElButton>
            <ElTag type="info" effect="plain" round>
              {{ selectedMonthYear.month }}/{{ selectedMonthYear.year }}
            </ElTag>
          </div>
        </div>
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadData" />

        <ArtTable
          ref="tableRef"
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #fullName="{ row }">
            <div class="payroll-employee-cell">
              <span class="payroll-employee-cell__avatar">
                {{ (row.fullName || '?').charAt(0).toUpperCase() }}
              </span>
              <span>{{ row.fullName || '-' }}</span>
            </div>
          </template>

          <template #baseSalary="{ row }">
            <span class="payroll-money">{{ formatCurrency(row.baseSalary) }}</span>
          </template>

          <template #pendingCommission="{ row }">
            <span class="payroll-money text-warning">{{
              formatCurrency(row.pendingCommission)
            }}</span>
          </template>

          <template #confirmedCommission="{ row }">
            <span class="payroll-money payroll-money--commission">{{
              formatCurrency(row.confirmedCommission)
            }}</span>
          </template>


          <template #totalNetPayable="{ row }">
            <strong class="payroll-money payroll-money--total">{{
              formatCurrency(row.totalNetPayable)
            }}</strong>
          </template>

          <template #operation="{ row }">
            <div class="payroll-action-cell">
              <ElButton
                v-if="row.confirmedCommission > 0"
                v-ripple
                size="small"
                type="primary"
                @click="handleApprove(row)"
              >
                {{ isAdmin ? 'Duyệt chi' : 'Gửi duyệt' }}
              </ElButton>
              <span v-else class="payroll-action-cell__settled">
                <ArtSvgIcon icon="ri:checkbox-circle-line" />
                Đã xử lý
              </span>
            </div>
          </template>
        </ArtTable>
      </ElCard>
    </el-card>
  </main>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';
import { ref, computed, onMounted } from 'vue';
import type { ColumnOption } from '@/types/component';
import { usePayroll } from './composables/usePayroll';

defineOptions({ name: 'HRPayroll' });

const {
  loading,
  stats,
  pagination,
  data,
  allPayrollData,
  searchForm,
  selectedMonthYear,
  loadData,
  handleReset,
  handleSearch,
  handleSizeChange,
  handleCurrentChange,
  handleApprove,
  handleApproveAll,
  exportPayrollExcel,
  isAdmin,
} = usePayroll();

const searchItems = computed(() => [
  {
    key: 'month',
    label: 'Kỳ lương',
    type: 'date',
    props: {
      type: 'month',
      placeholder: 'Chọn tháng & năm',
      format: 'MM/YYYY',
      valueFormat: 'YYYY-MM',
      clearable: false,
      style: { width: '100%' },
    },
  },
  {
    key: 'employeeName',
    label: 'Nhân viên',
    type: 'select',
    props: {
      placeholder: 'Tất cả nhân viên',
      clearable: true,
      filterable: true,
      options: allPayrollData.value.map((item) => ({
        label: item.fullName,
        value: item.fullName,
      })),
    },
  },
]);

const columns = ref<ColumnOption[]>([
  { label: 'Nhân viên', prop: 'fullName', minWidth: 180, useSlot: true },
  { label: 'Chức vụ', prop: 'jobTitle', width: 140 },
  {
    label: 'Lương cơ bản',
    prop: 'baseSalary',
    width: 140,
    align: 'right',
    useSlot: true,
  },
  {
    label: 'Hoa hồng chờ duyệt',
    prop: 'pendingCommission',
    width: 160,
    align: 'right',
    useSlot: true,
  },
  {
    label: 'Hoa hồng chờ chi',
    prop: 'confirmedCommission',
    width: 160,
    align: 'right',
    useSlot: true,
  },
  {
    label: 'Thực nhận',
    prop: 'totalNetPayable',
    width: 160,
    align: 'right',
    useSlot: true,
  },
  {
    label: 'Thao tác',
    prop: 'operation',
    width: 180,
    align: 'center',
    useSlot: true,
  },
]);
const columnChecks = columns;

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.hr-payroll-container {
  --payroll-red: #e84a4a;
  --payroll-red-dark: #c53a3a;
  --payroll-red-soft: color-mix(in srgb, var(--payroll-red) 10%, transparent);

  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 1600px;
  padding: 16px;
  margin: 0 auto;
}

.payroll-hero {
  position: relative;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 22px;
  overflow: hidden;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  box-shadow: 0 12px 28px rgb(30 41 59 / 6%);
}

.payroll-hero::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  content: '';
  background: linear-gradient(90deg, var(--payroll-red), var(--payroll-red-dark));
}

.payroll-hero::after {
  position: absolute;
  top: -80px;
  right: -55px;
  width: 230px;
  height: 230px;
  pointer-events: none;
  content: '';
  background: radial-gradient(circle, var(--payroll-red-soft), transparent 68%);
}

.payroll-hero > div {
  position: relative;
  z-index: 1;
}

.payroll-hero__eyebrow {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--payroll-red);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.payroll-hero h1 {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.payroll-hero p,
.payroll-section-heading p {
  margin: 5px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.payroll-hero__actions,
.payroll-period-badge {
  display: flex;
  gap: 7px;
  align-items: center;
}

.payroll-hero__actions {
  flex-shrink: 0;
}

.payroll-period-badge {
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
  color: var(--payroll-red-dark);
  background: var(--payroll-red-soft);
  border: 1px solid color-mix(in srgb, var(--payroll-red) 24%, transparent);
  border-radius: 9px;
}

.payroll-content-card {
  border-radius: 16px;
}

.payroll-content-card :deep(> .el-card__body) {
  padding: 16px;
}

.payroll-kpi-grid :deep(.art-card) {
  min-height: 108px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 13px;
  box-shadow: none;
}

.payroll-kpi-grid :deep(> :first-child) {
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-lighter);
}

.payroll-kpi-grid :deep(> :first-child p) {
  color: var(--el-text-color-secondary) !important;
}

.payroll-kpi-grid :deep(> :first-child .art-count-to) {
  color: var(--el-text-color-primary) !important;
}

.payroll-kpi-grid :deep(.art-count-to),
.payroll-kpi-grid :deep(.art-card p:nth-child(2)) {
  font-variant-numeric: tabular-nums;
}

.payroll-filter-panel {
  padding: 14px 14px 0;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 12px;
}

.payroll-section-heading,
.payroll-section-heading > div {
  display: flex;
  align-items: center;
}

.payroll-section-heading {
  gap: 14px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.payroll-section-heading > div {
  min-width: 0;
  gap: 10px;
}

.payroll-section-heading__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 16px;
  color: var(--payroll-red);
  background: var(--payroll-red-soft);
  border-radius: 9px;
}

.payroll-section-heading h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  letter-spacing: -0.015em;
}

.payroll-section-heading p {
  margin-top: 2px;
  font-size: 12px;
}

.payroll-section-heading > span {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 650;
  color: var(--el-text-color-secondary);
}

.payroll-table-card {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.payroll-table-card :deep(> .el-card__body) {
  padding: 0;
}

.payroll-section-heading--table {
  padding: 14px 14px 12px;
  margin: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.payroll-table-card :deep(.art-table-header) {
  padding: 10px 12px;
  background: var(--el-fill-color-extra-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.payroll-table-card :deep(.el-table) {
  --el-table-bg-color: var(--el-bg-color);
  --el-table-tr-bg-color: var(--el-bg-color);
}

.payroll-approve-all {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.payroll-approve-all:not(:disabled):hover {
  box-shadow: 0 8px 18px rgb(232 74 74 / 22%);
  transform: translateY(-1px);
}

.payroll-employee-cell,
.payroll-action-cell,
.payroll-action-cell__settled {
  display: flex;
  align-items: center;
}

.payroll-employee-cell {
  gap: 9px;
  min-width: 0;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.payroll-employee-cell__avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 12px;
  font-weight: 750;
  color: var(--payroll-red-dark);
  background: var(--payroll-red-soft);
  border-radius: 9px;
}

.payroll-money {
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.payroll-money--commission {
  font-weight: 650;
}

.payroll-money--total {
  color: var(--payroll-red-dark);
}

.payroll-bonus-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}

.payroll-action-cell {
  justify-content: center;
}

.payroll-action-cell__settled {
  gap: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:global(html.dark) .payroll-hero,
:global(html.dark) .payroll-content-card,
:global(html.dark) .payroll-table-card {
  box-shadow: none;
}

:global(html.dark) .payroll-money--total {
  color: #ff8b8b;
}


@media (width <= 767px) {
  .hr-payroll-container {
    gap: 10px;
    padding: 10px;
  }

  .payroll-hero,
  .payroll-hero__actions,
  .payroll-section-heading {
    align-items: flex-start;
  }

  .payroll-hero,
  .payroll-hero__actions {
    flex-direction: column;
  }

  .payroll-hero {
    padding: 16px 15px 18px;
  }

  .payroll-hero__actions,
  .payroll-period-badge,
  .payroll-hero__actions :deep(.el-button) {
    width: 100%;
  }

  .payroll-period-badge,
  .payroll-hero__actions :deep(.el-button) {
    justify-content: center;
  }

  .payroll-content-card :deep(> .el-card__body) {
    padding: 10px;
  }

  .payroll-section-heading {
    gap: 8px;
  }

  .payroll-section-heading > span {
    padding-left: 44px;
  }

  .payroll-section-heading--table > span {
    padding-left: 0;
  }

  .payroll-table-card {
    overflow-x: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .payroll-approve-all {
    transition: none;
  }
}
</style>
