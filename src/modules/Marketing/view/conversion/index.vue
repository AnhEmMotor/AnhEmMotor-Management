<template>
  <div
    class="conversion-tools-page min-h-full bg-[#F8FAFC] font-inter text-[#0F172A] pb-10"
  >
    <div class="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
      <div class="max-w-[1400px] mx-auto flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex-cc text-white shadow-xl"
          >
            <ArtSvgIcon icon="ri:magic-line" class="text-2xl" />
          </div>
          <div>
            <h1
              class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none"
            >
              {{ $t("marketing.conversionTools.title") }}
            </h1>
            <p
              class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2"
            >
              {{ $t("marketing.conversionTools.subtitle") }}
            </p>
          </div>
        </div>

        <div class="flex bg-slate-100 p-1 rounded-xl">
          <button
            @click="activeTab = 'popup'"
            class="px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all"
            :class="
              activeTab === 'popup'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            "
          >
            {{ $t("marketing.conversionTools.tabPopup") }}
          </button>
          <button
            @click="activeTab = 'landing'"
            class="px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all"
            :class="
              activeTab === 'landing'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            "
          >
            {{ $t("marketing.conversionTools.tabLanding") }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-8 max-w-[1400px] mx-auto">
      <div v-if="activeTab === 'popup'" class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center">
          <h3
            class="m-0 text-xs font-black uppercase tracking-widest text-slate-400"
          >
            {{ $t("marketing.conversionTools.popupListTitle") }}
          </h3>
          <button
            @click="handleAddPopup"
            class="h-10 px-6 bg-[#001529] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:add-line" />
            {{ $t("marketing.conversionTools.createPopupBtn") }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="popup in popups"
            :key="popup.id"
            class="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all group relative"
          >
            <div class="absolute top-6 right-6">
              <ElSwitch v-model="popup.active" active-color="#10b981" />
            </div>
            <div class="flex items-start gap-5">
              <div
                class="size-16 rounded-2xl bg-slate-50 flex-cc border border-slate-100 overflow-hidden shrink-0"
              >
                <img
                  v-if="popup.img"
                  :src="popup.img"
                  class="w-full h-full object-cover"
                />
                <ArtSvgIcon
                  v-else
                  icon="ri:window-line"
                  class="text-3xl text-slate-200"
                />
              </div>
              <div class="flex-1">
                <h4
                  class="m-0 text-base font-black text-slate-800 leading-tight mb-1"
                >
                  {{ popup.name }}
                </h4>
                <p class="m-0 text-[11px] font-bold text-slate-400 mb-3 italic">
                  "{{ popup.content }}"
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase"
                    >{{ $t("marketing.conversionTools.showAfter") }}:
                    {{ popup.delay }}s</span
                  >
                  <span
                    class="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[8px] font-black uppercase"
                    >{{ $t("marketing.conversionTools.page") }}:
                    {{ popup.pages }}</span
                  >
                </div>
              </div>
            </div>
            <div
              class="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center"
            >
              <div class="flex gap-4">
                <div class="flex flex-col">
                  <span
                    class="text-[8px] font-black text-slate-300 uppercase"
                    >{{ $t("marketing.conversionTools.views") }}</span
                  >
                  <span class="text-xs font-black text-slate-700">{{
                    popup.views
                  }}</span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-[8px] font-black text-slate-300 uppercase"
                    >{{ $t("marketing.conversionTools.clicks") }}</span
                  >
                  <span class="text-xs font-black text-blue-600">{{
                    popup.clicks
                  }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="h-8 px-4 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase hover:bg-slate-800 hover:text-white transition-all"
                >
                  Sửa
                </button>
                <button
                  class="size-8 bg-red-50 text-red-400 rounded-lg flex-cc hover:bg-red-500 hover:text-white transition-all"
                >
                  <ArtSvgIcon icon="ri:delete-bin-line" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'landing'" class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center">
          <h3
            class="m-0 text-xs font-black uppercase tracking-widest text-slate-400"
          >
            {{ $t("marketing.conversionTools.landingListTitle") }}
          </h3>
          <button
            @click="handleAddLanding"
            class="h-10 px-6 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:layout-4-line" />
            {{ $t("marketing.conversionTools.createLandingBtn") }}
          </button>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div
            v-for="page in landingPages"
            :key="page.id"
            class="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group"
          >
            <div class="aspect-video bg-slate-100 relative overflow-hidden">
              <img
                :src="page.preview"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex-cc"
              >
                <button
                  class="px-6 py-2 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                >
                  {{ $t("marketing.conversionTools.viewPageBtn") }}
                </button>
              </div>
            </div>
            <div class="p-6">
              <div class="flex justify-between items-center mb-2">
                <h4 class="m-0 text-sm font-black text-slate-800 truncate">
                  {{ page.name }}
                </h4>
                <span
                  class="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-black uppercase"
                  >{{ page.status }}</span
                >
              </div>
              <p class="m-0 text-[10px] font-bold text-slate-400 mb-4 truncate">
                {{ page.url }}
              </p>

              <div
                class="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-4"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="size-8 rounded-lg bg-blue-50 text-blue-600 flex-cc shrink-0"
                  >
                    <ArtSvgIcon icon="ri:user-voice-line" />
                  </div>
                  <div>
                    <p
                      class="m-0 text-[8px] font-black text-slate-300 uppercase"
                    >
                      Leads
                    </p>
                    <p class="m-0 text-xs font-black text-slate-700">
                      {{ page.leads }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="size-8 rounded-lg bg-purple-50 text-purple-600 flex-cc shrink-0"
                  >
                    <ArtSvgIcon icon="ri:cursor-line" />
                  </div>
                  <div>
                    <p
                      class="m-0 text-[8px] font-black text-slate-300 uppercase"
                    >
                      {{ $t("marketing.conversionTools.clicks") }}
                    </p>
                    <p class="m-0 text-xs font-black text-slate-700">
                      {{ page.clicks }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="flex-1 h-9 bg-slate-50 text-slate-600 rounded-lg font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-slate-800 hover:text-white transition-all"
                >
                  Chỉnh sửa
                </button>
                <button
                  class="size-9 bg-blue-50 text-blue-600 rounded-lg flex-cc hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <ArtSvgIcon icon="ri:share-forward-line" />
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
      width="500px"
      custom-class="combat-dialog"
    >
      <div class="p-8 text-center flex-cc flex-col gap-4 opacity-50">
        <ArtSvgIcon icon="ri:tools-line" class="text-5xl" />
        <p class="text-sm font-black uppercase tracking-widest leading-relaxed">
          Trình thiết kế trực quan (Visual Designer) <br />
          Đang được tối ưu hóa cấu trúc dữ liệu
        </p>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted } from "vue";
import { conversionToolApi } from "@/api/operations/conversion-tool.api";

defineOptions({ name: "MarketingConversionTools" });

const { t } = useI18n();

const activeTab = ref("popup");
const dialogVisible = ref(false);
const dialogTitle = ref("");

const popups = ref<any[]>([]);
const allTools = ref<any[]>([]);
const loadingTools = ref(false);

const loadTools = async () => {
  loadingTools.value = true;
  try {
    const res = await conversionToolApi.getAll();
    allTools.value = res as any;
    popups.value = allTools.value
      .filter((t: any) => t.type === "Popup")
      .map((t: any) => ({
        id: t.id,
        name: t.name,
        content: t.content || "",
        delay: t.delaySeconds || 0,
        pages: t.pages || "",
        active: t.isActive,
        views: t.views,
        clicks: t.clicks,
        img: t.imageUrl || "",
      }));
  } catch (error) {
    console.error("Failed to load conversion tools:", error);
  } finally {
    loadingTools.value = false;
  }
};

const landingPages = computed(() =>
  allTools.value
    .filter((t: any) => t.type === "Landing")
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      url: t.url || "",
      status: t.status || "draft",
      leads: t.leads,
      clicks: t.clicks,
      preview: t.imageUrl || "",
    })),
);

const handleAddPopup = () => {
  dialogTitle.value = "Cấu hình Pop-up thông minh";
  dialogVisible.value = true;
};

const handleAddLanding = () => {
  dialogTitle.value = "Khởi tạo Landing Page";
  dialogVisible.value = true;
};
onMounted(() => {
  loadTools();
});

onMounted(() => {
  loadTools();
});
</script>

<style lang="scss" scoped>
.conversion-tools-page {
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.combat-dialog) {
  border-radius: 32px;

  .el-dialog__header {
    padding: 32px;
    border-bottom: 1px solid #f1f5f9;
  }
}
</style>
