<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng đối tác"
        :count="pagination.total"
        description="Bao gồm NCC, Ngân hàng, Bảo hiểm"
        icon="ri:team-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đối tác Tài chính"
        :count="4"
        description="FE Credit, Home Credit..."
        icon="ri:bank-card-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Công nợ đến hạn"
        :count="2"
        description="Cần đối soát trong tuần"
        icon="ri:error-warning-line"
        iconStyle="bg-danger"
      />
    </div>

    <!-- Search Bar -->
    <ArtSearchBar
      :items="searchItems"
      :label-width="100"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Table Card -->
    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-2">
            <h4 class="m-0">Danh mục Đối tác & Nhà cung cấp</h4>
            <ElTag size="small" type="primary" effect="dark" round> Mục 7.1 Workflow </ElTag>
          </div>
        </div>
      </template>

      <!-- Table Header Tools -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon><Plus /></ElIcon> Thêm đối tác mới
          </ElButton>
          <ElButton v-ripple>
            <ElIcon><Download /></ElIcon> Xuất báo cáo
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- Data Table -->
      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- Type Column -->
        <template #partnerTypeId="{ row }">
          <ElTag :type="getPartnerTypeTag(row.partnerTypeId)" size="small">
            {{ getPartnerTypeName(row.partnerTypeId) }}
          </ElTag>
        </template>

        <!-- Contact Column -->
        <template #contact="{ row }">
          <div class="flex flex-col text-xs">
            <span
              ><ElIcon class="mr-1"><Phone /></ElIcon>{{ row.phone || '-' }}</span
            >
            <span class="text-gray-400"
              ><ElIcon class="mr-1"><Message /></ElIcon>{{ row.email || '-' }}</span
            >
          </div>
        </template>

        <!-- Operation Column -->
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Add/Edit Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="120px" class="mt-4">
        <ElFormItem label="Loại đối tác" required>
          <ElSelect
            v-model="formData.partnerTypeId"
            placeholder="Chọn loại đối tác..."
            class="w-full"
          >
            <ElOption label="Nhà cung cấp xe/phụ tùng" value="supplier" />
            <ElOption label="Đối tác tài chính (Trả góp)" value="financial" />
            <ElOption label="Đối tác bảo hiểm" value="insurance" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Tên đối tác" required>
          <ElInput v-model="formData.name" placeholder="Ví dụ: Honda Việt Nam, FE Credit..." />
        </ElFormItem>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Điện thoại">
            <ElInput v-model="formData.phone" />
          </ElFormItem>
          <ElFormItem label="Mã số thuế">
            <ElInput v-model="formData.taxIdentificationNumber" />
          </ElFormItem>
        </div>
        <ElFormItem label="Email">
          <ElInput v-model="formData.email" />
        </ElFormItem>
        <ElFormItem label="Địa chỉ">
          <ElInput v-model="formData.address" type="textarea" :rows="2" />
        </ElFormItem>
        <ElFormItem label="Ghi chú">
          <ElInput v-model="formData.notes" type="textarea" :rows="2" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            Lưu thông tin
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { Plus, Download, Phone, Message } from '@element-plus/icons-vue'
  import { ref, reactive } from 'vue'

  defineOptions({ name: 'InventorySupplier' })

  // Mock Data & Logic for Demo
  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Thêm đối tác')
  const submitting = ref(false)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 3
  })

  const data = ref([
    {
      id: 1,
      name: 'Honda Việt Nam',
      partnerTypeId: 'supplier',
      phone: '1800 1234',
      email: 'cr@honda.com.vn',
      taxIdentificationNumber: '0100100100'
    },
    {
      id: 2,
      name: 'FE Credit',
      partnerTypeId: 'financial',
      phone: '1900 2345',
      email: 'contact@fecredit.com.vn',
      taxIdentificationNumber: '0300200200'
    },
    {
      id: 3,
      name: 'Bảo hiểm PVI',
      partnerTypeId: 'insurance',
      phone: '1900 5454',
      email: 'pvi@pvi.com.vn',
      taxIdentificationNumber: '0100300300'
    }
  ])

  const formData = ref({
    name: '',
    partnerTypeId: 'supplier',
    phone: '',
    email: '',
    taxIdentificationNumber: '',
    address: '',
    notes: ''
  })

  const columns = ref([
    { label: 'Tên đối tác', prop: 'name', minWidth: 220 },
    { label: 'Phân loại', prop: 'partnerTypeId', useSlot: true, width: 160, align: 'center' },
    { label: 'Liên hệ', prop: 'contact', useSlot: true, width: 220 },
    { label: 'Mã số thuế', prop: 'taxIdentificationNumber', width: 140, align: 'center' },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 120,
      fixed: 'right' as const,
      align: 'center'
    }
  ])

  const columnChecks = columns

  const searchItems = [
    { key: 'name', label: 'Tên đối tác', type: 'input' },
    {
      key: 'type',
      label: 'Loại',
      type: 'select',
      props: {
        options: [
          { label: 'Nhà cung cấp', value: 'supplier' },
          { label: 'Tài chính', value: 'financial' },
          { label: 'Bảo hiểm', value: 'insurance' }
        ]
      }
    }
  ]

  const getPartnerTypeTag = (type: string) => {
    switch (type) {
      case 'supplier':
        return 'primary'
      case 'financial':
        return 'success'
      case 'insurance':
        return 'warning'
      default:
        return 'info'
    }
  }

  const getPartnerTypeName = (type: string) => {
    switch (type) {
      case 'supplier':
        return 'Nhà cung cấp'
      case 'financial':
        return 'Đối tác tài chính'
      case 'insurance':
        return 'Đối tác bảo hiểm'
      default:
        return 'Khác'
    }
  }

  const handleAdd = () => {
    dialogTitle.value = 'Thêm đối tác mới'
    formData.value = {
      name: '',
      partnerTypeId: 'supplier',
      phone: '',
      email: '',
      taxIdentificationNumber: '',
      address: '',
      notes: ''
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    dialogTitle.value = 'Cập nhật đối tác'
    formData.value = { ...row }
    dialogVisible.value = true
  }

  const handleDelete = (row: any) => {
    console.log('Delete', row)
  }

  const submitForm = () => {
    submitting.value = true
    setTimeout(() => {
      submitting.value = false
      dialogVisible.value = false
    }, 1000)
  }

  const handleSearch = () => {}
  const handleReset = () => {}
  const refreshData = () => {}
  const handleSizeChange = () => {}
  const handleCurrentChange = () => {}
</script>
