<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        title="Tỉ lệ hoàn thành KPI"
        :count="85"
        unit="%"
        description="Trung bình toàn bộ hệ thống"
        icon="ri:line-chart-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Doanh số tháng này"
        :count="1.2"
        unit="Tỷ"
        description="Tổng doanh số toàn chi nhánh"
        icon="ri:money-cny-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Hoa hồng thực nhận"
        :count="45.5"
        unit="Tr"
        description="Trung bình mỗi nhân viên"
        icon="ri:hand-coin-line"
        iconStyle="bg-info"
      />
      <ArtStatsCard
        title="Đơn hàng thành công"
        :count="128"
        unit="Đơn"
        description="Số lượng giao dịch trong tháng"
        icon="ri:shopping-bag-line"
        iconStyle="bg-warning"
      />
    </div>

    <!-- KPI Rankings -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Leaderboard -->
      <ElCard class="art-table-card">
        <template #header>
          <div class="flex-cb">
            <h4 class="m-0">Bảng xếp hạng hiệu suất</h4>
            <ElSelect v-model="selectedMonth" size="small" class="!w-32">
              <ElOption label="Tháng này" :value="1" />
              <ElOption label="Tháng trước" :value="2" />
            </ElSelect>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <div
            v-for="(item, index) in rankings"
            :key="item.id"
            class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div
              class="w-8 h-8 flex-c font-bold text-lg"
              :class="index < 3 ? 'text-yellow-500' : 'text-gray-300'"
            >
              {{ index + 1 }}
            </div>
            <ElAvatar :size="40" :src="item.avatar">{{ item.name.charAt(0) }}</ElAvatar>
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="font-bold text-gray-800">{{ item.name }}</span>
                <span class="font-bold text-primary">{{ item.progress }}%</span>
              </div>
              <ElProgress
                :percentage="item.progress"
                :show-text="false"
                :stroke-width="8"
                :status="item.progress > 90 ? 'success' : ''"
              />
            </div>
          </div>
        </div>
      </ElCard>

      <!-- KPI Detail List -->
      <ElCard class="art-table-card">
        <template #header>
          <h4 class="m-0">Chi tiết định mức hoa hồng nhân viên</h4>
        </template>

        <ArtTable :loading="loading" :data="employeeKPIs" :columns="columns">
          <template #name="{ row }">
            <span class="font-bold text-gray-700">{{ row.name }}</span>
          </template>

          <template #performance="{ row }">
            <div class="flex flex-col gap-1">
              <div class="flex-cb text-[10px]">
                <span>{{ formatCurrency(row.current) }}</span>
                <span class="text-gray-400">/ {{ formatCurrency(row.target) }}</span>
              </div>
              <ElProgress
                :percentage="Math.min(100, Math.round((row.current / row.target) * 100))"
                :stroke-width="4"
              />
            </div>
          </template>

          <template #commission="{ row }">
            <span class="font-bold text-red-600">{{ formatCurrency(row.commission) }}</span>
          </template>
        </ArtTable>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  defineOptions({ name: 'HRKPI' })

  const loading = ref(false)
  const selectedMonth = ref(1)

  const rankings = ref([
    { id: 1, name: 'Nguyễn Văn A', progress: 115, avatar: '' },
    { id: 2, name: 'Trần Thị B', progress: 98, avatar: '' },
    { id: 3, name: 'Lê Văn C', progress: 92, avatar: '' },
    { id: 4, name: 'Phạm Minh D', progress: 85, avatar: '' },
    { id: 5, name: 'Hoàng Anh E', progress: 78, avatar: '' }
  ])

  const employeeKPIs = ref([
    { id: 1, name: 'Nguyễn Văn A', target: 500000000, current: 575000000, commission: 12500000 },
    { id: 2, name: 'Trần Thị B', target: 400000000, current: 392000000, commission: 8400000 },
    { id: 3, name: 'Lê Văn C', target: 400000000, current: 368000000, commission: 7200000 },
    { id: 4, name: 'Phạm Minh D', target: 300000000, current: 255000000, commission: 5100000 }
  ])

  const columns = [
    { label: 'Nhân viên', slot: 'name', useSlot: true },
    { label: 'Doanh số thực tế', slot: 'performance', width: 200, useSlot: true },
    { label: 'Hoa hồng nhận', slot: 'commission', width: 150, align: 'right', useSlot: true }
  ]

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' Tỷ'
    if (val >= 1000000) return (val / 1000000).toFixed(1) + ' Tr'
    return val.toLocaleString('vi-VN') + ' đ'
  }

  onMounted(() => {
    // Fetch real data
  })
</script>

<style scoped>
  .art-table-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 3%);
  }

  .bg-primary {
    background-color: #409eff;
  }

  .bg-success {
    background-color: #67c23a;
  }

  .bg-info {
    background-color: #36cfc9;
  }

  .bg-warning {
    background-color: #e6a23c;
  }

  .bg-danger {
    background-color: #f56c6c;
  }
</style>
