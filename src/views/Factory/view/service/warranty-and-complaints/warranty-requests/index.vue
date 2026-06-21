<template>
  <div class="p-4">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold">
          {{ $t('menus.service.warrantyAndComplaints.warrantyRequests') }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Danh sách yêu cầu bảo hành kỹ thuật. Chọn 1 hồ sơ để xem chi tiết.
        </p>
      </div>
    </div>

    <div class="mt-4">
      <ElTable :data="rows" border style="width: 100%" v-loading="loading">
        <ElTableColumn prop="claimNumber" label="Mã hồ sơ" min-width="160" />
        <ElTableColumn prop="vehiclePlate" label="Biển số" min-width="140" />
        <ElTableColumn prop="customerName" label="Khách hàng" min-width="180" />
        <ElTableColumn prop="statusText" label="Trạng thái" min-width="200" />
        <ElTableColumn label="Thao tác" min-width="140">
          <template #default="scope">
            <ElButton size="small" type="primary" @click="openDetail(scope.row.id)">
              Xem chi tiết
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div v-if="!loading && rows.length === 0" class="mt-4 text-sm text-slate-500">
        Chưa có dữ liệu.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const loading = ref(false)

  type Row = {
    id: number
    claimNumber: string
    vehiclePlate?: string
    customerName?: string
    statusText: string
  }

  const rows = ref<Row[]>([])

  function openDetail(id: number) {
    router.push({ name: 'ServiceWarrantyClaimDetail', params: { id } }).catch(() => null)
  }

  async function load() {
    loading.value = true
    try {
      // Mock until backend endpoints for list are implemented
      rows.value = [
        {
          id: 1,
          claimNumber: '#WAR-2026-001',
          vehiclePlate: '60-A1 555.55',
          customerName: 'Nguyễn Văn A',
          statusText: 'Received',
        },
      ]
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void load()
  })
</script>
