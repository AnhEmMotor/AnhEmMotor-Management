<template>
  <div class="contract-preview-container">
    <ReportPageHeader
      title="Mẫu Hợp Đồng Mua Bán Xe Máy"
      description="Trình xem trước và quản lý hợp đồng bán hàng — theo dõi vòng đời đặt cọc, ký kết và bàn giao xe."
      icon="ri:file-paper-2-line"
    >
      <template #actions>
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon>&nbsp;In Hợp Đồng
        </el-button>
        <el-button
          v-if="contractData.status === 'Draft'"
          type="primary"
          @click="handleSaveDraft"
        >
          <el-icon><Document /></el-icon>&nbsp;Lưu Bản Nháp
        </el-button>
        <el-button
          v-if="contractData.status === 'Signed'"
          type="warning"
          @click="handleCreateAddendum"
        >
          <el-icon><DocumentCopy /></el-icon>&nbsp;Tạo Phụ Lục
        </el-button>
        <el-button
          v-if="contractData.status === 'Signed' && activeStep >= 1"
          type="success"
          @click="handleHandover"
        >
          <el-icon><CircleCheck /></el-icon>&nbsp;Xác Nhận Bàn Giao
        </el-button>
      </template>
    </ReportPageHeader>

    <!-- KPI Cards Row -->
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

    <!-- Progress Pipeline -->
    <el-card shadow="never" class="mb-4 pipeline-card">
      <div class="text-sm text-gray-500 mb-4 font-medium">
        Trạng thái vòng đời hợp đồng
      </div>

      <div class="pipeline-steps-wrapper relative flex w-full">
        <!-- Track line nền xám -->
        <div
          class="pipeline-track-bg absolute top-4 left-[12.5%] right-[12.5%] h-0.5 z-0"
        ></div>
        <!-- Track line đỏ tiến trình -->
        <div
          class="pipeline-track-active absolute top-4 left-[12.5%] h-0.5 z-0 transition-all duration-700"
          :style="{
            width: activeStep === 0 ? '0%' : activeStep === 1 ? '37.5%' : '75%',
          }"
        ></div>

        <div
          v-for="(step, index) in [
            { label: 'Đặt cọc', desc: 'Đã nhận cọc và khởi tạo' },
            { label: 'Thanh toán đủ', desc: 'Hoàn tất nghĩa vụ tài chính' },
            { label: 'Bàn giao xe', desc: 'Hoàn thành hợp đồng' },
          ]"
          :key="index"
          class="flex-1 flex flex-col items-center relative z-10"
        >
          <!-- Circle bọc bằng class riêng step-circle để tránh bị override -->
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
            :class="
              activeStep >= index
                ? 'step-label--active'
                : 'step-label--inactive'
            "
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
          title="Hợp đồng đang ở trạng thái Nháp"
          description="Cần ký kết và tải lên bản scan chứng từ thực tế để chuyển sang trạng thái Đã ký."
        />
      </div>
    </el-card>

    <!-- Split-Screen / Preview Mode -->
    <el-row :gutter="20">
      <!-- Cột bên trái: Form nhập liệu & upload -->
      <el-col :span="10">
        <el-card
          shadow="never"
          class="form-card reporting-card"
          body-style="padding: 20px; display: flex; flex-direction: column; height: 800px; overflow-y: auto;"
        >
          <template #header>
            <div class="card-header font-bold flex items-center gap-2">
              <el-icon class="text-report-red"><EditPen /></el-icon>
              Thông tin Hợp đồng & Phụ lục
            </div>
          </template>

          <el-form label-position="top" :disabled="isContractSigned">
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

          <!-- Khu vực Tải lên Pháp lý (Upload Zone) -->
          <div
            ref="uploadZoneRef"
            class="upload-zone mt-4"
            :class="{ 'highlight-upload': isHighlightUpload }"
          >
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-report-red text-lg">
                <UploadFilled />
              </el-icon>
              <h4 class="font-bold m-0">Bản quét Chứng từ Thực tế</h4>
            </div>
            <p class="text-xs text-gray-500 mb-2">
              Tải lên bản gốc có chữ ký/dấu vân tay để xác nhận hợp đồng có hiệu
              lực (Signed).
            </p>
            <el-upload
              class="upload-demo"
              drag
              :http-request="customUploadRequest"
              :disabled="isContractSigned"
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                Kéo thả file hoặc <em>Bấm vào đây</em> để tải lên
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  Chỉ hỗ trợ file PDF/JPG/PNG (Tối đa 10MB)
                </div>
              </template>
            </el-upload>
            <div
              v-if="contractData.scannedFileUrl"
              class="mt-2 text-green-600 text-sm"
            >
              <i class="el-icon-document-checked"></i> Đã tải lên file hợp đồng
              có chữ ký.
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Cột bên phải: Trình xem trước (Preview) -->
      <el-col :span="14">
        <el-card
          shadow="never"
          class="preview-card reporting-card"
          body-style="padding: 0; background-color: #f3f4f6; height: 800px; display: flex; flex-direction: column;"
        >
          <div
            class="preview-toolbar p-2 bg-gray-200 border-b flex justify-between items-center"
          >
            <span
              class="text-sm font-bold text-gray-600 flex items-center gap-2"
            >
              <el-icon class="text-report-red"><Document /></el-icon>
              Trình Xem Trước Bản In (A4)
            </span>
            <el-tag size="small" type="info">
              {{ contractData.contractNumber }}
            </el-tag>
          </div>

          <div class="a4-preview-container p-6 flex-1 overflow-y-auto">
            <div
              class="a4-paper bg-white shadow-lg p-8 mx-auto"
              style="width: 210mm; max-width: 100%; min-height: 297mm"
            >
              <h2 class="text-center font-bold text-xl mb-4">
                HỢP ĐỒNG MUA BÁN XE MÁY
              </h2>
              <p class="text-right italic mb-6">
                Số: {{ contractData.contractNumber }}
              </p>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">BÊN BÁN (BÊN A):</h3>
                <p>
                  <strong>Tên cửa hàng:</strong> {{ contractData.showroomName }}
                </p>
                <p>
                  <strong>Mã số thuế:</strong>
                  {{ contractData.showroomTaxCode }}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {{ contractData.showroomAddress }}
                </p>
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
                <p>
                  <strong>Điện thoại:</strong> {{ contractData.customerPhone }}
                </p>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">
                  ĐIỀU 1: THÔNG TIN PHƯƠNG TIỆN GIAO DỊCH
                </h3>
                <table class="w-full border-collapse border mb-2">
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
                </table>
                <p>
                  <strong>Đơn giá bán:</strong>
                  {{ formatCurrency(contractData.actualSalePrice) }}
                </p>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">
                  ĐIỀU 2: ĐIỀU KHOẢN TÀI CHÍNH & THANH TOÁN
                </h3>
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
                <h3 class="font-bold mb-2">
                  ĐIỀU 3: BẢO HÀNH & ĐIỀU KHOẢN ĐẶC BIỆT
                </h3>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  UploadFilled,
  Document,
  DocumentCopy,
  EditPen,
  Printer,
  CircleCheck,
  Check,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { SalesContractApi } from "@/api/sales";
import type { SalesContractStatus } from "@/domain/sales/contract.types";
import ReportPageHeader from "@/modules/Accountant/view/reporting/ReportPageHeader.vue";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";

const route = useRoute();

const contractData = ref({
  id: "" as string,
  orderId: undefined as number | undefined,
  contractNumber: "" as string,
  status: "Draft" as SalesContractStatus,

  showroomName: "",
  showroomTaxCode: "",
  showroomAddress: "",
  showroomRepresentative: "",

  customerFullName: "",
  customerCCCD: "",
  customerAddress: "",
  customerPhone: "",

  vehicleModel: "",
  vehicleVersion: "",
  vehicleColor: "",
  frameNumber: "",
  engineNumber: "",
  actualSalePrice: 0,

  depositAmount: 0,
  remainingAmount: 0,
  finalPaymentDeadline: "",

  warrantyPeriod: "",
  warrantyScope: "",
  specialTerms: "",
  note: "",

  scannedFileUrl: null as string | null,
});

const uploadZoneRef = ref<HTMLElement | null>(null);
const isHighlightUpload = ref(false);

const activeStep = computed(() => {
  if (contractData.value.status === "Fulfilled") return 2;
  if (contractData.value.status === "Signed") return 1;
  return 0;
});

const isContractSigned = computed(() => contractData.value.status !== "Draft");

const getStatusLabel = (status: SalesContractStatus): string => {
  switch (status) {
    case "Draft":
      return "Nháp";
    case "Signed":
      return "Đã ký";
    case "Fulfilled":
      return "Hoàn tất";
    default:
      return status;
  }
};

const loadData = async () => {
  const contractId = route.params?.id as string | undefined;
  if (!contractId) {
    ElMessage.error("Thiếu ID hợp đồng.");
    return;
  }

  try {
    const c = await SalesContractApi.getById(contractId);
    contractData.value.id = c.id;
    contractData.value.orderId = c.orderId;
    contractData.value.contractNumber = c.contractNumber;
    contractData.value.status = c.status as SalesContractStatus;
    contractData.value.customerFullName = c.customerFullName || "";
    contractData.value.customerCCCD = c.customerCCCD || "";
    contractData.value.customerAddress = c.customerAddress || "";
    contractData.value.customerPhone = c.customerPhone || "";
    contractData.value.showroomName = c.showroomName || "";
    contractData.value.showroomTaxCode = c.showroomTaxCode || "";
    contractData.value.showroomAddress = c.showroomAddress || "";
    contractData.value.showroomRepresentative = c.showroomRepresentative || "";
    contractData.value.vehicleModel = c.vehicleModel || "";
    contractData.value.vehicleVersion = c.vehicleVersion || "";
    contractData.value.vehicleColor = c.vehicleColor || "";
    contractData.value.frameNumber = c.frameNumber || "";
    contractData.value.engineNumber = c.engineNumber || "";
    contractData.value.actualSalePrice = c.actualSalePrice;
    contractData.value.depositAmount = c.depositAmount;
    contractData.value.remainingAmount = c.remainingAmount;
    contractData.value.finalPaymentDeadline = c.finalPaymentDeadline || "";
    contractData.value.warrantyPeriod = c.warrantyPeriod || "";
    contractData.value.warrantyScope = c.warrantyScope || "";
    contractData.value.specialTerms = c.specialTerms || "";
    contractData.value.note = c.note || "";
    contractData.value.scannedFileUrl = c.scannedFileUrl || null;
  } catch (_e) {
    ElMessage.error("Không tải được dữ liệu hợp đồng.");
  }
};

onMounted(loadData);

const handlePrint = () => {
  window.print();
  if (contractData.value.status === "Draft") {
    setTimeout(() => {
      uploadZoneRef.value?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      isHighlightUpload.value = true;
      setTimeout(() => {
        isHighlightUpload.value = false;
      }, 3000);
    }, 500);
  }
};

const handleSaveDraft = async () => {
  try {
    await SalesContractApi.update(contractData.value.id, {
      specialTerms: contractData.value.specialTerms,
      warrantyPeriod: contractData.value.warrantyPeriod,
      warrantyScope: contractData.value.warrantyScope,
      note: contractData.value.note,
    });
    ElMessage.success("Đã lưu bản nháp hợp đồng.");
  } catch (_e) {
    ElMessage.error("Lưu bản nháp thất bại.");
  }
};

const handleCreateAddendum = () => {
  ElMessage.info("Chức năng tạo Phụ lục hợp đồng đang được phát triển.");
};

const customUploadRequest = async (options: any) => {
  try {
    const res = await SalesContractApi.uploadScannedFile(
      contractData.value.id,
      options.file,
    );
    contractData.value.scannedFileUrl = res.scannedFileUrl;
    contractData.value.status = "Signed";
    ElMessage.success(
      "Đã tải lên bản gốc thành công. Hợp đồng chuyển sang trạng thái Signed. Đã khóa chỉnh sửa.",
    );
    options.onSuccess();
  } catch (_e) {
    ElMessage.error("Upload file thất bại.");
    options.onError();
  }
};

const handleHandover = async () => {
  if (contractData.value.status !== "Signed") {
    ElMessageBox.alert(
      "Hợp đồng chưa được ký kết (thiếu bản scan). Không thể xuất bãi và bàn giao xe!",
      "Cảnh báo Rào Chắn",
      { confirmButtonText: "Đóng", type: "error" },
    );
    return;
  }

  try {
    await SalesContractApi.updateStatus(contractData.value.id, {
      status: "Fulfilled",
    });
    contractData.value.status = "Fulfilled";
    ElMessage.success("Đã hoàn tất bàn giao xe. Hợp đồng đóng (Fulfilled).");
  } catch (_e) {
    ElMessage.error("Cập nhật trạng thái bàn giao thất bại.");
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
};
</script>

<style scoped lang="scss">
.contract-preview-container {
  height: calc(100vh - 100px);
  padding: 16px;
  overflow-y: auto;

  // =============================================
  // Dark theme — tất cả el-card trong trang
  // =============================================
  :deep(.el-card) {
    background-color: #151619;
    border-color: #2c2f36;
    box-shadow: none;
  }

  :deep(.el-card__header) {
    color: #f8fafc;
    border-color: #2c2f36;
  }

  :deep(.el-card__body) {
    color: #f8fafc;
  }

  // Form labels
  :deep(.el-form-item__label) {
    color: #cbd5e1;
  }

  // Inputs & Textarea
  :deep(.el-textarea__inner),
  :deep(.el-input__inner) {
    color: #f8fafc;
    background-color: #101114;
    border-color: #333741;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-upload-dragger) {
    background-color: #101114;
    border-color: #333741;
    box-shadow: 0 0 0 1px #333741 inset;
  }

  :deep(.el-input__inner::placeholder),
  :deep(.el-textarea__inner::placeholder) {
    color: #64748b;
  }

  // Upload text
  :deep(.el-upload__text),
  :deep(.el-upload__tip) {
    color: #94a3b8;
  }

  // =============================================
  // Pipeline toolbar — preview card header
  // =============================================
  :deep(.preview-toolbar) {
    background-color: #1e2028 !important;
    border-color: #2c2f36 !important;
  }

  :deep(.preview-toolbar .text-gray-600) {
    color: #94a3b8 !important;
  }

  // =============================================
  // A4 Paper — giữ nguyên màu trắng
  // =============================================
  :deep(.a4-preview-container) {
    background-color: #1e2028;
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

.pipeline-card :deep(.el-card__body) {
  padding: 18px 20px;
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
  background-color: #2d2d2d !important;
}

// =============================================
// Pipeline track lines
// =============================================
.pipeline-track-bg {
  background-color: #2c2f36;
}

.pipeline-track-active {
  background-color: #e84a4a;
}

// =============================================
// Pipeline step circles — tách biệt khỏi dark theme override
// =============================================
.step-circle {
  // Base: pending (chưa đến)
  background-color: #1e2028;
  border-color: #3d4149;
  color: #64748b;

  &.step-circle--done {
    background-color: #1e2028;
    border-color: #e84a4a;
    color: #ff6b6b;
  }

  &.step-circle--active {
    background-color: #e84a4a;
    border-color: #e84a4a;
    color: #fff;
    box-shadow: 0 0 0 3px rgb(232 74 74 / 25%);
  }

  &.step-circle--pending {
    background-color: #1e2028;
    border-color: #3d4149;
    color: #64748b;
  }
}

// =============================================
// Pipeline step labels
// =============================================
.step-label {
  color: #475569;
  font-weight: 400;

  &.step-label--active {
    color: #f1f5f9;
    font-weight: 600;
  }

  &.step-label--inactive {
    color: #475569;
    font-weight: 400;
  }
}

.step-desc {
  color: #64748b;
}

// Pipeline card subtitle
.pipeline-card {
  .text-gray-500 {
    color: #94a3b8 !important;
  }
}

.a4-preview-container {
  height: 600px;
  overflow-y: auto;
  border-radius: 0 0 8px 8px;
}

.a4-paper {
  font-family: "Times New Roman", Times, serif;
  font-size: 14px;
  line-height: 1.5;
  color: #000;
}

.section h3 {
  font-size: 15px;
  text-transform: uppercase;
}

.upload-zone {
  padding: 20px;
  text-align: center;
  background-color: #151619;
  border: 1px dashed #333741;
  border-radius: 6px;
  transition:
    background-color 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;
  transform-origin: center;
  will-change: box-shadow, border-color;
}

.highlight-upload {
  background-color: rgb(232 74 74 / 12%);
  border-color: #e84a4a;
  box-shadow:
    0 0 0 2px rgb(232 74 74 / 30%),
    0 0 20px rgb(232 74 74 / 25%);
  animation: pulse-upload 1.5s ease-in-out 2;
}

@keyframes pulse-upload {
  0%,
  100% {
    box-shadow:
      0 0 0 2px rgb(232 74 74 / 30%),
      0 0 20px rgb(232 74 74 / 25%);
  }

  50% {
    box-shadow:
      0 0 0 4px rgb(232 74 74 / 50%),
      0 0 32px rgb(232 74 74 / 45%);
  }
}
</style>
