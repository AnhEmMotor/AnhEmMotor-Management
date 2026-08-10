<template>
  <div class="resp-page pnl-report">
    <div class="reporting-actions mb-4">
      <ElDatePicker
        type="month"
        v-model="selectedMonth"
        value-format="YYYY-MM"
        format="MM/YYYY"
        placeholder="Chọn tháng"
        popper-class="reporting-date-popper"
        class="w-48"
      />
      <ElButton @click="loadReport" type="primary" :loading="props.loading">
        Truy xuất dữ liệu
      </ElButton>
      <ElButton type="success" @click="exportPnlExcel">
        <ArtSvgIcon icon="ri:file-excel-2-line" />
        Xuất Excel
      </ElButton>
    </div>

    <div class="pnl-table-wrap">
      <table class="pnl-table">
        <thead class="pnl-table__head">
          <tr>
            <th class="p-4">Hạng mục chi tiết</th>
            <th class="p-4 text-right">Giá trị (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="pnl-row pnl-row--income">
            <td class="p-4">TỔNG THU NHẬP</td>
            <td class="p-4 text-right">
              {{ formatCurrency(displayReport.totalRevenue) }}
            </td>
          </tr>
          <tr class="pnl-row">
            <td class="p-4 pl-8 pnl-row__muted">Doanh thu từ đơn hàng hoàn tất</td>
            <td class="p-4 text-right">
              {{ formatCurrency(displayReport.totalRevenue) }}
            </td>
          </tr>

          <tr class="pnl-row pnl-row--cost">
            <td class="p-4">GIÁ VỐN HÀNG BÁN (COGS)</td>
            <td class="p-4 text-right">
              {{ formatCurrency(displayReport.totalCostOfGoodsSold) }}
            </td>
          </tr>

          <tr class="pnl-row pnl-row--gross">
            <td class="p-4 text-lg">LỢI NHUẬN GỘP</td>
            <td class="p-4 text-right text-lg">
              {{ formatCurrency(displayReport.grossProfit) }}
            </td>
          </tr>

          <tr class="pnl-row pnl-row--expense">
            <td class="p-4">CHI PHÍ VẬN HÀNH</td>
            <td class="p-4 text-right">
              {{ formatCurrency(displayReport.totalOperatingExpenses) }}
            </td>
          </tr>
          <tr
            v-for="exp in displayReport.expenseDetails"
            :key="exp.category"
            class="pnl-row last:border-0"
          >
            <td class="p-4 pl-8 pnl-row__muted">{{ exp.category }}</td>
            <td class="p-4 text-right text-red-500">
              {{ formatCurrency(exp.amount) }}
            </td>
          </tr>

          <tr class="pnl-row pnl-row--net">
            <td class="p-4">LỢI NHUẬN RÒNG CUỐI CÙNG</td>
            <td class="p-4 text-right">
              {{ formatCurrency(displayReport.netProfit) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pnl-footnote">
      * Dữ liệu được tính toán tự động từ hệ thống và lưu trữ tại Redis Cache.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue';
import { AnalyticsService } from '@/services/analytics.service';
import type { PnlReport } from '@/services/analytics.types';
import { exportReportWorkbook } from '@/utils/report-excel';
import ReportPageHeader from './ReportPageHeader.vue';
import ReportPeriodSwitcher from './ReportPeriodSwitcher.vue';

const props = withDefaults(
  defineProps<{
    report?: PnlReport;
    loading?: boolean;
  }>(),
  {
    loading: false,
  }
);

const emit = defineEmits<{
  load: [month: number, year: number];
}>();

const selectedMonth = ref(new Date().toISOString().slice(0, 7)); 
const localReport = ref<PnlReport>({
  period: '',
  totalRevenue: 0,
  totalCostOfGoodsSold: 0,
  totalOperatingExpenses: 0,
  grossProfit: 0,
  netProfit: 0,
  expenseDetails: [],
});

const displayReport = computed(() => props.report ?? localReport.value);

async function loadReport() {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  if (props.report) {
    emit('load', month, year);
    return;
  }
  localReport.value = await AnalyticsService.getPnlReport(month, year);
}

function exportPnlExcel() {
  const r = displayReport.value;
  exportReportWorkbook({
    fileName: 'Bao_cao_loi_nhuan',
    sheets: [
      {
        name: 'P&L Tổng hợp',
        rows: [
          { Hạng_mục: 'Tổng thu nhập', Giá_trị: r.totalRevenue },
          {
            Hạng_mục: 'Giá vốn hàng bán (COGS)',
            Giá_trị: r.totalCostOfGoodsSold,
          },
          { Hạng_mục: 'Lợi nhuận gộp', Giá_trị: r.grossProfit },
          { Hạng_mục: 'Chi phí vận hành', Giá_trị: r.totalOperatingExpenses },
          { Hạng_mục: 'Lợi nhuận ròng cuối cùng', Giá_trị: r.netProfit },
        ],
      },
      {
        name: 'Chi phí chi tiết',
        rows: r.expenseDetails.map((e: any) => ({
          Phan_loai: e.category,
          So_tien: e.amount,
        })),
      },
    ],
  });
}
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

onMounted(() => {
  if (!props.report) {
    loadReport();
  }
});
</script>
