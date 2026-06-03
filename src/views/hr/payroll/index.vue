<template>
  <div class="hr-payroll-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('menus.hr.payroll') }}</span>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <ArtStatsCard
          title="Tổng quỹ lương"
          :count="stats.totalPayroll"
          icon="ri:money-dollar-circle-line"
          iconStyle="bg-primary"
        />
        <ArtStatsCard
          title="Đã thanh toán"
          :count="stats.paid"
          icon="ri:checkbox-circle-line"
          iconStyle="bg-success"
        />
        <ArtStatsCard
          title="Chờ thanh toán"
          :count="stats.pending"
          icon="ri:time-line"
          iconStyle="bg-warning"
        />
        <ArtStatsCard
          title="Nhân viên"
          :count="stats.employeeCount"
          icon="ri:group-line"
          iconStyle="bg-info"
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

      <ElCard class="flex-1 art-table-card mt-4">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadData">
          <template #left>
            <ElButton type="primary" v-ripple @click="handleAdd">
              <ElIcon><Plus /></ElIcon> Tạo bảng lương
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
          <template #employeeName="{ row }">
            <span>{{ row.employeeName || '-' }}</span>
          </template>
          <template #totalSalary="{ row }">
            <span class="font-medium">{{ formatCurrency(row.totalSalary) }}</span>
          </template>
          <template #status="{ row }">
            <ElTag :type="getStatusType(row.status)" size="small">{{
              getStatusLabel(row.status)
            }}</ElTag>
          </template>
          <template #operation="{ row }">
            <div class="flex gap-2 justify-center">
              <ArtButtonTable type="view" @click="handleView(row)" />
              <ElButton v-ripple size="small" type="primary" @click="handleEdit(row)">Sửa</ElButton>
            </div>
          </template>
        </ArtTable>
      </ElCard>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'

  defineOptions({ name: 'HRPayroll' })

  const loading = ref(false)
  const dialogVisible = ref(false)
  const submitting = ref(false)
  const dialogTitle = ref('Tạo bảng lương')
  const formRef = ref()

  const stats = reactive({ totalPayroll: 0, paid: 0, pending: 0, employeeCount: 0 })

  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const data = ref<any[]>([])

  const formData = ref({ month: '', employeeId: '', baseSalary: 0, bonus: 0, deduction: 0 })

  const searchForm = ref({ month: '', employeeName: '', status: '' })
  const searchItems = ref([
    { key: 'month', label: 'Tháng', type: 'input' },
    { key: 'employeeName', label: 'Nhân viên', type: 'input' },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      props: {
        options: [
          { label: 'Chờ thanh toán', value: 'Pending' },
          { label: 'Đã thanh toán', value: 'Paid' },
          { label: 'Đã hủy', value: 'Cancelled' },
        ],
      },
    },
  ])

  const columns = ref<ColumnOption[]>([
    { label: 'Nhân viên', prop: 'employeeName', minWidth: 180, useSlot: true },
    { label: 'Tháng', prop: 'month', width: 100, align: 'center' },
    { label: 'Lương cơ bản', prop: 'baseSalary', width: 140, align: 'right' },
    { label: 'Thưởng', prop: 'bonus', width: 120, align: 'right' },
    { label: 'Khấu trừ', prop: 'deduction', width: 120, align: 'right' },
    { label: 'Tổng lương', prop: 'totalSalary', width: 160, align: 'right', useSlot: true },
    { label: 'Trạng thái', prop: 'status', width: 130, align: 'center', useSlot: true },
    {
      label: 'Thao tác',
      prop: 'operation',
      width: 160,
      fixed: 'right' as const,
      align: 'center',
      useSlot: true,
    },
  ])
  const columnChecks = columns

  const getStatusType = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Cancelled':
        return 'danger'
      default:
        return 'info'
    }
  }
  const getStatusLabel = (status: string) =>
    ({ Paid: 'Đã thanh toán', Pending: 'Chờ thanh toán', Cancelled: 'Đã hủy' })[status] || status
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  const loadData = async () => {
    loading.value = true
    try {
      data.value = []
      pagination.total = 0
      stats.totalPayroll = 0
      stats.paid = 0
      stats.pending = 0
      stats.employeeCount = 0
    } catch (error) {
      console.error('Failed to load payroll:', error)
      ElMessage.error('Không thể tải danh sách bảng lương')
    } finally {
      loading.value = false
    }
  }

  const handleReset = () => {
    pagination.current = 1
    loadData()
  }
  const handleAdd = () => {
    dialogVisible.value = true
    dialogTitle.value = 'Tạo bảng lương'
  }
  const handleEdit = (row: any) => {
    dialogVisible.value = true
    dialogTitle.value = 'Cập nhật bảng lương'
  }
  const handleView = (row: any) => {
    ElMessage.info(`Xem chi tiết: ${row.month}`)
  }
  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadData()
  }
  const handleCurrentChange = (page: number) => {
    pagination.current = page
    loadData()
  }
  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .hr-payroll-container {
    padding: 16px;
  }
</style>
