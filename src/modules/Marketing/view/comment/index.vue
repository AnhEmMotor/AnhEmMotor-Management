<template>
  <div>
    <div class="comment-page min-h-full bg-[#F8FAFC] font-inter text-[#0F172A]">
      <div class="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-lg shrink-0"
            >
              <ArtSvgIcon icon="ri:chat-1-line" class="text-2xl" />
            </div>
            <div>
              <h1
                class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none"
              >
                {{ $t("marketing.comment.title") }}
              </h1>
              <p
                class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5"
              >
                {{ $t("marketing.comment.subtitle") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="bg-white rounded-lg border border-slate-200 p-4">
          <div
            class="mt-10 grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-5"
          >
            <li
              class="relative p-4 c-p aspect-16/12 duration-300 hover:-translate-y-1.5 cursor-pointer"
              :style="{ background: item.color }"
              v-for="item in commentsWithColors"
              :key="item.id"
              @click="openDrawer(item)"
            >
              <p class="text-g-600 text-sm">{{ item.date }}</p>
              <p class="mt-4 text-sm text-gray-800 line-clamp-3">
                {{ item.content }}
              </p>
              <div class="absolute bottom-4 left-0 px-4 flex-cb w-full">
                <div class="flex-c">
                  <div class="flex-c mr-5 text-xs text-g-600">
                    <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
                    <span>{{ item.collection }}</span>
                  </div>
                  <div class="flex-c mr-5 text-xs text-g-600">
                    <ArtSvgIcon
                      icon="ri:message-3-line"
                      class="mr-1 text-base"
                    />
                    <span>{{ item.comment }}</span>
                  </div>
                </div>
                <div>
                  <span class="text-sm text-gray-700">{{ item.userName }}</span>
                </div>
              </div>
            </li>
          </div>
        </div>
      </div>

      <ElDrawer
        lDrawer
        v-model="showDrawer"
        :lock-scroll="false"
        :size="360"
        modal-class="comment-modal"
      >
        <template #header>
          <h4>{{ $t("marketing.comment.detailTitle") }}</h4>
        </template>
        <template #default>
          <div class="drawer-default">
            <div
              class="relative p-4 aspect-16/12"
              :style="{ background: clickItem.color }"
            >
              <p class="text-g-500 text-sm">{{ clickItem.date }}</p>
              <p class="mt-4 text-sm text-gray-800">
                {{ clickItem.content }}
              </p>
              <div class="absolute bottom-4 left-0 px-4 flex-cb w-full">
                <div class="flex-c">
                  <div class="flex-c mr-5 text-xs text-g-600">
                    <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
                    <span>{{ clickItem.collection }}</span>
                  </div>
                  <div class="flex-c mr-5 text-xs text-g-600">
                    <ArtSvgIcon
                      icon="ri:message-3-line"
                      class="mr-1 text-base"
                    />
                    <span>{{ clickItem.comment }}</span>
                  </div>
                </div>
                <span class="text-sm text-gray-700">{{
                  clickItem.userName
                }}</span>
              </div>
            </div>

            <div class="mt-4">
              <h4 class="text-base font-bold mb-2">
                {{ $t("marketing.comment.replyTitle") }}
              </h4>
              <CommentWidget :comment-id="clickItem.id" />
            </div>
          </div>
        </template>
      </ElDrawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { commentList } from "@/mock/temp/commentList";
import CommentWidget from "@/components/business/comment-widget/index.vue";

defineOptions({ name: "MarketingComment" });

interface CommentItem {
  id: number;
  date: string;
  content: string;
  collection: number;
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
  collection: 0,
  comment: 0,
  userName: "",
  color: "",
});

const commentsWithColors = computed(() => {
  return commentList.map((item, index) => ({
    ...item,
    color: COLOR_LIST[index % COLOR_LIST.length],
  }));
});

const openDrawer = (item: CommentItem) => {
  clickItem.value = item;
  showDrawer.value = true;
};
</script>

<style lang="scss" scoped>
.comment-page {
  min-height: 100vh;
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
