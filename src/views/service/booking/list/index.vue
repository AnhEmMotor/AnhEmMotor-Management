<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng lịch hẹn"
        :count="statistics.total"
        icon="ri:calendar-todo-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Chờ xác nhận"
        :count="statistics.pending"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Đã xác nhận"
        :count="statistics.confirmed"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
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
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton
            v-auth="'Permissions.Bookings.Create'"
            type="primary"
            v-ripple
            @click="handleAdd"
          >
            <ElIcon><Plus /></ElIcon> Thêm lịch hẹn
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #date="{ row }">
          <span>{{ formatDateTime(row.preferredDate) }}</span>
        </template>

        <template #type="{ row }">
          <ElTag v-if="row.bookingType === 'TestDrive'" size="small" type="success">Lái thử</ElTag>
          <ElTag v-else-if="row.bookingType === 'Maintenance'" size="small" type="warning"
            >Bảo dưỡng</ElTag
          >
          <ElTag v-else size="small" type="info">Tư vấn</ElTag>
        </template>

        <template #status="{ row }">
          <ElTag v-if="row.status === 'Confirmed'" size="small" type="success">Đã xác nhận</ElTag>
          <ElTag v-else-if="row.status === 'Cancelled'" size="small" type="danger">Đã hủy</ElTag>
          <ElTag v-else size="small" type="warning">Chờ xác nhận</ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElButton
              v-if="row.status === 'Pending'"
              size="small"
              type="success"
              plain
              @click="handleConfirm(row)"
            >
              Xác nhận
            </ElButton>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="120px" class="mt-4">
        <ElFormItem label="Tên khách hàng" required>
          <ElInput v-model="formData.fullName" placeholder="Nhập tên..." />
        </ElFormItem>
        <ElFormItem label="Số điện thoại" required>
          <ElInput v-model="formData.phoneNumber" placeholder="Nhập SĐT..." />
        </ElFormItem>
        <ElFormItem label="Email">
          <ElInput v-model="formData.email" placeholder="Nhập Email..." />
        </ElFormItem>
        <ElFormItem label="Ngày giờ hẹn" required>
          <ElDatePicker
            v-model="formData.preferredDate"
            type="datetime"
            placeholder="Chọn ngày giờ"
            format="DD/MM/YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="Loại yêu cầu">
          <ElSelect v-model="formData.bookingType" class="w-full">
            <ElOption label="Tư vấn" value="Consult" />
            <ElOption label="Lái thử" value="TestDrive" />
            <ElOption label="Bảo dưỡng" value="Maintenance" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Xe lái thử" v-if="formData.bookingType === 'TestDrive'">
          <ElSelect
            v-model="formData.productVariantId"
            placeholder="Chọn xe demo..."
            clearable
            class="w-full"
          >
            <ElOption label="Winner X 2024 - Demo" :value="1" />
            <ElOption label="Exciter 155 - Demo" :value="2" />
            <ElOption label="Air Blade 160 - Demo" :value="3" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="formData.bookingType === 'TestDrive' ? 'Ghi chú nội bộ' : 'Ghi chú'">
          <ElInput
            v-model="formData.note"
            type="textarea"
            :rows="3"
            :placeholder="
              formData.bookingType === 'TestDrive'
                ? 'VD: Khách muốn thử khả năng tăng tốc...'
                : 'Ghi chú thêm...'
            "
          />
        </ElFormItem>

        <div
          v-if="formData.bookingType === 'TestDrive' && formData.status === 'Pending'"
          class="mt-2"
        >
          <div class="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p class="m-0 text-[11px] font-bold text-blue-700 leading-normal mb-1">
              Trạng thái Pipeline: <ElTag size="small" type="warning">Đang tư vấn</ElTag>
            </p>
            <p class="m-0 text-[10px] text-blue-700 leading-normal italic">
              Lưu ý: Xác nhận lịch hẹn sẽ chuyển Pipeline sang <strong>Đang lái thử</strong> và tự
              động gửi Email/SMS.
            </p>
          </div>
        </div>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm"> Xác nhận </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import { useBookingTable } from './hooks/useBookingTable'

  defineOptions({ name: 'ServiceBookingList' })

  const searchForm = ref({})

  const {
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData,
    statistics,

    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleConfirm,
    submitForm,
  } = useBookingTable()

  const formatDateTime = (val: string | null | undefined) => {
    if (!val) return ''
    return new Date(val).toLocaleString('vi-VN')
  }

  const searchItems = [
    {
      key: 'keyword',
      label: 'Tìm kiếm',
      type: 'input',
      props: { placeholder: 'Tên, SĐT khách hàng...' },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ xác nhận', value: 'Pending' },
        { label: 'Đã xác nhận', value: 'Confirmed' },
        { label: 'Đã hủy', value: 'Cancelled' },
      ],
    },
  ]
</script>

<style scoped>
  .art-table-card :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .art-table-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
  }
</style>
