<template>
  <div>
    <div
      class="resp-page comment-page min-h-full text-[#0F172A] dark:text-slate-100 bg-[#F8FAFC] dark:bg-[#020617]"
    >
      <div
        class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="size-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-white shadow-sm shrink-0"
            >
              <ArtSvgIcon icon="ri:chat-1-line" class="text-2xl" />
            </div>
            <div>
              <h1
                class="m-0 text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none"
              >
                {{ $t("marketing.comment.title") }}
              </h1>
              <p
                class="m-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mt-1.5"
              >
                {{ $t("marketing.comment.subtitle") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div
          class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4"
        >
          <div
            class="mt-10 grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-5"
          >
            <li
              class="comment-item flex flex-col p-4 duration-300 hover:-translate-y-1.5 cursor-pointer rounded-2xl border border-transparent"
              :style="{ '--comment-bg': item.color, minHeight: '170px' }"
              v-for="item in commentsWithColors"
              :key="item.id"
              @click="openDrawer(item)"
            >
              <div class="flex justify-between items-start mb-2">
                <p class="text-slate-500 dark:text-slate-400 text-xs">
                  {{ item.date }}
                </p>
                <span
                  class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px] text-right"
                >
                  {{ item.userName }}
                </span>
              </div>
              <p
                class="text-sm text-slate-800 dark:text-slate-200 line-clamp-3 mb-4 flex-1"
              >
                {{ item.content }}
              </p>
              <div
                class="flex items-center justify-between w-full mt-auto pt-2 border-t border-slate-200/50 dark:border-slate-700/50"
              >
                <div
                  class="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate pr-3"
                  :title="item.collection"
                >
                  <ArtSvgIcon
                    icon="ri:article-line"
                    class="mr-1.5 text-sm shrink-0"
                  />
                  <span class="truncate">{{ item.collection }}</span>
                </div>
                <div
                  class="flex items-center text-xs text-slate-500 dark:text-slate-400 shrink-0"
                >
                  <ArtSvgIcon
                    icon="ri:chat-3-line"
                    class="mr-1.5 text-sm shrink-0"
                  />
                  <span>{{ item.comment }}</span>
                </div>
              </div>
            </li>
          </div>
        </div>
      </div>

      <ElDialog
        v-model="showDrawer"
        :lock-scroll="false"
        width="600px"
        class="comment-modal"
        :show-close="true"
        title="Chi tiết bình luận bài viết"
        destroy-on-close
      >
        <template #default>
          <div class="drawer-default">
            <div
              class="mb-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <img
                v-if="clickItem.articleImage"
                :src="clickItem.articleImage"
                @error="(e) => (e.target.style.display = 'none')"
                alt="Article Cover"
                class="w-full h-48 object-cover rounded-lg mb-3 shadow-sm border border-gray-100 dark:border-slate-700"
              />
              <div class="flex items-center gap-2 mb-2">
                <ArtSvgIcon
                  icon="ri:article-line"
                  class="text-xl text-blue-500 shrink-0"
                />
                <h3
                  class="text-base font-bold text-slate-800 dark:text-white line-clamp-2"
                  :title="clickItem.collection"
                >
                  {{ clickItem.collection }}
                </h3>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Bài viết này đang có
                <span class="font-bold text-red-500">{{
                  articleComments.length
                }}</span>
                bình luận.
              </p>
            </div>

            <div class="mt-6">
              <CommentWidget :comments="formattedArticleComments" />
            </div>
          </div>
        </template>
      </ElDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { commentApi } from "@/api/operations/comment.api";
import CommentWidget from "@/components/business/comment-widget/index.vue";

defineOptions({ name: "MarketingComment" });

const loadingComments = ref(false);
const comments = ref<CommentItem[]>([]);

const getArticleInfo = (
  type: string,
  slug: string,
  title: string,
  image: string,
) => {
  if (type === "promotion") {
    const pTitles: Record<string, string> = {
      "sieu-uu-dai-chao-he-rinh-xe-cuc-da":
        "SIÊU ƯU ĐÃI CHÀO HÈ - RINH XE CỰC ĐÃ",
      "tra-gop-0-phan-tram-so-huu-xe-sang":
        "TRẢ GÓP 0% - DỄ DÀNG SỞ HỮU XE SANG",
      "doi-cu-lay-moi-gia-tri-toi-da": "ĐỔI CŨ LẤY MỚI - GIÁ TRỊ TỐI ĐA",
      "bao-duong-mien-phi-an-tam-moi-neo-duong":
        "BẢO DƯỠNG MIỄN PHÍ - AN TÂM TRÊN MỌI NẺO ĐƯỜNG",
      "combo-phu-kien-an-toan-len-do-chuan-chat":
        "COMBO PHỤ KIỆN AN TOÀN - LÊN ĐỒ CHUẨN CHẤT",
      "dat-coc-xe-moi-nhan-qua-giao-xe": "ĐẶT CỌC XE MỚI - NHẬN QUÀ GIAO XE",
      "kiem-tra-xe-mien-phi-truoc-mua-mua":
        "KIỂM TRA XE MIỄN PHÍ TRƯỚC MÙA MƯA",
      "duyet-tra-gop-online-nhan-xe-trong-ngay":
        "DUYỆT TRẢ GÓP ONLINE - NHẬN XE TRONG NGÀY",
      "thu-cu-xe-tay-ga-tro-gia-len-doi": "THU CŨ XE TAY GA - TRỢ GIÁ LÊN ĐỜI",
    };
    const pImages: Record<string, string> = {
      "sieu-uu-dai-chao-he-rinh-xe-cuc-da":
        "/featured_vario_160_promotion_marketing_1778828577524.webp",
      "tra-gop-0-phan-tram-so-huu-xe-sang":
        "/card_yamaha_exciter_lifestyle_1778828605125.webp",
      "doi-cu-lay-moi-gia-tri-toi-da":
        "/premium_motorcycle_showroom_visit_1778827603878.webp",
      "bao-duong-mien-phi-an-tam-moi-neo-duong":
        "/promotion_process_process_background_1778827621728.webp",
      "combo-phu-kien-an-toan-len-do-chuan-chat": "/service-4.webp",
      "dat-coc-xe-moi-nhan-qua-giao-xe":
        "/hero_honda_sh_2025_spotlight_1778828554894.webp",
      "kiem-tra-xe-mien-phi-truoc-mua-mua": "/service-hero-cinematic.webp",
      "duyet-tra-gop-online-nhan-xe-trong-ngay":
        "/promotion_step_3_procedure_3d_premium_1778927862992.webp",
      "thu-cu-xe-tay-ga-tro-gia-len-doi":
        "/premium_motorcycle_showroom_visit_1778827603878.webp",
    };
    const img = pImages[slug] ? `http://localhost:3000${pImages[slug]}` : "";
    return { title: pTitles[slug] || `Khuyến mãi: ${slug}`, image: img };
  }
  if (type === "technology") {
    const tTitles: Record<string, string> = {
      "phan-phoi-xe-may": "Phân phối xe máy chính hãng",
      "phu-tung-do-choi-xe": "Phụ tùng & Đồ chơi xe",
      "bao-duong-sua-chua": "Bảo dưỡng & Sửa chữa",
      "tra-gop-tai-chinh": "Trả góp & Tài chính",
    };
    const tImages: Record<string, string> = {
      "phan-phoi-xe-may":
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600",
      "phu-tung-do-choi-xe":
        "http://localhost:3000/images/technology/engine_xray.webp",
      "bao-duong-sua-chua":
        "http://localhost:3000/images/technology/safety_blueprint.webp",
      "tra-gop-tai-chinh":
        "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=600",
    };
    return {
      title: tTitles[slug] || `Công nghệ: ${slug}`,
      image: tImages[slug] || "",
    };
  }
  let finalImage = image || "";
  if (finalImage === "null") finalImage = "";

  if (
    finalImage &&
    !finalImage.startsWith("http") &&
    !finalImage.startsWith("//")
  ) {
    const baseUrl =
      import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT ||
      "http://localhost:5000";
    const cleanUrl = finalImage.startsWith("/")
      ? finalImage.substring(1)
      : finalImage;
    finalImage = `${baseUrl}/${cleanUrl}`;
  }
  return {
    title: title || (type ? `${type}: ${slug}` : "Bài viết khác"),
    image: finalImage,
  };
};

const loadComments = async () => {
  loadingComments.value = true;
  try {
    const res = await commentApi.getAll();
    const dataList = (res as any).data || res || [];
    comments.value = dataList.map((c: any) => {
      const info = getArticleInfo(
        c.articleType,
        c.articleSlug,
        c.newsTitle,
        c.newsImage,
      );
      return {
        id: c.id,
        date: c.createdAt,
        content: c.content,
        collection: info.title,
        articleImage: info.image,
        comment: 0,
        userName: c.authorName,
      };
    });
  } catch (error) {
    console.error("Failed to load comments:", error);
  } finally {
    loadingComments.value = false;
  }
};

interface CommentItem {
  id: number;
  date: string;
  content: string;
  collection: string;
  articleImage?: string;
  comment: number;
  userName: string;
  color?: string;
}

const COLOR_LIST = [
  "#D8F8FF",
  "#FDDFD9",
  "#FCE6F0",
  "#D3F8F0",
  "#FFEABC",
  "#F5E1FF",
  "#E1E6FE",
];

const showDrawer = ref(false);
const clickItem = ref<CommentItem>({
  id: 0,
  date: "",
  content: "",
  collection: "",
  comment: 0,
  userName: "",
  color: "",
});

const commentsWithColors = computed(() => {
  return comments.value.map((item: CommentItem, index: number) => ({
    ...item,
    color: COLOR_LIST[index % COLOR_LIST.length],
  }));
});

const articleComments = computed(() => {
  return commentsWithColors.value.filter(
    (c) => c.collection === clickItem.value.collection,
  );
});

const formattedArticleComments = computed(() => {
  return articleComments.value.map((c) => ({
    id: c.id,
    author: c.userName,
    content: c.content,
    timestamp: c.date,
    replies: [],
  }));
});

const openDrawer = (item: CommentItem) => {
  clickItem.value = item;
  showDrawer.value = true;
};

onMounted(() => {
  loadComments();
});
</script>

<style scoped lang="scss">
.comment-page {
  min-height: 100vh;
}

.comment-item {
  background-color: var(--comment-bg);
}

:deep(.dark) .comment-item,
.dark .comment-item {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Dark Mode overrides
:global(html.dark .comment-page) {
  background-color: #05070b !important;
  color: #f8fafc !important;
}

:global(html.dark .comment-page .bg-white) {
  background-color: #10141c !important;
}

:global(html.dark .comment-page .border-slate-200) {
  border-color: rgb(255 255 255 / 12%) !important;
}

:global(html.dark .comment-page .text-slate-900),
:global(html.dark .comment-page h4) {
  color: #f8fafc !important;
}

:global(html.dark .comment-modal .el-drawer) {
  background-color: #10141c !important;
  border-left: 1px solid rgb(255 255 255 / 12%) !important;
}

:global(html.dark .comment-modal .el-drawer__header) {
  padding-bottom: 16px;
  margin-bottom: 0;
  border-bottom: 1px solid rgb(255 255 255 / 8%) !important;
}

:global(html.dark .comment-modal h4) {
  color: #f8fafc !important;
}
</style>
