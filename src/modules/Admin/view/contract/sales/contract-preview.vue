<template>
  <div class="resp-page contract-preview-container" v-loading="isLoading">
    <ReportPageHeader
      title="Chi tiết hợp đồng mua xe"
      description="Kiểm tra thông tin, in hợp đồng và lưu bản quét có chữ ký của khách hàng."
      icon="ri:file-contract-line"
    >
      <template #actions>
        <template v-if="!isLoading">
          <el-button @click="handlePrint" v-auth="Permissions.Admin.ContractManagement.View">
            <el-icon><Printer /></el-icon> In Hợp Đồng
          </el-button>
          <el-button
            v-if="contractData.status === 'Draft'"
            type="primary"
            @click="handleSaveDraft"
            v-auth="Permissions.Admin.ContractManagement.Edit"
          >
            <el-icon><Document /></el-icon> Lưu Bản Nháp
          </el-button>
          <el-button
            v-if="contractData.status === 'PendingApproval'"
            type="success"
            @click="handleApproveContract"
            v-auth="Permissions.Admin.ContractManagement.Edit"
          >
            <el-icon><CircleCheck /></el-icon> Duyệt Hợp Đồng
          </el-button>
          <el-button
            v-if="contractData.status === 'Draft'"
            type="danger"
            @click="handleDelete"
            v-auth="Permissions.Admin.ContractManagement.Delete"
          >
            <el-icon><Delete /></el-icon> Xóa Hợp Đồng
          </el-button>
          <el-button
            v-if="contractData.status === 'Signed' && activeStep >= 1"
            type="success"
            @click="handleHandover"
            v-auth="Permissions.Order.OrderManagement.ChangeStatus"
          >
            <el-icon><CircleCheck /></el-icon> Xác Nhận Bàn Giao
          </el-button>
        </template>
      </template>
    </ReportPageHeader>

    <div v-if="isLoading" class="space-y-4">
      <div class="reporting-kpi-grid mb-4">
        <el-card v-for="i in 4" :key="i" shadow="never" class="h-24">
          <el-skeleton :rows="2" animated />
        </el-card>
      </div>
      <el-card shadow="never" class="mb-4">
        <el-skeleton :rows="3" animated />
      </el-card>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="24" :md="10">
          <el-card shadow="never">
            <el-skeleton :rows="8" animated />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="14">
          <el-card shadow="never">
            <el-skeleton :rows="12" animated />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <template v-else>
      <div class="reporting-kpi-grid mb-4">
        <ArtStatsCard
          title="Số hợp đồng"
          :count="contractData.contractNumber || '-'"
          description="Mã hợp đồng đang xem"
          icon="ri:hashtag"
          icon-style="bg-report-red"
        />
        <ArtStatsCard
          title="Đơn giá bán"
          :count="formatCurrency(contractData.actualSalePrice)"
          description="Giá trị hợp đồng cuối cùng"
          icon="ri:money-dollar-circle-line"
          icon-style="bg-report-red-light"
        />
        <ArtStatsCard
          title="Còn lại"
          :count="formatCurrency(contractData.remainingAmount)"
          description="Số tiền cần thanh toán"
          icon="ri:wallet-3-line"
          icon-style="bg-report-red-dark"
        />
        <ArtStatsCard
          title="Trạng thái pháp lý"
          :count="getStatusLabel(contractData.status)"
          description="Theo dõi vòng đời hợp đồng"
          icon="ri:shield-check-line"
          icon-style="bg-report-gray"
        />
      </div>

      <el-card shadow="never" class="mb-4 pipeline-card">
        <div class="text-sm text-gray-500 mb-4 font-medium">Trạng thái vòng đời hợp đồng</div>

        <div class="pipeline-steps-wrapper relative flex w-full">
          <div class="pipeline-track-bg absolute top-4 left-[10%] right-[10%] h-0.5 z-0"></div>
          <div
            class="pipeline-track-active absolute top-4 left-[10%] h-0.5 z-0 transition-all duration-700"
            :style="{ width: `${activeStep * 20}%` }"
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

        <div v-if="contractData.status === 'Draft'" class="mt-4">
          <el-alert
            type="warning"
            :closable="false"
            show-icon
            title="Hợp đồng chưa được gửi duyệt"
            description="Nhân viên đang hoàn thiện bản nháp. Admin chỉ duyệt sau khi hợp đồng chuyển sang Chờ duyệt."
          />
        </div>
        <div v-else-if="contractData.status === 'PendingApproval'" class="mt-4">
          <el-alert
            type="warning"
            :closable="false"
            show-icon
            title="Hợp đồng đang chờ Admin duyệt"
            description="Kiểm tra dữ liệu đơn hàng, khách hàng, xe và điều khoản trước khi phê duyệt."
          />
        </div>
        <div v-else-if="contractData.status === 'Approved'" class="mt-4">
          <el-alert
            type="success"
            :closable="false"
            show-icon
            title="Hợp đồng đã được Admin duyệt"
            description="Có thể in bản giấy cho khách hàng ký và tải bản quét đã ký lên để lưu hồ sơ."
          />
        </div>
      </el-card>

      <el-row :gutter="16" class="contract-document-layout">
        <el-col :xs="24" :sm="24" :md="10" class="form-column">
          <el-card shadow="never" class="form-card reporting-card">
            <template #header>
              <div class="card-header font-bold flex items-center gap-2">
                <el-icon class="text-report-red"><EditPen /></el-icon>
                Thông tin hợp đồng
              </div>
            </template>

            <el-form label-position="top" :disabled="isContractLocked">
              <el-form-item label="Điều khoản Đặc biệt (Quà tặng, Cam kết riêng)">
                <el-input
                  v-model="contractData.specialTerms"
                  type="textarea"
                  :rows="4"
                  placeholder="Nhập các cam kết ngoài hợp đồng mẫu..."
                />
              </el-form-item>
              <el-form-item label="Thời gian bảo hành">
                <el-input
                  v-model="contractData.warrantyPeriod"
                  placeholder="VD: 3 năm hoặc 30.000km"
                />
              </el-form-item>
              <el-form-item label="Phạm vi bảo hành">
                <el-input
                  v-model="contractData.warrantyScope"
                  type="textarea"
                  :rows="2"
                  placeholder="Phạm vi áp dụng bảo hành..."
                />
              </el-form-item>
              <el-form-item label="Ghi chú nội bộ">
                <el-input
                  v-model="contractData.note"
                  type="textarea"
                  :rows="2"
                  placeholder="Ghi chú riêng (không in ra hợp đồng)..."
                />
              </el-form-item>
            </el-form>

            <el-divider />

            <div v-loading="isUploading" class="upload-zone mt-4">
              <div class="flex items-center gap-2 mb-2">
                <el-icon class="text-report-red text-lg"><UploadFilled /></el-icon>
                <h4 class="font-bold m-0">Bản quét Chứng từ Thực tế</h4>
              </div>
              <p class="upload-description text-xs mb-2">
                Sau khi cửa hàng và khách hàng ký bản giấy, tải lên bản quét để lưu hồ sơ và xác
                nhận hợp đồng đã ký.
              </p>
              <el-upload
                class="upload-demo"
                drag
                :http-request="customUploadRequest"
                :before-upload="validateScanFile"
                :disabled="!canUploadSignedScan || isUploading"
                :show-file-list="false"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">Kéo thả file hoặc <em>Bấm vào đây</em> để tải lên</div>
                <template #tip>
                  <div class="el-upload__tip">Chỉ hỗ trợ file PDF/JPG/PNG (Tối đa 10MB)</div>
                </template>
              </el-upload>
              <div v-if="contractData.scannedFileUrl" class="uploaded-file mt-3">
                <div class="uploaded-file__status">
                  <el-icon><CircleCheck /></el-icon>
                  <span>Đã lưu bản quét hợp đồng có chữ ký</span>
                </div>
                <el-button type="primary" link @click="handleViewScannedFile">
                  Xem bản quét
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="14" class="preview-column">
          <el-card shadow="never" class="preview-card reporting-card">
            <div class="preview-toolbar p-2 bg-gray-200 border-b flex justify-between items-center">
              <span class="text-sm font-bold text-gray-600 flex items-center gap-2">
                <el-icon class="text-report-red"><Document /></el-icon>
                Trình Xem Trước Bản In (A4)
              </span>
              <el-tag size="small" type="info">{{ contractData.contractNumber }}</el-tag>
            </div>

            <div class="a4-preview-container p-6">
              <div class="a4-paper bg-white shadow-lg p-8 mx-auto">
                <h2 class="text-center font-bold text-xl mb-4">HỢP ĐỒNG MUA BÁN XE MÁY</h2>
                <p class="text-right italic mb-6">Số: {{ contractData.contractNumber }}</p>

                <div class="section mb-4">
                  <h3 class="font-bold mb-2">BÊN BÁN (BÊN A):</h3>
                  <p><strong>Tên cửa hàng:</strong> {{ contractData.showroomName }}</p>
                  <p>
                    <strong>Mã số thuế:</strong>
                    {{ contractData.showroomTaxCode }}
                  </p>
                  <p><strong>Địa chỉ:</strong> {{ contractData.showroomAddress }}</p>
                  <p>
                    <strong>Đại diện pháp luật:</strong>
                    {{ contractData.showroomRepresentative }}
                  </p>
                </div>

                <div class="section mb-4">
                  <h3 class="font-bold mb-2">BÊN MUA (BÊN B):</h3>
                  <p>
                    <strong>Họ và tên:</strong>
                    {{ contractData.customerFullName }}
                  </p>
                  <p><strong>Số CCCD:</strong> {{ contractData.customerCCCD }}</p>
                  <p>
                    <strong>Địa chỉ thường trú:</strong>
                    {{ contractData.customerAddress }}
                  </p>
                  <p><strong>Điện thoại:</strong> {{ contractData.customerPhone }}</p>
                </div>

                <div class="section mb-4">
                  <h3 class="font-bold mb-2">ĐIỀU 1: THÔNG TIN PHƯƠNG TIỆN GIAO DỊCH</h3>
                  <table class="w-full border-collapse border mb-2">
                    <tbody>
                      <tr>
                        <td class="border p-1">
                          <strong>Dòng xe:</strong> {{ contractData.vehicleModel }}
                        </td>
                        <td class="border p-1">
                          <strong>Phiên bản:</strong>
                          {{ contractData.vehicleVersion }}
                        </td>
                      </tr>
                      <tr>
                        <td class="border p-1">
                          <strong>Màu sắc:</strong> {{ contractData.vehicleColor }}
                        </td>
                        <td class="border p-1">
                          <strong>Số khung:</strong> {{ contractData.frameNumber }}
                        </td>
                      </tr>
                      <tr>
                        <td class="border p-1" colspan="2">
                          <strong>Số máy:</strong> {{ contractData.engineNumber }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    <strong>Đơn giá bán:</strong>
                    {{ formatCurrency(contractData.actualSalePrice) }}
                  </p>
                </div>

                <div class="section mb-4">
                  <h3 class="font-bold mb-2">ĐIỀU 2: ĐIỀU KHOẢN TÀI CHÍNH & THANH TOÁN</h3>
                  <p>
                    <strong>Số tiền đặt cọc:</strong>
                    {{ formatCurrency(contractData.depositAmount) }}
                  </p>
                  <p>
                    <strong>Số tiền còn lại:</strong>
                    {{ formatCurrency(contractData.remainingAmount) }}
                  </p>
                  <p>
                    <strong>Hạn thanh toán cuối:</strong>
                    {{ formatDate(contractData.finalPaymentDeadline) }}
                  </p>
                </div>

                <div class="section mb-4">
                  <h3 class="font-bold mb-2">ĐIỀU 3: BẢO HÀNH & ĐIỀU KHOẢN ĐẶC BIỆT</h3>
                  <p>
                    <strong>Thời gian bảo hành:</strong>
                    {{ contractData.warrantyPeriod }}
                  </p>
                  <p>
                    <strong>Phạm vi bảo hành:</strong>
                    {{ contractData.warrantyScope }}
                  </p>
                  <p v-if="contractData.specialTerms">
                    <strong>Cam kết bổ sung:</strong>
                    {{ contractData.specialTerms }}
                  </p>
                </div>

                <div class="signature-section mt-10 flex justify-between px-10">
                  <div class="text-center">
                    <p class="font-bold">BÊN A (BÁN)</p>
                    <p class="italic text-xs">(Ký, ghi rõ họ tên và đóng dấu)</p>
                  </div>
                  <div class="text-center">
                    <p class="font-bold">BÊN B (MUA)</p>
                    <p class="italic text-xs">(Ký, ghi rõ họ tên)</p>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from '@/domain/constants/permissions';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  UploadFilled,
  Document,
  EditPen,
  Printer,
  CircleCheck,
  Check,
  Delete,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadRawFile, UploadRequestOptions } from 'element-plus';
import { SalesContractApi } from '@/api/sales';
import type { SalesContractStatus } from '@/domain/sales/contract.types';
import ReportPageHeader from '@/modules/Accountant/view/reporting/ReportPageHeader.vue';
import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue';

const route = useRoute();

const isLoading = ref(true);

const contractData = ref({
  id: '' as string,
  orderId: undefined as number | undefined,
  contractNumber: '' as string,
  status: 'Draft' as SalesContractStatus,

  showroomName: '',
  showroomTaxCode: '',
  showroomAddress: '',
  showroomRepresentative: '',

  customerFullName: '',
  customerCCCD: '',
  customerAddress: '',
  customerPhone: '',

  vehicleModel: '',
  vehicleVersion: '',
  vehicleColor: '',
  frameNumber: '',
  engineNumber: '',
  actualSalePrice: 0,

  depositAmount: 0,
  remainingAmount: 0,
  finalPaymentDeadline: '',

  warrantyPeriod: '',
  warrantyScope: '',
  specialTerms: '',
  note: '',

  scannedFileUrl: null as string | null,
});

const isUploading = ref(false);
const MAX_SCAN_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_SCAN_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const lifecycleSteps = [
  { label: 'Soạn thảo', desc: 'Kiểm tra nội dung hợp đồng' },
  { label: 'Chờ duyệt', desc: 'Nhân viên đã gửi Admin' },
  { label: 'Đã duyệt', desc: 'Admin đã phê duyệt' },
  { label: 'Đã ký bản giấy', desc: 'Đã lưu bản quét có chữ ký' },
  { label: 'Bàn giao xe', desc: 'Hoàn thành hợp đồng' },
];

const activeStep = computed(() => {
  if (contractData.value.status === 'Fulfilled') return 4;
  if (contractData.value.status === 'Signed') return 3;
  if (contractData.value.status === 'Approved') return 2;
  if (contractData.value.status === 'PendingApproval') return 1;
  return 0;
});

const isContractLocked = computed(() => contractData.value.status !== 'Draft');
const canUploadSignedScan = computed(() => contractData.value.status === 'Approved');

const _contractStatusType = computed(() => {
  switch (contractData.value.status) {
    case 'Draft':
      return 'info';
    case 'PendingApproval':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Signed':
      return 'success';
    case 'Fulfilled':
      return 'primary';
    default:
      return 'info';
  }
});

const getStatusLabel = (status: SalesContractStatus): string => {
  switch (status) {
    case 'Draft':
      return 'Nháp';
    case 'PendingApproval':
      return 'Chờ Admin duyệt';
    case 'Approved':
      return 'Đã duyệt';
    case 'Signed':
      return 'Đã ký';
    case 'Fulfilled':
      return 'Hoàn tất';
    default:
      return status;
  }
};

const loadData = async () => {
  const contractId = route.params?.id as string | undefined;
  if (!contractId) {
    ElMessage.error('Thiếu ID hợp đồng.');
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    const c = await SalesContractApi.getById(contractId);
    contractData.value.id = c.id;
    contractData.value.orderId = c.orderId;
    contractData.value.contractNumber = c.contractNumber;
    contractData.value.status = c.status as SalesContractStatus;
    contractData.value.customerFullName = c.customerFullName || '';
    contractData.value.customerCCCD = c.customerCCCD || '';
    contractData.value.customerAddress = c.customerAddress || '';
    contractData.value.customerPhone = c.customerPhone || '';
    contractData.value.showroomName = c.showroomName || '';
    contractData.value.showroomTaxCode = c.showroomTaxCode || '';
    contractData.value.showroomAddress = c.showroomAddress || '';
    contractData.value.showroomRepresentative = c.showroomRepresentative || '';
    contractData.value.vehicleModel = c.vehicleModel || '';
    contractData.value.vehicleVersion = c.vehicleVersion || '';
    contractData.value.vehicleColor = c.vehicleColor || '';
    contractData.value.frameNumber = c.frameNumber || '';
    contractData.value.engineNumber = c.engineNumber || '';
    contractData.value.actualSalePrice = c.actualSalePrice;
    contractData.value.depositAmount = c.depositAmount;
    contractData.value.remainingAmount = c.remainingAmount;
    contractData.value.finalPaymentDeadline = c.finalPaymentDeadline || '';
    contractData.value.warrantyPeriod = c.warrantyPeriod || '';
    contractData.value.warrantyScope = c.warrantyScope || '';
    contractData.value.specialTerms = c.specialTerms || '';
    contractData.value.note = c.note || '';
    contractData.value.scannedFileUrl = c.scannedFileUrl || null;
  } catch (_e) {
    ElMessage.error('Không tải được dữ liệu hợp đồng.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);

const handlePrint = () => {
  window.print();
};

const handleSaveDraft = async () => {
  try {
    await SalesContractApi.update(contractData.value.id, {
      specialTerms: contractData.value.specialTerms,
      warrantyPeriod: contractData.value.warrantyPeriod,
      warrantyScope: contractData.value.warrantyScope,
      note: contractData.value.note,
    });
    ElMessage.success('Đã lưu bản nháp hợp đồng.');
  } catch (_e) {
    ElMessage.error('Lưu bản nháp thất bại.');
  }
};

const handleApproveContract = async () => {
  try {
    await ElMessageBox.confirm(
      `Duyệt hợp đồng "${contractData.value.contractNumber}" để chuyển sang bước ký bản giấy?`,
      'Xác nhận duyệt hợp đồng',
      {
        confirmButtonText: 'Duyệt hợp đồng',
        cancelButtonText: 'Hủy',
        type: 'success',
      }
    );
    const updated = await SalesContractApi.approve(contractData.value.id);
    contractData.value.status = updated.status;
    ElMessage.success('Đã duyệt hợp đồng. Có thể in và lấy chữ ký khách hàng.');
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('Không thể duyệt hợp đồng.');
    }
  }
};

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Bạn có chắc muốn xóa hợp đồng này? Hành động này không thể hoàn tác.',
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'error',
      }
    );
    await SalesContractApi.delete(contractData.value.id);
    ElMessage.success('Đã xóa hợp đồng thành công.');
  } catch (_e: any) {
    if (_e !== 'cancel') {
      ElMessage.error('Xóa hợp đồng thất bại.');
    }
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
    ElMessage.error('File hợp đồng không được vượt quá 10MB.');
    return false;
  }

  return true;
};

const customUploadRequest = async (options: UploadRequestOptions) => {
  isUploading.value = true;
  try {
    const res = await SalesContractApi.uploadScannedFile(contractData.value.id, options.file);
    contractData.value.scannedFileUrl = res.scannedFileUrl;
    contractData.value.status = 'Signed';
    ElMessage.success('Đã lưu bản quét. Hợp đồng chuyển sang trạng thái Đã ký.');
    options.onSuccess(res);
  } catch (_e) {
    ElMessage.error('Không thể tải bản quét lên. Vui lòng thử lại.');
    const uploadError = Object.assign(new Error('Sales contract scan upload failed'), {
      status: 0,
      method: 'POST',
      url: `/api/v1/contracts/sales/${contractData.value.id}/scanned-file`,
    });
    options.onError(uploadError as Parameters<typeof options.onError>[0]);
  } finally {
    isUploading.value = false;
  }
};

const handleViewScannedFile = () => {
  if (!contractData.value.scannedFileUrl) return;
  window.open(contractData.value.scannedFileUrl, '_blank', 'noopener,noreferrer');
};

const handleHandover = async () => {
  if (contractData.value.status !== 'Signed') {
    ElMessageBox.alert(
      'Chưa có bản quét hợp đồng đã ký. Không thể xuất bãi và bàn giao xe.',
      'Chưa đủ hồ sơ',
      { confirmButtonText: 'Đóng', type: 'error' }
    );
    return;
  }

  try {
    await SalesContractApi.updateStatus(contractData.value.id, {
      status: 'Fulfilled',
    });
    contractData.value.status = 'Fulfilled';
    ElMessage.success('Đã hoàn tất bàn giao xe và đóng hợp đồng.');
  } catch (_e) {
    ElMessage.error('Cập nhật trạng thái bàn giao thất bại.');
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
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

:global(html.dark .contract-preview-container .el-card__header) {
  color: #f8fafc;
  border-color: rgb(255 255 255 / 12%);
}

:global(html.dark .contract-preview-container .el-card__body) {
  color: #f8fafc;
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

.bg-report-gray {
  background-color: var(--el-fill-color-dark) !important;
}

.pipeline-track-bg {
  background-color: var(--el-border-color);
}

.pipeline-track-active {
  background-color: #e84a4a;
}

.step-circle {
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color);

  &.step-circle--done {
    background-color: var(--el-fill-color-blank);
    border-color: #e84a4a;
    color: #e84a4a;
  }

  &.step-circle--active {
    background-color: #e84a4a;
    border-color: #e84a4a;
    color: #fff;
    box-shadow: 0 0 0 3px rgb(232 74 74 / 25%);
  }

  &.step-circle--pending {
    color: var(--el-text-color-placeholder);
    background-color: var(--el-fill-color-light);
    border-color: var(--el-border-color);
  }
}

.step-label {
  color: var(--el-text-color-secondary);
  font-weight: 400;

  &.step-label--active {
    color: var(--el-text-color-primary);
    font-weight: 600;
  }

  &.step-label--inactive {
    color: var(--el-text-color-placeholder);
    font-weight: 400;
  }
}

.step-desc {
  color: var(--el-text-color-secondary);
}

.pipeline-card {
  .text-gray-500 {
    color: var(--el-text-color-secondary) !important;
  }
}

.contract-document-layout {
  row-gap: 16px;
}

.form-card :deep(.el-card__body) {
  min-height: 600px;
  padding: 14px;
}

.preview-card :deep(.el-card__body) {
  min-height: 650px;
  padding: 0;
  background-color: var(--el-fill-color-light);
}

.a4-preview-container {
  height: 610px;
  overflow-y: auto;
  border-radius: 0 0 8px 8px;
}

.a4-paper {
  width: 210mm;
  max-width: 100%;
  min-height: 297mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 14px;
  line-height: 1.5;
  color: #000;
}

.section h3 {
  font-size: 15px;
  text-transform: uppercase;
}

.upload-zone {
  padding: 16px;
  text-align: center;
  background-color: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  transition:
    background-color 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;
  transform-origin: center;
  will-change: box-shadow, border-color;
}

.upload-description {
  color: var(--el-text-color-secondary);
}

.uploaded-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  color: var(--el-color-success);
  text-align: left;
  background-color: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-7);
  border-radius: 6px;
}

.uploaded-file__status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
}

:global(html.dark .contract-preview-container .step-circle--done) {
  color: #ff6b6b;
  background-color: #1e2028;
}

:global(html.dark .contract-preview-container .step-circle--pending) {
  color: #64748b;
  background-color: #1e2028;
  border-color: rgb(255 255 255 / 14%);
}

:global(html.dark .contract-preview-container .step-label--active) {
  color: #f1f5f9;
}

:global(html.dark .contract-preview-container .step-label--inactive),
:global(html.dark .contract-preview-container .step-desc) {
  color: #94a3b8;
}

:global(html.dark .contract-preview-container .upload-zone) {
  background-color: #151619;
  border-color: rgb(255 255 255 / 14%);
}

:global(html.dark .contract-preview-container .upload-description) {
  color: #94a3b8;
}

:global(html.dark .contract-preview-container .uploaded-file) {
  color: #86efac;
  background-color: rgb(34 197 94 / 12%);
  border-color: rgb(34 197 94 / 28%);
}

@media (width <= 768px) {
  .contract-preview-container {
    padding: 8px;
  }

  .pipeline-steps-wrapper {
    min-width: 420px;
  }

  .pipeline-card :deep(.el-card__body) {
    overflow-x: auto;
  }

  .form-card :deep(.el-card__body),
  .preview-card :deep(.el-card__body) {
    min-height: auto;
  }

  .a4-preview-container {
    height: auto;
    min-height: 420px;
    padding: 12px;
  }

  .a4-paper {
    padding: 16px;
    font-size: 13px;
  }

  .uploaded-file {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media print {
  @page {
    size: a4;
    margin: 12mm;
  }

  :global(body *) {
    visibility: hidden !important;
  }

  .a4-paper,
  .a4-paper * {
    visibility: visible !important;
  }

  .a4-paper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-width: none;
    min-height: auto;
    padding: 0;
    margin: 0;
    color: #000 !important;
    background: #fff !important;
    box-shadow: none !important;
  }

  .a4-paper,
  .a4-paper table,
  .a4-paper tr,
  .a4-paper td,
  .a4-paper th {
    color: #000 !important;
    background: #fff !important;
    print-color-adjust: exact;
  }
}
</style>
