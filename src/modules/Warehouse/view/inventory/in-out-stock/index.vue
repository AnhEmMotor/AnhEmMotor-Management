<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-5 gap-4">
      <ArtStatsCard
        title="Tổng đã nhập"
        :count="totalStats.imported"
        icon="ri:download-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Tổng đã xuất"
        :count="totalStats.exported"
        icon="ri:upload-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Tổng tồn kho"
        :count="totalStats.inStock"
        icon="ri:archive-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Tổng đã đặt"
        :count="totalStats.ordered"
        icon="ri:shopping-cart-2-line"
        iconStyle="bg-danger"
      />
      <ArtStatsCard
        title="Tổng còn lại"
        :count="totalStats.remaining"
        icon="ri:check-double-line"
        iconStyle="bg-info"
      />
    </div>

    <ArtSearchBar
      :items="searchItems"
      :label-width="150"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader :showColumns="false" @refresh="refreshData">
        <template #left>
          <div class="flex items-center gap-2">
            <h4 class="m-0 font-bold text-gray-800 text-lg">
              Báo cáo Xuất - Nhập - Tồn
            </h4>
            <ElButton
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
          <ElButton type="primary" link @click="expandAll"
            >Mở rộng tất cả</ElButton
          >
          <ElButton type="info" link @click="collapseAll"
            >Thu gọn tất cả</ElButton
          >
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loadingData"
        :data="filteredTableData"
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

        <template #remaining="{ row }">
          <span :class="getRemainingClass(row)">
            {{ row.remaining }}
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
      append-to-body
      destroy-on-close
    >
      <div v-if="selectedRow" class="flex flex-col gap-4">
        <div
          class="p-3 bg-gray-50 border border-gray-100 rounded flex gap-4 text-sm text-gray-600"
        >
          <div>
            <strong>Tồn kho hiện tại:</strong> {{ selectedRow.inStock }} xe
          </div>
          <div><strong>Đã nhập:</strong> {{ selectedRow.imported }} xe</div>
          <div><strong>Đã xuất:</strong> {{ selectedRow.exported }} xe</div>
          <div><strong>Đã đặt trước:</strong> {{ selectedRow.ordered }} xe</div>
        </div>

        <ElTabs v-model="activeTab" class="pl-4 pr-2">
          <ElTabPane name="receipts">
            <template #label>
              <span class="flex items-center gap-1">
                <span>Phiếu Nhập Hàng ({{ mockReceipts.length }})</span>
              </span>
            </template>
            <ElTable :data="mockReceipts" border stripe style="width: 100%">
              <ElTableColumn
                prop="supplier"
                label="Nhà cung cấp"
                min-width="180"
              />
              <ElTableColumn
                prop="quantity"
                label="SL nhập"
                width="100"
                align="right"
              />
              <ElTableColumn
                prop="price"
                label="Đơn giá nhập"
                width="150"
                align="right"
              >
                <template #default="{ row }">
                  {{ row.price.toLocaleString() }} VNĐ
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="date"
                label="Ngày nhập"
                width="140"
                align="center"
              />
              <ElTableColumn
                prop="status"
                label="Trạng thái"
                width="120"
                align="center"
              >
                <template #default>
                  <ElTag type="success" size="small">Đã nhập kho</ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn
                label="Thao tác"
                width="100"
                align="center"
                fixed="right"
              >
                <template #default="{ row }">
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    @click="viewReceiptDetail(row.id)"
                  >
                    Xem phiếu
                  </ElButton>
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
              <ElTableColumn
                prop="customer"
                label="Khách hàng"
                min-width="180"
              />
              <ElTableColumn
                prop="quantity"
                label="SL bán"
                width="100"
                align="right"
              />
              <ElTableColumn
                prop="price"
                label="Đơn giá bán"
                width="150"
                align="right"
              >
                <template #default="{ row }">
                  {{ row.price.toLocaleString() }} VNĐ
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="date"
                label="Ngày xuất"
                width="140"
                align="center"
              />
              <ElTableColumn
                prop="status"
                label="Trạng thái"
                width="120"
                align="center"
              >
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
                ? new Date(receiptDetailData.createdAt).toLocaleDateString(
                    "vi-VN",
                  )
                : "--"
            }}
          </div>
          <div>
            <strong>Ghi chú:</strong>
            {{ receiptDetailData.notes || "Không có ghi chú" }}
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
                  <ElTag
                    v-if="row.productVariantColorName"
                    size="small"
                    type="info"
                    class="w-fit"
                  >
                    Màu: {{ row.productVariantColorName }}
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Nhà cung cấp" width="160">
              <template #default="{ row }">
                <span>{{ row.supplierName || "N/A" }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="130" align="right">
              <template #default="{ row }">
                <span
                  >{{
                    row.unitPrice ? row.unitPrice.toLocaleString() : "0"
                  }}
                  VNĐ</span
                >
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="quantity"
              label="Số lượng"
              width="90"
              align="center"
            />
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
import { ref, computed, nextTick, onMounted } from "vue";
import { Download, Memo } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { InventoryReportApi } from "@/api/inventory-report.api";
import { InventoryReceiptApi } from "@/api/inventory-receipt.api";

defineOptions({ name: "InventoryInOutStock" });

interface StockItem {
  id: string;
  name: string;
  level: number;
  beginning: number;
  imported: number;
  exported: number;
  inStock: number;
  ordered: number;
  remaining: number;
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

const searchQuery = ref("");
const searchMonthYear = ref("");
const tableRef = ref();
const exporting = ref(false);
const loadingData = ref(false);

// Pagination state
const paginationState = ref({
  current: 1,
  size: 10,
  total: 0,
});

// Dialog & Detail viewing state
const dialogVisible = ref(false);
const activeTab = ref("receipts");
const selectedRow = ref<StockItem | null>(null);
const selectedRowName = ref("");
const mockReceipts = ref<MockReceipt[]>([]);
const mockInvoices = ref<MockInvoice[]>([]);

// Receipt full detail dialog state
const receiptDetailVisible = ref(false);
const receiptDetailData = ref<any>(null);

const tableData = ref<StockItem[]>([]);

// Fetch full receipt details
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
    ElMessage.error("Không thể tải chi tiết phiếu nhập!");
  }
};

// API mapper function
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
                  ordered: c.orderedQty,
                  remaining: c.remainingQty,
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
            ordered: v.orderedQty,
            remaining: v.remainingQty,
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
      ordered: prod.orderedQty,
      remaining: prod.remainingQty,
      children: variants.length > 0 ? variants : undefined,
    } as StockItem;
  });
};

// Fetch data from API
const fetchData = async () => {
  loadingData.value = true;
  try {
    let month: number | undefined = undefined;
    let year: number | undefined = undefined;
    if (searchMonthYear.value) {
      const parts = searchMonthYear.value.split("-");
      if (parts.length === 2) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      }
    }

    const res = await InventoryReportApi.getSummary({
      pageNumber: paginationState.value.current,
      pageSize: paginationState.value.size,
      searchTerm: searchQuery.value || undefined,
      month,
      year,
    });
    if (res) {
      tableData.value = mapToStockItems(res.items || []);
      paginationState.value.total = res.totalCount || 0;
    }
  } catch (err) {
    console.error(err);
    ElMessage.error("Không thể tải báo cáo xuất nhập tồn!");
  } finally {
    loadingData.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Compute overall stats for the cards based on current page table data
const totalStats = computed(() => {
  return tableData.value.reduce(
    (acc, p) => {
      acc.imported += p.imported;
      acc.exported += p.exported;
      acc.inStock += p.inStock;
      acc.ordered += p.ordered;
      acc.remaining += p.remaining;
      return acc;
    },
    { imported: 0, exported: 0, inStock: 0, ordered: 0, remaining: 0 },
  );
});

// Table columns definition
const columns = [
  {
    label: "Tên Sản phẩm / Biến thể / Màu sắc",
    prop: "name",
    minWidth: 320,
    useSlot: true,
  },
  { label: "Tồn kho đầu kỳ", prop: "beginning", width: 160, align: "right" },
  { label: "Số lượng đã nhập", prop: "imported", width: 160, align: "right" },
  { label: "Số lượng đã xuất", prop: "exported", width: 160, align: "right" },
  { label: "Số lượng tồn kho", prop: "inStock", width: 160, align: "right" },
  { label: "Số lượng đã đặt", prop: "ordered", width: 160, align: "right" },
  {
    label: "Số lượng còn lại",
    prop: "remaining",
    width: 160,
    align: "right",
    useSlot: true,
  },
  {
    label: "Thao tác",
    prop: "operation",
    width: 150,
    align: "center",
    useSlot: true,
  },
];

const searchItems = computed(() => [
  {
    key: "name",
    label: "Tên sản phẩm",
    type: "input",
    props: { placeholder: "Nhập tên xe, phiên bản hoặc màu sắc..." },
  },
  {
    key: "monthYear",
    label: "Tháng",
    type: "date",
    props: {
      type: "month",
      format: "MM/YYYY",
      valueFormat: "YYYY-MM",
      placeholder: "Chọn tháng (Mặc định tháng hiện tại)",
      clearable: true,
    },
  },
]);

const isLeafNode = (row: StockItem): boolean => {
  return (
    row.level === 2 ||
    (row.level === 1 && (!row.children || row.children.length === 0))
  );
};

const handleSearch = (form: Record<string, any>) => {
  searchQuery.value = form.name || "";
  searchMonthYear.value = form.monthYear || "";
  paginationState.value.current = 1;
  fetchData();
};

const handleReset = () => {
  searchQuery.value = "";
  searchMonthYear.value = "";
  paginationState.value.current = 1;
  fetchData();
};

const refreshData = () => {
  fetchData();
};

const handleSizeChange = (val: number) => {
  paginationState.value.size = val;
  paginationState.value.current = 1;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  paginationState.value.current = val;
  fetchData();
};

// Filter tree recursively (just return tableData since filtered at backend)
const filteredTableData = computed(() => {
  return tableData.value;
});

// Table row styling helpers
const getNameClass = (row: StockItem) => {
  if (row.level === 0) return "text-gray-900 font-bold text-sm md:text-base";
  if (row.level === 1) return "text-gray-700 font-medium text-sm";
  return "text-gray-500 text-sm italic";
};

const getRemainingClass = (row: StockItem) => {
  if (row.remaining < 5) return "font-bold text-danger";
  if (row.remaining < 15) return "font-medium text-warning";
  return "text-success font-semibold";
};

const handleExport = async () => {
  exporting.value = true;
  try {
    let month: number | undefined = undefined;
    let year: number | undefined = undefined;
    if (searchMonthYear.value) {
      const parts = searchMonthYear.value.split("-");
      if (parts.length === 2) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      }
    }

    const resBlob = await InventoryReportApi.export({
      searchTerm: searchQuery.value || undefined,
      month,
      year,
    });
    const url = window.URL.createObjectURL(new Blob([resBlob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Bao_cao_ton_kho.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success("Đã xuất báo cáo Xuất - Nhập - Tồn thành công!");
  } catch (err) {
    console.error(err);
    ElMessage.error("Không thể xuất báo cáo!");
  } finally {
    exporting.value = false;
  }
};

const handleViewHistory = async (row: StockItem) => {
  if (row.variantId === undefined) return;
  selectedRow.value = row;
  selectedRowName.value = row.name;
  activeTab.value = "receipts";
  mockReceipts.value = [];
  mockInvoices.value = [];

  try {
    const details = await InventoryReportApi.getDetail(
      row.variantId,
      row.colorId,
    );
    if (details) {
      mockReceipts.value = (details.imports || []).map(
        (imp: any, idx: number) => ({
          id: imp.id,
          code: imp.code || `PN-${idx + 1}`,
          supplier: imp.partnerName || "Nhà cung cấp",
          quantity: imp.qty || 0,
          price: imp.price || 0,
          date: imp.date ? new Date(imp.date).toLocaleDateString("vi-VN") : "-",
        }),
      );

      mockInvoices.value = (details.exports || []).map(
        (exp: any, idx: number) => ({
          id: exp.id,
          code: exp.code || `PX-${idx + 1}`,
          customer: exp.partnerName || "Khách hàng",
          quantity: exp.qty || 0,
          price: exp.price || 0,
          date: exp.date ? new Date(exp.date).toLocaleDateString("vi-VN") : "-",
        }),
      );
    }
    dialogVisible.value = true;
  } catch (err) {
    console.error(err);
    ElMessage.error("Không thể tải lịch sử giao dịch!");
  }
};

const expandAll = () => {
  nextTick(() => {
    if (tableRef.value?.elTableRef) {
      const toggleAll = (rows: StockItem[], expand: boolean) => {
        rows.forEach((row) => {
          tableRef.value.elTableRef.toggleRowExpansion(row, expand);
          if (row.children) {
            toggleAll(row.children, expand);
          }
        });
      };
      toggleAll(filteredTableData.value, true);
    }
  });
};

const collapseAll = () => {
  nextTick(() => {
    if (tableRef.value?.elTableRef) {
      const toggleAll = (rows: StockItem[], expand: boolean) => {
        rows.forEach((row) => {
          tableRef.value.elTableRef.toggleRowExpansion(row, expand);
          if (row.children) {
            toggleAll(row.children, expand);
          }
        });
      };
      toggleAll(filteredTableData.value, false);
    }
  });
};
</script>

<style scoped>
.art-table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
}

.bg-primary {
  background-color: var(--main-color);
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
