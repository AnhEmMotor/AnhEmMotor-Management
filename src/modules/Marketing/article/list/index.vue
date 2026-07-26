<template>
  <main class="article-list-page">
    <section class="article-hero">
      <div class="article-hero__content">
        <div class="article-hero__heading">
          <span class="article-hero__eyebrow">Trung tâm nội dung</span>
          <h1>Quản lý bài viết</h1>
          <p>
            Theo dõi nội dung, trạng thái xuất bản và thông tin biên tập trong
            một danh sách rõ ràng.
          </p>
        </div>

        <button
          class="article-create-button"
          type="button"
          @click="toAddArticle"
        >
          <ArtSvgIcon icon="ri:add-line" />
          <span>Viết bài mới</span>
        </button>
      </div>

      <div class="article-toolbar">
        <label class="article-search">
          <span class="sr-only">Tìm kiếm bài viết</span>
          <ArtSvgIcon icon="ri:search-2-line" class="article-search__icon" />
          <input
            v-model="searchVal"
            type="search"
            placeholder="Tìm theo tiêu đề bài viết..."
            @input="searchArticle"
            @keyup.enter="runSearchNow"
          />
          <button
            v-if="searchVal"
            type="button"
            aria-label="Xóa từ khóa tìm kiếm"
            class="article-search__clear"
            @click="clearSearch"
          >
            <ArtSvgIcon icon="ri:close-line" />
          </button>
        </label>

        <dl class="article-overview" aria-label="Tổng quan danh sách bài viết">
          <div>
            <dt>Tổng bài viết</dt>
            <dd>{{ total }}</dd>
          </div>
          <div>
            <dt>Đã đăng / trang</dt>
            <dd>{{ publishedOnPage }}</dd>
          </div>
          <div>
            <dt>Bản nháp / trang</dt>
            <dd>{{ draftsOnPage }}</dd>
          </div>
          <div>
            <dt>Trang hiện tại</dt>
            <dd>{{ currentPage }}/{{ totalPages }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="article-content" aria-live="polite">
      <div v-if="loading" class="article-grid" aria-label="Đang tải bài viết">
        <div v-for="index in 6" :key="index" class="article-skeleton">
          <div class="article-skeleton__media"></div>
          <div class="article-skeleton__body">
            <span></span>
            <strong></strong>
            <strong class="article-skeleton__short"></strong>
            <p></p>
            <small></small>
          </div>
        </div>
      </div>

      <div v-else-if="loadError" class="article-state article-state--error">
        <div class="article-state__icon">
          <ArtSvgIcon icon="ri:wifi-off-line" />
        </div>
        <h2>Chưa thể tải danh sách bài viết</h2>
        <p>{{ loadError }}</p>
        <button type="button" @click="fetchList">
          <ArtSvgIcon icon="ri:refresh-line" />
          Thử lại
        </button>
      </div>

      <div v-else-if="showEmpty" class="article-state">
        <div class="article-state__icon">
          <ArtSvgIcon icon="ri:file-list-3-line" />
        </div>
        <h2>
          {{
            searchVal
              ? "Không tìm thấy bài viết phù hợp"
              : "Chưa có bài viết nào"
          }}
        </h2>
        <p>
          {{
            searchVal
              ? "Hãy thử một từ khóa ngắn hơn hoặc xóa bộ lọc tìm kiếm."
              : "Tạo bài viết đầu tiên để bắt đầu xây dựng thư viện nội dung."
          }}
        </p>
        <button v-if="!searchVal" type="button" @click="toAddArticle">
          <ArtSvgIcon icon="ri:add-line" />
          Viết bài đầu tiên
        </button>
        <button v-else type="button" @click="clearSearch">
          <ArtSvgIcon icon="ri:close-line" />
          Xóa tìm kiếm
        </button>
      </div>

      <div v-else class="article-grid">
        <article
          v-for="item in articleList"
          :key="item.id"
          class="article-card"
          tabindex="0"
          @click="toEdit(item)"
          @keydown.enter="toEdit(item)"
        >
          <div class="article-card__media">
            <img
              v-if="item.coverImageUrl && !failedImages.has(item.id)"
              :src="formatImageUrl(item.coverImageUrl)"
              :alt="`Ảnh bìa: ${item.title}`"
              loading="lazy"
              @error="markImageFailed(item.id)"
            />
            <div v-else class="article-card__fallback" aria-hidden="true">
              <span>{{ getTitleInitial(item.title) }}</span>
              <ArtSvgIcon icon="ri:motorbike-line" />
            </div>
            <span
              class="article-status"
              :class="getStatusClasses(item.isPublished)"
            >
              <i></i>
              {{ item.isPublished ? "Đã xuất bản" : "Bản nháp" }}
            </span>
          </div>

          <div class="article-card__body">
            <div class="article-card__topline">
              <span class="article-category">
                {{ item.categoryName || "Chưa phân loại" }}
              </span>
              <span class="article-code">#{{ item.id }}</span>
            </div>

            <h2>{{ item.title }}</h2>
            <p class="article-card__description">
              {{ getDescription(item) }}
            </p>

            <dl class="article-card__meta">
              <div>
                <dt><ArtSvgIcon icon="ri:user-3-line" /> Biên tập</dt>
                <dd>{{ item.authorName || "Chưa cập nhật" }}</dd>
              </div>
              <div>
                <dt><ArtSvgIcon icon="ri:calendar-line" /> Ngày đăng</dt>
                <dd>{{ formatDate(item.publishedDate || item.createdAt) }}</dd>
              </div>
              <div>
                <dt><ArtSvgIcon icon="ri:refresh-line" /> Cập nhật</dt>
                <dd>{{ formatDate(item.updatedAt || item.createdAt) }}</dd>
              </div>
            </dl>

            <div class="article-card__actions">
              <button type="button" @click.stop="toEdit(item)">
                <ArtSvgIcon icon="ri:edit-line" />
                Chỉnh sửa
              </button>
              <button
                type="button"
                class="article-card__delete"
                @click.stop="toDelete(item)"
              >
                <ArtSvgIcon icon="ri:delete-bin-line" />
                Xóa
              </button>
            </div>
          </div>
        </article>
      </div>

      <footer v-if="total > 0" class="article-pagination">
        <p>
          Hiển thị <strong>{{ pageStart }}–{{ pageEnd }}</strong> trong
          <strong>{{ total }}</strong> bài viết
        </p>
        <div class="article-pagination__control">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            background
            :page-sizes="[5, 10, 20]"
            :pager-count="5"
            layout="sizes, prev, pager, next"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import { router } from "@/router";
import { NewsApi } from "@/api/marketing";
import { useCommon } from "@/common/composables/useCommon";
import { formatImageUrl } from "@/common/utils/image";

defineOptions({ name: "ArticleListAnalytics" });

interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  categoryName?: string | null;
  coverImageUrl?: string | null;
  authorName?: string | null;
  metaDescription?: string | null;
  publishedDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isPublished: boolean;
}

interface ArticleListResponse {
  items?: ArticleListItem[];
  totalCount?: number;
}

const DEFAULT_PAGE_SIZE = 10;

const searchVal = ref("");
const currentPage = ref(1);
const pageSize = ref(DEFAULT_PAGE_SIZE);
const total = ref(0);
const loading = ref(false);
const loadError = ref("");
const failedImages = ref(new Set<number>());
const articleList = ref<ArticleListItem[]>([]);

const showEmpty = computed(
  () => articleList.value.length === 0 && !loading.value,
);
const publishedOnPage = computed(
  () => articleList.value.filter((item) => item.isPublished).length,
);
const draftsOnPage = computed(
  () => articleList.value.filter((item) => !item.isPublished).length,
);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value)),
);
const pageStart = computed(() =>
  total.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
);
const pageEnd = computed(() =>
  Math.min(currentPage.value * pageSize.value, total.value),
);

const getStatusClasses = (isPublished: boolean) =>
  isPublished ? "article-status--published" : "article-status--draft";

const formatDate = (value?: string | null) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getDescription = (item: ArticleListItem) =>
  item.metaDescription?.trim() ||
  "Bài viết chưa có mô tả ngắn. Hãy bổ sung mô tả để người quản lý nhận biết nội dung nhanh hơn.";

const getTitleInitial = (title: string) =>
  title.trim().charAt(0).toLocaleUpperCase("vi-VN") || "A";

const markImageFailed = (id: number) => {
  failedImages.value = new Set(failedImages.value).add(id);
};

const normalizeSearchTerm = (value: string) =>
  value.trim().replace(/[(),|]/g, " ");

const fetchList = async () => {
  try {
    loading.value = true;
    loadError.value = "";
    failedImages.value = new Set();
    const searchTerm = normalizeSearchTerm(searchVal.value);
    const response = (await NewsApi.getList({
      current: currentPage.value,
      size: pageSize.value,
      Filters: searchTerm ? `Title@=*${searchTerm}` : undefined,
      Sorts: "-CreatedAt",
    })) as ArticleListResponse | ArticleListItem[];
    const items = Array.isArray(response) ? response : response.items || [];
    articleList.value = items;
    total.value = Array.isArray(response)
      ? response.length
      : response.totalCount || items.length;
  } catch {
    articleList.value = [];
    total.value = 0;
    loadError.value =
      "Kết nối tới máy chủ thất bại. Vui lòng kiểm tra dịch vụ backend và thử lại.";
    ElMessage.error("Không thể lấy danh sách bài viết");
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1;
  fetchList();
}, 350);

const searchArticle = () => {
  debouncedSearch();
};

const runSearchNow = () => {
  currentPage.value = 1;
  fetchList();
};

const clearSearch = () => {
  searchVal.value = "";
  currentPage.value = 1;
  fetchList();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  useCommon().scrollToTop();
  fetchList();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchList();
};

const toEdit = (item: ArticleListItem) =>
  router.push({
    name: "ArticlePublish",
    query: { id: item.id, slug: item.slug },
  });

const toAddArticle = () => router.push({ name: "ArticlePublish" });

const toDelete = async (item: ArticleListItem) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa bài viết “${item.title}”?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa bài viết",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
  } catch {
    return;
  }

  try {
    await NewsApi.delete(item.id);
    if (articleList.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1;
    }
    await fetchList();
    ElMessage.success("Đã xóa bài viết");
  } catch {
    ElMessage.error("Không thể xóa bài viết");
  }
};

onMounted(() => {
  useCommon().scrollToTop();
  fetchList();
});

onActivated(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.article-list-page {
  min-height: 100%;
  padding: 24px;
  color: var(--el-text-color-primary);
  background:
    radial-gradient(circle at 7% 0%, rgb(232 74 74 / 8%), transparent 28rem),
    var(--el-bg-color-page);
}

.article-hero,
.article-content {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.article-hero {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 24px;
  box-shadow: 0 18px 48px rgb(100 116 139 / 10%);
}

.article-hero__content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 30px 22px;
}

.article-hero__heading {
  max-width: 720px;
}

.article-hero__eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #d83e3e;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.article-hero h1 {
  margin: 0;
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.article-hero__heading p {
  max-width: 62ch;
  margin: 10px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.article-create-button,
.article-state button {
  display: inline-flex;
  flex-shrink: 0;
  gap: 9px;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 750;
  background: #e84a4a;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgb(232 74 74 / 22%);
  cursor: pointer;
  transition:
    transform 200ms ease,
    background-color 200ms ease,
    box-shadow 200ms ease;
}

.article-create-button:hover,
.article-state button:hover {
  background: #d83e3e;
  box-shadow: 0 15px 28px rgb(232 74 74 / 28%);
  transform: translateY(-2px);
}

.article-create-button:active,
.article-state button:active {
  transform: translateY(0) scale(0.98);
}

.article-create-button:focus-visible,
.article-state button:focus-visible,
.article-card:focus-visible,
.article-card__actions button:focus-visible,
.article-search input:focus-visible {
  outline: 3px solid rgb(232 74 74 / 25%);
  outline-offset: 3px;
}

.article-toolbar {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(520px, auto);
  gap: 24px;
  align-items: center;
  padding: 18px 30px 20px;
  background: var(--el-fill-color-extra-light);
  border-top: 1px solid var(--el-border-color-lighter);
}

.article-search {
  position: relative;
  display: block;
  max-width: 520px;
}

.article-search__icon {
  position: absolute;
  top: 50%;
  left: 15px;
  color: var(--el-text-color-placeholder);
  font-size: 18px;
  transform: translateY(-50%);
  pointer-events: none;
}

.article-search input {
  width: 100%;
  height: 46px;
  padding: 0 44px;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 13px;
  outline: none;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease;
}

.article-search input:focus {
  border-color: #e84a4a;
  box-shadow: 0 0 0 4px rgb(232 74 74 / 9%);
}

.article-search__clear {
  position: absolute;
  top: 50%;
  right: 10px;
  display: grid;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--el-text-color-secondary);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transform: translateY(-50%);
  place-items: center;
}

.article-search__clear:hover {
  color: #e84a4a;
  background: rgb(232 74 74 / 9%);
}

.article-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(96px, 1fr));
  gap: 8px;
  margin: 0;
}

.article-overview div {
  min-width: 0;
  padding: 4px 14px;
  border-left: 1px solid var(--el-border-color-lighter);
}

.article-overview dt {
  overflow: hidden;
  margin-bottom: 3px;
  color: var(--el-text-color-secondary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-overview dd {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
}

.article-content {
  padding-top: 22px;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.article-card {
  display: grid;
  grid-template-columns: minmax(200px, 38%) 1fr;
  min-height: 286px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgb(71 85 105 / 8%);
  cursor: pointer;
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    box-shadow 240ms ease;
}

.article-card:hover {
  border-color: rgb(232 74 74 / 35%);
  box-shadow: 0 18px 42px rgb(71 85 105 / 14%);
  transform: translateY(-3px);
}

.article-card__media {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  background: var(--el-fill-color);
}

.article-card__media img {
  width: 100%;
  height: 100%;
  min-height: 286px;
  object-fit: cover;
  transition: transform 500ms ease;
}

.article-card:hover .article-card__media img {
  transform: scale(1.035);
}

.article-card__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  color: rgb(255 255 255 / 92%);
  background:
    linear-gradient(150deg, rgb(232 74 74 / 94%), rgb(116 26 32 / 96%)), #a92832;
}

.article-card__fallback::after {
  position: absolute;
  right: -22%;
  bottom: -25%;
  width: 210px;
  height: 210px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 50%;
  content: "";
}

.article-card__fallback span {
  font-size: 66px;
  font-weight: 850;
  line-height: 1;
  letter-spacing: -0.08em;
}

.article-card__fallback svg {
  position: relative;
  z-index: 1;
  font-size: 34px;
  opacity: 0.75;
}

.article-status {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
  display: inline-flex;
  gap: 7px;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 750;
  background: rgb(255 255 255 / 92%);
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 8px;
  box-shadow: 0 8px 20px rgb(15 23 42 / 18%);
  backdrop-filter: blur(10px);
}

.article-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.article-status--published {
  color: #087b50;
}

.article-status--published i {
  background: #10b981;
  box-shadow: 0 0 0 3px rgb(16 185 129 / 16%);
}

.article-status--draft {
  color: #5f6672;
}

.article-status--draft i {
  background: #94a3b8;
  box-shadow: 0 0 0 3px rgb(148 163 184 / 18%);
}

.article-card__body {
  display: flex;
  min-width: 0;
  padding: 22px;
  flex-direction: column;
}

.article-card__topline {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.article-category {
  overflow: hidden;
  color: #d83e3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.article-code {
  color: var(--el-text-color-placeholder);
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.article-card h2 {
  display: -webkit-box;
  overflow: hidden;
  min-height: 44px;
  margin: 0;
  font-size: 17px;
  font-weight: 780;
  line-height: 1.32;
  letter-spacing: -0.018em;
  text-wrap: pretty;
  transition: color 200ms ease;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.article-card:hover h2 {
  color: #d83e3e;
}

.article-card__description {
  display: -webkit-box;
  overflow: hidden;
  min-height: 42px;
  margin: 9px 0 15px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.article-card__meta {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 0.9fr;
  gap: 10px;
  padding: 12px 0;
  margin: auto 0 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.article-card__meta div {
  min-width: 0;
}

.article-card__meta dt {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-bottom: 3px;
  color: var(--el-text-color-placeholder);
  font-size: 9px;
  font-weight: 700;
}

.article-card__meta dd {
  overflow: hidden;
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-card__actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
}

.article-card__actions button {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 34px;
  padding: 0 11px;
  color: var(--el-text-color-regular);
  font-size: 10px;
  font-weight: 750;
  background: var(--el-fill-color-light);
  border: 0;
  border-radius: 9px;
  cursor: pointer;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.article-card__actions button:hover {
  color: #d83e3e;
  background: rgb(232 74 74 / 9%);
}

.article-card__actions button:active {
  transform: scale(0.97);
}

.article-card__actions .article-card__delete {
  margin-left: auto;
  color: #dc2626;
  background: transparent;
}

.article-card__actions .article-card__delete:hover {
  color: #b91c1c;
  background: rgb(220 38 38 / 9%);
}

.article-state {
  display: flex;
  min-height: 430px;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background: var(--el-bg-color);
  border: 1px dashed var(--el-border-color);
  border-radius: 22px;
  flex-direction: column;
}

.article-state__icon {
  display: grid;
  width: 70px;
  height: 70px;
  margin-bottom: 18px;
  color: #d83e3e;
  font-size: 32px;
  background: rgb(232 74 74 / 10%);
  border-radius: 20px;
  place-items: center;
}

.article-state h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.article-state p {
  max-width: 52ch;
  margin: 9px 0 20px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.article-state--error .article-state__icon {
  color: #c2410c;
  background: rgb(234 88 12 / 10%);
}

.article-skeleton {
  display: grid;
  grid-template-columns: minmax(200px, 38%) 1fr;
  min-height: 286px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
}

.article-skeleton__media,
.article-skeleton__body span,
.article-skeleton__body strong,
.article-skeleton__body p,
.article-skeleton__body small {
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 45%,
    var(--el-fill-color-light) 65%
  );
  background-size: 220% 100%;
  animation: article-shimmer 1.5s infinite linear;
}

.article-skeleton__body {
  display: flex;
  gap: 12px;
  padding: 24px;
  flex-direction: column;
}

.article-skeleton__body span {
  width: 34%;
  height: 10px;
  border-radius: 4px;
}

.article-skeleton__body strong {
  width: 92%;
  height: 18px;
  margin-top: 2px;
  border-radius: 5px;
}

.article-skeleton__body .article-skeleton__short {
  width: 68%;
}

.article-skeleton__body p {
  width: 100%;
  height: 40px;
  margin: 4px 0 0;
  border-radius: 7px;
}

.article-skeleton__body small {
  width: 82%;
  height: 42px;
  margin-top: auto;
  border-radius: 7px;
}

.article-pagination {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  margin-top: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
}

.article-pagination p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.article-pagination strong {
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.article-pagination__control {
  overflow-x: auto;
}

.article-pagination :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #e84a4a;
}

@keyframes article-shimmer {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}

@media (width <= 1180px) {
  .article-toolbar {
    grid-template-columns: 1fr;
  }

  .article-search {
    max-width: none;
  }

  .article-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 720px) {
  .article-list-page {
    padding: 12px;
  }

  .article-hero {
    border-radius: 18px;
  }

  .article-hero__content {
    align-items: stretch;
    padding: 22px 18px 18px;
    flex-direction: column;
  }

  .article-create-button {
    width: 100%;
  }

  .article-toolbar {
    gap: 16px;
    padding: 16px 18px 18px;
  }

  .article-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .article-overview div {
    padding: 6px 10px;
  }

  .article-card,
  .article-skeleton {
    grid-template-columns: 1fr;
  }

  .article-card__media,
  .article-skeleton__media {
    min-height: 210px;
    aspect-ratio: 16 / 9;
  }

  .article-card__media img {
    min-height: 210px;
  }

  .article-card__meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .article-card__meta div:first-child {
    grid-column: 1 / -1;
  }

  .article-pagination {
    align-items: flex-start;
    flex-direction: column;
  }

  .article-pagination__control {
    width: 100%;
    padding-bottom: 4px;
  }
}

:global(html.dark .article-list-page) {
  background:
    radial-gradient(circle at 7% 0%, rgb(232 74 74 / 12%), transparent 28rem),
    #07090d;
}

:global(html.dark .article-list-page .article-hero),
:global(html.dark .article-list-page .article-card),
:global(html.dark .article-list-page .article-state),
:global(html.dark .article-list-page .article-pagination),
:global(html.dark .article-list-page .article-skeleton) {
  background-color: #11151d;
  border-color: rgb(255 255 255 / 11%);
}

:global(html.dark .article-list-page .article-toolbar) {
  background-color: #0d1118;
  border-color: rgb(255 255 255 / 9%);
}

:global(html.dark .article-list-page .article-search input) {
  background-color: #11151d;
  border-color: rgb(255 255 255 / 13%);
}

:global(html.dark .article-list-page .article-card:hover) {
  border-color: rgb(232 74 74 / 50%);
  box-shadow: 0 18px 44px rgb(0 0 0 / 35%);
}
</style>
