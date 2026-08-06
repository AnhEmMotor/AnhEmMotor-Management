<template>
  <div class="manual-layout h-screen flex flex-col overflow-hidden relative">
    <!-- Background Image -->
    <img
      src="@/assets/images/HDSD.jpg"
      class="manual-image-bg"
      alt="background"
    />
    <div class="manual-bg-overlay"></div>

    <!-- Header -->
    <div
      id="app-header"
      class="w-full sticky top-0 z-50 shadow-sm relative"
      style="background-color: var(--default-bg-color)"
    >
      <ArtHeaderBar :isPortal="true" />
    </div>

    <!-- Main Workspace -->
    <div class="manual-container flex flex-1 overflow-hidden relative z-10">
      <!-- Content Area -->
      <div
        class="manual-content flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 relative flex flex-col"
      >
        <div
          class="w-full max-w-[1300px] mx-auto flex-1 flex flex-col justify-center"
        >
          <!-- Overview -->
          <div v-if="activeSection === 'overview'">
            <div
              class="mb-8 mx-auto max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl py-6 px-8 border border-white/10 shadow-2xl text-center"
            >
              <h1
                class="text-4xl font-black mb-2 text-white"
                style="text-shadow: 0 2px 10px rgb(0 0 0 / 80%)"
              >
                Trung Tâm Hướng Dẫn Sử Dụng
              </h1>
              <p
                class="text-lg text-white"
                style="text-shadow: 0 1px 8px rgb(0 0 0 / 80%); opacity: 0.95"
              >
                Chọn một phân hệ dưới đây để xem tài liệu hướng dẫn chi tiết.
              </p>
            </div>

            <div class="workspace-grid mt-4">
              <el-card
                v-for="section in availableSections.filter(
                  (s) => s.id !== 'overview',
                )"
                :key="section.id"
                class="workspace-card relative"
                :style="{
                  '--theme-color': section.color,
                  '--hover-shadow-color': section.shadowColor,
                }"
                shadow="never"
                @click="openSection(section)"
              >
                <div class="card-header">
                  <div class="flex items-center gap-3">
                    <div
                      class="icon-wrapper"
                      :style="{
                        backgroundColor: section.color + '20',
                        color: section.color,
                      }"
                    >
                      <el-icon><component :is="section.icon" /></el-icon>
                    </div>
                  </div>
                </div>

                <div class="card-content">
                  <h3 class="workspace-title">{{ section.title }}</h3>
                  <span
                    class="workspace-subtitle"
                    :style="{ color: section.color }"
                    >{{ section.subtitle }}</span
                  >
                </div>
              </el-card>
            </div>
          </div>

          <!-- Specific Modules -->
          <div
            v-else
            :key="activeSection"
            class="bg-[var(--el-bg-color-overlay)] p-8 md:p-10 rounded-2xl shadow-xl backdrop-blur-xl border border-[var(--el-border-color-light)]"
          >
            <el-button
              class="mb-6"
              @click="activeSection = 'overview'"
              icon="Back"
              type="primary"
              plain
            >
              Quay lại Tổng quan
            </el-button>
            <div class="flex items-center gap-3 mb-3">
              <el-icon
                class="text-3xl"
                :style="{
                  color: currentSectionData?.color || 'var(--el-color-primary)',
                }"
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
import { ref, computed, markRaw } from "vue";
import { useRouter } from "vue-router";
import {
  Document,
  Picture,
  DataAnalysis,
  UserFilled,
  Box,
  Service,
  Wallet,
  Back,
} from "@element-plus/icons-vue";
import { useAuth } from "@/common/composables/useAuth";
import { Permissions } from "@/domain/constants/permissions";
import ArtHeaderBar from "@/components/core/layouts/art-header-bar/index.vue";
import ArtGlobalComponent from "@/components/core/layouts/art-global-component/index.vue";

const { hasAuth } = useAuth();
const router = useRouter();

const activeSection = ref("overview");

function openSection(section: any) {
  if (section.id === "admin") {
    router.push("/admin/manual");
  } else if (section.id === "factory") {
    router.push("/factory/manual");
  } else if (section.id === "accountant") {
    router.push("/Accountant/manual");
  } else if (section.id === "marketing") {
    router.push("/Marketing/manual");
  } else if (section.id === "order") {
    router.push("/Order/manual");
  } else if (section.id === "warehouse") {
    router.push("/Warehouse/manual");
  } else {
    activeSection.value = section.id;
  }
}

const sections = [
  {
    id: "overview",
    title: "Tổng quan hệ thống",
    subtitle: "System Overview",
    icon: markRaw(Document),
    color: "#0284c7",
    shadowColor: "rgba(2, 132, 199, 0.15)",
    hasAccess: true,
  },
  {
    id: "admin",
    title: "Ban Điều Hành & Chủ Showroom",
    subtitle: "Executive Overview",
    icon: markRaw(DataAnalysis),
    color: "#e11d48",
    shadowColor: "rgba(225, 29, 72, 0.25)",
    hasAccess: hasAuth(Permissions.Admin.Module),
  },
  {
    id: "marketing",
    title: "Marketing & SEO",
    subtitle: "Marketing & SEO Workspace",
    icon: markRaw(UserFilled),
    color: "#059669",
    shadowColor: "rgba(5, 150, 105, 0.25)",
    hasAccess: hasAuth(Permissions.Marketing.Module),
  },
  {
    id: "warehouse",
    title: "Quản Lý Kho & Hậu Cần",
    subtitle: "Inventory & Asset Logistics",
    icon: markRaw(Box),
    color: "#d97706",
    shadowColor: "rgba(217, 119, 6, 0.15)",
    hasAccess: hasAuth(Permissions.Warehouse.Module),
  },
  {
    id: "factory",
    title: "Dịch Vụ & Xưởng Sửa Chữa",
    subtitle: "Workshop Operations",
    icon: markRaw(Service),
    color: "#2563eb",
    shadowColor: "rgba(37, 99, 235, 0.15)",
    hasAccess: hasAuth(Permissions.Factory.Module),
  },
  {
    id: "accountant",
    title: "Kế Toán, Lương & Thuế",
    subtitle: "Financial & Compliance",
    icon: markRaw(Wallet),
    color: "#7c3aed",
    shadowColor: "rgba(124, 58, 237, 0.15)",
    hasAccess: hasAuth(Permissions.Accountant.Module),
  },
  {
    id: "order",
    title: "Đơn hàng & Vận chuyển",
    subtitle: "Order & Transer Workspace",
    icon: markRaw(Wallet),
    color: "#0284c7",
    shadowColor: "rgba(2, 132, 199, 0.15)",
    hasAccess: hasAuth(Permissions.Order.Module),
  },
];

const availableSections = computed(() => sections.filter((s) => s.hasAccess));
const currentSectionData = computed(() =>
  availableSections.value.find((s) => s.id === activeSection.value),
);
</script>

<style lang="scss" scoped>
.manual-image-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}

.manual-bg-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  background-color: var(--el-bg-color-page);
  opacity: 0.45;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}

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

.prose h3 {
  margin-top: 1.5em;
}

.prose p,
.prose ul {
  font-size: 15px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  width: 100%;

  @media (width >= 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (width >= 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  .workspace-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: 16px;
    box-shadow: 0 4px 15px rgb(0 0 0 / 4%) !important;
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      border-color: var(--theme-color);
      box-shadow: 0 12px 28px var(--hover-shadow-color) !important;
      transform: translateY(-4px);
    }

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 16px 20px;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      min-height: 40px;
      margin-bottom: 10px;

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        font-size: 24px;
        border-radius: 12px;
        transition: all 0.3s;
      }
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .workspace-title {
        margin-bottom: 4px;
        font-size: 17px;
        font-weight: 800;
        line-height: 1.4;
        color: var(--el-text-color-primary);
      }

      .workspace-subtitle {
        display: inline-block;
        margin-bottom: 0;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
      }
    }
  }
}
</style>
