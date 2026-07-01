<template>
  <div class="flex flex-col gap-4 pb-5">
    <div
      class="flex items-start justify-between gap-4 flex-wrap bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      <div>
        <h1 class="text-2xl font-bold">
          {{ $t("Dịch vụ Đăng ký Biển số") }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý hồ sơ đăng ký biển số theo workflow: Chuẩn bị hồ sơ → Nộp thuế
          trước bạ → Bấm biển số → Đang chờ cà-vet/giấy hẹn → Nhận cà-vet/hoàn
          tất.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <ElButton :icon="Refresh" :loading="loading" @click="refreshData">
          Làm mới
        </ElButton>
        <ElButton type="primary" :icon="Plus" @click="openCreateDialog">
          Tạo Hồ sơ Mới
        </ElButton>
      </div>
    </div>

    <ElCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
          >
            Tìm kiếm
          </label>
          <ElInput
            v-model="query"
            placeholder="Mã hồ sơ, biển số, SĐT, họ tên..."
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <div>
          <label
            class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
          >
            Trạng thái workflow
          </label>
          <ElSelect
            v-model="status"
            placeholder="Chọn trạng thái"
            class="w-full"
            clearable
          >
            <ElOption
              v-for="s in statusOptions"
              :key="s"
              :label="getStatusLabel(s)"
              :value="s"
            />
          </ElSelect>
        </div>
        <div class="flex flex-col justify-end">
          <div class="flex items-center gap-3">
            <ElButton type="primary" :loading="loading" @click="handleSearch">
              Tìm kiếm
            </ElButton>
            <ElButton :disabled="loading" @click="handleReset">
              Đặt lại
            </ElButton>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <ArtTable
          row-key="id"
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <ElTag :type="statusTagType(row.workflowStatus)" effect="dark">{{
              getStatusLabel(row.workflowStatus)
            }}</ElTag>
          </template>
          <template #createdAt="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
          <template #completedDate="{ row }">
            {{ row.completedDate ? formatDate(row.completedDate) : "—" }}
          </template>
          <template #operation="{ row }">
            <div class="flex gap-2 justify-center flex-wrap">
              <ElButton
                type="primary"
                size="small"
                :icon="View"
                link
                @click="openDetail(row.id)"
                >Chi tiết</ElButton
              >
              <ElButton
                type="primary"
                size="small"
                :icon="Edit"
                link
                @click="openEditDialog(row)"
                >Sửa</ElButton
              >
              <ElButton
                type="danger"
                size="small"
                :icon="Delete"
                link
                @click="handleDelete(row.id)"
                >Xóa</ElButton
              >
            </div>
          </template>
        </ArtTable>
      </div>
    </ElCard>

    <!-- Dialog Tạo/Sửa Hồ Sơ -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :destroy-on-close="true"
    >
      <ElForm
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ElFormItem label="Mã hồ sơ" v-if="form.dossierNumber">
            <ElInput v-model="form.dossierNumber" disabled />
          </ElFormItem>
          <ElFormItem label="Họ tên khách hàng" prop="customerName">
            <ElInput
              v-model="form.customerName"
              placeholder="Nhập họ tên khách hàng"
            />
          </ElFormItem>
          <ElFormItem label="Số điện thoại" prop="customerPhone">
            <ElInput
              v-model="form.customerPhone"
              placeholder="Nhập số điện thoại (10 số)"
            />
          </ElFormItem>
          <ElFormItem label="Biển số" prop="licensePlate">
            <ElInput
              v-model="form.licensePlate"
              placeholder="VD: 59-T1 123.45"
            />
          </ElFormItem>
          <ElFormItem label="VIN / Số khung" prop="vinNumber">
            <ElInput v-model="form.vinNumber" placeholder="Nhập số khung xe" />
          </ElFormItem>
          <ElFormItem label="Trạng thái" prop="status">
            <ElSelect v-model="form.status" class="w-full">
              <ElOption
                v-for="s in statusOptions"
                :key="s"
                :label="getStatusLabel(s)"
                :value="s"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngày tạo" prop="createdAt">
            <ElDatePicker
              v-model="form.createdAt"
              type="date"
              class="w-full"
              placeholder="Chọn ngày tạo"
            />
          </ElFormItem>
          <ElFormItem
            label="Ngày hoàn thành"
            prop="completedDate"
            v-if="form.status === 'Completed'"
          >
            <ElDatePicker
              v-model="form.completedDate"
              type="date"
              class="w-full"
              placeholder="Chọn ngày hoàn thành"
            />
          </ElFormItem>
        </div>

        <div class="border-t border-slate-100 my-4 pt-4">
          <div
            class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3"
          >
            Tài chính (Lệ phí &amp; Chi phí)
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ElFormItem label="Lệ phí trước bạ">
              <ElInputNumber
                v-model="form.registrationFee"
                :min="0"
                class="w-full"
                :controls="false"
              />
            </ElFormItem>
            <ElFormItem label="Chi phí thực tế">
              <ElInputNumber
                v-model="form.actualCost"
                :min="0"
                class="w-full"
                :controls="false"
              />
            </ElFormItem>
            <ElFormItem label="Phí dịch vụ">
              <ElInputNumber
                v-model="form.serviceFee"
                :min="0"
                class="w-full"
                :controls="false"
              />
            </ElFormItem>
          </div>
        </div>

        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="form.notes"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú thêm thông tin hồ sơ..."
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy bỏ</ElButton>
          <ElButton type="primary" :loading="submitting" @click="handleSubmit"
            >Lưu lại</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from "vue";
import { Refresh, Plus, View, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

import ArtTable from "@/components/core/tables/art-table/index.vue";
import { PlateDossierApi } from "@/api/vehicle/plate-dossier.api";

defineOptions({ name: "ServiceAdministrativeRegistrationPlateList" });

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();

const query = ref("");
const status = ref<string | undefined>(undefined);

const statusOptions = [
  "Prepare",
  "TaxPaid",
  "PlateAssigned",
  "WaitingCard",
  "Completed",
];

const getStatusLabel = (workflowStatus: string) => {
  switch (workflowStatus) {
    case "Prepare":
      return "Chuẩn bị hồ sơ";
    case "TaxPaid":
      return "Nộp thuế trước bạ";
    case "PlateAssigned":
      return "Bấm biển số";
    case "WaitingCard":
      return "Chờ cà-vet";
    case "Completed":
      return "Hoàn tất";
    default:
      return workflowStatus;
  }
};

const pagination = ref({ current: 1, size: 10, total: 0 });
const data = ref<any[]>([]);

const columns = computed(() => {
  return [
    { prop: "dossierNumber", label: "Mã hồ sơ", minWidth: 160 },
    { prop: "customerName", label: "Khách", minWidth: 160 },
    { prop: "customerPhone", label: "SĐT", width: 130 },
    { prop: "licensePlate", label: "Biển số", minWidth: 120 },
    { prop: "vinNumber", label: "VIN / Số khung", minWidth: 160 },
    {
      prop: "workflowStatus",
      label: "Trạng thái",
      width: 150,
      useSlot: true,
      slot: "status",
    },
    {
      prop: "createdAt",
      label: "Ngày tạo",
      minWidth: 130,
      useSlot: true,
      slot: "createdAt",
    },
    {
      prop: "completedDate",
      label: "Ngày hoàn thành",
      minWidth: 150,
      useSlot: true,
      slot: "completedDate",
    },
    {
      prop: "operation",
      label: "Hành động",
      width: 180,
      align: "center" as const,
      fixed: "right" as const,
      useSlot: true,
      slot: "operation",
    },
  ];
});

const statusTagType = (workflowStatus: string) => {
  switch (workflowStatus) {
    case "Completed":
      return "success";
    case "WaitingCard":
      return "warning";
    case "PlateAssigned":
      return "info";
    case "TaxPaid":
      return "primary";
    case "Prepare":
      return "danger";
    default:
      return "primary";
  }
};

// Form State
const isEdit = ref(false);
const form = reactive({
  id: undefined as number | undefined,
  dossierNumber: "",
  customerName: "",
  customerPhone: "",
  licensePlate: "",
  vinNumber: "",
  status: "Prepare",
  registrationFee: 0,
  actualCost: 0,
  serviceFee: 0,
  notes: "",
  createdAt: null as any,
  completedDate: null as any,
});

const formRules = reactive<FormRules>({
  customerName: [
    { required: true, message: "Họ tên không được trống", trigger: "blur" },
  ],
  customerPhone: [
    { required: true, message: "SĐT không được trống", trigger: "blur" },
    {
      pattern: /^(03|05|07|08|09)\d{8}$/,
      message: "Số điện thoại Việt Nam không hợp lệ",
      trigger: "blur",
    },
  ],
  licensePlate: [
    { required: true, message: "Biển số không được trống", trigger: "blur" },
  ],
  vinNumber: [
    { required: true, message: "Số khung không được trống", trigger: "blur" },
  ],
  status: [{ required: true, message: "Chọn trạng thái", trigger: "change" }],
  createdAt: [{ required: true, message: "Chọn ngày tạo", trigger: "change" }],
});

const dialogTitle = computed(() =>
  isEdit.value
    ? "CHỈNH SỬA HỒ SƠ ĐĂNG KÝ BIỂN SỐ"
    : "TẠO MỚI HỒ SƠ ĐĂNG KÝ BIỂN SỐ",
);

const refreshData = async () => {
  await fetchData();
};

const handleSearch = async () => {
  pagination.value.current = 1;
  await fetchData();
};

const handleReset = async () => {
  query.value = "";
  status.value = undefined;
  pagination.value.current = 1;
  await fetchData();
};

const handleSizeChange = async (size: number) => {
  pagination.value.size = size;
  pagination.value.current = 1;
  await fetchData();
};

const handleCurrentChange = async (current: number) => {
  pagination.value.current = current;
  await fetchData();
};

const formatDate = (val: string) => {
  if (!val) return "—";
  return dayjs(val).format("DD/MM/YYYY");
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await PlateDossierApi.getList({
      current: pagination.value.current,
      size: pagination.value.size,
      search: query.value.trim() || undefined,
      status: status.value || undefined,
    });
    if (res) {
      data.value = res.items.map((x: any) => ({
        id: x.id,
        dossierNumber: x.dossierNumber || `HSBS-${x.id}`,
        customerName: x.customerName || "Không rõ",
        customerPhone: x.customerPhone || "",
        licensePlate: x.licensePlate,
        vinNumber: x.vinNumber || "N/A",
        workflowStatus: x.status,
        createdAt: x.createdAt,
        completedDate: x.completedDate,
        registrationFee: x.registrationFee,
        actualCost: x.actualCost,
        serviceFee: x.serviceFee,
        notes: x.notes,
      }));
      pagination.value.total = res.totalCount;
    } else {
      data.value = [];
      pagination.value.total = 0;
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể tải danh sách hồ sơ");
    data.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const openDetail = (id: number) => {
  router.push({
    name: "ServiceAdministrativeRegistrationPlateDetail",
    params: { id: String(id) },
  });
};

function openCreateDialog() {
  isEdit.value = false;
  Object.assign(form, {
    id: undefined,
    dossierNumber: "",
    customerName: "",
    customerPhone: "",
    licensePlate: "",
    vinNumber: "",
    status: "Prepare",
    registrationFee: 0,
    actualCost: 0,
    serviceFee: 0,
    notes: "",
    createdAt: new Date(),
    completedDate: null,
  });
  dialogVisible.value = true;
}

function openEditDialog(row: any) {
  isEdit.value = true;
  Object.assign(form, {
    id: row.id,
    dossierNumber: row.dossierNumber,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    licensePlate: row.licensePlate,
    vinNumber: row.vinNumber,
    status: row.workflowStatus,
    registrationFee: row.registrationFee,
    actualCost: row.actualCost,
    serviceFee: row.serviceFee,
    notes: row.notes,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    completedDate: row.completedDate ? new Date(row.completedDate) : null,
  });
  dialogVisible.value = true;
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc chắn muốn xóa hồ sơ đăng ký biển số này không?",
      "Cảnh báo",
      {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy bỏ",
        type: "warning",
      },
    );

    loading.value = true;
    const success = await PlateDossierApi.delete(id);
    if (success) {
      ElMessage.success("Xóa hồ sơ thành công!");
      await fetchData();
    } else {
      ElMessage.error("Xóa hồ sơ thất bại.");
    }
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e?.message || "Đã xảy ra lỗi khi xóa hồ sơ.");
    }
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        licensePlate: form.licensePlate,
        vinNumber: form.vinNumber,
        status: form.status,
        registrationFee: form.registrationFee,
        actualCost: form.actualCost,
        serviceFee: form.serviceFee,
        notes: form.notes,
        createdAt: dayjs(form.createdAt).toISOString(),
        completedDate:
          form.status === "Completed" && form.completedDate
            ? dayjs(form.completedDate).toISOString()
            : undefined,
      };

      if (isEdit.value && form.id) {
        const success = await PlateDossierApi.update(form.id, payload);
        if (success) {
          ElMessage.success("Cập nhật hồ sơ thành công!");
          dialogVisible.value = false;
          await fetchData();
        }
      } else {
        const id = await PlateDossierApi.create(payload);
        if (id) {
          ElMessage.success("Tạo mới hồ sơ thành công!");
          dialogVisible.value = false;
          await fetchData();
        }
      }
    } catch (e: any) {
      ElMessage.error(e?.message || "Thao tác thất bại.");
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(() => {
  refreshData();
});
</script>
