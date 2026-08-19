<template>
  <div class="resp-page flex flex-col gap-4 pb-5">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="120"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <div class="flex items-center gap-3">
            <ElButton
              v-if="workflowMode === 'classification'"
              type="primary"
              class="btn-add"
              @click="showCreateModal = true"
              style="margin-left: 0"
            >
              <ElIcon class="mr-1"><Plus /></ElIcon> Tiếp nhận trả hàng
            </ElButton>
          </div>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #status="{ row }">
          <ElTag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</ElTag>
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center flex-wrap">
            <ElButton
              v-if="workflowMode === 'classification' && row.status?.toLowerCase() === 'pending'"
              type="warning"
              @click="openProcessModal(row)"
            >
              Phân loại lỗi
            </ElButton>

            <ElButton
              v-else-if="workflowMode === 'approval' && row.status?.toLowerCase() === 'inspecting'"
              type="primary"
              @click="openProcessModal(row)"
            >
              Duyệt / Từ chối
            </ElButton>

            <ElButton v-else type="info" plain @click="openProcessModal(row)">
              Xem chi tiết
            </ElButton>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <CreateReturnModal
      v-if="workflowMode === 'classification'"
      v-model="showCreateModal"
      @success="refreshData"
    />
    <ProcessReturnModal
      v-model="showProcessModal"
      :returnRequest="selectedRequest"
      :mode="workflowMode"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Plus } from '@element-plus/icons-vue';
import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue';
import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue';
import ArtTable from '@/components/core/tables/art-table/index.vue';
import CreateReturnModal from './components/CreateReturnModal.vue';
import ProcessReturnModal from './components/ProcessReturnModal.vue';
import { useReturnsTable } from './hooks/useReturnsTable';
import type { ReturnRequestDetail } from '@/domain/sales/returns.types';

defineOptions({ name: 'SalesReturns' });

type WorkflowMode = 'classification' | 'approval' | 'warehouse';

const route = useRoute();
const workflowMode = computed<WorkflowMode>(() => {
  const path = route.path.toLowerCase();
  if (path.startsWith('/order/')) return 'classification';
  if (path.startsWith('/warehouse/')) return 'warehouse';
  return 'approval';
});

const allowedStatuses = computed<ReturnRequestDetail['status'][]>(() => {
  switch (workflowMode.value) {
    case 'classification':
      return ['pending'];
    case 'approval':
      return ['inspecting', 'rejected'];
    case 'warehouse':
      return ['completed'];
    default:
      return ['pending'];
  }
});

const {
  loading,
  data,
  searchForm,
  searchItems,
  columns,
  columnChecks,
  pagination,
  refreshData,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
} = useReturnsTable(allowedStatuses);

const showCreateModal = ref(false);
const showProcessModal = ref(false);
const selectedRequest = ref<ReturnRequestDetail | null>(null);

const getStatusType = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'inspecting':
      return 'primary';
    case 'completed':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'info';
  }
};

const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'Chờ Order phân loại';
    case 'inspecting':
      return 'Chờ Sales duyệt';
    case 'completed':
      return 'Đã duyệt — Chuyển vào kho';
    case 'rejected':
      return 'Đã từ chối';
    default:
      return status;
  }
};

const openProcessModal = (row: ReturnRequestDetail) => {
  selectedRequest.value = row;
  showProcessModal.value = true;
};
</script>
