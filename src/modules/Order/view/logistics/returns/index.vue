<template>
  <div
    class="returns-page flex flex-col gap-4 animate__animated animate__fadeIn"
  >
    <!-- Header with Search & Tabs -->
    <ElCard class="shrink-0" body-class="pb-0">
      <div class="flex justify-between items-center mb-4">
        <h1
          class="m-0 text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-2"
        >
          <ElIcon class="text-2xl text-primary"><List /></ElIcon>
          Quản lý hoàn hàng
        </h1>
        <ElInput
          v-model="searchQuery"
          placeholder="Tìm mã đơn, khách hàng..."
          clearable
          :prefix-icon="Search"
          class="w-80"
        />
      </div>

      <ElTabs
        v-model="statusFilter"
        @tab-change="fetchReturns"
        class="order-tabs"
      >
        <ElTabPane label="Tất cả" name="" />
        <ElTabPane label="Chờ xử lý" name="pending" />
        <ElTabPane label="Đang kiểm tra" name="inspecting" />
        <ElTabPane label="Đã hoàn tất" name="completed" />
      </ElTabs>

      <!-- Bulk Actions Bar -->
      <div
        v-if="selectedRows.length > 0"
        class="flex items-center gap-4 bg-primary-light-9 p-3 rounded-lg mt-2 border border-primary-light-5 animate__animated animate__fadeIn"
      >
        <span class="text-sm font-medium text-primary"
          >Đã chọn {{ selectedRows.length }} đơn hàng</span
        >
        <div class="flex gap-2">
          <ElButton
            type="primary"
            size="small"
            @click="handleBulkAction('restock')"
            >Nhập kho hàng loạt</ElButton
          >
          <ElButton
            type="danger"
            size="small"
            @click="handleBulkAction('defect')"
            >Cách ly hàng loạt</ElButton
          >
        </div>
      </div>
    </ElCard>

    <!-- Main List Data Table -->
    <ElCard
      class="art-table-card flex-1 overflow-hidden"
      body-class="p-0 h-full flex flex-col"
    >
      <div class="flex-1 p-4 h-[calc(100vh-250px)]">
        <ElTable
          :data="filteredReturns"
          style="width: 100%"
          v-loading="loadingList"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          height="100%"
          class="custom-table cursor-pointer"
          stripe
          border
        >
          <ElTableColumn type="selection" width="50" align="center" />
          <ElTableColumn
            prop="originalTrackingNumber"
            label="Mã đơn gốc"
            min-width="150"
            align="center"
          >
            <template #default="{ row }">
              <span class="font-bold text-primary hover:underline">{{
                row.originalTrackingNumber
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="customerName" label="Khách hàng" min-width="180">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <ElIcon><User /></ElIcon> {{ row.customerName }}
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="carrier"
            label="Vận chuyển"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              <ElTag
                :type="getCarrierTag(row.carrier)"
                size="small"
                effect="plain"
                >{{ row.carrier }}</ElTag
              >
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="reason"
            label="Lý do hoàn"
            min-width="200"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <ElTag :type="getReasonTag(row.reason)" size="small">{{
                row.reason
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="status"
            label="Trạng thái"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              <ElTag :type="getStatusTag(row.status)" effect="dark">{{
                getStatusLabel(row.status)
              }}</ElTag>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>

    <!-- PANEL TRƯỢT CHI TIẾT (SLIDING DRAWER) -->
    <ElDrawer
      v-model="drawerVisible"
      :title="
        detail
          ? `Chi tiết đơn hoàn RET-${detail.id.toString().padStart(3, '0')}`
          : 'Chi tiết đơn hoàn'
      "
      size="600px"
      direction="rtl"
      :destroy-on-close="false"
      class="returns-drawer"
    >
      <div v-loading="loadingDetail" class="h-full flex flex-col" v-if="detail">
        <div
          class="flex justify-between items-center mb-4 bg-fill-lighter p-4 rounded-xl border border-color"
        >
          <p class="text-secondary m-0">
            Đơn gốc:
            <span class="font-medium text-primary text-lg ml-2">{{
              detail.originalTrackingNumber
            }}</span>
          </p>
          <ElTag :type="getStatusTag(detail.status)" effect="dark" size="large">
            {{ getStatusLabel(detail.status) }}
          </ElTag>
        </div>

        <div
          class="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 custom-scrollbar"
        >
          <!-- LÝ DO -->
          <ElAlert
            :title="`Lý do hoàn: ${detail.reason}`"
            :type="getReasonAlertType(detail.reason)"
            :closable="false"
            show-icon
          />

          <!-- THÔNG TIN PHỤ TÙNG -->
          <div>
            <h3 class="text-base font-semibold mb-3 flex items-center gap-2">
              <ElIcon><Box /></ElIcon> Chi tiết kiện hàng
            </h3>
            <div class="border border-color rounded-md overflow-hidden">
              <ElTable :data="detail.items" style="width: 100%">
                <ElTableColumn width="80" align="center">
                  <template #default="{ row }">
                    <ElImage
                      :src="row.thumbnailUrl || '/placeholder.png'"
                      class="w-10 h-10 rounded"
                      fit="cover"
                    >
                      <template #error>
                        <div
                          class="w-10 h-10 bg-fill-lighter flex items-center justify-center text-secondary text-xs rounded"
                        >
                          <ElIcon><Picture /></ElIcon>
                        </div>
                      </template>
                    </ElImage>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="sku" label="Mã SKU" width="120" />
                <ElTableColumn
                  prop="productName"
                  label="Tên phụ tùng"
                  min-width="150"
                  show-overflow-tooltip
                />
                <ElTableColumn
                  prop="quantity"
                  label="SL"
                  width="80"
                  align="center"
                />
              </ElTable>
            </div>
          </div>

          <!-- KHỐI KIỂM ĐỊNH -->
          <div
            v-if="detail.status !== 'completed'"
            class="bg-fill-lighter p-5 rounded-lg border border-color"
          >
            <h3
              class="text-base font-semibold mb-4 flex items-center gap-2 text-primary"
            >
              <ElIcon><Check /></ElIcon> Kiểm định thực tế tại kho
            </h3>

            <ElForm
              :model="inspectForm"
              label-position="top"
              :disabled="submitting"
            >
              <div class="grid grid-cols-2 gap-4">
                <ElFormItem label="Tình trạng vỏ hộp/bao bì">
                  <ElRadioGroup v-model="inspectForm.boxCondition">
                    <ElRadio value="Còn nguyên vẹn">Còn nguyên vẹn</ElRadio>
                    <ElRadio value="Đã bóc tem">Đã bóc tem</ElRadio>
                    <ElRadio value="Rách nát">Rách nát</ElRadio>
                  </ElRadioGroup>
                </ElFormItem>
                <ElFormItem label="Tình trạng phụ tùng">
                  <ElRadioGroup v-model="inspectForm.productCondition">
                    <ElRadio value="Sử dụng tốt">Sử dụng tốt</ElRadio>
                    <ElRadio value="Trầy xước nhẹ">Trầy xước nhẹ</ElRadio>
                    <ElRadio value="Hư hỏng hoàn toàn"
                      >Hư hỏng hoàn toàn</ElRadio
                    >
                  </ElRadioGroup>
                </ElFormItem>
              </div>

              <ElFormItem label="Ảnh bằng chứng khui hộp">
                <div class="flex items-center gap-4">
                  <ElButton :icon="Camera" @click="handleUploadClick"
                    >Tải ảnh lên</ElButton
                  >
                  <span
                    v-if="inspectForm.returnProofImage"
                    class="text-success text-sm flex items-center gap-1"
                  >
                    <ElIcon><CircleCheck /></ElIcon> Đã tải lên ảnh bằng chứng
                  </span>
                </div>
              </ElFormItem>

              <ElFormItem label="Ghi chú nội bộ (Lưu vết trách nhiệm)">
                <ElInput
                  v-model="inspectForm.returnInternalNote"
                  type="textarea"
                  :rows="3"
                  placeholder="Ghi rõ đánh giá của thủ kho, ví dụ: 'Hàng móp do vận chuyển Viettel Post'"
                />
              </ElFormItem>
            </ElForm>
          </div>

          <!-- Hiển thị lại nếu đã completed -->
          <div
            v-else
            class="bg-success-light-9 p-5 rounded-lg border border-success-light-5"
          >
            <h3
              class="text-base font-semibold mb-4 flex items-center gap-2 text-success"
            >
              <ElIcon><SuccessFilled /></ElIcon> Đã hoàn tất xử lý
            </h3>
            <div class="grid grid-cols-2 gap-y-3 text-sm">
              <div class="text-secondary">Quyết định:</div>
              <div class="font-medium text-primary">
                {{ getActionLabel(detail.returnAction) }}
              </div>

              <div class="text-secondary">Vỏ hộp:</div>
              <div class="font-medium">
                {{ detail.boxCondition || "Không có" }}
              </div>

              <div class="text-secondary">Sản phẩm:</div>
              <div class="font-medium">
                {{ detail.productCondition || "Không có" }}
              </div>

              <div class="text-secondary">Ghi chú:</div>
              <div class="font-medium italic">
                {{ detail.returnInternalNote || "Không có" }}
              </div>
            </div>
          </div>
        </div>

        <!-- KHỐI ĐÓNG HỒ SƠ (Nút bấm hành động) -->
        <div
          v-if="detail.status !== 'completed'"
          class="pt-4 mt-2 border-t border-color shrink-0 flex gap-3 justify-end"
        >
          <ElButton
            type="primary"
            plain
            size="large"
            :loading="submitting"
            @click="submitDecision('restock')"
          >
            <ElIcon class="mr-1"><Refresh /></ElIcon> Nhập kho bán lẻ
          </ElButton>

          <ElButton
            type="danger"
            plain
            size="large"
            :loading="submitting"
            @click="submitDecision('defect')"
          >
            <ElIcon class="mr-1"><Warning /></ElIcon> Cách ly chờ hủy
          </ElButton>

          <ElButton
            type="warning"
            plain
            size="large"
            :loading="submitting"
            @click="submitDecision('refund')"
          >
            <ElIcon class="mr-1"><Money /></ElIcon> Hoàn tiền
          </ElButton>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  List,
  Search,
  User,
  Box,
  Picture,
  Check,
  Camera,
  CircleCheck,
  SuccessFilled,
  Refresh,
  Warning,
  Money,
} from "@element-plus/icons-vue";
import {
  getReturns,
  getReturnDetail,
  inspectReturn,
} from "@/api/logistics/returns";
import type {
  ReturnOrderDto,
  ReturnDetailDto,
  InspectReturnCommand,
} from "@/domain/logistics/returns.types";

defineOptions({ name: "ReverseLogistics" });

// State for List
const returnsList = ref<ReturnOrderDto[]>([]);
const loadingList = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const selectedRows = ref<ReturnOrderDto[]>([]);

// State for Drawer
const drawerVisible = ref(false);
const detail = ref<ReturnDetailDto | null>(null);
const loadingDetail = ref(false);

// State for Form
const inspectForm = ref<InspectReturnCommand>({
  boxCondition: "",
  productCondition: "",
  returnProofImage: "",
  returnInternalNote: "",
  action: "",
});
const submitting = ref(false);

// Filter logic
const filteredReturns = computed(() => {
  if (!searchQuery.value) return returnsList.value;
  const q = searchQuery.value.toLowerCase();
  return returnsList.value.filter(
    (item) =>
      item.originalTrackingNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      (item.reason && item.reason.toLowerCase().includes(q)),
  );
});

// Lifecycle
onMounted(() => {
  fetchReturns();
});

// Fetch Data
const fetchReturns = async () => {
  loadingList.value = true;
  try {
    const res = await getReturns(statusFilter.value);
    returnsList.value = (res as unknown as ReturnOrderDto[]) || [];
  } catch (_error) {
    ElMessage.error("Lỗi khi tải danh sách hàng hoàn");
  } finally {
    loadingList.value = false;
  }
};

const handleRowClick = async (row: ReturnOrderDto) => {
  drawerVisible.value = true;
  loadingDetail.value = true;
  try {
    const res = await getReturnDetail(row.id);
    detail.value = res as unknown as ReturnDetailDto;

    // Reset form
    inspectForm.value = {
      boxCondition: detail.value?.boxCondition || "Còn nguyên vẹn",
      productCondition: detail.value?.productCondition || "Sử dụng tốt",
      returnProofImage: detail.value?.returnProofImage || "",
      returnInternalNote: detail.value?.returnInternalNote || "",
      action: "",
    };
  } catch (_error) {
    ElMessage.error("Lỗi khi tải chi tiết hàng hoàn");
    drawerVisible.value = false;
  } finally {
    loadingDetail.value = false;
  }
};

// Actions
const handleUploadClick = () => {
  // Simulate image upload
  setTimeout(() => {
    inspectForm.value.returnProofImage =
      "https://fakeimg.pl/350x200/?text=Proof";
    ElMessage.success("Tải ảnh thành công");
  }, 500);
};

const submitDecision = async (action: "restock" | "defect" | "refund") => {
  if (!detail.value) return;

  const actionMap: Record<string, string> = {
    restock: "Nhập lại kho bán lẻ",
    defect: "Cách ly chờ hủy",
    refund: "Hoàn tiền cho khách",
  };

  try {
    await ElMessageBox.confirm(
      `Bạn chắc chắn muốn đóng hồ sơ đơn hàng này với quyết định: <strong>${actionMap[action]}</strong>?`,
      "Xác nhận xử lý",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        type: "warning",
        dangerouslyUseHTMLString: true,
      },
    );

    submitting.value = true;
    inspectForm.value.action = action;

    await inspectReturn(detail.value.id, inspectForm.value);

    ElMessage.success(`Xử lý thành công: ${actionMap[action]}`);

    // Refresh and close drawer
    await fetchReturns();
    drawerVisible.value = false;
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error("Có lỗi xảy ra khi xử lý");
    }
  } finally {
    submitting.value = false;
  }
};

// Helpers
const getCarrierTag = (carrier: string) => {
  const c = carrier.toLowerCase();
  if (c.includes("ghtk")) return "success";
  if (c.includes("viettel") || c.includes("vtp")) return "warning";
  return "info";
};

const getReasonTag = (reason: string): "warning" | "danger" => {
  const r = reason.toLowerCase();
  if (r.includes("bom") || r.includes("không nhận")) return "warning";
  return "danger";
};

const getReasonAlertType = (reason: string) => {
  const r = reason.toLowerCase();
  if (r.includes("bom") || r.includes("không nhận")) return "warning";
  return "error";
};

const getStatusTag = (
  status: string,
): "danger" | "warning" | "success" | "info" => {
  const map: Record<string, "danger" | "warning" | "success" | "info"> = {
    pending: "danger",
    inspecting: "warning",
    completed: "success",
  };
  return map[status] || "info";
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: "Chờ xử lý",
    inspecting: "Đang kiểm tra",
    completed: "Đã hoàn tất",
  };
  return map[status] || status;
};

const getActionLabel = (action?: string) => {
  if (!action) return "Chưa xử lý";
  const map: Record<string, string> = {
    restock: "Nhập lại kho bán lẻ",
    defect: "Cách ly chờ hủy",
    refund: "Hoàn tiền cho khách",
  };
  return map[action] || action;
};

// Selection logic
const handleSelectionChange = (rows: ReturnOrderDto[]) => {
  selectedRows.value = rows;
};

const handleBulkAction = async (action: "restock" | "defect") => {
  const actionMap: Record<string, string> = {
    restock: "Nhập lại kho hàng loạt",
    defect: "Cách ly chờ hủy hàng loạt",
  };

  try {
    await ElMessageBox.confirm(
      `Bạn chắc chắn muốn <strong>${actionMap[action]}</strong> cho ${selectedRows.value.length} đơn hàng đã chọn?`,
      "Xác nhận xử lý hàng loạt",
      {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning",
        dangerouslyUseHTMLString: true,
      },
    );

    // Giả lập gọi API xử lý hàng loạt
    ElMessage.success(
      `Đã xử lý thành công ${selectedRows.value.length} đơn hàng.`,
    );
    selectedRows.value = [];
    await fetchReturns();
  } catch (e) {
    // Cancelled
  }
};
</script>

<style scoped>
.returns-page {
  height: calc(100vh - 100px);
}

:deep(.order-tabs .el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--el-border-color-light);
}

:deep(.returns-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-weight: bold;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-dark);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
