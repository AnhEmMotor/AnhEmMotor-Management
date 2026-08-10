<template>
  <div class="resp-page warehouse-report">
    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng tồn kho"
        :count="data.summary.totalStock"
        :description="`Giá trị: ${formatCurrency(data.summary.totalValue)}`"
        icon="ri:archive-stack-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Sắp hết hàng"
        :count="data.summary.lowStockCount"
        description="Sản phẩm cần bổ sung sớm"
        icon="ri:alarm-warning-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Hết hàng"
        :count="data.summary.outOfStockCount"
        description="Sản phẩm không còn tồn"
        icon="ri:close-circle-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Tỷ lệ tồn kho khỏe"
        :count="stockRatio"
        description="Không thuộc nhóm sắp hết/hết hàng"
        icon="ri:checkbox-circle-line"
        icon-style="bg-report-red-light"
      />
    </div>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Tồn kho theo thương hiệu</template>
        <div ref="brandChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Tỷ lệ trạng thái tồn kho</template>
        <div ref="statusChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <ElCard class="reporting-card mt-4 art-table-card flex-1">
      <ArtTableHeader :showColumns="false" @refresh="load">
        <template #left>
          <div class="flex items-center gap-2">
            <h4 class="m-0 font-bold text-gray-800 text-lg">Chi tiết theo sản phẩm</h4>
            <ElButton
              v-if="data.warehouseTableData && data.warehouseTableData.length > 0"
              type="primary"
              :loading="exporting"
              @click="handleExport"
              class="ml-4"
            >
              <ElIcon class="mr-1"><Download /></ElIcon> Xuất báo cáo
            </ElButton>
          </div>
        </template>
        <template #right>
          <ElButton type="primary" link @click="expandAll">Mở rộng tất cả</ElButton>
          <ElButton type="info" link @click="collapseAll">Thu gọn tất cả</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loadingData"
        :data="paginatedTableData"
        :columns="columns"
        row-key="id"
        default-expand-all
        :pagination="paginationState"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #name="{ row }">
          <span class="inline-flex items-center gap-2 text-left align-middle">
            <span :class="getNameClass(row)">{{ row.name }}</span>
          </span>
        </template>
        <template #inStock="{ row }">
          <span v-if="row.inStock === 0" class="text-red-500 font-bold">
            {{ row.inStock }}
          </span>
          <span v-else-if="row.inStock <= inventoryThreshold" class="text-yellow-500 font-bold">
            {{ row.inStock }}
          </span>
          <span v-else>
            {{ row.inStock }}
          </span>
        </template>
        <template #operation="{ row }">
          <ElButton
            v-if="isLeafNode(row)"
            type="primary"
            link
            size="small"
            @click="handleViewHistory(row)"
          >
            <ElIcon class="mr-1"><Memo /></ElIcon> Chi tiết phiếu
          </ElButton>
          <span v-else class="text-gray-300 font-light text-xs">-</span>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="`Lịch sử giao dịch biến động kho: ${selectedRowName}`"
      width="850px"
      class="resp-dialog"
      append-to-body
      destroy-on-close
    >
      <div v-if="selectedRow" class="flex flex-col gap-4">
        <div class="p-3 bg-gray-50 border border-gray-100 rounded flex gap-4 text-sm text-gray-600">
          <div><strong>Tồn kho hiện tại:</strong> {{ selectedRow.inStock }} xe</div>
          <div><strong>Đã nhập:</strong> {{ selectedRow.imported }} xe</div>
          <div><strong>Đã xuất:</strong> {{ selectedRow.exported }} xe</div>
        </div>

        <ElTabs v-model="activeTab" class="pl-4 pr-2">
          <ElTabPane name="receipts">
            <template #label>
              <span class="flex items-center gap-1">
                <span>Phiếu Nhập Hàng ({{ mockReceipts.length }})</span>
              </span>
            </template>
            <ElTable :data="mockReceipts" border stripe style="width: 100%">
              <ElTableColumn prop="supplier" label="Nhà cung cấp" min-width="180" />
              <ElTableColumn prop="quantity" label="SL nhập" width="100" align="right" />
              <ElTableColumn prop="price" label="Đơn giá nhập" width="150" align="right">
                <template #default="{ row }"> {{ row.price.toLocaleString() }} VNĐ </template>
              </ElTableColumn>
              <ElTableColumn prop="date" label="Ngày nhập" width="140" align="center" />
              <ElTableColumn prop="status" label="Trạng thái" width="120" align="center">
                <template #default>
                  <ElTag type="success" size="small">Đã nhập kho</ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="Thao tác" width="100" align="center" fixed="right">
                <template #default="{ row }">
                  <ElButton link type="primary" size="small" @click="viewReceiptDetail(row.id)"
                    >Xem phiếu</ElButton
                  >
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>

          <ElTabPane name="invoices">
            <template #label>
              <span class="flex items-center gap-1">
                <span>Phiếu Xuất Bán Hàng ({{ mockInvoices.length }})</span>
              </span>
            </template>
            <ElTable :data="mockInvoices" border stripe style="width: 100%">
              <ElTableColumn prop="customer" label="Khách hàng" min-width="180" />
              <ElTableColumn prop="quantity" label="SL bán" width="100" align="right" />
              <ElTableColumn prop="price" label="Đơn giá bán" width="150" align="right">
                <template #default="{ row }"> {{ row.price.toLocaleString() }} VNĐ </template>
              </ElTableColumn>
              <ElTableColumn prop="date" label="Ngày xuất" width="140" align="center" />
              <ElTableColumn prop="status" label="Trạng thái" width="120" align="center">
                <template #default>
                  <ElTag type="success" size="small">Đã bàn giao</ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>
        </ElTabs>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <ElButton @click="dialogVisible = false">Đóng</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="receiptDetailVisible"
      title="Chi tiết phiếu nhập kho"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <div v-if="receiptDetailData" class="flex flex-col gap-4">
        <div
          class="p-3 bg-gray-50 border border-gray-100 rounded grid grid-cols-2 gap-2 text-sm text-gray-700"
        >
          <div><strong>Mã phiếu:</strong> #{{ receiptDetailData.id }}</div>
          <div>
            <strong>Trạng thái:</strong>
            <ElTag type="success" size="small">Đã nhập kho</ElTag>
          </div>
          <div>
            <strong>Ngày tạo:</strong>
            {{
              receiptDetailData.createdAt
                ? new Date(receiptDetailData.createdAt).toLocaleDateString('vi-VN')
                : '--'
            }}
          </div>
          <div>
            <strong>Ghi chú:</strong>
            {{ receiptDetailData.notes || 'Không có ghi chú' }}
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2">
            Danh sách sản phẩm trong phiếu này
          </h4>
          <ElTable
            :data="receiptDetailData.products"
            border
            stripe
            size="small"
            style="width: 100%"
          >
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Tên sản phẩm" min-width="200">
              <template #default="{ row }">
                <div class="flex flex-col gap-1">
                  <span class="font-medium text-gray-800">{{ row.name }}</span>
                  <ElTag v-if="row.productVariantColorName" size="small" type="info" class="w-fit">
                    Màu: {{ row.productVariantColorName }}
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Nhà cung cấp" width="160">
              <template #default="{ row }">
                <span>{{ row.supplierName || 'N/A' }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="130" align="right">
              <template #default="{ row }">
                <span>{{ row.unitPrice ? row.unitPrice.toLocaleString() : '0' }} VNĐ</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="quantity" label="Số lượng" width="90" align="center" />
          </ElTable>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <ElButton @click="receiptDetailVisible = false">Đóng</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
import { Download, Memo } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue';
import { statisticsApi } from '@/api/operations';
import { InventoryReportApi, InventoryReceiptApi } from '@/api/inventory';
import { SettingApi } from '@/api/setting.api';
import type * as Statistical from '@/types/api/statistical';

interface StockItem {
  id: string;
  name: string;
  level: number;
  beginning: number;
  imported: number;
  exported: number;
  inStock: number;
  variantId?: number;
  colorId?: number;
  children?: StockItem[];
}
interface MockReceipt {
  id?: number;
  code: string;
  supplier: string;
  quantity: number;
  price: number;
  date: string;
}
interface MockInvoice {
  id?: number;
  code: string;
  customer: string;
  quantity: number;
  price: number;
  date: string;
}

const brandChartRef = ref<HTMLElement | null>(null);
const statusChartRef = ref<HTMLElement | null>(null);
let brandChart: echarts.ECharts | null = null;
let statusChart: echarts.ECharts | null = null;
const chartTextColor = '#4b5563';
const chartPalette = ['#e84a4a', '#ff6b6b', '#f97316', '#22c55e', '#3b82f6', '#a855f7'];

const data = ref<Statistical.AdminWarehouseReportResponse>({
  summary: {
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  },
  stockByBrand: [],
  stockStatusRatio: [],
  warehouseTableData: [],
});

const tableRef = ref();
const exporting = ref(false);
const loadingData = ref(false);

const inventoryThreshold = ref(5);
const dialogVisible = ref(false);
const activeTab = ref('receipts');
const selectedRow = ref<StockItem | null>(null);
const selectedRowName = ref('');
const mockReceipts = ref<MockReceipt[]>([]);
const mockInvoices = ref<MockInvoice[]>([]);
const receiptDetailVisible = ref(false);
const receiptDetailData = ref<any>(null);
const newTableData = ref<StockItem[]>([]);

const columns = [
  {
    label: 'Tên Sản phẩm / Biến thể / Màu sắc',
    prop: 'name',
    minWidth: 320,
    useSlot: true,
  },
  { label: 'Tồn kho đầu kỳ', prop: 'beginning', width: 160, align: 'right' },
  { label: 'Số lượng đã nhập', prop: 'imported', width: 160, align: 'right' },
  { label: 'Số lượng đã xuất', prop: 'exported', width: 160, align: 'right' },
  {
    label: 'Số lượng tồn kho',
    prop: 'inStock',
    width: 160,
    align: 'right',
    useSlot: true,
  },
  {
    label: 'Thao tác',
    prop: 'operation',
    width: 150,
    align: 'center',
    useSlot: true,
  },
];

const paginationState = ref({
  current: 1,
  size: 10,
  total: 0,
});

const paginatedTableData = computed(() => {
  return newTableData.value;
});

const isLeafNode = (row: StockItem): boolean => {
  return row.level === 2 || (row.level === 1 && (!row.children || row.children.length === 0));
};

const getNameClass = (row: StockItem) => {
  if (row.level === 0) return 'text-gray-900 font-bold text-sm md:text-base';
  if (row.level === 1) return 'text-gray-700 font-medium text-sm';
  return 'text-gray-500 text-sm italic';
};

const mapToStockItems = (apiItems: any[]): StockItem[] => {
  if (!apiItems) return [];
  return apiItems.map((prod: any) => {
    const variants = prod.variants
      ? prod.variants.map((v: any) => {
          const colors = v.variantColors
            ? v.variantColors.map((c: any) => {
                return {
                  id: `c-${c.colorId}`,
                  name: c.colorName,
                  level: 2,
                  beginning: c.beginningQty || 0,
                  imported: c.importedQty,
                  exported: c.exportedQty,
                  inStock: c.inventoryQty,
                  variantId: v.variantId,
                  colorId: c.colorId,
                } as StockItem;
              })
            : undefined;

          return {
            id: `v-${v.variantId}`,
            name: v.variantName,
            level: 1,
            beginning: v.beginningQty || 0,
            imported: v.importedQty,
            exported: v.exportedQty,
            inStock: v.inventoryQty,
            variantId: v.variantId,
            children: colors && colors.length > 0 ? colors : undefined,
          } as StockItem;
        })
      : [];

    return {
      id: `p-${prod.productId}`,
      name: prod.productName,
      level: 0,
      beginning: prod.beginningQty || 0,
      imported: prod.importedQty,
      exported: prod.exportedQty,
      inStock: prod.inventoryQty,
      children: variants.length > 0 ? variants : undefined,
    } as StockItem;
  });
};

const handleSizeChange = (val: number) => {
  paginationState.value.size = val;
  paginationState.value.current = 1;
  fetchTableData();
};

const handleCurrentChange = (val: number) => {
  paginationState.value.current = val;
  fetchTableData();
};

const expandAll = () => {
  nextTick(() => {
    if (tableRef.value?.elTableRef) {
      const toggleAll = (rows: any[], expand: boolean) => {
        rows.forEach((row) => {
          tableRef.value.elTableRef.toggleRowExpansion(row, expand);
          if (row.children) {
            toggleAll(row.children, expand);
          }
        });
      };
      toggleAll(paginatedTableData.value, true);
    }
  });
};

const collapseAll = () => {
  nextTick(() => {
    if (tableRef.value?.elTableRef) {
      const toggleAll = (rows: any[], expand: boolean) => {
        rows.forEach((row) => {
          tableRef.value.elTableRef.toggleRowExpansion(row, expand);
          if (row.children) {
            toggleAll(row.children, expand);
          }
        });
      };
      toggleAll(paginatedTableData.value, false);
    }
  });
};

const viewReceiptDetail = async (id?: number) => {
  if (!id) return;
  try {
    const res = await InventoryReceiptApi.getById(id);
    if (res) {
      receiptDetailData.value = res;
      receiptDetailVisible.value = true;
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('Không thể tải chi tiết phiếu nhập!');
  }
};

const handleViewHistory = async (row: StockItem) => {
  if (row.variantId === undefined) return;
  selectedRow.value = row;
  selectedRowName.value = row.name;
  activeTab.value = 'receipts';
  mockReceipts.value = [];
  mockInvoices.value = [];

  try {
    const details = await InventoryReportApi.getDetail(row.variantId, row.colorId);
    if (details) {
      mockReceipts.value = (details.imports || []).map((imp: any, idx: number) => ({
        id: imp.id,
        code: imp.code || `PN-${idx + 1}`,
        supplier: imp.partnerName || 'Nhà cung cấp',
        quantity: imp.qty || 0,
        price: imp.price || 0,
        date: imp.date ? new Date(imp.date).toLocaleDateString('vi-VN') : '-',
      }));

      mockInvoices.value = (details.exports || []).map((exp: any, idx: number) => ({
        id: exp.id,
        code: exp.code || `PX-${idx + 1}`,
        customer: exp.partnerName || 'Khách hàng',
        quantity: exp.qty || 0,
        price: exp.price || 0,
        date: exp.date ? new Date(exp.date).toLocaleDateString('vi-VN') : '-',
      }));
    }
    dialogVisible.value = true;
  } catch (err) {
    console.error(err);
    ElMessage.error('Không thể tải lịch sử giao dịch!');
  }
};

const stockRatio = computed(() => {
  const s = data.value.summary;
  const total = s.totalStock;
  if (!total || total <= 0) return '0%';
  const safe = total - s.lowStockCount - s.outOfStockCount;
  const ratio = Math.max(0, Math.min(100, (safe / total) * 100));
  return ratio.toFixed(1) + '%';
});

const props = defineProps<{
  startDate?: string;
  endDate?: string;
}>();

watch(
  () => [props.startDate, props.endDate],
  () => {
    load();
  }
);

const fetchTableData = async () => {
  loadingData.value = true;
  try {
    let month: number | undefined = undefined;
    let year: number | undefined = undefined;
    if (props.startDate) {
      const d = new Date(props.startDate);
      month = d.getMonth() + 1;
      year = d.getFullYear();
    }

    const res = await InventoryReportApi.getSummary({
      pageNumber: paginationState.value.current,
      pageSize: paginationState.value.size,
      month,
      year,
    });
    if (res) {
      newTableData.value = mapToStockItems(res.items || []);
      paginationState.value.total = res.totalCount || 0;
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('Không thể tải báo cáo xuất nhập tồn!');
  } finally {
    loadingData.value = false;
  }
};

const handleExport = async () => {
  exporting.value = true;
  try {
    let month: number | undefined = undefined;
    let year: number | undefined = undefined;
    if (props.startDate) {
      const d = new Date(props.startDate);
      month = d.getMonth() + 1;
      year = d.getFullYear();
    }

    const resBlob = await InventoryReportApi.export({
      month,
      year,
    });
    const url = window.URL.createObjectURL(new Blob([resBlob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bao_cao_ton_kho.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('Đã xuất báo cáo thành công!');
  } catch (err) {
    console.error(err);
    ElMessage.error('Không thể xuất báo cáo!');
  } finally {
    exporting.value = false;
  }
};

async function load() {
  try {
    const summaryData = await statisticsApi.getWarehouseReport(props.startDate, props.endDate);
    data.value = summaryData;
    renderCharts();
  } catch (e) {
    console.error('Failed to load summary stats:', e);
  }
  fetchTableData();
}

function renderCharts() {
  if (brandChartRef.value) {
    if (!brandChart) brandChart = echarts.init(brandChartRef.value);
    const top = data.value.stockByBrand.slice(0, 8);
    brandChart.setOption({
      backgroundColor: 'transparent',
      color: chartPalette,
      textStyle: { color: chartTextColor, fontSize: 12, fontWeight: 500 },
      tooltip: { trigger: 'item' },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: chartTextColor, fontWeight: 500, fontSize: 11 },
        formatter: (name: string) => (name.length > 14 ? name.slice(0, 14) + '…' : name),
      },
      series: [
        {
          type: 'pie',
          radius: ['38%', '65%'],
          center: ['50%', '42%'],
          data: top.map((d) => ({
            name: d.brandName || 'Khác',
            value: d.stockCount,
          })),
          label: { show: false },
        },
      ],
    });
  }
  if (statusChartRef.value) {
    if (!statusChart) statusChart = echarts.init(statusChartRef.value);
    statusChart.setOption({
      backgroundColor: 'transparent',
      color: chartPalette,
      textStyle: { color: chartTextColor, fontSize: 12, fontWeight: 500 },
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: chartTextColor, fontWeight: 500, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['38%', '65%'],
          center: ['50%', '42%'],
          data: data.value.stockStatusRatio.map((d) => ({
            name: d.statusLabel || 'Khác',
            value: d.count,
          })),
          label: { show: true, formatter: '{b}: {c}' },
        },
      ],
    });
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}
function warehouseStatusType(status?: string) {
  if (status === 'Bình thường') return 'success';
  if (status === 'Sắp hết') return 'warning';
  if (status === 'Hết hàng') return 'danger';
  return 'info';
}
function handleResize() {
  brandChart?.resize();
  statusChart?.resize();
}
onMounted(async () => {
  try {
    const settingData = await SettingApi.getAll();
    if (settingData && settingData.Inventory_alert_level) {
      inventoryThreshold.value = Number(settingData.Inventory_alert_level);
    }
  } catch (err) {}
  load();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  brandChart?.dispose();
  statusChart?.dispose();
});
</script>

<style scoped>
.art-table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
}

:deep(.el-table__row--level-0) {
  background-color: var(--default-box-color) !important;
}

:deep(.el-table__row--level-1) {
  background-color: var(--el-fill-color-light) !important;
}

:deep(.el-table__row--level-2) {
  background-color: var(--el-fill-color-lighter) !important;
}

:deep(.el-table__expand-icon) {
  margin-right: 8px !important;
  font-weight: bold;
  color: var(--main-color) !important;
}
</style>
