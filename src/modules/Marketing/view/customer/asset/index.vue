<template>
  <div
    class="resp-page customer-asset-page flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#020617] overflow-hidden"
  >
    <div
      class="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl flex-cc shadow-sm"
        >
          <ArtSvgIcon icon="ri:car-fill" class="text-xl text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <h2
            class="m-0 text-base font-bold text-gray-800 dark:text-slate-100 tracking-tight uppercase"
          >
            Quản lý Tài sản Khách hàng
          </h2>
          <span
            class="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none"
            >Hồ sơ Pháp lý & Lịch sử Xe sạch</span
          >
        </div>
      </div>
      <ElButton type="primary" @click="loadLeads">
        <ArtSvgIcon icon="ri:refresh-line" /> Tải lại
      </ElButton>
    </div>

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
            placeholder="Tìm theo SĐT, Mã KH, Tên..."
            class="w-80 h-10 pl-10 pr-4 bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            @keyup.enter="handleSearch"
          />
        </div>
        <button
          @click="openAddDialog"
          class="bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <ArtSvgIcon icon="ri:file-add-line" class="text-blue-500" /> Thêm tài sản mới
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div
        class="w-[380px] bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col shrink-0"
      >
        <div
          class="p-4 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between"
        >
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >Danh sách khách hàng ({{ leads.length }})</span
          >
          <ArtSvgIcon icon="ri:sort-desc" class="text-gray-300" />
        </div>
        <div
          class="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2"
          v-loading="loadingLeads"
        >
          <div
            v-for="lead in leads"
            :key="lead.id"
            class="asset-item group p-4 rounded-2xl cursor-pointer transition-all border border-transparent"
            :class="
              selectedLeadId === lead.id
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900 shadow-sm'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800'
            "
            @click="selectedLeadId = lead.id"
          >
            <div class="flex gap-4 items-center">
              <div
                class="size-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex-cc font-bold text-lg shrink-0 shadow-inner"
              >
                {{ getInitials(lead.fullName) }}
              </div>
              <div class="flex-1 flex flex-col justify-center">
                <div class="flex justify-between items-start">
                  <span class="text-sm font-bold text-gray-800 dark:text-slate-100 leading-tight">{{
                    lead.fullName
                  }}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-bold text-gray-500 tracking-widest"
                    >#{{ lead.id }}</span
                  >
                  <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span class="text-[10px] font-bold text-gray-400 tracking-tighter">{{
                    lead.phoneNumber || 'Không có SĐT'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="selectedLead"
        class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50 dark:bg-slate-900/50"
        v-loading="loadingAssets"
      >
        <div class="mb-8 flex items-center gap-4">
          <div
            class="size-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex-cc shadow-sm text-blue-500"
          >
            <ArtSvgIcon icon="ri:user-3-fill" class="text-2xl" />
          </div>
          <div>
            <h1 class="m-0 text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              {{ selectedLead.fullName }}
            </h1>
            <p class="m-0 text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
              {{ selectedLead.phoneNumber || 'Chưa cập nhật SĐT' }} • KH #{{ selectedLead.id }} •
              {{ customerAssets.length }} TÀI SẢN
            </p>
          </div>
        </div>

        <div
          v-if="customerAssets.length === 0"
          class="flex flex-col items-center justify-center p-12 text-gray-300 dark:text-gray-600 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 border-dashed"
        >
          <ArtSvgIcon icon="ri:car-washing-line" class="text-6xl mb-4 opacity-50" />
          <span class="text-sm font-bold uppercase tracking-widest"
            >Khách hàng chưa sở hữu tài sản nào</span
          >
        </div>

        <div v-else class="flex flex-col gap-8">
          <div
            v-for="asset in customerAssets"
            :key="asset.id"
            class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm"
          >
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-4">
                <div
                  class="size-16 rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-gray-100 dark:border-slate-600"
                >
                  <img :src="getImageUrl(asset.imageUrl)" class="size-full object-cover" />
                </div>
                <div class="flex flex-col gap-2">
                  <h2 class="m-0 text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {{ asset.productName || `Xe máy #${asset.id}` }}
                  </h2>
                  <div class="flex gap-2">
                    <ElTag
                      effect="dark"
                      :class="
                        asset.licensePlate
                          ? 'bg-emerald-500 border-none'
                          : 'bg-orange-500 border-none'
                      "
                      class="font-bold text-[9px] rounded-lg"
                    >
                      {{ asset.licensePlate ? 'ĐÃ CÓ BIỂN' : 'CHƯA CẤP BIỂN' }}
                    </ElTag>
                    <ElTag
                      effect="plain"
                      class="border-blue-200 text-blue-600 font-bold text-[9px] rounded-lg"
                      >HỒ SƠ CHUẨN</ElTag
                    >
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="openEditDialog(asset)"
                  class="rounded-xl font-bold text-[9px] uppercase h-8 px-3 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600 transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ArtSvgIcon icon="ri:edit-line" /> Sửa
                </button>
                <button
                  @click="handleReportClick"
                  class="bg-white text-slate-800 border border-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 rounded-xl font-bold text-[9px] uppercase h-8 px-3 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArtSvgIcon icon="ri:file-pdf-line" class="text-blue-500" />
                  Báo cáo
                </button>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3 mb-6">
              <div
                v-for="spec in getAssetSpecs(asset)"
                :key="spec.label"
                class="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700"
              >
                <div class="flex items-center gap-2 mb-1">
                  <ArtSvgIcon :icon="spec.icon" class="text-gray-400 text-[10px]" />
                  <span class="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{{
                    spec.label
                  }}</span>
                </div>
                <span
                  class="text-[11px] font-bold text-gray-800 dark:text-slate-200 tracking-tight"
                  >{{ spec.value }}</span
                >
              </div>
            </div>

            <div>
              <div class="flex items-center gap-2 mb-3">
                <div class="w-1 h-3 bg-navy rounded-full"></div>
                <h3
                  class="m-0 text-[10px] font-bold text-gray-800 dark:text-slate-100 uppercase tracking-widest"
                >
                  Kho dữ liệu Pháp lý (Digital Vault)
                </h3>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="folder in vaultFolders"
                  :key="folder.title"
                  class="relative overflow-hidden bg-white dark:bg-slate-700 p-4 rounded-2xl border border-gray-100 dark:border-slate-600 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <img
                    :src="folder.preview"
                    class="absolute right-[-10px] top-[-10px] size-16 object-cover opacity-10 blur-[1px] group-hover:scale-125 transition-transform"
                  />
                  <div class="relative z-10 flex items-center gap-3">
                    <div
                      class="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex-cc shrink-0"
                    >
                      <ArtSvgIcon :icon="folder.icon" class="text-lg" />
                    </div>
                    <div>
                      <h4 class="m-0 text-xs font-bold text-gray-800 dark:text-slate-200">
                        {{ folder.title }}
                      </h4>
                      <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter"
                        >{{ folder.count }} tệp tin</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex-1 flex flex-cc flex-col gap-4 text-gray-300 dark:text-gray-600 bg-gray-50/50 dark:bg-slate-900/50"
      >
        <ArtSvgIcon icon="ri:folder-user-line" class="text-6xl opacity-20" />
        <span class="text-sm font-bold uppercase tracking-widest"
          >Vui lòng chọn một khách hàng để xem tài sản</span
        >
      </div>
    </div>

    <ElDialog
      v-model="addDialogVisible"
      title="THÊM PHƯƠNG TIỆN MỚI"
      width="600px"
      class="premium-dialog"
      destroy-on-close
    >
      <ElForm :model="form" label-position="top" class="grid grid-cols-2 gap-4">
        <ElFormItem label="Dòng xe / Mẫu xe" class="col-span-2 is-required">
          <ElSelect
            v-model="form.productId"
            placeholder="Chọn dòng xe trong hệ thống..."
            class="w-full"
          >
            <ElOption
              v-for="prod in productList"
              :key="prod.id"
              :label="prod.name"
              :value="prod.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Biển số xe" class="is-required">
          <ElInput v-model="form.licensePlate" placeholder="Ví dụ: 29A1-123.45" />
        </ElFormItem>
        <ElFormItem label="Khách hàng sở hữu" class="is-required">
          <ElSelect
            v-model="form.leadId"
            placeholder="Chọn khách hàng..."
            class="w-full"
            filterable
          >
            <ElOption
              v-for="lead in leadList"
              :key="lead.id"
              :label="lead.fullName + ' (' + lead.phoneNumber + ')'"
              :value="lead.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Số khung (VIN)" class="is-required">
          <ElInput v-model="form.vinNumber" placeholder="Nhập 17 ký tự số khung..." />
        </ElFormItem>
        <ElFormItem label="Số máy" class="is-required">
          <ElInput v-model="form.engineNumber" placeholder="Nhập số máy..." />
        </ElFormItem>
        <ElFormItem label="Ngày mua xe" class="col-span-2">
          <ElDatePicker
            v-model="form.purchaseDate"
            type="date"
            placeholder="Chọn ngày mua..."
            class="w-full"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <ElButton @click="addDialogVisible = false">Hủy bỏ</ElButton>
          <ElButton type="primary" :loading="submitLoading" @click="handleAddSubmit"
            >Lưu tài sản</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="editDialogVisible"
      title="CẬP NHẬT BIỂN SỐ XE"
      width="500px"
      class="premium-dialog"
      destroy-on-close
    >
      <ElForm :model="editForm" label-position="top">
        <ElFormItem label="Biển số xe mới" class="is-required">
          <ElInput v-model="editForm.licensePlate" placeholder="Ví dụ: 29A1-123.45" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <ElButton @click="editDialogVisible = false">Hủy bỏ</ElButton>
          <ElButton type="primary" :loading="editSubmitLoading" @click="handleEditSubmit"
            >Lưu thay đổi</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { VehicleApi, type Vehicle } from '@/api/vehicle';
import { ProductApi } from '@/api/product';
import { fetchGetLeadList } from '@/api/customer/lead.api';

defineOptions({ name: 'CustomerAsset' });

const router = useRouter();
const loadingLeads = ref(false);
const loadingAssets = ref(false);
const leads = ref<any[]>([]);
const customerAssets = ref<any[]>([]);
const selectedLeadId = ref<number | null>(null);

const filters = reactive<{ keyword: string }>({ keyword: '' });

const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editSubmitLoading = ref(false);
const submitLoading = ref(false);
const leadList = ref<any[]>([]);
const productList = ref<any[]>([]);
const editForm = ref({
  id: 0,
  licensePlate: '',
});

const form = ref({
  productId: null as number | null,
  licensePlate: '',
  leadId: null as number | null,
  vinNumber: '',
  engineNumber: '',
  purchaseDate: '',
});

const getInitials = (name: string) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const getImageUrl = (url?: string) => {
  if (!url)
    return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000';
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const loadLeads = async () => {
  loadingLeads.value = true;
  try {
    const apiParams: any = { current: 1, size: 50 };
    if (filters.keyword.trim()) {
      apiParams.Filters = `search=${filters.keyword.trim()}`;
    }
    const res = await fetchGetLeadList(apiParams);
    leads.value = Array.isArray(res) ? res : (res as any).items || (res as any).records || [];

    if (leads.value.length > 0 && selectedLeadId.value === null) {
      selectedLeadId.value = leads.value[0].id;
    } else if (leads.value.length === 0) {
      selectedLeadId.value = null;
    }
  } catch (error: any) {
    ElMessage.error(error?.message || 'Không thể tải danh sách khách hàng');
  } finally {
    loadingLeads.value = false;
  }
};

const loadCustomerAssets = async (leadId: number) => {
  loadingAssets.value = true;
  customerAssets.value = [];
  try {
    const res = await VehicleApi.getList({
      current: 1,
      size: 50,
      Filters: `LeadId==${leadId}`,
    });
    customerAssets.value = res.items || [];
  } catch (err: any) {
    ElMessage.error(err.message || 'Lỗi khi tải danh sách phương tiện của khách hàng');
  } finally {
    loadingAssets.value = false;
  }
};

watch(selectedLeadId, (newId) => {
  if (newId) {
    loadCustomerAssets(newId);
  } else {
    customerAssets.value = [];
  }
});

const openAddDialog = async () => {
  form.value = {
    productId: null,
    licensePlate: '',
    leadId: selectedLeadId.value,
    vinNumber: '',
    engineNumber: '',
    purchaseDate: new Date().toISOString(),
  };
  addDialogVisible.value = true;

  try {
    const [leadsRes, prodsRes] = await Promise.all([
      fetchGetLeadList({ Page: 1, PageSize: 1000 }),
      ProductApi.getList({ current: 1, size: 100 }),
    ]);
    leadList.value = Array.isArray(leadsRes)
      ? leadsRes
      : (leadsRes as any).items || (leadsRes as any).records || [];
    productList.value = prodsRes.items || [];
  } catch {
    ElMessage.error('Không thể tải danh sách danh mục và khách hàng');
  }
};

const handleAddSubmit = async () => {
  if (
    !form.value.productId ||
    !form.value.licensePlate ||
    !form.value.leadId ||
    !form.value.vinNumber ||
    !form.value.engineNumber
  ) {
    ElMessage.warning('Vui lòng nhập đầy đủ các trường thông tin bắt buộc');
    return;
  }

  submitLoading.value = true;
  try {
    await VehicleApi.create({
      leadId: form.value.leadId,
      productId: form.value.productId,
      vinNumber: form.value.vinNumber,
      engineNumber: form.value.engineNumber,
      licensePlate: form.value.licensePlate,
      purchaseDate: form.value.purchaseDate,
    });

    ElMessage.success('Đã thêm phương tiện mới thành công!');
    addDialogVisible.value = false;

    if (selectedLeadId.value === form.value.leadId) {
      loadCustomerAssets(selectedLeadId.value);
    } else {
      selectedLeadId.value = form.value.leadId;
    }
  } catch (err: any) {
    ElMessage.error(err.message || 'Lỗi khi lưu phương tiện mới');
  } finally {
    submitLoading.value = false;
  }
};

const selectedLead = computed(() => leads.value.find((l) => l.id === selectedLeadId.value));

const handleSearch = () => {
  loadLeads();
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return dayjs(value).format('DD/MM/YYYY');
};

const vaultFolders = computed(() => [
  {
    title: 'Đăng ký xe & Cavet',
    icon: 'ri:file-text-line',
    count: 2,
    preview:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=200',
  },
  {
    title: 'Đăng kiểm & Bảo hiểm',
    icon: 'ri:shield-check-line',
    count: 1,
    preview:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=200',
  },
  {
    title: 'Hóa đơn & Hợp đồng',
    icon: 'ri:bill-line',
    count: 1,
    preview:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=200',
  },
]);

const getAssetSpecs = (v: any) => {
  return [
    {
      label: 'Thể loại',
      value: v?.categoryName || 'Xe máy',
      icon: 'ri:motorbike-line',
    },
    {
      label: 'Phiên bản',
      value: v?.variantName || '-',
      icon: 'ri:settings-5-line',
    },
    { label: 'Màu sắc', value: v?.colorName || '-', icon: 'ri:palette-line' },
    { label: 'Số khung', value: v?.vinNumber || '-', icon: 'ri:barcode-line' },
    {
      label: 'Số máy',
      value: v?.engineNumber || '-',
      icon: 'ri:settings-3-line',
    },
    {
      label: 'Ngày mua',
      value: formatDate(v?.purchaseDate),
      icon: 'ri:calendar-line',
    },
    {
      label: 'Biển số',
      value: v?.licensePlate || 'Chưa cấp biển',
      icon: 'ri:git-commit-line',
    },
  ];
};

const openEditDialog = (asset: any) => {
  editForm.value = {
    id: asset.id,
    licensePlate: asset.licensePlate || '',
  };
  editDialogVisible.value = true;
};

const handleEditSubmit = async () => {
  if (!editForm.value.licensePlate.trim()) {
    ElMessage.warning('Vui lòng nhập biển số xe');
    return;
  }

  editSubmitLoading.value = true;
  try {
    await VehicleApi.updateLicensePlate(editForm.value.id, editForm.value.licensePlate.trim());
    ElMessage.success('Cập nhật biển số xe thành công!');
    editDialogVisible.value = false;
    if (selectedLeadId.value) {
      loadCustomerAssets(selectedLeadId.value);
    }
  } catch (err: any) {
    ElMessage.error(err.message || 'Lỗi khi cập nhật biển số xe');
  } finally {
    editSubmitLoading.value = false;
  }
};

const handleReportClick = () => {
  ElMessage.info('Tính năng Báo cáo/Xuất PDF đang được phát triển.');
};

onMounted(loadLeads);
</script>

<style scoped lang="scss">
.customer-asset-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(156 163 175 / 50%);
    border-radius: 4px;
  }
}
</style>
