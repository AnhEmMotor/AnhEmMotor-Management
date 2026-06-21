<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold">{{
          $t('menus.service.administrative.registrationPlate.title')
        }}</h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý hồ sơ đăng ký biển số theo workflow: Chuẩn bị hồ sơ → Nộp thuế trước bạ → Bấm biển
          số → Đang chờ cà-vet/giấy hẹn → Nhận cà-vet/hoàn tất.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <ElButton :icon="Refresh" type="primary" :loading="loading" @click="refreshData">
          Làm mới
        </ElButton>
      </div>
    </div>

    <ElCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
            Mã hồ sơ / SĐT
          </label>
          <ElInput
            v-model="query"
            placeholder="Nhập mã hồ sơ hoặc SĐT"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <div>
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
            Trạng thái workflow
          </label>
          <ElSelect v-model="status" placeholder="Chọn trạng thái" class="w-full" clearable>
            <ElOption v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </ElSelect>
        </div>
        <div class="flex flex-col justify-end">
          <div class="flex items-center gap-3">
            <ElButton
              type="primary"
              :disabled="!query.trim() && !status"
              :loading="loading"
              @click="handleSearch"
            >
              Tìm kiếm
            </ElButton>
            <ElButton :disabled="loading" @click="handleReset"> Đặt lại </ElButton>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <ArtTable
          row-key="id"
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <ElTag :type="statusTagType(row.workflowStatus)" effect="dark">{{
              row.workflowStatus
            }}</ElTag>
          </template>
          <template #operation="{ row }">
            <div class="flex gap-2 justify-center flex-wrap">
              <ArtButtonTable type="edit" @click="openDetail(row.id)" />
            </div>
          </template>
        </ArtTable>
      </div>
    </ElCard>

    <div v-if="!loading && data.length === 0" class="text-sm text-slate-500">
      Không có dữ liệu. Thử tìm kiếm với mã hồ sơ hoặc SĐT.
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { Refresh } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'

  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  // TODO: replace with real API when backend endpoints are available
  type PlateRegistration = {
    id: number
    code: string
    phoneNumber: string
    customerName?: string
    vinNumber?: string
    licensePlate?: string
    workshopAssignee?: string
    workflowStatus: string
    createdAt?: string
  }

  const router = useRouter()

  defineOptions({ name: 'ServiceAdministrativeRegistrationPlateList' })

  const loading = ref(false)

  const query = ref('')
  const status = ref<string | undefined>(undefined)

  const statusOptions = ['Preparation', 'PreTaxPaid', 'PlateBilled', 'WaitingCavet', 'Completed']

  const pagination = ref({ current: 1, size: 10, total: 0 })

  const data = ref<PlateRegistration[]>([])

  const columns = computed(() => {
    return [
      { prop: 'code', label: 'Mã hồ sơ', minWidth: 180 },
      { prop: 'customerName', label: 'Khách', minWidth: 180 },
      { prop: 'phoneNumber', label: 'SĐT', width: 140 },
      { prop: 'licensePlate', label: 'Biển số', minWidth: 150 },
      { prop: 'vinNumber', label: 'VIN / Số khung', minWidth: 180 },
      { prop: 'workflowStatus', label: 'Trạng thái', width: 180, useSlot: true, slot: 'status' },
      { prop: 'createdAt', label: 'Ngày tạo', minWidth: 180 },
      {
        prop: 'operation',
        label: 'Hành động',
        width: 130,
        align: 'center',
        fixed: 'right' as const,
        useSlot: true,
        slot: 'operation',
      },
    ]
  })

  const statusTagType = (workflowStatus: string) => {
    switch (workflowStatus) {
      case 'Completed':
        return 'success'
      case 'WaitingCavet':
        return 'warning'
      case 'PlateBilled':
        return 'info'
      case 'PreTaxPaid':
        return 'primary'
      case 'Preparation':
        return 'danger'
      default:
        return 'primary'
    }
  }

  const refreshData = async () => {
    await fetchData()
  }

  const handleSearch = async () => {
    pagination.value.current = 1
    await fetchData()
  }

  const handleReset = async () => {
    query.value = ''
    status.value = undefined
    pagination.value.current = 1
    await fetchData()
  }

  const handleSizeChange = async (size: number) => {
    pagination.value.size = size
    pagination.value.current = 1
    await fetchData()
  }

  const handleCurrentChange = async (current: number) => {
    pagination.value.current = current
    await fetchData()
  }

  const fetchData = async () => {
    loading.value = true
    try {
      // Stub UI data
      const all: PlateRegistration[] = [
        {
          id: 1,
          code: 'HSBS-9982',
          phoneNumber: '0901234567',
          customerName: 'Trần Minh Hoàng',
          vinNumber: 'RLH-2024-0001',
          licensePlate: '51A-123.45',
          workshopAssignee: 'Admin A',
          workflowStatus: 'Completed',
          createdAt: '2026-05-20T09:30:00Z',
        },
        {
          id: 2,
          code: 'HSBS-1001',
          phoneNumber: '0902222333',
          customerName: 'Lê Thị B',
          vinNumber: 'RLH-2024-0002',
          licensePlate: undefined,
          workshopAssignee: 'Admin B',
          workflowStatus: 'WaitingCavet',
          createdAt: '2026-05-22T15:10:00Z',
        },
      ]

      const filtered = all.filter((x) => {
        const q = query.value.trim().toLowerCase()
        const matchQuery = !q || x.code.toLowerCase().includes(q) || x.phoneNumber.includes(q)
        const matchStatus = !status.value || x.workflowStatus === status.value
        return matchQuery && matchStatus
      })

      const start = (pagination.value.current - 1) * pagination.value.size
      const end = start + pagination.value.size

      data.value = filtered.slice(start, end)
      pagination.value.total = filtered.length
    } catch (e: any) {
      ElMessage.error(e?.message || 'Không thể tải danh sách hồ sơ')
      data.value = []
      pagination.value.total = 0
    } finally {
      loading.value = false
    }
  }

  const openDetail = (id: number) => {
    router.push({
      name: 'ServiceAdministrativeRegistrationPlateDetail',
      params: { id: String(id) },
    })
  }

  onMounted(() => {
    refreshData()
  })
</script>
