<template>
  <div class="dashboard-panel mb-5">
    <div class="panel-header">
      <div class="panel-header__left">
        <div class="panel-icon panel-icon--slate">
          <ArtSvgIcon icon="ri:history-line" class="text-2xl" />
        </div>
        <div>
          <h4 class="panel-title">Hoạt động Hệ thống</h4>
          <p class="panel-desc">Audit log toàn bộ hệ thống theo thời gian thực</p>
        </div>
      </div>
      <el-badge :value="list.length" type="info" class="mt-1" />
    </div>

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="5" animated />
    </div>
    <div v-else-if="list.length === 0" class="empty-state">
      <ArtSvgIcon icon="ri:inbox-line" class="text-4xl" />
      <span>Không có hoạt động nào gần đây</span>
    </div>
    <ElScrollbar v-else class="log-scroll">
      <div v-for="(item, index) in list" :key="index" class="log-row">
        <div class="log-row__indicator" :class="`log-row__indicator--${item.category}`"></div>
        <div class="log-row__content">
          <div class="log-row__top">
            <el-tag
              :type="CATEGORY_TAG[item.category] ?? 'info'"
              size="small"
              effect="light"
              class="log-row__cat"
            >
              {{ CATEGORY_LABELS[item.category] ?? item.category }}
            </el-tag>
            <span class="log-row__action">{{ ACTION_LABELS[item.action] ?? item.action }}</span>
            <span class="log-row__target">{{
              TARGET_LABELS[item.targetType] ?? item.targetType
            }}</span>
          </div>
          <div class="log-row__bottom">
            <span v-if="item.actorName" class="log-row__actor">
              <i class="ri-user-3-line"></i> {{ item.actorName }}
            </span>
            <span class="log-row__time">{{ fmtTime(item.timestamp) }}</span>
          </div>
        </div>
      </div>
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { fetchRecentAuditLogs } from '@/api/dashboard.api';

const CATEGORY_TAG: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  order: 'primary',
  inventory: 'warning',
  customer: 'success',
  operations: 'info',
  finance: 'danger',
};
const CATEGORY_LABELS: Record<string, string> = {
  order: 'Đơn hàng',
  inventory: 'Kho hàng',
  customer: 'Khách hàng',
  operations: 'Vận hành',
  finance: 'Tài chính',
};

const ACTION_LABELS: Record<string, string> = {
  created: 'tạo mới',
  updated: 'cập nhật',
  deleted: 'xóa',
  expense: 'phát sinh',
};

const TARGET_LABELS: Record<string, string> = {
  Order: 'đơn hàng',
  Customer: 'khách hàng',
  Inventory: 'kho hàng',
  Expense: 'chi phí',
};

interface AuditLogItem {
  timestamp: string;
  category: string;
  action: string;
  actorId: string | null;
  actorName: string;
  targetType: string;
  targetId: number | null;
  targetName: string;
  details: string;
}

const list = reactive<AuditLogItem[]>([]);
const isLoading = ref(false);

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function fetchData() {
  isLoading.value = true;
  try {
    const data = await fetchRecentAuditLogs(20);
    list.length = 0;
    data.forEach((log: AuditLogItem) => list.push({ ...log }));
  } catch (error) {
    console.error('Failed to fetch recent audit logs:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped lang="scss">
.dashboard-panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;

  &--slate {
    background: rgb(100 116 139 / 12%);
    color: #64748b;
  }
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 2px;
}

.panel-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.log-scroll {
  flex: 1;
  max-height: 400px;
}

.log-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  &__indicator {
    width: 3px;
    border-radius: 4px;
    flex-shrink: 0;
    align-self: stretch;

    &--order {
      background: #3b82f6;
    }

    &--inventory {
      background: #f59e0b;
    }

    &--customer {
      background: #10b981;
    }

    &--operations {
      background: #8b5cf6;
    }

    &--finance {
      background: #ef4444;
    }

    &--default {
      background: #94a3b8;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  &__cat {
    flex-shrink: 0;
  }

  &__action {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  &__target {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__actor {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
    gap: 3px;
  }

  &__time {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    white-space: nowrap;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-placeholder);

  svg,
  .text-4xl {
    font-size: 36px;
  }

  span {
    font-size: 13px;
  }
}
</style>
