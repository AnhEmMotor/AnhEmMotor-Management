<template>
  <div
    class="resp-page voucher-management-page flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#020617] overflow-hidden"
  >
    <!-- Header -->
    <div
      class="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl flex-cc shadow-sm"
        >
          <ArtSvgIcon icon="ri:coupon-3-fill" class="text-xl text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <h2
            class="m-0 text-base font-bold text-gray-800 dark:text-slate-100 tracking-tight uppercase"
          >
            Quản lý Voucher Khách hàng
          </h2>
          <span
            class="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none"
            >Chương trình khuyến mãi & Tri ân</span
          >
        </div>
      </div>
      <ElButton type="primary" @click="fetchVouchers">
        <ArtSvgIcon icon="ri:refresh-line" /> Làm mới
      </ElButton>
    </div>

    <!-- Toolbar -->
    <div
      class="h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10"
    >
      <div class="flex items-center gap-4">
        <div class="search-box relative">
          <ArtSvgIcon
            icon="ri:search-line"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="Tìm mã hoặc tên voucher..."
            class="w-80 h-10 pl-10 pr-4 bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <ElSelect v-model="filters.type" placeholder="Loại Voucher" class="w-48 !h-10">
          <ElOption label="Tất cả các loại" value="ALL" />
          <ElOption label="Voucher Công Khai (Public)" value="PUBLIC" />
          <ElOption label="Voucher Riêng (Private)" value="PRIVATE" />
        </ElSelect>

        <button
          @click="openCreateDialog"
          class="whitespace-nowrap bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <ArtSvgIcon icon="ri:add-line" class="text-blue-500" /> Tạo Voucher Mới
        </button>
      </div>
    </div>

    <!-- Main Table -->
    <div class="flex-1 overflow-auto p-6">
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden"
      >
        <ElTable
          :data="filteredVouchers"
          class="w-full custom-table"
          header-cell-class-name="bg-gray-50 dark:bg-slate-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
        >
          <ElTableColumn prop="code" label="Mã Voucher" width="160">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <span
                  @click="viewDetail(row as any)"
                  class="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-xs rounded border border-gray-200 dark:border-slate-700 font-mono cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-all underline-offset-2 hover:underline"
                  title="Xem chi tiết voucher"
                >
                  {{ row.code }}
                </span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="name" label="Chương trình" min-width="200">
            <template #default="{ row }">
              <span class="font-bold text-gray-800 dark:text-slate-100 text-sm">{{
                row.name
              }}</span>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="applyFor" label="Phạm vi" width="120">
            <template #default="{ row }">
              <span
                class="font-bold text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400"
              >
                <ArtSvgIcon
                  v-if="row.applyFor === 'ALL'"
                  icon="ri:function-line"
                  class="text-blue-500"
                />
                <ArtSvgIcon
                  v-else-if="row.applyFor === 'VEHICLE'"
                  icon="ri:motorbike-line"
                  class="text-emerald-500"
                />
                <ArtSvgIcon v-else icon="ri:tools-line" class="text-purple-500" />
                {{ getApplyForLabel(row.applyFor) }}
              </span>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="channel" label="Kênh áp dụng" width="120">
            <template #default="{ row }">
              <span
                class="font-bold text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400"
              >
                <ArtSvgIcon
                  v-if="row.channel === 'ALL'"
                  icon="ri:store-3-line"
                  class="text-blue-500"
                />
                <ArtSvgIcon
                  v-else-if="row.channel === 'STORE'"
                  icon="ri:store-2-line"
                  class="text-emerald-500"
                />
                <ArtSvgIcon v-else icon="ri:global-line" class="text-orange-500" />
                {{ getChannelLabel(row.channel) }}
              </span>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="type" label="Đối tượng" width="150">
            <template #default="{ row }">
              <ElTag
                v-if="row.type === 'PUBLIC'"
                effect="light"
                class="border-blue-200 text-blue-600 bg-blue-50 font-bold text-[10px] uppercase"
              >
                <div class="flex items-center gap-1">
                  <ArtSvgIcon icon="ri:global-line" /> Công khai
                </div>
              </ElTag>
              <ElTag
                v-else
                effect="dark"
                class="bg-slate-700 border-none text-white font-bold text-[10px] uppercase"
              >
                <div class="flex items-center gap-1">
                  <ArtSvgIcon icon="ri:user-star-fill" class="text-yellow-400" />
                  Giới hạn ({{ row.assignedCustomers?.length || 0 }})
                </div>
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Mức giảm" width="150">
            <template #default="{ row }">
              <span class="font-bold text-red-500 dark:text-red-400 text-sm">
                {{
                  row.discountType === 'PERCENT'
                    ? row.discountValue + '%'
                    : formatCurrency(row.discountValue)
                }}
              </span>
              <span
                v-if="row.discountType === 'PERCENT' && row.maxDiscountAmount"
                class="block text-[9px] text-gray-400"
              >
                Tối đa: {{ formatCurrency(row.maxDiscountAmount) }}
              </span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Lượt sử dụng" width="180">
            <template #default="{ row }">
              <div class="flex flex-col text-xs font-semibold text-gray-600 dark:text-gray-400">
                <span>
                  <span class="text-gray-400 font-normal">Đã dùng:</span>
                  <span class="font-bold text-gray-800 dark:text-slate-200">
                    {{ row.usedCount }}</span
                  >
                </span>
                <span>
                  <span class="text-gray-400 font-normal">Còn lại:</span>
                  <span
                    v-if="row.totalUsageLimit > 0"
                    :class="
                      row.totalUsageLimit - row.usedCount <= 0
                        ? 'text-red-500 font-bold'
                        : 'font-bold text-emerald-600'
                    "
                  >
                    {{ Math.max(0, row.totalUsageLimit - row.usedCount) }} /
                    {{ row.totalUsageLimit }}
                  </span>
                  <span v-else class="text-gray-500 font-normal font-mono">∞ (Vô hạn)</span>
                </span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Thời hạn" width="200">
            <template #default="{ row }">
              <div class="flex flex-col text-xs font-semibold text-gray-600 dark:text-gray-400">
                <span
                  ><span class="text-gray-400 font-normal">Từ:</span>
                  {{ formatDate(row.validFrom) }}</span
                >
                <span :class="isExpired(row.validTo) ? 'text-red-500' : ''"
                  ><span class="text-gray-400 font-normal">Đến:</span>
                  {{ formatDate(row.validTo) }}</span
                >
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Thao tác" width="140" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="editVoucher(row as Voucher)">Sửa</ElButton>
              <ElButton link type="danger" @click="handleDeleteVoucher(row as Voucher)"
                >Xóa</ElButton
              >
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getVouchers, deleteVoucher } from '@/api/marketing/voucher.api';
import dayjs from 'dayjs';

defineOptions({ name: 'CustomerVoucherManagement' });

const router = useRouter();

interface Voucher {
  id: number;
  code: string;
  name: string;
  applyFor: 'ALL' | 'VEHICLE' | 'PART';
  channel: 'ALL' | 'STORE' | 'WEBSITE';
  type: 'PUBLIC' | 'PRIVATE';
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED';
  assignedCustomers: number[];
}

const vouchers = ref<Voucher[]>([]);

// ================= State =================
const filters = ref({ keyword: '', type: 'ALL' });

// ================= Computed =================
const filteredVouchers = computed(() => {
  let result = vouchers.value;

  if (filters.value.type !== 'ALL') {
    result = result.filter((v) => v.type === filters.value.type);
  }

  if (filters.value.keyword) {
    const kw = filters.value.keyword.toLowerCase();
    result = result.filter(
      (v) => v.code.toLowerCase().includes(kw) || v.name.toLowerCase().includes(kw)
    );
  }

  return result;
});

// ================= Methods =================
const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(val);
};

const formatDate = (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm');

const isExpired = (val: string) => dayjs().isAfter(dayjs(val));

const getApplyForLabel = (val: string) => {
  switch (val) {
    case 'ALL':
      return 'Xe & Phụ tùng';
    case 'VEHICLE':
      return 'Chỉ Xe máy';
    case 'PART':
      return 'Chỉ Phụ tùng';
    default:
      return val;
  }
};

const getChannelLabel = (val: string) => {
  switch (val) {
    case 'ALL':
      return 'Tất cả';
    case 'STORE':
      return 'Cửa hàng';
    case 'WEBSITE':
      return 'Website';
    default:
      return val;
  }
};

const fetchVouchers = async () => {
  try {
    const res: any = await getVouchers({});
    // API trả về Result<PagedResult<VoucherResponse>>:
    // res = { value: { items: [...], totalCount, ... }, isSuccess: true }
    vouchers.value = res?.value?.items || res?.items || res?.data || [];
  } catch (error) {
    console.error('Failed to fetch vouchers', error);
  }
};

const openCreateDialog = () => {
  router.push('/Marketing/customer/voucher/save');
};

const viewDetail = (row: Voucher) => {
  router.push(`/Marketing/customer/voucher/detail/${row.id}`);
};

const editVoucher = (row: Voucher) => {
  router.push(`/Marketing/customer/voucher/save?id=${row.id}`);
};

const handleDeleteVoucher = (row: Voucher) => {
  ElMessageBox.confirm('Bạn có chắc chắn muốn xóa voucher này không?', 'Cảnh báo', {
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteVoucher(row.id);
        ElMessage.success('Xóa voucher thành công');
        fetchVouchers();
      } catch (error) {
        ElMessage.error('Có lỗi xảy ra khi xóa voucher');
      }
    })
    .catch(() => {});
};

onMounted(() => {
  fetchVouchers();
});
</script>

<style lang="scss" scoped>
.voucher-management-page {
  .uppercase-input :deep(input) {
    text-transform: uppercase;
  }

  .custom-radio-group {
    :deep(.el-radio-button__inner) {
      border-radius: 8px !important;
      border: 1px solid #e5e7eb !important;
      box-shadow: none !important;
      margin-right: 8px;
    }

    :deep(.el-radio-button:last-child .el-radio-button__inner) {
      margin-right: 0;
    }

    :deep(.el-radio-button.is-active .el-radio-button__inner) {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary) !important;
      color: white;
    }
  }
}
</style>
