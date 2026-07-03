<template>
  <div
    v-if="
      $route.path.toLowerCase() === '/marketing/customer' ||
      $route.path.toLowerCase() === '/marketing/customer/'
    "
    class="customer-management-page min-h-full bg-[#F8FAFC] font-inter text-[#0F172A]"
  >
    <div class="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-lg shrink-0"
          >
            <ArtSvgIcon icon="ri:user-heart-line" class="text-2xl" />
          </div>
          <div>
            <h1
              class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none"
            >
              {{ $t("marketing.customer.title") }}
            </h1>
            <p
              class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5"
            >
              {{ $t("marketing.customer.subtitle") }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="menu in customerMenus"
          :key="menu.path"
          class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="$router.push(menu.path)"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-lg bg-blue-50 flex items-center justify-center"
            >
              <ArtSvgIcon :icon="menu.icon" class="text-lg text-blue-600" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">{{ menu.title }}</h3>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ menu.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
defineOptions({ name: "CustomerManagement" });

const { t } = useI18n();

const customerMenus = [
  {
    path: "/Marketing/customer/potential",
    title: t("marketing.customer.potential"),
    description: t("marketing.customer.potentialDesc"),
    icon: "ri:user-search-line",
  },
  {
    path: "/Marketing/customer/profile",
    title: t("marketing.customer.profile"),
    description: t("marketing.customer.profileDesc"),
    icon: "ri:profile-line",
  },
  {
    path: "/Marketing/customer/asset",
    title: t("marketing.customer.asset"),
    description: t("marketing.customer.assetDesc"),
    icon: "ri:car-line",
  },
  {
    path: "/Marketing/customer/care",
    title: t("marketing.customer.care"),
    description: t("marketing.customer.careDesc"),
    icon: "ri:gift-line",
  },
  {
    path: "/Marketing/customer/progress",
    title: t("marketing.customer.progress"),
    description: t("marketing.customer.progressDesc"),
    icon: "ri:git-commit-line",
  },
];
</script>

<style scoped>
.customer-management-page {
  min-height: 100vh;
}
</style>
