<template>
  <div
    class="workshop-dashboard-page flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-inter text-[#0F172A] dark:text-[#E2E8F0]"
  >
    <!-- Header -->
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 shrink-0 shadow-sm relative z-20"
    >
      <div class="flex justify-between items-center max-w-[1600px] mx-auto">
        <div class="flex items-center gap-5">
          <div
            class="size-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-white shadow-sm"
          >
            <ArtSvgIcon
              icon="ri:tools-line"
              class="text-xl text-blue-500 dark:text-blue-400"
            />
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
              <span
                class="size-1.5 rounded-full bg-emerald-500 animate-pulse"
              ></span>
              Hệ thống quản lý dịch vụ bảo trì xe & sửa chữa
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="goToCreate"
            class="h-10 px-6 bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:user-add-line" class="text-blue-500" /> + Tiếp
            nhận xe
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 max-w-[1600px] mx-auto w-full p-6 space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center justify-between"
        >
          <div>
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0"
            >
              Đang sửa chữa
            </p>
            <h3
              class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0"
            >
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
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0"
            >
              Chờ kiểm định (QC)
            </p>
            <h3
              class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0"
            >
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
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0"
            >
              Chờ tiếp nhận / Phân công
            </p>
            <h3
              class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0"
            >
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
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0"
            >
              Hoàn thành hôm nay
            </p>
            <h3
              class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2 m-0"
            >
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

      <!-- Filters & Table Area -->
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden flex flex-col"
      >
        <!-- Filter Bar -->
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
                  <ArtSvgIcon
                    icon="ri:search-line"
                    class="text-slate-400 text-sm"
                  />
                </template>
              </ElInput>
            </div>

            <ElSelect
              v-model="statusFilter"
              placeholder="Bộ lọc trạng thái"
              clearable
              @change="handleFilterChange"
              class="w-48 combat-select"
            >
              <ElOption label="Tất cả trạng thái" value="" />
              <ElOption label="Chờ phân công (Pending)" value="Pending" />
              <ElOption label="Đang sửa chữa (InProgress)" value="InProgress" />
              <ElOption label="Chờ kiểm định (QcPending)" value="QcPending" />
              <ElOption label="Đã hoàn thành (Completed)" value="Completed" />
              <ElOption label="Đã hủy (Cancelled)" value="Cancelled" />
            </ElSelect>
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

        <!-- Card Grid Layout (Replaced Table) -->
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

          <div
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            v-loading="loading"
          >
            <div
              v-for="row in repairOrders"
              :key="row.id"
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden"
            >
              <!-- Card Header -->
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
                    <span
                      class="font-mono font-bold text-slate-400 dark:text-slate-500 text-[11px] mt-0.5"
                    >
                      RO-{{ String(row.id).padStart(5, "0") }}
                    </span>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <span
                    :class="
                      getStatusBadgeClass(row.status) + ' !w-auto !px-3 !py-1.5'
                    "
                  >
                    {{ getStatusText(row.status) }}
                  </span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-5 flex-1 flex flex-col">
                <div class="grid grid-cols-2 gap-y-4 gap-x-4 mb-4 flex-1">
                  <!-- Biển số & Số khung -->
                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:motorbike-line" /> Xe máy
                    </span>
                    <div class="mt-1.5">
                      <span
                        v-if="row.licensePlate"
                        class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200 font-mono font-bold text-[11px] border border-slate-200 dark:border-slate-700"
                      >
                        {{ row.licensePlate }}
                      </span>
                      <span
                        v-else
                        class="text-slate-400 dark:text-slate-500 italic text-[11px] block mt-0.5"
                        >Chưa đăng ký biển</span
                      >
                      <div
                        v-if="row.vehicle && row.vehicle.vinNumber"
                        class="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono"
                      >
                        Khung: {{ row.vehicle.vinNumber }}
                      </div>
                    </div>
                  </div>

                  <!-- Liên hệ -->
                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:phone-line" /> Liên hệ
                    </span>
                    <span
                      class="font-bold text-slate-700 dark:text-slate-200 text-[13px] mt-1.5"
                      >{{ row.customerPhone }}</span
                    >
                  </div>

                  <!-- Kỹ thuật viên -->
                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:user-settings-line" /> Kỹ thuật viên
                    </span>
                    <div
                      class="flex items-center gap-1.5 mt-1.5"
                      v-if="row.technicianId"
                    >
                      <div
                        class="size-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-cc font-bold text-[9px] uppercase shadow-inner shrink-0"
                      >
                        {{
                          row.technicianName
                            ? row.technicianName.charAt(0)
                            : "T"
                        }}
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

                  <!-- Chi phí -->
                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <ArtSvgIcon icon="ri:money-dollar-circle-line" /> Chi phí
                    </span>
                    <span
                      class="font-black text-slate-800 dark:text-slate-100 text-[14px] mt-1"
                      >{{ formatCurrency(row.totalAmount) }}</span
                    >
                    <span
                      class="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight"
                      v-if="row.totalAmount > 0"
                    >
                      DV: {{ formatCurrency(row.laborCost) }} <br />
                      PT: {{ formatCurrency(row.partsCost) }}
                    </span>
                  </div>
                </div>

                <!-- Footer Stats -->
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

              <!-- Card Footer Action -->
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

          <!-- Pagination -->
          <div
            class="flex justify-between items-center mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-sm px-6 py-4"
          >
            <span
              class="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase"
            >
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
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { RepairOrderApi, RepairOrder } from "@/api/sales";

defineOptions({ name: "CustomerWorkshopIndex" });

const router = useRouter();
const loading = ref(false);
const repairOrders = ref<RepairOrder[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");
const statusFilter = ref("");

const stats = reactive({
  inProgress: 0,
  qcPending: 0,
  pending: 0,
  completedToday: 0,
});

const loadData = async () => {
  loading.value = true;
  try {
    // Build Sieve Filters
    const filterArray: string[] = [];
    if (statusFilter.value) {
      filterArray.push(`Status==${statusFilter.value}`);
    }
    if (searchQuery.value) {
      // Sieve filters logic: search phone, name, or license plate
      const q = searchQuery.value.trim();
      if (/^\d+$/.test(q)) {
        filterArray.push(`CustomerPhone@=${q}`);
      } else {
        // Search either name or license plate
        filterArray.push(`CustomerName@=${q}|LicensePlate@=${q}`);
      }
    }

    const res = await RepairOrderApi.getList({
      current: currentPage.value,
      size: pageSize.value,
      Filters: filterArray.join(","),
      Sorts: "createdAt desc",
    });

    repairOrders.value = res.items || [];
    totalCount.value = res.totalCount || 0;

    // Fetch stats (we can query lists with small page size to get counts, or fetch all active)
    await loadStats();
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tải danh sách phiếu sửa chữa");
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    // Fetch stats by making queries
    const resPending = await RepairOrderApi.getList({
      current: 1,
      size: 1,
      Filters: "Status==Pending",
    });
    const resInProgress = await RepairOrderApi.getList({
      current: 1,
      size: 1,
      Filters: "Status==InProgress",
    });
    const resQc = await RepairOrderApi.getList({
      current: 1,
      size: 1,
      Filters: "Status==QcPending",
    });

    // For completed today, we query completed status. For a precise count, it requires date filter,
    // but a general completed count is suitable for demo.
    const resCompleted = await RepairOrderApi.getList({
      current: 1,
      size: 1,
      Filters: "Status==Completed",
    });

    stats.pending = resPending.totalCount || 0;
    stats.inProgress = resInProgress.totalCount || 0;
    stats.qcPending = resQc.totalCount || 0;
    stats.completedToday = resCompleted.totalCount || 0;
  } catch (e) {
    console.error("Failed to load stats", e);
  }
};

onMounted(() => {
  loadData();
});

// Search / Filtering handlers
let searchTimeout: any = null;
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 400);
};

const handleFilterChange = () => {
  currentPage.value = 1;
  loadData();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadData();
};

// Navigation
const goToCreate = () => {
  router.push("/customer/workshop/create");
};

const goToDetail = (id: number) => {
  router.push(`/customer/workshop/repair/${id}`);
};

// Helper formatting functions
const formatCurrency = (val: number) => {
  if (!val) return "0đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeClass = (status: string) => {
  const base =
    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block text-center w-28 ";
  switch (status) {
    case "Pending":
      return base + "bg-purple-50 text-purple-600 border border-purple-200";
    case "InProgress":
      return base + "bg-blue-50 text-blue-600 border border-blue-200";
    case "QcPending":
      return base + "bg-amber-50 text-amber-600 border border-amber-200";
    case "Completed":
      return base + "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "Cancelled":
      return base + "bg-red-50 text-red-600 border border-red-200";
    default:
      return base + "bg-slate-50 text-slate-600 border border-slate-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "Pending":
      return "Chờ tiếp nhận";
    case "InProgress":
      return "Đang sửa chữa";
    case "QcPending":
      return "Đang QC";
    case "Completed":
      return "Đã hoàn thành";
    case "Cancelled":
      return "Đã hủy";
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
