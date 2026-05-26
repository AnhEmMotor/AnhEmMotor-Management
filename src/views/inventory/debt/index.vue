<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng nợ NCC"
        count="1.2 tỷ"
        description="Số tiền cần thanh toán cho các lô xe"
        icon="ri:money-cny-box-line"
        iconStyle="bg-danger"
      />
      <ArtStatsCard
        title="Hồ sơ treo Ngân hàng"
        :count="15"
        description="Đang chờ giải ngân trả góp"
        icon="ri:timer-flash-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Giá trị cam kết"
        count="450 triệu"
        description="Tiền đang kẹt tại Bank"
        icon="ri:safe-2-line"
        iconStyle="bg-primary"
      />
    </div>

    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center gap-4">
          <h4 class="m-0">Quản lý Công nợ & Cam kết</h4>
          <ElRadioGroup v-model="activeTab" size="small">
            <ElRadioButton label="suppliers">Công nợ NCC</ElRadioButton>
            <ElRadioButton label="banks">Đối tác Ngân hàng</ElRadioButton>
          </ElRadioGroup>
        </div>
      </template>

      <div v-if="activeTab === 'suppliers'">
        <ArtTable :data="supplierDebts" :columns="supplierColumns">
          <template #balance="{ row }">
            <span class="font-bold" :class="row.balance > 0 ? 'text-red-500' : 'text-gray-400'">
              {{ row.balance.toLocaleString() }} VNĐ
            </span>
          </template>
          <template #status="{ row }">
            <ElTag :type="row.status === 'Overdue' ? 'danger' : 'warning'" size="small">
              {{ row.status === 'Overdue' ? 'Quá hạn' : 'Đang treo' }}
            </ElTag>
          </template>
        </ArtTable>
      </div>

      <div v-else>
        <ArtTable :data="bankInstallments" :columns="bankColumns">
          <template #daysPending="{ row }">
            <span :class="row.daysPending > 7 ? 'text-danger font-bold' : ''">
              {{ row.daysPending }} ngày
            </span>
          </template>
          <template #operation="{ row }">
            <ElButton type="primary" link size="small" @click="handleContact(row)">
              Liên hệ đầu mối (Mục 7.1)
            </ElButton>
          </template>
        </ArtTable>
        <div
          class="mt-4 p-4 bg-info/5 rounded border border-info/10 text-xs text-info flex items-center gap-2"
        >
          <ElIcon><InfoFilled /></ElIcon>
          <span
            >Nếu ngân hàng chậm giải ngân (> 7 ngày), Admin cần tra cứu đầu mối liên hệ tại mục 7.1
            để thúc đẩy hồ sơ.</span
          >
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { InfoFilled } from '@element-plus/icons-vue'

  defineOptions({ name: 'InventoryDebt' })

  const activeTab = ref('suppliers')

  const supplierDebts = [
    {
      name: 'Honda Việt Nam',
      total: 5000000000,
      paid: 3500000000,
      balance: 1500000000,
      deadline: '20/05/2026',
      status: 'Pending'
    },
    {
      name: 'Yamaha Motor',
      total: 1200000000,
      paid: 1200000000,
      balance: 0,
      deadline: '-',
      status: 'Cleared'
    },
    {
      name: 'Mạnh Quang Phụ Tùng',
      total: 150000000,
      paid: 50000000,
      balance: 100000000,
      deadline: '10/05/2026',
      status: 'Overdue'
    }
  ]

  const bankInstallments = [
    {
      customer: 'Nguyễn Văn A',
      bank: 'FE Credit',
      amount: 25000000,
      daysPending: 5,
      contact: 'Mr. Bình (0901234567)'
    },
    {
      customer: 'Trần Thị B',
      bank: 'Home Credit',
      amount: 18000000,
      daysPending: 2,
      contact: 'Ms. Lan (0987654321)'
    },
    {
      customer: 'Lê Văn C',
      bank: 'HD Saison',
      amount: 45000000,
      daysPending: 12,
      contact: 'Mr. Hùng (0912345678)'
    }
  ]

  const supplierColumns = [
    { label: 'Nhà cung cấp', prop: 'name', minWidth: 200 },
    {
      label: 'Tổng nhập',
      prop: 'total',
      width: 150,
      align: 'right',
      formatter: (row: any) => row.total?.toLocaleString()
    },
    { label: 'Còn nợ', prop: 'balance', width: 180, useSlot: true, align: 'right' },
    { label: 'Hạn thanh toán', prop: 'deadline', width: 140, align: 'center' },
    { label: 'Trạng thái', prop: 'status', width: 130, useSlot: true, align: 'center' }
  ]

  const bankColumns = [
    { label: 'Khách hàng', prop: 'customer', width: 160 },
    { label: 'Ngân hàng', prop: 'bank', width: 130 },
    {
      label: 'Số tiền vay',
      prop: 'amount',
      width: 150,
      align: 'right',
      formatter: (row: any) => row.amount?.toLocaleString()
    },
    { label: 'Thời gian treo', prop: 'daysPending', width: 140, useSlot: true, align: 'center' },
    { label: 'Đầu mối liên hệ', prop: 'contact', minWidth: 200 },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 180,
      fixed: 'right' as const
    }
  ]

  const handleContact = (row: any) => {
    console.log('Contact', row)
  }
</script>
