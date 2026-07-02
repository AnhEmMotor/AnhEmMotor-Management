<template>
  <div
    class="banner-management-page min-h-full font-inter text-[#0F172A] dark:text-slate-100 pb-10"
  >
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-[50] shadow-sm"
    >
      <div
        class="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-slate-100 shadow-sm"
          >
            <ArtSvgIcon icon="ri:advertisement-line" class="text-2xl" />
          </div>
          <div>
            <h1
              class="m-0 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none"
            >
              {{ $t("marketing.bannerManagement.title") }}
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="handleAddBanner"
            class="h-11 px-8 bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:add-fill" class="text-blue-500" />
            {{ $t("marketing.bannerManagement.createBtn") }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-8 max-w-[1400px] mx-auto">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="banner-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group relative"
        >
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span
              class="px-3 py-1 bg-blue-600/90 text-white text-[10px] font-black uppercase rounded-lg shadow-sm backdrop-blur-md"
            >
              {{ getPlacementLabel(banner.placement) }}
            </span>
          </div>

          <div
            class="aspect-[21/9] bg-slate-900 relative overflow-hidden group/img"
          >
            <img
              :src="
                viewMode === 'Desktop'
                  ? banner.desktopImageUrl
                  : banner.mobileImageUrl
              "
              class="w-full h-full object-cover opacity-80 group-hover/img:scale-105 transition-transform duration-700"
            />

            <div
              class="absolute top-4 right-4 flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20"
            >
              <button
                @click.stop="viewMode = 'Desktop'"
                class="px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all"
                :class="
                  viewMode === 'Desktop'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/60 hover:text-white'
                "
              >
                {{ $t("marketing.bannerManagement.pc") }}
              </button>
              <button
                @click.stop="viewMode = 'Mobile'"
                class="px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all"
                :class="
                  viewMode === 'Mobile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/60 hover:text-white'
                "
              >
                {{ $t("marketing.bannerManagement.mb") }}
              </button>
            </div>

            <div
              class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-between items-center gap-4"
            >
              <h2
                class="m-0 text-lg font-black text-white leading-tight truncate"
              >
                {{ banner.title }}
              </h2>
              <div class="flex gap-2 shrink-0">
                <button
                  @click.stop="handleEdit(banner)"
                  class="h-10 px-6 bg-slate-900/90 backdrop-blur-md text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  {{ $t("marketing.bannerManagement.editBtn") }}
                </button>
                <button
                  @click.stop="handleDelete(banner)"
                  class="size-10 rounded-xl flex-cc bg-red-600/90 backdrop-blur-md text-white hover:bg-red-700 transition-all shadow-lg"
                >
                  <ArtSvgIcon icon="ri:delete-bin-line" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      custom-class="combat-banner-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="flex items-center gap-4">
          <div
            class="size-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-slate-100 shadow-sm"
          >
            <ArtSvgIcon icon="ri:image-edit-line" class="text-2xl" />
          </div>
          <div>
            <h3
              class="m-0 font-black uppercase text-xs tracking-[0.2em] text-slate-800 dark:text-slate-100"
            >
              {{ dialogTitle }}
            </h3>
          </div>
        </div>
      </template>

      <div class="py-4 grid grid-cols-2 gap-8">
        <div class="space-y-5">
          <div>
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
              >{{ $t("marketing.bannerManagement.formTitle") }}</label
            >
            <ElInput
              v-model="bannerForm.title"
              placeholder="VD: Ưu đãi lễ 30/4 - Giảm giá xe cực sốc"
              class="combat-input"
            />
          </div>

          <div>
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
              >{{ $t("marketing.bannerManagement.formPlacement") }}</label
            >
            <ElSelect
              v-model="bannerForm.placement"
              placeholder="Chọn vị trí"
              class="w-full combat-input"
            >
              <ElOption
                v-for="p in placementOptions"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              />
            </ElSelect>
          </div>

          <div>
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
              >{{ $t("marketing.bannerManagement.formDesc") }}</label
            >
            <ElInput
              v-model="bannerForm.description"
              type="textarea"
              :rows="2"
              placeholder="VD: Nhập mã KHUYENMAI để được giảm 5 triệu..."
              class="combat-input"
            />
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >{{ $t("marketing.bannerManagement.formCtaLabel") }}</label
              >
              <ElInput
                v-model="bannerForm.ctaLabel"
                placeholder="VD: Mua ngay"
                class="combat-input"
              />
            </div>
          </div>

          <div>
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
              >{{ $t("marketing.bannerManagement.formCtaLink") }}</label
            >
            <ElInput
              v-model="bannerForm.ctaLink"
              placeholder="https://..."
              class="combat-input"
            >
              <template #prefix><ArtSvgIcon icon="ri:links-line" /></template>
            </ElInput>
          </div>
        </div>

        <div class="space-y-6">
          <div
            class="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800"
          >
            <label
              class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 block"
              >{{ $t("marketing.bannerManagement.formDesktopImg") }}</label
            >
            <ElUpload
              class="w-full block combat-banner-upload"
              action="#"
              :show-file-list="false"
              :auto-upload="true"
              :http-request="handleUploadDesktop"
              accept="image/*"
            >
              <div
                class="aspect-[21/9] w-full bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex-cc flex-col gap-2 cursor-pointer hover:border-blue-400 transition-all overflow-hidden relative"
              >
                <img
                  v-if="bannerForm.desktopImageUrl"
                  :src="bannerForm.desktopImageUrl"
                  class="w-full h-full object-cover"
                />
                <template v-else>
                  <ArtSvgIcon
                    icon="ri:computer-line"
                    class="text-2xl text-slate-300 dark:text-slate-600"
                  />
                  <span
                    class="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500"
                    >Chọn ảnh Desktop</span
                  >
                </template>
              </div>
            </ElUpload>
          </div>

          <div
            class="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800"
          >
            <label
              class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 block"
              >{{ $t("marketing.bannerManagement.formMobileImg") }}</label
            >
            <ElUpload
              class="w-full block combat-banner-upload"
              action="#"
              :show-file-list="false"
              :auto-upload="true"
              :http-request="handleUploadMobile"
              accept="image/*"
            >
              <div
                class="aspect-[4/5] h-40 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex-cc flex-col gap-2 cursor-pointer hover:border-emerald-400 transition-all mx-auto overflow-hidden relative"
              >
                <img
                  v-if="bannerForm.mobileImageUrl"
                  :src="bannerForm.mobileImageUrl"
                  class="w-full h-full object-cover"
                />
                <template v-else>
                  <ArtSvgIcon
                    icon="ri:smartphone-line"
                    class="text-2xl text-slate-300 dark:text-slate-600"
                  />
                  <span
                    class="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500"
                    >Chọn ảnh Mobile</span
                  >
                </template>
              </div>
            </ElUpload>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2"></div>
          <div class="flex gap-3">
            <button
              @click="dialogVisible = false"
              class="h-11 px-6 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-700"
            >
              {{ $t("marketing.bannerManagement.closeBtn") }}
            </button>
            <button
              @click="saveBanner"
              class="h-11 px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              {{
                isEditing
                  ? $t("marketing.bannerManagement.saveBtn")
                  : $t("marketing.bannerManagement.createSubmitBtn")
              }}
            </button>
          </div>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { BannerApi } from "@/api/marketing";
import { FileApi } from "@/api/operations";

import { useI18n } from "vue-i18n";

defineOptions({ name: "MarketingBannerManagement" });

const { t } = useI18n();

const viewMode = ref("Desktop");
const dialogVisible = ref(false);
const dialogTitle = ref("");
const isEditing = ref(false);

const banners = ref<any[]>([]);
const placementOptions = ref<any[]>([]);

const getPlacementLabel = (value: string) => {
  const opt = placementOptions.value.find((o) => o.value === value);
  return opt ? opt.label : value;
};

const bannerForm = ref({
  id: 0,
  title: "",
  description: "",
  ctaLabel: "Xem ngay",
  ctaLink: "",
  desktopImageUrl: "",
  mobileImageUrl: "",
  placement: "Home",
});

const fetchBanners = async () => {
  try {
    const res = await BannerApi.getList({ size: 100 });
    banners.value = res.items || [];
  } catch {
    ElMessage.error("Lỗi khi tải danh sách banner");
  }
};

const fetchPlacements = async () => {
  try {
    const res: any = await BannerApi.getPlacements();
    placementOptions.value = res.data || res || [];
  } catch {
    ElMessage.error("Lỗi khi tải danh sách vị trí");
  }
};

onMounted(() => {
  fetchPlacements();
  fetchBanners();
});

const handleUploadDesktop = async (options: any) => {
  try {
    const res = await FileApi.uploadBannerImage(options.file);
    bannerForm.value.desktopImageUrl = res.publicUrl;
    ElMessage.success("Tải ảnh Desktop lên thành công");
  } catch (err: any) {
    ElMessage.error(err.message || "Tải ảnh thất bại");
  }
};

const handleUploadMobile = async (options: any) => {
  try {
    const res = await FileApi.uploadBannerImage(options.file);
    bannerForm.value.mobileImageUrl = res.publicUrl;
    ElMessage.success("Tải ảnh Mobile lên thành công");
  } catch (err: any) {
    ElMessage.error(err.message || "Tải ảnh thất bại");
  }
};

const handleAddBanner = () => {
  isEditing.value = false;
  dialogTitle.value = t("marketing.bannerManagement.createTitle");
  bannerForm.value = {
    id: 0,
    title: "",
    description: "",
    ctaLabel: "Xem ngay",
    ctaLink: "",
    desktopImageUrl: "",
    mobileImageUrl: "",
    placement: "Home",
  };
  dialogVisible.value = true;
};

const handleEdit = (banner: any) => {
  isEditing.value = true;
  dialogTitle.value = t("marketing.bannerManagement.editTitle");
  bannerForm.value = {
    ...banner,
    placement: banner.placement || "Home",
  };
  dialogVisible.value = true;
};

const saveBanner = async () => {
  if (!bannerForm.value.title) {
    ElMessage.warning("Vui lòng nhập tiêu đề banner");
    return;
  }
  if (!bannerForm.value.placement) {
    ElMessage.warning("Vui lòng chọn vị trí hiển thị");
    return;
  }
  if (!bannerForm.value.description) {
    ElMessage.warning("Vui lòng nhập mô tả banner");
    return;
  }
  if (!bannerForm.value.ctaLabel) {
    ElMessage.warning("Vui lòng nhập nhãn nút bấm (CTA Label)");
    return;
  }
  if (!bannerForm.value.ctaLink) {
    ElMessage.warning("Vui lòng nhập đường dẫn đích (CTA Link)");
    return;
  }
  if (!bannerForm.value.desktopImageUrl && !bannerForm.value.mobileImageUrl) {
    ElMessage.warning("Vui lòng tải lên ít nhất 1 ảnh (Desktop hoặc Mobile)");
    return;
  }
  try {
    const payload = {
      ...bannerForm.value,
    };

    if (isEditing.value && bannerForm.value.id) {
      await BannerApi.update(bannerForm.value.id, payload);
      ElMessage.success("Cập nhật banner thành công");
    } else {
      await BannerApi.create(payload);
      ElMessage.success("Tạo banner thành công");
    }
    dialogVisible.value = false;
    fetchBanners();
  } catch {
    ElMessage.error("Có lỗi xảy ra khi lưu banner");
  }
};

const handleDelete = (banner: any) => {
  ElMessageBox.confirm("Bạn có chắc chắn muốn xóa banner này?", "Cảnh báo", {
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    type: "warning",
  })
    .then(async () => {
      try {
        await BannerApi.delete(banner.id);
        ElMessage.success("Xóa banner thành công");
        fetchBanners();
      } catch {
        ElMessage.error("Lỗi khi xóa banner");
      }
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
.banner-management-page {
  .combat-input {
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      background-color: var(--el-fill-color-blank);
      border: 1px solid var(--el-border-color-light);
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .combat-number {
    :deep(.el-input-number__increase),
    :deep(.el-input-number__decrease) {
      background: var(--el-fill-color-light);
      border: none;
      border-radius: 8px;
    }
  }

  .combat-range {
    background-color: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 12px;
    box-shadow: none;
  }

  .combat-banner-upload {
    :deep(.el-upload) {
      display: block;
      width: 100%;
    }
  }
}

:deep(.combat-banner-dialog) {
  border-radius: 32px;

  .el-dialog__header {
    padding: 32px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .el-dialog__footer {
    padding: 24px 32px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

// Dark Mode overrides
:global(html.dark .banner-management-page) {
  background-color: #05070b !important;
  color: #f8fafc !important;
}

:global(html.dark .banner-management-page .bg-white) {
  background-color: #10141c !important;
}

:global(html.dark .banner-management-page .banner-card.bg-white) {
  background-color: #10141c !important;
  border-color: rgb(255 255 255 / 12%) !important;
}

:global(html.dark .banner-management-page .border-slate-200) {
  border-color: rgb(255 255 255 / 12%) !important;
}

:global(html.dark .banner-management-page .text-slate-900) {
  color: #f8fafc !important;
}

:global(html.dark .banner-management-page .combat-input .el-input__wrapper) {
  background-color: #111827 !important;
  border-color: rgb(255 255 255 / 12%) !important;
  box-shadow: none !important;
}

:global(html.dark .banner-management-page .combat-input .el-input__inner) {
  color: #f8fafc !important;
}

:global(html.dark .banner-management-page .combat-input .el-textarea__inner) {
  background-color: #111827 !important;
  border-color: rgb(255 255 255 / 12%) !important;
  color: #f8fafc !important;
  box-shadow: none !important;
}

:global(html.dark .combat-banner-dialog) {
  background-color: #10141c !important;
  border: 1px solid rgb(255 255 255 / 12%) !important;
}

:global(html.dark .combat-banner-dialog .el-dialog__header) {
  border-bottom-color: rgb(255 255 255 / 8%) !important;
}

:global(html.dark .combat-banner-dialog .el-dialog__footer) {
  border-top-color: rgb(255 255 255 / 8%) !important;
}

:global(html.dark .combat-banner-dialog h3.text-slate-800) {
  color: #f8fafc !important;
}

:global(html.dark .combat-banner-dialog label.text-slate-400) {
  color: #cbd5e1 !important;
}

:global(html.dark .combat-banner-dialog .bg-slate-50) {
  background-color: #111827 !important;
  border-color: rgb(255 255 255 / 8%) !important;
}

:global(html.dark .combat-banner-dialog .border-slate-100) {
  border-color: rgb(255 255 255 / 8%) !important;
}

:global(html.dark .combat-banner-dialog .combat-banner-upload .bg-white) {
  background-color: #111827 !important;
  border-color: rgb(255 255 255 / 12%) !important;
}

:global(
  html.dark .combat-banner-dialog .combat-banner-upload span.text-slate-400
) {
  color: #94a3b8 !important;
}
</style>
