<template>
  <div class="resp-page flex flex-col gap-4 pb-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          {{ $t('WorkshopAppointments') }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý lịch hẹn sửa chữa / bảo hành: tạo, xác nhận, hủy lịch.
        </p>
      </div>

      <div class="flex gap-2">
        <ElButton :icon="Refresh" type="primary" :loading="loading" @click="refreshData">
          Làm mới
        </ElButton>
        <ElButton type="success" :icon="Plus" :loading="loading" @click="openCreateDialog">
          Tạo lịch hẹn
        </ElButton>
      </div>
    </div>

    <div class="resp-stats-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        icon-style="bg-primary"
        :title="'Tổng'"
        :count="counts.total"
        description="Tất cả lịch hẹn"
        icon="ri:calendar-line"
      />
      <ArtStatsCard
        icon-style="bg-warning"
        :title="'Đang chờ xác nhận'"
        :count="counts.pending"
        description="Chờ sales xác nhận"
        icon="ri:hourglass-2-line"
      />
      <ArtStatsCard
        icon-style="bg-success"
        :title="'Đã xác nhận'"
        :count="counts.confirmed"
        description="Khách chốt hẹn"
        icon="ri:checkbox-circle-line"
      />
      <ArtStatsCard
        icon-style="bg-danger"
        :title="'Đã hủy'"
        :count="counts.cancelled"
        description="Hủy / không đến"
        icon="ri:close-circle-line"
      />
    </div>

    <ArtSearchBar
      :items="searchItems"
      :label-width="140"
      :span="6"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElTag type="info" class="mr-2"> Total: {{ pagination?.total ?? 0 }} </ElTag>
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
        <template #createdAt="{ row }">
          {{ row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') : '' }}
        </template>
        <template #appointmentAt="{ row }">
          {{
            row.appointmentAt
              ? dayjs(row.appointmentAt).format('DD/MM/YYYY HH:mm')
              : row.preferredDate
                ? dayjs(row.preferredDate).format('DD/MM/YYYY')
                : '-'
          }}
        </template>
        <template #status="{ row }">
          <ElTag :type="statusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </ElTag>
        </template>
        <template #serviceType="{ row }">
          <ElButton
            v-if="row.serviceType === 'RepairService'"
            link
            type="primary"
            @click="goToRepair(row)"
          >
            Sửa chữa
          </ElButton>
          <ElButton
            v-else-if="row.serviceType === 'WarrantyService'"
            link
            type="warning"
            @click="goToWarranty(row)"
          >
            Bảo hành
          </ElButton>
          <span v-else class="text-slate-400">-</span>
        </template>
        <template #operation="{ row }">
          <div class="flex gap-1 justify-center">
            <ElTooltip v-if="row.status === 'Pending'" content="Xác nhận" placement="top">
              <ElButton link type="success" :icon="Check" @click="openConfirmDialog(row)" />
            </ElTooltip>
            <ElTooltip
              v-if="row.status === 'Pending' || row.status === 'Confirmed'"
              content="Hủy"
              placement="top"
            >
              <ElButton link type="danger" :icon="CloseBold" @click="openCancelDialog(row)" />
            </ElTooltip>
            <ElTooltip v-if="row.status === 'Confirmed'" content="Tạo phiếu" placement="top">
              <ElButton link type="primary" :icon="Edit" @click="handleCreateOrder(row)" />
            </ElTooltip>
            <ElTooltip content="Chi tiết" placement="top">
              <ElButton link type="info" :icon="Document" @click="openDetail(row)" />
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="formDialogVisible"
      :title="
        formMode === 'detail' ? 'Chi tiết lịch hẹn' : isEdit ? 'Sửa lịch hẹn' : 'Tạo lịch hẹn'
      "
      width="640px"
      class="premium-dialog resp-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="form"
        label-width="140px"
        class="space-y-4"
        :disabled="formMode === 'detail' || submitting"
      >
        <div class="resp-stats-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Họ tên <span class="text-red-500">*</span>
            </label>
            <ElInput v-model="form.fullName" placeholder="Nhập họ tên khách hàng" />
          </div>
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Số điện thoại <span class="text-red-500">*</span>
            </label>
            <ElInput v-model="form.phone" placeholder="Nhập SĐT" />
          </div>
        </div>

        <div class="resp-stats-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Email
            </label>
            <ElInput v-model="form.email" placeholder="Nhập email (tuỳ chọn)" />
          </div>
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Loại dịch vụ
            </label>
            <ElSelect
              v-model="form.serviceType"
              placeholder="Chọn loại dịch vụ"
              class="w-full"
              clearable
            >
              <ElOption label="Sửa chữa" value="RepairService" />
              <ElOption label="Bảo hành" value="WarrantyService" />
            </ElSelect>
          </div>
        </div>

        <div class="resp-stats-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Ngày hẹn
            </label>
            <ElDatePicker
              v-model="form.preferredDate"
              type="date"
              placeholder="Chọn ngày"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Khung giờ
            </label>
            <ElInput v-model="form.preferredTimeSlot" placeholder="VD: 08:00 - 10:00" />
          </div>
        </div>

        <div class="resp-stats-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Vị trí đặt lịch
            </label>
            <ElInput v-model="form.showroom" placeholder="Xưởng / chi nhánh" />
          </div>
          <div>
            <label
              class="el-form-item__label text-xs! font-semibold! text-gray-700! h-auto! leading-none! pb-1.5! mb-0! block"
            >
              Ghi chú
            </label>
            <ElInput v-model="form.notes" placeholder="Ghi chú thêm" type="textarea" :rows="2" />
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton @click="formDialogVisible = false" :disabled="submitting"> Đóng </ElButton>
          <ElButton
            v-if="formMode !== 'detail'"
            type="primary"
            :loading="submitting"
            @click="submitForm"
            class="px-8"
          >
            {{ isEdit ? 'Cập nhật' : 'Tạo' }}
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="confirmDialogVisible"
      title="Xác nhận lịch hẹn"
      width="420px"
      class="premium-dialog resp-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <p class="text-sm text-slate-600 mb-4">
        Xác nhận khách hàng
        <span class="font-semibold">{{ confirmRow.fullName }}</span> sẽ đến đúng hẹn?
      </p>
      <ElForm label-width="100px">
        <ElFormItem label="Thời gian đến">
          <ElDatePicker
            v-model="confirmForm.appointmentAt"
            type="datetime"
            placeholder="Chọn thời gian (tuỳ chọn)"
            class="w-full"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3">
          <ElButton @click="confirmDialogVisible = false" :disabled="submitting"> Đóng </ElButton>
          <ElButton type="success" :loading="submitting" @click="submitConfirm">
            Xác nhận
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="cancelDialogVisible"
      title="Hủy lịch hẹn"
      width="420px"
      class="premium-dialog resp-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <p class="text-sm text-slate-600 mb-4">Lý do hủy lịch (khách không đến / no-show):</p>
      <ElInput
        v-model="cancelForm.cancelReason"
        placeholder="Nhập lý do hủy"
        type="textarea"
        :rows="3"
      />

      <template #footer>
        <div class="flex justify-end gap-3">
          <ElButton @click="cancelDialogVisible = false" :disabled="submitting"> Đóng </ElButton>
          <ElButton type="danger" :loading="submitting" @click="submitCancel"> Hủy lịch </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import { Refresh, Plus, Check, CloseBold, Document, Edit } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import type { BookingAppointment } from '@/domain/bookingAppointments/types';
import { BookingAppointmentApi } from '@/api/booking-appointment.api';

defineOptions({ name: 'BookingAppointmentList' });

const router = useRouter();
const loading = ref(false);
const tableRef = ref();
const data = ref<BookingAppointment[]>([]);
const allValidItems = ref<BookingAppointment[]>([]);
const searchParams = ref<any>({});
const columnChecks = ref<any[]>([]);
const pagination = ref<any>({ current: 1, size: 10, total: 0 });

const formMode = ref<'create' | 'edit' | 'detail'>('create');

const columns = computed(() => {
  return [
    { prop: 'id', label: 'ID', width: 80, align: 'center' },
    { prop: 'fullName', label: 'Họ tên', minWidth: 140 },
    { prop: 'phone', label: 'SĐT', minWidth: 120 },
    {
      prop: 'serviceType',
      label: 'Loại dịch vụ',
      minWidth: 130,
      useSlot: true,
      slot: 'serviceType',
    },
    {
      prop: 'appointmentAt',
      label: 'Ngày / giờ hẹn',
      minWidth: 160,
      useSlot: true,
      slot: 'appointmentAt',
    },
    {
      prop: 'status',
      label: 'Trạng thái',
      minWidth: 130,
      useSlot: true,
      slot: 'status',
    },
    {
      prop: 'confirmedByName',
      label: 'Xác nhận bởi',
      minWidth: 140,
    },
    {
      prop: 'createdAt',
      label: 'Tạo lúc',
      minWidth: 150,
      useSlot: true,
      slot: 'createdAt',
    },
    {
      prop: 'operation',
      label: 'Hành động',
      width: 160,
      align: 'center',
      fixed: 'right' as const,
      useSlot: true,
      slot: 'operation',
    },
  ];
});

const counts = computed(() => {
  const safe = allValidItems.value || [];
  return {
    total: safe.length,
    pending: safe.filter((x) => x.status === 'Pending').length,
    confirmed: safe.filter((x) => x.status === 'Confirmed').length,
    cancelled: safe.filter((x) => x.status === 'Cancelled').length,
  };
});

const statusTagType = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'success';
    case 'Cancelled':
      return 'danger';
    case 'Pending':
      return 'warning';
    default:
      return 'info';
  }
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    Pending: 'Đang chờ xác nhận',
    Confirmed: 'Xác nhận',
    Cancelled: 'Đã hủy',
  };
  return map[status] || status;
};

const searchItems = [
  {
    key: 'keyword',
    label: 'Từ khóa',
    prop: 'keyword',
    type: 'text',
    placeholder: 'Tên / SĐT',
  },
  {
    key: 'serviceType',
    label: 'Loại dịch vụ',
    prop: 'serviceType',
    type: 'select',
    options: [
      { label: 'Sửa chữa', value: 'RepairService' },
      { label: 'Bảo hành', value: 'WarrantyService' },
    ],
  },
  {
    key: 'status',
    label: 'Trạng thái',
    prop: 'status',
    type: 'select',
    options: [
      { label: 'Đang chờ xác nhận', value: 'Pending' },
      { label: 'Đã xác nhận', value: 'Confirmed' },
      { label: 'Đã hủy', value: 'Cancelled' },
    ],
  },
];

const applyLocalFilterAndPagination = () => {
  let filtered = allValidItems.value;

  if (searchParams.value.keyword) {
    const q = searchParams.value.keyword.toLowerCase();
    filtered = filtered.filter(
      (x) =>
        (x.fullName || "").toLowerCase().includes(q) ||
        (x.phone || "").toLowerCase().includes(q),
    );
  }
  if (searchParams.value.serviceType) {
    filtered = filtered.filter(
      (x) => x.serviceType === searchParams.value.serviceType,
    );
  }
  if (searchParams.value.status) {
    filtered = filtered.filter((x) => x.status === searchParams.value.status);
  }

  pagination.value.total = filtered.length;
  const start = (pagination.value.current - 1) * pagination.value.size;
  const end = start + pagination.value.size;
  data.value = filtered.slice(start, end);
};

const handleSearch = (params: any) => {
  searchParams.value = params || {};
  pagination.value.current = 1;
  applyLocalFilterAndPagination();
};

const handleReset = () => {
  searchParams.value = {};
  pagination.value.current = 1;
  applyLocalFilterAndPagination();
};

const handleSizeChange = (size: number) => {
  pagination.value.size = size;
  pagination.value.current = 1;
  applyLocalFilterAndPagination();
};

const handleCurrentChange = (current: number) => {
  pagination.value.current = current;
  applyLocalFilterAndPagination();
};

const refreshData = async () => {
  await fetchData();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await BookingAppointmentApi.getList({
      Page: 1,
      PageSize: 5000,
      Sorts: "createdAt desc",
    });
    allValidItems.value = res.items || [];
    applyLocalFilterAndPagination();
  } catch (err: any) {
    allValidItems.value = [];
    data.value = [];
    pagination.value.total = 0;
    ElMessage.error(err?.message || 'Không thể tải danh sách lịch hẹn');
  } finally {
    loading.value = false;
  }
};

const formDialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const submitting = ref(false);
const form = ref({
  fullName: '',
  phone: '',
  email: '',
  serviceType: '',
  preferredDate: '',
  preferredTimeSlot: '',
  showroom: '',
  notes: '',
});

const resetForm = () => {
  form.value = {
    fullName: '',
    phone: '',
    email: '',
    serviceType: '',
    preferredDate: '',
    preferredTimeSlot: '',
    showroom: '',
    notes: '',
  };
};

const openDetail = async (row: BookingAppointment) => {
  formMode.value = 'detail';
  isEdit.value = false;
  editId.value = row.id;
  form.value = {
    fullName: row.fullName,
    phone: row.phone,
    email: row.email || '',
    serviceType: row.serviceType || '',
    preferredDate: row.preferredDate || '',
    preferredTimeSlot: row.preferredTimeSlot || '',
    showroom: row.showroom || '',
    notes: row.notes || '',
  };
  formDialogVisible.value = true;
};

const openCreateDialog = () => {
  formMode.value = 'create';
  isEdit.value = false;
  editId.value = null;
  resetForm();
  formDialogVisible.value = true;
};

const openEditDialog = (row: BookingAppointment) => {
  formMode.value = 'edit';
  isEdit.value = true;
  editId.value = row.id;
  form.value = {
    fullName: row.fullName,
    phone: row.phone,
    email: row.email || '',
    serviceType: row.serviceType || '',
    preferredDate: row.preferredDate || '',
    preferredTimeSlot: row.preferredTimeSlot || '',
    showroom: row.showroom || '',
    notes: row.notes || '',
  };
  formDialogVisible.value = true;
};

const submitForm = async () => {
  if (!form.value.fullName.trim() || !form.value.phone.trim()) {
    ElMessage.warning('Vui lòng nhập họ tên và số điện thoại');
    return;
  }
  submitting.value = true;
  try {
    if (isEdit.value && editId.value) {
      await BookingAppointmentApi.update(editId.value, {
        fullName: form.value.fullName,
        phone: form.value.phone,
        email: form.value.email || undefined,
        serviceType: form.value.serviceType || undefined,
        preferredDate: form.value.preferredDate || undefined,
        preferredTimeSlot: form.value.preferredTimeSlot || undefined,
        showroom: form.value.showroom || undefined,
        notes: form.value.notes || undefined,
      });
      ElMessage.success('Cập nhật lịch hẹn thành công');
    } else {
      await BookingAppointmentApi.create({
        fullName: form.value.fullName,
        phone: form.value.phone,
        email: form.value.email || undefined,
        serviceType: form.value.serviceType || undefined,
        preferredDate: form.value.preferredDate || undefined,
        preferredTimeSlot: form.value.preferredTimeSlot || undefined,
        showroom: form.value.showroom || undefined,
        notes: form.value.notes || undefined,
      });
      ElMessage.success('Tạo lịch hẹn thành công');
    }
    formDialogVisible.value = false;
    await refreshData();
  } catch (err: any) {
    ElMessage.error(err?.message || 'Thao tác thất bại');
  } finally {
    submitting.value = false;
  }
};

const confirmDialogVisible = ref(false);
const confirmRow = ref<BookingAppointment>({} as BookingAppointment);
const confirmForm = ref({ appointmentAt: '' as string | null });

const openConfirmDialog = (row: BookingAppointment) => {
  confirmRow.value = row;
  confirmForm.value.appointmentAt = row.appointmentAt || null;
  confirmDialogVisible.value = true;
};

const submitConfirm = async () => {
  submitting.value = true;
  try {
    await BookingAppointmentApi.confirm(
      confirmRow.value.id,
      confirmForm.value.appointmentAt || undefined
    );
    ElMessage.success('Xác nhận lịch hẹn thành công');
    confirmDialogVisible.value = false;
    await refreshData();
  } catch (err: any) {
    ElMessage.error(err?.message || 'Xác nhận thất bại');
  } finally {
    submitting.value = false;
  }
};

const cancelDialogVisible = ref(false);
const cancelRow = ref<BookingAppointment>({} as BookingAppointment);
const cancelForm = ref({ cancelReason: '' });

const openCancelDialog = (row: BookingAppointment) => {
  cancelRow.value = row;
  cancelForm.value.cancelReason = '';
  cancelDialogVisible.value = true;
};

const submitCancel = async () => {
  submitting.value = true;
  try {
    await BookingAppointmentApi.cancel(
      cancelRow.value.id,
      cancelForm.value.cancelReason || undefined
    );
    ElMessage.success('Đã hủy lịch hẹn');
    cancelDialogVisible.value = false;
    await refreshData();
  } catch (err: any) {
    ElMessage.error(err?.message || 'Hủy lịch thất bại');
  } finally {
    submitting.value = false;
  }
};

const handleCreateOrder = (row: BookingAppointment) => {
  if (row.serviceType === 'WarrantyService') {
    router.push({
      path: '/factory/workshop/warranty',
      query: { phone: row.phone, action: 'create' },
    });
  } else {
    router.push({
      path: '/factory/workshop/repair',
      query: { phone: row.phone, action: 'create' },
    });
  }
};

const goToRepair = (row: BookingAppointment) => {
  router.push({
    path: '/factory/workshop/repair-history/create',
    query: { phone: row.phone, serviceType: 'RepairService' },
  });
};

const goToWarranty = (row: BookingAppointment) => {
  router.push({
    path: '/factory/workshop/warranty',
    query: { phone: row.phone, action: 'create' },
  });
};

refreshData();
</script>

<style scoped>
.art-table-card :deep(.el-table__body-wrapper) {
  overflow-y: auto !important;
}
</style>
