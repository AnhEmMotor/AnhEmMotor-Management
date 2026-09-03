<template>
  <div class="resp-page contract-sales-container">
    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Hợp đồng mới</div>
            <div class="text-2xl font-bold text-orange-500">
              {{ statistics.draftCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Cần hoàn thiện thông tin</div>
          </div>
          <el-icon class="text-4xl text-orange-200"><Document /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Chờ Admin duyệt</div>
            <div class="text-2xl font-bold text-amber-500">
              {{ statistics.pendingApprovalCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Hợp đồng nhân viên đã gửi</div>
          </div>
          <el-icon class="text-4xl text-amber-200"><Timer /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Trễ hạn bàn giao</div>
            <div class="text-2xl font-bold text-red-500">
              {{ statistics.overdueCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Cảnh báo nhắc Sale</div>
          </div>
          <el-icon class="text-4xl text-red-200"><Warning /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Đã ký</div>
            <div class="text-2xl font-bold text-blue-500">
              {{ statistics.signedCount }}
            </div>
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
        <div
          class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4 max-md:flex-wrap max-md:gap-2 items-center"
        >
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
            <el-option label="Nháp" value="Draft" />
            <el-option label="Từ chối" value="Rejected" />
            <el-option label="Chờ Admin duyệt" value="PendingApproval" />
            <el-option label="Đã duyệt" value="Approved" />
            <el-option label="Đã ký" value="Signed" />
            <el-option label="Hoàn tất" value="Fulfilled" />
          </el-select>
          <el-input
            v-model="vehicleFilter"
            placeholder="Dòng xe"
            clearable
            class="w-full"
            @keyup.enter="fetchData"
          />
          <el-button type="primary" :icon="Search" class="w-full md:w-auto" @click="fetchData"
            >Tìm kiếm</el-button
          >
        </div>

        <el-table
          :data="tableData"
          border
          class="resp-table"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="contractNumber" label="Số Hợp Đồng" width="160" />
          <el-table-column label="Mã Hóa Đơn" width="160">
            <template #default="scope">
              <el-tag
                v-if="scope.row.invoiceNumber"
                type="primary"
                size="small"
                class="font-semibold"
              >
                {{ scope.row.invoiceNumber }}
              </el-tag>
              <span v-else-if="scope.row.invoiceId" class="font-semibold text-primary">
                #{{ scope.row.invoiceId }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="customerName" label="Khách Hàng" min-width="160" />
          <el-table-column prop="vehicle" label="Xe Giao Dịch" min-width="180" />

          <el-table-column label="Hạn Bàn Giao" width="170">
            <template #default="scope">
              <div class="delivery-deadline flex flex-col items-start gap-1">
                <span
                  :class="{
                    'text-red-500 font-bold': isOverdue(scope.row.deliveryDeadline),
                  }"
                >
                  {{ formatDate(scope.row.deliveryDeadline) }}
                </span>
                <el-tag
                  size="small"
                  :type="getDeadlineTagType(scope.row.deliveryDeadline)"
                  effect="plain"
                  class="delivery-deadline__hint"
                >
                  {{ getDeliveryDeadlineHint(scope.row.deliveryDeadline) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="Trạng Thái HĐ" width="130" align="center">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" effect="dark">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="Thao Tác" width="140" align="center" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                link
                :icon="View"
                @click="goToPreview(scope.row.id)"
                v-auth="Permissions.Admin.ContractManagement.View"
              >
                Mở hợp đồng
              </el-button>
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
import { Permissions } from '@/domain/constants/permissions';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { View, Search, Document, Warning, Money, Timer } from '@element-plus/icons-vue';

import { ElMessage } from 'element-plus';
import { SalesContractApi } from '@/api/sales';
import type { SalesContractListDto, SalesContractStatus } from '@/domain/sales/contract.types';

const { t: $t } = useI18n();
const router = useRouter();

const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const vehicleFilter = ref('');

interface SalesContractListRow {
  id: string;
  contractNumber: string;
  invoiceId?: number;
  invoiceNumber?: string;
  status: SalesContractStatus;
  customerName: string;
  vehicle: string;
  deliveryDeadline?: string;
}

const tableData = ref<SalesContractListRow[]>([]);
const statistics = reactive({
  draftCount: 0,
  pendingApprovalCount: 0,
  overdueCount: 0,
  signedCount: 0,
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.current = 1;
    fetchData();
  }, 400);
};

const formatVehicleTransaction = (contract: SalesContractListDto): string => {
  const vehicleDetails = [
    contract.vehicleModel,
    contract.vehicleVersion,
    contract.vehicleColor,
  ].filter((value): value is string => Boolean(value?.trim()));

  return vehicleDetails.join(' • ') || 'Chưa có thông tin xe';
};

const mapSalesContractRow = (contract: SalesContractListDto): SalesContractListRow => ({
  id: contract.id,
  contractNumber: contract.contractNumber,
  invoiceId: contract.invoiceId,
  invoiceNumber: contract.invoiceNumber,
  status: contract.status,
  customerName: contract.customerFullName?.trim() || 'Chưa có khách hàng',
  vehicle: formatVehicleTransaction(contract),
  deliveryDeadline: contract.finalPaymentDeadline,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params: {
      current: number;
      size: number;
      keyword?: string;
      status?: string;
      vehicleModel?: string;
    } = {
      current: pagination.current,
      size: pagination.size,
    };
    if (searchQuery.value) params.keyword = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;
    if (vehicleFilter.value) params.vehicleModel = vehicleFilter.value;

    const res = await SalesContractApi.getList(params);
    tableData.value = (res?.items || []).map(mapSalesContractRow);
    pagination.total = res?.totalCount || 0;
  } catch (_e) {
    ElMessage.error('Không tải được danh sách hợp đồng.');
  } finally {
    loading.value = false;
  }
};

const loadStatistics = async () => {
  try {
    const stats = await SalesContractApi.getStatistics();
    if (stats) {
      statistics.draftCount = stats.draftCount || 0;
      statistics.pendingApprovalCount = stats.pendingApprovalCount || 0;
      statistics.overdueCount = stats.overdueCount || 0;
      statistics.signedCount = stats.signedCount || 0;
    }
  } catch (_e) {}
};

onMounted(() => {
  fetchData();
  loadStatistics();
});

const getStatusType = (status: string) => {
  switch (status) {
    case 'Draft':
      return 'info';
    case 'PendingApproval':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Signed':
      return 'primary';
    case 'Fulfilled':
      return 'success';
    default:
      return 'info';
  }
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    Draft: 'Nháp',
    Rejected: 'Từ chối',
    PendingApproval: 'Chờ Admin duyệt',
    Approved: 'Đã duyệt',
    Signed: 'Đã ký',
    Fulfilled: 'Hoàn tất',
  };
  return statusMap[status] || status;
};

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const MILLISECONDS_PER_DAY = 86_400_000;
const vietnamDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: VIETNAM_TIME_ZONE,
});
const vietnamCalendarDayFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: VIETNAM_TIME_ZONE,
});

const toVietnamCalendarDay = (value: string | Date): number | null => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = vietnamCalendarDayFormatter.formatToParts(date);
  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return Date.UTC(Number(dateParts.year), Number(dateParts.month) - 1, Number(dateParts.day));
};

const getDeliveryDaysRemaining = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  const deadlineDay = toVietnamCalendarDay(dateStr);
  const today = toVietnamCalendarDay(new Date());
  if (deadlineDay === null || today === null) return null;

  return Math.round((deadlineDay - today) / MILLISECONDS_PER_DAY);
};

const isOverdue = (dateStr?: string) => {
  const days = getDeliveryDaysRemaining(dateStr);
  return days !== null && days < 0;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Chưa xác định';
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? 'Chưa xác định' : vietnamDateFormatter.format(date);
};

const getDeliveryDeadlineHint = (dateStr?: string): string => {
  const days = getDeliveryDaysRemaining(dateStr);
  if (days === null) return 'Chưa có thời hạn';
  if (days > 0) return `Còn ${days} ngày`;
  if (days < 0) return `Trễ ${Math.abs(days)} ngày`;
  return 'Đến hạn hôm nay';
};

const getDeadlineTagType = (dateStr?: string): 'danger' | 'warning' | 'info' => {
  const days = getDeliveryDaysRemaining(dateStr);
  if (days === null) return 'info';
  if (days < 0) return 'danger';
  if (days <= 2) return 'warning';
  return 'info';
};

const goToPreview = (id?: string) => {
  if (id) {
    router.push({ name: 'SalesContractPreview', params: { id } });
  } else {
    router.push({ name: 'SalesContractPreview' });
  }
};
</script>

<style scoped lang="scss">
.contract-sales-container {
  padding: 16px;
}

html.dark .contract-sales-container {
  min-height: 100vh;
  color: #f8fafc;
  background: #050506;
}

html.dark .contract-sales-container :deep(.el-card) {
  color: #f8fafc;
  background: #161618;
  border-color: rgb(255 255 255 / 9%);
}

html.dark .contract-sales-container :deep(.el-card__header),
html.dark .contract-sales-container :deep(.el-table),
html.dark .contract-sales-container :deep(.el-table .cell),
html.dark .contract-sales-container :deep(.el-table th.el-table__cell),
html.dark .contract-sales-container :deep(.el-table td.el-table__cell),
html.dark .contract-sales-container :deep(.el-pagination),
html.dark .contract-sales-container :deep(.el-pagination *) {
  color: #f8fafc !important;
}

html.dark .contract-sales-container :deep(.el-pagination .el-pager li) {
  background: #101114;
  border: 1px solid rgb(255 255 255 / 10%);
}

html.dark .contract-sales-container :deep(.el-pagination .el-pager li.is-active) {
  background: #e84a4a;
  border-color: #e84a4a;
}

html.dark .contract-sales-container :deep(.el-tag) {
  color: #fff;
  border-color: transparent;
}

html.dark .contract-sales-container :deep(.kpi-card) {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .contract-sales-container :deep(.kpi-card .text-gray-400),
html.dark .contract-sales-container :deep(.kpi-card .text-gray-500) {
  color: #f8fafc !important;
}

html.dark .contract-sales-container :deep(.el-card) {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .contract-sales-container :deep(.el-card__body) {
  background: transparent !important;
}

html.dark .contract-sales-container :deep(.el-table) {
  --el-table-bg-color: #161618;
  --el-table-tr-bg-color: #161618;
  --el-table-header-bg-color: #111214;
}

html.dark .contract-sales-container :deep(.el-table th.el-table__cell) {
  background: #111214;
}

html.dark .contract-sales-container :deep(.el-input__wrapper),
html.dark .contract-sales-container :deep(.el-select__wrapper) {
  background: #101114;
  border: 1px solid rgb(255 255 255 / 14%);
  box-shadow: none;
}

html.dark .contract-sales-container :deep(.el-input__inner),
html.dark .contract-sales-container :deep(.el-select__placeholder),
html.dark .contract-sales-container :deep(.el-select__selected-item) {
  color: #f8fafc;
}

html.dark .contract-sales-container .text-gray-400,
html.dark .contract-sales-container .text-gray-500,
html.dark .contract-sales-container .text-gray-600,
html.dark .contract-sales-container .text-gray-800,
html.dark .contract-sales-container .text-gray-900 {
  color: #f8fafc !important;
}

.kpi-card {
  border-radius: 8px;
}
</style>
