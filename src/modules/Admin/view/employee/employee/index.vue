<template>
  <div class="hr-employee-container flex flex-col gap-4 h-full">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ $t("menus.hr.employee") }}</h1>
      <ElButton type="primary" v-ripple @click="handleAdd">
        <ElIcon class="mr-1"><Plus /></ElIcon> Thêm nhân viên
      </ElButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng nhân viên"
        :count="stats.total"
        icon="ri:group-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang làm việc"
        :count="stats.active"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Đã nghỉ việc"
        :count="stats.inactive"
        icon="ri:close-circle-line"
        iconStyle="bg-danger"
      />
    </div>

    <!-- Main Content -->
    <ElCard class="flex-1 art-table-card flex flex-col" shadow="never">
      <div class="mb-4">
        <ArtSearchBar
          v-model="searchForm"
          :items="dynamicSearchItems"
          :label-width="80"
          :span="6"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>

      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="loadData"
      />

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #fullName="{ row }">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-primary/10 flex-cc text-primary font-medium text-sm"
            >
              {{ getInitial(row.fullName) }}
            </div>
            <span>{{ row.fullName }}</span>
          </div>
        </template>
        <template #jobTitle="{ row }">
          <ElTag type="info" size="small">{{ row.jobTitle }}</ElTag>
        </template>
        <template #baseSalary="{ row }">
          <span class="font-medium text-gray-800 dark:text-gray-200">{{
            formatCurrency(row.baseSalary)
          }}</span>
        </template>
        <template #contractDate="{ row }">
          {{ formatDate(row.contractDate) }}
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable
              type="view"
              @click="handleView(row)"
              v-auth="Permissions.Admin.EmployeeManagement.View"
            />
            <ArtButtonTable
              type="edit"
              @click="handleEdit(row)"
              v-auth="Permissions.Admin.EmployeeManagement.Edit"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Detail Dialog -->
    <ElDialog
      v-model="detailVisible"
      title="Hồ sơ chi tiết nhân viên"
      width="600px"
      destroy-on-close
    >
      <div
        v-if="selectedEmployee"
        class="employee-detail-content px-2 max-w-md mx-auto"
      >
        <div
          class="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800"
        >
          <div
            class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-2xl"
          >
            {{ getInitial(selectedEmployee.fullName) }}
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">
              {{ selectedEmployee.fullName }}
            </h3>
            <p class="text-gray-500 text-sm mt-1">
              {{ selectedEmployee.jobTitle }}
            </p>
          </div>
        </div>

        <ElForm
          label-width="140px"
          class="employee-detail-form"
          label-position="left"
        >
          <ElFormItem label="Họ và tên" class="!mb-2">
            <span class="font-medium text-gray-800 dark:text-gray-200">{{
              selectedEmployee.fullName
            }}</span>
          </ElFormItem>
          <ElFormItem label="Email" class="!mb-2">
            <span class="text-gray-700 dark:text-gray-300">{{
              selectedEmployee.email
            }}</span>
          </ElFormItem>
          <ElFormItem label="Vị trí / Chức vụ" class="!mb-2">
            <ElTag size="small" type="info">{{
              selectedEmployee.jobTitle
            }}</ElTag>
          </ElFormItem>
          <ElFormItem label="CMND / CCCD" class="!mb-2">
            <span class="text-gray-700 dark:text-gray-300">{{
              selectedEmployee.identityNumber || "---"
            }}</span>
          </ElFormItem>
          <ElFormItem label="Mức lương cơ bản" class="!mb-2">
            <span class="font-bold text-primary">{{
              formatCurrency(selectedEmployee.baseSalary)
            }}</span>
          </ElFormItem>
          <ElFormItem label="Ngày bắt đầu" class="!mb-2">
            <span class="text-gray-700 dark:text-gray-300">{{
              formatDate(selectedEmployee.contractDate)
            }}</span>
          </ElFormItem>
          <ElFormItem label="Địa chỉ" class="!mb-2">
            <span class="text-gray-700 dark:text-gray-300">{{
              selectedEmployee.address || "---"
            }}</span>
          </ElFormItem>
          <ElFormItem label="Ngân hàng" class="!mb-2">
            <span class="text-gray-700 dark:text-gray-300">{{
              selectedEmployee.bankName || "---"
            }}</span>
          </ElFormItem>
          <ElFormItem label="Số tài khoản" class="!mb-2">
            <span class="text-gray-700 dark:text-gray-300 font-medium">{{
              selectedEmployee.bankAccountNumber || "---"
            }}</span>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="detailVisible = false">Đóng</ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- Form Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        class="mt-4"
      >
        <ElFormItem label="Họ và tên" prop="fullName">
          <ElInput v-model="form.fullName" placeholder="Nhập họ và tên" />
        </ElFormItem>
        <ElFormItem label="Email" prop="email">
          <ElInput v-model="form.email" placeholder="Nhập địa chỉ email" />
        </ElFormItem>
        <ElFormItem label="Vị trí / Chức vụ" prop="jobTitle">
          <ElInput
            v-model="form.jobTitle"
            placeholder="Nhập vị trí / chức vụ"
          />
        </ElFormItem>
        <ElFormItem label="Mức lương cơ bản" prop="baseSalary">
          <ElInputNumber
            v-model="form.baseSalary"
            :min="0"
            :step="1000000"
            style="width: 100%"
            placeholder="Nhập mức lương"
          />
        </ElFormItem>
        <ElFormItem label="CMND / CCCD" prop="identityNumber">
          <ElInput
            v-model="form.identityNumber"
            placeholder="Nhập số CMND/CCCD"
          />
        </ElFormItem>
        <ElFormItem label="Ngày bắt đầu" prop="contractDate">
          <ElDatePicker
            v-model="form.contractDate"
            type="date"
            placeholder="Chọn ngày bắt đầu"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="Địa chỉ" prop="address">
          <ElInput v-model="form.address" placeholder="Nhập địa chỉ" />
        </ElFormItem>
        <ElFormItem label="Ngân hàng" prop="bankName">
          <ElInput v-model="form.bankName" placeholder="Tên ngân hàng" />
        </ElFormItem>
        <ElFormItem label="Số tài khoản" prop="bankAccountNumber">
          <ElInput
            v-model="form.bankAccountNumber"
            placeholder="Số tài khoản ngân hàng"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="handleSubmit">
            Xác nhận
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { Plus } from "@element-plus/icons-vue";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { EmployeeApi, type EmployeeResponse } from "@/api/operations";

defineOptions({ name: "HREmployee" });

const formRef = ref<FormInstance>();
const submitting = ref(false);

const form = reactive({
  id: 0,
  userId: "",
  fullName: "",
  email: "",
  jobTitle: "",
  baseSalary: 0,
  identityNumber: "",
  address: "",
  contractDate: "",
  bankName: "",
  bankAccountNumber: "",
});

const rules = reactive<FormRules>({
  fullName: [
    { required: true, message: "Vui lòng nhập họ và tên", trigger: "blur" },
  ],
  email: [
    { required: true, message: "Vui lòng nhập email", trigger: "blur" },
    { type: "email", message: "Định dạng email không hợp lệ", trigger: "blur" },
  ],
  jobTitle: [
    {
      required: true,
      message: "Vui lòng nhập vị trí/chức vụ",
      trigger: "blur",
    },
  ],
  baseSalary: [
    { required: true, message: "Vui lòng nhập lương cơ bản", trigger: "blur" },
  ],
});

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("Thêm nhân viên");
const detailVisible = ref(false);
const selectedEmployee = ref<EmployeeResponse | null>(null);

const stats = reactive({ total: 0, active: 0, inactive: 0 });

const pagination = reactive({ current: 1, size: 10, total: 0 });
const data = ref<EmployeeResponse[]>([]);

import { searchItems, columns } from "@/modules/Admin/logic/employee";

const searchForm = ref({ name: "", jobTitle: "", email: "" });
const columnChecks = ref([...columns]);

const dynamicSearchItems = ref<any[]>([...searchItems]);

const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "?";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

const formatDate = (dateStr: string) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const loadStats = async () => {
  stats.total = data.value.length;
  stats.active = stats.total;
  stats.inactive = 0;
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await EmployeeApi.getList();
    const allData = res || [];

    // Dynamically update unique job titles for filter based on all data
    const uniqueJobTitles = Array.from(
      new Set(allData.map((e) => e.jobTitle).filter(Boolean)),
    );
    const jobTitleItem = dynamicSearchItems.value.find(
      (item) => item.key === "jobTitle",
    );
    if (jobTitleItem && jobTitleItem.type === "select" && jobTitleItem.props) {
      jobTitleItem.props.options = uniqueJobTitles.map((title) => ({
        label: title,
        value: title,
      }));
    }

    // Apply filters
    let filtered = allData;
    if (searchForm.value.name) {
      filtered = filtered.filter((e) =>
        e.fullName.toLowerCase().includes(searchForm.value.name.toLowerCase()),
      );
    }
    if (searchForm.value.jobTitle) {
      filtered = filtered.filter(
        (e) => e.jobTitle === searchForm.value.jobTitle,
      );
    }
    if (searchForm.value.email) {
      filtered = filtered.filter((e) =>
        e.email.toLowerCase().includes(searchForm.value.email.toLowerCase()),
      );
    }

    data.value = filtered;
    pagination.total = filtered.length;
    loadStats();
  } catch (error) {
    console.error("Failed to load employees:", error);
    ElMessage.error("Không thể tải danh sách nhân viên");
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  pagination.current = 1;
  loadData();
};
const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  Object.assign(form, {
    id: 0,
    userId: "",
    fullName: "",
    email: "",
    jobTitle: "",
    baseSalary: 0,
    identityNumber: "",
    address: "",
    contractDate: "",
    bankName: "",
    bankAccountNumber: "",
  });
};

const handleAdd = () => {
  resetForm();
  dialogVisible.value = true;
  dialogTitle.value = "Thêm nhân viên";
};

const handleEdit = (row: EmployeeResponse) => {
  resetForm();
  Object.assign(form, row);
  dialogVisible.value = true;
  dialogTitle.value = "Cập nhật nhân viên";
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (form.id) {
          await EmployeeApi.update(form.id, form);
          ElMessage.success("Cập nhật nhân viên thành công");
        } else {
          await EmployeeApi.create(form);
          ElMessage.success("Thêm nhân viên thành công");
        }
        dialogVisible.value = false;
        loadData();
      } catch (error) {
        ElMessage.error("Có lỗi xảy ra, vui lòng thử lại sau!");
      } finally {
        submitting.value = false;
      }
    }
  });
};

const handleView = (row: EmployeeResponse) => {
  selectedEmployee.value = row;
  detailVisible.value = true;
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
const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.hr-employee-container {
  padding: 16px;
}

.employee-descriptions {
  :deep(.el-descriptions__label) {
    width: 150px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }
}

.employee-detail-form {
  :deep(.el-form-item) {
    margin-bottom: 12px !important;
  }

  :deep(.el-form-item__label) {
    line-height: 28px;
    color: var(--el-text-color-secondary);
  }

  :deep(.el-form-item__content) {
    line-height: 28px;
  }
}
</style>
