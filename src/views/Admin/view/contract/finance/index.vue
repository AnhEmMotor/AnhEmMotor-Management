<template>
  <div class="finance-contract-page art-full-height flex flex-col gap-4 pb-5">
    <!-- 1. Hàng thẻ chỉ số vĩ mô (Finance Overview Cards) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        title="Hồ sơ chờ phê duyệt"
        :count="statistics.pendingCount"
        description="Đang gửi thẩm định"
        icon="ri:file-list-3-line"
        iconStyle="bg-primary"
        box-style="finance-stat-card"
        text-color="#f8fafc"
      />
      <ArtStatsCard
        title="Chờ ngân hàng giải ngân"
        :count="statistics.pendingDisbursementCount"
        description="Đã duyệt, đợi tiền về"
        icon="ri:bank-card-line"
        iconStyle="bg-warning"
        box-style="finance-stat-card"
        text-color="#f8fafc"
      />
      <ArtStatsCard
        title="Cảnh báo chậm giải ngân"
        :count="statistics.lateDisbursementCount"
        description="Quá 1-3 ngày làm việc"
        icon="ri:alarm-warning-line"
        iconStyle="bg-danger"
        box-style="finance-stat-card"
        text-color="#f8fafc"
      />
      <ArtStatsCard
        title="Cavet đang giữ hộ"
        :count="statistics.cavetHeldCount"
        description="Đang quản lý vật lý"
        icon="ri:car-line"
        iconStyle="bg-info"
        box-style="finance-stat-card"
        text-color="#f8fafc"
      />
    </div>

    <!-- 2. Thanh bộ lọc ngang (Horizontal Power Filters) -->
    <ArtSearchBar
      :items="searchItems"
      :label-width="120"
      :span="6"
      @search="handleSearch"
      @reset="resetSearch"
    />

    <!-- 3. Cấu trúc bảng dữ liệu quản trị (Operational Data Table) -->
    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton type="success" v-ripple @click="goToPreview(null)">
            <ElIcon><PlusIcon /></ElIcon> Tạo hồ sơ mới
          </ElButton>
          <ElButton v-ripple @click="exportToExcel">
            <ElIcon><DownloadIcon /></ElIcon> Xuất Excel
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #loanInfo="{ row }">
          <div class="flex flex-col">
            <span class="finance-strong-text">{{ row.loanAmount }}</span>
            <span class="finance-strong-text finance-term-text"
              >({{ row.term }})</span
            >
          </div>
        </template>

        <template #expectedDate="{ row }">
          <div :class="{ 'text-red-500 font-bold': row.lateDisbursement }">
            {{ row.expectedDate }}
            <div v-if="row.lateDisbursement" class="text-[11px] mt-1">
              (Trễ {{ row.lateDays }} ngày)
            </div>
          </div>
        </template>

        <template #cavetLocation="{ row }">
          <div class="flex flex-col items-start gap-1">
            <ElTag
              :type="getCavetTagType(row.cavetLocation)"
              size="small"
              effect="light"
              round
            >
              {{ row.cavetLocation }}
            </ElTag>
            <ElBadge
              v-if="row.cavetActionRequired"
              is-dot
              class="item"
              type="danger"
            >
              <span class="text-[11px] text-red-500 font-bold blink-text"
                >Cần thu hồi/trả</span
              >
            </ElBadge>
          </div>
        </template>

        <template #status="{ row }">
          <ElTag :type="getStatusTagType(row.status)" effect="light" round>
            {{ row.statusLabel }}
          </ElTag>
        </template>

        <!-- 4. Các "Quy trình thép" tích hợp thẳng vào UI Thao tác -->
        <template #operation="{ row }">
          <div class="finance-operation-cell">
            <div class="finance-operation-main">
              <ElButton
                v-if="row.status === 'Pending' && !row.lateDisbursement"
                size="small"
                type="primary"
                class="finance-operation-action"
                @click="openDisbursementModal(row)"
              >
                Cập nhật giải ngân
              </ElButton>

              <ElButton
                v-else-if="row.lateDisbursement"
                size="small"
                type="danger"
                class="finance-operation-action"
                @click="handleContact"
              >
                <ElIcon class="mr-1"><WarningIcon /></ElIcon> Tra cứu đầu mối
              </ElButton>

              <span
                v-else
                class="finance-operation-placeholder"
                aria-hidden="true"
              ></span>
            </div>

            <div class="finance-operation-icons">
              <ArtButtonTable type="view" @click="goToPreview(row.id)" />
              <ArtButtonTable type="edit" @click="goToPreview(row.id)" />
            </div>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Modal Cập nhật chứng từ thực tế (Mục 15.2) -->
    <ElDialog
      v-model="disbursementModalVisible"
      title="Xác nhận đã giải ngân"
      width="500px"
      class="finance-contract-dialog"
      align-center
      destroy-on-close
      @closed="resetDisbursementUpload"
    >
      <div v-if="selectedRow" class="finance-dialog-summary">
        <p class="mb-1">
          <strong>Số HĐ:</strong> {{ selectedRow.contractNumber }}
        </p>
        <p class="mb-1">
          <strong>Khách hàng:</strong> {{ selectedRow.customer }}
        </p>
        <p>
          <strong>Số tiền dự kiến:</strong>
          <span class="font-bold text-green-600">{{
            selectedRow.loanAmount
          }}</span>
        </p>
      </div>

      <ElForm :model="disbursementForm" label-position="top">
        <ElFormItem label="Ngày giải ngân thực tế" required>
          <ElDatePicker
            v-model="disbursementForm.actualDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Chọn ngày"
            popper-class="finance-date-popper"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="Chứng từ đối soát chuyển khoản" required>
          <ElUpload
            ref="financeProofUploadRef"
            class="upload-demo finance-proof-upload w-full"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*,.pdf"
            :on-change="handleDisbursementProofChange"
          >
            <div
              v-if="disbursementProofPreviewUrl"
              class="finance-upload-preview"
            >
              <img
                :src="disbursementProofPreviewUrl"
                :alt="disbursementProofName"
              />
              <span>Bấm để đổi ảnh chứng từ</span>
            </div>
            <template v-else>
              <ElIcon class="el-icon--upload"><UploadFilledIcon /></ElIcon>
              <div class="el-upload__text">
                Kéo thả file hoặc <em>bấm vào đây</em> để tải lên minh chứng
              </div>
            </template>
          </ElUpload>
          <div v-if="disbursementProofName" class="finance-upload-filebar">
            <span>{{ disbursementProofName }}</span>
            <ElButton
              link
              type="danger"
              :disabled="disbursementSubmitting"
              @click="clearDisbursementProof"
            >
              Xóa
            </ElButton>
          </div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton
            :disabled="disbursementSubmitting"
            @click="disbursementModalVisible = false"
            >Hủy</ElButton
          >
          <ElButton
            type="success"
            :loading="disbursementSubmitting"
            @click="submitDisbursement"
          >
            Xác nhận giải ngân
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Plus as PlusIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  UploadFilled as UploadFilledIcon,
} from "@element-plus/icons-vue";
import type { ColumnOption } from "@/types/component";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  FinanceContractApi,
  type FinanceContractListParams,
} from "@/infrastructure/api/finance-contract.api";

const router = useRouter();
const loading = ref(false);

const searchItems = computed(() => [
  {
    key: "keyword",
    label: "Từ khóa",
    type: "input",
    props: { placeholder: "Số HĐ, Tên KH..." },
  },
  {
    key: "partner",
    label: "Đối tác",
    type: "select",
    options: [
      { label: "FE Credit", value: "FE Credit" },
      { label: "Home Credit", value: "Home Credit" },
      { label: "HD Saison", value: "HD Saison" },
      { label: "MB Bank", value: "MB Bank" },
      { label: "TPBank", value: "TPBank" },
      { label: "Mirae Asset", value: "Mirae Asset" },
    ],
  },
  {
    key: "disbursementStatus",
    label: "Trạng thái",
    type: "select",
    options: [
      { label: "Chờ giải ngân", value: "Pending" },
      { label: "Đã giải ngân", value: "Disbursed" },
    ],
  },
  {
    key: "cavetLocation",
    label: "Vị trí Cavet",
    type: "select",
    options: [
      { label: "Công ty TC giữ", value: "FinancialCompanyHolds" },
      { label: "Cửa hàng giữ hộ", value: "StoreHoldsOnBehalf" },
      { label: "Đã giao khách", value: "DeliveredToCustomer" },
    ],
  },
]);

const filterForm = reactive({
  keyword: "",
  partner: "",
  disbursementStatus: "",
  cavetLocation: "",
});

const tableData = ref<any[]>([]);
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

const statistics = reactive({
  pendingCount: 0,
  pendingDisbursementCount: 0,
  lateDisbursementCount: 0,
  cavetHeldCount: 0,
});

const buildParams = (): FinanceContractListParams => ({
  current: pagination.current,
  size: pagination.size,
  keyword: filterForm.keyword || undefined,
  disbursementStatus: filterForm.disbursementStatus || undefined,
  partner: filterForm.partner || undefined,
  cavetLocation: filterForm.cavetLocation || undefined,
});

const fetchFinanceContracts = async () => {
  loading.value = true;
  try {
    const res = await FinanceContractApi.getFinanceContractList(buildParams());
    const items = (res as any).items ?? [];
    const now = Date.now();
    tableData.value = items.map((c: any) => {
      const expected = c.disbursement?.expectedDate
        ? new Date(c.disbursement.expectedDate).getTime()
        : null;
      const late = expected != null && now > expected;
      const lateDays = late ? Math.floor((now - expected) / 86400000) : 0;
      return {
        id: c.id,
        contractNumber: c.contractNumber,
        orderId: c.salesOrderId,
        customer: c.customer360?.fullName ?? "-",
        partner: c.financialPartner?.name ?? "-",
        loanAmount:
          c.creditPackage?.principalAmount != null
            ? `${Number(c.creditPackage.principalAmount).toLocaleString("vi-VN")}đ`
            : "-",
        loanAmountValue: Number(c.creditPackage?.principalAmount ?? 0),
        term:
          c.creditPackage?.termMonths != null
            ? `${c.creditPackage.termMonths} tháng`
            : "-",
        expectedDate: c.disbursement?.expectedDate
          ? new Date(c.disbursement.expectedDate).toLocaleDateString("vi-VN")
          : "-",
        lateDisbursement: late,
        lateDays,
        cavetLocation: cavetLocationLabel(c.cavet?.state),
        cavetActionRequired: false,
        status: c.status,
        statusLabel: statusLabel(c.status),
      };
    });
    pagination.total = (res as any).totalCount ?? items.length;

    computeStatistics(items);
  } catch (_e) {
    ElMessage.error("Không tải được danh sách hợp đồng tài chính.");
  } finally {
    loading.value = false;
  }
};

const cavetLocationLabel = (state?: string) => {
  switch (state) {
    case "FinancialCompanyHolds":
      return "Công ty TC giữ";
    case "StoreHoldsOnBehalf":
      return "Cửa hàng giữ hộ";
    case "DeliveredToCustomer":
      return "Đã giao khách";
    default:
      return state ?? "-";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "Pending":
      return "Chờ giải ngân";
    case "Disbursed":
      return "Đã giải ngân";
    default:
      return status;
  }
};

const computeStatistics = (items: any[]) => {
  const now = Date.now();
  statistics.pendingCount = items.filter((c) => c.status === "Pending").length;
  statistics.pendingDisbursementCount = items.filter(
    (c) => c.status === "Pending",
  ).length;
  statistics.lateDisbursementCount = items.filter((c) => {
    const expected = c.disbursement?.expectedDate
      ? new Date(c.disbursement.expectedDate).getTime()
      : null;
    return expected != null && now > expected && c.status !== "Disbursed";
  }).length;
  statistics.cavetHeldCount = items.filter(
    (c) =>
      c.cavet?.state === "FinancialCompanyHolds" ||
      c.cavet?.state === "StoreHoldsOnBehalf",
  ).length;
};

const handleSearch = (params: any) => {
  Object.assign(filterForm, params);
  pagination.current = 1;
  fetchFinanceContracts();
};

const resetSearch = () => {
  Object.keys(filterForm).forEach((key) => ((filterForm as any)[key] = ""));
  handleSearch({});
};

const refreshData = () => {
  handleSearch(filterForm);
};

const exportToExcel = () => {
  ElMessage.success("Bắt đầu xuất dữ liệu ra Excel...");
};

const columns = ref<ColumnOption[]>([
  { prop: "contractNumber", label: "Số HĐ Tài Chính", width: 140 },
  { prop: "orderId", label: "Mã Đơn Hàng", width: 150 },
  { prop: "customer", label: "Khách Hàng", minWidth: 160 },
  { prop: "partner", label: "Đối Tác", width: 120 },
  { prop: "loanInfo", label: "Giá Trị Vay", width: 150, useSlot: true },
  { prop: "expectedDate", label: "Dự kiến GN", width: 140, useSlot: true },
  { prop: "cavetLocation", label: "Vị Trí Cavet", width: 150, useSlot: true },
  { prop: "status", label: "Trạng Thái", width: 140, useSlot: true },
  {
    prop: "operation",
    label: "Thao Tác",
    width: 260,
    fixed: "right",
    useSlot: true,
    align: "center",
  },
]);

const columnChecks = ref<ColumnOption[]>(columns.value);

const handleSizeChange = (val: number) => {
  pagination.size = val;
  fetchFinanceContracts();
};

const handleCurrentChange = (val: number) => {
  pagination.current = val;
  fetchFinanceContracts();
};

const getCavetTagType = (location: string) => {
  if (location === "Công ty TC giữ") return "info";
  if (location === "Cửa hàng giữ hộ") return "warning";
  return "success";
};

const getStatusTagType = (status: string) => {
  if (status === "Pending") return "warning";
  if (status === "Disbursed") return "success";
  return "info";
};

const goToPreview = (id: string | null) => {
  router.push({
    name: "FinanceContractPreview",
    params: id ? { id } : ({} as any),
  });
};

// Modal Cập nhật giải ngân
const disbursementModalVisible = ref(false);
const disbursementSubmitting = ref(false);
const selectedRow = ref<any>(null);
const financeProofUploadRef = ref<any>(null);
const disbursementProofFile = ref<File | null>(null);
const disbursementProofName = ref("");
const disbursementProofPreviewUrl = ref("");
const disbursementForm = reactive({
  actualDate: "",
});

const openDisbursementModal = (row: any) => {
  selectedRow.value = row;
  disbursementForm.actualDate = "";
  resetDisbursementUpload();
  disbursementModalVisible.value = true;
};

const isImageFile = (file: File) => {
  if (file.type.startsWith("image/")) return true;
  return /\.(apng|avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(file.name);
};

const revokeDisbursementPreview = () => {
  if (disbursementProofPreviewUrl.value) {
    URL.revokeObjectURL(disbursementProofPreviewUrl.value);
    disbursementProofPreviewUrl.value = "";
  }
};

const clearDisbursementProof = () => {
  revokeDisbursementPreview();
  financeProofUploadRef.value?.clearFiles?.();
  disbursementProofFile.value = null;
  disbursementProofName.value = "";
};

const resetDisbursementUpload = () => {
  clearDisbursementProof();
};

const handleDisbursementProofChange = (uploadFile: any) => {
  const file = uploadFile?.raw as File | undefined;
  if (!file) return;

  revokeDisbursementPreview();
  disbursementProofFile.value = file;
  disbursementProofName.value = file.name;

  if (isImageFile(file)) {
    disbursementProofPreviewUrl.value = URL.createObjectURL(file);
  }
};

const submitDisbursement = async () => {
  if (!disbursementForm.actualDate) {
    ElMessage.warning("Vui lòng chọn ngày giải ngân thực tế");
    return;
  }

  if (!disbursementProofFile.value) {
    ElMessage.warning("Vui lòng tải lên chứng từ đối soát chuyển khoản");
    return;
  }

  if (!selectedRow.value?.id || !selectedRow.value.loanAmountValue) {
    ElMessage.error("Không tìm thấy thông tin hợp đồng cần cập nhật.");
    return;
  }

  disbursementSubmitting.value = true;
  try {
    await FinanceContractApi.uploadDisbursementEvidence({
      financeContractId: selectedRow.value.id,
      file: disbursementProofFile.value,
    });
    await FinanceContractApi.updateDisbursementPayment(
      selectedRow.value.id,
      selectedRow.value.loanAmountValue,
      disbursementForm.actualDate,
    );
    ElMessage.success("Đã cập nhật chứng từ giải ngân thành công");
    disbursementModalVisible.value = false;
    await fetchFinanceContracts();
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message ?? "Không cập nhật được giải ngân.",
    );
  } finally {
    disbursementSubmitting.value = false;
  }
};

const handleContact = () => {
  ElMessageBox.alert(
    `<strong>Nhân viên phụ trách:</strong> Nguyễn Văn Tín (Home Credit)<br/><strong>Số điện thoại:</strong> <a href="tel:0901234567" class="text-blue-500 font-bold">090 123 4567</a><br/><strong>Email:</strong> tin.nguyen@homecredit.vn`,
    "Tra cứu đầu mối liên hệ",
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: "Đóng",
    },
  );
};

onMounted(() => {
  fetchFinanceContracts();
});

onBeforeUnmount(() => {
  revokeDisbursementPreview();
});
</script>

<style scoped lang="scss">
html.dark .finance-contract-page {
  min-height: 100vh;
  color: #f8fafc;
  background: #050506;
}

html.dark .finance-contract-page :deep(.finance-stat-card) {
  color: #f8fafc;
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .finance-contract-page :deep(.finance-stat-card .text-g-900),
html.dark .finance-contract-page :deep(.finance-stat-card .text-g-800),
html.dark .finance-contract-page :deep(.finance-stat-card .text-g-700),
html.dark .finance-contract-page :deep(.finance-stat-card .text-g-600),
html.dark .finance-contract-page :deep(.finance-stat-card .text-g-500),
html.dark .finance-contract-page :deep(.finance-stat-card .text-2xl),
html.dark .finance-contract-page :deep(.finance-stat-card p) {
  color: #f8fafc !important;
  opacity: 1 !important;
}

html.dark .finance-contract-page :deep(.art-search-bar) {
  color: #f8fafc;
  background: #161618;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .finance-contract-page :deep(.art-search-bar .el-form-item__label),
html.dark .finance-contract-page :deep(.art-search-bar .el-input__inner),
html.dark .finance-contract-page :deep(.art-search-bar .el-select__placeholder),
html.dark
  .finance-contract-page
  :deep(.art-search-bar .el-select__selected-item),
html.dark .finance-contract-page :deep(.art-search-bar .el-button) {
  color: #f8fafc;
}

html.dark .finance-contract-page :deep(.art-search-bar .el-input__wrapper),
html.dark .finance-contract-page :deep(.art-search-bar .el-select__wrapper) {
  background: #101114;
  border: 1px solid rgb(255 255 255 / 14%);
  box-shadow: none;
}

html.dark .finance-contract-page :deep(.art-table-card) {
  color: #f8fafc;
  background: #161618;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .finance-contract-page :deep(.art-table .el-table) {
  --el-table-text-color: #f8fafc;
  --el-table-header-text-color: #f8fafc;
  --el-text-color-regular: #f8fafc;
  --el-text-color-secondary: #f8fafc;

  color: #f8fafc;
  background: #161618;
}

html.dark .finance-contract-page :deep(.art-table .el-table .cell),
html.dark .finance-contract-page :deep(.art-table .el-table td.el-table__cell),
html.dark .finance-contract-page :deep(.art-table .el-table th.el-table__cell) {
  color: #f8fafc !important;
}

html.dark .finance-contract-page :deep(.art-table .el-table th.el-table__cell) {
  background: #111214;
}

html.dark .finance-contract-page :deep(.art-table .el-pagination),
html.dark .finance-contract-page :deep(.art-table .el-pagination *) {
  color: #f8fafc;
}

html.dark .finance-contract-page :deep(.el-tag) {
  font-weight: 700;
  color: #fff;
  border-color: transparent;
}

html.dark .finance-contract-page :deep(.el-tag--info.el-tag--light) {
  color: #f8fafc;
  background: rgb(148 163 184 / 18%);
  border-color: rgb(148 163 184 / 30%);
}

.finance-operation-cell {
  display: grid;
  grid-template-columns: 148px 76px;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 232px;
}

.finance-operation-main {
  display: flex;
  justify-content: center;
  min-width: 148px;
}

.finance-operation-action.el-button {
  width: 148px;
  height: 32px;
  padding: 0 10px;
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.finance-operation-placeholder {
  display: block;
  visibility: hidden;
  width: 148px;
  height: 32px;
}

.finance-operation-icons {
  display: grid;
  grid-template-columns: repeat(2, 32px);
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-width: 76px;
}

.finance-operation-icons :deep(.el-button) {
  width: 32px;
  height: 32px;
  margin: 0;
}

.finance-strong-text {
  font-weight: 800;
  color: #f8fafc;
}

.finance-term-text {
  margin-top: 2px;
  font-size: 12px;
}

.finance-dialog-summary {
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #f8fafc;
  background: #111214;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 10px;
}

.finance-dialog-summary strong {
  color: #f8fafc;
}

.blink-text {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>

<style lang="scss">
.finance-contract-dialog.el-dialog {
  --el-color-primary: #e84a4a;
  --el-bg-color: #161618;
  --el-bg-color-overlay: #1c1c20;
  --el-fill-color-blank: #161618;
  --el-border-color: rgb(255 255 255 / 9%);
  --el-text-color-primary: #f8fafc;
  --el-text-color-regular: #f8fafc;
  --el-text-color-secondary: #f8fafc;

  color: #f8fafc;
  background: #161618;
  border: 1px solid rgb(255 255 255 / 9%);
}

.finance-contract-dialog .el-dialog__title,
.finance-contract-dialog .el-form-item__label,
.finance-contract-dialog .el-upload__text,
.finance-contract-dialog .el-upload__tip {
  color: #f8fafc;
}

.finance-contract-dialog .el-input__wrapper,
.finance-contract-dialog .el-date-editor,
.finance-contract-dialog .el-upload-dragger {
  color: #f8fafc;
  background: #101114;
  border-color: rgb(255 255 255 / 14%);
  box-shadow: none;
}

.finance-contract-dialog .finance-proof-upload .el-upload,
.finance-contract-dialog .finance-proof-upload .el-upload-dragger {
  width: 100%;
}

.finance-contract-dialog .finance-upload-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 190px;
  color: #f8fafc;
}

.finance-contract-dialog .finance-upload-preview img {
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 10px;
}

.finance-contract-dialog .finance-upload-filebar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  margin-top: 8px;
  color: #f8fafc;
  background: #111214;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
}

.finance-date-popper.el-popper {
  --el-bg-color-overlay: #161618;
  --el-border-color-light: rgb(255 255 255 / 9%);
  --el-text-color-primary: #f8fafc;
  --el-text-color-regular: #f8fafc;
  --el-text-color-secondary: #f8fafc;

  background: #161618;
  border-color: rgb(255 255 255 / 9%);
}

.finance-date-popper .el-picker-panel,
.finance-date-popper .el-picker-panel__body,
.finance-date-popper .el-picker-panel__footer {
  color: #f8fafc;
  background: #161618;
  border-color: rgb(255 255 255 / 9%);
}

.finance-date-popper .el-date-table th,
.finance-date-popper .el-date-table td.available,
.finance-date-popper .el-date-picker__header-label,
.finance-date-popper .el-picker-panel__icon-btn {
  color: #f8fafc;
}
</style>
