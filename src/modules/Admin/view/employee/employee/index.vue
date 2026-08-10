<template>
  <div class="resp-page hr-employee-container flex h-full flex-col gap-4">
    <!-- Header -->
    <div class="employee-page__header flex items-center justify-between gap-3">
      <h1 class="employee-page__title text-2xl font-semibold">
        {{ $t('menus.hr.employee') }}
      </h1>
      <ElButton
        v-auth="Permissions.Admin.EmployeeManagement.Create"
        v-ripple
        type="primary"
        @click="handleAdd"
      >
        <ElIcon class="mr-1"><Plus /></ElIcon> Thêm nhân viên
      </ElButton>
    </div>

    <!-- Stats -->
    <div class="resp-stats-3 grid grid-cols-1 gap-4 md:grid-cols-3">
      <ArtStatsCard
        title="Tổng hồ sơ"
        :count="stats.total"
        icon="ri:group-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Kết quả đang lọc"
        :count="stats.filtered"
        icon="ri:filter-3-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Vị trí công việc"
        :count="stats.positions"
        icon="ri:briefcase-4-line"
        iconStyle="bg-warning"
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

      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadData" />

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="paginatedEmployees"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #fullName="{ row }">
          <div class="employee-cell flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-primary/10 flex-cc text-primary font-medium text-sm"
            >
              {{ getInitial(row.fullName) }}
            </div>
            <span class="employee-cell__name">{{ row.fullName }}</span>
          </div>
        </template>
        <template #jobTitle="{ row }">
          <ElTag type="info" size="small">{{ row.jobTitle }}</ElTag>
        </template>
        <template #baseSalary="{ row }">
          <span class="employee-value employee-value--strong font-medium">{{
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
            <ArtButtonTable
              type="delete"
              @click="handleDelete(row)"
              v-auth="Permissions.Admin.EmployeeManagement.Delete"
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
      class="resp-dialog employee-dialog"
      destroy-on-close
    >
      <div
        v-if="selectedEmployee"
        v-loading="detailLoading"
        class="employee-detail-content mx-auto max-w-md px-2"
      >
        <div class="employee-detail__header mb-6 flex items-center gap-4 border-b pb-4">
          <div
            class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-2xl"
          >
            {{ getInitial(selectedEmployee.fullName) }}
          </div>
          <div>
            <h3 class="employee-detail__name text-lg font-semibold">
              {{ selectedEmployee.fullName }}
            </h3>
            <p class="employee-detail__role mt-1 text-sm">
              {{ selectedEmployee.jobTitle }}
            </p>
          </div>
        </div>

        <ElForm label-width="140px" class="employee-detail-form" label-position="left">
          <ElFormItem label="Họ và tên" class="!mb-2">
            <span class="employee-value employee-value--strong font-medium">{{
              selectedEmployee.fullName
            }}</span>
          </ElFormItem>
          <ElFormItem label="Email" class="!mb-2">
            <span class="employee-value">{{ selectedEmployee.email }}</span>
          </ElFormItem>
          <ElFormItem label="Vị trí / Chức vụ" class="!mb-2">
            <ElTag size="small" type="info">{{ selectedEmployee.jobTitle }}</ElTag>
          </ElFormItem>
          <ElFormItem label="CMND / CCCD" class="!mb-2">
            <span class="employee-value">{{ selectedEmployee.identityNumber || '---' }}</span>
          </ElFormItem>
          <ElFormItem label="Mức lương cơ bản" class="!mb-2">
            <span class="employee-value--accent font-semibold">{{
              formatCurrency(selectedEmployee.baseSalary)
            }}</span>
          </ElFormItem>
          <ElFormItem label="Ngày bắt đầu" class="!mb-2">
            <span class="employee-value">{{ formatDate(selectedEmployee.contractDate) }}</span>
          </ElFormItem>
          <ElFormItem label="Địa chỉ" class="!mb-2">
            <span class="employee-value">{{ selectedEmployee.address || '---' }}</span>
          </ElFormItem>
          <ElFormItem label="Ngân hàng" class="!mb-2">
            <span class="employee-value">{{ selectedEmployee.bankName || '---' }}</span>
          </ElFormItem>
          <ElFormItem label="Số tài khoản" class="!mb-2">
            <span class="employee-value font-medium">{{
              selectedEmployee.bankAccountNumber || '---'
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
      class="resp-dialog employee-dialog"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="140px" class="mt-4">
        <ElFormItem label="Họ và tên" prop="fullName">
          <ElInput v-model="form.fullName" placeholder="Nhập họ và tên" />
        </ElFormItem>
        <ElFormItem label="Email" prop="email">
          <ElInput v-model="form.email" placeholder="Nhập địa chỉ email" />
        </ElFormItem>
        <ElFormItem label="Vị trí / Chức vụ" prop="jobTitle">
          <ElInput v-model="form.jobTitle" placeholder="Nhập vị trí / chức vụ" />
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
          <ElInput v-model="form.identityNumber" placeholder="Nhập số CMND/CCCD" />
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
          <ElInput v-model="form.bankAccountNumber" placeholder="Số tài khoản ngân hàng" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="handleSubmit"> Xác nhận </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from '@/domain/constants/permissions';
import { Plus } from '@element-plus/icons-vue';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { EmployeeApi, type EmployeeResponse, type EmployeeUpsertRequest } from '@/api/operations';
import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue';
import { searchItems, columns } from '@/modules/Admin/logic/employee';

defineOptions({ name: 'HREmployee' });

const formRef = ref<FormInstance>();
const submitting = ref(false);

type EmployeeForm = EmployeeUpsertRequest & {
  id: number;
};

const emptyForm = (): EmployeeForm => ({
  id: 0,
  fullName: '',
  email: '',
  jobTitle: '',
  baseSalary: 0,
  identityNumber: '',
  address: '',
  contractDate: '',
  bankName: '',
  bankAccountNumber: '',
});

const form = reactive<EmployeeForm>(emptyForm());

const rules = reactive<FormRules>({
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Định dạng email không hợp lệ', trigger: 'blur' },
  ],
  jobTitle: [
    {
      required: true,
      message: 'Vui lòng nhập vị trí/chức vụ',
      trigger: 'blur',
    },
  ],
  baseSalary: [{ required: true, message: 'Vui lòng nhập lương cơ bản', trigger: 'blur' }],
});

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('Thêm nhân viên');
const detailVisible = ref(false);
const detailLoading = ref(false);
const selectedEmployee = ref<EmployeeResponse | null>(null);

const pagination = reactive({ current: 1, size: 10, total: 0 });
const allEmployees = ref<EmployeeResponse[]>([]);

const searchForm = ref({ name: '', jobTitle: '', email: '' });
const columnChecks = ref([...columns]);

const uniqueJobTitles = computed(() =>
  Array.from(new Set(allEmployees.value.map((employee) => employee.jobTitle).filter(Boolean)))
);

const dynamicSearchItems = computed<SearchFormItem[]>(() =>
  searchItems.map((item) =>
    item.key === 'jobTitle'
      ? {
          ...item,
          props: {
            ...item.props,
            options: uniqueJobTitles.value.map((title) => ({
              label: title,
              value: title,
            })),
          },
        }
      : item
  )
);

const normalizedSearch = (value: string) => value.trim().toLocaleLowerCase('vi');

const filteredEmployees = computed(() => {
  const name = normalizedSearch(searchForm.value.name);
  const email = normalizedSearch(searchForm.value.email);

  return allEmployees.value.filter((employee) => {
    const matchesName = !name || normalizedSearch(employee.fullName).includes(name);
    const matchesJobTitle =
      !searchForm.value.jobTitle || employee.jobTitle === searchForm.value.jobTitle;
    const matchesEmail = !email || normalizedSearch(employee.email).includes(email);
    return matchesName && matchesJobTitle && matchesEmail;
  });
});

const paginatedEmployees = computed(() => {
  const start = (pagination.current - 1) * pagination.size;
  return filteredEmployees.value.slice(start, start + pagination.size);
});

const stats = computed(() => ({
  total: allEmployees.value.length,
  filtered: filteredEmployees.value.length,
  positions: uniqueJobTitles.value.length,
}));

watch(
  filteredEmployees,
  (employees) => {
    pagination.total = employees.length;
    const lastPage = Math.max(1, Math.ceil(employees.length / pagination.size));
    if (pagination.current > lastPage) pagination.current = lastPage;
  },
  { immediate: true }
);

const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '---';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    allEmployees.value = (await EmployeeApi.getList()) ?? [];
  } catch (error) {
    console.error('Failed to load employees:', error);
    ElMessage.error('Không thể tải danh sách nhân viên');
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  pagination.current = 1;
};

const resetForm = () => {
  formRef.value?.clearValidate();
  Object.assign(form, emptyForm());
};

const handleAdd = () => {
  resetForm();
  dialogVisible.value = true;
  dialogTitle.value = 'Thêm nhân viên';
  nextTick(() => formRef.value?.clearValidate());
};

const handleEdit = (row: EmployeeResponse) => {
  resetForm();
  Object.assign(form, row);
  dialogVisible.value = true;
  dialogTitle.value = 'Cập nhật nhân viên';
  nextTick(() => formRef.value?.clearValidate());
};

const employeePayload = (): EmployeeUpsertRequest => ({
  fullName: form.fullName.trim(),
  email: form.email.trim(),
  jobTitle: form.jobTitle.trim(),
  baseSalary: form.baseSalary,
  identityNumber: form.identityNumber.trim(),
  address: form.address.trim(),
  contractDate: form.contractDate,
  bankName: form.bankName.trim(),
  bankAccountNumber: form.bankAccountNumber.trim(),
});

const handleSubmit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const payload = employeePayload();
    if (form.id) {
      await EmployeeApi.update(form.id, payload);
      ElMessage.success('Cập nhật nhân viên thành công');
    } else {
      await EmployeeApi.create(payload);
      ElMessage.success('Thêm nhân viên thành công');
    }
    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('Failed to save employee:', error);
    ElMessage.error('Không thể lưu hồ sơ nhân viên. Vui lòng thử lại.');
  } finally {
    submitting.value = false;
  }
};

const handleView = async (row: EmployeeResponse) => {
  selectedEmployee.value = row;
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    selectedEmployee.value = await EmployeeApi.getById(row.id);
  } catch (error) {
    console.error('Failed to load employee detail:', error);
    ElMessage.error('Không thể tải chi tiết nhân viên');
  } finally {
    detailLoading.value = false;
  }
};

const handleDelete = async (row: EmployeeResponse) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa nhân viên "${row.fullName}"? Hành động này không thể hoàn tác.`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'error',
      }
    );
    await EmployeeApi.delete(row.id);
    ElMessage.success('Đã xóa nhân viên thành công');
    await loadData();
  } catch (error: unknown) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('Failed to delete employee:', error);
      ElMessage.error('Xóa nhân viên thất bại');
    }
  }
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
};
const handleCurrentChange = (page: number) => {
  pagination.current = page;
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
  color: var(--el-text-color-primary);
}

.employee-page__title,
.employee-cell__name,
.employee-detail__name,
.employee-value--strong {
  color: var(--el-text-color-primary);
}

.employee-detail__role {
  color: var(--el-text-color-secondary);
}

.employee-value {
  color: var(--el-text-color-regular);
}

.employee-value--accent {
  color: var(--el-color-primary);
}

.employee-detail__header {
  border-color: var(--el-border-color-lighter);
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
    color: var(--el-text-color-regular);
  }
}

@media (width <= 640px) {
  .hr-employee-container {
    padding: 12px;
  }

  .employee-page__header {
    align-items: stretch;
    flex-direction: column;
  }

  .employee-page__header :deep(.el-button) {
    width: 100%;
  }
}
</style>
