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
        @row-click="handleRowClick"
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
        <ElTableColumn
          label="Thao tác"
          width="120"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <ElButton
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              link
              @click.stop="handleMarkCompleted(row)"
            >
              ✓ Xác nhận
            </ElButton>
            <ElButton
              type="primary"
              size="small"
              link
              @click.stop="handleEdit(row)"
            >
              ✏️ Sửa
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="totalCount"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- Invoice Detail / Edit Dialog -->
    <ElDialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="65%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <ElForm
        v-if="dialog.invoice"
        :model="dialog.form"
        label-width="160px"
        label-position="right"
      >
        <ElDivider content-position="left">📋 Thông tin khách hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Họ tên" required>
            <ElInput
              v-model="dialog.form.customerName"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem label="Số điện thoại" required>
            <ElInput
              v-model="dialog.form.customerPhone"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem label="Số CCCD">
            <ElInput
              v-model="dialog.form.customerIdCard"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem label="Địa chỉ">
            <ElInput
              v-model="dialog.form.customerAddress"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">🏍️ Thông tin xe</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Dòng xe" required>
            <ElInput
              v-model="dialog.form.vehicleModel"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem label="Màu sơn">
            <ElInput
              v-model="dialog.form.vehicleColor"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem label="Số khung" required>
            <ElInput
              v-model="dialog.form.chassisNo"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem label="Số máy" required>
            <ElInput
              v-model="dialog.form.engineNo"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💰 Chi tiết tài chính</ElDivider>
        <div class="grid grid-cols-3 gap-4">
          <ElFormItem label="Giá xe (đã gồm VAT)">
            <ElInputNumber
              v-model="dialog.form.vehiclePrice"
              :disabled="dialog.readonly"
              :min="0"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí đăng ký biển số">
            <ElInputNumber
              v-model="dialog.form.registrationFee"
              :disabled="dialog.readonly"
              :min="0"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí bảo hiểm TNDS">
            <ElInputNumber
              v-model="dialog.form.insuranceFee"
              :disabled="dialog.readonly"
              :min="0"
              class="w-full"
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💳 Thanh toán</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Phương thức">
            <ElSelect
              v-model="dialog.form.paymentMethod"
              :disabled="dialog.readonly"
              class="w-full"
            >
              <ElOption label="Tiền mặt" value="cash" />
              <ElOption label="Chuyển khoản" value="transfer" />
              <ElOption label="Trả góp" value="installment" />
              <ElOption label="Kết hợp" value="mixed" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngân hàng tài trợ">
            <ElInput
              v-model="dialog.form.bankName"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem v-if="!dialog.readonly" label="Trạng thái">
            <ElSelect v-model="dialog.form.status" class="w-full">
              <ElOption label="📝 Chờ thanh toán" value="pending" />
              <ElOption label="✅ Đã hoàn tất" value="completed" />
              <ElOption label="🔄 Đang xử lý" value="processing" />
              <ElOption label="❌ Đã hủy" value="cancelled" />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElDivider content-position="left">👤 Thông tin bán hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Nhân viên bán hàng">
            <ElInput
              v-model="dialog.form.salesPerson"
              :disabled="dialog.readonly"
            />
          </ElFormItem>
          <ElFormItem label="Ngày bàn giao dự kiến">
            <ElDatePicker
              v-model="dialog.form.deliveryDate"
              type="date"
              :disabled="dialog.readonly"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialog.visible = false">Đóng</ElButton>
          <ElButton
            v-if="!dialog.readonly"
            type="primary"
            @click="handleSave"
            :loading="actionLoading"
          >
            💾 Lưu
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
          <ElFormItem label="Giá xe (đã gồm VAT)">
            <ElInputNumber
              v-model="createDialog.form.vehiclePrice"
              :min="0"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí đăng ký biển số">
            <ElInputNumber
              v-model="createDialog.form.registrationFee"
              :min="0"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí bảo hiểm TNDS">
            <ElInputNumber
              v-model="createDialog.form.insuranceFee"
              :min="0"
              class="w-full"
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💳 Thanh toán</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Phương thức">
            <ElSelect v-model="createDialog.form.paymentMethod" class="w-full">
              <ElOption label="Tiền mặt" value="cash" />
              <ElOption label="Chuyển khoản" value="transfer" />
              <ElOption label="Trả góp" value="installment" />
              <ElOption label="Kết hợp" value="mixed" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngân hàng tài trợ">
            <ElInput v-model="createDialog.form.bankName" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">👤 Thông tin bán hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Nhân viên bán hàng">
            <ElInput v-model="createDialog.form.salesPerson" />
          </ElFormItem>
          <ElFormItem label="Ngày bàn giao dự kiến">
            <ElDatePicker
              v-model="createDialog.form.deliveryDate"
              type="date"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="createDialog.visible = false">Hủy</ElButton>
          <ElButton
            type="primary"
            @click="handleCreate"
            :loading="actionLoading"
          >
            💾 Tạo hóa đơn
          </ElButton>
        </div>
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

const createDialog = reactive({
  visible: false,
  form: {
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
      Filters: filterStatus.value
        ? `Status eq '${filterStatus.value}'`
        : undefined,
    });
    invoices.value = (res.items || []).map((inv) => ({
      ...inv,
      issueDate: inv.issueDate,
      createdAt: inv.createdAt,
    }));
    totalCount.value = res.totalCount || 0;
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    ElMessage.error("Không thể tải danh sách hóa đơn");
  } finally {
    loadingList.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  fetchInvoices();
}

function handleSizeChange() {
  pagination.current = 1;
  fetchInvoices();
}

function handleCurrentChange() {
  fetchInvoices();
}

// ==================== DIALOG ACTIONS ====================
function handleRowClick(row: InvoiceRow) {
  dialog.readonly = true;
  dialog.title = `Hóa đơn ${row.invoiceNumber}`;
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
    status: row.status,
    salesPerson: row.salesPerson,
    deliveryDate: row.deliveryDate,
    paymentBreakdown: [],
  };
  dialog.visible = true;
}

function handleEdit(row: InvoiceRow) {
  dialog.readonly = false;
  dialog.title = `Chỉnh sửa hóa đơn ${row.invoiceNumber}`;
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
    status: row.status,
    salesPerson: row.salesPerson,
    deliveryDate: row.deliveryDate,
    paymentBreakdown: [],
  };
  dialog.visible = true;
}

function handleCreateNew() {
  createDialog.form = {
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
  };
  createDialog.visible = true;
}

async function handleSave() {
  if (!dialog.invoice) return;
  try {
    actionLoading.value = true;
    await invoiceApi.updateAdmin(dialog.invoice.id, dialog.form);
    ElMessage.success("Đã cập nhật hóa đơn");
    dialog.visible = false;
    fetchInvoices();
  } catch (error) {
    console.error(error);
    ElMessage.error("Cập nhật hóa đơn thất bại");
  } finally {
    actionLoading.value = false;
  }
}

async function handleCreate() {
  try {
    actionLoading.value = true;
    await invoiceApi.createAdmin(createDialog.form);
    ElMessage.success("Đã tạo hóa đơn mới");
    createDialog.visible = false;
    fetchInvoices();
  } catch (error) {
    console.error(error);
    ElMessage.error("Tạo hóa đơn thất bại");
  } finally {
    actionLoading.value = false;
  }
}

async function handleMarkCompleted(row: InvoiceRow) {
  try {
    await ElMessageBox.confirm(
      `Xác nhận thanh toán hóa đơn ${row.invoiceNumber}?\n\nTổng tiền: ${formatCurrency(row.totalAmount)}`,
      "Xác nhận",
      { type: "success", confirmButtonText: "Xác nhận thanh toán" },
    );
    actionLoading.value = true;
    await invoiceApi.updateAdminStatus(row.id, { status: "completed" });
    ElMessage.success("Đã xác nhận thanh toán - Hóa đơn đã hoàn tất");
    fetchInvoices();
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Thao tác thất bại");
    }
  } finally {
    actionLoading.value = false;
  }
}

// ==================== HELPERS ====================
function formatCurrency(value?: number): string {
  if (value == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentLabel(method: string): string {
  switch (method) {
    case "cash":
      return "Tiền mặt";
    case "transfer":
      return "Chuyển khoản";
    case "installment":
      return "Trả góp";
    case "mixed":
      return "Kết hợp";
    default:
      return "---";
  }
}

function getPaymentTagType(
  method: string,
): "success" | "warning" | "info" | "primary" {
  switch (method) {
    case "cash":
      return "success";
    case "transfer":
      return "info";
    case "installment":
      return "warning";
    case "mixed":
      return "primary";
    default:
      return "info";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Chờ thanh toán";
    case "completed":
      return "Đã hoàn tất";
    case "processing":
      return "Đang xử lý";
    case "cancelled":
      return "Đã hủy";
    default:
      return "---";
  }
}

function getStatusTagType(
  status: string,
): "warning" | "success" | "info" | "danger" {
  switch (status) {
    case "pending":
      return "warning";
    case "completed":
      return "success";
    case "processing":
      return "info";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
}

onMounted(() => {
  fetchInvoices();
});
</script>

<style scoped>
.invoices-page {
  padding: 16px;
}

.invoice-list-card {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light) !important;
  font-weight: 600;
  color: var(--el-text-color-regular) !important;
}

:global(html.dark) {
  .text-gray-900,
  .text-gray-800,
  .text-gray-700 {
    color: var(--el-text-color-primary) !important;
  }

  .text-gray-600 {
    color: var(--el-text-color-regular) !important;
  }

  .text-gray-500 {
    color: var(--el-text-color-secondary) !important;
  }
}
</style>
