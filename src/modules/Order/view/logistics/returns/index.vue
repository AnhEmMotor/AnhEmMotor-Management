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
    </ElCard>

    <!-- Main List Data Table -->
    <div class="flex-1 h-[calc(100vh-220px)] mt-2">
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

          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border"
            style="
              background-color: var(--el-fill-color-blank);
              border-color: var(--el-border-color-light);
            "
          >
            <div class="flex flex-col">
              <span
                class="text-xs uppercase"
                style="color: var(--el-text-color-secondary)"
                >Giá trị hoàn lại</span
              >
              <span class="font-bold text-red-500 text-base mt-1">{{
                formatCurrency(detail.refundAmount || 0)
              }}</span>
            </div>
            <div class="flex flex-col">
              <span
                class="text-xs uppercase"
                style="color: var(--el-text-color-secondary)"
                >Phí hoàn phát sinh</span
              >
              <span
                class="font-bold text-base mt-1"
                style="color: var(--el-text-color-primary)"
                >{{ formatCurrency(detail.returnShippingCost || 0) }}</span
              >
            </div>
            <div class="flex flex-col">
              <span
                class="text-xs uppercase"
                style="color: var(--el-text-color-secondary)"
                >Nhà vận chuyển</span
              >
              <div class="flex items-center gap-1.5 mt-1">
                <el-tag size="small" type="info" effect="plain">{{
                  detail.carrier
                }}</el-tag>
                <span
                  class="text-xs font-mono"
                  style="color: var(--el-text-color-secondary)"
                  >{{ detail.trackingNumber }}</span
                >
              </div>
            </div>
          </div>

          <el-alert
            v-if="detail.carrierReturnNote"
            title="Ghi chú từ bưu tá"
            :description="detail.carrierReturnNote"
            type="warning"
            show-icon
            :closable="false"
          />

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

          <div
            v-if="detail.status === 'pending'"
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

              <div class="text-secondary">Giá trị hoàn:</div>
              <div class="font-medium text-red-500 font-bold">
                {{ formatCurrency(detail.refundAmount || 0) }}
              </div>

              <div class="text-secondary">Phí hoàn phát sinh:</div>
              <div
                class="font-medium font-bold"
                style="color: var(--el-text-color-primary)"
              >
                {{ formatCurrency(detail.returnShippingCost || 0) }}
              </div>

              <div class="text-secondary">Ghi chú:</div>
              <div class="font-medium italic">
                {{ detail.returnInternalNote || "Không có" }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="detail.status === 'pending'"
          class="pt-4 mt-2 border-t border-color shrink-0 flex gap-3 justify-end"
        >
          <ElButton
            type="primary"
            size="large"
            :loading="submitting"
            @click="submitInspection"
          >
            <ElIcon class="mr-1"><Check /></ElIcon> Chuyển Admin phê duyệt
          </ElButton>
        </div>
        <div
          v-else-if="detail.status === 'inspecting'"
          class="pt-4 mt-2 border-t border-color shrink-0 flex gap-3 justify-end"
        >
          <ElTag type="warning" size="large" effect="dark"
            >Đang chờ Admin phê duyệt</ElTag
          >
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

const handleUploadClick = () => {
  // Simulate image upload
  setTimeout(() => {
    inspectForm.value.returnProofImage =
      "https://fakeimg.pl/350x200/?text=Proof";
    ElMessage.success("Tải ảnh thành công");
  }, 500);
};

const submitInspection = async () => {
  if (!detail.value) return;

  if (!inspectForm.value.boxCondition || !inspectForm.value.productCondition) {
    ElMessage.warning("Vui lòng nhập tình trạng hộp và phụ tùng");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Xác nhận lưu thông tin kiểm định và chuyển Admin phê duyệt?`,
      "Xác nhận chuyển",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        type: "info",
      },
    );

    submitting.value = true;
    inspectForm.value.action = ""; // Admin se duyet sau

    await inspectReturn(detail.value.id, inspectForm.value);

    ElMessage.success(`Chuyển Admin phê duyệt thành công`);

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
  status: string | number,
): "danger" | "warning" | "success" | "info" => {
  const strStatus = String(status).toLowerCase();
  const map: Record<string, "danger" | "warning" | "success" | "info"> = {
    pending: "danger",
    "0": "danger",
    inspecting: "warning",
    "1": "warning",
    completed: "success",
    "2": "success",
  };
  return map[strStatus] || "info";
};

const getStatusLabel = (status: string | number) => {
  const strStatus = String(status).toLowerCase();
  const map: Record<string, string> = {
    pending: "Chờ xử lý",
    "0": "Chờ xử lý",
    inspecting: "Đang kiểm tra",
    "1": "Đang kiểm tra",
    completed: "Đã hoàn tất",
    "2": "Đã hoàn tất",
  };
  return map[strStatus] || String(status);
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
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
