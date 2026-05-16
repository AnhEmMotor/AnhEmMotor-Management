<template>
  <div class="article-list-page min-h-full bg-[#F8FAFC] font-inter text-[#0F172A] pb-10">
    <div class="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-[50] shadow-sm">
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
              type="text"
              placeholder="Tìm bài viết, chuyên gia tư vấn..."
              class="w-full h-11 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white transition-all outline-none"
              @keyup.enter="searchArticle"
            />
          </div>
          <div class="hidden lg:block">
            <ElSegmented
              v-model="yearVal"
              :options="YEAR_OPTIONS"
              @change="searchArticleByYear"
              class="combat-segmented"
            />
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <div
            class="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2"
          >
            <span class="text-[9px] font-black text-blue-400 uppercase tracking-tighter"
              >Tổng lượt xem:</span
            >
            <span class="text-base font-black text-blue-600 leading-none">12.8K</span>
          </div>
          <button
            @click="toAddArticle"
            class="h-11 px-8 bg-[#001529] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:add-circle-line" /> Viết bài mới
          </button>
        </div>
      </div>
    </div>

    <div class="p-8 max-w-[1400px] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div
          v-for="item in articleList"
          :key="item.id"
          class="article-card group bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative"
        >
          <div class="absolute top-4 left-4 z-10">
            <span
              class="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/20"
              :class="getStatusClasses(item.status || 'Published')"
            >
              {{ item.statusLabel || 'Đã xuất bản' }}
            </span>
          </div>

          <div class="aspect-video overflow-hidden relative">
            <img
              :src="item.home_img"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6"
            >
              <div class="flex gap-2 w-full">
                <button
                  @click.stop="toDetail(item)"
                  class="flex-1 h-9 bg-white/20 backdrop-blur-md text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
                  >Xem trước</button
                >
                <button
                  @click.stop="toEdit(item)"
                  class="flex-1 h-9 bg-blue-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                  >Chỉnh sửa</button
                >
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="flex justify-between items-start mb-3">
              <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest">{{
                item.type_name
              }}</span>
              <div
                class="flex items-center gap-1.5 text-slate-400 group-hover:text-blue-500 transition-colors"
              >
                <ArtSvgIcon icon="ri:eye-line" class="text-sm" />
                <span class="text-[11px] font-black">{{ item.count }}</span>
              </div>
            </div>
            <h2
              class="m-0 text-base font-black text-slate-800 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors"
              >{{ item.title }}</h2
            >

            <div class="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
              <div class="flex items-center gap-2 text-slate-400">
                <ArtSvgIcon icon="ri:calendar-line" class="text-xs" />
                <span class="text-[10px] font-bold">{{
                  useDateFormat(item.create_time, 'DD/MM/YYYY').value
                }}</span>
              </div>
              <div class="flex -space-x-2">
                <div
                  class="size-6 rounded-full border-2 border-white bg-slate-200 flex-cc text-[8px] font-black"
                  >Admin</div
                >
              </div>
            </div>
          </div>

          <div class="h-1 bg-slate-100 absolute bottom-0 left-0 right-0 overflow-hidden">
            <div
              class="h-full bg-blue-500 transition-all duration-1000 ease-out"
              :style="{ width: (item.count / 1000) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="showEmpty" class="py-40 flex-cc flex-col gap-4 opacity-30">
        <ArtSvgIcon icon="ri:article-line" class="text-6xl" />
        <p class="text-sm font-black uppercase tracking-widest">Chưa tìm thấy bài viết nào</p>
      </div>
    </div>

    <div class="flex justify-center mt-10">
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
  import { ref, computed, onMounted } from 'vue'
  import { useDateFormat } from '@vueuse/core'
  import { router } from '@/router'
  import { ArticleList as MockData } from '@/mock/temp/articleList'
  import { useCommon } from '@/hooks/core/useCommon'

  defineOptions({ name: 'ArticleListAnalytics' })

  const YEAR_OPTIONS = ['Tất cả', '2025', '2024', '2023']
  const PAGE_SIZE = 12

  const yearVal = ref('Tất cả')
  const searchVal = ref('')
  const currentPage = ref(1)
  const pageSize = ref(PAGE_SIZE)
  const total = ref(MockData.length)

  const articleList = ref(
    MockData.map((item, idx) => ({
      ...item,
      status: idx === 0 ? 'Scheduled' : idx === 1 ? 'Draft' : 'Published',
      statusLabel: idx === 0 ? 'Hẹn giờ' : idx === 1 ? 'Bản nháp' : 'Đã xuất bản'
    }))
  )

  const showEmpty = computed(() => articleList.value.length === 0)

  const getStatusClasses = (status: string) => {
    if (status === 'Draft') return 'bg-slate-500 text-white'
    if (status === 'Scheduled') return 'bg-amber-500 text-white'
    return 'bg-emerald-500 text-white'
  }

  const searchArticle = () => {}
  const searchArticleByYear = () => {}
  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    useCommon().scrollToTop()
  }

  const toDetail = (item: any) => router.push({ name: 'ArticleDetail', params: { id: item.id } })
  const toEdit = (item: any) => router.push({ name: 'ArticlePublish', query: { id: item.id } })
  const toAddArticle = () => router.push({ name: 'ArticlePublish' })

  onMounted(() => {
    useCommon().scrollToTop()
  })
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
