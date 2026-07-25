<template>
  <div
    class="manual-layout h-screen flex flex-col overflow-hidden bg-[var(--el-bg-color-page)]"
  >
    <!-- Header -->
    <div
      id="app-header"
      class="w-full sticky top-0 z-50 border-b border-[var(--el-border-color-light)] bg-[var(--el-bg-color)]"
    >
      <ArtHeaderBar :isPortal="true" />
    </div>

    <!-- Main Workspace -->
    <div class="manual-container flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <div
        class="manual-sidebar w-72 bg-[var(--el-bg-color)] border-r border-[var(--el-border-color-light)] flex flex-col flex-shrink-0 z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)]"
      >
        <div class="p-6 border-b border-[var(--el-border-color-light)]">
          <h2
            class="text-lg font-bold flex items-center gap-2"
            style="color: var(--el-text-color-primary)"
          >
            <el-icon class="text-blue-600"><Document /></el-icon>
            <span>HDSD Phần Mềm</span>
          </h2>
          <p class="text-xs mt-1" style="color: var(--el-text-color-secondary)">
            Trung tâm tài liệu vận hành
          </p>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div
            class="text-[11px] font-bold uppercase tracking-wider mb-3 px-2 mt-2"
            style="color: var(--el-text-color-placeholder)"
          >
            Mục lục hướng dẫn
          </div>
          <div
            v-for="section in availableSections"
            :key="section.id"
            @click="activeSection = section.id"
            class="px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-3"
            :class="
              activeSection === section.id
                ? 'active-section'
                : 'inactive-section'
            "
          >
            <el-icon class="text-lg"><component :is="section.icon" /></el-icon>
            <span class="text-sm font-medium">{{ section.title }}</span>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div
        class="manual-content flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 bg-[var(--el-bg-color)] relative"
      >
        <div class="animate-fade-in-up w-full">
          <!-- Overview -->
          <div v-if="activeSection === 'overview'">
            <h1
              class="text-3xl font-black mb-3"
              style="color: var(--el-text-color-primary)"
            >
              Luồng Hoạt Động Tổng Quan
            </h1>
            <p
              class="mb-8 text-lg"
              style="color: var(--el-text-color-secondary)"
            >
              Nắm bắt quy trình vận hành xuyên suốt của hệ thống phần mềm Anh Em
              Motor.
            </p>

            <div
              class="p-12 text-center border-2 border-dashed rounded-xl mt-4"
              style="
                border-color: var(--el-border-color-lighter);
                background-color: var(--el-fill-color-light);
                color: var(--el-text-color-secondary);
              "
            >
              <el-icon class="text-5xl mb-4 opacity-50"><Picture /></el-icon>
              <p class="text-lg font-medium">
                [Sơ đồ luồng hoạt động tổng quan sẽ được thiết kế tại đây]
              </p>
              <p class="text-sm mt-2">
                Dành cho tất cả nhân viên để hiểu rõ chuỗi giá trị và luồng công
                việc.
              </p>
            </div>
          </div>

          <!-- Specific Modules -->
          <div v-else :key="activeSection">
            <div class="flex items-center gap-3 mb-3">
              <el-icon class="text-3xl" style="color: var(--el-color-primary)"
                ><component :is="currentSectionData?.icon"
              /></el-icon>
              <h1
                class="text-3xl font-black"
                style="color: var(--el-text-color-primary)"
              >
                {{ currentSectionData?.title }}
              </h1>
            </div>
            <p
              class="mb-8 text-lg"
              style="color: var(--el-text-color-secondary)"
            >
              Tài liệu hướng dẫn nghiệp vụ chi tiết dành riêng cho phân hệ này.
            </p>

            <div
              class="prose max-w-none"
              style="color: var(--el-text-color-regular)"
            >
              <!-- Mock Content -->
              <h3
                class="text-xl font-bold mb-4"
                style="color: var(--el-text-color-primary)"
              >
                1. Giới thiệu phân hệ
              </h3>
              <p class="mb-6 leading-relaxed">
                Phân hệ <strong>{{ currentSectionData?.title }}</strong> được
                thiết kế để giúp bạn quản lý các nghiệp vụ chuyên môn một cách
                nhanh chóng, tự động và chính xác. Tại đây, bạn sẽ được hướng
                dẫn từng bước để làm chủ các chức năng.
              </p>

              <h3
                class="text-xl font-bold mb-4"
                style="color: var(--el-text-color-primary)"
              >
                2. Các chức năng chính
              </h3>
              <ul class="list-disc pl-6 space-y-2 mb-8">
                <li>
                  Xem danh sách và thao tác dữ liệu cơ bản (Thêm, Sửa, Xóa).
                </li>
                <li>Xử lý các nghiệp vụ chuyên sâu theo quy trình chuẩn.</li>
                <li>Lập và xuất báo cáo thống kê định kỳ.</li>
              </ul>

              <el-alert
                title="Lưu ý quan trọng trong quá trình vận hành"
                type="warning"
                show-icon
                :closable="false"
                class="mb-4"
              >
                <p class="mt-1">
                  Vui lòng kiểm tra kỹ dữ liệu trước khi lưu vào hệ thống để
                  tránh sai sót ảnh hưởng đến các phân hệ khác (vì dữ liệu được
                  liên kết chặt chẽ).
                </p>
              </el-alert>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="app-global">
      <ArtGlobalComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Document,
  Picture,
  DataAnalysis,
  UserFilled,
  Box,
  Service,
  Wallet,
} from "@element-plus/icons-vue";
import { useAuth } from "@/common/composables/useAuth";
import { Permissions } from "@/domain/constants/permissions";
import ArtHeaderBar from "@/components/core/layouts/art-header-bar/index.vue";
import ArtGlobalComponent from "@/components/core/layouts/art-global-component/index.vue";

const { hasAuth } = useAuth();

const activeSection = ref("overview");

const sections = [
  {
    id: "overview",
    title: "Tổng quan hệ thống",
    icon: Document,
    hasAccess: true,
  },
  {
    id: "admin",
    title: "Ban Điều Hành & Chủ Showroom",
    icon: DataAnalysis,
    hasAccess: hasAuth(Permissions.Admin.Module),
  },
  {
    id: "marketing",
    title: "Marketing & SEO",
    icon: UserFilled,
    hasAccess: hasAuth(Permissions.Marketing.Module),
  },
  {
    id: "warehouse",
    title: "Quản Lý Kho & Hậu Cần",
    icon: Box,
    hasAccess: hasAuth(Permissions.Warehouse.Module),
  },
  {
    id: "factory",
    title: "Dịch Vụ & Xưởng Sửa Chữa",
    icon: Service,
    hasAccess: hasAuth(Permissions.Factory.Module),
  },
  {
    id: "accountant",
    title: "Kế Toán, Lương & Thuế",
    icon: Wallet,
    hasAccess: hasAuth(Permissions.Accountant.Module),
  },
  {
    id: "order",
    title: "Đơn hàng & Vận chuyển",
    icon: Wallet,
    hasAccess: hasAuth(Permissions.Order.Module),
  },
];

const availableSections = computed(() => sections.filter((s) => s.hasAccess));
const currentSectionData = computed(() =>
  availableSections.value.find((s) => s.id === activeSection.value),
);
</script>

<style lang="scss" scoped>
.active-section {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgb(0 0 0 / 3%);
}

.inactive-section {
  color: var(--el-text-color-regular);

  &:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-dark);
  border-radius: 10px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

.prose h3 {
  margin-top: 1.5em;
}

.prose p,
.prose ul {
  font-size: 15px;
}
</style>
