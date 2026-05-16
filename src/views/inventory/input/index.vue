<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng xe nhập tháng"
        :count="120"
        description="Số lượng xe máy đã định danh"
        icon="ri:motorbike-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đã lưu kho"
        :count="85"
        description="Đang ở trạng thái Available"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Giá trị nhập kho"
        count="4.5 tỷ"
        description="Tổng giá vốn nhập hàng"
        icon="ri:money-dollar-circle-line"
        iconStyle="bg-info"
      />
    </div>

    <ArtSearchBar
      :items="searchItems"
      :label-width="100"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-2">
            <h4 class="m-0">Nhập kho & Định danh tài sản (Mục 7.2)</h4>
          </div>
        </div>
      </template>

      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleOpenWizard">
            <ElIcon class="mr-1"><Plus /></ElIcon> Nhập xe mới (Asset ID)
          </ElButton>
          <ElButton v-ripple>
            <ElIcon class="mr-1"><Document /></ElIcon> Nhập phụ tùng (General)
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination">
        <template #status="{ row }">
          <ElTag :type="row.status === 'Finished' ? 'success' : 'warning'">
            {{ row.status === 'Finished' ? 'Hoàn tất' : 'Đang xử lý' }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="wizardVisible"
      title="Nhập xe mới & Định danh tài sản"
      width="1000px"
      append-to-body
      destroy-on-close
    >
      <AssetIdentificationWizard
        @cancel="wizardVisible = false"
        @complete="wizardVisible = false"
      />
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { Plus, Document } from '@element-plus/icons-vue'
  import AssetIdentificationWizard from './components/AssetIdentificationWizard.vue'

  defineOptions({ name: 'InventoryInput' })

  const loading = ref(false)
  const wizardVisible = ref(false)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 2
  })

  const data = ref([
    {
      id: 'PNK001',
      supplier: 'Honda Việt Nam',
      product: 'Vision 2024',
      quantity: 10,
      total: '350.000.000',
      status: 'Finished',
      time: '04/05/2026 08:30'
    },
    {
      id: 'PNK002',
      supplier: 'Yamaha Motor',
      product: 'Exciter 155',
      quantity: 5,
      total: '225.000.000',
      status: 'Processing',
      time: '04/05/2026 09:15'
    }
  ])

  const columns = ref([
    { label: 'Mã phiếu', prop: 'id', width: 110, align: 'center' },
    { label: 'Thời gian', prop: 'time', width: 170 },
    { label: 'Nhà cung cấp', prop: 'supplier', minWidth: 200 },
    { label: 'Dòng xe', prop: 'product', minWidth: 150 },
    { label: 'Số lượng', prop: 'quantity', width: 100, align: 'center' },
    { label: 'Trạng thái', prop: 'status', width: 140, useSlot: true, align: 'center' }
  ])

  const columnChecks = columns

  const searchItems = [
    { key: 'id', label: 'Mã phiếu', type: 'input', props: { placeholder: 'Nhập mã phiếu...' } },
    {
      key: 'supplier',
      label: 'Nhà cung cấp',
      type: 'input',
      props: { placeholder: 'Tìm theo NCC...' }
    }
  ]

  const handleOpenWizard = () => {
    wizardVisible.value = true
  }

  const handleSearch = () => {}
  const handleReset = () => {}
  const refreshData = () => {}
</script>
