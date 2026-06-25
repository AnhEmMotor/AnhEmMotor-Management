<template>
  <ElDialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Lịch sử chỉnh sửa"
    width="800px"
    append-to-body
    destroy-on-close
    @open="fetchData"
    class="rounded-xl overflow-hidden audit-trail-modal"
  >
    <div
      v-loading="loading"
      class="min-h-[200px] max-h-[60vh] overflow-y-auto px-4 py-2"
    >
      <ElEmpty
        v-if="!loading && logs.length === 0"
        description="Chưa có lịch sử chỉnh sửa nào"
      />

      <template v-else>
        <!-- Bảng cho Supplier Debt -->
        <ElTable
          v-if="type === 'supplier-debt-settlement'"
          :data="logs"
          border
          stripe
          style="width: 100%"
        >
          <ElTableColumn
            label="Lần trả"
            type="index"
            width="80"
            align="center"
          />
          <ElTableColumn label="Thời gian" min-width="150" align="center">
            <template #default="{ row }">
              {{ formatDate(row.changedAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Người nhập" min-width="150">
            <template #default="{ row }">
              <span class="font-medium text-gray-700">{{
                row.changedByName || row.changedById || "Hệ thống"
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="Số tiền trả (VNĐ)"
            min-width="150"
            align="right"
          >
            <template #default="{ row }">
              <span class="text-success font-medium">
                {{ formatCurrencyForTable(getPaidAmount(row)) }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="Tổng đã trả (VNĐ)"
            min-width="150"
            align="right"
          >
            <template #default="{ row }">
              <span class="text-danger font-medium">
                {{ formatCurrencyForTable(getNewAmount(row)) }}
              </span>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- Timeline cho các thực thể khác -->
        <ElTimeline v-else>
          <ElTimelineItem
            v-for="(log, index) in logs"
            :key="log.id || index"
            :timestamp="formatDate(log.changedAt)"
            placement="top"
            :type="getActionType(log.action)"
          >
            <ElCard shadow="hover" class="mb-4">
              <div class="flex justify-between items-center mb-2 border-b pb-2">
                <div
                  class="font-semibold text-gray-800 flex items-center gap-2"
                >
                  <ElTag size="small" :type="getActionType(log.action)">{{
                    getActionName(log.action)
                  }}</ElTag>
                  <span
                    v-if="log.entityType"
                    class="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                    >{{ log.entityType }}</span
                  >
                </div>
                <div class="text-sm text-gray-500">
                  Thực hiện bởi:
                  <span class="font-medium text-gray-700">{{
                    log.changedByName || log.changedById || "Hệ thống"
                  }}</span>
                </div>
              </div>

              <div
                v-if="log.changes && log.changes.length > 0"
                class="mt-3 space-y-2"
              >
                <div
                  v-for="(change, idx) in log.changes"
                  :key="idx"
                  class="text-sm bg-gray-50 p-2 rounded"
                >
                  <div class="font-medium text-gray-700 mb-1">
                    {{ change.field }}:
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <template
                      v-if="
                        change.oldValue !== null &&
                        change.oldValue !== undefined &&
                        change.oldValue !== ''
                      "
                    >
                      <span class="line-through text-red-500">{{
                        formatValue(change.oldValue)
                      }}</span>
                      <ElIcon class="text-gray-400"><Right /></ElIcon>
                    </template>
                    <span class="text-green-600 font-medium">{{
                      formatValue(change.newValue)
                    }}</span>
                  </div>
                </div>
              </div>
              <div v-if="log.details" class="mt-3">
                <div
                  v-if="log.details.items && Array.isArray(log.details.items)"
                >
                  <div class="font-medium text-gray-700 mb-2 text-sm">
                    Chi tiết mặt hàng:
                  </div>
                  <ElTable
                    :data="log.details.items"
                    size="small"
                    border
                    class="w-full"
                  >
                    <ElTableColumn
                      prop="action"
                      label="Hành động"
                      width="110"
                      align="center"
                    >
                      <template #default="{ row }">
                        <ElTag size="small" :type="getActionType(row.action)">{{
                          getActionName(row.action)
                        }}</ElTag>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      prop="productVariant"
                      label="Sản phẩm"
                      minWidth="200"
                    />
                    <ElTableColumn
                      v-if="log.details.items.some((i) => i.quantity)"
                      prop="quantity"
                      label="Số lượng"
                      width="120"
                      align="center"
                    />
                    <ElTableColumn
                      v-if="log.details.items.some((i) => i.supplierName)"
                      prop="supplierName"
                      label="Nhà cung cấp"
                      minWidth="150"
                    />
                    <ElTableColumn
                      v-if="log.details.items.some((i) => i.price)"
                      prop="price"
                      label="Đơn giá"
                      minWidth="150"
                      align="center"
                    />
                  </ElTable>
                </div>
                <div
                  v-if="
                    log.details.infoLogs && Array.isArray(log.details.infoLogs)
                  "
                  class="mb-3"
                >
                  <div class="font-medium text-gray-700 mb-2 text-sm">
                    Chi tiết thông tin nhập hàng:
                  </div>
                  <ElTable
                    :data="log.details.infoLogs"
                    size="small"
                    border
                    class="w-full"
                  >
                    <ElTableColumn
                      prop="action"
                      label="Hành động"
                      width="110"
                      align="center"
                    >
                      <template #default="{ row }">
                        <ElTag size="small" :type="getActionType(row.action)">{{
                          getActionName(row.action)
                        }}</ElTag>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      v-if="log.details.infoLogs.some((i) => i.productVariant)"
                      prop="productVariant"
                      label="Sản phẩm"
                      minWidth="200"
                    />
                    <ElTableColumn
                      v-if="log.details.infoLogs.some((i) => i.quantity)"
                      prop="quantity"
                      label="Số lượng"
                      width="150"
                      align="center"
                    />
                  </ElTable>
                </div>
                <div
                  v-if="
                    log.details.vehicleLogs &&
                    Array.isArray(log.details.vehicleLogs)
                  "
                  class="mb-3"
                >
                  <div class="font-medium text-gray-700 mb-2 text-sm">
                    Chi tiết xe:
                  </div>
                  <ElTable
                    :data="log.details.vehicleLogs"
                    size="small"
                    border
                    class="w-full"
                  >
                    <ElTableColumn
                      prop="action"
                      label="Hành động"
                      width="110"
                      align="center"
                    >
                      <template #default="{ row }">
                        <ElTag size="small" :type="getActionType(row.action)">{{
                          getActionName(row.action)
                        }}</ElTag>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      v-if="
                        log.details.vehicleLogs.some((vl) => vl.productVariant)
                      "
                      prop="productVariant"
                      label="Sản phẩm"
                      minWidth="200"
                    />
                    <ElTableColumn
                      prop="vinNumber"
                      label="Số khung"
                      minWidth="150"
                    />
                    <ElTableColumn
                      prop="engineNumber"
                      label="Số máy"
                      minWidth="150"
                    />
                  </ElTable>
                </div>
                <div
                  v-if="
                    !log.details.items &&
                    !log.details.infoLogs &&
                    !log.details.vehicleLogs
                  "
                  class="text-sm text-gray-600"
                >
                  <pre
                    class="whitespace-pre-wrap font-sans bg-gray-50 p-2 rounded"
                    >{{ JSON.stringify(log.details, null, 2) }}</pre
                  >
                </div>
              </div>
            </ElCard>
          </ElTimelineItem>
        </ElTimeline>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-end pt-2">
        <ElButton @click="$emit('update:visible', false)">Đóng</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";
import { AuditTrailApi, type AuditLogItem } from "@/api/operations";
import { ElMessage } from "element-plus";
import { Right } from "@element-plus/icons-vue";

const props = defineProps<{
  visible: boolean;
  recordId: number | null | undefined;
  type:
    | "inventory-receipt"
    | "output"
    | "supplier-debt-settlement"
    | "purchase-request";
}>();

defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const loading = ref(false);
const logs = ref<AuditLogItem[]>([]);

const fetchData = async () => {
  if (!props.recordId) return;

  loading.value = true;
  logs.value = [];

  try {
    let res: AuditLogItem[] = [];

    switch (props.type) {
      case "inventory-receipt":
        res = await AuditTrailApi.getInventoryReceiptLogs(props.recordId);
        break;
      case "output":
        res = await AuditTrailApi.getOutputLogs(props.recordId);
        break;
      case "supplier-debt-settlement":
        res = await AuditTrailApi.getSupplierDebtSettlementLogs(props.recordId);
        break;
      case "purchase-request":
        res = await AuditTrailApi.getPurchaseRequestLogs(props.recordId);
        break;
    }

    logs.value = res || [];
  } catch (error) {
    console.error("Lỗi khi tải lịch sử:", error);
    ElMessage.error("Không thể tải lịch sử chỉnh sửa");
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
};

const formatValue = (val: any) => {
  if (val === null || val === undefined || val === "") return "Trống";
  if (typeof val === "boolean") return val ? "Có" : "Không";
  return val;
};

const getActionType = (action: string) => {
  if (!action) return "info";
  const act = action.toLowerCase();
  if (act.includes("add") || act.includes("create") || act.includes("thêm"))
    return "success";
  if (
    act.includes("update") ||
    act.includes("edit") ||
    act.includes("sửa") ||
    act.includes("cập nhật")
  )
    return "warning";
  if (act.includes("delete") || act.includes("remove") || act.includes("xóa"))
    return "danger";
  return "primary";
};

const getActionName = (action: string) => {
  if (!action) return "Thao tác";
  const act = action.toLowerCase();
  if (act === "add" || act === "create") return "Thêm mới";
  if (act === "update" || act === "edit") return "Cập nhật";
  if (act === "delete" || act === "remove") return "Xóa";
  return action;
};

const formatCurrencyForTable = (val: number | string) => {
  if (val === null || val === undefined) return "0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  return num.toLocaleString("vi-VN");
};

const getPaidAmount = (log: any) => {
  const change = log.changes?.find((c: any) => c.field === "Số tiền");
  if (change) {
    const oldAmount = typeof change.oldValue === "number" ? change.oldValue : 0;
    const newAmount = typeof change.newValue === "number" ? change.newValue : 0;
    return newAmount - oldAmount;
  }
  return 0;
};

const getNewAmount = (log: any) => {
  const change = log.changes?.find((c: any) => c.field === "Số tiền");
  if (change && typeof change.newValue === "number") {
    return change.newValue;
  }
  return 0;
};
</script>

<style scoped>
.audit-trail-modal :deep(.el-timeline-item__timestamp) {
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}
</style>
