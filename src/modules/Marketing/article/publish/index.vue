<template>
  <div
    class="article-publish-page min-h-screen font-inter text-[#0F172A] dark:text-slate-100 pb-10"
  >
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 sticky top-0 z-[100] shadow-sm flex justify-between items-center"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-white shadow-sm"
        >
          <ArtSvgIcon icon="ri:edit-box-line" class="text-xl" />
        </div>
        <div>
          <h1
            class="m-0 text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-3"
          >
            Chỉnh sửa bài viết
            <span
              class="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-sm"
              :class="isPublished ? 'bg-blue-500' : 'bg-slate-400'"
              >{{ isPublished ? "Đã xuất bản" : "Bản nháp" }}</span
            >
          </h1>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="handleSaveDraft"
          class="h-10 px-6 border-2 border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-slate-800 transition-all"
        >
          Lưu nháp
        </button>
        <button
          @click="submit"
          class="h-10 px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95"
        >
          {{
            pageMode === PageModeEnum.Edit
              ? "Cập nhật bài viết"
              : "Xuất bản ngay"
          }}
        </button>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto p-8 flex gap-8 items-start">
      <div class="flex-1 flex flex-col gap-6">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm"
        >
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >Tiêu đề bài viết</label
              >
              <input
                v-model="articleName"
                type="text"
                placeholder="Ví dụ: So sánh SH 160i và SH Mode: Lựa chọn nào cho phái đẹp?"
                class="w-full h-11 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-lg font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
              />
            </div>
            <div class="col-span-9">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >Đường dẫn tĩnh (Slug)</label
              >
              <input
                v-model="articleSlug"
                type="text"
                placeholder="Ví dụ: so-sanh-sh-160i-va-sh-mode"
                class="w-full h-11 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-base font-medium text-slate-600 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
              />
            </div>
            <div class="col-span-3">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >Danh mục</label
              >
              <ElSelect
                v-model="articleType"
                placeholder="Chọn loại bài..."
                class="w-full premium-select-large"
                size="large"
              >
                <ElOption
                  v-for="item in articleTypes"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden min-h-[600px] flex flex-col"
        >
          <div
            class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/40 flex justify-between items-center"
          >
            <span
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >Nội dung bài viết</span
            >
          </div>
          <ArtWangEditor
            v-if="showEditor"
            v-model="editorHtml"
            class="flex-1"
          />
        </div>
      </div>

      <div class="w-96 flex flex-col gap-6 sticky top-28 shrink-0">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm"
        >
          <h3
            class="m-0 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:share-forward-line" class="text-blue-500" />
            Upload ảnh bìa
          </h3>
          <div class="space-y-4">
            <div
              class="aspect-video bg-slate-100 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group cursor-pointer"
              @click="triggerImageUpload"
            >
              <img
                v-if="ogImage"
                :src="ogImage"
                class="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div
                v-else
                class="w-full h-full flex-cc flex-col gap-2 text-slate-400"
              >
                <ArtSvgIcon icon="ri:image-add-line" class="text-3xl" />
                <span class="text-[9px] font-black uppercase"
                  >Tải ảnh bìa Social</span
                >
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm"
        >
          <div class="flex justify-between items-center mb-4">
            <h3
              class="m-0 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200"
            >
              Sản phẩm liên kết
            </h3>
            <button
              @click="openProductSelector"
              class="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex-cc hover:bg-blue-600 hover:text-white transition-all"
            >
              <ArtSvgIcon icon="ri:add-line" />
            </button>
          </div>
          <div class="space-y-3 mb-4">
            <div
              v-for="p in selectedProducts"
              :key="p.id"
              class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800 group"
            >
              <img
                :src="p.img"
                class="size-10 rounded-lg object-cover shadow-sm"
              />
              <div class="flex-1 overflow-hidden">
                <h4
                  class="m-0 text-[11px] font-black text-slate-800 dark:text-slate-200 truncate"
                >
                  {{ p.name }}
                </h4>
                <span class="text-[9px] font-bold text-slate-400">{{
                  p.price
                }}</span>
              </div>
              <button
                @click="removeProduct(p.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
              >
                <ArtSvgIcon icon="ri:close-circle-line" />
              </button>
            </div>
            <div
              v-if="selectedProducts.length === 0"
              class="py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex-cc flex-col gap-2 opacity-30"
            >
              <ArtSvgIcon icon="ri:car-line" class="text-3xl" />
              <span
                class="text-[9px] font-black uppercase tracking-tighter text-center"
                >Chưa chọn xe tư vấn</span
              >
            </div>
          </div>
          <p class="m-0 text-[9px] font-bold text-slate-400 italic">
            Khách hàng sẽ thấy nút "Xem giá xe này" và "Lái thử" ngay dưới bài
            viết cho các xe trên.
          </p>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="productDialogVisible"
      title="Chọn sản phẩm & màu sắc"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          v-model="productQuery"
          placeholder="Tìm sản phẩm theo tên..."
          clearable
          prefix-icon="Search"
          @input="handleProductSearch"
        />

        <div
          v-loading="productLoading"
          class="space-y-3 min-h-[350px] max-h-[500px] overflow-y-auto pr-1"
        >
          <div
            v-for="variant in availableProducts"
            :key="variant.id"
            class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <ElImage
                  :src="variant.coverImageUrl || ''"
                  class="w-12 h-12 rounded object-cover border border-gray-100 flex-shrink-0"
                  fit="cover"
                >
                  <template #error>
                    <div
                      class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"
                    >
                      <ElIcon><InfoFilled /></ElIcon>
                    </div>
                  </template>
                </ElImage>

                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-semibold text-gray-800 truncate">
                    {{ variant.displayName }}
                  </span>
                  <span class="text-[11px] text-gray-400 mt-0.5 font-mono">
                    Variant ID: #{{ variant.id }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end">
                <ElSelect
                  v-if="variant.colors?.length"
                  v-model="selectedVariantColors[String(variant.id)]"
                  placeholder="Chọn màu"
                  size="small"
                  style="width: 150px"
                  @click.stop
                >
                  <template #prefix>
                    <span
                      v-if="getSelectedVariantColor(variant)"
                      class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                      :style="{
                        backgroundColor:
                          getSelectedVariantColor(variant)?.colorCode ||
                          '#ffffff',
                      }"
                    ></span>
                  </template>
                  <ElOption
                    v-for="color in variant.colors"
                    :key="color.id"
                    :label="color.colorName || `Màu #${color.id}`"
                    :value="color.id"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                        :style="{
                          backgroundColor: color.colorCode || '#ffffff',
                        }"
                      ></span>
                      <span>{{ color.colorName || `Màu #${color.id}` }}</span>
                    </div>
                  </ElOption>
                </ElSelect>
                <ElButton
                  type="primary"
                  size="small"
                  plain
                  @click="selectProductVariant(variant)"
                >
                  Chọn
                </ElButton>
              </div>
            </div>
          </div>

          <div
            v-if="!productLoading && availableProducts.length === 0"
            class="flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy sản phẩm nào</span>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="productCurrentPage"
            v-model:page-size="productPageSize"
            :total="productTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="loadProducts"
          />
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated, onDeactivated } from "vue";
import { useRouter, useRoute } from "vue-router";
import { InfoFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import { PageModeEnum } from "@/common/enums/formEnum";
import { useCommon } from "@/common/composables/useCommon";
import { NewsApi } from "@/api/marketing";
import { ProductApi } from "@/api/product";
import type { ProductVariantLiteForInput } from "@/domain/product/product.types";

defineOptions({ name: "ArticlePublishWorkflow" });

const router = useRouter();
const route = useRoute();

const articleName = ref("");
const articleSlug = ref("");
const articleType = ref<number>();
const editorHtml = ref("");
const ogImage = ref("");
const isPublished = ref(false);
const pageMode = ref(PageModeEnum.Add);
const showEditor = ref(true);

onActivated(() => {
  showEditor.value = true;
});

onDeactivated(() => {
  showEditor.value = false;
});

const resetForm = () => {
  articleName.value = "";
  articleSlug.value = "";
  articleType.value = undefined;
  editorHtml.value = "";
  ogImage.value = "";
  isPublished.value = false;
  pageMode.value = PageModeEnum.Add;
  selectedProducts.value = [];
};

const selectedProducts = ref<any[]>([]);
const productDialogVisible = ref(false);

const articleTypes = ref<any[]>([]);

const loadArticleTypes = async () => {
  try {
    const res = await NewsApi.getCategories({ size: 100 });
    if (res && res.items) {
      articleTypes.value = res.items;
    }
  } catch (error) {
    console.error("Failed to load article types", error);
    ElMessage.error("Không thể tải danh sách danh mục");
  }
};

const availableProducts = ref<ProductVariantLiteForInput[]>([]);
const productCurrentPage = ref(1);
const productPageSize = ref(10);
const productTotal = ref(0);
const productQuery = ref("");
const productLoading = ref(false);
const selectedVariantColors = reactive<Record<string, number | undefined>>({});

const getVariantColorKey = (variant: ProductVariantLiteForInput) =>
  String(variant.id);

const getSelectedVariantColor = (variant: ProductVariantLiteForInput) => {
  const selectedColorId = selectedVariantColors[getVariantColorKey(variant)];
  return variant.colors?.find((color) => color.id === selectedColorId);
};

const initializeVariantColorSelection = (
  variants: ProductVariantLiteForInput[],
) => {
  variants.forEach((variant) => {
    const key = getVariantColorKey(variant);
    if (selectedVariantColors[key] || !variant.colors?.length) return;
    selectedVariantColors[key] = variant.colors[0].id;
  });
};

const loadProducts = async () => {
  productLoading.value = true;
  try {
    const filters = [];
    if (productQuery.value.trim()) {
      filters.push(`search@=${productQuery.value.trim()}`);
    }
    const res = await ProductApi.getVariantsForInput({
      current: productCurrentPage.value,
      size: productPageSize.value,
      Filters: filters.join(","),
    });
    if (res && res.items) {
      availableProducts.value = res.items;
      initializeVariantColorSelection(availableProducts.value);
      productTotal.value = res.totalCount || 0;
    }
  } catch (error) {
    console.error("Failed to load products", error);
    ElMessage.error("Không thể tải danh sách sản phẩm");
  } finally {
    productLoading.value = false;
  }
};

const handleProductSearch = useDebounceFn(async (query: string) => {
  productQuery.value = query;
  productCurrentPage.value = 1;
  await loadProducts();
}, 300);

const openProductSelector = async () => {
  productQuery.value = "";
  productCurrentPage.value = 1;
  await loadProducts();
  productDialogVisible.value = true;
};

const selectProductVariant = (variant: ProductVariantLiteForInput) => {
  if (!variant.id) return;
  const productVariantColorId =
    selectedVariantColors[getVariantColorKey(variant)];
  if (variant.colors?.length && !productVariantColorId) {
    ElMessage.warning("Vui lòng chọn màu cho biến thể sản phẩm này");
    return;
  }

  const selectedColor = getSelectedVariantColor(variant);
  const displayName = variant.displayName || `Sản phẩm #${variant.id}`;
  const colorName = selectedColor?.colorName
    ? ` - ${selectedColor.colorName}`
    : "";

  const uniqueId = `${variant.id}_${productVariantColorId || "none"}`;

  if (selectedProducts.value.some((p) => p.id === uniqueId)) {
    ElMessage.warning("Sản phẩm này đã được chọn!");
    return;
  }

  selectedProducts.value.push({
    id: uniqueId,
    name: `${displayName}${colorName}`,
    price: "Liên hệ",
    img: variant.coverImageUrl || "",
  });

  productDialogVisible.value = false;
  ElMessage.success("Đã thêm sản phẩm liên kết");
};
const removeProduct = (id: any) =>
  (selectedProducts.value = selectedProducts.value.filter((p) => p.id !== id));

const triggerImageUpload = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await NewsApi.uploadCoverImage(formData);
      if (res && res.url) {
        ogImage.value = res.url;
        ElMessage.success("Đã tải lên ảnh bìa thành công");
      }
    } catch (error) {
      console.error("Upload failed", error);
      ElMessage.error("Tải lên ảnh bìa thất bại");
    }
  };
  input.click();
};

const getPayload = (publishStatus: boolean) => ({
  title: articleName.value,
  slug: articleSlug.value,
  category_id: articleType.value,
  content: editorHtml.value,
  cover_image_url: ogImage.value,
  is_published: publishStatus,
  linked_products: selectedProducts.value.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    img: p.img,
  })),
});

const validateForm = () => {
  if (!articleName.value || !articleName.value.trim()) {
    ElMessage.warning("Vui lòng nhập tiêu đề bài viết!");
    return false;
  }
  if (!articleSlug.value || !articleSlug.value.trim()) {
    ElMessage.warning("Vui lòng nhập đường dẫn tĩnh!");
    return false;
  }
  if (!articleType.value) {
    ElMessage.warning("Vui lòng chọn danh mục bài viết!");
    return false;
  }
  if (!ogImage.value) {
    ElMessage.warning("Vui lòng tải lên ảnh bìa cho bài viết!");
    return false;
  }
  const htmlContent = editorHtml.value
    ? editorHtml.value.replace(/<[^>]*>/g, "").trim()
    : "";
  if (
    !htmlContent &&
    !(editorHtml.value && editorHtml.value.includes("<img"))
  ) {
    ElMessage.warning("Vui lòng nhập nội dung bài viết!");
    return false;
  }
  return true;
};

const handleSaveDraft = async () => {
  if (!validateForm()) return;
  try {
    const payload = getPayload(false);
    if (pageMode.value === PageModeEnum.Edit) {
      await NewsApi.update(Number(route.query.id), payload);
    } else {
      await NewsApi.create(payload);
    }
    ElMessage.success("Đã lưu bản nháp thành công");
    router.push("/Marketing/article");
  } catch (error) {
    console.error(error);
  }
};

const submit = async () => {
  if (!validateForm()) return;
  try {
    const payload = getPayload(true);
    if (pageMode.value === PageModeEnum.Edit) {
      await NewsApi.update(Number(route.query.id), payload);
    } else {
      await NewsApi.create(payload);
    }
    ElMessage.success("Bài viết đã được xuất bản thành công!");
    router.push("/Marketing/article");
  } catch (error) {
    console.error(error);
  }
};

const initData = async () => {
  useCommon().scrollToTop();
  await loadArticleTypes();
  const id = route.query.id || route.params.id;
  if (id) {
    pageMode.value = PageModeEnum.Edit;
    try {
      const res = await NewsApi.getById(Number(id));
      if (res) {
        articleName.value = res.title;
        articleSlug.value = res.slug;
        articleType.value = res.categoryId;
        editorHtml.value = res.content;
        ogImage.value = res.coverImageUrl;
        isPublished.value = res.isPublished;

        if (res.linkedProducts && res.linkedProducts.length > 0) {
          selectedProducts.value = res.linkedProducts.map((p: any) => {
            const colorSuffix = p.colorName ? ` - ${p.colorName}` : "";
            return {
              name: `${p.variantName}${colorSuffix}`,
              price: p.price,
              img: p.img,
            };
          });
        }
      }
    } catch {
      ElMessage.error("Không thể tải dữ liệu bài viết");
    }
  } else {
    resetForm();
  }
};

import { watch } from "vue";

onMounted(() => {});

watch(
  () => [route.query.id, route.params.id],
  () => {
    if (route.name === "ArticlePublish" || route.name === "ArticleEdit") {
      initData();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.article-publish-page {
  .premium-select-large {
    :deep(.el-input__wrapper) {
      height: 56px;
      background-color: var(--el-fill-color-blank);
      border: 2px solid var(--el-border-color-light);
      border-radius: 16px;
      box-shadow: none;

      &:focus {
        border-color: #3b82f6;
      }
    }
  }

  .combat-dark-picker {
    :deep(.el-input__wrapper) {
      color: white;
      background-color: rgb(255 255 255 / 5%);
      border: 1px solid rgb(255 255 255 / 10%);
      border-radius: 12px;
      box-shadow: none;

      .el-input__inner {
        font-size: 11px;
        font-weight: bold;
        color: white;
      }
    }
  }

  :deep(.el-select__wrapper),
  :deep(.el-input__wrapper) {
    background-color: var(--el-fill-color-blank);
    border-color: var(--el-border-color-light);
    color: var(--el-text-color-primary);
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    color: var(--el-text-color-primary);
    background-color: transparent;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  :deep(.w-e-toolbar) {
    background-color: var(--el-fill-color-blank);
    border-color: var(--el-border-color-light);
  }

  :deep(.w-e-text-container) {
    background-color: var(--el-fill-color-blank);
    color: var(--el-text-color-primary);
    border-color: var(--el-border-color-light);
  }

  :deep(.w-e-text-container [data-slate-editor]) {
    background-color: var(--el-fill-color-blank);
    color: var(--el-text-color-primary);
  }

  :deep(.w-e-bar-item button),
  :deep(.w-e-bar-item svg) {
    color: var(--el-text-color-primary);
    fill: var(--el-text-color-primary);
  }
}

:deep(.combat-dialog) {
  border-radius: 32px;

  .el-dialog__header {
    padding: 24px;
    border-bottom: 1px solid #f1f5f9;
  }
}
</style>
