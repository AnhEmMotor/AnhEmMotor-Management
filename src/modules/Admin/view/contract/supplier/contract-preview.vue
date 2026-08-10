<template>
  <div v-loading="loading" class="resp-page reporting-page supplier-contract-detail">
    <ReportPageHeader
      title="Chi tiết hợp đồng nhà cung cấp"
      description="Kiểm tra điều khoản thương mại, hiệu lực, bảng giá và chứng từ gốc của hợp đồng."
      icon="ri:file-contract-line"
    >
      <template #actions>
        <ElButton :disabled="!contract.id" @click="handlePrint">
          <ElIcon><Printer /></ElIcon>
          In thông tin
        </ElButton>
        <ElButton
          v-if="contract.status === 'Draft' || contract.status === 'PendingApproval'"
          type="success"
          :loading="approvingContract"
          @click="handleApproveContract"
        >
          <ElIcon><Check /></ElIcon>
          Duyệt hợp đồng
        </ElButton>
        <ElButton v-if="contract.status === 'Active'" type="warning" @click="handleCreateAddendum">
          <ElIcon><Plus /></ElIcon>
          Tạo phụ lục
        </ElButton>
        <ElButton @click="goBack">
          <ElIcon><Back /></ElIcon>
          Quay lại
        </ElButton>
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid supplier-contract-kpi-grid">
      <ArtStatsCard
        title="Số hợp đồng"
        :count="contract.contractNumber || '-'"
        description="Mã hồ sơ đang xem"
        icon="ri:hashtag"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Nhà cung cấp"
        :count="supplierName"
        description="Đối tác ký kết"
        icon="ri:truck-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Giá trị hợp đồng"
        :count="formatCurrency(contract.contractValue)"
        description="Giá trị thương mại"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Trạng thái pháp lý"
        :count="getStatusLabel(contract.status)"
        :description="expirationSummary"
        icon="ri:shield-check-line"
        icon-style="bg-report-gray"
      />
    </div>

    <ElCard shadow="never" class="pipeline-card reporting-card">
      <div class="pipeline-card__heading">
        <div>
          <strong>Vòng đời hợp đồng</strong>
          <span>Theo dõi tiến độ từ bản nháp đến khi hoàn tất</span>
        </div>
        <ElTag :type="contractStatusType" effect="light">
          {{ getStatusLabel(contract.status) }}
        </ElTag>
      </div>
      <div class="pipeline-scroll">
        <div class="pipeline-steps">
          <div class="pipeline-track"></div>
          <div
            class="pipeline-track pipeline-track--active"
            :style="{ width: `${activeStep * 25}%` }"
          ></div>
          <div v-for="(step, index) in lifecycleSteps" :key="step.status" class="pipeline-step">
            <span
              class="pipeline-step__circle"
              :class="{
                'pipeline-step__circle--done': index < activeStep,
                'pipeline-step__circle--active': index === activeStep,
              }"
            >
              <ElIcon v-if="index < activeStep"><Check /></ElIcon>
              <span v-else>{{ index + 1 }}</span>
            </span>
            <strong>{{ step.label }}</strong>
            <small>{{ step.description }}</small>
          </div>
        </div>
      </div>
    </ElCard>

    <ElAlert
      v-if="showExpirationAlert"
      :type="daysUntilExpiry != null && daysUntilExpiry < 0 ? 'error' : 'warning'"
      :closable="false"
      show-icon
      class="expiration-alert"
      :title="expirationAlertTitle"
      :description="expirationAlertDescription"
    />

    <div class="supplier-contract-print-area">
      <ElRow :gutter="16" class="supplier-contract-layout">
        <ElCol :xs="24" :sm="24" :md="15">
          <div class="supplier-contract-main-column">
            <ElCard shadow="never" class="reporting-card detail-card">
              <template #header>
                <div class="detail-card__header">
                  <ElIcon><Document /></ElIcon>
                  <span>Thông tin hợp đồng</span>
                </div>
              </template>
              <dl class="detail-grid">
                <div class="detail-field">
                  <dt>Số hợp đồng</dt>
                  <dd class="tabular-value">
                    {{ contract.contractNumber || '-' }}
                  </dd>
                </div>
                <div class="detail-field">
                  <dt>Nhà cung cấp</dt>
                  <dd>{{ supplierName }}</dd>
                </div>
                <div class="detail-field">
                  <dt>Ngày hiệu lực</dt>
                  <dd>{{ formatDate(contract.effectiveDate) }}</dd>
                </div>
                <div class="detail-field">
                  <dt>Ngày hết hạn</dt>
                  <dd>
                    {{
                      contract.expirationDate
                        ? formatDate(contract.expirationDate)
                        : 'Không xác định'
                    }}
                  </dd>
                </div>
                <div class="detail-field">
                  <dt>Giá trị hợp đồng</dt>
                  <dd class="detail-field__accent tabular-value">
                    {{ formatCurrency(contract.contractValue) }}
                  </dd>
                </div>
                <div class="detail-field">
                  <dt>Hợp đồng gốc</dt>
                  <dd>
                    {{ contract.parentContractId ? 'Phụ lục hợp đồng' : 'Hợp đồng chính' }}
                  </dd>
                </div>
              </dl>
            </ElCard>

            <ElCard shadow="never" class="reporting-card detail-card">
              <template #header>
                <div class="detail-card__header">
                  <ElIcon><Wallet /></ElIcon>
                  <span>Điều khoản thương mại</span>
                </div>
              </template>
              <dl class="detail-grid">
                <div class="detail-field">
                  <dt>Hạn mức công nợ</dt>
                  <dd class="tabular-value">
                    {{ formatOptionalCurrency(contract.creditLimit) }}
                  </dd>
                </div>
                <div class="detail-field">
                  <dt>Hạn thanh toán</dt>
                  <dd>
                    {{
                      contract.paymentWindowDays != null
                        ? `${contract.paymentWindowDays} ngày`
                        : '-'
                    }}
                  </dd>
                </div>
                <div class="detail-field">
                  <dt>Chiết khấu</dt>
                  <dd>
                    {{ contract.discountRate != null ? `${contract.discountRate}%` : '-' }}
                  </dd>
                </div>
                <div class="detail-field">
                  <dt>Sản lượng tối thiểu/tháng</dt>
                  <dd class="tabular-value">
                    {{
                      contract.minimumVolumePerMonth != null
                        ? formatNumber(contract.minimumVolumePerMonth)
                        : '-'
                    }}
                  </dd>
                </div>
                <div class="detail-field">
                  <dt>Ngân hàng</dt>
                  <dd>{{ contract.bankName || '-' }}</dd>
                </div>
                <div class="detail-field">
                  <dt>Số tài khoản</dt>
                  <dd class="tabular-value">
                    {{ contract.bankAccountNumber || '-' }}
                  </dd>
                </div>
              </dl>
              <ElDivider />
              <div class="contract-copy-grid">
                <section>
                  <h4>Điều khoản chính</h4>
                  <p>{{ contract.terms || 'Chưa cập nhật điều khoản.' }}</p>
                </section>
                <section>
                  <h4>Ghi chú nội bộ</h4>
                  <p>{{ contract.note || 'Chưa có ghi chú.' }}</p>
                </section>
              </div>
            </ElCard>

            <ElCard shadow="never" class="reporting-card detail-card sku-card">
              <template #header>
                <div class="detail-card__header detail-card__header--spread">
                  <div>
                    <ElIcon><Goods /></ElIcon>
                    <span>Bảng giá nhập sỉ</span>
                  </div>
                  <ElInput
                    v-model="skuSearch"
                    placeholder="Tìm SKU hoặc sản phẩm"
                    clearable
                    size="small"
                    class="sku-search"
                  >
                    <template #prefix>
                      <ElIcon><Search /></ElIcon>
                    </template>
                  </ElInput>
                </div>
              </template>
              <ElTable
                :data="filteredSkuList"
                border
                stripe
                size="small"
                empty-text="Chưa có dữ liệu bảng giá sỉ"
              >
                <ElTableColumn
                  prop="skuCode"
                  label="Mã SKU"
                  min-width="120"
                  align="center"
                  header-align="center"
                />
                <ElTableColumn
                  prop="productName"
                  label="Tên sản phẩm"
                  min-width="180"
                  align="center"
                  header-align="center"
                />
                <ElTableColumn
                  prop="category"
                  label="Danh mục"
                  min-width="140"
                  align="center"
                  header-align="center"
                />
                <ElTableColumn
                  prop="wholesalePrice"
                  label="Giá nhập sỉ"
                  min-width="145"
                  align="right"
                  header-align="center"
                >
                  <template #default="{ row }">
                    <span class="tabular-value">{{ formatCurrency(row.wholesalePrice) }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  prop="moq"
                  label="MOQ"
                  width="90"
                  align="center"
                  header-align="center"
                >
                  <template #default="{ row }">{{ row.moq ?? '-' }}</template>
                </ElTableColumn>
              </ElTable>
            </ElCard>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="24" :md="9">
          <aside class="supplier-contract-side-column">
            <ElCard shadow="never" class="reporting-card detail-card">
              <template #header>
                <div class="detail-card__header">
                  <ElIcon><OfficeBuilding /></ElIcon>
                  <span>Thông tin nhà cung cấp</span>
                </div>
              </template>
              <dl class="supplier-profile">
                <div>
                  <dt>Tên nhà cung cấp</dt>
                  <dd>{{ supplierName }}</dd>
                </div>
                <div>
                  <dt>Mã số thuế / Mã NCC</dt>
                  <dd>{{ contract.supplierCode || '-' }}</dd>
                </div>
                <div>
                  <dt>Người liên hệ</dt>
                  <dd>{{ supplierContactInfo.name }}</dd>
                </div>
                <div>
                  <dt>Điện thoại</dt>
                  <dd>{{ supplierContactInfo.phone }}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{{ supplierContactInfo.email }}</dd>
                </div>
                <div>
                  <dt>Địa chỉ</dt>
                  <dd>{{ contract.supplierAddress || '-' }}</dd>
                </div>
              </dl>
            </ElCard>

            <ElCard shadow="never" class="reporting-card detail-card file-card">
              <template #header>
                <div class="detail-card__header">
                  <ElIcon><Paperclip /></ElIcon>
                  <span>Chứng từ hợp đồng</span>
                </div>
              </template>
              <div v-if="contract.contractFilePath" class="file-summary">
                <span class="file-summary__icon">
                  <ElIcon><Document /></ElIcon>
                </span>
                <div>
                  <strong>{{ contractFileInfo.name }}</strong>
                  <small>File hợp đồng đã lưu trên hệ thống</small>
                </div>
              </div>
              <ElEmpty v-else description="Chưa có file hợp đồng" :image-size="64" />
              <div class="file-actions">
                <ElButton
                  v-if="contract.contractFilePath"
                  type="primary"
                  plain
                  @click="handleViewFile"
                >
                  Xem file
                </ElButton>
                <ElButton v-if="contract.contractFilePath" plain @click="handleDownloadFile">
                  Tải xuống
                </ElButton>
                <ElUpload
                  :http-request="customUploadRequest"
                  :before-upload="validateContractFile"
                  :show-file-list="false"
                  :disabled="uploadingFile"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                >
                  <ElButton :loading="uploadingFile" type="primary">
                    {{ contract.contractFilePath ? 'Thay file' : 'Tải file lên' }}
                  </ElButton>
                </ElUpload>
              </div>
            </ElCard>

            <ElCard shadow="never" class="reporting-card detail-card">
              <template #header>
                <div class="detail-card__header">
                  <ElIcon><Operation /></ElIcon>
                  <span>Thao tác hợp đồng</span>
                </div>
              </template>
              <div class="detail-actions">
                <ElButton v-if="canEditStatus" type="primary" @click="openStatusDialog">
                  Cập nhật trạng thái
                </ElButton>
                <ElButton
                  v-if="contract.status === 'Active'"
                  type="warning"
                  @click="handleCreateAddendum"
                >
                  Tạo phụ lục hợp đồng
                </ElButton>
                <ElButton v-if="canSoftDelete" type="danger" plain @click="handleSoftDelete">
                  Xóa hợp đồng
                </ElButton>
              </div>
              <div class="record-timestamps">
                <span>Tạo lúc {{ formatDateTime(contract.createdAt) }}</span>
                <span>Cập nhật {{ formatDateTime(contract.updatedAt) }}</span>
              </div>
            </ElCard>

            <ElCard shadow="never" class="reporting-card detail-card audit-card">
              <template #header>
                <div class="detail-card__header">
                  <ElIcon><Clock /></ElIcon>
                  <span>Nhật ký thay đổi</span>
                </div>
              </template>
              <ElTimeline v-if="auditLogs.length">
                <ElTimelineItem
                  v-for="log in auditLogs"
                  :key="log.id"
                  :timestamp="formatDateTime(log.createdAt)"
                  placement="top"
                >
                  <strong>{{ getAuditActionLabel(log.action) }}</strong>
                  <p>{{ log.details || 'Không có mô tả chi tiết.' }}</p>
                  <small v-if="log.changedBy">Thực hiện bởi {{ log.changedBy }}</small>
                </ElTimelineItem>
              </ElTimeline>
              <ElEmpty v-else description="Chưa có nhật ký" :image-size="64" />
            </ElCard>
          </aside>
        </ElCol>
      </ElRow>
    </div>

    <ElDialog
      v-model="showStatusDialog"
      title="Cập nhật trạng thái hợp đồng"
      width="420px"
      class="supplier-contract-preview-dialog"
      append-to-body
    >
      <ElForm label-position="top">
        <ElFormItem label="Trạng thái hiện tại">
          <ElTag :type="contractStatusType">{{ getStatusLabel(contract.status) }}</ElTag>
        </ElFormItem>
        <ElFormItem label="Chuyển sang">
          <ElSelect v-model="newStatus" class="w-full" placeholder="Chọn trạng thái">
            <ElOption
              v-for="status in allowedStatusTransitions"
              :key="status"
              :label="getStatusLabel(status)"
              :value="status"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showStatusDialog = false">Hủy</ElButton>
        <ElButton
          type="primary"
          :loading="updatingStatus"
          :disabled="!newStatus"
          @click="handleUpdateStatus"
        >
          Xác nhận
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type UploadRequestOptions } from 'element-plus';
import {
  Back,
  Check,
  Clock,
  Document,
  Goods,
  OfficeBuilding,
  Operation,
  Paperclip,
  Plus,
  Printer,
  Search,
  Wallet,
} from '@element-plus/icons-vue';
import ReportPageHeader from '@/modules/Accountant/view/reporting/ReportPageHeader.vue';
import type {
  SupplierContractAuditLogDto,
  SupplierContractDto,
  SupplierContractSkuItem,
  SupplierContractStatus,
} from '@/domain/supplier/contract.types';
import { createSupplierContractUseCases } from '@/infrastructure/supplier/usecasesFactory';

defineOptions({ name: 'ContractSupplierPreview' });

const usecases = createSupplierContractUseCases();
const route = useRoute();
const router = useRouter();

const contract = ref<SupplierContractDto>({
  id: '',
  contractNumber: '',
  effectiveDate: '',
  contractValue: 0,
  status: 'Draft',
});
const auditLogs = ref<SupplierContractAuditLogDto[]>([]);
const skuSearch = ref('');
const loading = ref(false);
const uploadingFile = ref(false);
const updatingStatus = ref(false);
const approvingContract = ref(false);
const showStatusDialog = ref(false);
const newStatus = ref<SupplierContractStatus>();

const lifecycleSteps = [
  { status: 'Draft', label: 'Bản nháp', description: 'Hoàn thiện nội dung' },
  {
    status: 'PendingApproval',
    label: 'Chờ duyệt',
    description: 'Kiểm tra điều khoản',
  },
  { status: 'Active', label: 'Hiệu lực', description: 'Đang áp dụng' },
  { status: 'Completed', label: 'Hoàn tất', description: 'Đã kết thúc' },
] as const;

const statusTransitions: Record<SupplierContractStatus, SupplierContractStatus[]> = {
  Draft: ['PendingApproval', 'Terminated'],
  PendingApproval: ['Draft', 'Active', 'Terminated'],
  Active: ['Completed', 'Expired', 'Terminated'],
  Expired: ['Completed', 'Terminated'],
  Terminated: [],
  Completed: [],
};

const activeStep = computed(() => {
  if (contract.value.status === 'Draft') return 0;
  if (contract.value.status === 'PendingApproval') return 1;
  if (contract.value.status === 'Active') return 2;
  return 3;
});

const contractStatusType = computed(() => {
  if (contract.value.status === 'Active' || contract.value.status === 'Completed') {
    return 'success';
  }
  if (contract.value.status === 'PendingApproval') return 'warning';
  if (contract.value.status === 'Expired' || contract.value.status === 'Terminated') {
    return 'danger';
  }
  return 'info';
});

const supplierName = computed(() => contract.value.supplierName?.trim() || 'Chưa xác định');

const supplierContactInfo = computed(() => ({
  name: contract.value.supplierContactName?.trim() || contract.value.supplierName?.trim() || '-',
  phone: contract.value.supplierPhone?.trim() || '-',
  email: contract.value.supplierEmail?.trim() || '-',
}));

const skuList = computed<SupplierContractSkuItem[]>(() => contract.value.skuPriceList ?? []);

const filteredSkuList = computed(() => {
  const keyword = skuSearch.value.trim().toLocaleLowerCase('vi-VN');
  if (!keyword) return skuList.value;
  return skuList.value.filter((item) =>
    [item.skuCode, item.productName, item.category].some((value) =>
      value?.toLocaleLowerCase('vi-VN').includes(keyword)
    )
  );
});

const daysUntilExpiry = computed<number | null>(() => {
  if (!contract.value.expirationDate) return null;
  const expiry = new Date(contract.value.expirationDate);
  if (Number.isNaN(expiry.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
});

const showExpirationAlert = computed(
  () => daysUntilExpiry.value != null && daysUntilExpiry.value <= 30
);

const expirationSummary = computed(() => {
  if (daysUntilExpiry.value == null) return 'Không giới hạn ngày hết hạn';
  if (daysUntilExpiry.value < 0) return `Quá hạn ${Math.abs(daysUntilExpiry.value)} ngày`;
  if (daysUntilExpiry.value === 0) return 'Hết hạn hôm nay';
  return `Còn ${daysUntilExpiry.value} ngày hiệu lực`;
});

const expirationAlertTitle = computed(() =>
  daysUntilExpiry.value != null && daysUntilExpiry.value < 0
    ? 'Hợp đồng đã hết hạn'
    : 'Hợp đồng sắp hết hạn'
);

const expirationAlertDescription = computed(() => {
  if (daysUntilExpiry.value == null) return '';
  if (daysUntilExpiry.value < 0) {
    return `Hợp đồng đã quá hạn ${Math.abs(daysUntilExpiry.value)} ngày. Hãy cập nhật trạng thái hoặc tạo phụ lục nếu tiếp tục hợp tác.`;
  }
  return `Còn ${daysUntilExpiry.value} ngày đến hạn. Hãy rà soát điều khoản và chuẩn bị phụ lục khi cần gia hạn.`;
});

const allowedStatusTransitions = computed(() => statusTransitions[contract.value.status] ?? []);
const canEditStatus = computed(() => allowedStatusTransitions.value.length > 0);
const canSoftDelete = computed(() => contract.value.status !== 'Active');

const contractFileInfo = computed(() => {
  const path = contract.value.contractFilePath;
  if (!path) return { name: '', url: '' };
  const cleanPath = path.split('?')[0];
  const encodedName = cleanPath.split('/').pop() || cleanPath.split('\\').pop();
  let name = encodedName || 'hop-dong-nha-cung-cap';
  try {
    name = decodeURIComponent(name);
  } catch {
    // Keep the server-provided filename when it is not URI encoded.
  }
  return { name, url: path };
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    Draft: 'Nháp',
    PendingApproval: 'Chờ phê duyệt',
    Active: 'Đang hiệu lực',
    Expired: 'Đã hết hạn',
    Terminated: 'Đã thanh lý',
    Completed: 'Đã hoàn thành',
  };
  return labels[status] || status;
};

const getAuditActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    Create: 'Tạo hợp đồng',
    Update: 'Cập nhật nội dung',
    StatusChange: 'Đổi trạng thái',
    Delete: 'Xóa hợp đồng',
  };
  return labels[action] || action;
};

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatOptionalCurrency = (value?: number) => (value == null ? '-' : formatCurrency(value));

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('vi-VN');
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('vi-VN');
};

const validateContractFile = (file: File) => {
  if (!/\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name)) {
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
  if (!contract.value.id) {
    options.onError(createUploadError('Thiếu mã hợp đồng'));
    return;
  }
  uploadingFile.value = true;
  try {
    const response = await usecases.uploadContractFile.execute(
      contract.value.id,
      options.file as File
    );
    contract.value.contractFilePath = response.contractFilePath;
    ElMessage.success('Đã lưu file hợp đồng.');
    options.onSuccess(response);
  } catch {
    ElMessage.error('Không thể tải file hợp đồng lên.');
    options.onError(createUploadError('Tải file hợp đồng thất bại'));
  } finally {
    uploadingFile.value = false;
  }
};

const handleViewFile = () => {
  if (contractFileInfo.value.url) {
    window.open(contractFileInfo.value.url, '_blank', 'noopener,noreferrer');
  }
};

const handleDownloadFile = () => {
  if (!contractFileInfo.value.url) return;
  const link = document.createElement('a');
  link.href = contractFileInfo.value.url;
  link.download = contractFileInfo.value.name;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const openStatusDialog = () => {
  newStatus.value = undefined;
  showStatusDialog.value = true;
};

const handleUpdateStatus = async () => {
  if (!newStatus.value || !contract.value.id) return;
  updatingStatus.value = true;
  try {
    await usecases.updateStatus.execute(contract.value.id, newStatus.value);
    ElMessage.success('Đã cập nhật trạng thái hợp đồng.');
    showStatusDialog.value = false;
    await fetchDetail();
  } catch {
    ElMessage.error('Không thể cập nhật trạng thái hợp đồng.');
  } finally {
    updatingStatus.value = false;
  }
};

const handleApproveContract = async () => {
  if (!contract.value.id) return;
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn duyệt hợp đồng "${contract.value.contractNumber}"?`,
      'Xác nhận duyệt',
      {
        confirmButtonText: 'Duyệt',
        cancelButtonText: 'Hủy',
        type: 'success',
      }
    );
    approvingContract.value = true;
    await usecases.updateStatus.execute(contract.value.id, 'Active');
    ElMessage.success('Đã duyệt hợp đồng thành công.');
    await fetchDetail();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('Không thể duyệt hợp đồng.');
    }
  } finally {
    approvingContract.value = false;
  }
};

const handleSoftDelete = async () => {
  if (!contract.value.id) return;
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa hợp đồng "${contract.value.contractNumber}"?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    );
    await usecases.delete.execute(contract.value.id);
    ElMessage.success('Đã xóa hợp đồng.');
    await router.push({ name: 'SupplierContract' });
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('Không thể xóa hợp đồng.');
    }
  }
};

const handleCreateAddendum = () => {
  if (!contract.value.id) return;
  router.push({
    name: 'SupplierContract',
    query: { parentContractId: contract.value.id },
  });
};

const handlePrint = () => window.print();
const goBack = () => router.push({ name: 'SupplierContract' });

const fetchDetail = async () => {
  const id = route.params.id;
  if (typeof id !== 'string' || !id) {
    ElMessage.error('Mã hợp đồng không hợp lệ.');
    return;
  }
  loading.value = true;
  try {
    const [detail, logs] = await Promise.all([
      usecases.getContractDetail.execute(id),
      usecases.getAuditLogs.execute(id),
    ]);
    contract.value = detail;
    auditLogs.value = logs.length ? logs : (detail.auditLogs ?? []);
  } catch {
    ElMessage.error('Không thể tải chi tiết hợp đồng nhà cung cấp.');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetail);
</script>

<style scoped lang="scss">
.supplier-contract-detail {
  min-height: 100%;
  padding: 12px;
  color: var(--el-text-color-primary);
}

.supplier-contract-detail :deep(.el-card) {
  color: var(--el-text-color-primary);
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color-light);
  box-shadow: none;
}

.supplier-contract-detail :deep(.el-card__header) {
  color: var(--el-text-color-primary);
  border-color: var(--el-border-color-light);
}

.supplier-contract-kpi-grid {
  margin-bottom: 16px;
}

.bg-report-red {
  background-color: #e84a4a !important;
}

.bg-report-gray {
  background-color: var(--el-fill-color-dark) !important;
}

.pipeline-card {
  margin-bottom: 16px;
}

.pipeline-card :deep(.el-card__body) {
  padding: 14px 16px 16px;
}

.pipeline-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.pipeline-card__heading > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pipeline-card__heading strong {
  font-size: 14px;
}

.pipeline-card__heading span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pipeline-scroll {
  overflow-x: auto;
}

.pipeline-steps {
  position: relative;
  display: flex;
  min-width: 520px;
}

.pipeline-track {
  position: absolute;
  top: 16px;
  right: 12.5%;
  left: 12.5%;
  z-index: 0;
  height: 2px;
  background-color: var(--el-border-color);
}

.pipeline-track--active {
  right: auto;
  max-width: 75%;
  background-color: #e84a4a;
  transition: width 240ms ease;
}

.pipeline-step {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
  text-align: center;
}

.pipeline-step__circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  background-color: var(--el-fill-color-light);
  border: 2px solid var(--el-border-color);
  border-radius: 50%;
}

.pipeline-step__circle--done {
  color: #e84a4a;
  background-color: var(--el-fill-color-blank);
  border-color: #e84a4a;
}

.pipeline-step__circle--active {
  color: #fff;
  background-color: #e84a4a;
  border-color: #e84a4a;
  box-shadow: 0 0 0 3px rgb(232 74 74 / 20%);
}

.pipeline-step strong {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.pipeline-step small {
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.expiration-alert {
  margin-bottom: 16px;
}

.supplier-contract-layout {
  row-gap: 16px;
}

.supplier-contract-main-column,
.supplier-contract-side-column {
  display: grid;
  gap: 16px;
}

.detail-card__header,
.detail-card__header > div {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
}

.detail-card__header .el-icon {
  color: #e84a4a;
}

.detail-card__header--spread {
  justify-content: space-between;
  gap: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin: 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-left: 1px solid var(--el-border-color-lighter);
}

.detail-field {
  min-width: 0;
  padding: 10px 12px;
  border-right: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-field dt,
.supplier-profile dt {
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.detail-field dd,
.supplier-profile dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-field__accent {
  color: #e84a4a !important;
}

.tabular-value {
  font-variant-numeric: tabular-nums;
}

.contract-copy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.contract-copy-grid section {
  min-width: 0;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.contract-copy-grid h4 {
  margin: 0 0 6px;
  font-size: 12px;
}

.contract-copy-grid p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}

.sku-search {
  width: min(260px, 42vw);
}

.sku-card :deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-tr-bg-color: var(--el-bg-color);
  --el-table-row-hover-bg-color: var(--el-fill-color-light);

  color: var(--el-text-color-primary);
}

.supplier-profile {
  display: grid;
  gap: 10px;
  margin: 0;
}

.supplier-profile > div {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.supplier-profile > div:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.file-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.file-summary__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #e84a4a;
  background-color: rgb(232 74 74 / 10%);
  border-radius: 8px;
}

.file-summary > div {
  min-width: 0;
}

.file-summary strong,
.file-summary small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-summary strong {
  font-size: 12px;
}

.file-summary small {
  margin-top: 3px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.file-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.file-actions :deep(.el-button) {
  margin-left: 0;
}

.detail-actions {
  display: grid;
  gap: 8px;
}

.detail-actions :deep(.el-button) {
  width: 100%;
  margin-left: 0;
}

.record-timestamps {
  display: grid;
  gap: 4px;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-lighter);
}

.audit-card :deep(.el-card__body) {
  max-height: 380px;
  overflow-y: auto;
}

.audit-card :deep(.el-timeline) {
  padding-left: 4px;
}

.audit-card :deep(.el-timeline-item__timestamp),
.audit-card small {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

.audit-card strong {
  font-size: 12px;
}

.audit-card p {
  margin: 4px 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

:global(.supplier-contract-preview-dialog.el-dialog) {
  color: var(--el-text-color-primary);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

:global(html.dark .supplier-contract-detail .el-card) {
  background-color: #151619;
  border-color: rgb(255 255 255 / 12%);
}

:global(html.dark .supplier-contract-detail .el-card__header) {
  color: #f8fafc;
  border-color: rgb(255 255 255 / 12%);
}

:global(html.dark .supplier-contract-detail .el-table) {
  --el-table-border-color: rgb(255 255 255 / 12%);
  --el-table-header-bg-color: #111214;
  --el-table-tr-bg-color: #151619;
  --el-table-row-hover-bg-color: #202227;
}

:global(html.dark .supplier-contract-detail .el-input__wrapper),
:global(html.dark .supplier-contract-detail .el-select__wrapper),
:global(html.dark .supplier-contract-preview-dialog .el-select__wrapper) {
  background-color: #101114;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 14%) inset;
}

:global(html.dark .supplier-contract-detail .el-input__inner),
:global(html.dark .supplier-contract-preview-dialog .el-select__selected-item),
:global(html.dark .supplier-contract-preview-dialog .el-form-item__label),
:global(html.dark .supplier-contract-preview-dialog .el-dialog__title) {
  color: #f8fafc;
}

:global(html.dark .supplier-contract-preview-dialog.el-dialog) {
  background-color: #151619;
  border-color: rgb(255 255 255 / 12%);
}

@media (width <= 768px) {
  .supplier-contract-detail {
    padding: 8px;
  }

  .detail-grid,
  .contract-copy-grid {
    grid-template-columns: 1fr;
  }

  .detail-card__header--spread {
    align-items: flex-start;
    flex-direction: column;
  }

  .sku-search {
    width: 100%;
  }

  .file-actions,
  .file-actions :deep(.el-upload),
  .file-actions :deep(.el-button) {
    width: 100%;
  }
}

@media print {
  :global(body *) {
    visibility: hidden !important;
  }

  .supplier-contract-print-area,
  .supplier-contract-print-area * {
    visibility: visible !important;
  }

  .supplier-contract-print-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    color: #000 !important;
    background: #fff !important;
  }

  .supplier-contract-print-area :deep(.el-card) {
    color: #000 !important;
    background: #fff !important;
    break-inside: avoid;
  }

  .file-actions,
  .detail-actions,
  .audit-card {
    display: none !important;
  }
}
</style>
