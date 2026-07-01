<template>
  <div class="invoices-page flex flex-col gap-4 pb-5">
    <!-- Header Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <ElInput
          v-model="searchQuery"
          placeholder="Tìm theo mã HĐ, tên KH, Số khung, Số máy..."
          clearable
          size="default"
          style="width: 380px"
          @input="handleSearch"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
        <ElSelect
          v-model="filterStatus"
          placeholder="Trạng thái"
          size="default"
          clearable
          @change="handleSearch"
        >
          <ElOption label="📝 Chờ thanh toán" value="pending" />
          <ElOption label="✅ Đã hoàn tất" value="completed" />
          <ElOption label="🔄 Đang xử lý" value="processing" />
          <ElOption label="❌ Đã hủy" value="cancelled" />
        </ElSelect>
      </div>
      <ElButton type="primary" @click="handleCreateNew">
        <ElIcon class="mr-1"><Plus /></ElIcon>
        Tạo hóa đơn mới
      </ElButton>
    </div>

    <!-- Invoice List -->
    <ElCard shadow="never" class="invoice-list-card">
      <ElTable
        :data="paginatedInvoices"
        style="width: 100%"
        v-loading="loadingList"
        @row-click="(row) => handleView(row)"
      >
        <ElTableColumn label="Mã HĐ" width="130" align="center">
          <template #default="{ row }">
            <ElText type="primary" tag="b">{{ row.invoiceNumber }}</ElText>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Ngày lập" width="110" align="center">
          <template #default="{ row }">
            {{ formatDate(row.issueDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="Khách hàng" min-width="180">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.customerName }}</span>
              <span class="text-xs text-gray-500">{{ row.customerPhone }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Xe bán" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.vehicleModel }}</span>
              <span class="text-xs text-gray-500">{{ row.vehicleColor }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Số khung" width="140" align="center">
          <template #default="{ row }">
            <span class="font-mono text-xs">{{ row.chassisNo }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Số máy" width="140" align="center">
          <template #default="{ row }">
            <span class="font-mono text-xs">{{ row.engineNo }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Tổng tiền" width="140" align="right">
          <template #default="{ row }">
            <span class="font-bold text-gray-800">{{
              formatCurrency(row.totalAmount)
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Thanh toán" width="130" align="center">
          <template #default="{ row }">
            <ElTag :type="getPaymentTagType(row.paymentMethod)" size="small">
              {{ getPaymentLabel(row.paymentMethod) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Thao tác" width="100" align="center">
          <template #default="{ row }">
            <ElButton
              link
              type="primary"
              size="small"
              @click.stop="handleView(row)"
            >
              Chi tiết
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- Pagination -->
    <div class="flex justify-end mt-4">
      <ElPagination
        v-model:currentPage="pagination.current"
        v-model:pageSize="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- Detail Dialog -->
    <ElDialog
      v-model="dialog.visible"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
      class="premium-invoice-modal"
      :show-close="true"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Icon icon="ri:file-list-3-line" class="text-xl" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 m-0 leading-tight">
              Chi tiết Hóa Đơn Bán Xe
            </h3>
            <p class="text-sm text-gray-500 m-0 mt-1">
              {{ dialog.invoice?.invoiceNumber }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="dialog.invoice" class="premium-invoice-body">
        <!-- Status Banner -->
        <div
          class="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100"
        >
          <div>
            <div class="text-sm text-gray-500 mb-1">Trạng thái Hóa đơn</div>
            <ElTag
              :type="getStatusTagType(dialog.invoice.status)"
              effect="dark"
              size="large"
              class="font-bold px-4"
            >
              {{ getStatusLabel(dialog.invoice.status) }}
            </ElTag>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500 mb-1">Tổng thanh toán</div>
            <div class="text-2xl font-black text-red-600">
              {{ formatCurrency(dialog.invoice.totalAmount) }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <!-- Customer Info -->
          <div class="info-card">
            <div
              class="card-header flex items-center gap-2 text-gray-700 font-semibold mb-4 pb-2 border-b"
            >
              <Icon icon="ri:user-smile-line" class="text-blue-500" />
              <span>Thông tin Khách hàng</span>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Họ tên:</span>
                <span class="font-medium text-gray-800">{{
                  dialog.invoice.customerName
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Điện thoại:</span>
                <span class="font-medium text-gray-800">{{
                  dialog.invoice.customerPhone
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Số CCCD:</span>
                <span class="font-medium text-gray-800">{{
                  dialog.invoice.customerIdCard || "-"
                }}</span>
              </div>
              <div class="flex flex-col gap-1 mt-1">
                <span class="text-gray-500 text-sm">Địa chỉ:</span>
                <span class="font-medium text-gray-800 text-sm leading-snug">{{
                  dialog.invoice.customerAddress
                }}</span>
              </div>
            </div>
          </div>

          <!-- Vehicle Info -->
          <div class="info-card">
            <div
              class="card-header flex items-center gap-2 text-gray-700 font-semibold mb-4 pb-2 border-b"
            >
              <Icon icon="ri:motorbike-fill" class="text-orange-500" />
              <span>Thông tin Xe</span>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Dòng xe:</span>
                <span class="font-medium text-gray-800">{{
                  dialog.invoice.vehicleModel
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Màu sơn:</span>
                <span class="font-medium text-gray-800">{{
                  dialog.invoice.vehicleColor
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Số khung:</span>
                <span
                  class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700"
                  >{{ dialog.invoice.chassisNo }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Số máy:</span>
                <span
                  class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700"
                  >{{ dialog.invoice.engineNo }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Breakdown -->
        <div class="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
          <div class="flex items-center gap-2 text-blue-800 font-semibold mb-4">
            <Icon icon="ri:bill-line" />
            <span>Chi tiết Thanh toán</span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Giá trị xe:</span>
              <span class="font-medium text-gray-800">{{
                formatCurrency(dialog.invoice.vehiclePrice)
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Phí đăng ký (Biển số/trước bạ):</span>
              <span class="font-medium text-gray-800">{{
                formatCurrency(dialog.invoice.registrationFee)
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Phí bảo hiểm:</span>
              <span class="font-medium text-gray-800">{{
                formatCurrency(dialog.invoice.insuranceFee)
              }}</span>
            </div>
          </div>

          <div
            class="border-t border-blue-200 pt-3 flex justify-between items-center"
          >
            <div class="text-sm">
              <span class="text-gray-500 block mb-1">Phương thức</span>
              <ElTag size="small" type="info" class="border-gray-200">
                <Icon
                  icon="ri:bank-card-line"
                  class="mr-1 inline-block align-text-bottom"
                />
                {{ getPaymentLabel(dialog.invoice.paymentMethod) }}
              </ElTag>
            </div>
            <div class="text-sm text-right">
              <span class="text-gray-500 block mb-1">Ngày lập HĐ</span>
              <span class="font-medium text-gray-800">{{
                formatDate(dialog.invoice.issueDate)
              }}</span>
            </div>
            <div class="text-sm text-right">
              <span class="text-gray-500 block mb-1">Ngày giao dự kiến</span>
              <span class="font-medium text-gray-800">{{
                dialog.invoice.deliveryDate
                  ? formatDate(dialog.invoice.deliveryDate)
                  : "-"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-2 pb-2">
          <ElButton @click="dialog.visible = false" plain>Đóng lại</ElButton>
          <ElButton type="primary" @click="handlePrintInvoice(dialog.invoice)">
            <Icon icon="ri:printer-line" class="mr-1" />
            In Hóa Đơn
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Create Dialog -->
    <ElDialog
      v-model="createDialog.visible"
      title="Tạo hóa đơn mới"
      width="65%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <ElForm
        v-if="createDialog.visible"
        :model="createDialog.form"
        label-width="160px"
        label-position="right"
      >
        <ElDivider content-position="left">📋 Thông tin khách hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Họ tên" required>
            <ElInput v-model="createDialog.form.customerName" />
          </ElFormItem>
          <ElFormItem label="Số điện thoại" required>
            <ElInput v-model="createDialog.form.customerPhone" />
          </ElFormItem>
          <ElFormItem label="Số CCCD">
            <ElInput v-model="createDialog.form.customerIdCard" />
          </ElFormItem>
          <ElFormItem label="Địa chỉ">
            <ElInput v-model="createDialog.form.customerAddress" />
          </ElFormItem>
          <ElFormItem label="Liên kết HĐ mua hàng">
            <ElSelect
              v-model="createDialog.form.purchaseInvoiceId"
              placeholder="Chọn HĐ mua hàng"
              filterable
              remote
              clearable
              :remote-method="searchPurchaseInvoices"
              :loading="loadingPurchaseInvoices"
              @change="onPurchaseInvoiceSelected"
              class="w-full"
            >
              <ElOption
                v-for="item in purchaseInvoiceOptions"
                :key="item.id"
                :label="item.invoiceNumber"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElDivider content-position="left">🏍️ Thông tin xe</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Dòng xe" required>
            <ElInput v-model="createDialog.form.vehicleModel" />
          </ElFormItem>
          <ElFormItem label="Màu sơn">
            <ElInput v-model="createDialog.form.vehicleColor" />
          </ElFormItem>
          <ElFormItem label="Số khung" required>
            <ElInput v-model="createDialog.form.chassisNo" />
          </ElFormItem>
          <ElFormItem label="Số máy" required>
            <ElInput v-model="createDialog.form.engineNo" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💰 Chi tiết tài chính</ElDivider>
        <div class="grid grid-cols-3 gap-4">
          <ElFormItem label="Giá xe" required>
            <ElInputNumber
              v-model="createDialog.form.vehiclePrice"
              :min="0"
              :step="1000000"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí đăng ký">
            <ElInputNumber
              v-model="createDialog.form.registrationFee"
              :min="0"
              :step="100000"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí bảo hiểm">
            <ElInputNumber
              v-model="createDialog.form.insuranceFee"
              :min="0"
              :step="100000"
              class="w-full"
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💳 Thanh toán</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Phương thức" required>
            <ElSelect v-model="createDialog.form.paymentMethod" class="w-full">
              <ElOption label="Chuyển khoản" value="transfer" />
              <ElOption label="Tiền mặt" value="cash" />
              <ElOption label="Trả góp" value="installment" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngân hàng">
            <ElInput
              v-model="createDialog.form.bankName"
              placeholder="VD: Vietcombank, Techcombank..."
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">📦 Giao hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="NV bán hàng">
            <ElInput
              v-model="createDialog.form.salesPerson"
              placeholder="Tên nhân viên bán hàng"
            />
          </ElFormItem>
          <ElFormItem label="Ngày giao dự kiến">
            <ElDatePicker
              v-model="createDialog.form.deliveryDate"
              type="date"
              placeholder="Chọn ngày giao"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <ElButton @click="createDialog.visible = false">Hủy</ElButton>
        <ElButton type="primary" :loading="actionLoading" @click="handleSave">
          Tạo hóa đơn
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus } from "@element-plus/icons-vue";
import {
  invoiceApi,
  type AdminInvoiceDetailResponse,
  type AdminInvoiceSummaryResponse,
  type CreateAdminInvoiceRequest,
  type UpdateAdminInvoiceRequest,
} from "@/api/sales/invoice.api";
import { purchaseInvoiceApi } from "@/api/purchase-invoice/purchase-invoice.api";
import type { PurchaseInvoiceListResult } from "@/domain/purchase-invoice/types";

defineOptions({ name: "SalesInvoices" });

// ==================== TYPES ====================
interface InvoiceRow {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  totalAmount: number;
  paymentMethod: string;
  bankName?: string;
  status: string;
  salesPerson?: string;
  deliveryDate?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

// ==================== STATE ====================
const invoices = ref<InvoiceRow[]>([]);
const loadingList = ref(false);
const actionLoading = ref(false);
const searchQuery = ref("");
const filterStatus = ref<string>("");
const totalCount = ref(0);
const pagination = reactive({ current: 1, size: 10 });

const dialog = reactive({
  visible: false,
  readonly: true,
  title: "",
  invoice: null as AdminInvoiceDetailResponse | null,
  form: {} as UpdateAdminInvoiceRequest,
});

const loadingPurchaseInvoices = ref(false);
const purchaseInvoiceOptions = ref<PurchaseInvoiceListResult[]>([]);

const createDialog = reactive({
  visible: false,
  form: {
    purchaseInvoiceId: undefined as number | undefined,
    customerName: "",
    customerPhone: "",
    customerIdCard: "",
    customerAddress: "",
    vehicleModel: "",
    vehicleColor: "",
    chassisNo: "",
    engineNo: "",
    vehiclePrice: 0,
    registrationFee: 0,
    insuranceFee: 0,
    paymentMethod: "transfer",
    bankName: "",
    salesPerson: "",
    deliveryDate: "",
    paymentBreakdown: [],
    items: [],
    subTotal: 0,
    taxAmount: 0,
  } as CreateAdminInvoiceRequest,
});

// ==================== COMPUTED ====================
const filteredInvoices = computed(() => {
  let result = invoices.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.chassisNo.toLowerCase().includes(q) ||
        inv.engineNo.toLowerCase().includes(q) ||
        inv.vehicleModel.toLowerCase().includes(q),
    );
  }
  if (filterStatus.value) {
    result = result.filter((inv) => inv.status === filterStatus.value);
  }
  return result;
});

const paginatedInvoices = computed(() => {
  const start = (pagination.current - 1) * pagination.size;
  const end = start + pagination.size;
  return filteredInvoices.value.slice(start, end);
});

// ==================== FETCH ====================
async function fetchInvoices() {
  loadingList.value = true;
  try {
    const res = await invoiceApi.getAdminList({
      Page: pagination.current,
      PageSize: pagination.size,
    });
    invoices.value = res.items ?? [];
    totalCount.value = res.totalCount ?? 0;
  } catch (e) {
    ElMessage.error("Không thể tải danh sách hóa đơn");
  } finally {
    loadingList.value = false;
  }
}

function handlePageChange() {
  fetchInvoices();
}

function handleSizeChange() {
  pagination.current = 1;
  fetchInvoices();
}

function handleSearch() {
  pagination.current = 1;
  fetchInvoices();
}

// ==================== PURCHASE INVOICE ====================
async function searchPurchaseInvoices(query: string) {
  if (!query || query.length < 2) {
    purchaseInvoiceOptions.value = [];
    return;
  }
  loadingPurchaseInvoices.value = true;
  try {
    const result = await purchaseInvoiceApi.getList({
      current: 1,
      size: 10,
      search: query,
    });
    purchaseInvoiceOptions.value = result.records || [];
  } catch {
    purchaseInvoiceOptions.value = [];
  } finally {
    loadingPurchaseInvoices.value = false;
  }
}

function onPurchaseInvoiceSelected(invoiceId: number | undefined) {
  if (!invoiceId) {
    createDialog.form.customerName = "";
    createDialog.form.customerPhone = "";
    createDialog.form.customerAddress = "";
    createDialog.form.customerIdCard = "";
    createDialog.form.items = [];
    createDialog.form.subTotal = 0;
    createDialog.form.taxAmount = 0;
    return;
  }
  const invoice = purchaseInvoiceOptions.value.find((i) => i.id === invoiceId);
  if (invoice) {
    createDialog.form.customerName = invoice.customerName || "";
    createDialog.form.customerPhone = invoice.customerPhone || "";
    createDialog.form.customerAddress = invoice.customerAddress || "";
    createDialog.form.customerIdCard = invoice.customerIdCard || "";
  }
}

// ==================== DIALOG ACTIONS ====================
function handleView(row: InvoiceRow) {
  dialog.visible = true;
  dialog.readonly = true;
  dialog.title = `Chi tiết hóa đơn ${row.invoiceNumber}`;
  dialog.invoice = row as unknown as AdminInvoiceDetailResponse;
  dialog.form = {
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerIdCard: row.customerIdCard,
    customerAddress: row.customerAddress,
    vehicleModel: row.vehicleModel,
    vehicleColor: row.vehicleColor,
    chassisNo: row.chassisNo,
    engineNo: row.engineNo,
    vehiclePrice: row.vehiclePrice,
    registrationFee: row.registrationFee,
    insuranceFee: row.insuranceFee,
    paymentMethod: row.paymentMethod,
    bankName: row.bankName,
    salesPerson: row.salesPerson,
    deliveryDate: row.deliveryDate,
    paymentBreakdown: [],
  };
}

const handlePrintInvoice = (invoice: InvoiceRow) => {
  window.print();
};

const handleCreate = async () => {
  createDialog.form = {
    purchaseInvoiceId: undefined,
    customerName: "",
    customerPhone: "",
    customerIdCard: "",
    customerAddress: "",
    vehicleModel: "",
    vehicleColor: "",
    chassisNo: "",
    engineNo: "",
    vehiclePrice: 0,
    registrationFee: 0,
    insuranceFee: 0,
    paymentMethod: "transfer",
    bankName: "",
    salesPerson: "",
    deliveryDate: "",
    paymentBreakdown: [],
    items: [],
    subTotal: 0,
    taxAmount: 0,
  };
  createDialog.visible = true;
};

async function handleSave() {
  if (!createDialog.form.customerName) {
    ElMessage.warning("Vui lòng nhập tên khách hàng");
    return;
  }
  if (!createDialog.form.customerPhone) {
    ElMessage.warning("Vui lòng nhập số điện thoại");
    return;
  }
  if (!createDialog.form.vehicleModel) {
    ElMessage.warning("Vui lòng nhập dòng xe");
    return;
  }
  actionLoading.value = true;
  try {
    await invoiceApi.createAdmin(createDialog.form);
    ElMessage.success("Tạo hóa đơn thành công");
    createDialog.visible = false;
    fetchInvoices();
  } catch (e) {
    ElMessage.error("Không thể tạo hóa đơn");
  } finally {
    actionLoading.value = false;
  }
}

// ==================== HELPERS ====================
function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "📝 Chờ thanh toán",
    completed: "✅ Đã hoàn tất",
    processing: "🔄 Đang xử lý",
    cancelled: "❌ Đã hủy",
  };
  return map[status] || status;
}

function getStatusTagType(status: string) {
  const map: Record<string, string> = {
    pending: "warning",
    completed: "success",
    processing: "info",
    cancelled: "danger",
  };
  return map[status] || "";
}

function getPaymentLabel(method: string) {
  const map: Record<string, string> = {
    transfer: "Chuyển khoản",
    cash: "Tiền mặt",
    installment: "Trả góp",
  };
  return map[method] || method;
}

function getPaymentTagType(method: string) {
  const map: Record<string, string> = {
    transfer: "primary",
    cash: "success",
    installment: "warning",
  };
  return map[method] || "";
}

// ==================== LIFECYCLE ====================
onMounted(() => {
  fetchInvoices();
});
</script>

<style scoped lang="scss">
.premium-invoice-modal {
  :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 16px;
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
  }
}

.premium-invoice-body {
  .info-card {
    @apply bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md;
  }
}

html.dark {
  .premium-invoice-modal {
    :deep(.el-dialog) {
      background-color: #1a1b1e;
      border: 1px solid #2c2f36;
    }

    :deep(.el-dialog__header),
    :deep(.el-dialog__footer) {
      border-color: #2c2f36;
    }
    .text-gray-800 {
      color: #f8fafc;
    }
    .text-gray-700 {
      color: #cbd5e1;
    }
    .text-gray-600 {
      color: #94a3b8;
    }
    .text-gray-500 {
      color: #64748b;
    }

    .bg-blue-50,
    .bg-blue-50\/50 {
      background-color: rgb(59 130 246 / 5%);
    }

    .bg-gray-50,
    .bg-gray-100 {
      background-color: #25262b;
    }

    .border-gray-100,
    .border-blue-100,
    .border-blue-200 {
      border-color: #2c2f36;
    }

    .info-card {
      background-color: #141517;
      border-color: #2c2f36;
    }

    .border-b {
      border-color: #2c2f36;
    }
  }
}

.invoices-page {
  padding: 20px;
}

.invoice-list-card {
  border-radius: 8px;
}

.detail-content {
  padding: 10px 0;
}
</style>
