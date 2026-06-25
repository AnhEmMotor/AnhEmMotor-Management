<template>
  <div class="finance-contract-detail">
    <!-- Modern Page Header -->
    <ReportPageHeader
      title="Hợp Đồng Tài Chính Trả Góp"
      description="Theo dõi tiến độ giải ngân, Cavet gốc và đối soát chuyển khoản với công ty tài chính."
      icon="ri:bank-card-2-line"
    >
      <template #actions>
        <el-button type="primary" @click="handlePrint" :disabled="!contract.id">
          <el-icon><Printer /></el-icon>&nbsp;In hợp đồng
        </el-button>
      </template>
    </ReportPageHeader>

    <!-- KPI Cards Row -->
    <div
      class="reporting-kpi-grid mb-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
    >
      <ArtStatsCard
        title="Số hợp đồng TC"
        :count="contract.contractNumber || '-'"
        description="Mã hợp đồng đang theo dõi"
        icon="ri:hashtag"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Tiền giải ngân dự kiến"
        :count="formatCurrency(contract.disbursement?.expectedAmount ?? 0)"
        description="Số tiền công ty tài chính cam kết"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Trả góp/tháng"
        :count="
          formatCurrency(contract.creditPackage?.monthlyPaymentAmount ?? 0)
        "
        :description="`Kỳ hạn: ${contract.creditPackage?.termMonths ?? '-'} tháng`"
        icon="ri:wallet-3-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Trạng thái"
        :count="getStatusLabel(contract.status)"
        description="Vòng đời giải ngân"
        icon="ri:shield-check-line"
        icon-style="bg-report-gray"
      />
    </div>

    <!-- Progress Pipeline -->
    <el-card
      shadow="never"
      class="mb-2 pipeline-card"
      body-style="padding: 12px 16px;"
    >
      <div class="text-sm text-gray-500 mb-2 font-medium">
        Trạng thái vòng đời giải ngân
      </div>

      <div class="relative flex w-full overflow-x-auto pb-2">
        <div
          class="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 z-0 min-w-[200px]"
        ></div>
        <div
          class="absolute top-4 left-[12.5%] h-0.5 bg-report-red z-0 transition-all duration-300 min-w-[50px]"
          :style="{
            width: `${Math.min(Math.max(pipelineActiveStep, 0), 3) * 25}%`,
          }"
        ></div>

        <div
          v-for="(step, index) in [
            'Đang gửi thẩm định',
            'Chờ phê duyệt',
            'Chờ giải ngân',
            'Đã giải ngân',
          ]"
          :key="index"
          class="flex-1 flex flex-col items-center relative z-10 min-w-[80px]"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 bg-white transition-colors duration-300 flex-shrink-0"
            :class="[
              pipelineActiveStep > index
                ? 'border-report-red text-report-red'
                : '',
              pipelineActiveStep === index
                ? 'border-report-red bg-report-red text-white'
                : '',
              pipelineActiveStep < index ? 'border-gray-300 text-gray-400' : '',
            ]"
          >
            <el-icon v-if="pipelineActiveStep > index"><Check /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div
            class="mt-1 text-center text-sm px-1 w-full wrap-break-word"
            :class="
              pipelineActiveStep >= index
                ? 'text-gray-900 font-medium'
                : 'text-gray-400'
            "
          >
            {{ step }}
          </div>
        </div>
      </div>
    </el-card>

    <div v-if="showDisbursementLateAlert" class="mb-2">
      <el-alert
        type="error"
        :closable="false"
        show-icon
        title="Cảnh báo chậm giải ngân"
        :description="lateAlertDescription"
      />
    </div>

    <div v-if="showCavetStuckAlert" class="mb-2">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="Cảnh báo treo Cavet"
        description="Danh sách các xe quá 7 ngày chưa giao trả Cavet đã tất toán nợ gốc"
      />
    </div>

    <el-row :gutter="12" class="responsive-layout">
      <!-- Left -->
      <el-col :span="10">
        <el-card
          shadow="never"
          class="form-card"
          body-style="padding: 12px; min-height: 420px;"
        >
          <template #header>
            <div class="card-header font-bold py-2">
              Thông tin Finance Contract
            </div>
          </template>

          <el-descriptions
            :column="1"
            border
            size="small"
            :content-external-class="'py-1 px-2'"
          >
            <el-descriptions-item label="Mã hợp đồng tài chính">{{
              contract.contractNumber || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Sales Order ID">{{
              contract.salesOrderId || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Khách hàng">{{
              contract.customer360?.fullName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Công ty tài chính">{{
              contract.financialPartner?.name || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Gói tín dụng">
              <div class="text-sm">
                <div>
                  Kỳ hạn: {{ contract.creditPackage?.termMonths ?? "-" }} tháng
                </div>
                <div>
                  Biên độ lãi:
                  {{ contract.creditPackage?.interestRateRange || "-" }}
                </div>
                <div>
                  Trả góp/tháng:
                  {{
                    formatCurrency(
                      contract.creditPackage?.monthlyPaymentAmount ?? 0,
                    )
                  }}
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider class="my-2" />

          <!-- Upload evidence -->
          <div class="mb-2">
            <h4 class="mb-1 font-bold text-sm">
              Chứng từ đối soát chuyển khoản giải ngân
            </h4>
            <p class="text-xs text-gray-500 mb-1">
              Tải lên ảnh/bản scan ủy nhiệm chi/bill chuyển khoản từ công ty tài
              chính.
            </p>
            <el-upload
              drag
              :http-request="customUploadRequest"
              :disabled="!canUploadEvidence"
              class="w-full"
            >
              <el-icon class="el-icon--upload">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text py-1">
                Kéo thả file hoặc <em>Bấm vào đây</em> để tải lên
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  Chỉ hỗ trợ PDF/JPG/PNG (tối đa 10MB)
                </div>
              </template>
            </el-upload>

            <div
              v-if="contract.evidence?.disbursementTransferProofUrl"
              class="mt-1 text-green-600 text-xs"
            >
              Đã tải lên chứng từ đối soát.
            </div>
          </div>

          <el-divider class="my-2" />

          <!-- Cavet state -->
          <div class="mb-2">
            <h4 class="mb-1 font-bold text-sm">Trường quản lý Cavet gốc</h4>
            <el-radio-group v-model="cavetForm.state" class="mt-1">
              <el-radio label="FinancialCompanyHolds" class="mb-1"
                >Công ty tài chính giữ</el-radio
              >
              <el-radio label="StoreHoldsOnBehalf" class="mb-1"
                >Cửa hàng giữ hộ</el-radio
              >
              <el-radio label="DeliveredToCustomer" class="mb-1"
                >Đã giao khách</el-radio
              >
            </el-radio-group>

            <div v-if="cavetForm.state === 'StoreHoldsOnBehalf'" class="mt-1">
              <el-date-picker
                v-model="cavetForm.receivedDate"
                type="date"
                placeholder="Ngày nhận"
                popper-class="finance-detail-date-popper"
                class="w-full"
              />
              <el-input
                v-model="cavetForm.receiverName"
                placeholder="Người nhận vật lý"
                class="mt-1"
              />
              <el-input
                v-model="cavetForm.storageLocation"
                placeholder="Vị trí lưu kho tủ hồ sơ"
                class="mt-1"
              />
            </div>
          </div>

          <el-button
            type="primary"
            class="w-full"
            :disabled="!canUpdateCavet"
            @click="handleSaveCavet"
          >
            Lưu trạng thái Cavet
          </el-button>

          <el-divider class="my-2" />

          <!-- Validation card -->
          <div class="mt-2">
            <h4 class="mb-1 font-bold text-sm">
              Đối soát giải ngân (Validation Card)
            </h4>
            <p class="text-xs text-gray-500 mb-1">
              Nhập số tiền giải ngân thực tế để hệ thống tự động đối chiếu.
            </p>

            <el-input-number
              v-model="disbursementForm.actualAmount"
              :min="0"
              :step="1000"
              :precision="0"
              class="w-full"
              :class="{
                'is-invalid':
                  !isAmountMatched && disbursementForm.actualAmount != null,
              }"
              placeholder="Số tiền giải ngân thực tế"
            />

            <div
              class="mt-1 text-sm"
              :class="isAmountMatched ? 'text-green-600' : 'text-red-600'"
            >
              {{
                isAmountMatched
                  ? "Khớp lệnh 100% ✓"
                  : "Lệch tiền đối soát! (bị bồi đắp nếu sai 1 đồng)"
              }}
            </div>

            <el-date-picker
              v-model="disbursementForm.actualDate"
              type="date"
              placeholder="Ngày giải ngân thực tế"
              popper-class="finance-detail-date-popper"
              class="w-full mt-1"
            />

            <el-button
              type="success"
              class="w-full mt-2"
              :disabled="
                !canSubmitDisbursementPayment || !disbursementForm.actualAmount
              "
              @click="handleSubmitDisbursementPayment"
            >
              Xác nhận đã giải ngân
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Right -->
      <el-col :span="14">
        <el-card
          shadow="never"
          class="preview-card"
          body-style="padding: 0; background-color: #f3f4f6; min-height: 500px;"
        >
          <div
            class="preview-toolbar p-1 bg-gray-200 border-b flex items-center justify-between h-8"
          >
            <span class="text-xs font-bold text-gray-600"
              >Trình xem trước Finance Contract (A4)</span
            >
            <el-button
              type="primary"
              size="small"
              @click="handlePrint"
              :disabled="!contract.id"
              class="print-btn !py-1 !px-2 text-xs"
            >
              <el-icon><Printer /></el-icon>
              <span class="ml-1">In</span>
            </el-button>
          </div>

          <div
            class="a4-preview-container p-2 md:p-3"
            style="min-height: calc(100% - 36px)"
          >
            <div
              class="a4-paper bg-white shadow-lg p-2 md:p-3 mx-auto"
              style="width: 210mm; max-width: 100%; min-height: 297mm"
            >
              <h2 class="text-center font-bold text-base mb-1">
                HỢP ĐỒNG TÀI CHÍNH TRẢ GÓP
              </h2>
              <p class="text-right italic text-xs mb-2">
                Số: {{ contract.contractNumber || "-" }}
              </p>

              <div class="section mb-2">
                <h3 class="font-bold text-sm mb-1">THÔNG TIN KHÁCH HÀNG</h3>
                <p class="text-sm">
                  <strong>Họ tên:</strong>
                  {{ contract.customer360?.fullName || "-" }}
                </p>
                <p class="text-sm">
                  <strong>CCCD:</strong> {{ contract.customer360?.cccd || "-" }}
                </p>
                <p class="text-sm">
                  <strong>Địa chỉ:</strong>
                  {{ contract.customer360?.address || "-" }}
                </p>
              </div>

              <div class="section mb-2">
                <h3 class="font-bold text-sm mb-1">
                  THÔNG TIN ĐỐI TÁC TÀI CHÍNH
                </h3>
                <p class="text-sm">
                  <strong>Công ty:</strong>
                  {{ contract.financialPartner?.name || "-" }}
                </p>
                <p class="text-sm">
                  <strong>Liên hệ đầu mối:</strong>
                  {{ contract.financialPartner?.contactPhone || "-" }}
                </p>
              </div>

              <div class="section mb-2">
                <h3 class="font-bold text-sm mb-1">GÓI VAY TRẢ GÓP</h3>
                <p class="text-sm">
                  <strong>Kỳ hạn:</strong>
                  {{ contract.creditPackage?.termMonths ?? "-" }} tháng
                </p>
                <p class="text-sm">
                  <strong>Lãi suất:</strong>
                  {{ contract.creditPackage?.interestRateRange || "-" }}
                </p>
                <p class="text-sm">
                  <strong>Trả góp/tháng:</strong>
                  {{
                    formatCurrency(
                      contract.creditPackage?.monthlyPaymentAmount ?? 0,
                    )
                  }}
                </p>
              </div>

              <div class="section mb-2">
                <h3 class="font-bold text-sm mb-1">GIẢI NGÂN</h3>
                <p class="text-sm">
                  <strong>Ngày dự kiến:</strong>
                  {{ formatDate(contract.disbursement?.expectedDate) }}
                </p>
                <p class="text-sm">
                  <strong>Ngày thực tế:</strong>
                  {{ formatDate(contract.disbursement?.actualDate) }}
                </p>
                <p class="text-sm">
                  <strong>Tiền dự kiến:</strong>
                  {{
                    formatCurrency(contract.disbursement?.expectedAmount ?? 0)
                  }}
                </p>
                <p>
                  <strong>Tiền thực tế:</strong>
                  {{ formatCurrency(contract.disbursement?.actualAmount ?? 0) }}
                </p>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">CAVET GỐC</h3>
                <p>
                  <strong>Trạng thái:</strong> {{ cavetLabel(cavetForm.state) }}
                </p>
                <p v-if="cavetForm.state === 'StoreHoldsOnBehalf'">
                  <strong>Ngày nhận:</strong>
                  {{ formatDateShort(cavetForm.receivedDate) }}
                </p>
                <p v-if="cavetForm.state === 'StoreHoldsOnBehalf'">
                  <strong>Người nhận:</strong>
                  {{ cavetForm.receiverName || "-" }}
                </p>
                <p v-if="cavetForm.state === 'StoreHoldsOnBehalf'">
                  <strong>Vị trí lưu:</strong>
                  {{ cavetForm.storageLocation || "-" }}
                </p>
              </div>

              <div class="signature-section mt-10 flex justify-between px-10">
                <div class="text-center">
                  <p class="font-bold">ĐẠI DIỆN SHOWROOM</p>
                  <p class="italic text-xs">(Ký, ghi rõ họ tên và đóng dấu)</p>
                </div>
                <div class="text-center">
                  <p class="font-bold">KHÁCH HÀNG</p>
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
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { UploadFilled, Check, Printer } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  FinanceContractApi,
  type FinanceContractDetailDto,
  type FinanceContractStatus,
} from "@/infrastructure/api/finance-contract.api";
import ReportPageHeader from "@/views/analytics-reporting/components/ReportPageHeader.vue";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";

const route = useRoute();

const contract = ref<FinanceContractDetailDto>({
  id: "",
  salesOrderId: "",
  contractNumber: "",
  status: "Pending",
} as any);

const disbursementForm = reactive<{
  actualAmount: number | null;
  actualDate: string | null;
}>({
  actualAmount: null,
  actualDate: null,
});

const cavetForm = reactive<{
  state: "FinancialCompanyHolds" | "StoreHoldsOnBehalf" | "DeliveredToCustomer";
  receivedDate?: string | null;
  receiverName?: string;
  storageLocation?: string;
}>({
  state: "FinancialCompanyHolds",
  receivedDate: null,
  receiverName: "",
  storageLocation: "",
});

const _contractStatusType = computed(() => {
  const st = contract.value.status as FinanceContractStatus;
  if (st === "Disbursed") return "success";
  return "warning";
});

const getStatusLabel = (st: string): string => {
  switch (st) {
    case "Pending":
      return "Chờ giải ngân";
    case "Disbursed":
      return "Đã giải ngân";
    default:
      return st;
  }
};

const pipelineActiveStep = computed(() => {
  const st = contract.value.status as FinanceContractStatus;
  switch (st) {
    case "Pending":
      return 2;
    case "Disbursed":
      return 3;
    default:
      return 0;
  }
});

const expectedAmount = computed(
  () => contract.value.disbursement?.expectedAmount ?? 0,
);

const isAmountMatched = computed(() => {
  if (disbursementForm.actualAmount == null) return true;
  return Number(disbursementForm.actualAmount) === Number(expectedAmount.value);
});

const canUploadEvidence = computed(() => {
  return contract.value.status === "Pending";
});

const canUpdateCavet = computed(() => {
  return contract.value.status === "Disbursed";
});

const canSubmitDisbursementPayment = computed(() => {
  return contract.value.status === "Pending" && isAmountMatched.value;
});

const showDisbursementLateAlert = computed(() => {
  const exp = contract.value.disbursement?.expectedDate;
  if (!exp) return false;
  if (contract.value.status === "Disbursed") return false;
  const now = new Date().getTime();
  const t = new Date(exp).getTime();
  return now > t;
});

const lateAlertDescription = computed(() => {
  const exp = contract.value.disbursement?.expectedDate;
  const phone = contract.value.financialPartner?.contactPhone;
  const expText = exp ? formatDate(exp) : "";
  return `Hệ thống phát hiện đã quá hạn dự kiến (${expText}).${phone ? ` SĐT đầu mối: ${phone}` : ""}`;
});

// Placeholder (Backend sẽ cung cấp danh sách xe treo Cavet ở Dashboard)
const showCavetStuckAlert = computed(() => false);

const cavetLabel = (state: string) => {
  switch (state) {
    case "FinancialCompanyHolds":
      return "Công ty tài chính giữ";
    case "StoreHoldsOnBehalf":
      return "Cửa hàng giữ hộ";
    case "DeliveredToCustomer":
      return "Đã giao khách";
    default:
      return state;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const formatDateShort = (dateString?: string | null) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString);
  return d.toLocaleDateString("vi-VN");
};

const handlePrint = () => {
  window.print();
};

const customUploadRequest = async (options: any) => {
  try {
    const id = contract.value.id;
    if (!id) return;

    const file: File = options.file;
    await FinanceContractApi.uploadDisbursementEvidence({
      financeContractId: id,
      file,
    });

    ElMessage.success("Tải lên chứng từ thành công.");
    await fetchDetail();
    options.onSuccess?.({});
  } catch {
    ElMessage.error("Tải lên thất bại.");
  }
};

const handleSaveCavet = async () => {
  if (!canUpdateCavet.value) return;
  await FinanceContractApi.updateCavetState(contract.value.id, {
    state: cavetForm.state,
    receivedDate: cavetForm.receivedDate || undefined,
    receiverName: cavetForm.receiverName,
    storageLocation: cavetForm.storageLocation,
  });
  ElMessage.success("Đã lưu trạng thái Cavet.");
  await fetchDetail();
};

const handleSubmitDisbursementPayment = async () => {
  if (
    !canSubmitDisbursementPayment.value ||
    disbursementForm.actualAmount == null
  )
    return;

  await FinanceContractApi.updateDisbursementPayment(
    contract.value.id,
    disbursementForm.actualAmount,
    disbursementForm.actualDate || undefined,
  );

  ElMessage.success("Đã xác nhận giải ngân.");
  await fetchDetail();
};

const fetchDetail = async () => {
  const id = (route.params.id as string) || (route.query.id as string);
  if (!id) return;
  try {
    const res = await FinanceContractApi.getFinanceContractDetail(id);
    contract.value = res;

    if (res.cavet?.state) {
      cavetForm.state = res.cavet.state;
      cavetForm.receivedDate = res.cavet.receivedDate || null;
      cavetForm.receiverName = res.cavet.receiverName || "";
      cavetForm.storageLocation = res.cavet.storageLocation || "";
    }

    // optional: preload disbursement form
    disbursementForm.actualAmount = res.disbursement?.actualAmount ?? null;
    disbursementForm.actualDate = res.disbursement?.actualDate ?? null;
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message ??
        "Không tải được chi tiết hợp đồng tài chính.",
    );
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.finance-contract-detail {
  padding: 8px 12px;
  color: var(--art-color);

  // Responsive layout: stack on mobile, side-by-side on desktop
  @media (width <= 768px) {
    .responsive-layout {
      display: flex;
      flex-direction: column;

      .el-col {
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  }

  // Reduce whitespace
  :deep(.el-card__header) {
    padding: 8px 12px;
  }

  :deep(.el-descriptions__cell) {
    padding: 6px 10px;
  }

  :deep(.el-divider) {
    margin: 10px 0;
  }
}

.pipeline-card :deep(.el-card__body) {
  padding: 18px 20px;
}

.bg-report-red {
  background-color: #e84a4a !important;
}

.bg-report-red-light {
  background-color: #ff6b6b !important;
}

.bg-report-red-dark {
  background-color: #c53a3a !important;
}

.bg-report-gray {
  background-color: #2d2d2d !important;
}

.text-report-red {
  color: #ff6b6b !important;
}

.border-report-red {
  border-color: #e84a4a !important;
}

.finance-contract-detail :deep(.el-card) {
  color: var(--art-color);
  background: var(--default-box-color);
  border-color: rgb(var(--art-color-rgb), 9%);
}

.finance-contract-detail :deep(.el-card__header),
.finance-contract-detail :deep(.el-card__body),
.finance-contract-detail :deep(.el-descriptions__label),
.finance-contract-detail :deep(.el-descriptions__content),
.finance-contract-detail :deep(.el-form-item__label),
.finance-contract-detail :deep(.el-radio__label),
.finance-contract-detail :deep(.el-upload__text),
.finance-contract-detail :deep(.el-upload__tip) {
  color: var(--art-color);
}

.finance-contract-detail :deep(.el-card__body) {
  background: var(--default-box-color) !important;
}

.finance-contract-detail :deep(.el-descriptions__label),
.finance-contract-detail :deep(.el-descriptions__content) {
  background: var(--default-bg-color);
  border-color: rgb(var(--art-color-rgb), 9%);
}

.finance-contract-detail :deep(.el-divider) {
  border-color: rgb(var(--art-color-rgb), 9%);
}

.finance-contract-detail :deep(.el-input__wrapper),
.finance-contract-detail :deep(.el-input-number),
.finance-contract-detail :deep(.el-date-editor),
.finance-contract-detail :deep(.el-upload-dragger) {
  color: var(--art-color);
  background: var(--art-gray-100);
  border-color: rgb(var(--art-color-rgb), 14%);
  box-shadow: none;
}

.finance-contract-detail :deep(.el-input__inner) {
  color: var(--art-color);
}

.finance-contract-detail .text-gray-400,
.finance-contract-detail .text-gray-500,
.finance-contract-detail .text-gray-600,
.finance-contract-detail .text-gray-900 {
  color: var(--art-color) !important;
}

.finance-contract-detail .bg-gray-200,
.finance-contract-detail .bg-white {
  background-color: var(--default-bg-color) !important;
}

.finance-contract-detail .border-gray-100,
.finance-contract-detail .border-gray-300,
.finance-contract-detail .border-b,
.finance-contract-detail .border-l {
  border-color: rgb(var(--art-color-rgb), 14%) !important;
}

.finance-contract-detail .preview-toolbar {
  color: var(--art-color);
  background: var(--art-gray-100) !important;
  border-color: rgb(var(--art-color-rgb), 9%) !important;
}

.finance-contract-detail .a4-paper,
.finance-contract-detail .a4-paper * {
  color: #000 !important;
  background-color: #fff !important;
}

.is-invalid {
  :deep(.el-input__wrapper) {
    border-color: #f5222d !important;
    box-shadow: 0 0 0 2px rgb(245 34 45 / 10%) !important;
  }
}

.a4-preview-container {
  min-height: 500px;
  overflow-y: auto;

  @media (width <= 768px) {
    min-height: 400px;
  }
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

:deep(.el-step__title) {
  white-space: nowrap;
}

:deep(.el-step__description) {
  white-space: nowrap;
}
</style>

<style lang="scss">
.finance-detail-date-popper.el-popper {
  --el-bg-color-overlay: var(--default-box-color);
  --el-border-color-light: rgb(var(--art-color-rgb), 9%);
  --el-text-color-primary: var(--art-color);
  --el-text-color-regular: var(--art-color);
  --el-text-color-secondary: var(--art-color);

  background: var(--default-box-color);
  border-color: rgb(var(--art-color-rgb), 9%);
}

.finance-detail-date-popper .el-picker-panel,
.finance-detail-date-popper .el-picker-panel__body,
.finance-detail-date-popper .el-picker-panel__footer {
  color: var(--art-color);
  background: var(--default-box-color);
  border-color: rgb(var(--art-color-rgb), 9%);
}

.finance-detail-date-popper .el-date-table th,
.finance-detail-date-popper .el-date-table td.available,
.finance-detail-date-popper .el-date-picker__header-label,
.finance-detail-date-popper .el-picker-panel__icon-btn {
  color: var(--art-color);
}
</style>
