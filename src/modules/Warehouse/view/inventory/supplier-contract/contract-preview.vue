<template>
  <div class="resp-page contract-preview-container">
    <ReportPageHeader
      title="Chi tiết hợp đồng nhà cung cấp"
      description="Kiểm tra thông tin điều khoản, công nợ, in bảng lưu trữ."
      icon="ri:file-text-line"
    >
      <template #actions>
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon> Quay lại
        </el-button>
        <el-button
          v-if="canPrintContract"
          @click="handlePrint"
          v-auth="'Permissions.Accountant.SupplierContractManagement.View'"
        >
          <el-icon><Printer /></el-icon> In hợp đồng
        </el-button>
        <el-button
          v-if="contractData.status === 'Draft'"
          type="primary"
          @click="handleSaveDraft"
          v-auth="'Permissions.Accountant.SupplierContractManagement.Edit'"
        >
          <el-icon><Document /></el-icon> Lưu thông tin
        </el-button>
        <el-button
          v-if="contractData.status === 'Draft'"
          type="warning"
          :loading="isUpdatingStatus"
          @click="handleUpdateStatus('PendingApproval')"
          v-auth="'Permissions.Accountant.SupplierContractManagement.Edit'"
        >
          <el-icon><Promotion /></el-icon> Gửi duyệt
        </el-button>
        <el-button
          v-if="contractData.status === 'PendingApproval'"
          type="success"
          :loading="isUpdatingStatus"
          @click="handleUpdateStatus('Active')"
          v-auth="'Permissions.Accountant.SupplierContractManagement.Edit'"
        >
          <el-icon><Check /></el-icon> Duyệt hợp đồng
        </el-button>
        <el-button
          v-if="contractData.status === 'Active'"
          type="danger"
          :loading="isUpdatingStatus"
          @click="handleUpdateStatus('Completed')"
          v-auth="'Permissions.Accountant.SupplierContractManagement.Edit'"
        >
          <el-icon><CircleCheck /></el-icon> Hoàn tất hợp đồng
        </el-button>
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid mb-4">
      <ArtStatsCard
        title="Nhà cung cấp"
        :count="contractData.supplierName || 'Chưa xác định'"
        :description="contractData.contractNumber || 'Chưa có số hợp đồng'"
        icon="ri:team-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Giá trị hợp đồng"
        :count="formatCurrency(contractData.contractValue)"
        description="Tổng giá trị thỏa thuận"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Hạn mức công nợ"
        :count="formatCurrency(contractData.creditLimit || 0)"
        description="Số tiền nợ tối đa"
        icon="ri:wallet-3-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Trạng thái hợp đồng"
        :count="getStatusLabel(contractData.status)"
        description="Theo dõi vòng đời hợp đồng"
        icon="ri:shield-check-line"
        icon-style="bg-report-gray"
      />
    </div>

    <el-card shadow="never" class="mb-4 pipeline-card">
      <div class="text-sm text-gray-500 mb-4 font-medium">Trạng thái vòng đời hợp đồng</div>

      <div class="pipeline-steps-wrapper relative flex w-full">
        <div class="pipeline-track-bg absolute top-4 left-[12.5%] right-[12.5%] h-0.5 z-0"></div>
        <div
          class="pipeline-track-active absolute top-4 left-[12.5%] h-0.5 z-0 transition-all duration-700"
          :style="{
            width: `${activeStep * 25}%`,
          }"
        ></div>

        <div
          v-for="(step, index) in lifecycleSteps"
          :key="index"
          class="flex-1 flex flex-col items-center relative z-10"
        >
          <div
            class="step-circle w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300"
            :class="[
              activeStep > index ? 'step-circle--done' : '',
              activeStep === index ? 'step-circle--active' : '',
              activeStep < index ? 'step-circle--pending' : '',
            ]"
          >
            <el-icon v-if="activeStep > index"><Check /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div
            class="step-label mt-2 text-center text-sm px-1 w-full"
            :class="activeStep >= index ? 'step-label--active' : 'step-label--inactive'"
          >
            {{ step.label }}
          </div>
          <div class="step-desc text-xs mt-1 text-center px-2 w-full">
            {{ step.desc }}
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="contract-document-layout">
      <el-col :xs="24" :sm="24" :md="10">
        <el-card shadow="never" class="form-card reporting-card mb-4">
          <template #header>
            <div class="card-header font-bold flex items-center gap-2">
              <el-icon class="text-report-red"><EditPen /></el-icon>
              Thông tin thanh toán & Điều khoản
            </div>
          </template>

          <el-form label-position="top" :disabled="isContractLocked">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Tài khoản ngân hàng">
                  <el-input
                    v-model="contractData.bankAccountNumber"
                    placeholder="Nhập số tài khoản..."
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tên ngân hàng">
                  <el-input
                    v-model="contractData.bankName"
                    placeholder="VD: Vietcombank..."
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Thời hạn thanh toán (ngày)">
                  <el-input-number
                    v-model="contractData.paymentWindowDays"
                    :min="0"
                    class="!w-full"
                    placeholder="VD: 15, 30 ngày..."
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Hạn mức công nợ tối đa">
                  <el-input-number
                    v-model="contractData.creditLimit"
                    :min="0"
                    :step="1000000"
                    class="!w-full"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Mức chiết khấu (%)">
                  <el-input-number
                    v-model="contractData.discountRate"
                    :min="0"
                    :max="100"
                    :step="0.1"
                    class="!w-full"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Chỉ tiêu nhập hàng tháng">
                  <el-input-number
                    v-model="contractData.minimumVolumePerMonth"
                    :min="0"
                    class="!w-full"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Điều khoản chung">
              <el-input
                v-model="contractData.terms"
                type="textarea"
                :rows="3"
                placeholder="Nhập các điều khoản thỏa thuận chung..."
              />
            </el-form-item>
            <el-form-item label="Ghi chú nội bộ">
              <el-input
                v-model="contractData.note"
                type="textarea"
                :rows="2"
                placeholder="Ghi chú (không hiển thị ra bản in)..."
              />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="form-card reporting-card">
          <div class="upload-zone" v-loading="isUploading">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-report-red text-lg">
                <UploadFilled />
              </el-icon>
              <h4 class="font-bold m-0">Bản quét Hợp đồng (Chữ ký & Dấu đỏ)</h4>
            </div>
            <p class="text-xs text-gray-500 mb-2">
              Lưu trữ bản quét PDF/Hình ảnh hợp đồng vật lý giữa công ty và đối tác.
            </p>
            <el-upload
              class="upload-demo"
              drag
              :http-request="customUploadRequest"
              :before-upload="validateScanFile"
              :disabled="isUploading"
              :show-file-list="false"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">Kéo thả file hoặc <em>Bấm vào đây</em> để tải lên</div>
              <template #tip>
                <div class="el-upload__tip">Hỗ trợ định dạng PDF/JPG/PNG (Tối đa 15MB)</div>
              </template>
            </el-upload>
            <div v-if="contractData.contractFilePath" class="uploaded-file mt-3">
              <span
                ><el-icon><CircleCheck /></el-icon> Đã lưu file bản quét</span
              >
              <el-button type="primary" link @click="handleViewScannedFile">
                Xem bản quét
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="14">
        <el-card shadow="never" class="preview-card reporting-card">
          <div class="preview-toolbar p-2 bg-gray-200 border-b flex justify-between items-center">
            <span class="text-sm font-bold text-gray-600 flex items-center gap-2">
              <el-icon class="text-report-red"><Document /></el-icon>
              Trình Xem Trước Bản In (A4)
            </span>
            <el-tag size="small" type="info">
              {{ contractData.contractNumber }}
            </el-tag>
          </div>

          <div class="a4-preview-container p-6">
            <div class="a4-paper bg-white shadow-lg p-8 mx-auto">
              <h2 class="text-center font-bold text-xl mb-4">HỢP ĐỒNG NGUYÊN TẮC NHÀ CUNG CẤP</h2>
              <p class="text-right italic mb-6">Số: {{ contractData.contractNumber }}</p>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">BÊN A (BÊN MUA): HỆ THỐNG ANH EM MOTOR</h3>
                <p><strong>Tên đơn vị:</strong> CÔNG TY TNHH ANH EM MOTOR VIỆT NAM</p>
                <p><strong>Mã số thuế:</strong> 0123456789</p>
                <p><strong>Địa chỉ:</strong> Số 1, Đường Lê Duẩn, Quận Hoàn Kiếm, TP Hà Nội</p>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">BÊN B (BÊN BÁN): {{ contractData.supplierName }}</h3>
                <p><strong>Tên đơn vị:</strong> {{ contractData.supplierName }}</p>
                <p><strong>Mã nhà cung cấp:</strong> {{ contractData.supplierCode || 'N/A' }}</p>
                <p><strong>Người liên hệ:</strong> {{ contractData.supplierContactName || 'N/A' }}</p>
                <p><strong>Điện thoại:</strong> {{ contractData.supplierPhone || 'N/A' }}</p>
                <p><strong>Email:</strong> {{ contractData.supplierEmail || 'N/A' }}</p>
                <p><strong>Địa chỉ:</strong> {{ contractData.supplierAddress || 'N/A' }}</p>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">ĐIỀU 1: GIÁ TRỊ VÀ THỜI HẠN</h3>
                <p>
                  <strong>Giá trị hợp đồng:</strong>
                  {{ formatCurrency(contractData.contractValue) }}
                </p>
                <p>
                  <strong>Ngày hiệu lực:</strong>
                  {{ formatDate(contractData.effectiveDate) }}
                </p>
                <p>
                  <strong>Ngày hết hạn:</strong>
                  {{ formatDate(contractData.expirationDate) }}
                </p>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">ĐIỀU 2: ĐIỀU KHOẢN TÀI CHÍNH & THANH TOÁN</h3>
                <p>
                  <strong>Hạn mức công nợ (Tối đa):</strong>
                  {{ formatCurrency(contractData.creditLimit || 0) }}
                </p>
                <p>
                  <strong>Thời hạn thanh toán:</strong>
                  {{ contractData.paymentWindowDays || 0 }} ngày kể từ ngày xuất hóa đơn.
                </p>
                <p>
                  <strong>Chiết khấu:</strong>
                  {{ contractData.discountRate || 0 }} %
                </p>
                <p>
                  <strong>Chỉ tiêu nhập hàng tháng:</strong>
                  {{ contractData.minimumVolumePerMonth || 0 }} sản phẩm
                </p>
                <p class="mt-2"><strong>Thông tin chuyển khoản Bên B:</strong></p>
                <ul class="list-disc pl-5">
                  <li>Ngân hàng: {{ contractData.bankName || '..........................................................' }}</li>
                  <li>Số tài khoản: {{ contractData.bankAccountNumber || '..........................................................' }}</li>
                </ul>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">ĐIỀU 3: ĐIỀU KHOẢN CHUNG & CAM KẾT</h3>
                <p>
                  {{ contractData.terms || 'Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản trong hợp đồng.' }}
                </p>
              </div>

              <div class="signature-section mt-10 flex justify-between px-10">
                <div class="text-center">
                  <p class="font-bold">ĐẠI DIỆN BÊN A</p>
                  <p class="italic text-xs">(Ký, ghi rõ họ tên và đóng dấu)</p>
                </div>
                <div class="text-center">
                  <p class="font-bold">ĐẠI DIỆN BÊN B</p>
                  <p class="italic text-xs">(Ký, ghi rõ họ tên và đóng dấu)</p>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  UploadFilled,
  Document,
  EditPen,
  Printer,
  CircleCheck,
  Check,
  ArrowLeft,
  Promotion,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadRawFile, UploadRequestOptions } from 'element-plus';
import { SupplierContractApi } from '@/api/supplier/supplier-contract.api';
import type { SupplierContractStatus, SupplierContractDto } from '@/domain/supplier/contract.types';
import ReportPageHeader from '@/modules/Accountant/view/reporting/ReportPageHeader.vue';
import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue';

const route = useRoute();
const router = useRouter();

const contractData = ref<SupplierContractDto>({
  id: '',
  contractNumber: '',
  status: 'Draft',
  effectiveDate: '',
  contractValue: 0,
});

const isUploading = ref(false);
const isUpdatingStatus = ref(false);
const MAX_SCAN_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_SCAN_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const lifecycleSteps = [
  { label: 'Bản nháp', desc: 'Soạn thảo' },
  { label: 'Chờ duyệt', desc: 'Kế toán trưởng duyệt' },
  { label: 'Hiệu lực', desc: 'Đang chạy' },
  { label: 'Kết thúc', desc: 'Hết hạn/Thanh lý' },
];

const activeStep = computed(() => {
  if (['Completed', 'Expired', 'Terminated'].includes(contractData.value.status)) return 3;
  if (contractData.value.status === 'Active') return 2;
  if (contractData.value.status === 'PendingApproval') return 1;
  return 0;
});

const isContractLocked = computed(() => {
  return !['Draft', 'Active'].includes(contractData.value.status);
});

const canPrintContract = computed(() => true);

const getStatusLabel = (status: SupplierContractStatus): string => {
  const map: Record<SupplierContractStatus, string> = {
    Draft: 'Bản nháp',
    PendingApproval: 'Chờ duyệt',
    Active: 'Đang hiệu lực',
    Expired: 'Đã hết hạn',
    Terminated: 'Đã chấm dứt',
    Completed: 'Đã hoàn thành',
  };
  return map[status] || status;
};

const loadData = async () => {
  const contractId = route.params?.id as string | undefined;
  if (!contractId) {
    ElMessage.error('Thiếu ID hợp đồng.');
    return;
  }

  try {
    const c = await SupplierContractApi.getById(contractId);
    contractData.value = c;
  } catch (_e) {
    ElMessage.error('Không tải được dữ liệu hợp đồng.');
  }
};

onMounted(loadData);

const handleBack = () => {
  router.push({ name: 'WarehouseSupplierContract' });
};

const handlePrint = () => {
  window.print();
};

const handleSaveDraft = async () => {
  try {
    const dataToSave = {
      ...contractData.value,
    };
    await SupplierContractApi.update(contractData.value.id, dataToSave as any);
    ElMessage.success('Đã lưu thông tin hợp đồng.');
  } catch (_e) {
    ElMessage.error('Lưu thông tin thất bại.');
  }
};

const handleUpdateStatus = async (newStatus: SupplierContractStatus) => {
  const statusLabels: Record<string, string> = {
    PendingApproval: 'gửi duyệt',
    Active: 'duyệt',
    Completed: 'hoàn tất',
  };
  
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn ${statusLabels[newStatus]} hợp đồng này không?`,
      'Xác nhận',
      {
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    );
    
    isUpdatingStatus.value = true;
    
    const updated = await SupplierContractApi.updateStatus(contractData.value.id, {
      status: newStatus,
    });
    contractData.value.status = updated.status;
    
    ElMessage.success(`Đã chuyển trạng thái hợp đồng thành: ${getStatusLabel(newStatus)}`);
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('Không thể cập nhật trạng thái hợp đồng.');
    }
  } finally {
    isUpdatingStatus.value = false;
  }
};

const validateScanFile = (file: UploadRawFile) => {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_SCAN_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );
  if (!hasAllowedExtension) {
    ElMessage.error('Chỉ hỗ trợ file PDF, JPG, JPEG hoặc PNG.');
    return false;
  }
  if (file.size > MAX_SCAN_FILE_SIZE) {
    ElMessage.error('File hợp đồng không được vượt quá 15MB.');
    return false;
  }
  return true;
};

const customUploadRequest = async (options: UploadRequestOptions) => {
  isUploading.value = true;
  try {
    const res = await SupplierContractApi.uploadFile(contractData.value.id, options.file);
    contractData.value.contractFilePath = res.contractFilePath;
    ElMessage.success('Đã lưu file bản quét hợp đồng.');
    options.onSuccess(res);
  } catch (_e) {
    ElMessage.error('Không thể tải bản quét lên. Vui lòng thử lại.');
    options.onError(new Error('Upload failed') as any);
  } finally {
    isUploading.value = false;
  }
};

const handleViewScannedFile = () => {
  if (!contractData.value.contractFilePath) return;
  window.open(contractData.value.contractFilePath, '_blank', 'noopener,noreferrer');
};

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Chưa xác định';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 'Chưa xác định' : date.toLocaleDateString('vi-VN');
};
</script>

<style scoped lang="scss">
.contract-preview-container {
  min-height: 100%;
  padding: 12px;
  color: var(--el-text-color-primary);

  :deep(.el-card) {
    color: var(--el-text-color-primary);
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color-light);
    box-shadow: none;
  }

  :deep(.el-card__header) {
    color: var(--el-text-color-primary);
    border-color: var(--el-border-color-light);
  }

  :deep(.el-card__body) {
    color: var(--el-text-color-primary);
  }

  :deep(.el-form-item__label) {
    color: var(--el-text-color-regular);
    font-size: 13px;
    font-weight: 600;
  }

  :deep(.el-textarea__inner),
  :deep(.el-input__inner) {
    color: var(--el-text-color-primary);
    background-color: transparent;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-upload-dragger) {
    background-color: var(--el-fill-color-blank);
    border-color: var(--el-border-color);
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
  }

  :deep(.el-input__inner::placeholder),
  :deep(.el-textarea__inner::placeholder) {
    color: var(--el-text-color-placeholder);
  }

  :deep(.el-upload__text),
  :deep(.el-upload__tip) {
    color: var(--el-text-color-secondary);
  }

  :deep(.preview-toolbar) {
    background-color: var(--el-fill-color-light) !important;
    border-color: var(--el-border-color-light) !important;
  }

  :deep(.preview-toolbar .text-gray-600) {
    color: var(--el-text-color-regular) !important;
  }

  :deep(.a4-preview-container) {
    background-color: var(--el-fill-color-light);
  }

  :deep(.a4-paper),
  :deep(.a4-paper *:not(table, tr, td, th)) {
    color: #111827 !important;
    background-color: #fff !important;
  }

  :deep(.a4-paper table),
  :deep(.a4-paper tr),
  :deep(.a4-paper td),
  :deep(.a4-paper th) {
    color: #111827 !important;
    background-color: #fff !important;
    border-color: #d1d5db !important;
  }
}

:global(html.dark .contract-preview-container .el-card) {
  background-color: #151619;
  border-color: rgb(255 255 255 / 12%);
}

:global(html.dark .contract-preview-container .el-card__header),
:global(html.dark .contract-preview-container .el-card__body) {
  color: #f8fafc;
  border-color: rgb(255 255 255 / 12%);
}

:global(html.dark .contract-preview-container .el-form-item__label) {
  color: #cbd5e1;
}

:global(html.dark .contract-preview-container .el-input__wrapper),
:global(html.dark .contract-preview-container .el-select__wrapper),
:global(html.dark .contract-preview-container .el-upload-dragger) {
  background-color: #101114;
  border-color: rgb(255 255 255 / 14%);
  box-shadow: 0 0 0 1px rgb(255 255 255 / 14%) inset;
}

:global(html.dark .contract-preview-container .el-input__inner),
:global(html.dark .contract-preview-container .el-textarea__inner) {
  color: #f8fafc;
}

:global(html.dark .contract-preview-container .preview-toolbar),
:global(html.dark .contract-preview-container .a4-preview-container) {
  background-color: #1e2028 !important;
  border-color: rgb(255 255 255 / 12%) !important;
}

:global(html.dark .contract-preview-container .preview-toolbar .text-gray-600) {
  color: #cbd5e1 !important;
}

.pipeline-card :deep(.el-card__body) {
  padding: 14px 16px;
}

.bg-report-red {
  background-color: #e84a4a !important;
}

.text-report-red {
  color: #ff6b6b !important;
}

.border-report-red {
  border-color: #e84a4a !important;
}
</style>
