<template>
  <div class="contract-sales-container">
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Hợp đồng mới (Draft)</div>
            <div class="text-2xl font-bold text-orange-500">{{ statistics.draftCount }}</div>
            <div class="text-xs text-gray-400 mt-1">Cần xử lý gấp để ký</div>
          </div>
          <el-icon class="text-4xl text-orange-200"><Document /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Trễ hạn bàn giao</div>
            <div class="text-2xl font-bold text-red-500">{{ statistics.overdueCount }}</div>
            <div class="text-xs text-gray-400 mt-1">Cảnh báo nhắc Sale</div>
          </div>
          <el-icon class="text-4xl text-red-200"><Warning /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Đã ký (Signed)</div>
            <div class="text-2xl font-bold text-blue-500">{{ statistics.signedCount }}</div>
            <div class="text-xs text-gray-400 mt-1">Chờ bàn giao xe</div>
          </div>
          <el-icon class="text-4xl text-blue-200"><Money /></el-icon>
        </div>
      </el-card>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="font-bold text-lg">{{ $t('menus.contract.sales') }}</span>
        </div>
      </template>
      <div>
        <div class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <el-input
            v-model="searchQuery"
            placeholder="Số hợp đồng, Tên KH, Số CCCD, Số khung/máy"
            clearable
            :prefix-icon="Search"
            class="w-full"
            @input="debouncedSearch"
          />
          <el-select
            v-model="statusFilter"
            placeholder="Trạng thái"
            clearable
            class="w-full"
            @change="fetchData"
          >
            <el-option label="Nháp (Draft)" value="Draft" />
            <el-option label="Đã ký (Signed)" value="Signed" />
            <el-option label="Hoàn tất (Fulfilled)" value="Fulfilled" />
          </el-select>
          <el-select
            v-model="vehicleFilter"
            placeholder="Dòng xe"
            clearable
            class="w-full"
            @change="fetchData"
          >
            <el-option label="Honda SH" value="SH" />
            <el-option label="Honda Vision" value="Vision" />
            <el-option label="Yamaha Exciter" value="Exciter" />
          </el-select>
          <el-button type="primary" :icon="Search" class="w-full md:w-auto" @click="fetchData"
            >Tìm kiếm</el-button
          >
        </div>

        <el-table :data="tableData" border style="width: 100%" v-loading="loading">
          <el-table-column prop="contractNumber" label="Số Hợp Đồng" width="160" />
          <el-table-column label="Mã Đơn Hàng" width="140">
            <template #default="scope">
              <el-button link type="primary" class="font-semibold">
                {{ scope.row.orderId }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="customerName" label="Khách Hàng" min-width="160" />
          <el-table-column prop="vehicle" label="Xe Giao Dịch" min-width="180" />

          <el-table-column label="Hạn Bàn Giao" width="130">
            <template #default="scope">
              <div class="flex flex-col items-start">
                <span :class="{ 'text-red-500 font-bold': isOverdue(scope.row.deliveryDeadline) }">
                  {{ formatDate(scope.row.deliveryDeadline) }}
                </span>
                <el-tag
                  size="small"
                  :type="getStatusType(scope.row.status)"
                  effect="dark"
                  class="mt-1 contract-status-tag"
                >
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Tiến Độ Đơn Hàng" min-width="260">
            <template #default="scope">
              <el-steps
                :space="60"
                :active="getProgressActive(scope.row.progress)"
                class="mini-steps"
                simple
              >
                <el-step title="Cọc" />
                <el-step title="Đủ tiền" />
                <el-step title="Giao xe" />
              </el-steps>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="Trạng Thái HĐ" width="130" align="center">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" effect="dark">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="Thao Tác" width="110" align="center" fixed="right">
            <template #default="scope">
              <el-dropdown trigger="click">
                <el-button type="primary" link>
                  Thao tác <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToPreview(scope.row.id)" :icon="View">
                      Xem chi tiết
                    </el-dropdown-item>
                    <template v-if="scope.row.status === 'Draft'">
                      <el-dropdown-item @click="goToPreview(scope.row.id)" :icon="Edit">
                        Xem trước &amp; Chỉnh sửa
                      </el-dropdown-item>
                      <el-dropdown-item :icon="UploadFilled">
                        Tải lên bản quét PDF
                      </el-dropdown-item>
                      <el-dropdown-item divided disabled>
                        <el-icon class="text-orange-500"><WarningFilled /></el-icon>
                        <span class="text-orange-500">Ký HĐ để giao xe</span>
                      </el-dropdown-item>
                    </template>
                    <template v-else-if="scope.row.status === 'Signed'">
                      <el-dropdown-item :icon="DocumentAdd">Tạo phụ lục</el-dropdown-item>
                      <el-dropdown-item
                        v-if="isOverdue(scope.row.deliveryDeadline)"
                        divided
                        disabled
                      >
                        <el-icon class="text-red-500"><WarnTriangleFilled /></el-icon>
                        <span class="text-red-500">Trễ hạn bàn giao!</span>
                      </el-dropdown-item>
                    </template>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-4 flex justify-end">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @current-change="fetchData"
            @size-change="fetchData"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import {
    View,
    Search,
    Document,
    Warning,
    Money,
    Edit,
    UploadFilled,
    DocumentAdd,
    WarningFilled,
    WarnTriangleFilled,
    ArrowDown,
  } from '@element-plus/icons-vue'

  import { ElMessage } from 'element-plus'
  import { SalesContractApi } from '@/infrastructure/api/sales-contract.api'

  const { t: $t } = useI18n()
  const router = useRouter()

  const loading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('')
  const vehicleFilter = ref('')

  const tableData = ref<any[]>([])
  const statistics = reactive({
    draftCount: 0,
    overdueCount: 0,
    signedCount: 0,
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
  })

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  const debouncedSearch = () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      pagination.current = 1
      fetchData()
    }, 400)
  }

  const fetchData = async () => {
    loading.value = true
    try {
      const params: {
        current: number
        size: number
        keyword?: string
        status?: string
        vehicleModel?: string
      } = {
        current: pagination.current,
        size: pagination.size,
      }
      if (searchQuery.value) params.keyword = searchQuery.value
      if (statusFilter.value) params.status = statusFilter.value
      if (vehicleFilter.value) params.vehicleModel = vehicleFilter.value

      const res = await SalesContractApi.getList(params)
      tableData.value = res.items.map((c: any) => ({
        ...c,
        progress:
          c.status === 'Fulfilled' ? 'delivered' : c.status === 'Signed' ? 'paid' : 'deposit',
      }))
      pagination.total = res.total
    } catch (_e) {
      ElMessage.error('Không tải được danh sách hợp đồng.')
    } finally {
      loading.value = false
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await SalesContractApi.getStatistics()
      statistics.draftCount = stats.draftCount
      statistics.overdueCount = stats.overdueCount
      statistics.signedCount = stats.signedCount
    } catch (_e) {
      // silent fail for stats
    }
  }

  onMounted(() => {
    fetchData()
    loadStatistics()
  })

  const getStatusType = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'warning'
      case 'Signed':
        return 'primary'
      case 'Fulfilled':
        return 'success'
      default:
        return 'info'
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'Nháp (Draft)',
      Signed: 'Đã ký (Signed)',
      Fulfilled: 'Hoàn tất (Fulfilled)',
    }
    return map[status] || status
  }

  const getProgressActive = (progress: string) => {
    switch (progress) {
      case 'deposit':
        return 1
      case 'paid':
        return 2
      case 'delivered':
        return 3
      default:
        return 0
    }
  }

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const goToPreview = (id?: string) => {
    router.push({ name: 'SalesContractPreview', params: { id: id || '' } })
  }
</script>

<style scoped lang="scss">
  .contract-sales-container {
    padding: 16px;
  }

  :global(html.dark) {
    .contract-sales-container {
      color: #f8fafc;
    }

    .contract-sales-container :deep(.el-card) {
      color: #f8fafc;
      background: #161618;
      border-color: rgb(255 255 255 / 9%);
    }

    .contract-sales-container :deep(.el-card__header),
    .contract-sales-container :deep(.el-table),
    .contract-sales-container :deep(.el-table .cell),
    .contract-sales-container :deep(.el-table th.el-table__cell),
    .contract-sales-container :deep(.el-table td.el-table__cell),
    .contract-sales-container :deep(.el-pagination),
    .contract-sales-container :deep(.el-pagination *) {
      color: #f8fafc !important;
    }

    .contract-sales-container :deep(.el-table th.el-table__cell) {
      background: #111214;
    }

    .contract-sales-container :deep(.el-input__wrapper),
    .contract-sales-container :deep(.el-select__wrapper) {
      background: #101114;
      border: 1px solid rgb(255 255 255 / 14%);
      box-shadow: none;
    }

    .contract-sales-container :deep(.el-input__inner),
    .contract-sales-container :deep(.el-select__placeholder),
    .contract-sales-container :deep(.el-select__selected-item) {
      color: #f8fafc;
    }

    .contract-sales-container .text-gray-400,
    .contract-sales-container .text-gray-500,
    .contract-sales-container .text-gray-600,
    .contract-sales-container .text-gray-800,
    .contract-sales-container .text-gray-900 {
      color: #f8fafc !important;
    }
  }

  .kpi-card {
    border-radius: 8px;
  }

  .mini-steps {
    padding: 4px 8px !important;
    background: transparent !important;

    :deep(.el-step__title) {
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
    }

    :deep(.el-step__head) {
      display: none;
    }

    :deep(.el-step) {
      flex-basis: auto !important;
      min-width: 60px;
    }
  }
</style>
