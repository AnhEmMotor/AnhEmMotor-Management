<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          {{ $t("menus.service.workshop.repairOrders") }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý phiếu sửa chữa: tiếp nhận, phân công kỹ thuật, cấp phát linh
          kiện và hoàn tất.
        </p>
      </div>

      <div class="flex gap-2">
        <ElButton
          :icon="Refresh"
          type="primary"
          :loading="loading"
          @click="refreshData"
        >
          Làm mới
        </ElButton>

        <ElButton
          type="success"
          :icon="Plus"
          :loading="loading"
          @click="openCreateDialog"
        >
          Tạo phiếu
        </ElButton>
      </div>
    </div>

    <!-- KPI / Stats theo trạng thái -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        icon-style="bg-warning"
        :title="'Pending'"
        :count="counts.pending"
        description="Chờ tiếp nhận"
        icon="ri:hourglass-2-line"
      />
      <ArtStatsCard
        icon-style="bg-primary"
        :title="'InProgress'"
        :count="counts.inProgress"
        description="Đang xử lý"
        icon="ri:tools-line"
      />
      <ArtStatsCard
        icon-style="bg-info"
        :title="'QcPending'"
        :count="counts.qcPending"
        description="Chờ QC"
        icon="ri:clipboard-check-line"
      />
      <ArtStatsCard
        icon-style="bg-success"
        :title="'Completed'"
        :count="counts.completed"
        description="Hoàn tất"
        icon="ri:checkbox-circle-line"
      />
    </div>

    <!-- Search -->
    <ArtSearchBar
      :items="searchItems"
      :label-width="140"
      :span="6"
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
          <ElTag type="info" class="mr-2">{{
            "Total: " + (pagination?.total ?? 0)
          }}</ElTag>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #status="{ row }">
          <ElTag :type="statusTagType(row.status)" effect="dark">
            {{ row.status }}
          </ElTag>
        </template>

        <template #paymentStatus="{ row }">
          <ElTag
            :type="row.paymentStatus === 'Paid' ? 'success' : 'warning'"
            effect="dark"
          >
            {{ row.paymentStatus }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center flex-wrap">
            <ArtButtonTable
              type="edit"
              @click="openAssignTechnician(row)"
              v-if="row.status !== 'Completed'"
              v-auth="Permissions.Factory.RepairOrderManagement.View"
            />

            <ArtButtonTable
              type="edit"
              @click="openIssueParts(row)"
              v-if="row.status === 'InProgress' || row.status === 'QcPending'"
              v-auth="Permissions.Factory.RepairOrderManagement.View"
            />

            <ArtButtonTable
              type="edit"
              @click="openComplete(row)"
              v-if="row.status !== 'Completed' && row.status !== 'Cancelled'"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Dialog: Create Repair Order (giai đoạn 1 - tiếp nhận) -->
    <ElDialog
      v-model="createDialogVisible"
      title="Tạo phiếu sửa chữa"
      width="720px"
      class="premium-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="createForm"
        label-width="140px"
        class="space-y-4"
        :disabled="submitting"
      >
        <!-- 1) Luôn hỏi SĐT trước -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Số điện thoại <span class="text-red-500">*</span>
            </label>
            <ElInput
              v-model="createForm.customerPhone"
              placeholder="Nhập SĐT"
              @blur="handleCustomerPhoneBlur"
            />
          </div>

          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Tên khách
            </label>
            <ElInput
              v-model="createForm.customerName"
              placeholder="Tự điền nếu SĐT đã có"
              :disabled="!createForm.isNewCustomer"
            />
          </div>
        </div>

        <div
          v-if="createForm.isNewCustomer"
          class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3"
        >
          Khách chưa có hồ sơ. Vui lòng nhập đầy đủ thông tin khách và xe.
        </div>

        <!-- 2) VIN/Số khung + Biển số + Tên xe/phiên bản/màu -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              VIN / Số khung xe máy
              <span class="text-red-500" v-if="createForm.isNewCustomer"
                >*</span
              >
            </label>
            <ElInput
              v-model="createForm.vinNumber"
              placeholder="Ví dụ: RL..."
              :disabled="!createForm.isNewCustomer"
            />
          </div>

          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Biển số xe
              <span class="text-red-500" v-if="createForm.isNewCustomer"
                >*</span
              >
            </label>
            <ElInput
              v-model="createForm.licensePlate"
              placeholder="Ví dụ: 51A-123.45"
              :disabled="!createForm.isNewCustomer"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Tên xe / Phiên bản
              <span class="text-red-500" v-if="createForm.isNewCustomer"
                >*</span
              >
            </label>
            <ElInput
              v-model="createForm.vehicleName"
              placeholder="Ví dụ: Winner X 2024"
              :disabled="!createForm.isNewCustomer"
            />
          </div>

          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Màu sắc
              <span class="text-red-500" v-if="createForm.isNewCustomer"
                >*</span
              >
            </label>
            <ElInput
              v-model="createForm.vehicleColor"
              placeholder="Ví dụ: Đỏ"
              :disabled="!createForm.isNewCustomer"
            />
          </div>
        </div>

        <!-- 3) Thợ kỹ thuật -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Thợ kỹ thuật (Tên)
            </label>
            <ElInput
              v-model="createForm.technicianName"
              placeholder="Nhập tên thợ kỹ thuật"
            />
          </div>

          <div></div>
        </div>

        <!-- 4) ODO + mô tả lỗi -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Mileage (km) <span class="text-red-500">*</span>
            </label>
            <ElInputNumber
              v-model="createForm.mileage"
              :min="0"
              class="w-full"
              placeholder="0"
            />
          </div>

          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Mô tả tình trạng
            </label>
            <ElInput
              v-model="createForm.description"
              placeholder="Ví dụ: thay nhớt, mòn phanh..."
            />
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton @click="createDialogVisible = false" :disabled="submitting"
            >Đóng</ElButton
          >
          <ElButton
            type="primary"
            :loading="submitting"
            @click="submitCreate"
            class="px-8"
            >Tạo</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <!-- Dialog: Assign technician -->
    <ElDialog
      v-model="assignDialogVisible"
      title="Phân công kỹ thuật"
      width="620px"
      class="premium-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="assignForm"
        label-width="140px"
        class="space-y-4"
        :disabled="submitting"
      >
        <div>
          <label
            class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
          >
            Kỹ thuật viên <span class="text-red-500">*</span>
          </label>
          <ElSelect
            v-model="assignForm.technicianId"
            placeholder="Chọn kỹ thuật viên"
            class="w-full"
            clearable
            filterable
          >
            <ElOption
              v-for="emp in technicians"
              :key="emp.id"
              :label="emp.fullName + ' (' + emp.jobTitle + ')'"
              :value="emp.id"
            />
          </ElSelect>
        </div>

        <div class="text-sm text-slate-500">
          RepairOrder:
          <span class="font-medium">#{{ assignForm.repairOrderId }}</span>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton @click="assignDialogVisible = false" :disabled="submitting"
            >Đóng</ElButton
          >
          <ElButton
            type="primary"
            :loading="submitting"
            @click="submitAssign"
            class="px-8"
            >Xác nhận</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <!-- Dialog: Issue parts (cấp phát linh kiện) -->
    <ElDialog
      v-model="issuePartsDialogVisible"
      title="Cấp phát linh kiện & dịch vụ"
      width="820px"
      class="premium-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <ElAlert
        type="info"
        show-icon
        :closable="false"
        class="mb-4"
        description="UI demo: nhập tối thiểu để gọi API issue-parts (backend quyết định valid input)."
      />

      <ElForm
        :model="issuePartsForm"
        label-width="160px"
        class="space-y-6"
        :disabled="submitting"
      >
        <div class="text-sm text-slate-500">
          RepairOrder:
          <span class="font-medium">#{{ issuePartsForm.repairOrderId }}</span>
        </div>

        <!-- Parts Section -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Linh kiện
            </label>
            <ElButton type="primary" :icon="Plus" size="small" @click="addPart">
              Thêm linh kiện
            </ElButton>
          </div>
          <ElTable
            :data="issuePartsForm.parts"
            border
            size="small"
            style="width: 100%"
          >
            <ElTableColumn label="Linh kiện" min-width="200px">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.productVariantId"
                  placeholder="Chọn linh kiện"
                  clearable
                >
                  <ElOption
                    v-for="v in productVariants"
                    :key="v.id"
                    :label="v.name"
                    :value="v.id"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="SL" width="100px" align="center">
              <template #default="{ row }">
                <ElInputNumber v-model="row.count" :min="1" size="small" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="150px">
              <template #default="{ row }">
                <ElInput v-model="row.price" type="number" size="small" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Ghi chú" min-width="150px">
              <template #default="{ row }">
                <ElInput v-model="row.notes" size="small" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Hành động" width="60px" align="center">
              <template #default="{ $index }">
                <ElButton
                  type="danger"
                  :icon="TrashBin"
                  circle
                  size="small"
                  @click="removePart($index)"
                />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <!-- Services Section -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Dịch vụ
            </label>
            <ElButton
              type="primary"
              :icon="Plus"
              size="small"
              @click="addService"
            >
              Thêm dịch vụ
            </ElButton>
          </div>
          <ElTable
            :data="issuePartsForm.services"
            border
            size="small"
            style="width: 100%"
          >
            <ElTableColumn label="Dịch vụ" min-width="200px">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.serviceId"
                  placeholder="Chọn dịch vụ"
                  clearable
                >
                  <ElOption
                    v-for="s in serviceCategories"
                    :key="s.id"
                    :label="s.name"
                    :value="s.id"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Công xá" width="150px">
              <template #default="{ row }">
                <ElInput v-model="row.laborCost" type="number" size="small" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Ghi chú" min-width="150px">
              <template #default="{ row }">
                <ElInput v-model="row.notes" size="small" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Hành động" width="60px" align="center">
              <template #default="{ $index }">
                <ElButton
                  type="danger"
                  :icon="TrashBin"
                  circle
                  size="small"
                  @click="removeService($index)"
                />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton
            @click="issuePartsDialogVisible = false"
            :disabled="submitting"
            >Đóng</ElButton
          >
          <ElButton
            type="primary"
            :loading="submitting"
            @click="submitIssueParts"
            class="px-8"
            >Cấp phát</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <!-- Dialog: Complete -->
    <ElDialog
      v-model="completeDialogVisible"
      title="Hoàn tất sửa chữa"
      width="640px"
      class="premium-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="completeForm"
        label-width="160px"
        class="space-y-4"
        :disabled="submitting"
      >
        <div class="text-sm text-slate-500">
          RepairOrder:
          <span class="font-medium">#{{ completeForm.repairOrderId }}</span>
        </div>

        <div>
          <label
            class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
          >
            Payment Method <span class="text-red-500">*</span>
          </label>
          <ElSelect
            v-model="completeForm.paymentMethod"
            placeholder="Chọn phương thức"
            class="w-full"
          >
            <ElOption label="Tiền mặt" value="Cash" />
            <ElOption label="Chuyển khoản" value="BankTransfer" />
          </ElSelect>
        </div>

        <div>
          <label
            class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
          >
            Notes
          </label>
          <ElInput
            v-model="completeForm.notes"
            placeholder="Ghi chú (nếu có)"
          />
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton
            @click="completeDialogVisible = false"
            :disabled="submitting"
            >Đóng</ElButton
          >
          <ElButton
            type="primary"
            :loading="submitting"
            @click="submitComplete"
            class="px-8"
            >Hoàn tất</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { computed, ref } from "vue";
import { Refresh, Plus, Delete as TrashBin } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

import { RepairOrderApi, type RepairOrder } from "@/api/sales";
import { ProductApi } from "@/api/product";
import {
  ServiceCategoryApi,
  type ServiceCategoryResponse,
} from "@/api/product";
import {
  EmployeeApi,
  type EmployeeResponse,
} from "@/api/operations/employee.api";

defineOptions({ name: "ServiceWorkshopRepairOrders" });

// NOTE: Dùng useTable pattern dự án nếu có. Ở đây tạo UI tối giản nhưng tương thích shape của ArtTable.
const loading = ref(false);
const tableRef = ref();

// Pagination
const pagination = ref<any>({ current: 1, size: 10, total: 0 });

// Table data
const data = ref<RepairOrder[]>([]);

// Column checks (ArtTableHeader v-model)
const columnChecks = ref<any[]>([]);

// Columns (ArtTable)
const columns = computed(() => {
  return [
    { prop: "id", label: "ID", width: 90, align: "center" },
    { prop: "licensePlate", label: "Biển số", minWidth: 130 },
    { prop: "customerName", label: "Khách", minWidth: 180 },
    { prop: "customerPhone", label: "SĐT", width: 150 },
    { prop: "mileage", label: "Km", width: 110, align: "right" },
    {
      prop: "status",
      label: "Trạng thái",
      width: 140,
      align: "center",
      useSlot: true,
      slot: "status",
    },
    {
      prop: "paymentStatus",
      label: "Thanh toán",
      width: 140,
      align: "center",
      useSlot: true,
      slot: "paymentStatus",
    },
    { prop: "totalAmount", label: "Tổng", width: 140, align: "right" },
    { prop: "createdAt", label: "Tạo lúc", minWidth: 160 },
    {
      prop: "operation",
      label: "Hành động",
      width: 250,
      align: "center",
      fixed: "right" as const,
      useSlot: true,
      slot: "operation",
    },
  ];
});

const searchItems = [
  {
    key: "licensePlate",
    label: "VIN / Biển số",
    prop: "licensePlate",
    type: "text",
    placeholder: "Nhập VIN/biển số",
  },
  {
    key: "customerPhone",
    label: "SĐT",
    prop: "customerPhone",
    type: "text",
    placeholder: "Nhập SĐT",
  },
  {
    key: "status",
    label: "Trạng thái",
    prop: "status",
    type: "select",
    options: [
      "Pending",
      "InProgress",
      "QcPending",
      "Completed",
      "Cancelled",
    ].map((s) => ({
      label: s,
      value: s,
    })),
  },
];

const refreshData = async () => {
  await fetchData({
    Page: pagination.value.current,
    PageSize: pagination.value.size,
  });
};

const handleSearch = async (params: any) => {
  const filters: string[] = [];

  if (params.licensePlate) filters.push(`LicensePlate@=${params.licensePlate}`);
  if (params.customerPhone)
    filters.push(`CustomerPhone@=${params.customerPhone}`);
  if (params.status) filters.push(`Status==${params.status}`);

  await fetchData({
    Page: pagination.value.current,
    PageSize: pagination.value.size,
    Filters: filters.join(","),
  });
};

const handleReset = async () => {
  await fetchData({
    Page: pagination.value.current,
    PageSize: pagination.value.size,
    Filters: "",
  });
};

const handleSizeChange = async (size: number) => {
  pagination.value.size = size;
  pagination.value.current = 1;
  await refreshData();
};

const handleCurrentChange = async (current: number) => {
  pagination.value.current = current;
  await refreshData();
};

const fetchData = async (params: any) => {
  loading.value = true;
  try {
    // API shape: items + totalCount
    const res = await RepairOrderApi.getList(params);
    data.value = res.items || [];
    pagination.value.total = res.totalCount || 0;
  } catch (err: any) {
    // fallback mock để UI vẫn chạy
    data.value = [];
    pagination.value.total = 0;
    ElMessage.error(err?.message || "Không thể tải danh sách phiếu sửa chữa");
  } finally {
    loading.value = false;
  }
};

// Stats theo trạng thái
const counts = computed(() => {
  const safe = data.value || [];
  const byStatus = safe.reduce(
    (acc: any, x: any) => {
      const s = x.status;
      if (s === "Pending") acc.pending++;
      else if (s === "InProgress") acc.inProgress++;
      else if (s === "QcPending") acc.qcPending++;
      else if (s === "Completed") acc.completed++;
      return acc;
    },
    { pending: 0, inProgress: 0, qcPending: 0, completed: 0 },
  );
  return byStatus;
});

const statusTagType = (status: string) => {
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
};

// Dialog: Create
const createDialogVisible = ref(false);
const submitting = ref(false);
const createForm = ref({
  customerPhone: "",
  customerName: "",
  mileage: 0,
  description: "",

  // Auto-fill vehicle/customer info (Vehicle Portfolio)
  isNewCustomer: true,
  vinNumber: "",
  licensePlate: "",
  vehicleName: "",
  vehicleColor: "",

  // Assign technician (main tech)
  technicianName: "",
});

const openCreateDialog = () => {
  createDialogVisible.value = true;
  createForm.value = {
    customerPhone: "",
    customerName: "",
    mileage: 0,
    description: "",

    isNewCustomer: true,
    vinNumber: "",
    licensePlate: "",
    vehicleName: "",
    vehicleColor: "",
    technicianName: "",
  };
};

// Stub: Auto-fill khi user nhập SĐT (phần backend/call sẽ bổ sung sau)
const handleCustomerPhoneBlur = async () => {
  // Nếu dự án chưa có endpoint auto-fill Customer/Vehicle Portfolio theo SĐT,
  // giữ nguyên trạng thái isNewCustomer = true để UI hoạt động.
  // Khi có API: gọi, nếu có dữ liệu => set isNewCustomer=false và fill: customerName/vinNumber/licensePlate/vehicleName/vehicleColor
  createForm.value.isNewCustomer = !createForm.value.customerName;
};

const submitCreate = async () => {
  submitting.value = true;
  try {
    // Payload hiện tại của RepairOrderApi đang chỉ yêu cầu: customerName, customerPhone, mileage, description.
    // Các field VIN/biển số/tên xe/màu sẽ cần backend hỗ trợ để map tự động.
    const payload = {
      customerPhone: createForm.value.customerPhone,
      customerName: createForm.value.customerName,
      mileage: createForm.value.mileage,
      description: createForm.value.description,

      // Field cho luồng “chỉ định thợ chính” (nếu backend đã hỗ trợ)
      technicianName: createForm.value.technicianName,
    };

    // Ghi chú: technicianName hiện chỉ phục vụ UI; cần backend hỗ trợ field tương ứng để lưu DB.
    await RepairOrderApi.create(payload as any);

    ElMessage.success("Tạo phiếu thành công");
    createDialogVisible.value = false;
    await refreshData();
  } catch (err: any) {
    ElMessage.error(err?.message || "Tạo phiếu thất bại");
  } finally {
    submitting.value = false;
  }
};

// Dialog: Assign technician
const assignDialogVisible = ref(false);
const assignForm = ref({ repairOrderId: 0, technicianId: 1 });
const technicians = ref<EmployeeResponse[]>([]);

const fetchTechnicians = async () => {
  try {
    const list = await EmployeeApi.getList();
    const filtered = list.filter(
      (e) =>
        e.jobTitle?.toLowerCase().includes("technician") ||
        e.jobTitle?.toLowerCase().includes("kỹ thuật") ||
        e.jobTitle?.toLowerCase().includes("thợ") ||
        e.jobTitle?.toLowerCase().includes("tech"),
    );
    technicians.value = filtered.length > 0 ? filtered : list;
  } catch (err) {
    ElMessage.error("Không thể tải danh sách kỹ thuật viên");
  }
};

const openAssignTechnician = async (row: RepairOrder) => {
  assignForm.value = {
    repairOrderId: row.id,
    technicianId: (row as any).technicianId || 1,
  };
  assignDialogVisible.value = true;
  await fetchTechnicians();
  if (technicians.value.length > 0 && !assignForm.value.technicianId) {
    assignForm.value.technicianId = technicians.value[0].id;
  }
};

const submitAssign = async () => {
  submitting.value = true;
  try {
    await RepairOrderApi.assignTechnician(assignForm.value as any);
    ElMessage.success("Phân công kỹ thuật thành công");
    assignDialogVisible.value = false;
    await refreshData();
  } catch (err: any) {
    ElMessage.error(err?.message || "Phân công thất bại");
  } finally {
    submitting.value = false;
  }
};

// Dialog: Issue parts
const issuePartsDialogVisible = ref(false);
const productVariants = ref<any[]>([]);
const serviceCategories = ref<ServiceCategoryResponse[]>([]);
const issuePartsForm = ref({
  repairOrderId: 0,
  parts: [] as any[],
  services: [] as any[],
});

const openIssueParts = async (row: RepairOrder) => {
  issuePartsForm.value = {
    repairOrderId: row.id,
    parts: [],
    services: [],
  };

  try {
    // Load options for selection
    const [variants, categories] = await Promise.all([
      ProductApi.getVariantsForInput({ current: 1, size: 100 }),
      ServiceCategoryApi.getList({ current: 1, size: 100 }),
    ]);
    productVariants.value = variants.items || [];
    serviceCategories.value = categories.items || [];
  } catch (_err) {
    ElMessage.error("Không thể tải danh sách linh kiện/dịch vụ");
  }

  issuePartsDialogVisible.value = true;
};

const addPart = () => {
  issuePartsForm.value.parts.push({
    productVariantId: "",
    count: 1,
    price: 0,
    notes: "",
  });
};
const removePart = (index: number) => {
  issuePartsForm.value.parts.splice(index, 1);
};
const addService = () => {
  issuePartsForm.value.services.push({
    serviceId: "",
    laborCost: 0,
    notes: "",
  });
};
const removeService = (index: number) => {
  issuePartsForm.value.services.splice(index, 1);
};
const submitIssueParts = async () => {
  submitting.value = true;
  try {
    await RepairOrderApi.issueParts({
      repairOrderId: issuePartsForm.value.repairOrderId,
      parts: issuePartsForm.value.parts,
      services: issuePartsForm.value.services,
    } as any);
    ElMessage.success("Cấp phát thành công");
    issuePartsDialogVisible.value = false;
    await refreshData();
  } catch (err: any) {
    ElMessage.error(err?.message || "Cấp phát thất bại");
  } finally {
    submitting.value = false;
  }
};

// Dialog: Complete
const completeDialogVisible = ref(false);
const completeForm = ref({
  repairOrderId: 0,
  paymentMethod: "Cash",
  paymentStatus: "Paid",
  notes: "",
});

const openComplete = (row: RepairOrder) => {
  completeForm.value = {
    repairOrderId: row.id,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    notes: "",
  };
  completeDialogVisible.value = true;
};

const submitComplete = async () => {
  submitting.value = true;
  try {
    await RepairOrderApi.complete({
      repairOrderId: completeForm.value.repairOrderId,
      paymentMethod: completeForm.value.paymentMethod,
      paymentStatus: completeForm.value.paymentStatus,
      notes: completeForm.value.notes,
    } as any);

    ElMessage.success("Hoàn tất phiếu thành công");
    completeDialogVisible.value = false;
    await refreshData();
  } catch (err: any) {
    ElMessage.error(err?.message || "Hoàn tất thất bại");
  } finally {
    submitting.value = false;
  }
};

// Initial load
refreshData();
</script>
