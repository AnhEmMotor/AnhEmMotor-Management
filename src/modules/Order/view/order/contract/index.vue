<template>
  <div class="resp-page contract-sales-container">
    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Bản nháp</div>
            <div class="text-2xl font-bold text-orange-500">
              {{ statistics.draftCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">
              Đang hoàn thiện nội dung
            </div>
          </div>
          <el-icon class="text-4xl text-orange-200"><Document /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Chờ Admin duyệt</div>
            <div class="text-2xl font-bold text-amber-500">
              {{ statistics.pendingApprovalCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">
              Đã gửi, tạm khóa chỉnh sửa
            </div>
          </div>
          <el-icon class="text-4xl text-amber-200"><Timer /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Trễ hạn bàn giao</div>
            <div class="text-2xl font-bold text-red-500">
              {{ statistics.overdueCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Cảnh báo nhắc Sale</div>
          </div>
          <el-icon class="text-4xl text-red-200"><Warning /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Đã ký</div>
            <div class="text-2xl font-bold text-blue-500">
              {{ statistics.signedCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Chờ bàn giao xe</div>
          </div>
          <el-icon class="text-4xl text-blue-200"><Money /></el-icon>
        </div>
      </el-card>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="font-bold text-lg">Hợp đồng mua bán xe</span>
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleOpenAddDialog"
            v-auth="Permissions.Order.ContractManagement.Create"
          >
            Thêm hợp đồng
          </el-button>
        </div>
      </template>
      <div>
        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4 items-center">
          <el-input
            v-model="searchQuery"
            placeholder="Số hợp đồng, Tên KH, Số CCCD, Số khung/máy"
            clearable
            :prefix-icon="Search"
            class="w-full"
            @input="debouncedSearch"
          />
          <el-select
            v-model="statusFilter"
            placeholder="Trạng thái"
            clearable
            class="w-full"
            @change="fetchData"
          >
            <el-option label="Nháp" value="Draft" />
            <el-option label="Chờ Admin duyệt" value="PendingApproval" />
            <el-option label="Đã duyệt" value="Approved" />
            <el-option label="Đã ký" value="Signed" />
            <el-option label="Hoàn tất" value="Fulfilled" />
          </el-select>
          <el-input
            v-model="vehicleFilter"
            placeholder="Dòng xe"
            clearable
            class="w-full"
            @keyup.enter="fetchData"
          />
          <el-button
            type="primary"
            :icon="Search"
            class="w-full md:w-auto"
            @click="fetchData"
            >Tìm kiếm</el-button
          >
        </div>

        <el-table
          :data="tableData"
          border
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column
            prop="contractNumber"
            label="Số Hợp Đồng"
            width="160"
          />
          <el-table-column label="Mã Đơn Hàng" width="140">
            <template #default="scope">
              <el-button
                link
                type="primary"
                class="font-semibold"
                v-auth="Permissions.Order.ContractManagement.Edit"
              >
                {{ scope.row.orderId }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="customerName"
            label="Khách Hàng"
            min-width="160"
          />
          <el-table-column
            prop="vehicle"
            label="Xe Giao Dịch"
            min-width="180"
          />

          <el-table-column label="Hạn Bàn Giao" width="130">
            <template #default="scope">
              <div class="flex flex-col items-start">
                <span
                  :class="{
                    'text-red-500 font-bold': isOverdue(
                      scope.row.deliveryDeadline,
                    ),
                  }"
                >
                  {{ formatDate(scope.row.deliveryDeadline) }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="status"
            label="Trạng Thái HĐ"
            width="130"
            align="center"
          >
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" effect="dark">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="Thao Tác"
            width="150"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                type="primary"
                link
                :icon="View"
                @click="goToPreview(scope.row.id)"
                v-auth="Permissions.Order.ContractManagement.View"
              >
                Mở hợp đồng
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-4 flex justify-end">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @current-change="fetchData"
            @size-change="fetchData"
          />
        </div>
      </div>
    </el-card>

    <!-- Create Contract Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="Thêm hợp đồng"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
      >
        <el-form-item label="Chọn đơn hàng" prop="orderId">
          <el-select
            v-model="form.orderId"
            filterable
            remote
            reserve-keyword
            placeholder="Nhập tên KH, SĐT hoặc mã đơn hàng..."
            :remote-method="searchOrders"
            :loading="orderSearchLoading"
            class="w-full"
            clearable
          >
            <el-option
              v-for="item in orderOptions"
              :key="item.id"
              :label="`${item.customerName} - ${item.customerPhone} (Đơn hàng #${item.id})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <div v-if="selectedOrder" class="order-link-summary">
          <div class="order-link-summary__heading">
            <span>Đơn hàng đã xác nhận #{{ selectedOrder.id }}</span>
            <el-tag type="success" effect="plain" size="small">
              Đủ điều kiện lập hợp đồng
            </el-tag>
          </div>
          <div class="order-link-summary__grid">
            <div>
              <span>Khách hàng</span>
              <strong>{{
                selectedOrder.customerName || "Chưa cập nhật"
              }}</strong>
            </div>
            <div>
              <span>Số điện thoại</span>
              <strong>{{
                selectedOrder.customerPhone || "Chưa cập nhật"
              }}</strong>
            </div>
            <div>
              <span>Giá trị đơn</span>
              <strong>{{ formatCurrency(selectedOrder.total || 0) }}</strong>
            </div>
            <div>
              <span>Trạng thái đơn</span>
              <strong>{{ getOrderStatusLabel(selectedOrder.statusId) }}</strong>
            </div>
          </div>
        </div>

        <el-form-item label="Điều khoản đặc biệt">
          <el-input
            v-model="form.specialTerms"
            type="textarea"
            :rows="3"
            placeholder="Nhập các điều khoản đặc biệt nếu có..."
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Thời gian bảo hành">
              <el-input
                v-model="form.warrantyPeriod"
                placeholder="VD: 3 năm hoặc 30.000km"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Phạm vi bảo hành">
              <el-input
                v-model="form.warrantyScope"
                placeholder="VD: Toàn quốc"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Ghi chú nội bộ">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú riêng nội bộ..."
          />
        </el-form-item>

        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="Hợp đồng sẽ được tạo ở trạng thái Nháp."
          description="Hoàn thiện nội dung tại trang chi tiết, sau đó gửi Admin duyệt. Chỉ hợp đồng đã duyệt mới được in để ký và tải bản quét."
        />
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button
            @click="dialogVisible = false"
            v-auth="Permissions.Order.ContractManagement.View"
            >Hủy</el-button
          >
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
            v-auth="Permissions.Order.ContractManagement.Edit"
          >
            Xác nhận
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { computed, ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  View,
  Search,
  Document,
  Warning,
  Money,
  Plus,
  Timer,
} from "@element-plus/icons-vue";

import { ElMessage } from "element-plus";
import { SalesContractApi, SalesOrderApi } from "@/api/sales";
import type { SalesOrder } from "@/domain/order/order.types";
import type {
  SalesContractListDto,
  SalesContractStatus,
} from "@/domain/sales/contract.types";

const router = useRouter();

const loading = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const vehicleFilter = ref("");

interface SalesContractListRow {
  id: string;
  contractNumber: string;
  orderId: number;
  status: SalesContractStatus;
  customerName: string;
  vehicle: string;
  deliveryDeadline?: string;
}

const tableData = ref<SalesContractListRow[]>([]);
const statistics = reactive({
  draftCount: 0,
  pendingApprovalCount: 0,
  overdueCount: 0,
  signedCount: 0,
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.current = 1;
    fetchData();
  }, 400);
};

const formatVehicleTransaction = (contract: SalesContractListDto): string => {
  const details = [
    contract.vehicleModel,
    contract.vehicleVersion,
    contract.vehicleColor,
  ].filter((value): value is string => Boolean(value?.trim()));
  return details.join(" • ") || "Chưa có thông tin xe";
};

const mapSalesContractRow = (
  contract: SalesContractListDto,
): SalesContractListRow => ({
  id: contract.id,
  contractNumber: contract.contractNumber,
  orderId: contract.orderId,
  status: contract.status,
  customerName: contract.customerFullName?.trim() || "Chưa có khách hàng",
  vehicle: formatVehicleTransaction(contract),
  deliveryDeadline: contract.finalPaymentDeadline,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params: {
      current: number;
      size: number;
      keyword?: string;
      status?: string;
      vehicleModel?: string;
    } = {
      current: pagination.current,
      size: pagination.size,
    };
    if (searchQuery.value) params.keyword = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;
    if (vehicleFilter.value) params.vehicleModel = vehicleFilter.value;

    const res = await SalesContractApi.getList(params);
    tableData.value = res.items.map(mapSalesContractRow);
    pagination.total = res.totalCount || 0;
  } catch (_e) {
    ElMessage.error("Không tải được danh sách hợp đồng.");
  } finally {
    loading.value = false;
  }
};

const loadStatistics = async () => {
  try {
    const stats = await SalesContractApi.getStatistics();
    statistics.draftCount = stats.draftCount;
    statistics.pendingApprovalCount = stats.pendingApprovalCount;
    statistics.overdueCount = stats.overdueCount;
    statistics.signedCount = stats.signedCount;
  } catch (_e) {
    // silent fail for stats
  }
};

onMounted(() => {
  fetchData();
  loadStatistics();
});

const getStatusType = (status: string) => {
  switch (status) {
    case "Draft":
      return "info";
    case "PendingApproval":
      return "warning";
    case "Approved":
      return "success";
    case "Signed":
      return "primary";
    case "Fulfilled":
      return "success";
    default:
      return "info";
  }
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    Draft: "Nháp",
    PendingApproval: "Chờ Admin duyệt",
    Approved: "Đã duyệt",
    Signed: "Đã ký",
    Fulfilled: "Hoàn tất",
  };
  return map[status] || status;
};

const isOverdue = (dateStr?: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Chưa xác định";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const dialogVisible = ref(false);
const orderSearchLoading = ref(false);
const submitLoading = ref(false);
const orderOptions = ref<SalesOrder[]>([]);
const formRef = ref();

const form = reactive({
  orderId: null as number | null,
  specialTerms: "",
  warrantyPeriod: "3 năm hoặc 30.000km",
  warrantyScope: "Toàn quốc",
  note: "",
});

const formRules = reactive({
  orderId: [
    { required: true, message: "Vui lòng chọn đơn hàng", trigger: "change" },
  ],
});

const selectedOrder = computed(
  () => orderOptions.value.find((order) => order.id === form.orderId) ?? null,
);

const ineligibleOrderStatuses = new Set(["cancelled", "refunding", "refunded"]);

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    confirmed_cod: "Đã xác nhận COD",
    paid_processing: "Đang xử lý thanh toán",
    deposit_paid: "Đã đặt cọc",
    installment_approved: "Đã duyệt trả góp",
    delivering: "Đang giao hàng",
    waiting_pickup: "Chờ nhận xe",
    completed: "Đã hoàn thành",
  };
  return labels[status] || status;
};

const handleOpenAddDialog = () => {
  form.orderId = null;
  form.specialTerms = "";
  form.warrantyPeriod = "3 năm hoặc 30.000km";
  form.warrantyScope = "Toàn quốc";
  form.note = "";
  if (formRef.value) {
    formRef.value.resetFields();
  }
  dialogVisible.value = true;
  searchOrders("");
};

const searchOrders = async (query: string) => {
  orderSearchLoading.value = true;
  try {
    const res = await SalesOrderApi.getConfirmedList({
      current: 1,
      size: 50,
      Search: query || undefined,
      Sorts: "-CreatedAt",
    });
    orderOptions.value = (res.items || []).filter(
      (order) => !ineligibleOrderStatuses.has(order.statusId),
    );
  } catch (_e) {
    ElMessage.error("Không tải được danh sách đơn hàng.");
  } finally {
    orderSearchLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const res = await SalesContractApi.create({
        orderId: form.orderId!,
        specialTerms: form.specialTerms || undefined,
        warrantyPeriod: form.warrantyPeriod || undefined,
        warrantyScope: form.warrantyScope || undefined,
        note: form.note || undefined,
      });

      const createdContractId = res?.id;
      ElMessage.success("Thêm hợp đồng thành công.");
      dialogVisible.value = false;
      if (createdContractId) {
        goToPreview(createdContractId);
      } else {
        await Promise.all([fetchData(), loadStatistics()]);
      }
    } catch (_e) {
      ElMessage.error("Không thể tạo hợp đồng mới.");
    } finally {
      submitLoading.value = false;
    }
  });
};

const goToPreview = (id?: string) => {
  router.push({ name: "SalesContractPreview", params: { id: id || "" } });
};
</script>

<style scoped lang="scss">
.contract-sales-container {
  padding: 16px;
}

.kpi-card {
  border-radius: 8px;
}

.order-link-summary {
  padding: 14px;
  margin: -2px 0 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
}

.order-link-summary__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 700;
}

.order-link-summary__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  span {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  strong {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (width <= 640px) {
  .contract-sales-container {
    padding: 8px;
  }

  .order-link-summary__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-link-summary__grid {
    grid-template-columns: 1fr;
  }
}
</style>
