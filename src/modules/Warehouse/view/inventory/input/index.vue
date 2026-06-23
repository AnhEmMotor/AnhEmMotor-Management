<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ArtStatsCard
        title="Tổng xe nhập tháng"
        :count="stats.totalVehicles"
        icon="ri:motorbike-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang xử lý"
        :count="stats.processingReceipts"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
    </div>

    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="120"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton
            type="primary"
            v-ripple
            @click="handleAdd"
            v-auth="Permissions.InventoryReceiptsCreate"
          >
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo phiếu nhập
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </template>

        <template #productSummary="{ row }">
          <div class="text-xs text-gray-500 max-w-[400px] truncate">
            {{ getProductSummaryText(row.products) }}
          </div>
        </template>

        <template #statusId="{ row }">
          <ElTag :type="getStatusTagType(row.statusId)" size="small">
            {{ getStatusLabel(row.statusId) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Xem chi tiết" placement="top">
              <ElButton
                circle
                size="small"
                type="info"
                @click="handleViewDetail(row)"
              >
                <ElIcon><View /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip v-if="canEdit(row)" content="Chỉnh sửa" placement="top">
              <ElButton
                circle
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="
                row.statusId?.toLowerCase() === 'draft' &&
                hasAuth(Permissions.InventoryReceiptsSend)
              "
              content="Gửi phiếu"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="warning"
                @click="handleSendReceipt(row.id)"
              >
                <ElIcon><Promotion /></ElIcon>
              </ElButton>
            </ElTooltip>
            <template
              v-if="
                row.statusId?.toLowerCase() === 'sent' &&
                hasAuth(Permissions.InventoryReceiptsApproveReject)
              "
            >
              <ElTooltip content="Phê duyệt" placement="top">
                <ElButton
                  circle
                  size="small"
                  type="success"
                  @click="handleApproveRejectReceipt(row.id, 'approve')"
                >
                  <ElIcon><Check /></ElIcon>
                </ElButton>
              </ElTooltip>
              <ElTooltip content="Từ chối" placement="top">
                <ElButton
                  circle
                  size="small"
                  type="danger"
                  @click="handleApproveRejectReceipt(row.id, 'reject')"
                >
                  <ElIcon><Close /></ElIcon>
                </ElButton>
              </ElTooltip>
            </template>
            <ElTooltip v-if="canDelete(row)" content="Xóa" placement="top">
              <ElButton
                circle
                size="small"
                type="danger"
                @click="handleDelete(row)"
              >
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1000px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm :model="formData" label-width="150px" class="mt-4" ref="formRef">
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Yêu cầu mua hàng" required class="col-span-2">
            <div class="flex gap-2 w-full">
              <div
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200"
                @click="openPrSelector"
              >
                <span
                  v-if="formData.purchaseRequestId"
                  class="text-gray-800 font-medium"
                >
                  Yêu cầu mua hàng #{{ formData.purchaseRequestId }}
                </span>
                <span v-else class="text-gray-400"
                  >Chọn Yêu cầu mua hàng (PR)...</span
                >
                <ElIcon class="text-gray-400"><ArrowDown /></ElIcon>
              </div>
              <ElButton
                v-if="formData.purchaseRequestId"
                type="danger"
                plain
                @click="clearPrSelection"
              >
                Bỏ chọn PR
              </ElButton>
            </div>
          </ElFormItem>
        </div>

        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            placeholder="Nhập ghi chú hoặc thông tin bổ sung cho phiếu nhập này..."
          />
        </ElFormItem>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700"
              >Chi tiết sản phẩm nhập kho</span
            >
          </div>

          <ElTable :data="formData.products" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm" min-width="260" required>
              <template #default="{ row, $index }">
                <div class="text-xs font-semibold text-gray-800 py-1">
                  {{ getProductNameById(row.productVariantId) }}
                </div>
                <ElTag
                  v-if="getProductColorName(row)"
                  size="small"
                  type="info"
                  class="mt-1 w-fit"
                >
                  Màu: {{ getProductColorName(row) }}
                </ElTag>
                <div
                  v-if="isVinManagedProduct(row)"
                  class="flex items-center gap-2 mt-1"
                >
                  <ElTag size="small" type="warning">
                    VIN {{ getVehicleIdentityProgress(row) }}
                  </ElTag>
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    @click="openVinDialog($index)"
                  >
                    Nhập VIN
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng nhập" width="130" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.count"
                  :min="0"
                  :max="row.maxUnimportedQuantity"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                  style="width: 100px"
                  @change="handleProductCountChange(row)"
                />
                <div class="text-[10px] text-gray-400 mt-1">
                  (Yêu cầu: {{ row.maxUnimportedQuantity || 0 }})
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="90" align="center">
              <template #default="{ row, $index }">
                <div class="flex gap-1 justify-center">
                  <ElTooltip
                    v-if="isVinManagedProduct(row)"
                    content="Nhập số khung, số máy"
                    placement="top"
                  >
                    <ElButton
                      circle
                      type="warning"
                      size="small"
                      plain
                      @click="openVinDialog($index)"
                    >
                      VIN
                    </ElButton>
                  </ElTooltip>
                  <ElButton
                    circle
                    type="danger"
                    size="small"
                    plain
                    @click="handleRemoveProductRow($index)"
                  >
                    <ElIcon><Delete /></ElIcon>
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            {{ isEdit ? "Cập nhật" : "Lưu phiếu" }}
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="vinDialogVisible"
      title="Nhập định danh xe"
      width="860px"
      append-to-body
      destroy-on-close
      class="vin-identification-dialog"
      top="2vh"
    >
      <div v-if="activeVinRow" class="flex flex-col gap-3">
        <div
          class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 p-3"
        >
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-800 truncate">
              {{ getProductNameById(activeVinRow.productVariantId) }}
            </div>
            <div class="text-xs text-gray-500">
              Số lượng: {{ activeVinRow.count || 0 }} xe · Đã nhập:
              {{ getCompletedVehicleIdentityCount(activeVinRow) }}/{{
                activeVinRow.count || 0
              }}
            </div>
          </div>
          <ElTag type="warning">Quản lý theo VIN</ElTag>
        </div>

        <div class="vin-dialog-table">
          <ElTable
            :data="activeVinRow.vehicles"
            border
            size="small"
            class="w-full"
          >
            <ElTableColumn label="#" type="index" width="56" align="center" />
            <ElTableColumn label="Số khung (VIN)" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput
                  v-model="vehicle.vinNumber"
                  placeholder="Nhập số khung"
                  clearable
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Số máy" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput
                  v-model="vehicle.engineNumber"
                  placeholder="Nhập số máy"
                  clearable
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thao tác" width="80" align="center">
              <template #default="{ $index }">
                <ElButton link type="danger" @click="removeVehicleRow($index)">
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="vinDialogVisible = false">Đóng</ElButton>
          <ElButton type="primary" @click="vinDialogVisible = false"
            >Xong</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết phiếu nhập kho"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div v-if="detailData" class="flex flex-col gap-4">
        <div class="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <span class="text-gray-500">Mã phiếu nhập:</span>
            <span class="ml-2 text-gray-800 font-bold"
              >#{{ detailData.id }}</span
            >
          </div>
          <div>
            <span class="text-gray-500">Mã Yêu cầu mua hàng (PR):</span>
            <span class="ml-2 text-gray-800 font-medium"
              >#{{ detailData.purchaseRequestId || "--" }}</span
            >
          </div>
          <div>
            <span class="text-gray-500">Trạng thái:</span>
            <span class="ml-2">
              <ElTag :type="getStatusTagType(detailData.statusId)" size="small">
                {{ getStatusLabel(detailData.statusId) }}
              </ElTag>
            </span>
          </div>
          <div>
            <span class="text-gray-500">Thời gian tạo:</span>
            <span class="ml-2 text-gray-700">{{
              formatDateTime(detailData.createdAt)
            }}</span>
          </div>
          <div>
            <span class="text-gray-500">Người tạo:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.createdByName || "N/A"
            }}</span>
          </div>
          <div v-if="detailData.sentByName">
            <span class="text-gray-500">Người gửi:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.sentByName
            }}</span>
          </div>
          <div
            v-if="
              detailData.statusId?.toLowerCase() === 'approve' &&
              detailData.approvedByName
            "
          >
            <span class="text-gray-500">Người duyệt:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.approvedByName
            }}</span>
          </div>
          <div
            v-if="
              detailData.statusId?.toLowerCase() === 'reject' &&
              detailData.rejectedByName
            "
          >
            <span class="text-gray-500">Người từ chối:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.rejectedByName
            }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200 pt-2 mt-1">
            <span class="text-gray-500 font-medium"
              >Ghi chú (Có thể chỉnh sửa):</span
            >
            <ElInput
              v-model="detailNotes"
              type="textarea"
              :rows="2"
              placeholder="Nhập ghi chú cho phiếu nhập..."
              class="mt-1"
            />
          </div>
        </div>

        <div class="mt-2">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">
            Danh sách sản phẩm nhập
          </h4>
          <ElTable
            :data="detailData.products"
            border
            size="small"
            class="w-full"
          >
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Tên sản phẩm" minWidth="220">
              <template #default="{ row }">
                <div class="flex flex-col gap-1">
                  <span class="font-medium text-gray-800">{{ row.name }}</span>
                  <ElTag
                    v-if="row.productVariantColorName"
                    size="small"
                    type="info"
                    class="w-fit"
                  >
                    Màu: {{ row.productVariantColorName }}
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Nhà cung cấp" width="180">
              <template #default="{ row }">
                <span>{{ row.supplierName || "N/A" }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="130" align="right">
              <template #default="{ row }">
                <span>{{ formatCurrency(row.unitPrice) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="quantity"
              label="Số lượng nhập"
              width="100"
              align="center"
            />
            <ElTableColumn label="Định danh xe" minWidth="260">
              <template #default="{ row }">
                <div
                  v-if="row.vehicles?.length"
                  class="flex flex-col gap-1 text-xs text-gray-600"
                >
                  <div
                    v-for="vehicle in row.vehicles"
                    :key="
                      vehicle.id ||
                      `${vehicle.vinNumber}-${vehicle.engineNumber}`
                    "
                    class="rounded border border-gray-100 bg-gray-50 px-2 py-1"
                  >
                    <div>
                      <span class="text-gray-400">VIN:</span>
                      {{ vehicle.vinNumber }}
                    </div>
                    <div>
                      <span class="text-gray-400">Số máy:</span>
                      {{ vehicle.engineNumber }}
                    </div>
                  </div>
                </div>
                <span v-else class="text-gray-400">--</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
      <template #footer>
        <div
          class="flex justify-between items-center border-t border-gray-50 pt-3"
        >
          <div>
            <ElButton
              v-if="detailData?.id"
              type="primary"
              plain
              @click="auditTrailVisible = true"
            >
              <ElIcon class="mr-1"><Clock /></ElIcon> Lịch sử chỉnh sửa
            </ElButton>
          </div>
          <div class="flex gap-2">
            <ElButton @click="detailDialogVisible = false">Đóng</ElButton>

            <template v-if="detailData">
              <ElButton
                v-if="
                  detailData.statusId?.toLowerCase() === 'draft' &&
                  hasAuth(Permissions.InventoryReceiptsSend)
                "
                type="primary"
                :loading="detailSubmitting"
                @click="handleSendReceipt(detailData.id)"
              >
                Gửi phiếu
              </ElButton>
              <ElButton
                v-if="
                  detailData.statusId?.toLowerCase() === 'sent' &&
                  hasAuth(Permissions.InventoryReceiptsApproveReject)
                "
                type="success"
                :loading="detailSubmitting"
                @click="handleApproveRejectReceipt(detailData.id, 'approve')"
              >
                Phê duyệt
              </ElButton>
              <ElButton
                v-if="
                  detailData.statusId?.toLowerCase() === 'sent' &&
                  hasAuth(Permissions.InventoryReceiptsApproveReject)
                "
                type="danger"
                :loading="detailSubmitting"
                @click="handleApproveRejectReceipt(detailData.id, 'reject')"
              >
                Từ chối
              </ElButton>
            </template>
          </div>
        </div>
      </template>
    </ElDialog>

    <AuditTrailModal
      v-model:visible="auditTrailVisible"
      :record-id="detailData?.id"
      type="inventory-receipt"
    />

    <ElDialog
      v-model="prSelectorVisible"
      title="Chọn Yêu cầu mua hàng (PR)"
      width="680px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          placeholder="Tìm kiếm theo mã yêu cầu PR..."
          clearable
          prefix-icon="Search"
          v-model="prSelectorQuery"
          @input="handlePrSelectorSearch"
        />

        <div
          v-loading="prSelectorLoading"
          class="grid grid-cols-1 gap-3 min-h-[300px] max-h-[450px] overflow-y-auto pr-1"
        >
          <div
            v-for="pr in prSelectorItems"
            :key="pr.id"
            class="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition duration-200 cursor-pointer flex flex-col justify-between"
            @click="selectPurchaseRequest(pr)"
          >
            <div class="text-xs text-gray-500 space-y-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-gray-800 text-sm"
                  >Mã PR: #{{ pr.id }}</span
                >
                <ElTag size="small" type="success">Đã phê duyệt</ElTag>
              </div>
              <div>
                <span class="font-medium text-gray-400">Ghi chú:</span>
                {{ pr.notes || "Không có ghi chú" }}
              </div>
              <div>
                <span class="font-medium text-gray-400">Ngày yêu cầu:</span>
                {{ formatDateTime(pr.createdAt) }}
              </div>
            </div>
          </div>
          <div
            v-if="!prSelectorLoading && prSelectorItems.length === 0"
            class="flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm"
              >Không tìm thấy yêu cầu mua hàng nào hợp lệ</span
            >
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="prSelectorPage"
            v-model:page-size="prSelectorPageSize"
            :total="prSelectorTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="fetchSelectorPrs"
          />
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useAuth } from "@/hooks/core/useAuth";
import { useUserStore } from "@/application/store/user";
import { useRouter } from "vue-router";
import {
  Plus,
  Edit,
  Delete,
  View,
  ArrowDown,
  Check,
  Close,
  Promotion,
  InfoFilled,
  Clock,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import { InventoryReceiptApi } from "@/api/inventory-receipt.api";
import { PurchaseRequestApi } from "@/api/purchase-request.api";
import { Permissions } from "@/domain/constants/permissions";
import type {
  InventoryReceipt,
  InputInfo,
} from "@/domain/inventory/receipt.types";
import AuditTrailModal from "@/components/business/audit-trail-modal/index.vue";

defineOptions({ name: "InventoryReceipt" });

const auditTrailVisible = ref(false);

type VehicleIdentification = {
  id?: number;
  vinNumber: string;
  engineNumber: string;
  importPrice?: number;
};

type ReceiptProductRow = {
  id?: number;
  productVariantId: number | undefined;
  productVariantColorId?: number;
  productVariantColorName?: string;
  count: number;
  managementType?: string;
  vehicles?: VehicleIdentification[];
  purchaseRequestItemId?: number;
  maxUnimportedQuantity?: number;
  needVin?: boolean;
};

const VIN_MANAGEMENT_TYPE = "vin_number";

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("Tạo phiếu nhập mới");
const submitting = ref(false);
const isEdit = ref(false);
const vinDialogVisible = ref(false);
const vinDialogRowIndex = ref<number | null>(null);
const activeVinRow = computed(() => {
  if (vinDialogRowIndex.value === null) return null;
  return formData.value.products[vinDialogRowIndex.value] ?? null;
});

const detailDialogVisible = ref(false);
const detailData = ref<any>(null);
const detailNotes = ref("");
const detailSubmitting = ref(false);

const router = useRouter();
const userStore = useUserStore();
const { hasAuth: standardHasAuth } = useAuth();

const hasAuth = (auth: string): boolean => {
  const buttons = userStore.info?.buttons ?? [];
  if (buttons.includes(auth)) return true;

  const authList =
    (router.currentRoute.value?.meta?.authList as Array<{
      authMark: string;
    }>) || [];
  if (authList.some((item) => item?.authMark === auth)) return true;

  return standardHasAuth(auth);
};

const canEdit = (row?: InventoryReceipt | null) => {
  if (!row) return false;
  const status = (row.statusId || "").toLowerCase();
  if (status === "approve" || status === "reject") return false;
  if (status === "sent")
    return hasAuth(Permissions.InventoryReceiptsApproveReject);
  return (
    hasAuth(Permissions.InventoryReceiptsEdit) ||
    hasAuth(Permissions.InventoryReceiptsApproveReject)
  );
};

const canDelete = (row?: InventoryReceipt | null) => {
  if (!row) return false;
  const status = (row.statusId || "").toLowerCase();
  if (status === "approve" || status === "reject") return false;
  if (status === "sent")
    return hasAuth(Permissions.InventoryReceiptsApproveReject);
  return (
    hasAuth(Permissions.InventoryReceiptsDelete) ||
    hasAuth(Permissions.InventoryReceiptsApproveReject)
  );
};

const handleSendReceipt = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc chắn muốn gửi phiếu nhập này? Sau khi gửi, bạn sẽ không thể tự chỉnh sửa hoặc xóa nữa (trừ người có quyền phê duyệt).",
      "Xác nhận gửi",
      {
        confirmButtonText: "Gửi",
        cancelButtonText: "Hủy",
        type: "info",
      },
    );
    detailSubmitting.value = true;
    await InventoryReceiptApi.send(id);
    ElMessage.success("Gửi phiếu nhập thành công");
    detailDialogVisible.value = false;
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("Failed to send receipt:", error);
      ElMessage.error(error.message || "Gửi thất bại");
    }
  } finally {
    detailSubmitting.value = false;
  }
};

const handleApproveRejectReceipt = async (
  id: number,
  action: "approve" | "reject",
) => {
  const isApprove = action === "approve";
  const title = isApprove ? "Xác nhận phê duyệt" : "Xác nhận từ chối";
  const message = isApprove
    ? "Bạn có chắc chắn muốn phê duyệt phiếu nhập này? Số lượng sản phẩm sẽ được cộng vào kho."
    : "Bạn có chắc chắn muốn từ chối phê duyệt phiếu nhập này?";

  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: isApprove ? "Duyệt" : "Từ chối",
      cancelButtonText: "Hủy",
      type: isApprove ? "success" : "warning",
    });
    detailSubmitting.value = true;
    await InventoryReceiptApi.updateStatus(id, action);
    ElMessage.success(
      isApprove
        ? "Phê duyệt phiếu nhập thành công"
        : "Từ chối phiếu nhập thành công",
    );
    detailDialogVisible.value = false;
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error(`Failed to ${action} receipt:`, error);
      ElMessage.error(error.message || "Thao tác thất bại");
    }
  } finally {
    detailSubmitting.value = false;
  }
};

const stats = ref({
  totalVehicles: 0,
  processingReceipts: 0,
  totalValue: 0,
});

const statuses = ref<Record<string, string>>({});
const productCache = reactive(
  new Map<
    number,
    {
      displayName: string;
      price?: number;
      managementType?: string;
      colorName?: string;
    }
  >(),
);

const getProductNameById = (id?: number) => {
  if (!id) return "";
  return productCache.get(Number(id))?.displayName || `Sản phẩm #${id}`;
};

const getProductColorName = (row: any) => {
  return (
    row.productVariantColorName ||
    productCache.get(Number(row.productVariantId))?.colorName ||
    ""
  );
};

const isVinManagedProduct = (row: any) => {
  return row.managementType?.toLowerCase() === VIN_MANAGEMENT_TYPE;
};

const createEmptyVehicle = (defaultPrice = 0): VehicleIdentification => ({
  vinNumber: "",
  engineNumber: "",
  importPrice: defaultPrice,
});

const syncVehicleRows = (row: any) => {
  if (!isVinManagedProduct(row)) {
    row.vehicles = undefined;
    return;
  }

  const targetCount = Math.max(Number(row.count) || 0, 0);
  const currentVehicles = row.vehicles ?? [];
  const invoicedList = row.invoicedVehicles || [];

  if (currentVehicles.length > targetCount) {
    row.vehicles = currentVehicles.slice(0, targetCount);
    return;
  }

  const newVehicles = [...currentVehicles];

  // 1. Try to populate from invoicedList for any VINs that are not yet in newVehicles
  for (
    let i = 0;
    i < invoicedList.length && newVehicles.length < targetCount;
    i++
  ) {
    const inv = invoicedList[i];
    const alreadyInList = newVehicles.some(
      (v: any) => v.vinNumber === inv.vinNumber && inv.vinNumber !== "",
    );
    if (!alreadyInList) {
      newVehicles.push({
        id: inv.id,
        vinNumber: inv.vinNumber,
        engineNumber: inv.engineNumber,
        importPrice: inv.importPrice || row.unitPrice || 0,
      });
    }
  }

  // 2. Fill up to targetCount with empty vehicles
  while (newVehicles.length < targetCount) {
    newVehicles.push(createEmptyVehicle(row.unitPrice || 0));
  }

  row.vehicles = newVehicles;
};

const handleProductCountChange = (row: any) => {
  const newCount = Number(row.count) || 0;
  const currentVehicles = row.vehicles || [];

  if (newCount < currentVehicles.length) {
    const removedVehicles = currentVehicles.slice(newCount);
    const hasData = removedVehicles.some(
      (v: any) => v.vinNumber?.trim() || v.engineNumber?.trim(),
    );
    if (hasData) {
      ElMessage.warning(
        "Số lượng giảm ảnh hưởng đến thông tin số khung/số máy đã nhập. Vui lòng mở hộp thoại Nhập VIN và xóa trực tiếp dòng xe mong muốn.",
      );
      row.count = currentVehicles.length; // Revert the input value
      return;
    }
  }
  syncVehicleRows(row);
};

const removeVehicleRow = (index: number) => {
  const row = activeVinRow.value;
  if (!row || !row.vehicles) return;
  row.vehicles.splice(index, 1);
  row.count = row.vehicles.length;
};

const getCompletedVehicleIdentityCount = (row: any) => {
  return (row.vehicles ?? []).filter(
    (vehicle: any) => vehicle.vinNumber?.trim() && vehicle.engineNumber?.trim(),
  ).length;
};

const getVehicleIdentityProgress = (row: any) => {
  return `${getCompletedVehicleIdentityCount(row)}/${row.count || 0}`;
};

const openVinDialog = (rowIndex: number) => {
  const row = formData.value.products[rowIndex];
  if (!row || !isVinManagedProduct(row)) return;
  syncVehicleRows(row);
  vinDialogRowIndex.value = rowIndex;
  vinDialogVisible.value = true;
};

const formData = ref<{
  id?: number;
  purchaseRequestId: number | undefined;
  notes: string;
  statusId: string;
  products: ReceiptProductRow[];
}>({
  purchaseRequestId: undefined,
  notes: "",
  statusId: "working",
  products: [],
});

const prSelectorVisible = ref(false);
const prSelectorLoading = ref(false);
const prSelectorItems = ref<any[]>([]);
const prSelectorPage = ref(1);
const prSelectorPageSize = ref(10);
const prSelectorTotal = ref(0);
const prSelectorQuery = ref("");

const fetchSelectorPrs = async () => {
  prSelectorLoading.value = true;
  try {
    const filters = [];
    if (prSelectorQuery.value.trim()) {
      filters.push(`Id==${prSelectorQuery.value.trim()}`);
    }
    const res = await PurchaseRequestApi.getApprovedList({
      current: prSelectorPage.value,
      size: prSelectorPageSize.value,
      Filters: filters.join(","),
    });
    prSelectorItems.value = res.items || [];
    prSelectorTotal.value = res.totalCount || 0;
  } catch (err) {
    console.error("Failed to fetch selector PRs:", err);
  } finally {
    prSelectorLoading.value = false;
  }
};

const openPrSelector = () => {
  prSelectorQuery.value = "";
  prSelectorPage.value = 1;
  prSelectorVisible.value = true;
  fetchSelectorPrs();
};

const handlePrSelectorSearch = useDebounceFn(async () => {
  prSelectorPage.value = 1;
  await fetchSelectorPrs();
}, 300);

const clearPrSelection = () => {
  formData.value.purchaseRequestId = undefined;
  formData.value.products = [];
};

const selectPurchaseRequest = async (pr: any) => {
  try {
    loading.value = true;
    prSelectorVisible.value = false;
    formData.value.purchaseRequestId = pr.id;
    formData.value.products = [];
    const detail = await PurchaseRequestApi.getApprovedById(pr.id);

    const productPromises = detail.items.map(async (item: any) => {
      const remainingQty = item.unimportedQuantity ?? 0;
      if (remainingQty <= 0) return null;

      const isVin = item.needVin || false;

      const newRow: ReceiptProductRow = {
        productVariantId: item.productVariantId,
        productVariantColorId: item.productVariantColorId,
        productVariantColorName: item.productVariantColorName,
        count: remainingQty,
        purchaseRequestItemId: item.id,
        maxUnimportedQuantity: remainingQty,
        needVin: isVin,
        managementType: isVin ? VIN_MANAGEMENT_TYPE : "sku",
        vehicles: [],
      };

      productCache.set(item.productVariantId, {
        displayName: item.productName || `Sản phẩm #${item.productVariantId}`,
        managementType: isVin ? VIN_MANAGEMENT_TYPE : "sku",
        colorName: item.productVariantColorName,
      });

      syncVehicleRows(newRow);
      return newRow;
    });

    const rows = await Promise.all(productPromises);
    formData.value.products = rows.filter(
      (r) => r !== null,
    ) as ReceiptProductRow[];
  } catch (err) {
    console.error(err);
    ElMessage.error("Không thể nạp thông tin Yêu cầu mua hàng");
  } finally {
    loading.value = false;
  }
};

const data = ref<InventoryReceipt[]>([]);
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

const searchForm = ref({
  supplierName: "",
  statusId: [] as string[],
});

const searchItems = computed(() => [
  {
    key: "statusId",
    label: "Trạng thái",
    type: "select",
    props: {
      placeholder: "Tất cả trạng thái",
      clearable: true,
      multiple: true,
      collapseTags: true,
      options: Object.entries(statuses.value).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    },
  },
]);

const columns = ref([
  { label: "Thời gian tạo", prop: "createdAt", useSlot: true, width: 170 },
  { label: "Tóm tắt SP", prop: "productSummary", useSlot: true, minWidth: 320 },
  {
    label: "Trạng thái",
    prop: "statusId",
    useSlot: true,
    width: 150,
    align: "center",
  },
  {
    label: "Thao tác",
    prop: "operation",
    useSlot: true,
    width: 200,
    fixed: "right" as const,
    align: "center",
  },
]);

const columnChecks = columns;

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (statusId?: string) => {
  if (!statusId) return "-";
  return statuses.value[statusId] || statusId;
};

const getStatusTagType = (statusId?: string) => {
  if (!statusId) return "info";
  switch (statusId.toLowerCase()) {
    case "draft":
      return "info";
    case "sent":
      return "warning";
    case "approve":
      return "success";
    case "reject":
      return "danger";
    default:
      return "info";
  }
};

const getProductSummaryText = (products?: InputInfo[]) => {
  if (!products || products.length === 0) return "Không có sản phẩm";
  return products.map((p) => `${p.name} (SL: ${p.quantity})`).join(", ");
};

const loadStatuses = async () => {
  try {
    statuses.value = await InventoryReceiptApi.getStatuses();
  } catch (error) {
    console.error("Failed to load statuses:", error);
    statuses.value = {
      draft: "Phiếu tạm",
      sent: "Đã gửi",
      approve: "Đã duyệt",
      reject: "Đã từ chối",
    };
  }
};

const loadStats = async () => {
  try {
    const res = await InventoryReceiptApi.getStats();
    stats.value = {
      totalVehicles: res.totalVehicles || 0,
      processingReceipts: res.processingReceipts || 0,
      totalValue: 0,
    };
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
};

const loadData = async () => {
  await loadDataWithFilters(searchForm.value);
};

const loadDataWithFilters = async (filters?: any) => {
  loading.value = true;
  try {
    const sieveFilters = [];
    if (filters?.statusId && filters.statusId.length > 0) {
      if (Array.isArray(filters.statusId)) {
        sieveFilters.push(`StatusId==${filters.statusId.join("|")}`);
      } else {
        sieveFilters.push(`StatusId==${filters.statusId}`);
      }
    }

    const params = {
      current: pagination.current,
      size: pagination.size,
      Filters: sieveFilters.join(",") || undefined,
      Sorts: "-createdAt",
    };

    const res = await InventoryReceiptApi.getList(params);
    data.value = res.items || [];
    pagination.total = res.totalCount || 0;
    await loadStats();
  } catch (error) {
    console.error("Failed to load inventory receipts:", error);
    ElMessage.error("Không thể tải danh sách phiếu nhập kho");
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters: any) => {
  pagination.current = 1;
  loadDataWithFilters(filters);
};

const handleReset = () => {
  pagination.current = 1;
  loadDataWithFilters();
};

const refreshData = () => {
  loadData();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  loadData();
};

const handleCurrentChange = (page: number) => {
  pagination.current = page;
  loadData();
};

const handleViewDetail = async (row: InventoryReceipt) => {
  try {
    loading.value = true;
    const res = await InventoryReceiptApi.getById(row.id);
    detailData.value = res;
    detailNotes.value = res.notes || "";
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("Failed to load receipt details:", error);
    ElMessage.error("Không thể tải chi tiết phiếu nhập");
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "Tạo phiếu nhập mới";
  formData.value = {
    purchaseRequestId: undefined,
    notes: "",
    statusId: "working",
    products: [],
  };
  dialogVisible.value = true;
};

const handleEdit = async (row: InventoryReceipt) => {
  try {
    loading.value = true;
    const receipt = await InventoryReceiptApi.getById(row.id);
    isEdit.value = true;
    dialogTitle.value = "Cập nhật phiếu nhập";

    let prDetail: any = null;
    if (receipt.purchaseRequestId) {
      try {
        prDetail = await PurchaseRequestApi.getApprovedById(
          receipt.purchaseRequestId,
          receipt.id,
        );
      } catch (e) {
        console.error("Cannot load PR details for editing receipt", e);
      }
    }
    const prItemsMap = prDetail
      ? new Map(prDetail.items.map((i: any) => [i.id, i]))
      : new Map();

    formData.value = {
      id: receipt.id,
      purchaseRequestId: receipt.purchaseRequestId,
      notes: receipt.notes || "",
      statusId: receipt.statusId || "working",
      products: await Promise.all(
        (receipt.products || []).map(async (p: any) => {
          const prItem: any = prItemsMap.get(p.purchaseRequestItemId);
          const isVin =
            (p.vehicles && p.vehicles.length > 0) ||
            (prItem && prItem.needVin) ||
            false;
          productCache.set(p.productVariantId, {
            displayName: p.name || `Sản phẩm #${p.productVariantId}`,
            colorName: p.productVariantColorName,
          });

          return {
            id: p.id,
            productVariantId: p.productVariantId,
            productVariantColorId: p.productVariantColorId,
            productVariantColorName: p.productVariantColorName,
            count: p.quantity || 0,
            managementType: isVin ? VIN_MANAGEMENT_TYPE : "sku",
            needVin: isVin,
            purchaseRequestItemId: p.purchaseRequestItemId,
            maxUnimportedQuantity: p.maxAllowedQuantity ?? (p.quantity || 0),
            invoicedVehicles: prItem ? prItem.invoicedVehicles || [] : [],
            vehicles: (p.vehicles || []).map((vehicle: any) => ({
              id: vehicle.id,
              vinNumber: vehicle.vinNumber || "",
              engineNumber: vehicle.engineNumber || "",
            })),
          };
        }),
      ),
    };
    dialogVisible.value = true;
  } catch (error) {
    console.error("Failed to load receipt details for editing:", error);
    ElMessage.error("Không thể tải chi tiết phiếu nhập");
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (row: InventoryReceipt) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa phiếu nhập số #${row.id}?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
    await InventoryReceiptApi.delete(row.id);
    ElMessage.success("Xóa phiếu nhập công thành");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete receipt:", error);
      ElMessage.error("Xóa phiếu nhập thất bại");
    }
  }
};

const handleRemoveProductRow = (index: number) => {
  if (formData.value.products.length <= 1) {
    ElMessage.warning("Phiếu nhập phải chứa ít nhất một sản phẩm");
    return;
  }
  formData.value.products.splice(index, 1);
};

const submitForm = async () => {
  if (!formData.value.purchaseRequestId) {
    ElMessage.warning("Vui lòng chọn yêu cầu mua hàng (PR)");
    return;
  }

  const invalidCount = formData.value.products.filter(
    (p) => (p.count || 0) <= 0,
  );
  if (invalidCount.length > 0) {
    ElMessage.error("Số lượng nhập của tất cả sản phẩm phải lớn hơn 0!");
    return;
  }

  for (const product of formData.value.products) {
    if (!isVinManagedProduct(product)) continue;

    syncVehicleRows(product);
    const vehicles = product.vehicles ?? [];
    if (vehicles.length !== product.count) {
      ElMessage.warning("Số dòng định danh xe phải đúng bằng số lượng nhập");
      return;
    }

    const hasMissingRequiredCode = vehicles.some(
      (vehicle) => !vehicle.vinNumber?.trim() || !vehicle.engineNumber?.trim(),
    );
    if (hasMissingRequiredCode) {
      ElMessage.warning(
        "Vui lòng nhập đủ số khung (VIN) và số máy cho sản phẩm quản lý theo VIN",
      );
      return;
    }

    const normalizedVins = vehicles.map((vehicle) =>
      vehicle.vinNumber.trim().toLowerCase(),
    );
    const normalizedEngines = vehicles.map((vehicle) =>
      vehicle.engineNumber.trim().toLowerCase(),
    );
    if (new Set(normalizedVins).size !== normalizedVins.length) {
      ElMessage.warning("Số khung (VIN) bị trùng trong cùng dòng sản phẩm");
      return;
    }
    if (new Set(normalizedEngines).size !== normalizedEngines.length) {
      ElMessage.warning("Số máy bị trùng trong cùng dòng sản phẩm");
      return;
    }
  }

  submitting.value = true;
  try {
    const payloadProducts = formData.value.products.map((p) => ({
      id: p.id,
      purchaseRequestItemId: p.purchaseRequestItemId,
      productVariantId: p.productVariantId!,
      productVariantColorId: p.productVariantColorId,
      count: p.count,
      vehicles: isVinManagedProduct(p)
        ? p.vehicles?.map((vehicle) => ({
            id: vehicle.id,
            vinNumber: vehicle.vinNumber.trim(),
            engineNumber: vehicle.engineNumber.trim(),
            importPrice: vehicle.importPrice || 0,
          }))
        : undefined,
    }));

    if (isEdit.value && formData.value.id) {
      const payload = {
        notes: formData.value.notes,
        purchaseRequestId: formData.value.purchaseRequestId,
        products: payloadProducts,
      };
      await InventoryReceiptApi.update(formData.value.id, payload);
      ElMessage.success("Cập nhật phiếu nhập thành công");
    } else {
      const payload = {
        notes: formData.value.notes,
        purchaseRequestId: formData.value.purchaseRequestId,
        products: payloadProducts.map(
          ({
            purchaseRequestItemId,
            productVariantId,
            productVariantColorId,
            count,
            vehicles,
          }) => ({
            purchaseRequestItemId,
            productVariantId,
            productVariantColorId,
            count,
            vehicles,
          }),
        ),
      };
      await InventoryReceiptApi.create(payload);
      ElMessage.success("Tạo phiếu nhập thành công");
    }
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    console.error("Failed to save receipt:", error);
    ElMessage.error(error.message || "Không thể lưu phiếu nhập");
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await loadStatuses();
  await loadData();
});
</script>

<style scoped>
:deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

:deep(.vin-identification-dialog) {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 4vh);
  margin-bottom: 2vh;
  overflow: hidden;
}

:deep(.vin-identification-dialog .el-dialog__body) {
  flex: 1;
  min-height: 0;
  padding-top: 12px;
  padding-bottom: 12px;
  overflow: hidden;
}

:deep(.vin-identification-dialog .el-dialog__footer) {
  flex-shrink: 0;
}

.vin-dialog-table {
  max-height: calc(100vh - 250px);
  overflow: auto;
}
</style>
