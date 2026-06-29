<template>
  <div class="returns-page flex flex-col gap-4 h-full">
    <!-- List Layout -->
    <div class="list-layout flex gap-4" style="height: calc(100vh - 120px)">
      <!-- Request List -->
      <div class="left-panel w-full flex flex-col gap-3">
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
              placeholder="Tìm theo mã RMA, mã vận đơn, khách hàng..."
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
              v-model="filterStatus"
              placeholder="Trạng thái"
              size="small"
              clearable
              @change="handleSearch"
            >
              <ElOption label="⏳ Chờ duyệt" value="pending" />
              <ElOption label="🔍 Đang kiểm định" value="inspecting" />
              <ElOption label="✅ Đã xử lý" value="completed" />
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
                    :type="req.type === 'return' ? 'danger' : 'warning'"
                    size="small"
                    effect="plain"
                  >
                    {{ req.type === "return" ? "Trả hàng" : "Hủy đơn" }}
                  </ElTag>
                </div>
                <ElTag :type="getStatusTagType(req.status)" size="small">
                  {{ getStatusLabel(req.status) }}
                </ElTag>
              </div>
              <div class="text-xs text-gray-600 mb-1">
                Vận đơn:
                <span class="font-medium">{{
                  req.originalTrackingNumber
                }}</span>
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
              </div>
            </div>

            <ElEmpty
              v-if="filteredRequests.length === 0 && !loading"
              description="Không có yêu cầu nào"
              :image-size="60"
            />
          </div>
        </ElCard>
      </div>
    </div>

    <!-- CENTER DETAIL DIALOG -->
    <ElDialog
      v-model="detailDialogVisible"
      :title="'Chi tiết hồ sơ sự cố - ' + (selectedRequest?.rmaCode || '')"
      width="800px"
      :close-on-click-modal="false"
      class="rounded-xl"
    >
      <div v-if="selectedRequest" class="flex flex-col gap-3">
        <!-- Request Info Grid -->
        <div class="info-grid grid grid-cols-2 gap-3 mb-4">
          <div class="info-item">
            <span class="text-xs text-gray-500">Mã phiếu xử lý</span>
            <div class="font-bold text-primary">
              {{ selectedRequest.rmaCode }}
            </div>
          </div>
          <div class="info-item">
            <span class="text-xs text-gray-500">Mã vận đơn gốc</span>
            <div class="font-medium">
              {{ selectedRequest.originalTrackingNumber }}
            </div>
          </div>
          <div class="info-item">
            <span class="text-xs text-gray-500">Loại yêu cầu</span>
            <div>
              <ElTag
                :type="selectedRequest.type === 'return' ? 'danger' : 'warning'"
                size="small"
              >
                {{ selectedRequest.type === "return" ? "Trả hàng" : "Hủy đơn" }}
              </ElTag>
            </div>
          </div>
          <div class="info-item">
            <span class="text-xs text-gray-500">Trạng thái</span>
            <div>
              <ElTag
                :type="getStatusTagType(selectedRequest.status)"
                size="small"
              >
                {{ getStatusLabel(selectedRequest.status) }}
              </ElTag>
            </div>
          </div>
          <div class="info-item">
            <span class="text-xs text-gray-500">Đơn vị vận chuyển</span>
            <div class="font-medium">{{ selectedRequest.carrier }}</div>
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
            <span class="text-xs text-gray-500">Thời gian kiểm định</span>
            <div class="font-medium">
              {{ formatDateTime(selectedRequest.inspectedAt) }}
            </div>
          </div>
        </div>

        <!-- Reason -->
        <div class="reason-section mb-4">
          <h4 class="font-bold text-gray-700 mb-2">Lý do khiếu nại</h4>
          <ElAlert type="warning" :closable="false" class="reason-text">
            <span class="text-sm">{{ selectedRequest.reason }}</span>
          </ElAlert>
        </div>

        <!-- Inspection Info -->
        <div
          v-if="
            selectedRequest.boxCondition ||
            selectedRequest.productCondition ||
            selectedRequest.returnInternalNote
          "
          class="inspection-section mb-4"
        >
          <h4 class="font-bold text-gray-700 mb-2">Thông tin kiểm định</h4>
          <div class="bg-gray-50 p-3 rounded space-y-1">
            <div v-if="selectedRequest.boxCondition" class="text-sm">
              <span class="text-gray-600">Tình trạng hộp:</span>
              <span class="font-medium ml-2">{{
                selectedRequest.boxCondition
              }}</span>
            </div>
            <div v-if="selectedRequest.productCondition" class="text-sm">
              <span class="text-gray-600">Tình trạng sản phẩm:</span>
              <span class="font-medium ml-2">{{
                selectedRequest.productCondition
              }}</span>
            </div>
            <div v-if="selectedRequest.returnInternalNote" class="text-sm">
              <span class="text-gray-600">Ghi chú nội bộ:</span>
              <span class="font-medium ml-2">{{
                selectedRequest.returnInternalNote
              }}</span>
            </div>
            <div v-if="selectedRequest.returnAction" class="text-sm">
              <span class="text-gray-600">Hướng xử lý:</span>
              <ElTag size="small" class="ml-2">{{
                getActionLabel(selectedRequest.returnAction)
              }}</ElTag>
            </div>
          </div>
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

        <!-- Original Order Products -->
        <div class="products-section mb-4">
          <h4 class="font-bold text-gray-700 mb-2">Sản phẩm liên quan</h4>
          <ElTable
            :data="selectedRequest.items"
            border
            size="small"
            max-height="200"
          >
            <ElTableColumn label="Tên sản phẩm" min-width="180">
              <template #default="{ row }">
                {{ row.productName }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="SKU" width="120">
              <template #default="{ row }">
                {{ row.sku }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="SL" width="70" align="center">
              <template #default="{ row }">
                {{ row.quantity }}
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex justify-end gap-2 border-t pt-4">
          <div
            v-if="selectedRequest.status === 'pending'"
            class="flex justify-end gap-2"
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
          <div
            v-else
            class="text-sm text-gray-500 flex items-center justify-end w-full"
          >
            Đã xử lý lúc
            {{ formatDateTime(selectedRequest.inspectedAt) || "---" }}
          </div>
        </div>
      </div>
    </ElDialog>

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
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getReturns,
  getReturnDetail,
  inspectReturn,
  rejectReturn,
} from "@/api/logistics/returns";

defineOptions({ name: "SalesReturns" });

// ==================== TYPES ====================
interface ReturnItem {
  id: number;
  rmaCode: string;
  originalTrackingNumber: string;
  type: "return" | "cancel";
  status: "pending" | "inspecting" | "completed" | "rejected";
  customerName: string;
  carrier: string;
  reason: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
  }>;
  createdAt: string;
  inspectedAt?: string;
  boxCondition?: string;
  productCondition?: string;
  returnInternalNote?: string;
  returnAction?: string;
  rejectionReason?: string;
}

// ==================== STATE ====================
const requests = ref<ReturnItem[]>([]);
const selectedRequest = ref<ReturnItem | null>(null);
const searchQuery = ref("");
const filterStatus = ref<
  "pending" | "inspecting" | "completed" | "rejected" | ""
>("");
const actionLoading = ref(false);
const loading = ref(false);
const detailDialogVisible = ref(false);
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
    loading.value = true;
    const res = await getReturns(filterStatus.value || undefined);
    requests.value = res.map((r) => ({
      id: r.id,
      rmaCode: `RMA-${String(r.id).padStart(3, "0")}`,
      originalTrackingNumber: r.originalTrackingNumber,
      type: inferType(r),
      status: r.status,
      customerName: r.customerName,
      carrier: r.carrier,
      reason: r.reason,
      items: [],
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch returns:", error);
    ElMessage.error("Không thể tải danh sách yêu cầu");
  } finally {
    loading.value = false;
  }
}

function inferType(r: { reason: string }): "return" | "cancel" {
  const reason = (r.reason || "").toLowerCase();
  if (
    reason.includes("hủy") ||
    reason.includes("huy") ||
    reason.includes("cancel")
  )
    return "cancel";
  return "return";
}

// ==================== COMPUTED ====================
const filteredRequests = computed(() => {
  let result = requests.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (r) =>
        r.rmaCode.toLowerCase().includes(q) ||
        r.originalTrackingNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q),
    );
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

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Chờ duyệt";
    case "inspecting":
      return "Đang kiểm định";
    case "completed":
      return "Đã xử lý";
    case "rejected":
      return "Đã từ chối";
    default:
      return status;
  }
}

function getStatusTagType(
  status: string,
): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "pending":
      return "info";
    case "inspecting":
      return "warning";
    case "completed":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "info";
  }
}

function getActionLabel(action?: string): string {
  switch (action) {
    case "restock":
      return "Nhập kho lại";
    case "defect":
      return "Hàng lỗi";
    case "refund":
      return "Hoàn tiền";
    default:
      return action || "---";
  }
}

function getRequestItemClass(req: ReturnItem): string {
  const base = "request-item";
  if (req.type === "return") {
    return `${base} request-item--return`;
  }
  return `${base} request-item--cancel`;
}

async function selectRequest(req: ReturnItem) {
  try {
    const detail = await getReturnDetail(req.id);
    selectedRequest.value = {
      id: detail.id,
      rmaCode: `RMA-${String(detail.id).padStart(3, "0")}`,
      originalTrackingNumber: detail.originalTrackingNumber,
      type: inferType(detail),
      status: detail.status,
      customerName: detail.customerName,
      carrier: detail.carrier,
      reason: detail.reason,
      items: detail.items.map((item) => ({
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
      })),
      createdAt: detail.createdAt,
      inspectedAt: detail.inspectedAt,
      boxCondition: detail.boxCondition,
      productCondition: detail.productCondition,
      returnInternalNote: detail.returnInternalNote,
      returnAction: detail.returnAction,
      rejectionReason: detail.rejectionReason,
    };
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("Failed to fetch return detail:", error);
    ElMessage.error("Không thể tải chi tiết yêu cầu");
  }
}

function handleSearch() {
  // Filter is reactive via computed
}

function previewEvidence(evidence: {
  url: string;
  label: string;
  type: string;
}) {
  previewDialog.url = evidence.url;
  previewDialog.title = evidence.label;
  previewDialog.type = evidence.type as "image" | "video";
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
    await rejectReturn(selectedRequest.value.id, rejectDialog.reason.trim());
    selectedRequest.value.status = "rejected";
    selectedRequest.value.rejectionReason = rejectDialog.reason;
    rejectDialog.visible = false;
    ElMessage.success("Đã từ chối yêu cầu");
    await fetchData();
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
    await inspectReturn(selectedRequest.value.id, {
      action: "refund",
      boxCondition: "Đã kiểm tra",
      productCondition: "Đã kiểm tra",
      returnInternalNote: "Đã duyệt",
    });
    selectedRequest.value.status = "inspecting";
    ElMessage.success("Đã duyệt xử lý - Phiếu hàng hoàn đã được tạo");
    await fetchData();
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
