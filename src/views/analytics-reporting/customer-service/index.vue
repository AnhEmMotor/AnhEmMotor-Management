<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo chăm sóc khách hàng"
      description="Theo dõi đánh giá, khiếu nại, thời gian phản hồi và ghi chú nội bộ phục vụ CSKH."
      icon="ri:customer-service-2-line"
    >
      <template #actions>
        <ReportPeriodSwitcher
          v-model="currentPeriod"
          v-model:start-date="periodStart"
          v-model:end-date="periodEnd"
          @update:modelValue="onPeriodChange"
        />
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Đánh giá trung bình"
        :count="`${kpi.avgRating}/5`"
        description="Điểm hài lòng khách hàng"
        icon="ri:star-smile-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Khiếu nại mới"
        :count="kpi.newComplaints"
        description="Phát sinh trong kỳ"
        icon="ri:error-warning-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Thời gian xử lý TB"
        :count="`${kpi.avgResponseHours}h`"
        description="Trung bình đến khi phản hồi"
        icon="ri:timer-flash-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Đã xử lý"
        :count="kpi.resolvedCount"
        description="Khiếu nại đã hoàn tất"
        icon="ri:checkbox-circle-line"
        icon-style="bg-report-gray"
      />
    </div>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Phân bổ đánh giá sao</template>
        <ReportPlaceholder
          title="Chờ API CSKH"
          description="Biểu đồ sẽ thể hiện phân bổ đánh giá từ 1 đến 5 sao theo kỳ."
          endpoint="GET /api/v1/Statistics/customer-service-analytics"
        />
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Xu hướng khiếu nại</template>
        <ReportPlaceholder
          title="Chờ dữ liệu khiếu nại"
          description="Biểu đồ sẽ theo dõi số khiếu nại mới, đang xử lý và đã hoàn tất."
        />
      </ElCard>
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Khiếu nại gần đây</template>
      <ElTable
        :data="complaints"
        class="reporting-table"
        v-loading="loading"
        empty-text="Không có khiếu nại nào"
      >
        <ElTableColumn prop="ticketCode" label="Mã phiếu" width="140" />
        <ElTableColumn prop="customerName" label="Khách hàng" />
        <ElTableColumn prop="subject" label="Tiêu đề" />
        <ElTableColumn prop="rating" label="Đánh giá" width="120">
          <template #default="{ row }">
            <span class="text-yellow-500"
              >{{ '⭐'.repeat(row.rating) }}{{ '☆'.repeat(5 - row.rating) }}</span
            >
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Trạng thái" width="140">
          <template #default="{ row }">
            <ElTag :type="complaintStatusType(row.status)" size="small" effect="light" round>{{
              row.status
            }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="Ngày tạo" width="120">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="responseHours" label="Thời gian phản hồi" width="170">
          <template #default="{ row }">{{
            row.responseHours ? row.responseHours + 'h' : '-'
          }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElCard class="reporting-card mt-4">
      <template #header>Ghi chú nội bộ chỉ dành cho CSKH/Admin</template>
      <ReportPlaceholder
        title="Chờ API ghi chú nội bộ"
        description="Khu vực này sẽ ghi nhận đặc điểm, thói quen và lưu ý chăm sóc của từng khách hàng."
        endpoint="Backend API cho ghi chú đặc điểm và thói quen khách hàng"
        icon="ri:lock-line"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { statisticsApi } from '@/infrastructure/api/statistics.api'
  import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue'
  import ReportPageHeader from '../components/ReportPageHeader.vue'
  import ReportPeriodSwitcher from '../components/ReportPeriodSwitcher.vue'
  import ReportPlaceholder from '../components/ReportPlaceholder.vue'

  const currentPeriod = ref<'today' | 'month' | 'year' | 'custom'>('month')
  const periodStart = ref('')
  const periodEnd = ref('')

  const loading = ref(false)
  const kpi = ref({
    avgRating: 0,
    newComplaints: 0,
    avgResponseHours: 0,
    resolvedCount: 0,
  })
  const complaints = ref<
    Array<{
      id: number
      ticketCode: string
      customerName: string
      subject: string
      rating: number
      status: string
      createdAt: string
      responseHours?: number
    }>
  >([])

  function onPeriodChange() {
    // TODO: Pass period params to API when backend supports it
    // Expected: GET /api/v1/Statistics/customer-service-analytics?period=...&start=...&end=...
    loadData()
  }

  async function loadData() {
    loading.value = true
    try {
      const data = await statisticsApi.getCustomerServiceAnalytics()
      kpi.value = data.kpi
      complaints.value = data.complaints
    } finally {
      loading.value = false
    }
  }

  function complaintStatusType(
    status: string,
  ): 'primary' | 'success' | 'info' | 'danger' | 'warning' {
    const map: Record<string, 'primary' | 'success' | 'info' | 'danger' | 'warning'> = {
      Mới: 'danger',
      'Đang xử lý': 'warning',
      'Đã phản hồi': 'primary',
      'Đã đóng': 'success',
    }
    return map[status] || 'info'
  }

  function formatDate(iso: string) {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('vi-VN')
  }

  onMounted(() => {
    loadData()
  })
</script>
