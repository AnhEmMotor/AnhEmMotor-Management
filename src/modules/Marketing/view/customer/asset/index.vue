<template>
  <div
    class="customer-asset-page flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#020617] overflow-hidden"
  >
    <div
      class="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl flex-cc shadow-sm"
        >
          <ArtSvgIcon
            icon="ri:car-fill"
            class="text-xl text-blue-500 dark:text-blue-400"
          />
        </div>
        <div>
          <h2
            class="m-0 text-base font-black text-gray-800 dark:text-slate-100 tracking-tight uppercase"
          >
            Quản lý Tài sản Khách hàng
          </h2>
          <span
            class="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none"
            >Hồ sơ Pháp lý & Lịch sử Xe sạch</span
          >
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="search-box relative">
          <ArtSvgIcon
            icon="ri:search-line"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm theo Biển số hoặc 5 số cuối Số khung..."
            class="w-80 h-10 pl-10 pr-4 bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <button
          @click="openAddDialog"
          class="bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 h-10 px-4 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <ArtSvgIcon icon="ri:file-add-line" class="text-blue-500" /> Thêm tài
          sản mới
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
          <span
            class="text-[10px] font-black text-gray-400 uppercase tracking-widest"
            >Danh sách tài sản ({{ assets.length }})</span
          >
          <ArtSvgIcon icon="ri:sort-desc" class="text-gray-300" />
        </div>

        <div
          class="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2"
        >
          <div
            v-for="asset in assets"
            :key="asset.id"
            class="asset-item group p-4 rounded-2xl cursor-pointer transition-all border border-transparent"
            :class="
              selectedAssetId === asset.id
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900 shadow-sm'
                : 'hover:bg-gray-50 dark:hover:bg-slate-850'
            "
            @click="selectedAssetId = asset.id"
          >
            <div class="flex gap-4">
              <div
                class="size-16 rounded-xl bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-gray-100 dark:border-slate-800 group-hover:scale-105 transition-transform"
              >
                <img :src="asset.image" class="size-full object-cover" />
              </div>
              <div class="flex-1 flex flex-col justify-center">
                <div class="flex justify-between items-start">
                  <span
                    class="text-sm font-black text-gray-800 dark:text-slate-100 leading-tight"
                    >{{ asset.model }}</span
                  >

                  <div v-if="asset.needsService" class="maintenance-bell">
                    <ElTooltip content="Đến hạn bảo trì (Thay nhớt)">
                      <ArtSvgIcon
                        icon="ri:notification-3-fill"
                        class="text-red-500 animate-swing text-sm"
                      />
                    </ElTooltip>
                  </div>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <div
                    class="bg-gray-800 text-white px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest shadow-sm"
                  >
                    {{ asset.plate }}
                  </div>
                  <span
                    class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter"
                    >{{ asset.owner }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="selectedAsset"
        class="flex-1 overflow-y-auto p-8 custom-scrollbar"
      >
        <div class="flex justify-between items-start mb-8">
          <div class="flex flex-col gap-2">
            <h1
              class="m-0 text-3xl font-black text-gray-800 dark:text-white tracking-tight"
            >
              {{ selectedAsset.model }}
            </h1>
            <div class="flex gap-3">
              <ElTag
                effect="dark"
                class="bg-emerald-500 border-none font-black text-[10px] rounded-lg"
                >ĐÃ CÓ BIỂN</ElTag
              >
              <ElTag
                effect="plain"
                class="border-blue-200 text-blue-600 font-black text-[10px] rounded-lg"
                >HỒ SƠ CHUẨN</ElTag
              >
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="rounded-xl font-black text-[10px] uppercase h-10 px-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ArtSvgIcon icon="ri:edit-line" /> Chỉnh sửa
            </button>
            <button
              class="bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase h-10 px-4 shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ArtSvgIcon icon="ri:file-pdf-line" class="text-blue-500" /> Xuất
              báo cáo PDF
            </button>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-4 mb-10">
          <div
            v-for="spec in assetSpecs"
            :key="spec.label"
            class="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:border-blue-200 dark:hover:border-blue-800"
          >
            <div class="flex items-center gap-2.5 mb-2">
              <div
                class="size-7 rounded-lg bg-gray-50 dark:bg-slate-800 flex-cc text-gray-400"
              >
                <ArtSvgIcon :icon="spec.icon" class="text-xs" />
              </div>
              <span
                class="text-[9px] font-black text-gray-400 uppercase tracking-widest"
                >{{ spec.label }}</span
              >
            </div>
            <span
              class="text-xs font-black text-gray-800 dark:text-slate-200 tracking-tight"
              >{{ spec.value }}</span
            >
          </div>
        </div>

        <div class="mb-12">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-1 h-4 bg-navy rounded-full"></div>
            <h3
              class="m-0 text-xs font-black text-gray-800 dark:text-slate-100 uppercase tracking-widest"
            >
              Kho dữ liệu Pháp lý (Digital Vault)
            </h3>
          </div>
          <div class="grid grid-cols-3 gap-6">
            <div
              v-for="folder in vaultFolders"
              :key="folder.title"
              class="vault-folder relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <img
                :src="folder.preview"
                class="absolute right-[-20px] top-[-20px] size-24 object-cover opacity-10 blur-[2px] group-hover:scale-125 transition-transform"
              />

              <div class="relative z-10">
                <div class="flex justify-between items-start mb-4">
                  <div
                    class="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex-cc shadow-inner"
                  >
                    <ArtSvgIcon :icon="folder.icon" class="text-xl" />
                  </div>
                  <div
                    class="size-8 bg-white/80 dark:bg-slate-800 backdrop-blur-md rounded-full flex-cc opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <ArtSvgIcon icon="ri:zoom-in-line" class="text-gray-400" />
                  </div>
                </div>
                <h4
                  class="m-0 text-sm font-black text-gray-800 dark:text-slate-200 mb-1"
                >
                  {{ folder.title }}
                </h4>
                <span
                  class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter"
                  >{{ folder.count }} tệp tin • Bảo mật</span
                >
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-2">
              <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
              <h3
                class="m-0 text-xs font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest"
              >
                Lịch sử "Xe sạch" (Verified Timeline)
              </h3>
            </div>
            <div
              class="next-service-banner bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-3"
            >
              <ArtSvgIcon
                icon="ri:notification-badge-line"
                class="text-emerald-600 animate-pulse"
              />
              <div class="flex flex-col">
                <span
                  class="text-[9px] font-black text-emerald-600 uppercase tracking-widest"
                  >Bảo trì kế tiếp (Dự kiến)</span
                >
                <span
                  class="text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase"
                  >10,000 KM • Sau 45 ngày nữa</span
                >
              </div>
            </div>
          </div>

          <div
            class="timeline-container relative pl-8 border-l-2 border-gray-100 dark:border-slate-800 ml-4 flex flex-col gap-10"
          >
            <div
              v-for="event in maintenanceHistory"
              :key="event.id"
              class="timeline-item relative"
            >
              <div
                class="absolute -left-[41px] top-0 size-5 rounded-full border-4 border-[#F8F9FA] bg-emerald-500 shadow-sm shadow-emerald-200"
              ></div>

              <div
                class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center gap-4">
                    <span class="text-[11px] font-black text-gray-800">{{
                      event.date
                    }}</span>
                    <div class="h-3 w-px bg-gray-200"></div>
                    <div
                      class="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full"
                    >
                      <ArtSvgIcon
                        icon="ri:check-double-line"
                        class="text-[10px] text-emerald-600"
                      />
                      <span
                        class="text-[9px] font-black text-emerald-600 uppercase tracking-tighter"
                        >Verified by AEM</span
                      >
                    </div>
                  </div>
                  <span class="text-[11px] font-black text-gray-400"
                    >{{ event.km }} KM</span
                  >
                </div>
                <h5
                  class="m-0 text-sm font-black text-gray-800 dark:text-slate-200 mb-2"
                >
                  {{ event.title }}
                </h5>
                <p
                  class="m-0 text-xs text-gray-500 dark:text-slate-400 leading-relaxed"
                >
                  {{ event.note }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-cc flex-col gap-4 text-gray-300">
        <ArtSvgIcon icon="ri:car-washing-line" class="text-6xl opacity-20" />
        <span class="text-sm font-bold uppercase tracking-widest"
          >Vui lòng chọn một tài sản để xem chi tiết</span
        >
      </div>
    </div>

    <!-- Dialog Thêm tài sản mới -->
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
          <ElInput
            v-model="form.licensePlate"
            placeholder="Ví dụ: 29A1-123.45"
          />
        </ElFormItem>

        <ElFormItem label="Khách hàng sở hữu" class="is-required">
          <ElSelect
            v-model="form.leadId"
            placeholder="Chọn khách hàng..."
            class="w-full"
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
          <ElInput
            v-model="form.vinNumber"
            placeholder="Nhập 17 ký tự số khung..."
          />
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
          <ElButton
            type="primary"
            :loading="submitLoading"
            @click="handleAddSubmit"
            >Lưu tài sản</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { VehicleApi } from "@/api/vehicle";
import { RepairOrderApi } from "@/api/sales";
import { ProductApi } from "@/api/product";
import { fetchGetLeadList } from "@/api/customer/lead.api";

defineOptions({ name: "CustomerAsset" });

const selectedAssetId = ref<number | null>(null);
const rawVehicles = ref<any[]>([]);
const assets = ref<any[]>([]);
const maintenanceHistory = ref<any[]>([]);

const addDialogVisible = ref(false);
const submitLoading = ref(false);
const leadList = ref<any[]>([]);
const productList = ref<any[]>([]);

const form = ref({
  productId: null as number | null,
  licensePlate: "",
  leadId: null as number | null,
  vinNumber: "",
  engineNumber: "",
  purchaseDate: "",
});

const getMockAssets = () => {
  return [
    {
      id: -1,
      model: "Honda SH 160i ABS 2024",
      plate: "29A1-999.99",
      owner: "Lê Minh Hiếu",
      image:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200",
      needsService: true,
      vinNumber: "RLHJK12A34M567890",
      engineNumber: "JF96E-1002345",
      purchaseDate: "2023-05-15T00:00:00Z",
    },
    {
      id: -2,
      model: "Honda Winner X v4 Côn tay",
      plate: "59F1-888.88",
      owner: "Trần Thị Mai",
      image:
        "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=200",
      needsService: false,
      vinNumber: "RLHJK12B45M987654",
      engineNumber: "K02E-2004567",
      purchaseDate: "2024-01-10T00:00:00Z",
    },
    {
      id: -3,
      model: "Honda Air Blade 160 Đặc biệt",
      plate: "60B1-777.77",
      owner: "Nguyễn Văn Nam",
      image:
        "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=200",
      needsService: false,
      vinNumber: "RLHJK12C78M456123",
      engineNumber: "JF97E-3004512",
      purchaseDate: "2023-11-20T00:00:00Z",
    },
  ];
};

const fetchVehicles = async () => {
  try {
    const res = await VehicleApi.getList({ current: 1, size: 100 });
    rawVehicles.value = res.items || [];

    const realAssets = rawVehicles.value.map((v: any) => ({
      id: v.id,
      model: v.product?.name || `Xe máy #${v.id}`,
      plate: v.licensePlate || "Chưa cấp biển",
      owner: v.lead?.fullName || "Ẩn danh",
      image:
        "https://images.unsplash.com/photo-1611311025708-659a84495574?auto=format&fit=crop&q=80&w=200",
      needsService: false,
    }));

    if (rawVehicles.value.length > 5) {
      assets.value = realAssets;
    } else {
      assets.value = [...realAssets, ...getMockAssets()];
    }

    if (assets.value.length > 0 && selectedAssetId.value === null) {
      selectedAssetId.value = assets.value[0].id;
    }
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tải danh sách phương tiện");
  }
};

const fetchMaintenanceHistory = async (vehicleId: number) => {
  if (vehicleId < 0) {
    maintenanceHistory.value = [
      {
        id: 1,
        date: "15/12/2023",
        km: 1500,
        title: "Bảo dưỡng định kỳ lần 1",
        note: "Chi phí: 150,000 VND. Thay nhớt động cơ Motul, vệ sinh lưới lọc, tăng xích, kiểm tra áp suất lốp. Thợ phụ trách: Nguyễn Hoàng Nam. Trạng thái: Hoàn thành.",
      },
      {
        id: 2,
        date: "20/04/2024",
        km: 5000,
        title: "Bảo dưỡng định kỳ lần 2 & Vệ sinh côn",
        note: "Chi phí: 450,000 VND. Thay nhớt máy và nhớt hộp số, vệ sinh nồi côn, căn chỉnh phanh đĩa. Thợ phụ trách: Lê Văn Hải. Trạng thái: Hoàn thành.",
      },
    ];
    return;
  }

  try {
    const res = await RepairOrderApi.getList({
      current: 1,
      size: 50,
      Filters: `VehicleId==${vehicleId}`,
    });
    maintenanceHistory.value = (res.items || []).map((ro: any) => ({
      id: ro.id,
      date: ro.completedDate
        ? new Date(ro.completedDate).toLocaleDateString("vi-VN")
        : new Date(ro.createdAt).toLocaleDateString("vi-VN"),
      km: ro.mileage || 0,
      title: ro.description || "Bảo trì sửa chữa",
      note: `Chi phí: ${ro.totalAmount.toLocaleString("vi-VN")} VND. Thợ phụ trách: ${ro.technicianName || "Chưa phân công"}. Trạng thái: ${ro.status}. ${ro.notes || ""}`,
    }));
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tải lịch sử bảo trì");
  }
};

const openAddDialog = async () => {
  form.value = {
    productId: null,
    licensePlate: "",
    leadId: null,
    vinNumber: "",
    engineNumber: "",
    purchaseDate: new Date().toISOString(),
  };

  addDialogVisible.value = true;

  try {
    const [leadsRes, prodsRes] = await Promise.all([
      fetchGetLeadList(),
      ProductApi.getList({ current: 1, size: 100 }),
    ]);

    leadList.value = Array.isArray(leadsRes)
      ? leadsRes
      : (leadsRes as any).items || [];
    productList.value = prodsRes.items || [];
  } catch (err: any) {
    ElMessage.error("Không thể tải danh sách danh mục và khách hàng");
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
    ElMessage.warning("Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
    return;
  }

  submitLoading.value = true;
  try {
    await VehicleApi.create({
      lead_id: form.value.leadId,
      product_id: form.value.productId,
      vin_number: form.value.vinNumber,
      engine_number: form.value.engineNumber,
      license_plate: form.value.licensePlate,
      purchase_date: form.value.purchaseDate,
    });

    ElMessage.success("Đã thêm phương tiện mới thành công!");
    addDialogVisible.value = false;
    fetchVehicles();
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi lưu phương tiện mới");
  } finally {
    submitLoading.value = false;
  }
};

const selectedAsset = computed(() =>
  assets.value.find((a) => a.id === selectedAssetId.value),
);

const selectedRawVehicle = computed(() => {
  const id = selectedAssetId.value;
  if (id && id < 0) {
    const mock = assets.value.find((a) => a.id === id);
    return mock
      ? {
          id: mock.id,
          vinNumber: mock.vinNumber,
          engineNumber: mock.engineNumber,
          purchaseDate: mock.purchaseDate,
          fullName: mock.owner,
          licensePlate: mock.plate,
        }
      : null;
  }
  return rawVehicles.value.find((v) => v.id === selectedAssetId.value);
});

const assetSpecs = computed(() => {
  const v = selectedRawVehicle.value;
  if (!v) return [];
  return [
    { label: "Số khung", value: v.vinNumber || "N/A", icon: "ri:barcode-line" },
    {
      label: "Số máy",
      value: v.engineNumber || "N/A",
      icon: "ri:settings-line",
    },
    {
      label: "Ngày mua",
      value: v.purchaseDate
        ? new Date(v.purchaseDate).toLocaleDateString("vi-VN")
        : "N/A",
      icon: "ri:calendar-line",
    },
    { label: "Đăng kiểm/Phí", value: "Không bắt buộc", icon: "ri:shield-line" },
    {
      label: "Bảo hành đến",
      value: v.purchaseDate
        ? new Date(
            new Date(v.purchaseDate).setFullYear(
              new Date(v.purchaseDate).getFullYear() + 3,
            ),
          ).toLocaleDateString("vi-VN")
        : "3 năm kể từ ngày mua",
      icon: "ri:verified-badge-line",
    },
  ];
});

const vaultFolders = [
  {
    title: "Đăng ký xe",
    icon: "ri:file-list-line",
    count: "2",
    preview:
      "https://images.unsplash.com/photo-1589330694653-9ecf794ff8a3?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "Bảo hiểm dân sự",
    icon: "ri:shield-user-line",
    count: "1",
    preview:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "Hóa đơn mua hàng",
    icon: "ri:bill-line",
    count: "3",
    preview:
      "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=200",
  },
];

watch(selectedAssetId, (newVal) => {
  if (newVal) {
    fetchMaintenanceHistory(newVal);
  }
});

onMounted(() => {
  fetchVehicles();
});
</script>

<style lang="scss" scoped>
.customer-asset-page {
  .bg-navy {
    background-color: #001529;
  }

  .text-navy {
    color: #001529;
  }

  .custom-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  }

  .animate-swing {
    transform-origin: top center;
    animation: swing 2s infinite ease-in-out;
  }

  @keyframes swing {
    0% {
      transform: rotate(0deg);
    }

    10% {
      transform: rotate(15deg);
    }

    20% {
      transform: rotate(-10deg);
    }

    30% {
      transform: rotate(5deg);
    }

    40% {
      transform: rotate(-5deg);
    }

    50% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(0deg);
    }
  }

  .timeline-container {
    &::before {
      position: absolute;
      bottom: 0;
      left: -1px;
      width: 2px;
      height: 40px;
      content: "";
      background: linear-gradient(to bottom, #f1f5f9, transparent);
    }
  }
}
</style>
