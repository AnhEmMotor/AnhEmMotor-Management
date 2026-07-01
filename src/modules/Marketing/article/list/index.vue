<template>
  <div
    class="article-list-page min-h-full font-inter text-[#0F172A] dark:text-slate-100 pb-10"
  >
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-[50] shadow-sm"
    >
      <div
        class="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div class="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div class="relative flex-1 max-w-md">
            <ArtSvgIcon
              icon="ri:search-2-line"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
            />
            <input
              v-model="searchVal"
              @input="searchArticle"
              type="text"
              placeholder="Tìm kiếm theo tiêu đề bài viết...."
              class="w-full h-11 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
              @keyup.enter="searchArticle"
            />
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            @click="toAddArticle"
            class="h-11 px-8 bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:add-circle-line" class="text-blue-500" /> Viết
            bài mới
          </button>
        </div>
      </div>
    </div>

    <div class="p-8 max-w-[1400px] mx-auto">
      <div
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
      >
        <div
          v-for="item in articleList"
          :key="item.id"
          @click="toEdit(item)"
          class="article-card cursor-pointer group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative"
        >
          <div class="absolute top-4 left-4 z-10">
            <span
              class="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/20"
              :class="getStatusClasses(item.status || 'Published')"
            >
              {{ item.statusLabel || "Đã xuất bản" }}
            </span>
          </div>

          <div class="aspect-video overflow-hidden relative">
            <img
              :src="item.coverImageUrl || '/assets/image/placeholder.png'"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6"
            >
              <div class="flex gap-2 w-full">
                <button
                  @click.stop="toEdit(item)"
                  class="flex-1 h-9 bg-blue-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  Chỉnh sửa
                </button>
                <button
                  @click.stop="toDelete(item)"
                  class="flex-1 h-9 bg-red-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-red-700 transition-all"
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="flex justify-between items-start mb-3">
              <span
                class="text-[9px] font-black text-blue-500 uppercase tracking-widest"
                >{{
                  item.categoryName || item.category?.name || "Chưa phân loại"
                }}</span
              >
            </div>
            <h2
              class="m-0 text-base font-black text-slate-800 dark:text-slate-200 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors"
            >
              {{ item.title }}
            </h2>

            <div
              class="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center"
            >
              <div class="flex items-center gap-2 text-slate-400">
                <ArtSvgIcon icon="ri:calendar-line" class="text-xs" />
                <span class="text-[10px] font-bold">{{
                  useDateFormat(
                    item.publishedDate || item.createdAt,
                    "DD/MM/YYYY",
                  ).value
                }}</span>
              </div>
            </div>
          </div>

          <div
            class="h-1 bg-slate-100 absolute bottom-0 left-0 right-0 overflow-hidden"
          >
            <div
              class="h-full bg-blue-500 transition-all duration-1000 ease-out"
              :style="{ width: ((item.viewCount || 0) / 1000) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="showEmpty" class="py-40 flex-cc flex-col gap-4 opacity-30">
        <ArtSvgIcon icon="ri:article-line" class="text-6xl" />
        <p class="text-sm font-black uppercase tracking-widest">
          Chưa tìm thấy bài viết nào
        </p>
      </div>
    </div>

    <div v-if="total > 8" class="flex justify-center mt-10">
      <ElPagination
        background
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next, total"
        :total="total"
        @current-change="handleCurrentChange"
        class="combat-pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from "vue";
import { useDateFormat } from "@vueuse/core";
import { router } from "@/router";
import { NewsApi } from "@/api/marketing";
import { useCommon } from "@/common/composables/useCommon";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "ArticleListAnalytics" });

const PAGE_SIZE = 12;

const searchVal = ref("");
const currentPage = ref(1);
const pageSize = ref(PAGE_SIZE);
const total = ref(0);
const loading = ref(false);

const articleList = ref<any[]>([]);

const showEmpty = computed(
  () => articleList.value.length === 0 && !loading.value,
);

const getStatusClasses = (status: string) => {
  if (status === "Draft") return "bg-slate-500 text-white";
  if (status === "Scheduled") return "bg-amber-500 text-white";
  return "bg-emerald-500 text-white";
};

const fetchList = async () => {
  try {
    loading.value = true;
    let filters = "";
    if (searchVal.value) {
      filters = `Title@=*${searchVal.value}`;
    }
    const res = await NewsApi.getList({
      current: currentPage.value,
      size: pageSize.value,
      Filters: filters,
    });
    articleList.value = res?.items || res || [];
    // Simulate status since backend just uses IsPublished boolean
    articleList.value = articleList.value.map((item) => ({
      ...item,
      status: item.isPublished ? "Published" : "Draft",
      statusLabel: item.isPublished ? "Đã xuất bản" : "Bản nháp",
    }));
    total.value = res?.totalCount || articleList.value.length;
  } catch {
    ElMessage.error("Không thể lấy danh sách bài viết");
  } finally {
    loading.value = false;
  }
};

const searchArticle = () => {
  currentPage.value = 1;
  fetchList();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  useCommon().scrollToTop();
  fetchList();
};

const toEdit = (item: any) =>
  router.push({
    name: "ArticlePublish",
    query: { id: item.id, slug: item.slug },
  });
const toAddArticle = () => router.push({ name: "ArticlePublish" });

const toDelete = (item: any) => {
  ElMessageBox.confirm(
    "Bạn có chắc chắn muốn xóa bài viết này không?",
    "Xác nhận xóa",
    {
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await NewsApi.delete(item.id);
        ElMessage.success("Xóa bài viết thành công");
        fetchList();
      } catch {
        ElMessage.error("Không thể xóa bài viết");
      }
    })
    .catch(() => {});
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
  .combat-segmented {
    :deep(.el-segmented__item) {
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      border-radius: 8px;
    }
  }

  .article-card {
    &:hover {
      .analytics-indicator {
        width: 100% !important;
      }
    }
  }

  .combat-pagination {
    :deep(.el-pager li) {
      font-weight: 900;
      border-radius: 8px;

      &.is-active {
        background-color: #001529;
      }
    }
  }
}
</style>
