<template>
  <div class="supplier-contract-detail">
    <!-- Expiration Pipeline Status -->
    <el-card shadow="never" class="mb-4">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-sm text-gray-500 mb-1">
            Chi tiết Hợp đồng Nhà cung cấp
          </div>
          <div class="flex items-center gap-2">
            <el-tag :type="contractStatusType" size="large">
              {{ getStatusLabel(contract.status) }}
            </el-tag>
            <el-tag
              v-if="expirationWarningType"
              :type="expirationWarningType"
              size="large"
            >
              {{ expirationWarningLabel }}
            </el-tag>
          </div>
          <div v-if="daysUntilExpiry > 0" class="mt-2">
            <el-progress
              :percentage="expiryProgressPercent"
              :status="expiryProgressStatus"
              :stroke-width="6"
              :show-text="false"
              style="width: 300px"
            />
            <span class="text-xs text-gray-400 ml-2"
              >Còn {{ daysUntilExpiry }} ngày</span
            >
          </div>
        </div>
        <div class="flex gap-2">
          <ElButton
            v-if="contract.status === 'Active'"
            type="warning"
            @click="handleCreateAddendum"
          >
            <ElIcon><Plus /></ElIcon> Tạo phụ lục
          </ElButton>
          <ElButton @click="handlePrint" :disabled="!contract.id"
            >In hợp đồng</ElButton
          >
          <ElButton @click="goBack">Quay lại</ElButton>
        </div>
      </div>
    </el-card>

    <!-- Smart Alert Card -->
    <el-alert
      v-if="showExpirationAlert"
      type="warning"
      :closable="false"
      show-icon
      class="mb-4"
    >
      <template #title>
        <div class="flex justify-between items-center w-full">
          <span
            >Cảnh báo: Hợp đồng sắp hết hạn (còn
            {{ daysUntilExpiry }} ngày)</span
          >
          <ElButton type="primary" size="small" @click="handleCreateAddendum">
            Khởi tạo phụ lục gia hạn
          </ElButton>
        </div>
      </template>
      <div class="mt-2 text-sm">
        <p>
          <strong>Đại diện NCC:</strong> {{ supplierContactInfo.name || "-" }} |
          {{ supplierContactInfo.phone || "-" }}
        </p>
      </div>
    </el-alert>

    <el-row :gutter="20">
      <!-- Left Column: 70% -->
      <el-col :span="17">
        <!-- Section 1: Supplier Profile -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-header font-bold">
              Thông tin Đối tác (Nhà cung cấp)
            </div>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="Tên NCC">{{
              supplierName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Mã NCC">{{
              supplierCode || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Người đại diện">{{
              supplierContactInfo.name || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Số điện thoại">{{
              supplierContactInfo.phone || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Email">{{
              supplierContactInfo.email || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Địa chỉ kho giao nhận">{{
              supplierAddress || "-"
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Section 2: Credit & Payment Terms -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-header font-bold">
              Hạn mức Tín dụng & Công nợ Thương mại
            </div>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="Hạn mức công nợ tối đa">
              <span class="font-bold text-primary">{{
                formatCurrency(creditLimit)
              }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Thời hạn thanh toán">
              {{ paymentWindowDays ? paymentWindowDays + " ngày" : "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Ngân hàng">{{
              bankName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Số tài khoản">{{
              bankAccountNumber || "-"
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Section 3: Price Matrix & Volume Commitments -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-header font-bold">
              Chính sách Giá sỉ & Cam kết Sản lượng
            </div>
          </template>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-sm text-gray-500"
                >Sản lượng tối thiểu/tháng:</span
              >
              <div class="font-medium">
                {{
                  minimumMonthlyVolume
                    ? minimumMonthlyVolume + " sản phẩm"
                    : "-"
                }}
              </div>
            </div>
            <div>
              <span class="text-sm text-gray-500">Tỷ lệ chiết khấu:</span>
              <div class="font-medium text-success">
                {{ commissionRate ? commissionRate + "%" : "-" }}
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center mb-3">
            <span class="font-bold text-sm">Bảng giá nhập sỉ (SKU)</span>
            <ElInput
              v-model="skuSearch"
              placeholder="Tìm kiếm theo SKU..."
              size="small"
              style="width: 260px"
              clearable
            >
              <template #prefix
                ><ElIcon><Search /></ElIcon
              ></template>
            </ElInput>
          </div>
          <ElTable
            :data="filteredSkuList"
            border
            stripe
            size="small"
            max-height="400"
          >
            <ElTableColumn prop="skuCode" label="Mã SKU" width="140" />
            <ElTableColumn
              prop="productName"
              label="Tên sản phẩm"
              min-width="180"
            />
            <ElTableColumn prop="category" label="Danh mục" width="150" />
            <ElTableColumn
              prop="wholesalePrice"
              label="Giá nhập sỉ"
              width="140"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row.wholesalePrice) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="moq" label="MOQ" width="80" align="center" />
          </ElTable>
          <div
            v-if="skuList.length === 0"
            class="text-center text-gray-400 text-sm py-4"
          >
            Chưa có dữ liệu bảng giá sỉ. Hợp đồng ở trạng thái Draft chưa có
            hiệu lực.
          </div>
        </el-card>

        <!-- Section 4: Contract Validity -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-header font-bold">Thời hạn Hiệu lực Pháp lý</div>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="Ngày bắt đầu">{{
              formatDate(contract.effectiveDate)
            }}</el-descriptions-item>
            <el-descriptions-item label="Ngày hết hạn">
              {{
                contract.expirationDate
                  ? formatDate(contract.expirationDate)
                  : "Không xác định"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Ngày tạo">
              {{ formatDateTime(contract.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="Cập nhật lần cuối">
              {{ formatDateTime(contract.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Section 5: Digital Archiving -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-header font-bold">Chứng từ Gốc đính kèm</div>
          </template>
          <div v-if="contract.contractFilePath">
            <div class="mb-3">
              <ElTag type="success" size="small">Đã tải lên</ElTag>
              <span class="text-sm text-gray-500 ml-2">{{
                contractFileInfo.name
              }}</span>
            </div>
            <div class="flex gap-2">
              <ElButton type="primary" size="small" @click="handleViewFile">
                <ElIcon><Document /></ElIcon> Xem file
              </ElButton>
              <ElButton size="small" @click="handleDownloadFile">
                <ElIcon><Download /></ElIcon> Tải xuống
              </ElButton>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <ElIcon class="text-gray-300 text-4xl mb-2"><Document /></ElIcon>
            <p class="text-gray-400 text-sm">
              Chưa tải lên file scan/PDF hợp đồng
            </p>
            <ElUpload
              :http-request="customUploadRequest"
              :show-file-list="false"
              accept=".pdf,.jpg,.png"
              class="mt-3"
            >
              <ElButton type="primary" size="small">Tải lên chứng từ</ElButton>
            </ElUpload>
          </div>
        </el-card>
      </el-col>

      <!-- Right Column: 30% - Legal & Alert Tools -->
      <el-col :span="7">
        <!-- Document Viewer -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-header font-bold">Hợp đồng gốc</div>
          </template>
          <div v-if="contract.contractFilePath" class="text-center">
            <div class="bg-gray-50 rounded-lg p-6 mb-3">
              <ElIcon class="text-4xl text-primary"><Document /></ElIcon>
              <p class="text-sm mt-2">
                {{ contractFileInfo.name || "Hợp đồng NCC" }}
              </p>
            </div>
            <ElButton
              type="primary"
              size="small"
              @click="handleViewFile"
              class="w-full"
            >
              Mở trình xem PDF
            </ElButton>
          </div>
          <div v-else class="text-center py-8 text-gray-400 text-sm">
            Chưa có file hợp đồng
          </div>
        </el-card>

        <!-- Quick Actions -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-header font-bold">Công cụ & Trạng thái</div>
          </template>
          <div class="space-y-3">
            <div class="text-sm">
              <span class="text-gray-500">Trạng thái pháp lý:</span>
              <el-tag :type="contractStatusType" size="small" class="ml-2">
                {{ getStatusLabel(contract.status) }}
              </el-tag>
            </div>
            <el-divider style="margin: 12px 0" />
            <div class="space-y-2">
              <ElButton
                v-if="canEditStatus"
                type="primary"
                size="small"
                class="w-full"
                @click="showStatusDialog = true"
              >
                Cập nhật trạng thái
              </ElButton>
              <ElButton
                v-if="contract.status === 'Active'"
                type="warning"
                size="small"
                class="w-full"
                @click="handleCreateAddendum"
              >
                Tạo phụ lục gia hạn
              </ElButton>
              <ElButton
                type="danger"
                size="small"
                class="w-full"
                :disabled="!canSoftDelete"
                @click="handleSoftDelete"
              >
                Xóa mềm (Soft Delete)
              </ElButton>
            </div>
          </div>
        </el-card>

        <!-- Audit Log -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header font-bold">Nhật ký</div>
          </template>
          <div
            v-if="auditLogs.length > 0"
            class="space-y-2 max-h-300 overflow-y-auto"
          >
            <div
              v-for="log in auditLogs"
              :key="log.id"
              class="text-sm border-b border-gray-100 pb-2"
            >
              <div class="flex justify-between items-start">
                <span class="font-medium">{{ log.action }}</span>
                <span class="text-xs text-gray-400">{{
                  formatDateTime(log.createdAt)
                }}</span>
              </div>
              <p v-if="log.details" class="text-gray-500 text-xs mt-1">
                {{ log.details }}
              </p>
              <p class="text-xs text-gray-400 mt-1">{{ log.changedBy }}</p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400 text-center py-4">
            Chưa có nhật ký
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Status Update Dialog -->
    <ElDialog
      v-model="showStatusDialog"
      title="Cập nhật trạng thái hợp đồng"
      width="400px"
      class="supplier-contract-preview-dialog"
    >
      <ElForm label-position="top">
        <ElFormItem label="Trạng thái mới">
          <ElSelect v-model="newStatus" class="w-full" :disabled="isLocked">
            <ElOption label="Nháp" value="Draft" />
            <ElOption label="Chờ phê duyệt" value="PendingApproval" />
            <ElOption label="Đang hiệu lực" value="Active" />
            <ElOption label="Đã hết hạn" value="Expired" />
            <ElOption label="Đã thanh lý" value="Terminated" />
            <ElOption label="Đã hoàn thành" value="Completed" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showStatusDialog = false">Hủy</ElButton>
        <ElButton
          type="primary"
          :loading="updatingStatus"
          @click="handleUpdateStatus"
          >Cập nhật</ElButton
        >
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Document, Download, Plus, Search } from "@element-plus/icons-vue";
import type {
  SupplierContractAuditLogDto,
  SupplierContractDto,
  SupplierContractStatus,
} from "@/domain/supplier/contract.types";
import { createSupplierContractUseCases } from "@/infrastructure/supplier/usecasesFactory";

defineOptions({ name: "ContractSupplierPreview" });

const usecases = createSupplierContractUseCases();

const route = useRoute();
const router = useRouter();

const contract = ref<SupplierContractDto>({
  id: "",
  contractNumber: "",
  effectiveDate: "",
  contractValue: 0,
  status: "Draft",
});
const showStatusDialog = ref(false);
const newStatus = ref<SupplierContractStatus | "">("");
const updatingStatus = ref(false);
const skuSearch = ref("");
const auditLogs = ref<SupplierContractAuditLogDto[]>([]);

const contractStatusType = computed(() => {
  const st = contract.value.status;
  if (st === "Active") return "success";
  if (st === "PendingApproval") return "warning";
  if (st === "Expired" || st === "Terminated") return "danger";
  if (st === "Completed") return "success";
  return "info";
});

const daysUntilExpiry = computed(() => {
  if (!contract.value.expirationDate) return 0;
  const now = new Date();
  const expiry = new Date(contract.value.expirationDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const expiryProgressPercent = computed(() => {
  if (!contract.value.expirationDate || !contract.value.effectiveDate) return 0;
  const now = new Date();
  const start = new Date(contract.value.effectiveDate);
  const end = new Date(contract.value.expirationDate);
  const total = end.getTime() - start.getTime();
  const remaining = end.getTime() - now.getTime();
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
});

const expiryProgressStatus = computed(() => {
  const days = daysUntilExpiry.value;
  if (days <= 0) return "exception";
  if (days <= 30) return "warning";
  return "success";
});

const expirationWarningType = computed(() => {
  const days = daysUntilExpiry.value;
  if (days <= 0) return "danger";
  if (days <= 30) return "warning";
  return "";
});

const expirationWarningLabel = computed(() => {
  const days = daysUntilExpiry.value;
  if (days <= 0) return "Đã quá hạn";
  if (days <= 30) return `Sắp hết hạn (còn ${days} ngày)`;
  return "Đang hiệu lực";
});

const showExpirationAlert = computed(() => {
  return (
    expirationWarningType.value === "warning" ||
    expirationWarningType.value === "danger"
  );
});

const isLocked = computed(() => contract.value.status === "Active");

const canEditStatus = computed(() => {
  return !isLocked.value && contract.value.status !== "Completed";
});

const canSoftDelete = computed(() => {
  return contract.value.status !== "Active";
});

const supplierName = computed(() => contract.value.supplierName || "-");
const supplierCode = computed(() => contract.value.supplierCode || "-");
const supplierAddress = computed(() => contract.value.supplierAddress || "-");

const supplierContactInfo = computed(() => ({
  name: contract.value.supplierContactName || contract.value.supplierName || "",
  phone: contract.value.supplierPhone || "",
  email: contract.value.supplierEmail || "",
}));

const creditLimit = computed(() => contract.value.creditLimit || 0);
const paymentWindowDays = computed(() => contract.value.paymentWindowDays || 0);
const bankName = computed(() => contract.value.bankName || "");
const bankAccountNumber = computed(
  () => contract.value.bankAccountNumber || "",
);
const minimumMonthlyVolume = computed(
  () => contract.value.minimumVolumePerMonth || 0,
);
const commissionRate = computed(() => contract.value.discountRate || 0);

const skuList = ref<any[]>(contract.value.skuPriceList || []);
const filteredSkuList = computed(() => {
  if (!skuSearch.value) return skuList.value;
  const q = skuSearch.value.toLowerCase();
  return skuList.value.filter(
    (item: any) =>
      (item.skuCode || "").toLowerCase().includes(q) ||
      (item.productName || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q),
  );
});

const contractFileInfo = computed(() => {
  const path = contract.value.contractFilePath;
  if (!path) return { name: "", url: "" };
  const name =
    path.split("/").pop() || path.split("\\").pop() || "contract-file";
  return { name, url: path };
});

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    Draft: "Nháp",
    PendingApproval: "Chờ phê duyệt",
    Active: "Đang hiệu lực",
    Expired: "Đã hết hạn",
    Terminated: "Đã thanh lý",
    Completed: "Đã hoàn thành",
  };
  return map[status] || status;
};

const formatCurrency = (value: number) => {
  if (!value && value !== 0) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("vi-VN");
  } catch {
    return dateString;
  }
};

const handlePrint = () => {
  window.print();
};
const goBack = () => router.push({ name: "SupplierContract" });

const handleViewFile = () => {
  const url = contractFileInfo.value.url;
  if (url) window.open(url, "_blank");
};

const handleDownloadFile = () => {
  const url = contractFileInfo.value.url;
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = contractFileInfo.value.name;
  a.click();
};

const handleUpdateStatus = async () => {
  if (!newStatus.value || !contract.value.id) return;
  updatingStatus.value = true;
  try {
    await usecases.updateStatus.execute(contract.value.id, newStatus.value);
    ElMessage.success("Cập nhật trạng thái thành công.");
    contract.value.status = newStatus.value;
    showStatusDialog.value = false;
    newStatus.value = "";
  } catch {
    ElMessage.error("Không thể cập nhật trạng thái.");
  } finally {
    updatingStatus.value = false;
  }
};

const handleSoftDelete = async () => {
  if (!contract.value.id) return;
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa mềm hợp đồng "${contract.value.contractNumber}"? Bản ghi sẽ được lưu trữ với DeletedAt.`,
      "Xác nhận xóa mềm",
      {
        confirmButtonText: "Xóa mềm",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
    await usecases.delete.execute(contract.value.id);
    ElMessage.success("Đã xóa mềm hợp đồng.");
    router.push({ name: "SupplierContract" });
  } catch {
    // cancelled
  }
};

const handleCreateAddendum = () => {
  ElMessage.info("Tính năng tạo phụ lục đang được phát triển.");
};

const customUploadRequest = async (options: any) => {
  try {
    const url = URL.createObjectURL(options.file);
    await usecases.update.execute(contract.value.id, { contractFilePath: url });
    contract.value.contractFilePath = url;
    ElMessage.success("Tải lên chứng từ thành công.");
    options.onSuccess?.({});
  } catch {
    ElMessage.error("Tải lên thất bại.");
    options.onError?.({});
  }
};

const fetchDetail = async () => {
  const id = route.params.id as string;
  if (!id) return;
  try {
    const res = await usecases.getContractDetail.execute(id);
    contract.value = res;
    skuList.value = res.skuPriceList || [];
    auditLogs.value = res.auditLogs || [];
  } catch {
    ElMessage.error("Không thể tải chi tiết hợp đồng.");
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.supplier-contract-detail {
  padding: 16px;
  color: #f8fafc;

  :deep(.el-card) {
    background-color: #151619;
    border-color: #2c2f36;
    box-shadow: none;
  }

  :deep(.el-card__header),
  :deep(.el-card__body),
  :deep(.el-form-item__label),
  :deep(.el-descriptions__label),
  :deep(.el-descriptions__content),
  :deep(.el-table),
  :deep(.el-table__cell),
  :deep(.el-table .cell),
  :deep(.el-input__inner),
  :deep(.el-select__selected-item),
  :deep(.el-progress__text),
  :deep(.el-upload__text),
  :deep(.el-upload__tip) {
    color: #f8fafc !important;
  }

  :deep(.el-descriptions__cell),
  :deep(.el-descriptions__label),
  :deep(.el-descriptions__content),
  :deep(.el-table th.el-table__cell),
  :deep(.el-table tr),
  :deep(.el-table td.el-table__cell) {
    background-color: #151619 !important;
    border-color: #2c2f36 !important;
  }

  :deep(.el-table) {
    --el-table-border-color: #2c2f36;
    --el-table-header-bg-color: #111214;
    --el-table-row-hover-bg-color: #202227;
    --el-table-tr-bg-color: #151619;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-upload-dragger) {
    background-color: #101114;
    border-color: #333741;
    box-shadow: 0 0 0 1px #333741 inset;
  }

  :deep(.el-input__inner::placeholder) {
    color: #cbd5e1;
  }

  :deep(.text-gray-300),
  :deep(.text-gray-400),
  :deep(.text-gray-500),
  :deep(.text-gray-600),
  :deep(.text-gray-700),
  :deep(.text-gray-800),
  :deep(.text-gray-900) {
    color: #f8fafc !important;
  }

  :deep(.bg-gray-50),
  :deep(.bg-gray-100),
  :deep(.bg-gray-200),
  :deep(.bg-white) {
    background-color: #151619 !important;
  }

  :deep(.border-gray-100),
  :deep(.border-gray-200),
  :deep(.border-b) {
    border-color: #2c2f36 !important;
  }

  :deep(.el-alert) {
    background-color: rgb(245 158 11 / 12%);
    border: 1px solid rgb(245 158 11 / 35%);
  }

  :deep(.el-alert__title),
  :deep(.el-alert__description),
  :deep(.el-alert__content),
  :deep(.el-alert p) {
    color: #f8fafc !important;
  }
}

.card-header {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.max-h-300 {
  max-height: 300px;
}
</style>

<style lang="scss">
.supplier-contract-preview-dialog {
  background: #151619;
  border: 1px solid #2c2f36;

  .el-dialog__title,
  .el-dialog__body,
  .el-form-item__label,
  .el-select__selected-item,
  .el-input__inner {
    color: #f8fafc !important;
  }

  .el-input__wrapper,
  .el-select__wrapper {
    background-color: #101114;
    border-color: #333741;
    box-shadow: 0 0 0 1px #333741 inset;
  }
}
</style>
