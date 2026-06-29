<template>
  <div class="portal-layout relative overflow-y-auto overflow-x-hidden">
    <div
      id="app-header"
      class="w-full sticky top-0 z-50 shadow-sm"
      style="background-color: var(--default-bg-color)"
    >
      <ArtHeaderBar :isPortal="true" />
    </div>

    <div class="portal-bg-overlay"></div>
    <div class="portal-header relative z-10"></div>

    <div class="portal-container relative z-10">
      <div class="workspace-grid max-w-[1100px] mx-auto">
        <el-card
          v-for="(workspace, index) in workspaces"
          :key="index"
          class="workspace-card relative animate-fade-in-up"
          :class="{ 'is-disabled': !workspace.hasAccess }"
          :style="{
            '--theme-color': workspace.color,
            '--hover-shadow-color': workspace.shadowColor,
            'animation-delay': `${index * 0.1}s`,
          }"
          shadow="never"
          @click="handleWorkspaceClick(workspace)"
        >
          <div
            v-if="
              workspace.hasAccess && workspace.badge && workspace.badge.isDot
            "
            class="absolute top-0 right-0 -mt-2 -mr-2 flex h-4 w-4 z-20"
          >
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              :style="{ backgroundColor: workspace.color }"
            ></span>
            <span
              class="relative inline-flex rounded-full h-4 w-4 border-2 border-[var(--el-bg-color-overlay)] shadow-sm"
              :style="{ backgroundColor: workspace.color }"
            ></span>
          </div>

          <div class="card-header">
            <div class="flex items-center gap-3">
              <div
                class="icon-wrapper"
                :style="{
                  backgroundColor: workspace.color + '20',
                  color: workspace.color,
                }"
              >
                <el-icon><component :is="workspace.icon" /></el-icon>
              </div>
              <el-tag
                :type="workspace.hasAccess ? 'success' : 'info'"
                :effect="workspace.hasAccess ? 'light' : 'plain'"
                size="small"
                round
              >
                {{ workspace.hasAccess ? "Đã cấp quyền" : "Khóa truy cập" }}
              </el-tag>
            </div>

            <div
              v-if="
                workspace.hasAccess && workspace.badge && !workspace.badge.isDot
              "
              class="realtime-badge"
              :class="workspace.badge.type"
            >
              <span
                class="badge-text"
                :style="{
                  color: workspace.color,
                  backgroundColor: workspace.color + '15',
                  border: `1px solid ${workspace.color}30`,
                }"
              >
                {{ workspace.badge.value }} {{ workspace.badge.label }}
              </span>
            </div>
          </div>

          <div class="card-content">
            <h3 class="workspace-title">{{ workspace.title }}</h3>
            <span
              class="workspace-subtitle"
              :style="{ color: workspace.color }"
              >{{ workspace.subtitle }}</span
            >
          </div>
        </el-card>
      </div>
    </div>

    <div id="app-global">
      <ArtGlobalComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from "vue";
import {
  DataAnalysis,
  Service,
  Box,
  UserFilled,
  Wallet,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useCommon } from "@/common/composables/useCommon";
import ArtHeaderBar from "@/components/core/layouts/art-header-bar/index.vue";
import ArtGlobalComponent from "@/components/core/layouts/art-global-component/index.vue";
import { useWorktabStore } from "@/application/store/worktab";
import { onMounted } from "vue";

const router = useRouter();
const { homePath } = useCommon();
const worktabStore = useWorktabStore();

onMounted(() => {
  worktabStore.clearAll();
});

const handleWorkspaceClick = (workspace: any) => {
  if (workspace.hasAccess) {
    if (workspace.path) {
      router.push(workspace.path);
    } else {
      router.push(homePath.value || "/dashboard");
    }
  }
};

const workspaces = ref([
  {
    title: "Ban Điều Hành & Chủ Showroom",
    subtitle: "Executive Overview",
    icon: markRaw(DataAnalysis),
    color: "#e11d48",
    shadowColor: "rgba(225, 29, 72, 0.25)",
    hasAccess: true,
    badge: { isDot: true, type: "danger" },
    path: "/admin/dashboard/console",
  },
  {
    title: "Marketing & SEO",
    subtitle: "Marketing & SEO Workspace",
    icon: markRaw(UserFilled),
    color: "#059669",
    shadowColor: "rgba(5, 150, 105, 0.25)",
    hasAccess: true,
    badge: { isDot: false, value: 5, label: "đơn mới", type: "warning" },
    path: "/Marketing/banner",
  },
  {
    title: "Quản Lý Kho & Hậu Cần",
    subtitle: "Inventory & Asset Logistics",
    icon: markRaw(Box),
    color: "#d97706",
    shadowColor: "rgba(217, 119, 6, 0.15)",
    hasAccess: true,
    path: "/Warehouse/product",
  },
  {
    title: "Dịch Vụ & Xưởng Sửa Chữa",
    subtitle: "Workshop Operations",
    icon: markRaw(Service),
    color: "#2563eb",
    shadowColor: "rgba(37, 99, 235, 0.15)",
    hasAccess: true,
    path: "/factory/workshop/dashboard",
  },
  {
    title: "Kế Toán, Lương & Thuế",
    subtitle: "Financial & Compliance",
    icon: markRaw(Wallet),
    color: "#7c3aed",
    shadowColor: "rgba(124, 58, 237, 0.15)",
    hasAccess: true,
    path: "/Accountant/executive-dashboard",
  },
  {
    title: "Đơn hàng & Vận chuyển",
    subtitle: "Order & Transer Workspace",
    icon: markRaw(Wallet),
    color: "#7c3aed",
    shadowColor: "rgba(124, 58, 237, 0.15)",
    hasAccess: true,
    path: "/Order/management/list",
  },
]);
</script>

<style lang="scss" scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.portal-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url("https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1920");
  background-attachment: fixed;
  background-position: center;
  background-size: cover;

  .portal-bg-overlay {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-color: var(--el-bg-color-page);
    opacity: 0.45;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }

  .portal-header {
    padding: 60px 20px 40px;
    margin-bottom: 20px;

    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;

      .welcome-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 16px;
        margin-bottom: 20px;
        font-size: 12px;
        font-weight: 700;
        color: var(--el-color-primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: var(--el-color-primary-light-9);
        border: 1px solid var(--el-color-primary-light-5);
        border-radius: 30px;
        box-shadow: 0 4px 15px rgb(0 0 0 / 10%);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);

        .el-icon {
          font-size: 14px;
          color: var(--el-color-warning);
        }
      }

      .title {
        margin-bottom: 16px;
        font-size: 42px;
        font-weight: 900;
        line-height: 1.2;
        color: var(--el-text-color-primary);
        letter-spacing: -1px;
        text-shadow:
          0 2px 15px var(--el-bg-color),
          0 0 30px var(--el-bg-color);
      }

      .subtitle {
        max-width: 650px;
        margin: 0 auto;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.7;
        color: var(--el-text-color-primary);
        text-shadow:
          0 2px 10px var(--el-bg-color),
          0 0 20px var(--el-bg-color);
        opacity: 0.9;
      }
    }
  }

  .portal-container {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 20px 60px;

    .workspace-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      justify-content: center;
      margin: auto;

      .workspace-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 380px;
        cursor: pointer;
        background: var(--el-bg-color-overlay);
        border: 1px solid var(--el-border-color-light);
        border-radius: 16px;
        box-shadow: 0 4px 15px rgb(0 0 0 / 4%) !important;
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

        @media (width >= 768px) {
          width: calc(50% - 12px);
        }

        @media (width >= 1024px) {
          width: calc(33.333% - 16px);
        }

        &:hover:not(.is-disabled) {
          border-color: var(--theme-color);
          box-shadow: 0 12px 28px var(--hover-shadow-color) !important;
          transform: translateY(-4px);
        }

        &.is-disabled {
          cursor: not-allowed;
          background: var(--el-fill-color-lighter);
          opacity: 0.8;
          filter: grayscale(60%);
        }

        :deep(.el-card__body) {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px 24px;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          min-height: 48px;
          margin-bottom: 12px;

          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            font-size: 22px;
            border-radius: 14px;
            transition: all 0.3s;
          }

          .realtime-badge {
            display: flex;
            align-items: center;
            animation: pulse-badge 2s infinite;

            .badge-text {
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.3px;
              border-radius: 20px;
            }
          }
        }

        .card-content {
          flex: 1;

          .workspace-title {
            margin-bottom: 4px;
            font-size: 18px;
            font-weight: 800;
            line-height: 1.3;
            color: var(--el-text-color-primary);
          }

          .workspace-subtitle {
            display: inline-block;
            margin-bottom: 0;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            opacity: 0.9;
          }
        }
      }
    }
  }

  @keyframes pulse-badge {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.08);
    }

    100% {
      transform: scale(1);
    }
  }
}
</style>
