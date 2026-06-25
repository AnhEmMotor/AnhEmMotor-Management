<template>
  <div
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
              Quản lý Khách hàng
            </h1>
            <p
              class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5"
            >
              Quản lý thông tin và hoạt động của khách hàng
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
              <p class="text-xs text-slate-500 mt-0.5">{{ menu.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "CustomerManagement" });

const customerMenus = [
  {
    path: "/marketing/customer/potential",
    title: "Khách hàng tiềm năng",
    description: "Quản lý leads và khách hàng tiềm năng",
    icon: "ri:user-search-line",
  },
  {
    path: "/marketing/customer/profile",
    title: "Hồ sơ khách hàng",
    description: "Xem và chỉnh sửa hồ sơ khách hàng",
    icon: "ri:profile-line",
  },
  {
    path: "/marketing/customer/asset",
    title: "Tài sản",
    description: "Quản lý tài sản của khách hàng",
    icon: "ri:car-line",
  },
  {
    path: "/marketing/customer/care",
    title: "Chăm sóc",
    description: "Chăm sóc và hỗ trợ khách hàng",
    icon: "ri:gift-line",
  },
  {
    path: "/marketing/customer/progress",
    title: "Tiến độ",
    description: "Theo dõi tiến độ dịch vụ",
    icon: "ri:git-commit-line",
  },
];
</script>

<style scoped>
.customer-management-page {
  min-height: 100vh;
}
</style>
