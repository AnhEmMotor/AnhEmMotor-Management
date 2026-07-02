<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        title="Tổng phiếu"
        :count="pagination.total"
        icon="ri:file-list-3-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Chờ xử lý"
        :count="pendingCount"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Hoàn tất"
        :count="completedCount"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Doanh thu trang"
        :count="formatCurrency(pageRevenue)"
        icon="ri:money-dollar-circle-line"
        iconStyle="bg-info"
      />
    </div>

    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="110"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="fetchOrders"
      >
        <template #left>
          <ElButton
            type="primary"
            v-ripple
            @click="handleAdd"
            v-auth="Permissions.Order.SalesInvoiceManagement.Create"
          >
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo phiếu bán
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="orders"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
        <template #customer="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-800">{{
              row.customerName || row.buyerName || "---"
            }}</span>
            <span class="text-xs text-gray-500">{{
              row.customerPhone || row.buyerEmail || "---"
            }}</span>
          </div>
        </template>
        <template #statusId="{ row }">
          <ElTag :type="getStatusTagType(row.statusId)" size="small">
            {{ getStatusLabel(row.statusId) }}
          </ElTag>
        </template>
        <template #total="{ row }">
          <span class="font-semibold text-gray-800">{{
            formatCurrency(row.total || 0)
          }}</span>
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip
              v-if="canEditRow(row)"
              content="Xem / chỉnh sửa"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="primary"
                @click="handleEdit(row)"
                v-auth="Permissions.Order.SalesInvoiceManagement.Edit"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="canChangeStatusRow(row)"
              content="Đổi trạng thái"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="warning"
                @click="handleOpenStatusDialog(row)"
                v-auth="Permissions.Order.SalesInvoiceManagement.ChangeStatus"
              >
                <ElIcon><Switch /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="canDeleteRow(row)"
              content="Xóa phiếu"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="danger"
                @click="handleDelete(row)"
                v-auth="Permissions.Order.SalesInvoiceManagement.Delete"
              >
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="canCopyPaymentLink(row)"
              content="Copy link thanh toán"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="success"
                @click="handleCopyPaymentLink(row)"
                v-auth="Permissions.Order.SalesInvoiceManagement.Edit"
              >
                <ElIcon><Link /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="980px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm ref="formRef" :model="formData" label-width="auto" class="mt-3">
        <ElAlert
          v-if="lockedHint"
          :title="lockedHint"
          type="warning"
          show-icon
          :closable="false"
          class="mb-4"
        />

        <ElRow :gutter="20">
          <ElCol :span="24">
            <ElFormItem label="Khách hàng" required>
              <ElSelect
                v-model="formData.buyerId"
                filterable
                remote
                clearable
                :remote-method="searchCustomers"
                :loading="customerLoading"
                placeholder="Tìm theo tên, email hoặc số điện thoại"
                class="w-full"
                :disabled="isBuyerProductLocked"
                @change="handleCustomerChange"
              >
                <ElOption
                  v-for="item in customerOptions"
                  :key="item.id"
                  :label="getCustomerLabel(item)"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24" :md="12">
            <ElFormItem label="Người nhận" required>
              <ElInput
                v-model="formData.customerName"
                :disabled="isDeliveryInfoLocked"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24" :md="12">
            <ElFormItem label="Số điện thoại" required>
              <ElInput
                v-model="formData.customerPhone"
                :disabled="isDeliveryInfoLocked"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="Địa chỉ giao hàng" required>
              <ElInput
                v-model="formData.customerAddress"
                :disabled="isDeliveryInfoLocked"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24" :md="12">
            <ElFormItem label="Tỷ lệ đặt cọc">
              <ElInputNumber
                v-model="formData.depositRatio"
                :min="0"
                :max="100"
                :precision="0"
                class="w-full"
                :disabled="isDepositRatioLocked"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <div class="border-t border-gray-100 pt-4 mt-2">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700"
              >Sản phẩm bán ra</span
            >
            <ElButton
              type="success"
              size="small"
              plain
              @click="addProductRow"
              :disabled="isBuyerProductLocked"
            >
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm sản phẩm
            </ElButton>
          </div>

          <ElTable
            :data="formData.products"
            border
            size="small"
            class="w-full"
            max-height="320"
          >
            <ElTableColumn label="Sản phẩm" min-width="280">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.productVariantId"
                  filterable
                  remote
                  :remote-method="searchProducts"
                  :loading="productLoading"
                  placeholder="Tìm sản phẩm"
                  class="w-full"
                  :disabled="isBuyerProductLocked"
                  @change="(id: number) => handleProductChange(row as any, id)"
                >
                  <ElOption
                    v-for="item in productOptions"
                    :key="item.id"
                    :label="item.displayName"
                    :value="item.id"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <span class="truncate">{{ item.displayName }}</span>
                      <span class="text-xs text-gray-500">{{
                        formatCurrency(item.price || 0)
                      }}</span>
                    </div>
                  </ElOption>
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Màu" width="180">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.productVariantColorId"
                  clearable
                  placeholder="Không chọn"
                  class="w-full"
                  :disabled="
                    isBuyerProductLocked || !getProductColors(row).length
                  "
                >
                  <ElOption
                    v-for="color in getProductColors(row)"
                    :key="color.id"
                    :label="
                      color.colorName || color.colorCode || `Màu #${color.id}`
                    "
                    :value="color.id"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="SL" width="150" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.count"
                  :min="1"
                  :precision="0"
                  controls-position="right"
                  class="w-full"
                  :disabled="isBuyerProductLocked"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="150" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.price || 0) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="160" align="right">
              <template #default="{ row }">
                <span class="font-medium">{{
                  formatCurrency((row.count || 0) * (row.price || 0))
                }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="VIN đã gán" min-width="220">
              <template #default="{ row }">
                <div
                  v-if="row.assignedVehicles?.length"
                  class="flex flex-wrap gap-1"
                >
                  <ElTag
                    v-for="vehicle in row.assignedVehicles"
                    :key="vehicle.id"
                    size="small"
                    type="info"
                  >
                    {{ vehicle.vinNumber }}
                  </ElTag>
                </div>
                <span v-else class="text-xs text-gray-400">---</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thao tác" width="100" align="center">
              <template #default="{ $index }">
                <ElButton
                  circle
                  type="danger"
                  size="small"
                  plain
                  :disabled="isBuyerProductLocked"
                  @click="removeProductRow($index)"
                >
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <ElFormItem label="Ghi chú" class="mt-4">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="Ghi chú nội bộ hoặc yêu cầu giao hàng"
            :disabled="isNotesLocked"
          />
        </ElFormItem>

        <div class="bg-gray-50 rounded-lg p-4 flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span>Tạm tính</span>
            <span class="font-semibold">{{ formatCurrency(formTotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tiền đặt cọc</span>
            <span>{{ formatCurrency(depositAmount) }}</span>
          </div>
          <div
            class="flex justify-between text-base text-primary font-bold border-t border-gray-200 pt-2"
          >
            <span>Còn lại</span>
            <span>{{ formatCurrency(remainingAmount) }}</span>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="saving" @click="handleSubmit">
            {{ editingOrder ? "Lưu phiếu" : "Tạo phiếu" }}
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="statusDialogVisible"
      title="Đổi trạng thái phiếu bán"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <ElForm label-width="120px">
        <ElFormItem label="Trạng thái mới" required>
          <ElSelect
            v-model="targetStatusId"
            class="w-full"
            placeholder="Chọn trạng thái"
          >
            <ElOption
              v-for="status in statusChangeOptions"
              :key="status.id"
              :label="getStatusLabel(status.id)"
              :value="status.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="statusDialogVisible = false">Hủy</ElButton>
          <ElButton
            type="primary"
            :loading="statusSaving"
            @click="handlePrepareStatusChange"
          >
            Tiếp tục
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="vinDialogVisible"
      title="Chọn VIN xuất bán"
      width="860px"
      append-to-body
      destroy-on-close
    >
      <div v-if="vehicleRequirements" class="flex flex-col gap-4">
        <ElAlert
          v-if="vehicleRequirements.items.some((item) => !item.canFulfill)"
          title="Một số sản phẩm chưa đủ VIN hợp lệ trong kho, không thể đổi trạng thái."
          type="error"
          show-icon
          :closable="false"
        />
        <ElTable
          :data="vehicleRequirements.items"
          border
          size="small"
          class="w-full"
        >
          <ElTableColumn label="Sản phẩm" min-width="240">
            <template #default="{ row }">
              <div class="flex flex-col">
                <span class="font-medium">{{ row.productName || "---" }}</span>
                <span class="text-xs text-gray-500">
                  {{
                    [row.productVariantName, row.colorName]
                      .filter(Boolean)
                      .join(" - ") || "---"
                  }}
                </span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Cần chọn" width="100" align="center">
            <template #default="{ row }">{{ row.requiredCount }}</template>
          </ElTableColumn>
          <ElTableColumn label="VIN" min-width="320">
            <template #default="{ row }">
              <ElSelect
                v-model="selectedVehicleIdsByOutputInfo[row.outputInfoId]"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                class="w-full"
                :disabled="!row.canFulfill"
                :placeholder="`Chọn ${row.requiredCount} VIN`"
              >
                <ElOption
                  v-for="vehicle in getVehicleOptions(row as any)"
                  :key="vehicle.id"
                  :label="`${vehicle.vinNumber} - ${vehicle.engineNumber}`"
                  :value="vehicle.id"
                />
              </ElSelect>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="vinDialogVisible = false">Hủy</ElButton>
          <ElButton
            type="primary"
            :loading="statusSaving"
            @click="handleSubmitVinStatusChange"
          >
            Cập nhật trạng thái
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Delete, Edit, Plus, Switch, Link } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { SalesOrderApi } from "@/api/sales";
import { ProductApi } from "@/api/product";
import { fetchGetUserList } from "@/api/auth";
import { Permissions } from "@/domain/constants/permissions";
import type {
  SalesOrder,
  VehicleAssignmentOption,
  VehicleAssignmentRequirement,
} from "@/domain/order/order.types";
import type { ProductVariantLiteForInput } from "@/domain/product/product.types";
import type { ColumnOption } from "@/types/component";

type StatusOption = { id: string; name: string };
type CustomerOption = {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
};
type OrderFormProduct = {
  id?: number;
  productVariantId?: number;
  productVariantColorId?: number;
  productName?: string;
  count: number;
  price?: number;
  coverImageUrl?: string;
  assignedVehicles?: VehicleAssignmentOption[];
};

const loading = ref(false);
const saving = ref(false);
const orders = ref<SalesOrder[]>([]);
const statuses = ref<Record<string, string>>({});
const statusMap = ref<StatusOption[]>([]);
const transitionMap = ref<Record<string, string[]>>({});
const lockedStatuses = ref<any>({});
const customerOptions = ref<CustomerOption[]>([]);
const productOptions = ref<ProductVariantLiteForInput[]>([]);
const customerLoading = ref(false);
const productLoading = ref(false);
const dialogVisible = ref(false);
const editingOrder = ref<SalesOrder | null>(null);
const originalStatusId = ref<string>("");
const statusDialogVisible = ref(false);
const vinDialogVisible = ref(false);
const statusSaving = ref(false);
const statusOrder = ref<SalesOrder | null>(null);
const targetStatusId = ref("");
const vehicleRequirements = ref<VehicleAssignmentRequirement | null>(null);
const selectedVehicleIdsByOutputInfo = reactive<Record<number, number[]>>({});

const searchForm = reactive({
  search: "",
  statusId: "",
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

const formData = reactive({
  buyerId: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  statusId: "pending",
  depositRatio: 0,
  notes: "",
  products: [] as OrderFormProduct[],
});

const searchItems = computed(() => [
  {
    label: "Từ khóa",
    key: "search",
    type: "input",
    props: { clearable: true, placeholder: "Tên, email, SĐT hoặc ghi chú" },
  },
  {
    label: "Trạng thái",
    key: "statusId",
    type: "select",
    props: {
      clearable: true,
      placeholder: "Tất cả",
      options: statusMap.value.map((item) => ({
        label: getStatusLabel(item.id),
        value: item.id,
      })),
    },
  },
]);

const columnChecks = ref<ColumnOption[]>([
  {
    prop: "createdAt",
    label: "Thời gian",
    width: 170,
    checked: true,
    useSlot: true,
  },
  {
    prop: "customer",
    label: "Khách hàng",
    minWidth: 220,
    checked: true,
    useSlot: true,
  },
  { prop: "notes", label: "Ghi chú", minWidth: 220, checked: true },
  {
    prop: "statusId",
    label: "Trạng thái",
    width: 170,
    checked: true,
    useSlot: true,
  },
  {
    prop: "total",
    label: "Tổng tiền",
    width: 160,
    checked: true,
    useSlot: true,
  },
  {
    prop: "operation",
    label: "Thao tác",
    width: 150,
    fixed: "right" as const,
    checked: true,
    useSlot: true,
  },
]);

const columns = computed(() =>
  columnChecks.value.filter((item) => item.checked),
);
const dialogTitle = computed(() =>
  editingOrder.value ? "Sửa phiếu bán hàng" : "Tạo phiếu bán hàng",
);
const pendingCount = computed(
  () => orders.value.filter((item) => item.statusId === "pending").length,
);
const completedCount = computed(
  () => orders.value.filter((item) => item.statusId === "completed").length,
);
const pageRevenue = computed(() =>
  orders.value.reduce((sum, item) => sum + Number(item.total || 0), 0),
);
const formTotal = computed(() =>
  formData.products.reduce(
    (sum, item) => sum + Number(item.count || 0) * Number(item.price || 0),
    0,
  ),
);
const depositAmount = computed(() =>
  Math.round(formTotal.value * (Number(formData.depositRatio || 0) / 100)),
);
const remainingAmount = computed(() => formTotal.value - depositAmount.value);

const isBuyerProductLocked = computed(() =>
  getLockedList("buyerAndProducts").includes(originalStatusId.value),
);
const isDeliveryInfoLocked = computed(() =>
  getLockedList("deliveryInfo").includes(originalStatusId.value),
);
const isNotesLocked = computed(() =>
  getLockedList("notes").includes(originalStatusId.value),
);
const isDepositRatioLocked = computed(() =>
  getLockedList("depositRatio").includes(originalStatusId.value),
);
const lockedHint = computed(() => {
  if (!editingOrder.value) return "";
  if (
    !isBuyerProductLocked.value &&
    !isDeliveryInfoLocked.value &&
    !isNotesLocked.value
  )
    return "";
  return `Phiếu đang ở trạng thái ${getStatusLabel(originalStatusId.value)}, một số trường đã bị khóa theo backend.`;
});
const statusChangeOptions = computed(() => {
  const current = statusOrder.value?.statusId || "";
  const allowed = transitionMap.value[current] || [];
  return statusMap.value.filter((item) => allowed.includes(item.id));
});

const canCopyPaymentLink = (row: SalesOrder) => {
  const statusId = row.statusId || "";
  const paymentMethod = String(row.paymentMethod || "").toLowerCase();
  return (
    ["vnpay", "payos"].includes(paymentMethod) &&
    ["pending", "waiting_deposit"].includes(statusId)
  );
};

onMounted(async () => {
  await Promise.all([
    fetchStatuses(),
    fetchOrders(),
    searchCustomers(""),
    searchProducts(""),
  ]);
});

async function fetchStatuses() {
  const [statusRes, statusMapRes, transitionRes, lockedRes] = await Promise.all(
    [
      SalesOrderApi.getStatuses(),
      SalesOrderApi.getStatusMap(),
      SalesOrderApi.getTransitionMap(),
      SalesOrderApi.getLockedStatuses(),
    ],
  );
  statuses.value = statusRes || {};
  statusMap.value = statusMapRes || [];
  transitionMap.value = transitionRes || {};
  lockedStatuses.value = lockedRes || {};
}

async function fetchOrders() {
  loading.value = true;
  try {
    const filters: string[] = [];
    if (searchForm.statusId) filters.push(`StatusId==${searchForm.statusId}`);
    const res = await SalesOrderApi.getConfirmedList({
      current: pagination.current,
      size: pagination.size,
      Filters: filters.join("|") || undefined,
      Search: searchForm.search || undefined,
      Sorts: "-CreatedAt",
    });
    orders.value = res.items || [];
    pagination.total = res.totalCount || 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  fetchOrders();
}

function handleReset() {
  searchForm.search = "";
  searchForm.statusId = "";
  handleSearch();
}

function handleSizeChange(size: number) {
  pagination.size = size;
  fetchOrders();
}

function handleCurrentChange(current: number) {
  pagination.current = current;
  fetchOrders();
}

function handleAdd() {
  editingOrder.value = null;
  originalStatusId.value = "";
  resetForm();
  dialogVisible.value = true;
}

async function handleEdit(row: SalesOrder) {
  loading.value = true;
  try {
    const detail = await SalesOrderApi.getById(row.id);
    editingOrder.value = detail;
    originalStatusId.value = detail.statusId || "pending";
    fillForm(detail);
    dialogVisible.value = true;
  } finally {
    loading.value = false;
  }
}

async function handleDelete(row: SalesOrder) {
  await ElMessageBox.confirm(
    `Xóa phiếu bán của ${row.customerName || row.buyerName || "khách hàng này"}?`,
    "Xác nhận",
    { type: "warning" },
  );
  await SalesOrderApi.delete(row.id);
  ElMessage.success("Đã xóa phiếu bán");
  fetchOrders();
}

function canEditRow(row: SalesOrder) {
  const statusId = row.statusId || "";
  return !(
    getLockedList("buyerAndProducts").includes(statusId) &&
    getLockedList("deliveryInfo").includes(statusId) &&
    getLockedList("notes").includes(statusId)
  );
}

function canDeleteRow(row: SalesOrder) {
  return !["completed", "refunded", "cancelled"].includes(row.statusId || "");
}

function canChangeStatusRow(row: SalesOrder) {
  return (transitionMap.value[row.statusId || ""] || []).length > 0;
}

function handleOpenStatusDialog(row: SalesOrder) {
  statusOrder.value = row;
  targetStatusId.value = "";
  vehicleRequirements.value = null;
  statusDialogVisible.value = true;
}

async function handlePrepareStatusChange() {
  if (!statusOrder.value || !targetStatusId.value) {
    return ElMessage.warning("Vui lòng chọn trạng thái mới");
  }
  statusSaving.value = true;
  try {
    const requirements = await SalesOrderApi.getVehicleAssignmentRequirements(
      statusOrder.value.id,
      targetStatusId.value,
    );
    if (requirements.requiresVehicleAssignment) {
      vehicleRequirements.value = requirements;

      Object.keys(selectedVehicleIdsByOutputInfo).forEach((key) => {
        delete selectedVehicleIdsByOutputInfo[Number(key)];
      });

      requirements.items.forEach((item: any) => {
        selectedVehicleIdsByOutputInfo[item.outputInfoId] =
          item.assignedVehicles?.map((v: any) => v.id) || [];
      });
    } else {
      await SalesOrderApi.updateStatus(
        statusOrder.value.id,
        targetStatusId.value,
        [],
      );
      statusDialogVisible.value = false;
      ElMessage.success("Đã cập nhật trạng thái");
      fetchOrders();
    }
  } catch (error: any) {
    console.error(error);
    const msg =
      error.response?.data?.errors?.[0]?.message ||
      "Lỗi hệ thống khi đổi trạng thái";
    ElMessage.error(msg);
  } finally {
    statusSaving.value = false;
  }
}

async function handleCopyPaymentLink(row: SalesOrder) {
  try {
    const res = await SalesOrderApi.getPaymentLink(row.id);
    const url = res.url;
    if (!url) {
      return ElMessage.warning("Đơn hàng này chưa có link thanh toán");
    }
    try {
      await navigator.clipboard.writeText(url);
      ElMessage.success("Đã copy link thanh toán vào clipboard");
    } catch {
      ElMessage.info(`Link: ${url}`);
    }
  } catch {
    ElMessage.error("Không thể lấy link thanh toán");
  }
}

function getVehicleOptions(item: any) {
  const map = new Map<number, VehicleAssignmentOption>();
  for (const vehicle of [...item.assignedVehicles, ...item.availableVehicles]) {
    map.set(vehicle.id, vehicle);
  }
  return Array.from(map.values());
}

async function handleSubmitVinStatusChange() {
  if (!statusOrder.value || !targetStatusId.value || !vehicleRequirements.value)
    return;
  if (vehicleRequirements.value.items.some((item) => !item.canFulfill)) {
    return ElMessage.error("Không đủ VIN hợp lệ để cập nhật trạng thái");
  }
  const invalidItem = vehicleRequirements.value.items.find(
    (item) =>
      (selectedVehicleIdsByOutputInfo[item.outputInfoId] || []).length !==
      item.requiredCount,
  );
  if (invalidItem) {
    return ElMessage.warning(
      `Vui lòng chọn đủ ${invalidItem.requiredCount} VIN cho ${invalidItem.productName}`,
    );
  }
  const selectedIds = vehicleRequirements.value.items.flatMap(
    (item) => selectedVehicleIdsByOutputInfo[item.outputInfoId] || [],
  );
  statusSaving.value = true;
  try {
    await SalesOrderApi.updateStatus(
      statusOrder.value.id,
      targetStatusId.value,
      selectedIds,
    );
    ElMessage.success("Đã cập nhật trạng thái");
    vinDialogVisible.value = false;
    fetchOrders();
  } finally {
    statusSaving.value = false;
  }
}

async function handleSubmit() {
  if (!formData.buyerId) return ElMessage.warning("Vui lòng chọn khách hàng");
  if (
    !formData.customerName ||
    !formData.customerPhone ||
    !formData.customerAddress
  ) {
    return ElMessage.warning("Vui lòng nhập đủ thông tin giao hàng");
  }
  if (!formData.products.length)
    return ElMessage.warning("Phiếu bán phải có ít nhất một sản phẩm");
  if (formData.products.some((item) => !item.productVariantId || !item.count)) {
    return ElMessage.warning("Vui lòng chọn sản phẩm và số lượng hợp lệ");
  }

  const payload = {
    buyerId: formData.buyerId,
    customerName: formData.customerName,
    customerPhone: formData.customerPhone,
    customerAddress: formData.customerAddress,
    notes: formData.notes,
    statusId: formData.statusId,
    depositRatio: formData.depositRatio,
    products: formData.products.map((item) => ({
      id: editingOrder.value ? item.id : undefined,
      productVariantId: item.productVariantId!,
      productVariantColorId: item.productVariantColorId || undefined,
      count: item.count,
    })),
  };

  saving.value = true;
  try {
    if (editingOrder.value) {
      await SalesOrderApi.updateForManager(editingOrder.value.id, payload);
      ElMessage.success("Đã cập nhật phiếu bán");
    } else {
      await SalesOrderApi.createByManager(payload);
      ElMessage.success("Đã tạo phiếu bán");
    }
    dialogVisible.value = false;
    fetchOrders();
  } finally {
    saving.value = false;
  }
}

async function searchCustomers(keyword: string) {
  customerLoading.value = true;
  try {
    const res: any = await fetchGetUserList({
      Page: 1,
      PageSize: 20,
      Filters: keyword ? undefined : undefined,
      Sorts: "FullName",
    } as any);
    const items = (res.items ||
      res.records ||
      res.data ||
      []) as CustomerOption[];
    customerOptions.value = keyword
      ? items.filter((item) =>
          getCustomerLabel(item).toLowerCase().includes(keyword.toLowerCase()),
        )
      : items;
  } finally {
    customerLoading.value = false;
  }
}

async function searchProducts(keyword: string) {
  productLoading.value = true;
  try {
    const res = await ProductApi.getVariantsForOutput({
      current: 1,
      size: 20,
      Filters: keyword ? `search@=${keyword}` : undefined,
    });
    productOptions.value = res.items || [];
  } finally {
    productLoading.value = false;
  }
}

function handleCustomerChange(id: string) {
  const customer = customerOptions.value.find((item) => item.id === id);
  if (!customer) return;
  formData.customerName =
    customer.fullName || customer.name || formData.customerName;
  formData.customerPhone = customer.phoneNumber || formData.customerPhone;
  formData.customerAddress = customer.address || formData.customerAddress;
}

function handleProductChange(row: any, id: number) {
  const product = productOptions.value.find((item) => item.id === id);
  if (!product) return;
  row.productName = product.displayName;
  row.price = product.price || 0;
  row.coverImageUrl = product.coverImageUrl;
  row.productVariantColorId = undefined;
}

function addProductRow() {
  formData.products.push({ productVariantId: undefined, count: 1, price: 0 });
}

function removeProductRow(index: number) {
  formData.products.splice(index, 1);
}

function resetForm() {
  formData.buyerId = "";
  formData.customerName = "";
  formData.customerPhone = "";
  formData.customerAddress = "";
  formData.statusId = "pending";
  formData.depositRatio = 0;
  formData.notes = "";
  formData.products = [];
}

function fillForm(order: SalesOrder) {
  const products = order.products || [];
  formData.buyerId = order.buyerId || "";
  formData.customerName = order.customerName || order.buyerName || "";
  formData.customerPhone = order.customerPhone || order.buyerPhone || "";
  formData.customerAddress = order.customerAddress || "";
  formData.statusId = order.statusId || "pending";
  formData.depositRatio = order.depositRatio || 0;
  formData.notes = order.notes || "";
  formData.products = products.map((item) => ({
    id: item.id,
    productVariantId: item.productVariantId,
    productVariantColorId: item.productVariantColorId,
    productName: item.productName,
    count: item.count || 1,
    price: item.price || 0,
    coverImageUrl: item.coverImageUrl,
    assignedVehicles: item.assignedVehicles || [],
  }));
  if (
    order.buyerId &&
    !customerOptions.value.some((item) => item.id === order.buyerId)
  ) {
    customerOptions.value.push({
      id: order.buyerId,
      fullName: order.buyerName,
      email: order.buyerEmail,
      phoneNumber: order.buyerPhone,
    });
  }
  for (const product of formData.products) {
    if (
      product.productVariantId &&
      !productOptions.value.some((item) => item.id === product.productVariantId)
    ) {
      productOptions.value.push({
        id: product.productVariantId,
        productId: product.productVariantId,
        displayName:
          product.productName || `Sản phẩm #${product.productVariantId}`,
        coverImageUrl: product.coverImageUrl || "",
        price: product.price || 0,
        categoryId: 0,
        colors: [],
      });
    }
  }
}

function getLockedList(key: string): string[] {
  const data = lockedStatuses.value || {};
  return Array.isArray(data) ? [] : data[key] || [];
}

function getStatusLabel(statusId?: string) {
  if (!statusId) return "---";
  return (
    statuses.value[statusId] ||
    statusMap.value.find((item) => item.id === statusId)?.name ||
    statusId
  );
}

function getStatusTagType(statusId?: string) {
  const map: Record<
    string,
    "success" | "warning" | "info" | "danger" | "primary"
  > = {
    pending: "info",
    waiting_deposit: "warning",
    waiting_installment: "warning",
    confirmed_cod: "warning",
    paid_processing: "primary",
    deposit_paid: "primary",
    installment_approved: "primary",
    delivering: "primary",
    waiting_pickup: "success",
    completed: "success",
    refunding: "warning",
    refunded: "info",
    cancelled: "danger",
  };
  return map[statusId || ""] || "info";
}

function getCustomerLabel(customer: CustomerOption) {
  return [
    customer.fullName || customer.name || customer.email || customer.id,
    customer.phoneNumber,
  ]
    .filter(Boolean)
    .join(" - ");
}

function formatCurrency(val?: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
}

function getProductColors(row: any) {
  return (
    productOptions.value.find((item) => item.id === row.productVariantId)
      ?.colors || []
  );
}

function formatDateTime(value?: string) {
  if (!value) return "---";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "---";

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
</script>
