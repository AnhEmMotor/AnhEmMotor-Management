<template>
  <div class="returns-page flex flex-col gap-4 pb-5">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <ArtStatsCard
        v-for="tab in tabs"
        :key="tab.id"
        :title="tab.label"
        :count="getCountForTab(tab.id)"
        :icon="tab.icon"
        :icon-style="tab.iconStyle"
        class="cursor-pointer"
        @click="activeTab = tab.id"
      />
    </div>

    <!-- Search Bar -->
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="100"
      :span="6"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Table -->
    <ElCard class="art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="fetchData"
      >
        <template #left>
          <ElButton type="primary" v-ripple @click="handleRefresh">
            <ElIcon class="mr-1"><Refresh /></ElIcon> Làm mới
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="paginatedRequests"
        :columns="columns"
        @row-click="handleRowClick"
      >
        <template #orderCode="{ row }">
          <span class="font-medium text-primary">
            {{ row.orderCode || `RET-${String(row.id).padStart(3, "0")}` }}
          </span>
        </template>
        <template #customer="{ row }">
          <div class="flex flex-col">
            <span class="font-medium">{{ row.customerName || "---" }}</span>
            <span class="text-xs text-gray-500">{{
              row.customerPhone || "---"
            }}</span>
          </div>
        </template>
        <template #type="{ row }">
          <ElTag
            :type="row.type === 'return' ? 'danger' : 'warning'"
            size="small"
          >
            {{ row.type === "return" ? "Trả hàng" : "Hủy đơn" }}
          </ElTag>
        </template>
        <template #reason="{ row }">
          <ElTag
            :type="getReasonTagType(row.reason)"
            size="small"
            class="max-w-[150px] truncate"
            :title="row.reason"
          >
            {{ row.reason }}
          </ElTag>
        </template>
        <template #status="{ row }">
          <ElTag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </ElTag>
        </template>
        <template #createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
        <template #actions="{ row }">
          <ElButton
            v-if="row.status === 'pending'"
            type="primary"
            size="small"
            link
            @click.stop="handleProcess(row)"
          >
            Xử lý
          </ElButton>
          <ElButton
            v-if="row.status === 'pending'"
            type="danger"
            size="small"
            link
            @click.stop="handleReject(row)"
          >
            Từ chối
          </ElButton>
          <span v-else class="text-xs text-gray-400">Đã xử lý</span>
        </template>
      </ArtTable>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="filteredRequests.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- Detail Drawer -->
    <ElDrawer
      v-model="drawer.visible"
      :title="
        drawer.request
          ? `Chi tiết yêu cầu #${drawer.request.orderCode || drawer.request.id}`
          : ''
      "
      size="55%"
      direction="rtl"
      :destroy-on-close="true"
    >
      <div v-if="drawer.request" class="request-detail">
        <!-- Request Summary -->
        <div class="summary grid grid-cols-2 gap-4 mb-4">
          <div>
            <strong>Mã đơn:</strong>
            {{
              drawer.request.orderCode ||
              `RET-${String(drawer.request.id).padStart(3, "0")}`
            }}
          </div>
          <div>
            <strong>Loại yêu cầu:</strong>
            <ElTag
              :type="drawer.request.type === 'return' ? 'danger' : 'warning'"
              size="small"
              class="ml-2"
            >
              {{ drawer.request.type === "return" ? "Trả hàng" : "Hủy đơn" }}
            </ElTag>
          </div>
          <div>
            <strong>Trạng thái:</strong>
            <ElTag
              :type="getStatusTagType(drawer.request.status)"
              size="small"
              class="ml-2"
            >
              {{ getStatusLabel(drawer.request.status) }}
            </ElTag>
          </div>
          <div>
            <strong>Ngày tạo:</strong>
            {{ formatDateTime(drawer.request.createdAt) }}
          </div>
          <div class="col-span-2">
            <strong>Khách hàng:</strong>
            {{ drawer.request.customerName || "---" }}
            <span
              v-if="drawer.request.customerPhone"
              class="text-gray-500 ml-2"
            >
              - {{ drawer.request.customerPhone }}
            </span>
          </div>
          <div class="col-span-2">
            <strong>Lý do:</strong> {{ drawer.request.reason || "---" }}
          </div>
          <div v-if="drawer.request.note" class="col-span-2">
            <strong>Ghi chú:</strong> {{ drawer.request.note }}
          </div>
          <div v-if="drawer.request.rejectionReason" class="col-span-2">
            <strong>Lý do từ chối:</strong>
            <ElAlert type="error" :closable="false" class="mt-1">
              {{ drawer.request.rejectionReason }}
            </ElAlert>
          </div>
        </div>

        <!-- Products Table -->
        <div class="products-section mb-4">
          <h4 class="font-bold mb-2 text-gray-700">
            {{
              drawer.request.type === "return"
                ? "Sản phẩm trả lại"
                : "Sản phẩm liên quan"
            }}
          </h4>
          <ElTable
            :data="drawer.request.items"
            border
            size="small"
            max-height="300"
          >
            <ElTableColumn label="Ảnh" width="70" align="center">
              <template #default="{ row }">
                <img
                  v-if="row.thumbnailUrl"
                  :src="row.thumbnailUrl"
                  class="w-10 h-10 object-cover rounded"
                />
                <span v-else class="text-gray-400 text-xs">---</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Tên sản phẩm" min-width="180">
              <template #default="{ row }">
                {{ row.productName }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Mã SKU" width="120">
              <template #default="{ row }">
                {{ row.sku }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="SL mua" width="80" align="center">
              <template #default="{ row }">
                {{ row.quantity }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              v-if="drawer.request.type === 'return'"
              label="SL trả"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                {{ row.returnQuantity }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="120" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.unitPrice) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="120" align="right">
              <template #default="{ row }">
                {{
                  formatCurrency(
                    (row.returnQuantity || row.quantity) * row.unitPrice,
                  )
                }}
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <!-- Evidence Images -->
        <div v-if="drawer.request.evidenceImages?.length" class="mb-4">
          <h4 class="font-bold mb-2 text-gray-700">Ảnh bằng chứng</h4>
          <div class="flex gap-2 flex-wrap">
            <ElImage
              v-for="(img, idx) in drawer.request.evidenceImages"
              :key="idx"
              :src="img"
              class="w-24 h-24 rounded border cursor-pointer"
              fit="cover"
              :preview-src-list="drawer.request.evidenceImages"
              :initial-index="idx"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex justify-end gap-2 border-t pt-4">
          <ElButton @click="drawer.visible = false">Đóng</ElButton>
          <ElButton
            v-if="drawer.request.status === 'pending'"
            type="danger"
            @click="handleReject(drawer.request)"
          >
            Từ chối
          </ElButton>
          <ElButton
            v-if="drawer.request.status === 'pending'"
            type="primary"
            @click="handleProcess(drawer.request)"
          >
            Xử lý yêu cầu
          </ElButton>
        </div>
      </div>
    </ElDrawer>

    <!-- Reject Dialog -->
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
            placeholder="Nhập lý do từ chối để hệ thống gửi thông báo..."
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

    <!-- Process Dialog (Inspect & Resolve) -->
    <ElDialog
      v-model="processDialog.visible"
      :title="`Xử lý yêu cầu #${processDialog.request?.orderCode || processDialog.request?.id || ''}`"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="processDialog.request" class="flex flex-col gap-4">
        <div class="text-sm text-gray-600">
          Loại:
          <strong>{{
            processDialog.request.type === "return" ? "Trả hàng" : "Hủy đơn"
          }}</strong>
        </div>

        <ElForm label-position="top" :model="processForm">
          <div class="grid grid-cols-2 gap-4">
            <ElFormItem label="Tình trạng vỏ hộp/bao bì">
              <ElRadioGroup v-model="processForm.boxCondition">
                <ElRadio value="Còn nguyên vẹn">Còn nguyên vẹn</ElRadio>
                <ElRadio value="Đã bóc tem">Đã bóc tem</ElRadio>
                <ElRadio value="Rách nát">Rách nát</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
            <ElFormItem label="Tình trạng sản phẩm">
              <ElRadioGroup v-model="processForm.productCondition">
                <ElRadio value="Sử dụng tốt">Sử dụng tốt</ElRadio>
                <ElRadio value="Trầy xước nhẹ">Trầy xước nhẹ</ElRadio>
                <ElRadio value="Hư hỏng hoàn toàn">Hư hỏng hoàn toàn</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </div>

          <ElFormItem label="Ghi chú nội bộ">
            <ElInput
              v-model="processForm.returnInternalNote"
              type="textarea"
              :rows="3"
              placeholder="Ghi rõ đánh giá của nhân viên..."
            />
          </ElFormItem>

          <ElFormItem label="Phương án xử lý" required>
            <ElRadioGroup v-model="processForm.returnAction">
              <ElRadio value="restock">Nhập kho bán lẻ</ElRadio>
              <ElRadio value="defect">Cách ly chờ hủy</ElRadio>
              <ElRadio value="refund">Hoàn tiền cho khách</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <ElButton @click="processDialog.visible = false">Hủy</ElButton>
        <ElButton
          type="primary"
          @click="confirmProcess"
          :loading="actionLoading"
        >
          Xác nhận xử lý
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import {
  getReturnRequests,
  getReturnRequestDetail,
  updateReturnRequestStatus,
} from "@/api/sales/returns.api";
import type { ReturnRequestDetail } from "@/domain/sales/returns.types";

defineOptions({ name: "OrderReturns" });

// ==================== TABS ====================
type TabId = "all" | "pending" | "inspecting" | "completed" | "rejected";

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
  iconStyle: string;
}

const tabs: TabItem[] = [
  {
    id: "all",
    label: "Tất cả",
    icon: "ri:file-list-3-line",
    iconStyle: "bg-primary",
  },
  {
    id: "pending",
    label: "Chờ xử lý",
    icon: "ri:time-line",
    iconStyle: "bg-warning",
  },
  {
    id: "inspecting",
    label: "Đang kiểm tra",
    icon: "ri:search-line",
    iconStyle: "bg-info",
  },
  {
    id: "completed",
    label: "Đã xong",
    icon: "ri:check-double-line",
    iconStyle: "bg-success",
  },
  {
    id: "rejected",
    label: "Đã từ chối",
    icon: "ri:close-circle-line",
    iconStyle: "bg-danger",
  },
];

const activeTab = ref<TabId>("all");

// ==================== STATE ====================
const requests = ref<ReturnRequestDetail[]>([]);
const loading = ref(false);
const actionLoading = ref(false);

const searchForm = reactive({
  keyword: "",
});

const pagination = reactive({
  current: 1,
  size: 20,
});

const drawer = reactive({
  visible: false,
  request: null as ReturnRequestDetail | null,
});

const rejectDialog = reactive({
  visible: false,
  reason: "",
  requestId: 0,
});

const processDialog = reactive({
  visible: false,
  request: null as ReturnRequestDetail | null,
});

const processForm = reactive({
  boxCondition: "Còn nguyên vẹn",
  productCondition: "Sử dụng tốt",
  returnInternalNote: "",
  returnAction: "refund" as "restock" | "defect" | "refund",
});

// ==================== SEARCH ITEMS ====================
const searchItems = computed(() => [
  {
    label: "Từ khóa",
    key: "keyword",
    type: "input",
    props: {
      clearable: true,
      placeholder: "Mã đơn, tên KH, SĐT, lý do...",
    },
  },
]);

// ==================== TABLE COLUMNS ====================
const columnChecks = ref([
  {
    prop: "orderCode",
    label: "Mã đơn",
    width: 130,
    checked: true,
    useSlot: true,
  },
  {
    prop: "customer",
    label: "Khách hàng",
    minWidth: 180,
    checked: true,
    useSlot: true,
  },
  { prop: "type", label: "Loại", width: 100, checked: true, useSlot: true },
  { prop: "reason", label: "Lý do", width: 140, checked: true, useSlot: true },
  {
    prop: "status",
    label: "Trạng thái",
    width: 120,
    checked: true,
    useSlot: true,
  },
  {
    prop: "createdAt",
    label: "Ngày tạo",
    width: 150,
    checked: true,
    useSlot: true,
  },
  {
    prop: "actions",
    label: "Thao tác",
    width: 140,
    checked: true,
    useSlot: true,
  },
]);

const columns = computed(() =>
  columnChecks.value.filter((item) => item.checked),
);

// ==================== COMPUTED ====================
const filteredRequests = computed(() => {
  let result = requests.value;

  // Filter by tab
  if (activeTab.value !== "all") {
    result = result.filter((r) => r.status === activeTab.value);
  }

  // Filter by keyword
  if (searchForm.keyword.trim()) {
    const q = searchForm.keyword.toLowerCase().trim();
    result = result.filter((r) => {
      const orderCode = (
        r.orderCode || `RET-${String(r.id).padStart(3, "0")}`
      ).toLowerCase();
      return (
        orderCode.includes(q) ||
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.customerPhone || "").includes(q) ||
        (r.reason || "").toLowerCase().includes(q)
      );
    });
  }

  return result;
});

const paginatedRequests = computed(() => {
  const start = (pagination.current - 1) * pagination.size;
  const end = start + pagination.size;
  return filteredRequests.value.slice(start, end);
});

// ==================== LIFECYCLE ====================
onMounted(() => {
  fetchData();
});

// ==================== FETCH ====================
async function fetchData() {
  loading.value = true;
  try {
    const res = await getReturnRequests({
      status: activeTab.value !== "all" ? activeTab.value : undefined,
      keyword: searchForm.keyword.trim() || undefined,
      current: 1,
      size: 1000,
    });
    requests.value = res.items || [];
  } catch (error) {
    console.error("Failed to fetch return requests:", error);
    ElMessage.error("Không thể tải danh sách yêu cầu");
  } finally {
    loading.value = false;
  }
}

function getCountForTab(tabId: TabId): number {
  if (tabId === "all") return requests.value.length;
  return requests.value.filter((r) => r.status === tabId).length;
}

// ==================== SEARCH & PAGINATION ====================
function handleSearch() {
  pagination.current = 1;
  fetchData();
}

function handleReset() {
  searchForm.keyword = "";
  pagination.current = 1;
  fetchData();
}

function handleRefresh() {
  fetchData();
}

function handleSizeChange() {
  pagination.current = 1;
}

function handleCurrentChange() {
  // Pagination handled by computed
}

// ==================== ROW ACTIONS ====================
function handleRowClick(row: ReturnRequestDetail) {
  drawer.request = row;
  drawer.visible = true;
}

function handleReject(row: ReturnRequestDetail) {
  rejectDialog.requestId = row.id;
  rejectDialog.reason = "";
  rejectDialog.visible = true;
}

async function confirmReject() {
  if (!rejectDialog.reason.trim()) {
    ElMessage.warning("Vui lòng nhập lý do từ chối");
    return;
  }
  try {
    actionLoading.value = true;
    await ElMessageBox.confirm("Xác nhận từ chối yêu cầu này?", "Xác nhận", {
      type: "warning",
    });
    await updateReturnRequestStatus(rejectDialog.requestId, "rejected");
    ElMessage.success("Đã từ chối yêu cầu");
    rejectDialog.visible = false;
    await fetchData();
    if (drawer.request?.id === rejectDialog.requestId) {
      drawer.visible = false;
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Từ chối thất bại");
    }
  } finally {
    actionLoading.value = false;
  }
}

function handleProcess(row: ReturnRequestDetail) {
  processDialog.request = row;
  processDialog.visible = true;
  processForm.boxCondition = "Còn nguyên vẹn";
  processForm.productCondition = "Sử dụng tốt";
  processForm.returnInternalNote = "";
  processForm.returnAction = "refund";
}

async function confirmProcess() {
  if (!processDialog.request) return;
  if (!processForm.returnAction) {
    ElMessage.warning("Vui lòng chọn phương án xử lý");
    return;
  }
  try {
    actionLoading.value = true;
    await ElMessageBox.confirm(
      `Xác nhận xử lý yêu cầu này?\\n\\nPhương án: ${getActionLabel(processForm.returnAction)}`,
      "Xác nhận",
      { type: "warning" },
    );
    await updateReturnRequestStatus(processDialog.request.id, "inspecting");
    ElMessage.success("Đã xử lý yêu cầu");
    processDialog.visible = false;
    await fetchData();
    if (drawer.request?.id === processDialog.request.id) {
      drawer.visible = false;
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Xử lý thất bại");
    }
  } finally {
    actionLoading.value = false;
  }
}

// ==================== HELPERS ====================
function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "---";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatCurrency(val?: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Chờ xử lý",
    inspecting: "Đang kiểm tra",
    completed: "Đã hoàn tất",
    rejected: "Đã từ chối",
  };
  return map[status] || status;
}

function getStatusTagType(
  status: string,
): "danger" | "warning" | "success" | "info" {
  const map: Record<string, "danger" | "warning" | "success" | "info"> = {
    pending: "danger",
    inspecting: "warning",
    completed: "success",
    rejected: "info",
  };
  return map[status] || "info";
}

function getReasonTagType(reason: string): "warning" | "danger" {
  const r = reason.toLowerCase();
  if (r.includes("hủy") || r.includes("huy") || r.includes("cancel"))
    return "warning";
  return "danger";
}

function getActionLabel(action?: string): string {
  if (!action) return "---";
  const map: Record<string, string> = {
    restock: "Nhập lại kho bán lẻ",
    defect: "Cách ly chờ hủy",
    refund: "Hoàn tiền cho khách",
  };
  return map[action] || action;
}
</script>

<style scoped>
.returns-page {
  padding: 16px;
}

.request-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.products-section {
  h4 {
    margin-bottom: 8px;
  }
}
</style>
