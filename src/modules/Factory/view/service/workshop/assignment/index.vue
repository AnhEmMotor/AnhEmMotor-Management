<template>
  <div class="workshop-assignment-page">
    <div class="workshop-assignment-page__header">
      <div>
        <h1>Phân công nhân viên</h1>
        <p>Điều phối phiếu sửa chữa cho kỹ thuật viên xưởng.</p>
      </div>

      <ElButton
        type="primary"
        :icon="Refresh"
        :loading="loading"
        @click="refreshData"
      >
        Làm mới
      </ElButton>
    </div>

    <div class="workshop-assignment-page__stats">
      <ArtStatsCard
        title="Chờ phân công"
        :count="unassignedOrders.length"
        description="Phiếu chưa có kỹ thuật viên"
        icon="ri:user-add-line"
        :icon-style="unassignedOrders.length ? 'bg-danger' : 'bg-success'"
        :loading="loading"
      />
      <ArtStatsCard
        title="Đang xử lý"
        :count="activeOrderCount"
        description="Phiếu còn trong luồng xưởng"
        icon="ri:tools-line"
        icon-style="bg-primary"
        :loading="loading"
      />
      <ArtStatsCard
        title="Kỹ thuật viên"
        :count="technicians.length"
        description="Nhân sự khả dụng"
        icon="ri:team-line"
        icon-style="bg-info"
        :loading="loading"
      />
      <ArtStatsCard
        title="Giá trị đang giữ"
        :count="formatCurrency(activeOrderValue)"
        description="Tổng giá trị phiếu chưa hoàn tất"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-warning"
        :loading="loading"
      />
    </div>

    <ElAlert
      v-if="errorMessage"
      type="error"
      show-icon
      :closable="false"
      :title="errorMessage"
    />

    <ElCard class="workshop-assignment-card">
      <div class="workshop-assignment-page__filters">
        <ElInput
          v-model="searchKeyword"
          clearable
          placeholder="Tìm biển số, khách hàng, số điện thoại"
          class="workshop-assignment-page__search"
        />
        <ElRadioGroup v-model="statusFilter">
          <ElRadioButton
            v-for="status in statusOptions"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </ElRadioButton>
        </ElRadioGroup>
      </div>
    </ElCard>

    <div class="workshop-assignment-page__workspace">
      <ElCard class="workshop-assignment-card workshop-assignment-queue">
        <template #header>
          <div class="workshop-assignment-card__header">
            <span>Phiếu cần phân công</span>
            <ElTag type="danger" effect="light" round>
              {{ filteredUnassignedOrders.length }}
            </ElTag>
          </div>
        </template>

        <ElSkeleton v-if="loading" :rows="7" animated />
        <div
          v-else-if="filteredUnassignedOrders.length"
          class="workshop-assignment-queue__list"
        >
          <button
            v-for="order in filteredUnassignedOrders"
            :key="order.id"
            type="button"
            :class="[
              'workshop-assignment-order',
              { 'is-active': selectedOrderId === order.id },
            ]"
            @click="selectOrder(order)"
          >
            <div class="workshop-assignment-order__main">
              <strong>{{ order.licensePlate || `#${order.id}` }}</strong>
              <ElTag :type="statusTagType(order.status)" effect="light" round>
                {{ statusLabel(order.status) }}
              </ElTag>
            </div>
            <div class="workshop-assignment-order__meta">
              <span>{{ order.customerName || "Chưa có khách hàng" }}</span>
              <span>{{ order.customerPhone || "-" }}</span>
            </div>
            <div class="workshop-assignment-order__foot">
              <span>{{ formatDateTime(order.createdAt) }}</span>
              <strong>{{ formatCurrency(order.totalAmount || 0) }}</strong>
            </div>
          </button>
        </div>
        <ElEmpty v-else description="Chưa có phiếu cần phân công" />
      </ElCard>

      <ElCard class="workshop-assignment-card workshop-assignment-workload">
        <template #header>
          <div class="workshop-assignment-card__header">
            <span>Tải việc kỹ thuật viên</span>
            <ElTag type="info" effect="light" round>
              {{ technicianWorkloads.length }}
            </ElTag>
          </div>
        </template>

        <ElTable
          v-loading="loading"
          :data="technicianWorkloads"
          class="workshop-assignment-table"
          empty-text="Chưa có nhân viên"
        >
          <ElTableColumn label="Kỹ thuật viên" min-width="190">
            <template #default="{ row }">
              <div class="workshop-assignment-technician">
                <div class="workshop-assignment-technician__avatar">
                  {{ row.fullName.charAt(0) }}
                </div>
                <div>
                  <strong>{{ row.fullName }}</strong>
                  <span>{{ row.jobTitle || "Kỹ thuật viên" }}</span>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="activeCount" label="Đang giữ" width="110" />
          <ElTableColumn prop="inProgressCount" label="Đang sửa" width="110" />
          <ElTableColumn label="Giá trị" min-width="140" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.estimatedValue) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Chọn" width="90" align="center">
            <template #default="{ row }">
              <ElButton
                type="primary"
                link
                :disabled="!selectedOrder"
                @click="selectedTechnicianId = row.id"
              >
                Chọn
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>

      <ElCard class="workshop-assignment-card workshop-assignment-detail">
        <template #header>
          <div class="workshop-assignment-card__header">
            <span>Phân công phiếu</span>
            <ElTag v-if="selectedOrder" type="primary" effect="light" round>
              #{{ selectedOrder.id }}
            </ElTag>
          </div>
        </template>

        <ElEmpty
          v-if="!selectedOrder"
          description="Chọn phiếu cần phân công"
          :image-size="92"
        />
        <div v-else class="workshop-assignment-detail__body">
          <div class="workshop-assignment-detail__summary">
            <div>
              <span>Biển số</span>
              <strong>{{ selectedOrder.licensePlate || "-" }}</strong>
            </div>
            <div>
              <span>Khách hàng</span>
              <strong>{{ selectedOrder.customerName || "-" }}</strong>
            </div>
            <div>
              <span>Mô tả</span>
              <strong>{{ selectedOrder.description || "-" }}</strong>
            </div>
            <div>
              <span>Thành tiền</span>
              <strong>{{
                formatCurrency(selectedOrder.totalAmount || 0)
              }}</strong>
            </div>
          </div>

          <ElForm label-position="top" class="workshop-assignment-form">
            <ElFormItem label="Kỹ thuật viên phụ trách">
              <ElSelect
                v-model="selectedTechnicianId"
                filterable
                clearable
                placeholder="Chọn kỹ thuật viên"
                class="w-full"
              >
                <ElOption
                  v-for="technician in technicians"
                  :key="technician.id"
                  :label="technician.fullName"
                  :value="technician.id"
                >
                  <span>{{ technician.fullName }}</span>
                  <small>{{ technician.jobTitle || "Kỹ thuật viên" }}</small>
                </ElOption>
              </ElSelect>
            </ElFormItem>

            <div v-if="selectedTechnician" class="workshop-assignment-selected">
              <span>Đang chọn</span>
              <strong>{{ selectedTechnician.fullName }}</strong>
              <small>{{
                selectedTechnician.jobTitle || "Kỹ thuật viên"
              }}</small>
            </div>

            <ElButton
              type="primary"
              :loading="submitting"
              :disabled="!selectedTechnicianId"
              class="w-full"
              @click="submitAssignment"
            >
              Phân công
            </ElButton>
          </ElForm>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import { EmployeeApi, type EmployeeResponse } from "@/api/operations";
import { RepairOrderApi, type RepairOrder } from "@/api/sales";

defineOptions({ name: "WorkshopAssignment" });

type RepairOrderStatus = RepairOrder["status"];
type StatusFilter = "all" | RepairOrderStatus;

interface TechnicianWorkload {
  id: number;
  fullName: string;
  jobTitle: string;
  activeCount: number;
  pendingCount: number;
  inProgressCount: number;
  qcPendingCount: number;
  estimatedValue: number;
}

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ nhận", value: "Pending" },
  { label: "Đang sửa", value: "InProgress" },
  { label: "Chờ QC", value: "QcPending" },
];

const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const repairOrders = ref<RepairOrder[]>([]);
const employees = ref<EmployeeResponse[]>([]);
const selectedOrderId = ref<number | null>(null);
const selectedTechnicianId = ref<number | null>(null);
const searchKeyword = ref("");
const statusFilter = ref<StatusFilter>("all");

const activeOrders = computed(() =>
  repairOrders.value.filter(
    (order) => order.status !== "Completed" && order.status !== "Cancelled",
  ),
);

const activeOrderCount = computed(() => activeOrders.value.length);

const activeOrderValue = computed(() =>
  activeOrders.value.reduce(
    (total, order) => total + (order.totalAmount || 0),
    0,
  ),
);

const technicians = computed(() => {
  const workshopEmployees = employees.value.filter(isWorkshopTechnician);
  return workshopEmployees.length ? workshopEmployees : employees.value;
});

const unassignedOrders = computed(() =>
  activeOrders.value.filter((order) => !order.technicianId),
);

const filteredUnassignedOrders = computed(() => {
  const keyword = normalizeText(searchKeyword.value);

  return unassignedOrders.value.filter((order) => {
    const matchesStatus =
      statusFilter.value === "all" || order.status === statusFilter.value;
    const searchable = normalizeText(
      [
        order.licensePlate,
        order.customerName,
        order.customerPhone,
        order.description,
        `#${order.id}`,
      ]
        .filter(Boolean)
        .join(" "),
    );

    return matchesStatus && (!keyword || searchable.includes(keyword));
  });
});

const selectedOrder = computed(() =>
  selectedOrderId.value
    ? (activeOrders.value.find((order) => order.id === selectedOrderId.value) ??
      null)
    : null,
);

const selectedTechnician = computed(() =>
  selectedTechnicianId.value
    ? (technicians.value.find(
        (technician) => technician.id === selectedTechnicianId.value,
      ) ?? null)
    : null,
);

const technicianWorkloads = computed<TechnicianWorkload[]>(() =>
  technicians.value
    .map((technician) => {
      const assignedOrders = activeOrders.value.filter(
        (order) => order.technicianId === technician.id,
      );

      return {
        id: technician.id,
        fullName: technician.fullName,
        jobTitle: technician.jobTitle,
        activeCount: assignedOrders.length,
        pendingCount: countByStatus(assignedOrders, "Pending"),
        inProgressCount: countByStatus(assignedOrders, "InProgress"),
        qcPendingCount: countByStatus(assignedOrders, "QcPending"),
        estimatedValue: assignedOrders.reduce(
          (total, order) => total + (order.totalAmount || 0),
          0,
        ),
      };
    })
    .sort((first, second) => first.activeCount - second.activeCount),
);

async function refreshData() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [orderResult, employeeResult] = await Promise.all([
      RepairOrderApi.getList({ current: 1, size: 200 }),
      EmployeeApi.getList(),
    ]);

    repairOrders.value = orderResult.items || [];
    employees.value = employeeResult || [];
    selectDefaultOrder();
  } catch (error) {
    repairOrders.value = [];
    employees.value = [];
    errorMessage.value = getErrorMessage(
      error,
      "Không thể tải dữ liệu phân công xưởng",
    );
    ElMessage.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
}

function selectOrder(order: RepairOrder) {
  selectedOrderId.value = order.id;
  selectedTechnicianId.value = order.technicianId || null;
}

function selectDefaultOrder() {
  const stillSelected = selectedOrderId.value
    ? activeOrders.value.some((order) => order.id === selectedOrderId.value)
    : false;

  if (!stillSelected) {
    const nextOrder =
      unassignedOrders.value[0] ?? activeOrders.value[0] ?? null;
    selectedOrderId.value = nextOrder?.id ?? null;
    selectedTechnicianId.value = nextOrder?.technicianId ?? null;
  }
}

async function submitAssignment() {
  if (!selectedOrder.value) {
    ElMessage.warning("Vui lòng chọn phiếu sửa chữa");
    return;
  }

  if (!selectedTechnicianId.value) {
    ElMessage.warning("Vui lòng chọn kỹ thuật viên");
    return;
  }

  submitting.value = true;
  try {
    await RepairOrderApi.assignTechnician({
      repairOrderId: selectedOrder.value.id,
      technicianId: selectedTechnicianId.value,
    });
    ElMessage.success("Phân công kỹ thuật viên thành công");
    await refreshData();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "Phân công thất bại"));
  } finally {
    submitting.value = false;
  }
}

function isWorkshopTechnician(employee: EmployeeResponse) {
  const text = normalizeText(`${employee.jobTitle} ${employee.fullName}`);
  return [
    "ky thuat",
    "xuong",
    "sua chua",
    "bao tri",
    "technician",
    "mechanic",
  ].some((keyword) => text.includes(keyword));
}

function countByStatus(orders: RepairOrder[], status: RepairOrderStatus) {
  return orders.filter((order) => order.status === status).length;
}

function statusLabel(status: RepairOrderStatus) {
  const labels: Record<RepairOrderStatus, string> = {
    Pending: "Chờ nhận",
    InProgress: "Đang sửa",
    QcPending: "Chờ QC",
    Completed: "Hoàn tất",
    Cancelled: "Đã hủy",
  };

  return labels[status] ?? status;
}

function statusTagType(
  status: RepairOrderStatus,
): "primary" | "success" | "info" | "danger" | "warning" {
  switch (status) {
    case "Completed":
      return "success";
    case "Cancelled":
      return "danger";
    case "InProgress":
      return "warning";
    case "QcPending":
      return "info";
    default:
      return "primary";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

onMounted(() => {
  void refreshData();
});
</script>

<style scoped lang="scss">
.workshop-assignment-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.workshop-assignment-page__header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.workshop-assignment-page__header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--el-text-color-primary);
}

.workshop-assignment-page__header p {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
}

.workshop-assignment-page__stats {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}

.workshop-assignment-page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.workshop-assignment-page__search {
  flex: 1 1 280px;
  max-width: 420px;
}

.workshop-assignment-page__workspace {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.workshop-assignment-card {
  min-width: 0;
  border-radius: 8px;
}

.workshop-assignment-card :deep(.el-card__body) {
  padding: 16px;
}

.workshop-assignment-card__header {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
}

.workshop-assignment-queue__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 620px;
  overflow-y: auto;
}

.workshop-assignment-order {
  width: 100%;
  padding: 12px;
  color: var(--el-text-color-regular);
  text-align: left;
  cursor: pointer;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.workshop-assignment-order:hover,
.workshop-assignment-order.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}

.workshop-assignment-order:hover {
  transform: translateY(-1px);
}

.workshop-assignment-order__main,
.workshop-assignment-order__meta,
.workshop-assignment-order__foot {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.workshop-assignment-order__main strong {
  overflow: hidden;
  font-size: 15px;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workshop-assignment-order__meta,
.workshop-assignment-order__foot {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.workshop-assignment-order__foot strong {
  color: var(--el-text-color-primary);
}

.workshop-assignment-table {
  width: 100%;
}

.workshop-assignment-technician {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.workshop-assignment-technician__avatar {
  display: inline-flex;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-weight: 800;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
}

.workshop-assignment-technician strong {
  display: block;
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workshop-assignment-technician span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.workshop-assignment-detail__body,
.workshop-assignment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workshop-assignment-detail__summary {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 10px;
}

.workshop-assignment-detail__summary > div,
.workshop-assignment-selected {
  padding: 10px 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.workshop-assignment-detail__summary span,
.workshop-assignment-selected span,
.workshop-assignment-selected small {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.workshop-assignment-detail__summary strong,
.workshop-assignment-selected strong {
  display: block;
  margin-top: 4px;
  color: var(--el-text-color-primary);
}

:deep(.el-select-dropdown__item) {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

:deep(.el-select-dropdown__item small) {
  color: var(--el-text-color-secondary);
}

@media (width >= 768px) {
  .workshop-assignment-page__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workshop-assignment-detail__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 1280px) {
  .workshop-assignment-page__stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .workshop-assignment-page__workspace {
    grid-template-columns: minmax(280px, 0.9fr) minmax(430px, 1.35fr) minmax(
        320px,
        0.95fr
      );
  }
}

@media (width <= 767px) {
  .workshop-assignment-page__search {
    max-width: none;
  }

  .workshop-assignment-page__filters :deep(.el-radio-group) {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .workshop-assignment-page__filters :deep(.el-radio-button) {
    flex-shrink: 0;
  }
}
</style>
