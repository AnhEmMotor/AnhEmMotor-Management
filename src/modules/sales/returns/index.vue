<template>
  <div class="returns-page flex flex-col gap-4 h-full">
    <!-- Split Screen Layout -->
    <div class="split-layout flex gap-4" style="height: calc(100vh - 120px)">
      <!-- LEFT: Request List -->
      <div class="left-panel w-1/2 flex flex-col gap-3">
        <ElCard class="list-card flex flex-col" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-800"
                >Danh sách yêu cầu ({{ filteredRequests.length }})</span
              >
              <ElTag type="info" size="small"
                >{{ pendingCount }} chờ duyệt</ElTag
              >
            </div>
          </template>

          <!-- Search & Filter -->
          <div class="filter-bar flex gap-2 mb-3">
            <ElInput
              v-model="searchQuery"
              placeholder="Tìm theo mã RMA, mã đơn, khách hàng..."
              clearable
              size="small"
              class="flex-1"
              @input="handleSearch"
            >
              <template #prefix>
                <ElIcon><Search /></ElIcon>
              </template>
            </ElInput>
            <ElSelect
              v-model="filterType"
              placeholder="Loại"
              size="small"
              clearable
              @change="handleSearch"
            >
              <ElOption label="🔄 Hủy đơn" value="cancel" />
              <ElOption label="📦 Trả hàng" value="return" />
            </ElSelect>
            <ElSelect
              v-model="filterStatus"
              placeholder="Trạng thái"
              size="small"
              clearable
              @change="handleSearch"
            >
              <ElOption label="⏳ Chờ duyệt" value="pending" />
              <ElOption label="✅ Đã duyệt" value="approved" />
              <ElOption label="❌ Đã từ chối" value="rejected" />
            </ElSelect>
          </div>

          <!-- Request List -->
          <div class="request-list flex-1 overflow-y-auto">
            <div
              v-for="req in filteredRequests"
              :key="req.id"
              class="request-item p-3 rounded cursor-pointer mb-2 border transition-all"
              :class="getRequestItemClass(req)"
              @click="selectRequest(req)"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm">{{ req.rmaCode }}</span>
                  <ElTag
                    :type="req.type === 'cancel' ? 'warning' : 'danger'"
                    size="small"
                    effect="plain"
                  >
                    {{ req.type === "cancel" ? "Hủy đơn" : "Trả hàng" }}
                  </ElTag>
                </div>
                <ElTag :type="getUrgencyTagType(req.urgency)" size="small">
                  {{ getUrgencyLabel(req.urgency) }}
                </ElTag>
              </div>
              <div class="text-xs text-gray-600 mb-1">
                Đơn gốc:
                <span class="font-medium">{{ req.originalOrderCode }}</span>
              </div>
              <div class="text-xs text-gray-600 mb-1">
                Khách: <span class="font-medium">{{ req.customerName }}</span>
              </div>
              <div class="text-xs text-gray-500 line-clamp-1">
                {{ req.reason }}
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-400">{{
                  formatDateTime(req.createdAt)
                }}</span>
                <ElTag
                  :type="getRefundStatusTagType(req.refundStatus)"
                  size="small"
                  effect="plain"
                >
                  {{ getRefundStatusLabel(req.refundStatus) }}
                </ElTag>
              </div>
            </div>

            <ElEmpty
              v-if="filteredRequests.length === 0"
              description="Không có yêu cầu nào"
              :image-size="60"
            />
          </div>
        </ElCard>
      </div>

      <!-- RIGHT: Detail Panel -->
      <div class="right-panel w-1/2 flex flex-col gap-3">
        <ElCard v-if="selectedRequest" class="detail-card" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-800">Chi tiết hồ sơ sự cố</span>
              <ElTag type="info" size="small">{{
                selectedRequest.rmaCode
              }}</ElTag>
            </div>
          </template>

          <!-- Request Info Grid -->
          <div class="info-grid grid grid-cols-2 gap-3 mb-4">
            <div class="info-item">
              <span class="text-xs text-gray-500">Mã phiếu xử lý</span>
              <div class="font-bold text-primary">
                {{ selectedRequest.rmaCode }}
              </div>
            </div>
            <div class="info-item">
              <span class="text-xs text-gray-500">Mã đơn hàng gốc</span>
              <div class="font-medium">
                {{ selectedRequest.originalOrderCode }}
              </div>
            </div>
            <div class="info-item">
              <span class="text-xs text-gray-500">Loại yêu cầu</span>
              <div>
                <ElTag
                  :type="
                    selectedRequest.type === 'cancel' ? 'warning' : 'danger'
                  "
                  size="small"
                >
                  {{
                    selectedRequest.type === "cancel"
                      ? "Hủy đơn (trước giao)"
                      : "Trả hàng (sau giao)"
                  }}
                </ElTag>
              </div>
            </div>
            <div class="info-item">
              <span class="text-xs text-gray-500">Mức độ khẩn cấp</span>
              <div>
                <ElTag
                  :type="getUrgencyTagType(selectedRequest.urgency)"
                  size="small"
                >
                  {{ getUrgencyLabel(selectedRequest.urgency) }}
                </ElTag>
              </div>
            </div>
            <div class="info-item">
              <span class="text-xs text-gray-500">Nhân viên tiếp nhận</span>
              <div class="font-medium">{{ selectedRequest.staffName }}</div>
            </div>
            <div class="info-item">
              <span class="text-xs text-gray-500">Thời gian tạo</span>
              <div class="font-medium">
                {{ formatDateTime(selectedRequest.createdAt) }}
              </div>
            </div>
            <div class="info-item">
              <span class="text-xs text-gray-500">Khách hàng</span>
              <div class="font-medium">{{ selectedRequest.customerName }}</div>
            </div>
            <div class="info-item">
              <span class="text-xs text-gray-500">SĐT khách hàng</span>
              <div class="font-medium">{{ selectedRequest.customerPhone }}</div>
            </div>
          </div>

          <!-- Reason -->
          <div class="reason-section mb-4">
            <h4 class="font-bold text-gray-700 mb-2">Lý do khiếu nại</h4>
            <ElAlert type="warning" :closable="false" class="reason-text">
              <span class="text-sm">{{ selectedRequest.reason }}</span>
            </ElAlert>
          </div>

          <!-- Evidence -->
          <div class="evidence-section mb-4">
            <h4 class="font-bold text-gray-700 mb-2">
              Bằng chứng (Hình ảnh / Video)
            </h4>
            <div class="evidence-grid grid grid-cols-4 gap-2">
              <div
                v-for="(evidence, idx) in selectedRequest.evidences"
                :key="idx"
                class="evidence-item border rounded overflow-hidden cursor-pointer hover:border-primary"
                @click="previewEvidence(evidence)"
              >
                <img
                  v-if="evidence.type === 'image'"
                  :src="evidence.url"
                  class="w-full h-24 object-cover"
                  alt="evidence"
                />
                <div
                  v-else
                  class="w-full h-24 bg-gray-100 flex items-center justify-center text-2xl"
                >
                  🎬
                </div>
                <div class="p-1 text-xs text-gray-500 truncate">
                  {{ evidence.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Refund Info -->
          <div class="refund-section mb-4">
            <h4 class="font-bold text-gray-700 mb-2">Thông tin hoàn tiền</h4>
            <div class="refund-info bg-gray-50 p-3 rounded">
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600"
                  >Phương thức thanh toán gốc:</span
                >
                <span class="text-sm font-medium">{{
                  getPaymentMethodLabel(selectedRequest.paymentMethod)
                }}</span>
              </div>
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600">Số tiền hoàn:</span>
                <span class="text-sm font-bold text-red-600">{{
                  formatCurrency(selectedRequest.refundAmount)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Trạng thái hoàn tiền:</span>
                <ElTag
                  :type="getRefundStatusTagType(selectedRequest.refundStatus)"
                  size="small"
                >
                  {{ getRefundStatusLabel(selectedRequest.refundStatus) }}
                </ElTag>
              </div>
            </div>
          </div>

          <!-- Original Order Products -->
          <div class="products-section mb-4">
            <h4 class="font-bold text-gray-700 mb-2">Sản phẩm liên quan</h4>
            <ElTable
              :data="selectedRequest.products"
              border
              size="small"
              max-height="200"
            >
              <ElTableColumn label="Tên sản phẩm" min-width="180">
                <template #default="{ row }">
                  {{ row.productName }}
                </template>
              </ElTableColumn>
              <ElTableColumn label="SL" width="70" align="center">
                <template #default="{ row }">
                  {{ row.quantity }}
                </template>
              </ElTableColumn>
              <ElTableColumn label="Đơn giá" width="120" align="right">
                <template #default="{ row }">
                  {{ formatCurrency(row.price) }}
                </template>
              </ElTableColumn>
              <ElTableColumn label="Thành tiền" width="120" align="right">
                <template #default="{ row }">
                  {{ formatCurrency(row.quantity * row.price) }}
                </template>
              </ElTableColumn>
            </ElTable>
          </div>

          <!-- Rejection Reason (shown when rejected) -->
          <div
            v-if="
              selectedRequest.status === 'rejected' &&
              selectedRequest.rejectionReason
            "
            class="rejection-section mb-4"
          >
            <h4 class="font-bold text-gray-700 mb-2">Lý do từ chối</h4>
            <ElAlert type="error" :closable="false">
              <span class="text-sm">{{ selectedRequest.rejectionReason }}</span>
            </ElAlert>
          </div>

          <!-- Action Buttons -->
          <template #footer>
            <div
              class="flex justify-end gap-2"
              v-if="selectedRequest.status === 'pending'"
            >
              <ElButton @click="handleReject" :loading="actionLoading">
                ❌ Từ chối yêu cầu
              </ElButton>
              <ElButton
                type="primary"
                @click="handleApprove"
                :loading="actionLoading"
              >
                ✓ Duyệt xử lý
              </ElButton>
            </div>
            <div v-else class="text-sm text-gray-500 text-right">
              Đã xử lý bởi {{ selectedRequest.processedBy || "---" }} lúc
              {{
                selectedRequest.processedAt
                  ? formatDateTime(selectedRequest.processedAt)
                  : "---"
              }}
            </div>
          </template>
        </ElCard>

        <!-- Empty State -->
        <ElCard
          v-else
          class="empty-detail flex-1 flex items-center justify-center"
          shadow="never"
        >
          <ElEmpty
            description="Chọn một yêu cầu từ danh sách bên trái để xem chi tiết"
            :image-size="80"
          />
        </ElCard>
      </div>
    </div>

    <!-- Rejection Dialog -->
    <ElDialog
      v-model="rejectDialog.visible"
      title="Từ chối yêu cầu"
      width="500px"
      :close-on-click-modal="false"
    >
      <ElForm label-position="top">
        <ElFormItem label="Lý do từ chối (bắt buộc)" required>
          <ElInput
            v-model="rejectDialog.reason"
            type="textarea"
            :rows="4"
            placeholder="Nhập lý do từ chối để hệ thống gửi thông báo cho Sale/Khách hàng..."
            maxlength="500"
            show-word-limit
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="rejectDialog.visible = false">Hủy</ElButton>
        <ElButton type="danger" @click="confirmReject" :loading="actionLoading">
          Xác nhận từ chối
        </ElButton>
      </template>
    </ElDialog>

    <!-- Evidence Preview Dialog -->
    <ElDialog
      v-model="previewDialog.visible"
      :title="previewDialog.title"
      width="600px"
    >
      <img
        v-if="previewDialog.type === 'image'"
        :src="previewDialog.url"
        class="w-full rounded"
        alt="preview"
      />
      <div v-else class="text-center py-10 text-gray-500">
        <div class="text-6xl mb-4">🎬</div>
        <p>Video: {{ previewDialog.title }}</p>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import type { ReturnOrderDto } from "@/domain/logistics/returns.types";
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getReturns,
  getReturnDetail,
  inspectReturn,
} from "@/api/logistics/returns";

defineOptions({ name: "SalesReturns" });

const USE_MOCK = true;

// ==================== TYPES ====================
interface EvidenceItem {
  type: "image" | "video";
  url: string;
  label: string;
}

interface ReturnRequest {
  id: number;
  rmaCode: string;
  originalOrderCode: string;
  type: "cancel" | "return";
  urgency: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected";
  customerName: string;
  customerPhone: string;
  staffName: string;
  reason: string;
  evidences: EvidenceItem[];
  refundStatus: "none" | "transferred" | "cod_no_need";
  refundAmount: number;
  paymentMethod: string;
  products: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
}

// ==================== MOCK DATA ====================
function getMockRequests(): ReturnRequest[] {
  const now = new Date();
  return [
    {
      id: 1,
      rmaCode: "RMA-001",
      originalOrderCode: "ORD-1001",
      type: "return",
      urgency: "high",
      status: "pending",
      customerName: "Nguyễn Văn An",
      customerPhone: "0901234567",
      staffName: "Trần Thị Bình",
      reason:
        "Giao sai mẫu bugi, khách nhận hàng phát hiện bugi không đúng loại đã đặt. Khách gửi hình ảnh qua Zalo.",
      evidences: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Bugi+sai+loai",
          label: "Bugi sai loại",
        },
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Don+hang+goc",
          label: "Đơn hàng gốc",
        },
      ],
      refundStatus: "none",
      refundAmount: 150000,
      paymentMethod: "COD",
      products: [{ productName: "Bugi xe máy NGK", quantity: 2, price: 75000 }],
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      rmaCode: "RMA-002",
      originalOrderCode: "ORD-1003",
      type: "cancel",
      urgency: "medium",
      status: "pending",
      customerName: "Lê Văn Cường",
      customerPhone: "0923456789",
      staffName: "Phạm Văn Dũng",
      reason: "Khách đổi ý không muốn mua nữa, yêu cầu hủy đơn trước khi giao.",
      evidences: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Tin+nhan+khach",
          label: "Tin nhắn khách",
        },
      ],
      refundStatus: "none",
      refundAmount: 1735000,
      paymentMethod: "VNPay",
      products: [
        { productName: "Lốp xe máy Michelin", quantity: 2, price: 450000 },
        { productName: "Cà pê phanh xe máy", quantity: 4, price: 120000 },
      ],
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      rmaCode: "RMA-003",
      originalOrderCode: "ORD-1005",
      type: "return",
      urgency: "high",
      status: "pending",
      customerName: "Hoàng Thị Dung",
      customerPhone: "0934567890",
      staffName: "Trần Thị Bình",
      reason:
        "Nhớt bị rò rỉ khi vận chuyển, hộp dầu bị móp méo. Khách gửi video quay bằng chứng.",
      evidences: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Hop+dau+rop",
          label: "Hộp dầu rò rỉ",
        },
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Hop+mop+meo",
          label: "Hộp móp méo",
        },
        { type: "video", url: "", label: "Video quay bằng chứng" },
      ],
      refundStatus: "none",
      refundAmount: 850000,
      paymentMethod: "COD",
      products: [
        { productName: "Dầu nhớt Castrol 1L", quantity: 4, price: 250000 },
      ],
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      rmaCode: "RMA-004",
      originalOrderCode: "ORD-1002",
      type: "cancel",
      urgency: "low",
      status: "approved",
      customerName: "Trần Thị Bình",
      customerPhone: "0912345678",
      staffName: "Phạm Văn Dũng",
      reason:
        "Khách nhờ người khác nhận hàng nhưng người đó không có tiền, khách yêu cầu hủy.",
      evidences: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Tin+nhac+huy",
          label: "Tin nhắn hủy",
        },
      ],
      refundStatus: "transferred",
      refundAmount: 505000,
      paymentMethod: "COD",
      products: [
        { productName: "Cà pê phanh xe máy", quantity: 4, price: 120000 },
      ],
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      processedBy: "Admin Nguyễn Văn A",
      processedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      rmaCode: "RMA-005",
      originalOrderCode: "ORD-1006",
      type: "return",
      urgency: "medium",
      status: "rejected",
      customerName: "Vũ Văn Em",
      customerPhone: "0945678901",
      staffName: "Trần Thị Bình",
      reason:
        "Khách trả lại gương chiếu hậu vì nói gương bị trầy xước, nhưng khi kiểm tra lại sản phẩm vẫn còn seal.",
      evidences: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Guong+chieu+ha",
          label: "Gương chiếu hậu",
        },
      ],
      refundStatus: "none",
      refundAmount: 320000,
      paymentMethod: "COD",
      products: [
        { productName: "Gương chiếu hậu xe máy", quantity: 1, price: 320000 },
      ],
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      processedBy: "Admin Nguyễn Văn A",
      processedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      rejectionReason:
        "Sản phẩm vẫn còn seal, không có dấu hiệu trầy xước. Yêu cầu không hợp lệ.",
    },
    {
      id: 6,
      rmaCode: "RMA-006",
      originalOrderCode: "ORD-1007",
      type: "return",
      urgency: "high",
      status: "pending",
      customerName: "Đặng Thị Phương",
      customerPhone: "0956789012",
      staffName: "Phạm Văn Dũng",
      reason:
        "Nhớt bị rò rỉ khi vận chuyển, hộp dầu bị móp méo. Khách gửi video quay bằng chứng.",
      evidences: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Hop+dau+rop",
          label: "Hộp dầu rò rỉ",
        },
      ],
      refundStatus: "none",
      refundAmount: 250000,
      paymentMethod: "COD",
      products: [
        { productName: "Dầu nhớt Motul 1L", quantity: 1, price: 250000 },
      ],
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
  ];
}

// ==================== STATE ====================
const requests = ref<ReturnRequest[]>([]);
const selectedRequest = ref<ReturnRequest | null>(null);
const searchQuery = ref("");
const filterType = ref<string>("");
const filterStatus = ref<string>("");
const actionLoading = ref(false);
const rejectDialog = reactive({
  visible: false,
  reason: "",
});
const previewDialog = reactive({
  visible: false,
  url: "",
  title: "",
  type: "image" as "image" | "video",
});

// ==================== FETCH ====================
async function fetchData() {
  try {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      requests.value = getMockRequests();
    } else {
      const res: ReturnOrderDto[] = await getReturns(
        filterStatus.value || undefined,
      );
      requests.value = res.map((r) => ({
        id: r.id,
        rmaCode: `RMA-${String(r.id).padStart(3, "0")}`,
        originalOrderCode: `ORD-${1000 + r.id}`,
        type: r.status === "completed" ? "return" : "cancel",
        urgency: "medium" as const,
        status:
          r.status === "pending"
            ? "pending"
            : r.status === "inspecting"
              ? "approved"
              : "rejected",
        customerName: r.customerName,
        customerPhone: "",
        staffName: "",
        reason: r.reason,
        evidences: [],
        refundStatus: "none" as const,
        refundAmount: 0,
        paymentMethod: "COD",
        products: [],
        createdAt: r.createdAt,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch returns:", error);
    ElMessage.error("Không thể tải danh sách yêu cầu");
  }
}

// ==================== COMPUTED ====================
const filteredRequests = computed(() => {
  let result = requests.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (r) =>
        r.rmaCode.toLowerCase().includes(q) ||
        r.originalOrderCode.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q),
    );
  }
  if (filterType.value) {
    result = result.filter((r) => r.type === filterType.value);
  }
  if (filterStatus.value) {
    result = result.filter((r) => r.status === filterStatus.value);
  }
  return result;
});

const pendingCount = computed(
  () => requests.value.filter((r) => r.status === "pending").length,
);

// ==================== METHODS ====================
function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value?: number): string {
  if (value == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getUrgencyLabel(urgency: string): string {
  switch (urgency) {
    case "high":
      return "Khẩn cấp";
    case "medium":
      return "Bình thường";
    case "low":
      return "Thấp";
    default:
      return "---";
  }
}

function getUrgencyTagType(urgency: string): "danger" | "warning" | "info" {
  switch (urgency) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "info";
  }
}

function getRefundStatusLabel(status: string): string {
  switch (status) {
    case "none":
      return "Chưa hoàn tiền";
    case "transferred":
      return "Đã chuyển khoản hoàn";
    case "cod_no_need":
      return "Không cần hoàn (COD)";
    default:
      return "---";
  }
}

function getRefundStatusTagType(status: string): "danger" | "success" | "info" {
  switch (status) {
    case "none":
      return "danger";
    case "transferred":
      return "success";
    case "cod_no_need":
      return "info";
    default:
      return "info";
  }
}

function getPaymentMethodLabel(method?: string): string {
  switch (method) {
    case "COD":
      return "COD";
    case "VNPay":
      return "VNPay";
    case "PayOS":
      return "PayOS";
    default:
      return method || "---";
  }
}

function getRequestItemClass(req: ReturnRequest): string {
  const base = "request-item";
  if (req.type === "return") {
    return `${base} request-item--return`;
  }
  return `${base} request-item--cancel`;
}

function selectRequest(req: ReturnRequest) {
  selectedRequest.value = req;
}

function handleSearch() {
  // Filter is reactive via computed
}

function previewEvidence(evidence: EvidenceItem) {
  previewDialog.url = evidence.url;
  previewDialog.title = evidence.label;
  previewDialog.type = evidence.type;
  previewDialog.visible = true;
}

// ==================== ACTIONS ====================
function handleReject() {
  if (!selectedRequest.value) return;
  rejectDialog.visible = true;
  rejectDialog.reason = "";
}

async function confirmReject() {
  if (!rejectDialog.reason.trim()) {
    ElMessage.warning("Vui lòng nhập lý do từ chối");
    return;
  }
  if (!selectedRequest.value) return;
  try {
    actionLoading.value = true;
    await ElMessageBox.confirm(
      `Xác nhận từ chối yêu cầu ${selectedRequest.value.rmaCode}?`,
      "Xác nhận",
      { type: "warning" },
    );
    // Mock: update status
    selectedRequest.value.status = "rejected";
    selectedRequest.value.rejectionReason = rejectDialog.reason;
    selectedRequest.value.processedBy = "Admin (mock)";
    selectedRequest.value.processedAt = new Date().toISOString();
    rejectDialog.visible = false;
    ElMessage.success("Đã từ chối yêu cầu");
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Từ chối thất bại");
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleApprove() {
  if (!selectedRequest.value) return;
  try {
    actionLoading.value = true;
    await ElMessageBox.confirm(
      `Duyệt xử lý ${selectedRequest.value.rmaCode}?\n\nHệ thống sẽ tự động:\n- Kích hoạt lệnh hoàn tiền cho Kế toán\n- Tạo phiếu chờ khui hộp tại Quản lý hàng hoàn`,
      "Xác nhận duyệt",
      { type: "success", confirmButtonText: "Duyệt xử lý" },
    );
    if (!USE_MOCK) {
      await inspectReturn(selectedRequest.value.id, {
        action: "refund",
        boxCondition: "Đã kiểm tra",
        productCondition: "Đã kiểm tra",
        returnInternalNote: "Đã duyệt",
      });
    }
    // Mock: update status
    selectedRequest.value.status = "approved";
    if (selectedRequest.value.paymentMethod === "COD") {
      selectedRequest.value.refundStatus = "cod_no_need";
    } else {
      selectedRequest.value.refundStatus = "transferred";
    }
    selectedRequest.value.processedBy = "Admin (mock)";
    selectedRequest.value.processedAt = new Date().toISOString();
    ElMessage.success("Đã duyệt xử lý - Phiếu hàng hoàn đã được tạo");
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Duyệt thất bại");
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.returns-page {
  padding: 16px;
}

.split-layout {
  gap: 16px;
}

.left-panel {
  min-width: 0;
}

.right-panel {
  min-width: 0;
}

.list-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-card :deep(.el-card__body) {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.request-item {
  transition: all 0.2s;
  border: 1px solid var(--el-border-color-light);
}

.request-item:hover {
  transform: translateX(2px);
}

.request-item.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.request-item--return {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);
}

.request-item--return:hover {
  border-color: var(--el-color-danger);
}

.request-item--cancel {
  background-color: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);
}

.request-item--cancel:hover {
  border-color: var(--el-color-warning);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.evidence-item {
  transition: border-color 0.2s;
}

.evidence-item:hover {
  border-color: #409eff;
}

.reason-text {
  background-color: #fffbe6 !important;
  border-color: #ffe58f !important;
}

.line-clamp-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(html.dark) {
  .text-gray-900,
  .text-gray-800,
  .text-gray-700 {
    color: var(--el-text-color-primary) !important;
  }

  .text-gray-600 {
    color: var(--el-text-color-regular) !important;
  }

  .text-gray-500 {
    color: var(--el-text-color-secondary) !important;
  }

  .text-gray-400,
  .text-gray-300 {
    color: var(--el-text-color-placeholder) !important;
  }

  .request-item .text-gray-600,
  .request-item .text-gray-500,
  .request-item .text-gray-400 {
    color: var(--el-text-color-primary) !important;
  }

  .bg-gray-50 {
    background-color: var(--el-fill-color-light) !important;
  }

  .bg-white {
    background-color: var(--el-bg-color-overlay) !important;
  }

  .reason-text {
    background-color: var(--el-color-warning-light-9) !important;
    border-color: var(--el-color-warning-light-5) !important;
  }
}
</style>
