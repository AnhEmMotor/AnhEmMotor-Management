<template>
  <div class="p-4">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold">{{ title }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>

      <div class="flex items-center gap-2">
        <ElButton :icon="ArrowLeft" @click="goBack" :disabled="submitting">
          Quay lại
        </ElButton>

        <ElButton
          type="primary"
          :loading="submitting"
          :disabled="!canComplete || submitting"
          @click="handleComplete"
        >
          💾 Duyệt hoàn tất bảo hành
        </ElButton>
      </div>
    </div>

    <!-- Pipeline status -->
    <div class="mt-4">
      <ElCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span class="font-semibold"
              >🛡️ CHI TIẾT HỒ SƠ BẢO HÀNH: {{ claim?.claimNumber }}</span
            >
            <ElTag :type="statusTagType" effect="dark">
              {{ statusText }}
            </ElTag>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="text-sm text-slate-600">
            <div class="font-semibold text-slate-800 mb-1">
              Mã đơn hàng / Mã xe liên kết
            </div>
            <div>
              <span class="font-medium">Số khung (VIN):</span>
              {{ claim?.vehicleVin ?? "N/A" }}
            </div>
            <div class="mt-1">
              <span class="font-medium">Biển số:</span>
              {{ claim?.vehiclePlate ?? "N/A" }}
            </div>
          </div>

          <div>
            <div class="font-semibold text-slate-800 mb-1">
              ⏳ Tiến độ pipeline
            </div>
            <div class="flex flex-wrap gap-2">
              <ElTag
                v-for="step in pipelineSteps"
                :key="step.key"
                :type="step.isActive ? 'success' : 'info'"
                effect="plain"
              >
                {{ step.label }}
              </ElTag>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 2 columns layout 70/30 -->
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-10 gap-4">
      <!-- Left 70% -->
      <div class="lg:col-span-7">
        <ElCard>
          <template #header>
            <span class="font-semibold"
              >(CỘT TRÁI - 70%): CHI TIẾT NGHIỆP VỤ</span
            >
          </template>

          <!-- 1. Minh chứng kỹ thuật -->
          <div class="mb-5">
            <div class="font-semibold mb-2">
              📋 1. MINH CHỨNG SỰ CỐ KỸ THUẬT
            </div>

            <div class="text-sm">
              <div class="font-medium text-slate-700">Mô tả</div>
              <div class="mt-1 text-slate-900">
                {{ claim?.issueDescription ?? "N/A" }}
              </div>
            </div>

            <div class="mt-4">
              <div class="font-medium text-slate-700">
                Hình ảnh & Video sự cố
              </div>
              <div
                v-if="mediaUrls.length === 0"
                class="mt-2 text-sm text-slate-500"
              >
                Chưa có media.
              </div>
              <div v-else class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  v-for="(u, i) in mediaUrls"
                  :key="u + '_' + i"
                  class="border rounded p-2"
                >
                  <video
                    v-if="isVideo(u)"
                    controls
                    class="w-full max-h-40 rounded"
                  >
                    <source :src="u" />
                  </video>
                  <img
                    v-else
                    :src="u"
                    class="w-full max-h-40 object-cover rounded"
                  />
                  <div class="mt-2 text-xs text-slate-500 break-all">
                    {{ u }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Danh sách linh kiện yêu cầu bồi hoàn -->
          <div class="mb-5">
            <div class="font-semibold mb-2">
              ⚙️ 2. DANH SÁCH LINH KIỆN YÊU CẦU BỒI HOÀN
            </div>

            <ElTable :data="claim?.parts ?? []" border style="width: 100%">
              <ElTableColumn
                prop="partName"
                label="Tên Phụ Tùng"
                min-width="220"
              />
              <ElTableColumn
                prop="partCode"
                label="Mã Phụ Tùng"
                min-width="160"
              />
              <ElTableColumn label="Đơn giá công bố" min-width="140">
                <template #default="scope">
                  {{ formatVndZero(scope.row.unitPrice) }}
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="statusText"
                label="Trạng Thái Thẩm Định"
                min-width="180"
              />
            </ElTable>
          </div>

          <!-- 3. Xử lý đổi trả đặc biệt -->
          <div>
            <div class="font-semibold mb-2">
              ❌ 3. XỬ LÝ ĐỔI TRẢ ĐẶC BIỆT (THU HỒI XE LỖI)
            </div>

            <div class="text-sm text-slate-600 mb-3">
              💡 Chỉ sử dụng khi lỗi thuộc diện cần Thu hồi phương tiện.
            </div>

            <div
              v-if="claim?.isRecall"
              class="rounded-lg border border-amber-200 bg-amber-50 p-4"
            >
              <div class="font-semibold mb-2">
                ⚠️ Kích hoạt Thu hồi xe lỗi & Cập nhật số khung kho tổng
              </div>
              <ElButton
                type="warning"
                :disabled="submitting"
                @click="handleRecall"
              >
                Kích hoạt Thu hồi & Đổi xe mới
              </ElButton>
            </div>

            <div v-else class="text-sm text-slate-500">
              Không thuộc diện thu hồi.
            </div>
          </div>
        </ElCard>
      </div>

      <!-- Right 30% -->
      <div class="lg:col-span-3">
        <ElCard>
          <template #header>
            <span class="font-semibold">(CỘT PHẢI - 30%): ĐỊNH DANH</span>
          </template>

          <!-- Vehicle & customer -->
          <div class="mb-5">
            <div class="font-semibold mb-2">🪪 THÔNG TIN PHƯƠNG TIỆN</div>

            <div class="text-sm text-slate-700">
              <div>
                <span class="font-medium">Chủ xe:</span>
                {{ claim?.customerName ?? "N/A" }}
              </div>
              <div class="mt-1">
                <span class="font-medium">SĐT:</span>
                {{ claim?.customerPhone ?? "N/A" }}
              </div>
              <div class="mt-1">
                <span class="font-medium">Địa chỉ:</span>
                {{ claim?.customerAddress ?? "N/A" }}
              </div>

              <div class="mt-3">
                <div class="font-medium mb-1">Thông tin phương tiện</div>
                <div class="mt-1">
                  <span class="font-medium">Màu:</span>
                  {{ claim?.vehicleColor ?? "N/A" }}
                </div>
                <div class="mt-1">
                  <span class="font-medium">Đời xe:</span>
                  {{ claim?.vehicleYear ?? "N/A" }}
                </div>
                <div class="mt-1">
                  <span class="font-medium">Hạn BH:</span>
                  {{ claim?.warrantyRemaining ?? "N/A" }}
                </div>
              </div>
            </div>
          </div>

          <!-- Manufacturer review -->
          <div class="mb-5">
            <div class="font-semibold mb-2">🏢 ĐỐI SOÁT HÃNG</div>
            <div class="text-sm text-slate-700">
              <div>
                <span class="font-medium">Trung tâm tiếp nhận:</span>
                {{ claim?.serviceCenterName ?? "N/A" }}
              </div>
              <div class="mt-2">
                <span class="font-medium">Mã số hồ sơ hãng:</span>
                {{ claim?.manufacturerClaimNumber ?? "N/A" }}
              </div>
              <div class="mt-2">
                <span class="font-medium">Quyết định của Hãng:</span>
                {{ claim?.manufacturerDecision ?? "N/A" }}
              </div>
            </div>
          </div>

          <!-- Customer costs -->
          <div>
            <div class="font-semibold mb-2">💵 CHI PHÍ ĐỐI VỚI KHÁCH</div>
            <div class="space-y-2 text-sm text-slate-700">
              <div><span class="font-medium">Tiền linh kiện:</span> 0đ</div>
              <div><span class="font-medium">Tiền công thợ:</span> 0đ</div>
              <div><span class="font-medium">➔ Tổng thu:</span> 0đ</div>
              <div class="text-xs text-slate-500">
                (Policy miễn phí 100% theo yêu cầu đối soát bảo hành)
              </div>
            </div>
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";

type WarrantyClaimPart = {
  id: number;
  partName: string;
  partCode: string;
  unitPrice: number;
  statusText?: string;
};

type WarrantyClaimDetail = {
  claimNumber: string;
  status: string;
  issueDescription: string;
  mediaUrls: string[];
  serviceCenterName?: string;
  manufacturerClaimNumber?: string;
  manufacturerDecision?: string;
  isRecall: boolean;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  vehicleVin?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  vehicleYear?: string;
  warrantyRemaining?: string;
  parts: WarrantyClaimPart[];
};

const router = useRouter();

const submitting = ref(false);

const claim = ref<WarrantyClaimDetail | null>(null);

const title = computed(() => "🛡️ Chi tiết hồ sơ bảo hành");
const subtitle = computed(() =>
  claim.value ? `Mã hồ sơ: ${claim.value.claimNumber}` : "Đang tải...",
);

const mediaUrls = computed(() => claim.value?.mediaUrls ?? []);

const statusText = computed(() => claim.value?.status ?? "N/A");

const statusTagType = computed(() => {
  const s = (claim.value?.status ?? "").toLowerCase();
  if (
    s.includes("approved") ||
    s.includes("completed") ||
    s.includes("replaced")
  )
    return "success";
  if (s.includes("rejected")) return "danger";
  return "info";
});

const pipelineSteps = computed(() => {
  // Map đơn giản theo yêu cầu UI (dựa trên chuỗi status từ backend response)
  const s = (claim.value?.status ?? "").toLowerCase();

  const steps = [
    {
      key: "received",
      label: "✓ Tiếp nhận",
      isActive:
        s.includes("received") ||
        s.includes("pendingmanufacturer") ||
        s.includes("approved") ||
        s.includes("replaced") ||
        s.includes("completed"),
    },
    {
      key: "pendingmanufacturer",
      label: "● CHỜ HÃNG THẨM ĐỊNH",
      isActive: s.includes("pendingmanufacturer"),
    },
    {
      key: "approved",
      label: "Đã duyệt bồi hoàn",
      isActive: s.includes("approved"),
    },
    {
      key: "replaced",
      label: "Thợ thay thế",
      isActive: s.includes("replaced"),
    },
    {
      key: "completed",
      label: "Hoàn tất - Đóng hồ sơ",
      isActive: s.includes("completed"),
    },
  ];

  return steps;
});

const canComplete = computed(() => {
  const s = (claim.value?.status ?? "").toLowerCase();
  return s !== "" && !s.includes("completed");
});

function goBack() {
  router.push({ name: "ServiceWarrantyRequests" }).catch(() => null);
}

function isVideo(url: string) {
  return /(mp4|webm|ogg)$/i.test(url);
}

function formatVndZero(_value: number) {
  return "0đ";
}

async function load() {
  // NOTE: backend endpoints chưa được xác nhận trong repo hiện tại.
  // Page sẽ hoạt động bằng mock cho đến khi bạn cho phép mình implement API.
  // Khi backend sẵn endpoint, mình sẽ thay phần mock bằng call api.

  // Mock data (đúng shape UI)
  claim.value = {
    claimNumber: "#WAR-2026-001",
    status: "Received",
    issueDescription: "Xe bị hụt ga đầu, chết máy đột ngột khi tăng tốc.",
    mediaUrls: [],
    serviceCenterName: "Nhà máy Honda Việt Nam",
    manufacturerClaimNumber: "#HD-CLAIM-9982",
    manufacturerDecision: "Chờ phản hồi từ hãng",
    isRecall: false,
    customerName: "Nguyễn Văn A",
    customerPhone: "0900000000",
    customerAddress: "Quận/Huyện - TP",
    vehicleVin: "AEM6899XXXXXX",
    vehiclePlate: "60-A1 555.55",
    vehicleColor: "Đỏ",
    vehicleYear: "2022",
    warrantyRemaining: "Còn 18 tháng",
    parts: [
      {
        id: 1,
        partName: "Cụm bơm xăng",
        partCode: "P-HON-PUMP-01",
        unitPrice: 123456,
        statusText: "⏳ Chờ phản hồi từ hãng",
      },
    ],
  };
}

async function handleComplete() {
  if (!canComplete.value) return;
  submitting.value = true;
  try {
    // Idempotency + transaction sẽ do backend chịu.
    // UI mock:
    claim.value = {
      ...(claim.value as WarrantyClaimDetail),
      status: "Completed",
      manufacturerDecision: "Đã duyệt - Hoàn tất",
    };
  } finally {
    submitting.value = false;
  }
}

async function handleRecall() {
  // UI mock recall
  submitting.value = true;
  try {
    claim.value = {
      ...(claim.value as WarrantyClaimDetail),
      manufacturerDecision: "Đã kích hoạt thu hồi & đổi xe",
    };
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>
