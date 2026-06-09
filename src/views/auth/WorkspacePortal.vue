<template>
  <div class="portal-layout relative overflow-hidden">
    <!-- Realistic Speed/Car Background -->
    <div class="portal-bg-overlay"></div>
    <div class="portal-header relative z-10">
      <div class="header-content animate-fade-in-down">
        <div class="welcome-badge">
          <el-icon class="mr-1"><StarFilled /></el-icon>
          <span>HỆ THỐNG QUẢN TRỊ TRUNG TÂM</span>
        </div>
        <h1 class="title">
          Cổng Không Gian Làm Việc
        </h1>
        <p class="subtitle">
          Vui lòng chọn phân hệ làm việc theo chức danh của bạn. Hệ thống đã tự động giới hạn quyền truy cập dựa trên Role-Based Access Control (RBAC).
        </p>
      </div>
    </div>

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
            'animation-delay': `${index * 0.1}s`
          }"
          shadow="never"
        >
          <!-- Absolute Dot Indicator for critical alerts (e.g. Card 1) -->
          <div 
            v-if="workspace.hasAccess && workspace.badge && workspace.badge.isDot" 
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
                :style="{ backgroundColor: workspace.color + '20', color: workspace.color }"
              >
                <el-icon><component :is="workspace.icon" /></el-icon>
              </div>
              <el-tag 
                :type="workspace.hasAccess ? 'success' : 'info'" 
                :effect="workspace.hasAccess ? 'light' : 'plain'" 
                size="small" 
                round
              >
                {{ workspace.hasAccess ? 'Đã cấp quyền' : 'Khóa truy cập' }}
              </el-tag>
            </div>

            <!-- Pill Badge for counting metrics (e.g. Card 2) -->
            <div v-if="workspace.hasAccess && workspace.badge && !workspace.badge.isDot" class="realtime-badge" :class="workspace.badge.type">
              <span class="badge-text" :style="{ color: workspace.color, backgroundColor: workspace.color + '15', border: `1px solid ${workspace.color}30` }">
                {{ workspace.badge.value }} {{ workspace.badge.label }}
              </span>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="workspace-title">{{ workspace.title }}</h3>
            <span class="workspace-subtitle" :style="{ color: workspace.color }">{{ workspace.subtitle }}</span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  DataAnalysis, 
  Service, 
  Box, 
  UserFilled, 
  Wallet,
  StarFilled
} from '@element-plus/icons-vue';

// Mock data based on menu.md and additional.md
const workspaces = ref([
  {
    title: 'Ban Điều Hành & Chủ Showroom',
    subtitle: 'Executive Overview',
    icon: DataAnalysis,
    color: '#e11d48', // Rose/Red for Executive
    shadowColor: 'rgba(225, 29, 72, 0.25)',
    hasAccess: true, 
    badge: { isDot: true, type: 'danger' }
  },
  {
    title: 'Khối Kinh Doanh & CRM',
    subtitle: 'Sales & CRM Workspace',
    icon: UserFilled,
    color: '#059669', // Emerald/Mint Green for Sales
    shadowColor: 'rgba(5, 150, 105, 0.25)',
    hasAccess: true, 
    badge: { isDot: false, value: 5, label: 'đơn mới', type: 'warning' }
  },
  {
    title: 'Quản Lý Kho & Hậu Cần',
    subtitle: 'Inventory & Asset Logistics',
    icon: Box,
    color: '#d97706', // Amber/Yellow for Inventory
    shadowColor: 'rgba(217, 119, 6, 0.15)',
    hasAccess: false 
  },
  {
    title: 'Dịch Vụ & Xưởng Sửa Chữa',
    subtitle: 'Workshop Operations',
    icon: Service,
    color: '#2563eb', // Blue for Service
    shadowColor: 'rgba(37, 99, 235, 0.15)',
    hasAccess: false 
  },
  {
    title: 'Kế Toán, Lương & Thuế',
    subtitle: 'Financial & Compliance',
    icon: Wallet,
    color: '#7c3aed', // Violet/Purple for Finance
    shadowColor: 'rgba(124, 58, 237, 0.15)',
    hasAccess: false 
  }
]);
</script>

<style lang="scss" scoped>
/* Keyframes for entrance animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.portal-layout {
  min-height: 100vh;
  /* High-quality Unsplash image of a speeding motorcycle (xe máy/moto) */
  background-image: url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1920');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  position: relative;

  .portal-bg-overlay {
    position: absolute;
    inset: 0;
    /* Tints the image with the system's background color (dark or light) */
    background-color: var(--el-bg-color-page);
    opacity: 0.45; /* Reduced from 0.75 so the image is clearer */
    z-index: 0;
    backdrop-filter: blur(3px); /* Slightly reduced blur for sharper image */
    -webkit-backdrop-filter: blur(3px);
  }

  .portal-header {
    padding: 60px 20px 40px;
    margin-bottom: 20px;

    .header-content {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .welcome-badge {
        display: inline-flex;
        align-items: center;
        background: var(--el-color-primary-light-9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 6px 16px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--el-color-primary-light-5);
        color: var(--el-color-primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;

        .el-icon {
          font-size: 14px;
          color: var(--el-color-warning);
        }
      }

      .title {
        font-size: 42px;
        font-weight: 900;
        margin-bottom: 16px;
        letter-spacing: -1px;
        color: var(--el-text-color-primary);
        line-height: 1.2;
        /* Create a glowing shadow matching the background to ensure readability */
        text-shadow: 0 2px 15px var(--el-bg-color), 0 0 30px var(--el-bg-color);
      }

      .subtitle {
        font-size: 16px;
        color: var(--el-text-color-primary);
        max-width: 650px;
        margin: 0 auto;
        line-height: 1.7;
        font-weight: 500;
        text-shadow: 0 2px 10px var(--el-bg-color), 0 0 20px var(--el-bg-color);
        opacity: 0.9;
      }
    }
  }

  .portal-container {
    flex: 1;
    padding: 0 20px 60px;

    .workspace-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 24px;
      
      .workspace-card {
        width: 100%;
        max-width: 380px;
        border-radius: 16px;
        border: 1px solid var(--el-border-color-light);
        background: var(--el-bg-color-overlay);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04) !important;
        cursor: pointer;

        @media (min-width: 768px) {
          width: calc(50% - 12px);
        }
        @media (min-width: 1024px) {
          width: calc(33.333% - 16px);
        }

        &:hover:not(.is-disabled) {
          transform: translateY(-4px);
          border-color: var(--theme-color);
          box-shadow: 0 12px 28px var(--hover-shadow-color) !important;
        }

        &.is-disabled {
          opacity: 0.8; 
          filter: grayscale(60%); 
          cursor: not-allowed;
          background: var(--el-fill-color-lighter);
        }

        :deep(.el-card__body) {
          padding: 20px 24px; 
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px; 
          min-height: 48px;

          .icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            transition: all 0.3s;
          }

          .realtime-badge {
            display: flex;
            align-items: center;
            animation: pulse-badge 2s infinite;

            .badge-text {
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.3px;
            }
          }
        }

        .card-content {
          flex: 1;

          .workspace-title {
            font-size: 18px; 
            font-weight: 800;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
            line-height: 1.3;
          }

          .workspace-subtitle {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 0; 
            opacity: 0.9;
          }
        }
      }
    }
  }

  @keyframes pulse-badge {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
}
</style>
