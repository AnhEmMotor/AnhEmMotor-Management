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
              v-if="row.status?.toLowerCase() === 'processing'"
              type="warning"
              @click="submitToAdmin(row)"
            >
              Gửi Admin duyệt
            </ElButton>

            <ElButton
              v-if="row.status?.toLowerCase() === 'pending'"
              type="primary"
              @click="openProcessModal(row)"
            >
              Duyệt / Từ chối
            </ElButton>

            <ElButton
              v-if="
                row.status?.toLowerCase() !== 'processing' &&
                row.status?.toLowerCase() !== 'pending'
              "
              type="info"
              plain
              @click="openProcessModal(row)"
            >
              Xem chi tiết
            </ElButton>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <CreateReturnModal v-model="showCreateModal" @success="refreshData" />
    <ProcessReturnModal
      v-model="showProcessModal"
      :returnRequest="selectedRequest"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue';
import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue';
import ArtTable from '@/components/core/tables/art-table/index.vue';
import CreateReturnModal from './components/CreateReturnModal.vue';
import ProcessReturnModal from './components/ProcessReturnModal.vue';
import { useReturnsTable } from './hooks/useReturnsTable';
import { processReturnRequest } from '@/api/sales/returns.api';

defineOptions({ name: 'SalesReturns' });

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
} = useReturnsTable();

const showCreateModal = ref(false);
const showProcessModal = ref(false);
const selectedRequest = ref<any>(null);

const getStatusType = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'processing':
      return 'info';
    case 'pending':
      return 'warning';
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
    case 'processing':
      return 'Đang xử lý';
    case 'pending':
      return 'Chờ duyệt';
    case 'completed':
      return 'Đã lưu kho';
    case 'rejected':
      return 'Đã từ chối';
    default:
      return status;
  }
};

const openProcessModal = (row: any) => {
  selectedRequest.value = row;
  showProcessModal.value = true;
};

const submitToAdmin = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      'Bạn có chắc chắn muốn gửi yêu cầu này cho Admin duyệt?',
      'Xác nhận gửi duyệt',
      {
        confirmButtonText: 'Gửi duyệt',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    );

    await processReturnRequest(row.id, {
      status: 'pending',
    });

    ElMessage.success('Đã gửi yêu cầu cho Admin duyệt thành công!');
    refreshData();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Có lỗi xảy ra khi gửi duyệt!');
    }
  }
};
</script>
