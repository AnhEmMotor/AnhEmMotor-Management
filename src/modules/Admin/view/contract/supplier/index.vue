<template>
  <div class="resp-page reporting-page contract-supplier-container">
    <ReportPageHeader
      title="Hợp đồng Nhà cung cấp"
      description="Theo dõi hiệu lực hợp đồng, hạn mức công nợ, chiết khấu và các hợp đồng cần phê duyệt trong một màn hình."
      icon="ri:truck-line"
    >
      <template #actions>
        <ElButton type="primary" v-ripple class="supplier-create-button" @click="handleAdd">
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

    <ElCard class="reporting-card supplier-filter-card supplier-filter-card--compact">
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
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadData">
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
          <span class="supplier-name-cell">{{ getSupplierName(row) }}</span>
        </template>
        <template #contractValue="{ row }">
          <span class="font-medium">{{
            formatCurrency((row as SupplierContractDto).contractValue)
          }}</span>
        </template>
        <template #creditLimit="{ row }">
          <span class="font-medium text-primary">{{
            formatCurrency((row as SupplierContractDto).creditLimit || 0)
          }}</span>
        </template>
        <template #discountRate="{ row }">
          <span>{{
            (row as SupplierContractDto).discountRate
              ? (row as SupplierContractDto).discountRate + '%'
              : '-'
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
          {{ row.expirationDate ? formatDate(row.expirationDate) : '-' }}
        </template>
        <template #operation="{ row }">
          <div class="supplier-operation-cell">
            <ElTooltip content="Xem chi tiết" placement="top">
              <ArtButtonTable
                type="view"
                class="supplier-operation-icon"
                @click="handleView(row)"
              />
            </ElTooltip>
            <ElTooltip
              v-if="row.status === 'PendingApproval' || row.status === 'Draft'"
              content="Duyệt hợp đồng"
              placement="top"
            >
              <ArtButtonTable
                icon="ri:check-line"
                icon-class="bg-success/12 text-success"
                class="supplier-operation-icon"
                @click="handleApprove(row)"
              />
            </ElTooltip>
            <ElTooltip content="Chỉnh sửa" placement="top">
              <ArtButtonTable
                type="edit"
                class="supplier-operation-icon"
                @click="handleEdit(row)"
              />
            </ElTooltip>
            <ElTooltip v-if="row.status !== 'Active'" content="Xóa" placement="top">
              <ArtButtonTable
                type="delete"
                class="supplier-operation-icon"
                @click="handleDelete(row)"
              />
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      class="contract-supplier-dialog"
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="formData"
        label-position="top"
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
              <ElInput v-model="formData.contractNumber" placeholder="VD: HD-2024-001" />
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
              <ElFormItem label="File hợp đồng">
                <ElUpload
                  :http-request="customUploadRequest"
                  :file-list="fileList"
                  :show-file-list="false"
                  drag
                  class="w-full contract-file-upload"
                  :disabled="isFormLocked"
                  :before-upload="validateContractFile"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                >
                  <div v-if="contractFilePreviewUrl" class="contract-upload-preview">
                    <img :src="contractFilePreviewUrl" alt="Xem trước file hợp đồng" />
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
                      Hỗ trợ PDF, Word (.doc, .docx), JPG, PNG (tối đa 10MB)
                    </div>
                  </template>
                </ElUpload>
                <div v-if="contractFilePreviewUrl && !isFormLocked" class="contract-upload-filebar">
                  <span class="truncate">{{ contractFileName }}</span>
                  <ElButton link type="danger" @click.stop="clearContractFile">Xóa</ElButton>
                </div>
                <div
                  v-else-if="contractFileName && !contractFilePreviewUrl"
                  class="contract-upload-filebar"
                >
                  <span class="truncate">{{ contractFileName }}</span>
                  <ElButton v-if="!isFormLocked" link type="danger" @click.stop="clearContractFile"
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
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <ElFormItem label="Hạn mức công nợ">
                  <ElInputNumber
                    v-model="formData.creditLimit"
                    :min="0"
                    :precision="0"
                    class="w-full"
                  />
                </ElFormItem>
                <ElFormItem label="Hạn thanh toán (ngày)">
                  <ElInputNumber
                    v-model="formData.paymentWindowDays"
                    :min="0"
                    :precision="0"
                    class="w-full"
                  />
                </ElFormItem>
                <ElFormItem label="Sản lượng tối thiểu/tháng">
                  <ElInputNumber
                    v-model="formData.minimumVolumePerMonth"
                    :min="0"
                    :precision="0"
                    class="w-full"
                  />
                </ElFormItem>
                <ElFormItem label="Chiết khấu (%)">
                  <ElInputNumber
                    v-model="formData.discountRate"
                    :min="0"
                    :max="100"
                    :precision="2"
                    class="w-full"
                  />
                </ElFormItem>
              </div>
              <ElFormItem label="Ngân hàng">
                <ElInput v-model="formData.bankName" />
              </ElFormItem>
              <ElFormItem label="Số tài khoản">
                <ElInput v-model="formData.bankAccountNumber" />
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
            </div>
          </el-col>
        </el-row>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton v-if="isFormLocked" type="warning" @click="handleCreateAddendum">
            Tạo phụ lục (để chỉnh sửa)
          </ElButton>
          <ElButton v-else type="primary" :loading="submitting" @click="submitForm">
            {{ formData.id ? 'Cập nhật' : 'Tạo mới' }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, UploadFilled } from '@element-plus/icons-vue';
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type UploadRequestOptions,
  type UploadUserFile,
} from 'element-plus';
import type { ColumnOption } from '@/types/component';
import ReportPageHeader from '@/modules/Accountant/view/reporting/ReportPageHeader.vue';
import type {
  SupplierContractDto,
  SupplierContractListParams,
  SupplierContractMutation,
  SupplierContractSkuItem,
  SupplierContractStatus,
} from '@/domain/supplier/contract.types';

interface SupplierContractForm {
  id?: string;
  contractNumber: string;
  effectiveDate: string;
  expirationDate?: string;
  contractValue: number;
  status: SupplierContractStatus;
  terms?: string;
  note?: string;
  supplierId?: number;
  creditLimit: number | undefined;
  paymentWindowDays: number | undefined;
  bankName?: string;
  bankAccountNumber?: string;
  minimumVolumePerMonth: number | undefined;
  discountRate: number | undefined;
  contractItems: SupplierContractSkuItem[];
  contractFilePath?: string;
  parentContractId?: string;
}

import { createSupplierContractUseCases } from '@/infrastructure/supplier/usecasesFactory';

defineOptions({ name: 'SupplierContract' });

const usecases = createSupplierContractUseCases();

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('Tạo hợp đồng mới');
const submitting = ref(false);
const formRef = ref<FormInstance>();
const tableRef = ref();
const supplierLoading = ref(false);
interface SupplierOption {
  id: number;
  name: string;
}

const supplierOptions = ref<SupplierOption[]>([]);
const allSupplierOptions = ref<SupplierOption[]>([]);

const stats = reactive({
  totalContracts: 0,
  activeContracts: 0,
  pendingApproval: 0,
  expiredContracts: 0,
  expiringContracts: 0,
});

const pagination = reactive({ current: 1, size: 10, total: 0 });
const data = ref<SupplierContractDto[]>([]);
const fileList = ref<UploadUserFile[]>([]);
const pendingContractFile = ref<File>();
const contractFilePreviewUrl = ref('');
const contractFileName = ref('');

const formData = ref<SupplierContractForm>({
  contractNumber: '',
  effectiveDate: '',
  expirationDate: '',
  contractValue: 0,
  status: 'Draft',
  terms: '',
  note: '',
  supplierId: undefined,
  creditLimit: undefined,
  paymentWindowDays: undefined,
  bankName: '',
  bankAccountNumber: '',
  minimumVolumePerMonth: undefined,
  discountRate: undefined,
  contractItems: [],
});

const searchForm = ref({
  name: '',
  contractNumber: '',
  status: [] as string[],
  effectiveDateRange: [] as string[],
  expirationDateRange: [] as string[],
});

const searchItems = ref([
  {
    key: 'name',
    label: 'Tên nhà cung cấp',
    type: 'input',
    props: {
      placeholder: 'Nhập tên nhà cung cấp',
      clearable: true,
    },
  },
  {
    key: 'contractNumber',
    label: 'Số hợp đồng',
    type: 'input',
    props: {
      placeholder: 'Nhập số hợp đồng',
      clearable: true,
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'select',
    props: {
      options: [
        { label: 'Nháp', value: 'Draft' },
        { label: 'Chờ phê duyệt', value: 'PendingApproval' },
        { label: 'Đang hiệu lực', value: 'Active' },
        { label: 'Đã hết hạn', value: 'Expired' },
        { label: 'Đã thanh lý', value: 'Terminated' },
        { label: 'Đã hoàn thành', value: 'Completed' },
      ],
      multiple: true,
      collapseTags: true,
      placeholder: 'Chọn trạng thái...',
    },
  },
  {
    key: 'effectiveDateRange',
    label: 'Ngày hiệu lực',
    type: 'daterange',
    props: {
      startPlaceholder: 'Từ ngày',
      endPlaceholder: 'Đến ngày',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
    },
  },
  {
    key: 'expirationDateRange',
    label: 'Ngày hết hạn',
    type: 'daterange',
    props: {
      startPlaceholder: 'Từ ngày',
      endPlaceholder: 'Đến ngày',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
    },
  },
]);

const columns = ref<ColumnOption[]>([
  {
    label: 'Số hợp đồng',
    prop: 'contractNumber',
    minWidth: 150,
    align: 'center',
    headerAlign: 'center',
  },
  {
    label: 'Nhà cung cấp',
    prop: 'supplierName',
    minWidth: 180,
    align: 'center',
    headerAlign: 'center',
    useSlot: true,
  },
  {
    label: 'Giá trị',
    prop: 'contractValue',
    width: 130,
    align: 'right',
    headerAlign: 'center',
    useSlot: true,
  },
  {
    label: 'Hạn mức nợ',
    prop: 'creditLimit',
    width: 130,
    align: 'right',
    headerAlign: 'center',
    useSlot: true,
  },
  {
    label: 'Chiết khấu',
    prop: 'discountRate',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    useSlot: true,
  },
  {
    label: 'Trạng thái',
    prop: 'status',
    width: 130,
    align: 'center',
    headerAlign: 'center',
    useSlot: true,
  },
  {
    label: 'Ngày hiệu lực',
    prop: 'effectiveDate',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    useSlot: true,
  },
  {
    label: 'Ngày hết hạn',
    prop: 'expirationDate',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    useSlot: true,
  },
  {
    label: 'Thao tác',
    prop: 'operation',
    width: 190,
    fixed: 'right' as const,
    align: 'center',
    headerAlign: 'center',
    useSlot: true,
  },
]);
const columnChecks = columns;

const isFormLocked = computed(() => {
  return formData.value.status === 'Active';
});

const formRules = {
  supplierId: [
    {
      required: true,
      message: 'Vui lòng chọn nhà cung cấp',
      trigger: 'change',
    },
  ],
  contractNumber: [{ required: true, message: 'Vui lòng nhập số hợp đồng', trigger: 'blur' }],
  effectiveDate: [
    {
      required: true,
      message: 'Vui lòng chọn ngày hiệu lực',
      trigger: 'change',
    },
  ],
  contractValue: [
    {
      required: true,
      message: 'Vui lòng nhập giá trị hợp đồng',
      trigger: 'blur',
    },
  ],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'PendingApproval':
      return 'warning';
    case 'Expired':
      return 'danger';
    case 'Terminated':
      return 'info';
    case 'Completed':
      return 'success';
    default:
      return 'info';
  }
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    Draft: 'Nháp',
    PendingApproval: 'Chờ phê duyệt',
    Active: 'Đang hiệu lực',
    Expired: 'Đã hết hạn',
    Terminated: 'Đã thanh lý',
    Completed: 'Đã hoàn thành',
  };
  return map[status] || status;
};

const formatCurrency = (value: number) => {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const loadSupplierOptions = async () => {
  supplierLoading.value = true;
  try {
    const res = await usecases.getSuppliersForSelect.execute();
    allSupplierOptions.value = res;
    supplierOptions.value = res;
  } catch {
    allSupplierOptions.value = [];
    supplierOptions.value = [];
  } finally {
    supplierLoading.value = false;
  }
};

const searchSuppliers = (query: string) => {
  const keyword = query.trim().toLocaleLowerCase('vi-VN');
  supplierOptions.value = keyword
    ? allSupplierOptions.value.filter((supplier) =>
        supplier.name.toLocaleLowerCase('vi-VN').includes(keyword)
      )
    : allSupplierOptions.value;
};

const getSupplierName = (row: SupplierContractDto) => {
  if (row.supplierName?.trim()) return row.supplierName;
  if (row.supplierId != null) {
    return (
      allSupplierOptions.value.find((supplier) => supplier.id === row.supplierId)?.name ||
      'Chưa xác định'
    );
  }
  return 'Chưa gán nhà cung cấp';
};

const isImageFile = (fileName: string) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
};

const revokeContractFilePreview = () => {
  if (contractFilePreviewUrl.value && contractFilePreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(contractFilePreviewUrl.value);
  }
  contractFilePreviewUrl.value = '';
};

const clearContractFile = () => {
  revokeContractFilePreview();
  contractFileName.value = '';
  fileList.value = [];
  pendingContractFile.value = undefined;
  formData.value.contractFilePath = '';
};

const validateContractFile = (file: File) => {
  const allowedExtensions = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;
  if (!allowedExtensions.test(file.name)) {
    ElMessage.error('Chỉ hỗ trợ PDF, Word, JPG, JPEG hoặc PNG.');
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('File hợp đồng không được vượt quá 10MB.');
    return false;
  }
  return true;
};

const createUploadError = (message: string) =>
  Object.assign(new Error(message), {
    status: 0,
    method: 'POST',
    url: '',
  });

const customUploadRequest = async (options: UploadRequestOptions) => {
  try {
    revokeContractFilePreview();
    const selectedFile = options.file as File;
    const url = URL.createObjectURL(selectedFile);
    fileList.value = [{ name: selectedFile.name, url, status: 'ready' }];
    pendingContractFile.value = selectedFile;
    contractFileName.value = selectedFile.name;
    if (isImageFile(selectedFile.name)) {
      contractFilePreviewUrl.value = url;
    } else {
      contractFilePreviewUrl.value = '';
    }
    options.onSuccess({});
  } catch {
    ElMessage.error('Tải lên thất bại');
    options.onError(createUploadError('Không thể đọc file hợp đồng'));
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
    console.error('Failed to load stats:', error);
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const filters: string[] = [];
    if (searchForm.value.name) filters.push(`Supplier.Name@=${searchForm.value.name}`);
    if (searchForm.value.contractNumber)
      filters.push(`ContractNumber@=${searchForm.value.contractNumber}`);
    if (searchForm.value.status.length > 0)
      filters.push(`Status==${searchForm.value.status.join('|')}`);
    if (searchForm.value.effectiveDateRange && searchForm.value.effectiveDateRange.length === 2) {
      filters.push(`EffectiveDate>=${searchForm.value.effectiveDateRange[0]}`);
      filters.push(`EffectiveDate<=${searchForm.value.effectiveDateRange[1]}`);
    }
    if (searchForm.value.expirationDateRange && searchForm.value.expirationDateRange.length === 2) {
      filters.push(`ExpirationDate>=${searchForm.value.expirationDateRange[0]}`);
      filters.push(`ExpirationDate<=${searchForm.value.expirationDateRange[1]}`);
    }

    const params: SupplierContractListParams = {
      current: pagination.current,
      size: pagination.size,
      filters: filters.join(',') || undefined,
      sorts: 'EffectiveDate desc',
    };
    const res = await usecases.getContracts.execute(params);
    data.value = res.items ?? [];
    pagination.total = res.totalCount ?? 0;
  } catch (error) {
    console.error('Failed to load contracts:', error);
    ElMessage.error('Không thể tải danh sách hợp đồng');
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  searchForm.value = {
    name: '',
    contractNumber: '',
    status: [],
    effectiveDateRange: [],
    expirationDateRange: [],
  };
  pagination.current = 1;
  loadData();
};

const handleAdd = () => {
  dialogTitle.value = 'Tạo hợp đồng mới';
  formData.value = {
    contractNumber: '',
    effectiveDate: '',
    expirationDate: '',
    contractValue: 0,
    status: 'Draft',
    terms: '',
    note: '',
    supplierId: undefined,
    creditLimit: undefined,
    paymentWindowDays: undefined,
    bankName: '',
    bankAccountNumber: '',
    minimumVolumePerMonth: undefined,
    discountRate: undefined,
    contractItems: [],
    parentContractId: undefined,
  };
  fileList.value = [];
  pendingContractFile.value = undefined;
  revokeContractFilePreview();
  contractFileName.value = '';
  dialogVisible.value = true;
};

const populateFormFromContract = (
  source: SupplierContractDto,
  options: { asAddendum?: boolean } = {}
) => {
  const asAddendum = options.asAddendum === true;
  const skuItems = (source.skuPriceList ?? []).map((item) => ({ ...item }));
  formData.value = {
    id: asAddendum ? undefined : source.id,
    contractNumber: asAddendum ? '' : source.contractNumber,
    effectiveDate: asAddendum ? '' : source.effectiveDate,
    expirationDate: asAddendum ? '' : source.expirationDate,
    contractValue: source.contractValue,
    status: asAddendum ? 'Draft' : source.status,
    terms: source.terms,
    note: source.note,
    supplierId: source.supplierId,
    creditLimit: source.creditLimit,
    paymentWindowDays: source.paymentWindowDays,
    bankName: source.bankName,
    bankAccountNumber: source.bankAccountNumber,
    minimumVolumePerMonth: source.minimumVolumePerMonth,
    discountRate: source.discountRate,
    contractFilePath: asAddendum ? undefined : source.contractFilePath,
    parentContractId: asAddendum ? source.id : source.parentContractId,
    contractItems: skuItems,
  };
  pendingContractFile.value = undefined;
  revokeContractFilePreview();
  if (!asAddendum && source.contractFilePath) {
    fileList.value = [
      {
        name: source.contractFilePath.split('/').pop() || 'contract-file',
        url: source.contractFilePath,
        status: 'success',
      },
    ];
    contractFileName.value = source.contractFilePath.split('/').pop() || 'contract-file';
    if (isImageFile(source.contractFilePath)) {
      contractFilePreviewUrl.value = source.contractFilePath;
    } else {
      contractFilePreviewUrl.value = '';
    }
  } else {
    fileList.value = [];
    contractFileName.value = '';
  }
};

const handleEdit = async (row: SupplierContractDto) => {
  dialogTitle.value = 'Cập nhật hợp đồng';
  try {
    const detail = await usecases.getContractDetail.execute(row.id);
    populateFormFromContract(detail);
  } catch {
    ElMessage.error('Không thể tải đầy đủ dữ liệu hợp đồng để chỉnh sửa.');
    return;
  }
  dialogVisible.value = true;
};

const handleView = (row: SupplierContractDto) => {
  router.push({ name: 'SupplierContractPreview', params: { id: row.id } });
};

const handleDelete = async (row: SupplierContractDto) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa hợp đồng "${row.contractNumber}"?`,
      'Xác nhận xóa',
      { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' }
    );
    await usecases.delete.execute(row.id);
    ElMessage.success('Xóa thành công');
    loadData();
    loadStats();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete:', error);
      ElMessage.error('Không thể xóa hợp đồng');
    }
  }
};

const handleApprove = async (row: SupplierContractDto) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn duyệt hợp đồng "${row.contractNumber}"?`,
      'Xác nhận duyệt',
      { confirmButtonText: 'Duyệt', cancelButtonText: 'Hủy', type: 'success' }
    );
    await usecases.updateStatus.execute(row.id, 'Active');
    ElMessage.success('Đã duyệt hợp đồng thành công.');
    loadData();
    loadStats();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to approve:', error);
      ElMessage.error('Không thể duyệt hợp đồng');
    }
  }
};

const openAddendum = async (parentContractId: string) => {
  try {
    const parentContract = await usecases.getContractDetail.execute(parentContractId);
    populateFormFromContract(parentContract, { asAddendum: true });
    dialogTitle.value = `Tạo phụ lục cho ${parentContract.contractNumber}`;
    dialogVisible.value = true;
  } catch {
    ElMessage.error('Không thể tải hợp đồng gốc để tạo phụ lục.');
  }
};

const handleCreateAddendum = async () => {
  if (!formData.value.id) return;
  await openAddendum(formData.value.id);
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const { contractItems } = formData.value;
      const payload: SupplierContractMutation = {
        supplierId: formData.value.supplierId,
        contractNumber: formData.value.contractNumber.trim(),
        effectiveDate: formData.value.effectiveDate,
        expirationDate: formData.value.expirationDate || undefined,
        contractValue: formData.value.contractValue,
        status: formData.value.status,
        terms: formData.value.terms,
        note: formData.value.note,
        creditLimit: formData.value.creditLimit,
        paymentWindowDays: formData.value.paymentWindowDays,
        bankName: formData.value.bankName,
        bankAccountNumber: formData.value.bankAccountNumber,
        minimumVolumePerMonth: formData.value.minimumVolumePerMonth,
        discountRate: formData.value.discountRate,
        parentContractId: formData.value.parentContractId,
        contractFilePath: formData.value.contractFilePath,
        contractItems: contractItems.map((item) => ({
          productVariantId: item.productVariantId,
          wholesalePrice: item.wholesalePrice,
        })),
      };

      let savedContract: SupplierContractDto;
      if (formData.value.id) {
        savedContract = await usecases.update.execute(formData.value.id, payload);
        ElMessage.success('Cập nhật thành công');
      } else {
        savedContract = await usecases.create.execute(payload);
        ElMessage.success('Tạo mới thành công');
      }
      if (pendingContractFile.value) {
        try {
          await usecases.uploadContractFile.execute(savedContract.id, pendingContractFile.value);
        } catch (error) {
          console.error('Failed to upload supplier contract file:', error);
          ElMessage.warning(
            'Hợp đồng đã lưu nhưng file đính kèm chưa tải lên được. Vui lòng thử lại ở trang chi tiết.'
          );
        }
      }
      dialogVisible.value = false;
      pendingContractFile.value = undefined;
      loadData();
      loadStats();
    } catch (error) {
      console.error('Failed to save:', error);
      ElMessage.error('Không thể lưu hợp đồng');
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
onMounted(async () => {
  await Promise.all([loadStats(), loadData(), loadSupplierOptions()]);
  const parentContractId = route.query.parentContractId;
  if (typeof parentContractId === 'string' && parentContractId) {
    await openAddendum(parentContractId);
    await router.replace({ name: 'SupplierContract' });
  }
});
</script>

<style scoped lang="scss">

.supplier-create-button {
  height: 40px;
  padding: 0 18px;
  font-weight: 800;
  border-radius: 10px;
}

.supplier-kpi-grid {
  margin-bottom: 16px;
}

.supplier-filter-card {
  margin-bottom: 16px;
}

.supplier-filter-card :deep(.el-card__body) {
  padding: 14px 18px;
}

.supplier-filter-card :deep(.art-search-bar) {
  padding: 0;
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

.contract-supplier-container :deep(.el-date-editor.el-input__wrapper) {
  box-sizing: border-box;
  width: 100% !important;
}

.supplier-table-card :deep(.el-card__body) {
  padding: 18px 20px;
}

.supplier-table-heading {
  display: flex;
  flex-direction: column;
  gap: 3px;
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
  border-bottom: 1px solid rgb(0 0 0 / 8%);
}

.supplier-operation-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: nowrap;
  width: 100%;
}

.supplier-operation-icon {
  margin-right: 0 !important;
}

.supplier-name-cell {
  display: block;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.border-l {
  border-left: 1px solid rgb(0 0 0 / 12%);
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

html.dark .contract-supplier-container {
  min-height: 100vh;
  color: #f8fafc;
  background: #050506;
}

html.dark .supplier-kpi-grid :deep(.art-card) {
  min-height: 128px;
  color: #f8fafc;
  background: #161618;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .supplier-kpi-grid :deep(.art-card .text-g-900),
html.dark .supplier-kpi-grid :deep(.art-card .text-g-800),
html.dark .supplier-kpi-grid :deep(.art-card .text-g-700),
html.dark .supplier-kpi-grid :deep(.art-card .text-g-600),
html.dark .supplier-kpi-grid :deep(.art-card .text-g-500),
html.dark .supplier-kpi-grid :deep(.art-card p),
html.dark .supplier-table-card :deep(.el-table),
html.dark .supplier-table-card :deep(.el-table .cell),
html.dark .supplier-table-card :deep(.el-table th.el-table__cell),
html.dark .supplier-table-card :deep(.el-table td.el-table__cell),
html.dark .supplier-table-card :deep(.el-pagination),
html.dark .supplier-table-card :deep(.el-pagination *) {
  color: #f8fafc !important;
  opacity: 1 !important;
}

html.dark .supplier-table-card.art-table-card {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .supplier-filter-card {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .supplier-filter-card :deep(.el-card__body) {
  padding: 14px 18px !important;
}

html.dark .contract-supplier-container :deep(.el-input__wrapper),
html.dark .contract-supplier-container :deep(.el-select__wrapper) {
  color: #f8fafc;
  background: #101114 !important;
  border-color: rgb(255 255 255 / 14%) !important;
  box-shadow: none;
}

html.dark .contract-supplier-container :deep(.art-search-bar .el-form-item__label),
html.dark .contract-supplier-container :deep(.el-input__inner),
html.dark .contract-supplier-container :deep(.el-select__placeholder),
html.dark .contract-supplier-container :deep(.el-select__selected-item),
html.dark .contract-supplier-container :deep(.el-select__caret),
html.dark .contract-supplier-container :deep(.el-range-input),
html.dark .contract-supplier-container :deep(.el-range-separator) {
  color: #f8fafc !important;
  background: transparent !important;
}

html.dark .supplier-table-card :deep(#art-table-header) {
  border-bottom: 1px solid rgb(255 255 255 / 9%);
}

html.dark .supplier-table-card :deep(#art-table-header .button) {
  color: #cbd5e1;
  background: #202126;
  border: 1px solid rgb(255 255 255 / 9%);
}

html.dark .supplier-table-card :deep(.el-table th.el-table__cell) {
  background: #111214;
}

html.dark .supplier-table-card :deep(.el-table__empty-block) {
  background: #161618;
}

html.dark .contract-supplier-container .text-gray-400,
html.dark .contract-supplier-container .text-gray-500,
html.dark .contract-supplier-container .text-gray-600,
html.dark .contract-supplier-container .text-gray-800,
html.dark .contract-supplier-container .text-gray-900 {
  color: #f8fafc !important;
}

html.dark .border-l {
  border-left: 1px solid rgb(255 255 255 / 14%);
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

:global(.contract-supplier-dialog .contract-file-upload .el-upload),
:global(.contract-supplier-dialog .contract-file-upload .el-upload-dragger) {
  width: 100%;
}

:global(.contract-supplier-dialog .contract-upload-preview) {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 190px;
  padding: 12px;
}

:global(.contract-supplier-dialog .contract-upload-preview img) {
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
  border-radius: 10px;
}

:global(.contract-supplier-dialog .contract-upload-preview .preview-hint) {
  font-size: 12px;
  color: #94a3b8;
}

:global(.contract-supplier-dialog .contract-upload-filebar) {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  margin-top: 8px;
  border-radius: 8px;
}
</style>
