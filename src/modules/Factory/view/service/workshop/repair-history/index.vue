<template>
  <div
    class="resp-page workshop-dashboard-page flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-inter text-[#0F172A] dark:text-[#E2E8F0]"
  >
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 shrink-0 shadow-sm relative z-20"
    >
      <div class="flex justify-between items-center max-w-[1600px] mx-auto">
        <div class="flex items-center gap-5">
          <div
            class="size-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-white shadow-sm"
          >
            <ArtSvgIcon icon="ri:tools-line" class="text-xl text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h1
              class="m-0 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none"
            >
              Trung tâm Điều phối Dịch vụ sửa chữa (Workshop)
            </h1>
            <p
              class="m-0 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2"
            >
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Hệ thống quản lý dịch vụ bảo trì xe & sửa chữa
            </p>
          </div>
        </div>


      </div>
    </div>

    <div class="flex-1 max-w-[1600px] mx-auto w-full p-6 space-y-6">
      <div class="resp-stats-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center justify-between"
        >
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">
              Đang sửa chữa
            </p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0">
              {{ stats.inProgress }}
            </h3>
          </div>
          <div
            class="size-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex-cc text-xl"
          >
            <ArtSvgIcon
              icon="ri:settings-4-line"
              class="animate-spin"
              style="animation-duration: 4s"
            />
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center justify-between"
        >
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">
              Chờ kiểm định (QC)
            </p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0">
              {{ stats.qcPending }}
            </h3>
          </div>
          <div
            class="size-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex-cc text-xl"
          >
            <ArtSvgIcon icon="ri:shield-check-line" />
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center justify-between"
        >
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">
              Chờ tiếp nhận / Phân công
            </p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0">
              {{ stats.pending }}
            </h3>
          </div>
          <div
            class="size-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex-cc text-xl"
          >
            <ArtSvgIcon icon="ri:user-shared-line" />
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center justify-between"
        >
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">
              Hoàn thành hôm nay
            </p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0">
              {{ stats.completedToday }}
            </h3>
          </div>
          <div
            class="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex-cc text-xl"
          >
            <ArtSvgIcon icon="ri:checkbox-circle-line" />
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden flex flex-col"
      >
        <div
          class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-wrap gap-4 items-center justify-between"
        >
          <div class="flex flex-wrap gap-4 items-center flex-1">
            <div class="relative w-80">
              <ElInput
                v-model="searchQuery"
                placeholder="Tìm kiếm theo Tên khách, SĐT hoặc Biển số..."
                clearable
                @input="handleSearch"
                class="combat-input"
              >
                <template #prefix>
                  <ArtSvgIcon icon="ri:search-line" class="text-slate-400 text-sm" />
                </template>
              </ElInput>
            </div>

            <div class="flex items-center gap-4 w-full sm:w-auto">
              <ElSelect
                v-model="statusFilter"
                placeholder="Bộ lọc trạng thái"
                clearable
                @change="handleFilterChange"
                class="flex-1 min-w-[160px] sm:w-48 combat-select"
              >
                <ElOption label="Tất cả trạng thái" value="" />
                <ElOption label="Chờ phân công (Pending)" value="Pending" />
                <ElOption label="Đang sửa chữa (InProgress)" value="InProgress" />
                <ElOption label="Chờ kiểm định (QcPending)" value="QcPending" />
                <ElOption label="Đã hoàn thành (Completed)" value="Completed" />
                <ElOption label="Đã hủy (Cancelled)" value="Cancelled" />
              </ElSelect>

              <ElSelect
                v-model="serviceTypeFilter"
                placeholder="Bộ lọc dịch vụ"
                clearable
                @change="handleFilterChange"
                class="flex-1 min-w-[160px] sm:w-48 combat-select"
              >
                <ElOption label="Tất cả dịch vụ" value="" />
                <ElOption label="Sửa chữa" value="Sửa chữa" />
                <ElOption label="Bảo hành" value="Bảo hành" />
              </ElSelect>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="loadData"
              class="h-9 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-750 transition-all flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:refresh-line" /> Làm mới
            </button>
          </div>
        </div>

        <div class="p-6 bg-slate-50/30">
          <div
            class="mb-4 text-slate-500 text-[13px] italic font-medium flex items-center gap-2"
            v-if="searchQuery || statusFilter"
          >
            <ArtSvgIcon icon="ri:information-line" />
            Tìm thấy {{ totalCount }} phiếu sửa chữa phù hợp dựa trên bộ lọc
          </div>

          <div
            v-if="repairOrders.length === 0 && !loading"
            class="py-12 flex-cc flex-col gap-3 text-slate-400"
          >
            <ArtSvgIcon icon="ri:inbox-2-line" class="text-4xl" />
            <p class="text-sm font-medium">Không tìm thấy phiếu sửa chữa nào</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" v-loading="loading">
            <div
              v-for="row in repairOrders"
              :key="row.id"
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden"
            >
              <div
                class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-slate-900"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-slate-100 shadow-sm shrink-0"
                  >
                    <ArtSvgIcon
                      icon="ri:tools-line"
                      class="text-xl text-blue-500 dark:text-blue-400"
                    />
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span
                      class="font-black text-slate-800 dark:text-slate-100 text-[15px] truncate pr-2"
                      :title="row.customerName"
                    >
                      {{ row.customerName }}
                    </span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span
                        class="font-mono font-bold text-slate-400 dark:text-slate-500 text-[11px]"
                      >
                        RO-{{ String(row.id).padStart(5, '0') }}
                      </span>
                      <span
                        v-if="row.serviceType"
                        class="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border"
                        :class="row.serviceType === 'Bảo hành' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800/50' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'"
                      >
                        {{ row.serviceType }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <span :class="getStatusBadgeClass(row.status) + ' !w-auto !px-3 !py-1.5'">
                    {{ getStatusText(row.status) }}
                  </span>
                </div>
              </div>

              <div class="p-5 flex-1 flex flex-col">
                <div class="grid grid-cols-2 gap-y-4 gap-x-4 mb-4 flex-1">
                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:motorbike-line" /> Xe máy
                    </span>
                    <div class="mt-1.5">
                      <span
                        v-if="row.vehicleInfo"
                        class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200 font-mono font-bold text-[11px] border border-slate-200 dark:border-slate-700"
                      >
                        {{ row.vehicleInfo }}
                      </span>
                      <span
                        v-else
                        class="text-slate-400 dark:text-slate-500 italic text-[11px] block mt-0.5"
                        >Chưa đăng ký biển</span
                      >
                    </div>
                  </div>

                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:phone-line" /> Liên hệ
                    </span>
                    <span class="font-bold text-slate-700 dark:text-slate-200 text-[13px] mt-1.5">{{
                      row.customerPhone
                    }}</span>
                  </div>

                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:user-settings-line" /> Kỹ thuật viên
                    </span>
                    <div class="flex items-center gap-1.5 mt-1.5" v-if="row.technicianId">
                      <div
                        class="size-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-cc font-bold text-[9px] uppercase shadow-inner shrink-0"
                      >
                        {{ row.technicianName ? row.technicianName.charAt(0) : 'T' }}
                      </div>
                      <span
                        class="font-bold text-slate-700 dark:text-slate-200 text-[12px] truncate"
                        :title="row.technicianName"
                      >
                        {{ row.technicianName }}
                      </span>
                    </div>
                    <span
                      v-else
                      class="text-amber-500 font-bold text-[10px] mt-1.5 uppercase flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:error-warning-line" /> Chưa phân công
                    </span>
                  </div>

                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:money-dollar-circle-line" /> Chi phí
                    </span>
                    <span class="font-black text-slate-800 dark:text-slate-100 text-[14px] mt-1">{{
                      formatCurrency(row.voucherFinalTotal || row.totalCost || 0)
                    }}</span>
                    <span
                      class="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight"
                      v-if="(row.voucherFinalTotal || row.totalCost || 0) > 0"
                    >
                      DV: {{ formatCurrency(row.laborCost || 0) }} <br />
                      PT: {{ formatCurrency(row.partsCost || 0) }}
                    </span>
                  </div>
                </div>

                <div
                  class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800"
                >
                  <div
                    class="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium"
                  >
                    <ArtSvgIcon icon="ri:calendar-line" />
                    {{ formatDate(row.createdAt) }}
                  </div>
                  <div
                    class="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium"
                  >
                    <ArtSvgIcon icon="ri:dashboard-3-line" />
                    {{ row.mileage.toLocaleString() }} km
                  </div>
                </div>
              </div>

              <div
                class="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex"
              >
                <button
                  @click="goToDetail(row.id)"
                  class="flex-1 py-3.5 text-[12px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-cc gap-2"
                >
                  Xem chi tiết <ArtSvgIcon icon="ri:arrow-right-line" />
                </button>
              </div>
            </div>
          </div>

          <div
            class="flex justify-between items-center mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-sm px-6 py-4"
          >
            <span class="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase">
              Hiển thị {{ repairOrders.length }} / {{ totalCount }} phiếu
            </span>
            <ElPagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="totalCount"
              layout="sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              class="combat-pagination !font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { RepairOrderApi, RepairOrder } from '@/api/sales';

defineOptions({ name: 'CustomerWorkshopIndex' });

const router = useRouter();
const loading = ref(false);
const repairOrders = ref<RepairOrder[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const allValidItems = ref<any[]>([]);
const searchQuery = ref('');
const statusFilter = ref('');
const serviceTypeFilter = ref('');

const stats = reactive({
  inProgress: 0,
  qcPending: 0,
  pending: 0,
  completedToday: 0,
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await RepairOrderApi.getList({
      current: 1,
      size: 200,
      Sorts: 'createdAt desc',
    });
    const rawItems = res.items || [];

    allValidItems.value = rawItems.map((item: any) => {
      let calcStatus = 'InProgress';
      if (item.status) calcStatus = item.status;
      else if (!item.technicianId && !item.technicianName) calcStatus = 'Pending';
      else if (item.totalCost > 0) calcStatus = 'Completed';

      return {
        ...item,
        status: calcStatus,
        customerName: item.customerName || 'Khách vãng lai',
        customerPhone: item.customerPhone || 'Không có SĐT'
      };
    });

    applyLocalFilterAndPagination();
    calculateStats();
  } catch (err: any) {
    allValidItems.value = [];
    repairOrders.value = [];
    totalCount.value = 0;
    ElMessage.error(err.message || 'Lỗi khi tải danh sách phiếu sửa chữa');
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  const safe = allValidItems.value || [];
  stats.pending = 0;
  stats.inProgress = 0;
  stats.qcPending = 0;
  stats.completedToday = 0;

  safe.forEach((x: any) => {
    if (x.status === 'Pending') stats.pending++;
    else if (x.status === 'InProgress') stats.inProgress++;
    else if (x.status === 'QcPending') stats.qcPending++;
    else if (x.status === 'Completed') stats.completedToday++;
  });
};

const applyLocalFilterAndPagination = () => {
  let filtered = allValidItems.value || [];

  if (statusFilter.value) {
    filtered = filtered.filter((x: any) => x.status === statusFilter.value);
  }

  if (serviceTypeFilter.value) {
    filtered = filtered.filter((x: any) => x.serviceType === serviceTypeFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter((x: any) => {
      const name = (x.customerName || '').toLowerCase();
      const phone = (x.customerPhone || '').toLowerCase();
      const plate = (x.licensePlate || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || plate.includes(q);
    });
  }

  totalCount.value = filtered.length;

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  repairOrders.value = filtered.slice(start, end);
};

onMounted(() => {
  loadData();
});

let searchTimeout: any = null;
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    applyLocalFilterAndPagination();
  }, 400);
};

const handleFilterChange = () => {
  currentPage.value = 1;
  applyLocalFilterAndPagination();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  applyLocalFilterAndPagination();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  applyLocalFilterAndPagination();
};

const goToCreate = () => {
  router.push('/factory/workshop/repair-history/create');
};

const goToDetail = (id: number) => {
  router.push(`/factory/workshop/repair-history/repair/${id}`);
};

const formatCurrency = (val: number) => {
  if (!val) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadgeClass = (status: string) => {
  const base =
    'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block text-center w-28 ';
  switch (status) {
    case 'Pending':
      return base + 'bg-purple-50 text-purple-600 border border-purple-200';
    case 'InProgress':
      return base + 'bg-blue-50 text-blue-600 border border-blue-200';
    case 'QcPending':
      return base + 'bg-amber-50 text-amber-600 border border-amber-200';
    case 'Completed':
      return base + 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    case 'Cancelled':
      return base + 'bg-red-50 text-red-600 border border-red-200';
    default:
      return base + 'bg-slate-50 text-slate-600 border border-slate-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'Chờ tiếp nhận';
    case 'InProgress':
      return 'Đang sửa chữa';
    case 'QcPending':
      return 'Đang QC';
    case 'Completed':
      return 'Đã hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};
</script>

<style lang="scss" scoped>
.workshop-dashboard-page {
  .combat-input {
    :deep(.el-input__wrapper) {
      height: 38px;
      padding: 6px 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .combat-select {
    :deep(.el-input__wrapper) {
      height: 38px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .combat-table {
    --el-table-header-bg-color: #f8fafc;
    --el-table-header-text-color: #94a3b8;
    --el-table-row-hover-bg-color: #f1f5f9/30;

    :deep(thead th) {
      padding: 14px 0;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #f1f5f9;
    }

    :deep(tbody td) {
      padding: 16px 0;
      border-bottom: 1px solid #f8fafc;
    }
  }

  .combat-pagination {
    :deep(.el-pager li.is-active) {
      color: white !important;
      background-color: #001529 !important;
      border-radius: 8px;
    }
  }
}
</style>
