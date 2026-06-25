<template>
  <div class="reporting-page contract-supplier-container">
    <ReportPageHeader
      title="Hợp đồng Nhà cung cấp"
      description="Theo dõi hiệu lực hợp đồng, hạn mức công nợ, chiết khấu và các hợp đồng cần phê duyệt trong một màn hình."
      icon="ri:truck-line"
    >
      <template #actions>
        <ElButton
          type="primary"
          v-ripple
          class="supplier-create-button"
          @click="handleAdd"
        >
          <ElIcon><Plus /></ElIcon>
          Tạo hợp đồng mới
        </ElButton>
      </template>
    </ReportPageHeader>

    <div class="supplier-kpi-grid reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng hợp đồng"
        :count="stats.totalContracts"
        icon="ri:file-list-3-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang hiệu lực"
        :count="stats.activeContracts"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Chờ phê duyệt"
        :count="stats.pendingApproval"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Sắp hết hạn"
        :count="stats.expiringContracts"
        icon="ri:alarm-warning-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Đã hết hạn"
        :count="stats.expiredContracts"
        icon="ri:error-warning-line"
        iconStyle="bg-danger"
      />
    </div>

    <ElCard
      class="reporting-card supplier-filter-card supplier-filter-card--compact"
    >
      <ArtSearchBar
        v-model="searchForm"
        :items="searchItems"
        :label-width="0"
        label-position="top"
        :gutter="14"
        :span="8"
        @search="handleSearch"
        @reset="handleReset"
      />
    </ElCard>

    <ElCard class="reporting-card supplier-table-card art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="loadData"
      >
        <template #left>
          <div class="supplier-table-heading">
            <span>Danh sách hợp đồng</span>
            <small>{{ pagination.total }} hợp đồng</small>
          </div>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #supplierName="{ row }">
          <span>{{ row.supplierName || "-" }}</span>
        </template>
        <template #contractValue="{ row }">
          <span class="font-medium">{{
            formatCurrency((row as SupplierContractDto).contractValue)
          }}</span>
        </template>
        <template #creditLimit="{ row }">
          <span class="font-medium text-primary">{{
            formatCurrency((row as any).creditLimit || 0)
          }}</span>
        </template>
        <template #discountRate="{ row }">
          <span>{{
            (row as SupplierContractDto).discountRate
              ? (row as SupplierContractDto).discountRate + "%"
              : "-"
          }}</span>
        </template>
        <template #status="{ row }">
          <ElTag :type="getStatusType(row.status)" size="small">{{
            getStatusLabel(row.status)
          }}</ElTag>
        </template>
        <template #effectiveDate="{ row }">
          {{ formatDate(row.effectiveDate) }}
        </template>
        <template #expirationDate="{ row }">
          {{ row.expirationDate ? formatDate(row.expirationDate) : "-" }}
        </template>
        <template #operation="{ row }">
          <div class="supplier-operation-cell">
            <ArtButtonTable type="view" @click="handleView(row)" />
            <ElButton
              v-ripple
              size="small"
              type="primary"
              class="supplier-operation-button"
              @click="handleEdit(row)"
              :disabled="row.status === 'Active'"
              >Sửa</ElButton
            >
            <ElButton
              v-ripple
              size="small"
              type="danger"
              class="supplier-operation-button"
              @click="handleDelete(row)"
              :disabled="row.status === 'Active'"
              >Xóa</ElButton
            >
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Create/Edit Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      class="reporting-dialog contract-supplier-dialog"
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="formData"
        label-width="160px"
        class="mt-4"
        :rules="formRules"
        ref="formRef"
        :disabled="isFormLocked"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <ElFormItem label="Nhà cung cấp" prop="supplierId">
              <ElSelect
                v-model="formData.supplierId"
                filterable
                remote
                reserve-keyword
                placeholder="Chọn nhà cung cấp..."
                :remote-method="searchSuppliers"
                :loading="supplierLoading"
                class="w-full"
                clearable
              >
                <ElOption
                  v-for="item in supplierOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="Số hợp đồng" prop="contractNumber">
              <ElInput
                v-model="formData.contractNumber"
                placeholder="VD: HD-2024-001"
              />
            </ElFormItem>
            <div class="grid grid-cols-2 gap-4">
              <ElFormItem label="Ngày hiệu lực" prop="effectiveDate">
                <ElDatePicker
                  v-model="formData.effectiveDate"
                  type="date"
                  placeholder="Chọn ngày"
                  class="w-full"
                  value-format="YYYY-MM-DD"
                />
              </ElFormItem>
              <ElFormItem label="Ngày hết hạn">
                <ElDatePicker
                  v-model="formData.expirationDate"
                  type="date"
                  placeholder="Chọn ngày (tùy chọn)"
                  class="w-full"
                  value-format="YYYY-MM-DD"
                />
              </ElFormItem>
            </div>
            <ElFormItem label="Giá trị hợp đồng" prop="contractValue">
              <ElInputNumber
                v-model="formData.contractValue"
                :min="0"
                :step="1000000"
                :precision="0"
                class="w-full"
              />
            </ElFormItem>
            <ElFormItem label="Trạng thái" prop="status">
              <ElSelect v-model="formData.status" class="w-full">
                <ElOption label="Nháp" value="Draft" />
                <ElOption label="Chờ phê duyệt" value="PendingApproval" />
                <ElOption label="Đang hiệu lực" value="Active" />
                <ElOption label="Đã hết hạn" value="Expired" />
                <ElOption label="Đã thanh lý" value="Terminated" />
                <ElOption label="Đã hoàn thành" value="Completed" />
              </ElSelect>
            </ElFormItem>
          </el-col>

          <el-col :span="12">
            <div class="border-l pl-4">
              <div class="font-bold text-sm mb-3 text-gray-600">
                Hạn mức Tín dụng & Thanh toán
              </div>
              <ElFormItem label="Hạn mức công nợ tối đa">
                <ElInputNumber
                  v-model="formData.creditLimit"
                  :min="0"
                  :step="100000000"
                  :precision="0"
                  class="w-full"
                  placeholder="VD: 2000000000"
                />
              </ElFormItem>
              <ElFormItem label="Thời hạn thanh toán (ngày)">
                <ElInputNumber
                  v-model="formData.paymentWindowDays"
                  :min="0"
                  :step="1"
                  class="w-full"
                  placeholder="VD: 30"
                />
              </ElFormItem>
              <ElFormItem label="Ngân hàng">
                <ElInput
                  v-model="formData.bankName"
                  placeholder="Tên ngân hàng"
                />
              </ElFormItem>
              <ElFormItem label="Số tài khoản">
                <ElInput
                  v-model="formData.bankAccountNumber"
                  placeholder="Số tài khoản"
                />
              </ElFormItem>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="font-bold text-sm mb-3 text-gray-600">
          Chính sách Giá sỉ & Cam kết Sản lượng
        </div>
        <el-row :gutter="20" class="mb-4">
          <el-col :span="12">
            <ElFormItem label="Sản lượng tối thiểu/tháng">
              <ElInputNumber
                v-model="formData.minimumVolumePerMonth"
                :min="0"
                :step="1"
                class="w-full"
                placeholder="Số lượng sản phẩm/tháng"
              />
            </ElFormItem>
          </el-col>
          <el-col :span="12">
            <ElFormItem label="Tỷ lệ chiết khấu (%)">
              <ElInputNumber
                v-model="formData.discountRate"
                :min="0"
                :max="100"
                :step="0.1"
                :precision="2"
                class="w-full"
                placeholder="VD: 5.5"
              />
            </ElFormItem>
          </el-col>
        </el-row>

        <!-- SKU Price List Table -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-sm">Bảng giá nhập sỉ (SKU)</span>
            <ElButton
              v-if="!isFormLocked"
              type="primary"
              size="small"
              @click="handleAddSkuItem"
            >
              <ElIcon><Plus /></ElIcon> Thêm SKU
            </ElButton>
          </div>
          <ElTable
            :data="formData.contractItems"
            border
            stripe
            size="small"
            max-height="300"
            empty-text="Chưa có SKU nào"
          >
            <ElTableColumn type="index" label="#" width="50" align="center" />
            <ElTableColumn
              prop="productVariantId"
              label="Mã SKU"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                <ElInput
                  v-model="row.skuCode"
                  placeholder="SKU"
                  size="small"
                  :disabled="isFormLocked"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Tên sản phẩm" min-width="180">
              <template #default="{ row }">
                <span>{{ row.productName || "-" }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Giá nhập sỉ" width="150" align="right">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.wholesalePrice"
                  :min="0"
                  :step="1000"
                  :precision="0"
                  size="small"
                  :disabled="isFormLocked"
                  class="w-full"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="MOQ" width="90" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.moq"
                  :min="1"
                  :step="1"
                  size="small"
                  :disabled="isFormLocked"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Danh mục" width="150">
              <template #default="{ row }">
                <span>{{ row.category || "-" }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              label="Thao tác"
              width="80"
              align="center"
              v-if="!isFormLocked"
            >
              <template #default="{ $index }">
                <ElButton
                  type="danger"
                  size="small"
                  text
                  @click="handleRemoveSkuItem($index)"
                >
                  Xóa
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div
            v-if="(formData.contractItems || []).length === 0"
            class="text-center text-gray-400 text-sm py-3"
          >
            Chưa có dữ liệu SKU. Nhấn "Thêm SKU" để thêm.
          </div>
        </div>

        <el-divider />

        <ElFormItem label="File hợp đồng">
          <ElUpload
            :http-request="customUploadRequest"
            :file-list="fileList"
            :show-file-list="false"
            drag
            class="w-full contract-file-upload"
            :disabled="isFormLocked"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <div v-if="contractFilePreviewUrl" class="contract-upload-preview">
              <img
                :src="contractFilePreviewUrl"
                alt="Xem trước file hợp đồng"
              />
              <span class="preview-hint">Bấm để đổi file hợp đồng</span>
            </div>
            <template v-else>
              <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
              <div class="el-upload__text">
                Kéo thả file hoặc <em>bấm vào đây</em> để tải lên
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                Hỗ trợ PDF, JPG, PNG (tối đa 10MB)
              </div>
            </template>
          </ElUpload>
          <div
            v-if="contractFilePreviewUrl && !isFormLocked"
            class="contract-upload-filebar"
          >
            <span class="truncate">{{ contractFileName }}</span>
            <ElButton link type="danger" @click.stop="clearContractFile"
              >Xóa</ElButton
            >
          </div>
          <div
            v-else-if="contractFileName && !contractFilePreviewUrl"
            class="contract-upload-filebar"
          >
            <span class="truncate">{{ contractFileName }}</span>
            <ElButton
              v-if="!isFormLocked"
              link
              type="danger"
              @click.stop="clearContractFile"
              >Xóa</ElButton
            >
          </div>
        </ElFormItem>
        <ElFormItem label="Điều khoản chính">
          <ElInput
            v-model="formData.terms"
            type="textarea"
            :rows="3"
            placeholder="Nội dung điều khoản chính..."
            :disabled="isFormLocked"
          />
        </ElFormItem>
        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="formData.note"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú thêm..."
            :disabled="isFormLocked"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton
            v-if="isFormLocked"
            type="warning"
            @click="handleCreateAddendum"
          >
            Tạo phụ lục (để chỉnh sửa)
          </ElButton>
          <ElButton
            v-else
            type="primary"
            :loading="submitting"
            @click="submitForm"
          >
            {{ formData.id ? "Cập nhật" : "Tạo mới" }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, UploadFilled } from "@element-plus/icons-vue";
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import type { ColumnOption } from "@/types/component";
import ReportPageHeader from "@/modules/Accountant/view/reporting/ReportPageHeader.vue";
import type {
  SupplierContractDto,
  SupplierContractSkuItem,
} from "@/domain/supplier/contract.types";

interface SupplierContractForm {
  id?: string;
  contractNumber: string;
  effectiveDate: string;
  expirationDate?: string;
  contractValue: number;
  status: string;
  terms?: string;
  note?: string;
  supplierId?: string | undefined;
  creditLimit: number | undefined;
  paymentWindowDays: number | undefined;
  bankName?: string;
  bankAccountNumber?: string;
  minimumVolumePerMonth: number | undefined;
  discountRate: number | undefined;
  contractItems: SupplierContractSkuItem[];
  contractFilePath?: string;
}

import { createSupplierContractUseCases } from "@/infrastructure/supplier/usecasesFactory";

defineOptions({ name: "SupplierContract" });

const usecases = createSupplierContractUseCases();

const router = useRouter();

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("Tạo hợp đồng mới");
const submitting = ref(false);
const formRef = ref<FormInstance>();
const tableRef = ref();
const supplierLoading = ref(false);
const supplierOptions = ref<{ id: string; name: string }[]>([]);

const stats = reactive({
  totalContracts: 0,
  activeContracts: 0,
  pendingApproval: 0,
  expiredContracts: 0,
  expiringContracts: 0,
});

const pagination = reactive({ current: 1, size: 10, total: 0 });
const data = ref<SupplierContractDto[]>([]);
const fileList = ref<any[]>([]);
const contractFilePreviewUrl = ref("");
const contractFileName = ref("");

const formData = ref<SupplierContractForm>({
  contractNumber: "",
  effectiveDate: "",
  expirationDate: "",
  contractValue: 0,
  status: "Draft",
  terms: "",
  note: "",
  supplierId: undefined,
  creditLimit: undefined,
  paymentWindowDays: undefined,
  bankName: "",
  bankAccountNumber: "",
  minimumVolumePerMonth: undefined,
  discountRate: undefined,
  contractItems: [],
});

const searchForm = ref({
  name: "",
  contractNumber: "",
  status: [] as string[],
  effectiveDateRange: [] as string[],
  expirationDateRange: [] as string[],
});

const searchItems = ref([
  {
    key: "name",
    label: "Tên nhà cung cấp",
    type: "input",
    props: {
      placeholder: "Nhập tên nhà cung cấp",
      clearable: true,
    },
  },
  {
    key: "contractNumber",
    label: "Số hợp đồng",
    type: "input",
    props: {
      placeholder: "Nhập số hợp đồng",
      clearable: true,
    },
  },
  {
    key: "status",
    label: "Trạng thái",
    type: "select",
    props: {
      options: [
        { label: "Nháp", value: "Draft" },
        { label: "Chờ phê duyệt", value: "PendingApproval" },
        { label: "Đang hiệu lực", value: "Active" },
        { label: "Đã hết hạn", value: "Expired" },
        { label: "Đã thanh lý", value: "Terminated" },
        { label: "Đã hoàn thành", value: "Completed" },
      ],
      multiple: true,
      collapseTags: true,
      placeholder: "Chọn trạng thái...",
    },
  },
  {
    key: "effectiveDateRange",
    label: "Ngày hiệu lực",
    type: "daterange",
    props: {
      startPlaceholder: "Từ ngày",
      endPlaceholder: "Đến ngày",
      valueFormat: "YYYY-MM-DD",
      clearable: true,
    },
  },
  {
    key: "expirationDateRange",
    label: "Ngày hết hạn",
    type: "daterange",
    props: {
      startPlaceholder: "Từ ngày",
      endPlaceholder: "Đến ngày",
      valueFormat: "YYYY-MM-DD",
      clearable: true,
    },
  },
]);

const columns = ref<ColumnOption[]>([
  { label: "Nhà cung cấp", prop: "supplierName", minWidth: 160 },
  { label: "Số hợp đồng", prop: "contractNumber", minWidth: 150 },
  { label: "Giá trị", prop: "contractValue", width: 130, align: "right" },
  { label: "Hạn mức nợ", prop: "creditLimit", width: 130, align: "right" },
  { label: "Chiết khấu", prop: "discountRate", width: 100, align: "center" },
  { label: "Trạng thái", prop: "status", width: 130, align: "center" },
  {
    label: "Ngày hiệu lực",
    prop: "effectiveDate",
    width: 120,
    align: "center",
  },
  {
    label: "Ngày hết hạn",
    prop: "expirationDate",
    width: 120,
    align: "center",
  },
  {
    label: "Thao tác",
    prop: "operation",
    width: 180,
    fixed: "right" as const,
    align: "center",
  },
]);
const columnChecks = columns;

const isFormLocked = computed(() => {
  return formData.value.status === "Active";
});

const formRules = {
  contractNumber: [
    { required: true, message: "Vui lòng nhập số hợp đồng", trigger: "blur" },
  ],
  effectiveDate: [
    {
      required: true,
      message: "Vui lòng chọn ngày hiệu lực",
      trigger: "change",
    },
  ],
  contractValue: [
    {
      required: true,
      message: "Vui lòng nhập giá trị hợp đồng",
      trigger: "blur",
    },
  ],
  status: [
    { required: true, message: "Vui lòng chọn trạng thái", trigger: "change" },
  ],
};

const getStatusType = (status: string) => {
  switch (status) {
    case "Active":
      return "success";
    case "PendingApproval":
      return "warning";
    case "Expired":
      return "danger";
    case "Terminated":
      return "info";
    case "Completed":
      return "success";
    default:
      return "info";
  }
};

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
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const searchSuppliers = async (query: string) => {
  if (!query) {
    supplierOptions.value = [];
    return;
  }
  supplierLoading.value = true;
  try {
    const res = await usecases.getSuppliersForSelect.execute();
    supplierOptions.value = res.filter((s: any) =>
      s.name.toLowerCase().includes(query.toLowerCase()),
    );
  } catch {
    supplierOptions.value = [];
  } finally {
    supplierLoading.value = false;
  }
};

const isImageFile = (fileName: string) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
};

const revokeContractFilePreview = () => {
  if (
    contractFilePreviewUrl.value &&
    contractFilePreviewUrl.value.startsWith("blob:")
  ) {
    URL.revokeObjectURL(contractFilePreviewUrl.value);
  }
  contractFilePreviewUrl.value = "";
};

const clearContractFile = () => {
  revokeContractFilePreview();
  contractFileName.value = "";
  fileList.value = [];
  formData.value.contractFilePath = undefined;
};

const customUploadRequest = async (options: any) => {
  try {
    revokeContractFilePreview();
    const url = URL.createObjectURL(options.file);
    fileList.value = [
      { name: options.file.name, url, response: "ok", isTemp: true },
    ];
    formData.value.contractFilePath = url;
    contractFileName.value = options.file.name;
    if (isImageFile(options.file.name)) {
      contractFilePreviewUrl.value = url;
    } else {
      contractFilePreviewUrl.value = "";
    }
    options.onSuccess?.({});
  } catch {
    ElMessage.error("Tải lên thất bại");
    options.onError?.({});
  }
};

const loadStats = async () => {
  try {
    const res = await usecases.getStatistics.execute();
    stats.totalContracts = res.totalContracts || 0;
    stats.activeContracts = res.activeContracts || 0;
    stats.pendingApproval = res.pendingApproval || 0;
    stats.expiredContracts = res.expiredContracts || 0;
    stats.expiringContracts = res.expiringContracts || 0;
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const filters: string[] = [];
    if (searchForm.value.name)
      filters.push(`Supplier.Name@=${searchForm.value.name}`);
    if (searchForm.value.contractNumber)
      filters.push(`ContractNumber@=${searchForm.value.contractNumber}`);
    if (searchForm.value.status.length > 0)
      filters.push(`Status==${searchForm.value.status.join("|")}`);
    if (
      searchForm.value.effectiveDateRange &&
      searchForm.value.effectiveDateRange.length === 2
    ) {
      filters.push(`EffectiveDate>=${searchForm.value.effectiveDateRange[0]}`);
      filters.push(`EffectiveDate<=${searchForm.value.effectiveDateRange[1]}`);
    }
    if (
      searchForm.value.expirationDateRange &&
      searchForm.value.expirationDateRange.length === 2
    ) {
      filters.push(
        `ExpirationDate>=${searchForm.value.expirationDateRange[0]}`,
      );
      filters.push(
        `ExpirationDate<=${searchForm.value.expirationDateRange[1]}`,
      );
    }

    const params: any = {
      current: pagination.current,
      size: pagination.size,
      Filters: filters.join(",") || undefined,
      Sorts: "EffectiveDate desc",
    };
    const res = await usecases.getContracts.execute(params);
    data.value = res.items || [];
    pagination.total = res.totalCount || 0;
  } catch (error) {
    console.error("Failed to load contracts:", error);
    ElMessage.error("Không thể tải danh sách hợp đồng");
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  searchForm.value = {
    name: "",
    contractNumber: "",
    status: [],
    effectiveDateRange: [],
    expirationDateRange: [],
  };
  pagination.current = 1;
  loadData();
};

const handleAdd = () => {
  dialogTitle.value = "Tạo hợp đồng mới";
  formData.value = {
    contractNumber: "",
    effectiveDate: "",
    expirationDate: "",
    contractValue: 0,
    status: "Draft",
    terms: "",
    note: "",
    supplierId: undefined,
    creditLimit: undefined,
    paymentWindowDays: undefined,
    bankName: "",
    bankAccountNumber: "",
    minimumVolumePerMonth: undefined,
    discountRate: undefined,
    contractItems: [],
  };
  fileList.value = [];
  revokeContractFilePreview();
  contractFileName.value = "";
  dialogVisible.value = true;
};

const handleEdit = (row: SupplierContractDto) => {
  dialogTitle.value = "Cập nhật hợp đồng";
  const skuItems: SupplierContractSkuItem[] =
    (row as any).skuPriceList?.map((item: any) => ({
      ...item,
    })) || [];

  formData.value = {
    ...row,
    creditLimit: (row as any).creditLimit,
    paymentWindowDays: (row as any).paymentWindowDays,
    bankName: (row as any).bankName,
    bankAccountNumber: (row as any).bankAccountNumber,
    minimumVolumePerMonth: (row as any).minimumVolumePerMonth,
    discountRate: (row as any).discountRate,
    contractItems: skuItems,
  };
  revokeContractFilePreview();
  if (row.contractFilePath) {
    fileList.value = [
      { name: "contract-file", url: row.contractFilePath, response: "ok" },
    ];
    contractFileName.value =
      row.contractFilePath.split("/").pop() || "contract-file";
    if (isImageFile(row.contractFilePath)) {
      contractFilePreviewUrl.value = row.contractFilePath;
    } else {
      contractFilePreviewUrl.value = "";
    }
  } else {
    fileList.value = [];
    contractFileName.value = "";
  }
  dialogVisible.value = true;
};

const handleView = (row: SupplierContractDto) => {
  router.push({ name: "SupplierContractPreview", params: { id: row.id } });
};

const handleDelete = async (row: SupplierContractDto) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa hợp đồng "${row.contractNumber}"?`,
      "Xác nhận xóa",
      { confirmButtonText: "Xóa", cancelButtonText: "Hủy", type: "warning" },
    );
    await usecases.delete.execute(row.id);
    ElMessage.success("Xóa thành công");
    loadData();
    loadStats();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete:", error);
      ElMessage.error("Không thể xóa hợp đồng");
    }
  }
};

const handleAddSkuItem = () => {
  const items = formData.value.contractItems || [];
  items.push({
    productVariantId: 0,
    wholesalePrice: 0,
    skuCode: "",
    productName: "",
    category: "",
    moq: 1,
  } as any);
};

const handleRemoveSkuItem = (index: number) => {
  const items = formData.value.contractItems || [];
  items.splice(index, 1);
};

const handleCreateAddendum = () => {
  ElMessage.info("Tính năng tạo phụ lục đang được phát triển.");
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const { contractItems, ...rest } = formData.value;
      const payload: any = { ...rest, skuPriceList: contractItems };
      delete payload.supplierName;
      delete payload.supplierCode;
      delete payload.supplierContactName;
      delete payload.supplierPhone;
      delete payload.supplierEmail;
      delete payload.supplierAddress;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;

      if (formData.value.id) {
        await usecases.update.execute(formData.value.id, payload);
        ElMessage.success("Cập nhật thành công");
      } else {
        await usecases.create.execute(payload);
        ElMessage.success("Tạo mới thành công");
      }
      dialogVisible.value = false;
      loadData();
      loadStats();
    } catch (error) {
      console.error("Failed to save:", error);
      ElMessage.error("Không thể lưu hợp đồng");
    } finally {
      submitting.value = false;
    }
  });
};

const handleSearch = () => {
  pagination.current = 1;
  loadData();
};
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  loadData();
};
const handleCurrentChange = (page: number) => {
  pagination.current = page;
  loadData();
};
onMounted(() => {
  loadStats();
  loadData();
});
</script>

<style scoped lang="scss">
.contract-supplier-container {
  color: #f8fafc;
}

.supplier-create-button {
  height: 40px;
  padding: 0 18px;
  font-weight: 800;
  border-radius: 10px;
}

.supplier-kpi-grid {
  margin-bottom: 16px;
}

.supplier-kpi-grid :deep(.art-card) {
  min-height: 128px;
  color: #f8fafc;
  background: #161618;
  border-color: rgb(255 255 255 / 9%) !important;
}

.supplier-kpi-grid :deep(.art-card .text-g-900),
.supplier-kpi-grid :deep(.art-card .text-g-800),
.supplier-kpi-grid :deep(.art-card .text-g-700),
.supplier-kpi-grid :deep(.art-card .text-g-600),
.supplier-kpi-grid :deep(.art-card .text-g-500),
.supplier-kpi-grid :deep(.art-card p),
.supplier-table-card :deep(.el-table),
.supplier-table-card :deep(.el-table .cell),
.supplier-table-card :deep(.el-table th.el-table__cell),
.supplier-table-card :deep(.el-table td.el-table__cell),
.supplier-table-card :deep(.el-pagination),
.supplier-table-card :deep(.el-pagination *) {
  color: #f8fafc !important;
  opacity: 1 !important;
}

.supplier-filter-card {
  margin-bottom: 16px;
}

.supplier-filter-card :deep(.el-card__body) {
  padding: 14px 18px;
}

.supplier-filter-card :deep(.art-search-bar) {
  padding: 0;
  color: #f8fafc;
  background: transparent;
  border: 0 !important;
  box-shadow: none;
}

.supplier-filter-card :deep(.el-row) {
  row-gap: 14px;
  align-items: flex-end;
}

.supplier-filter-card--compact :deep(.el-col:not(.action-column)) {
  min-width: 190px;
}

.supplier-filter-card--compact :deep(.action-column) {
  min-width: 188px;
}

.supplier-filter-card :deep(.el-form-item) {
  display: flex;
  flex-direction: column;
  gap: 7px;
  align-items: stretch;
  margin-bottom: 0;
}

.supplier-filter-card :deep(.el-form-item__content) {
  width: 100%;
  min-width: 0;
}

.supplier-filter-card :deep(.el-form-item__label) {
  justify-content: flex-start;
  width: auto !important;
  height: auto;
  padding: 0;
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  word-break: keep-all;
  white-space: nowrap;
}

.supplier-filter-card :deep(.el-input__wrapper),
.supplier-filter-card :deep(.el-select__wrapper) {
  min-height: 36px;
  border-radius: 8px;
}

.supplier-filter-card :deep(.action-buttons-wrapper) {
  justify-content: flex-end !important;
  width: 100%;
  margin-bottom: 2px !important;
}

.supplier-filter-card :deep(.form-buttons) {
  gap: 10px;
}

.supplier-filter-card :deep(.reset-button),
.supplier-filter-card :deep(.search-button) {
  height: 32px;
  padding: 0 15px;
  border-radius: 8px;
}

.supplier-filter-card :deep(.filter-toggle) {
  height: 32px;
  margin-left: 10px;
  line-height: 32px;
}

.contract-supplier-container :deep(.el-input__wrapper),
.contract-supplier-container :deep(.el-select__wrapper) {
  color: #f8fafc;
  background: #101114 !important;
  border-color: rgb(255 255 255 / 14%) !important;
  box-shadow: none;
}

.contract-supplier-container :deep(.el-date-editor.el-input__wrapper) {
  box-sizing: border-box;
  width: 100% !important;
}

.contract-supplier-container :deep(.art-search-bar .el-form-item__label),
.contract-supplier-container :deep(.el-input__inner),
.contract-supplier-container :deep(.el-select__placeholder),
.contract-supplier-container :deep(.el-select__selected-item),
.contract-supplier-container :deep(.el-select__caret),
.contract-supplier-container :deep(.el-range-input),
.contract-supplier-container :deep(.el-range-separator) {
  color: #f8fafc !important;
  background: transparent !important;
}

.supplier-table-card :deep(.el-card__body) {
  padding: 18px 20px;
}

.supplier-table-heading {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #f8fafc;
}

.supplier-table-heading span {
  font-size: 16px;
  font-weight: 800;
}

.supplier-table-heading small {
  font-size: 12px;
  color: #9ca3af;
}

.supplier-table-card :deep(#art-table-header) {
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgb(255 255 255 / 9%);
}

.supplier-table-card :deep(#art-table-header .button) {
  color: #cbd5e1;
  background: #202126;
  border: 1px solid rgb(255 255 255 / 9%);
}

.supplier-table-card :deep(.el-table th.el-table__cell) {
  background: #111214;
}

.supplier-table-card :deep(.el-table__empty-block) {
  background: #161618;
}

.supplier-operation-cell {
  display: grid;
  grid-template-columns: 32px repeat(2, 48px);
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.supplier-operation-cell :deep(.el-button) {
  height: 32px;
  margin: 0;
}

.supplier-operation-cell :deep(.art-button-table),
.supplier-operation-cell :deep(.el-button.is-circle) {
  width: 32px;
}

.supplier-operation-button.el-button {
  width: 48px;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
}

.contract-supplier-container .text-gray-400,
.contract-supplier-container .text-gray-500,
.contract-supplier-container .text-gray-600,
.contract-supplier-container .text-gray-800,
.contract-supplier-container .text-gray-900 {
  color: #f8fafc !important;
}

.border-l {
  border-left: 1px solid rgb(255 255 255 / 14%);
}

@media (width >= 1280px) {
  .supplier-kpi-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (width <= 768px) {
  .supplier-filter-card :deep(.action-buttons-wrapper) {
    justify-content: flex-start !important;
    min-height: 0;
  }
}

// Additional dark mode overrides
html.dark .contract-supplier-container {
  min-height: 100vh;
  background: #050506;
}

html.dark .supplier-table-card :deep(.art-table-card) {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .supplier-table-card :deep(.el-pagination),
html.dark .supplier-table-card :deep(.el-pagination *) {
  color: #f8fafc;
}

html.dark .supplier-table-card :deep(.el-pagination .el-pager li) {
  background: #101114;
  border: 1px solid rgb(255 255 255 / 10%);
}

html.dark .supplier-table-card :deep(.el-pagination .el-pager li.is-active) {
  background: #e84a4a;
  border-color: #e84a4a;
}

html.dark .contract-supplier-container :deep(.el-tag) {
  color: #fff;
  border-color: transparent;
}
</style>

<style lang="scss">
.contract-supplier-dialog.el-dialog {
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

.contract-supplier-dialog .el-dialog__title,
.contract-supplier-dialog .el-form-item__label,
.contract-supplier-dialog .el-upload__text,
.contract-supplier-dialog .el-upload__tip,
.contract-supplier-dialog .text-gray-400,
.contract-supplier-dialog .text-gray-500,
.contract-supplier-dialog .text-gray-600 {
  color: #f8fafc !important;
}

.contract-supplier-dialog .el-input__wrapper,
.contract-supplier-dialog .el-input-number,
.contract-supplier-dialog .el-date-editor,
.contract-supplier-dialog .el-select__wrapper,
.contract-supplier-dialog .el-textarea__inner,
.contract-supplier-dialog .el-upload-dragger {
  color: #f8fafc;
  background: #101114;
  border-color: rgb(255 255 255 / 14%);
  box-shadow: none;
}

.contract-supplier-dialog .el-input__inner,
.contract-supplier-dialog .el-select__placeholder,
.contract-supplier-dialog .el-select__selected-item,
.contract-supplier-dialog .el-textarea__inner {
  color: #f8fafc;
}

.contract-supplier-dialog .contract-file-upload .el-upload,
.contract-supplier-dialog .contract-file-upload .el-upload-dragger {
  width: 100%;
}

.contract-supplier-dialog .contract-upload-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 190px;
  padding: 12px;
  color: #f8fafc;
}

.contract-supplier-dialog .contract-upload-preview img {
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 10px;
}

.contract-supplier-dialog .contract-upload-preview .preview-hint {
  font-size: 12px;
  color: #94a3b8;
}

.contract-supplier-dialog .contract-upload-filebar {
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
</style>
