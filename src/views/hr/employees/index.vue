<template>
  <div class="hr-employees-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('menus.hr.employees') }}</span>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <ElIcon><Plus /></ElIcon> Thêm nhân viên
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
            <span class="font-medium">{{ formatCurrency(row.baseSalary) }}</span>
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
  import { EmployeeApi, type EmployeeResponse } from '@/infrastructure/api/employee'

  defineOptions({ name: 'HREmployees' })

  const loading = ref(false)
  const dialogVisible = ref(false)
  const submitting = ref(false)
  const dialogTitle = ref('Thêm nhân viên')
  const formRef = ref()

  const stats = reactive({ total: 0, active: 0, inactive: 0 })

  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const data = ref<EmployeeResponse[]>([])

  const formData = ref<Partial<EmployeeResponse>>({
    fullName: '',
    email: '',
    jobTitle: '',
    baseSalary: 0,
    identityNumber: '',
    address: '',
    contractDate: '',
    bankName: '',
    bankAccountNumber: '',
  })

  const searchForm = ref({ name: '', jobTitle: '', email: '' })
  const searchItems = ref([
    { key: 'name', label: 'Họ tên', type: 'input' },
    { key: 'jobTitle', label: 'Vị trí', type: 'input' },
    { key: 'email', label: 'Email', type: 'input' },
  ])

  const columns = ref<ColumnOption[]>([
    { label: 'Nhân viên', prop: 'fullName', minWidth: 200, useSlot: true },
    { label: 'Vị trí', prop: 'jobTitle', minWidth: 160, useSlot: true },
    { label: 'Email', prop: 'email', minWidth: 200 },
    { label: 'Lương cơ bản', prop: 'baseSalary', width: 150, align: 'right', useSlot: true },
    { label: 'Ngày vào làm', prop: 'contractDate', width: 130, align: 'center' },
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

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?'

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  const loadStats = async () => {
    stats.total = data.value.length
    stats.active = stats.total
    stats.inactive = 0
  }

  const loadData = async () => {
    loading.value = true
    try {
      const res = await EmployeeApi.getList()
      data.value = res || []
      pagination.total = data.value.length
      loadStats()
    } catch (error) {
      console.error('Failed to load employees:', error)
      ElMessage.error('Không thể tải danh sách nhân viên')
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
    dialogTitle.value = 'Thêm nhân viên'
  }
  const handleEdit = (row: EmployeeResponse) => {
    dialogVisible.value = true
    dialogTitle.value = 'Cập nhật nhân viên'
  }
  const handleView = (row: EmployeeResponse) => {
    ElMessage.info(`Xem chi tiết: ${row.fullName}`)
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
  .hr-employees-container {
    padding: 16px;
  }
</style>
