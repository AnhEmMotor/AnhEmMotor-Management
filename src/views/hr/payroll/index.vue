<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        title="Tổng quỹ lương (Tạm tính)"
        :count="totalPayroll"
        unit="VNĐ"
        description="Tổng thu nhập dự kiến tháng này"
        icon="ri:money-dollar-circle-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Hoa hồng Chờ xử lý"
        :count="pendingCommission"
        unit="VNĐ"
        description="Từ các đơn hàng đang giao/xử lý"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Hoa hồng Đã chốt"
        :count="confirmedCommission"
        unit="VNĐ"
        description="Từ các đơn hàng đã hoàn tất"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Nhân viên xuất sắc"
        :count="5"
        unit="Người"
        description="Đạt trên 100% KPI tháng"
        icon="ri:vip-crown-line"
        iconStyle="bg-danger"
      />
    </div>

    <ElCard class="filter-card">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600">Tháng:</span>
            <ElDatePicker
              v-model="selectedMonth"
              type="month"
              placeholder="Chọn tháng"
              class="!w-40"
              @change="fetchData"
            />
          </div>
          <ElButton type="info" plain @click="fetchData">
            <ElIcon><Refresh /></ElIcon> Làm mới dữ liệu
          </ElButton>
        </div>
        <div class="flex items-center gap-3">
          <ElButton type="success" size="large" v-ripple @click="handleApproveAll">
            <ElIcon class="mr-1"><Wallet /></ElIcon> Duyệt chi lương & Hoa hồng
          </ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard class="art-table-card">
      <template #header>
        <div class="flex items-center gap-2">
          <h4 class="m-0">Bảng tổng hợp thu nhập - Tháng {{ currentMonthLabel }}</h4>
        </div>
      </template>

      <ArtTable :loading="loading" :data="payrollData" :columns="columns">
        <template #fullName="{ row }">
          <div class="flex items-center gap-3">
            <ElAvatar :size="32" :src="row.avatarUrl">{{ row.fullName.charAt(0) }}</ElAvatar>
            <div class="flex flex-col">
              <span class="font-bold text-gray-800">{{ row.fullName }}</span>
              <span class="text-[10px] text-gray-400">{{ row.employeeCode }}</span>
            </div>
          </div>
        </template>

        <template #baseSalary="{ row }">
          <span class="font-medium text-gray-700">{{ formatCurrency(row.baseSalary) }}</span>
        </template>

        <template #pendingCommission="{ row }">
          <span class="text-gray-400">{{ formatCurrency(row.pendingCommission) }}</span>
        </template>

        <template #confirmedCommission="{ row }">
          <span class="font-bold text-blue-600">{{ formatCurrency(row.confirmedCommission) }}</span>
        </template>

        <template #totalIncome="{ row }">
          <div class="flex flex-col items-end">
            <span class="font-bold text-red-600 text-lg">{{
              formatCurrency(row.baseSalary + row.confirmedCommission)
            }}</span>
            <span class="text-[10px] text-gray-400 italic">Dự kiến thực nhận</span>
          </div>
        </template>

        <template #operation="{ row }">
          <ElButton type="primary" link @click="showDetail(row)">Chi tiết</ElButton>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { Refresh, Wallet } from '@element-plus/icons-vue'
  import { useHRStore } from '@/store/modules/hr'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'HRPayroll' })

  const hrStore = useHRStore()
  const loading = computed(() => hrStore.loading)
  const selectedMonth = ref(new Date())

  const payrollData = ref([])
  const totalPayroll = ref(0)
  const pendingCommission = ref(0)
  const confirmedCommission = ref(0)

  const currentMonthLabel = computed(() => {
    return selectedMonth.value.getMonth() + 1 + '/' + selectedMonth.value.getFullYear()
  })

  const columns = [
    { label: 'Nhân viên', prop: 'fullName', slot: 'fullName', useSlot: true },
    { label: 'Lương cơ bản', slot: 'baseSalary', width: 150, useSlot: true },
    { label: 'Hoa hồng Tạm tính', slot: 'pendingCommission', width: 150, useSlot: true },
    { label: 'Hoa hồng Đã chốt', slot: 'confirmedCommission', width: 150, useSlot: true },
    { label: 'Tổng thu nhập', slot: 'totalIncome', width: 200, align: 'right', useSlot: true },
    { label: 'Thao tác', slot: 'operation', width: 100, align: 'center', useSlot: true }
  ]

  const fetchData = async () => {
    const month = selectedMonth.value.getMonth() + 1
    const year = selectedMonth.value.getFullYear()
    try {
      const res = await hrStore.fetchPayrollSummary(month, year)
      payrollData.value = res.items
      totalPayroll.value = res.totalPayroll
      pendingCommission.value = res.totalPending
      confirmedCommission.value = res.totalConfirmed
    } catch (_err: any) {
      ElMessage.error('Lỗi khi tải dữ liệu bảng lương')
    }
  }

  const handleApproveAll = () => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn Duyệt chi lương cho toàn bộ nhân viên trong tháng ${currentMonthLabel.value}? Sau khi duyệt, trạng thái hoa hồng sẽ chuyển sang 'Đã chi trả' và không thể hoàn tác.`,
      'Xác nhận Duyệt chi',
      {
        confirmButtonText: 'Đồng ý Duyệt chi',
        cancelButtonText: 'Hủy',
        type: 'success',
        confirmButtonClass: 'bg-success !border-success'
      }
    ).then(async () => {
      try {
        await hrStore.approvePayroll({
          month: selectedMonth.value.getMonth() + 1,
          year: selectedMonth.value.getFullYear()
        })
        ElMessage.success('Đã duyệt chi lương thành công!')
        fetchData()
      } catch (_err: any) {
        ElMessage.error(_err.message || 'Lỗi khi duyệt chi')
      }
    })
  }

  const showDetail = (row: any) => {
    console.log('Detail:', row)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped>
  .filter-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 3%);
  }

  .art-table-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 3%);
  }

  .bg-primary {
    background-color: #409eff;
  }

  .bg-warning {
    background-color: #e6a23c;
  }

  .bg-success {
    background-color: #67c23a;
  }

  .bg-danger {
    background-color: #f56c6c;
  }
</style>
