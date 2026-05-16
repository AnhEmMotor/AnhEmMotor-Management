<template>
  <div class="flex flex-col gap-4 pb-5">
    <ElCard class="workflow-card">
      <div class="flex flex-col lg:flex-row justify-between items-center gap-6 py-2">
        <div class="min-w-[200px]">
          <h3 class="text-xl font-bold text-gray-800 mb-1">Quy trình tính Hoa hồng</h3>
          <p class="text-sm text-gray-500"
            >Hệ thống tự động ghi nhận và chốt hoa hồng theo trạng thái đơn hàng.</p
          >
        </div>
        <div class="flex-1 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          <div class="workflow-step">
            <div class="step-icon bg-blue-50 text-blue-600">
              <ElIcon><Clock /></ElIcon>
            </div>
            <div class="step-info">
              <span class="step-label">Tạm tính</span>
              <span class="step-desc">Đơn hàng mới</span>
            </div>
          </div>
          <ElIcon class="text-gray-300 hidden md:block"><ArrowRight /></ElIcon>
          <div class="workflow-step">
            <div class="step-icon bg-green-50 text-green-600">
              <ElIcon><CircleCheck /></ElIcon>
            </div>
            <div class="step-info">
              <span class="step-label">Ghi nhận</span>
              <span class="step-desc">Đơn hoàn tất</span>
            </div>
          </div>
          <ElIcon class="text-gray-300 hidden md:block"><ArrowRight /></ElIcon>
          <div class="workflow-step">
            <div class="step-icon bg-red-50 text-red-600">
              <ElIcon><Wallet /></ElIcon>
            </div>
            <div class="step-info">
              <span class="step-label">Đã chi trả</span>
              <span class="step-desc">Kế toán duyệt</span>
            </div>
          </div>
        </div>
      </div>
    </ElCard>

    <ArtSearchBar
      :items="searchItems"
      :label-width="110"
      :span="7"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-2">
            <h4 class="m-0">Danh sách định mức hoa hồng</h4>
            <ElTag size="small" type="primary" effect="dark" round>
              {{ policies.length }} Chính sách
            </ElTag>
          </div>
          <div class="flex gap-2">
            <ElButton type="primary" v-ripple @click="handleAdd">
              <ElIcon><Plus /></ElIcon> Thêm định mức
            </ElButton>
          </div>
        </div>
      </template>

      <ArtTable :loading="loading" :data="policies" :columns="columns">
        <template #policyName="{ row }">
          <div class="flex flex-col">
            <span class="font-bold text-gray-800">{{ row.policyName }}</span>
            <span class="text-[11px] text-gray-400">ID: #{{ row.id }}</span>
          </div>
        </template>

        <template #scope="{ row }">
          <ElTag v-if="row.productId" type="success" size="small">Sản phẩm</ElTag>
          <ElTag v-else-if="row.categoryId" type="warning" size="small">Danh mục</ElTag>
          <ElTag v-else type="info" size="small">Nhóm nhân viên</ElTag>
        </template>

        <template #amount="{ row }">
          <div class="flex items-center gap-1 font-bold text-red-600">
            <span v-if="row.isPercentage">{{ row.commissionAmount }}%</span>
            <span v-else>{{ formatCurrency(row.commissionAmount) }}</span>
          </div>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ElTooltip content="Lịch sử thay đổi" placement="top">
              <ElButton circle size="small" @click="showHistory(row)">
                <ElIcon><Timer /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600px" append-to-body>
      <ElForm :model="formData" label-width="130px" class="mt-4" label-position="left">
        <ElFormItem label="Tên chính sách" required>
          <ElInput v-model="formData.policyName" placeholder="Ví dụ: Thưởng xe Winner X" />
        </ElFormItem>

        <ElFormItem label="Nhóm nhân viên" required>
          <ElSelect
            v-model="formData.employeeGroupId"
            class="w-full"
            placeholder="Nhân viên Kinh doanh"
          >
            <ElOption label="Nhân viên Kinh doanh" :value="1" />
            <ElOption label="Nhân viên Kỹ thuật" :value="2" />
          </ElSelect>
        </ElFormItem>

        <ElDivider border-style="dashed"
          ><span class="text-gray-400 font-bold text-xs uppercase tracking-widest"
            >Phạm vi áp dụng</span
          ></ElDivider
        >

        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Áp dụng cho" label-width="100px">
            <ElSelect v-model="applyTo" class="w-full" @change="handleApplyToChange">
              <ElOption label="Danh mục" value="category" />
              <ElOption label="Sản phẩm" value="product" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="applyTo === 'category'" label="Danh mục" label-width="80px">
            <ElSelect v-model="formData.categoryId" class="w-full" placeholder="Chọn">
              <ElOption v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="applyTo === 'product'" label="Sản phẩm" label-width="80px">
            <ElSelect
              v-model="formData.productId"
              class="w-full"
              placeholder="Chọn"
              filterable
              remote
            >
              <ElOption v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElDivider border-style="dashed"
          ><span class="text-gray-400 font-bold text-xs uppercase tracking-widest"
            >Mức thưởng</span
          ></ElDivider
        >

        <div class="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 mb-4">
          <div class="flex items-center justify-between mb-5">
            <span class="text-sm font-bold text-gray-600">Loại hình thưởng</span>
            <ElRadioGroup v-model="formData.isPercentage" size="default">
              <ElRadioButton :label="false">Số tiền cố định</ElRadioButton>
              <ElRadioButton :label="true">Phần trăm (%)</ElRadioButton>
            </ElRadioGroup>
          </div>

          <ElFormItem label="Giá trị thưởng" label-width="100px">
            <ElInputNumber
              v-model="formData.commissionAmount"
              :precision="formData.isPercentage ? 1 : 0"
              :step="formData.isPercentage ? 0.5 : 50000"
              :min="0"
              controls-position="right"
              class="!w-full custom-input-number"
            >
              <template #suffix>
                <span class="text-gray-400 mr-8">{{ formData.isPercentage ? '%' : 'VNĐ' }}</span>
              </template>
            </ElInputNumber>
          </ElFormItem>

          <div
            class="mt-4 p-4 bg-white rounded-xl border border-blue-50 flex items-start gap-3 shadow-sm"
          >
            <ElIcon class="text-blue-500 mt-0.5 text-lg"><InfoFilled /></ElIcon>
            <div class="text-xs text-gray-600 leading-relaxed">
              <p class="font-bold text-blue-600 mb-1">Xem trước công thức:</p>
              <p v-if="formData.isPercentage">
                Tiền thưởng = <span class="text-red-500 font-bold">Giá bán sản phẩm</span> ×
                <span class="text-red-500 font-bold">{{ formData.commissionAmount }}%</span>
              </p>
              <p v-else>
                Tiền thưởng =
                <span class="text-red-500 font-bold">{{
                  formatCurrency(formData.commissionAmount)
                }}</span>
                cố định trên mỗi đơn vị sản phẩm.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[13px] font-bold text-gray-600 ml-1">Ghi chú thay đổi</label>
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Lý do cập nhật hoặc tạo mới chính sách này..."
            class="custom-textarea"
          />
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="loading" @click="handleSave">Lưu chính sách</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog v-model="historyVisible" title="Lịch sử thay đổi chính sách" width="700px">
      <div v-loading="loadingLogs" class="min-h-[300px]">
        <ElTimeline v-if="auditLogs.length > 0">
          <ElTimelineItem
            v-for="log in auditLogs as any[]"
            :key="log.id"
            :timestamp="formatDateTime(log.changedAt)"
            placement="top"
            type="primary"
          >
            <ElCard shadow="never" class="!bg-gray-50 border-none">
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-gray-800">{{ log.description }}</span>
                <ElTag size="small">{{ log.changedByName }}</ElTag>
              </div>
              <div class="text-xs text-gray-500 flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <ElIcon><User /></ElIcon>
                  <span>Thực hiện bởi: {{ log.changedByName }}</span>
                </div>
              </div>
            </ElCard>
          </ElTimelineItem>
        </ElTimeline>
        <ElEmpty v-else description="Chưa có lịch sử thay đổi" />
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import {
    Plus,
    Clock,
    CircleCheck,
    Wallet,
    ArrowRight,
    Timer,
    InfoFilled,
    User
  } from '@element-plus/icons-vue'
  import { useHRStore } from '@/store/modules/hr'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'HRCommissionPolicy' })

  const hrStore = useHRStore()
  const loading = computed(() => hrStore.loading)
  const policies = computed(() => hrStore.policies)

  const dialogVisible = ref(false)
  const dialogTitle = ref('Thêm định mức hoa hồng')
  const applyTo = ref('category')
  const categories = ref([
    { id: 1, name: 'Xe máy' },
    { id: 2, name: 'Phụ tùng' }
  ])
  const products = ref([{ id: 101, name: 'Honda Winner X v3' }])

  const formData = ref({
    id: null as number | null,
    policyName: '',
    employeeGroupId: 1,
    categoryId: null as number | null,
    productId: null as number | null,
    commissionAmount: 0,
    isPercentage: false,
    description: ''
  })

  const columns = [
    {
      label: 'Tên chính sách',
      prop: 'policyName',
      slot: 'policyName',
      useSlot: true,
      minWidth: 200
    },
    { label: 'Phạm vi', slot: 'scope', width: 140, useSlot: true },
    { label: 'Giá trị thưởng', slot: 'amount', width: 160, useSlot: true },
    { label: 'Nhóm áp dụng', prop: 'employeeGroupName', width: 160 },
    { label: 'Thao tác', slot: 'operation', width: 140, align: 'center', useSlot: true }
  ]

  const searchItems = [
    { key: 'name', label: 'Tên chính sách', type: 'input' },
    {
      key: 'group',
      label: 'Nhóm nhân viên',
      type: 'select',
      props: {
        options: [
          { label: 'Kinh doanh', value: 1 },
          { label: 'Kỹ thuật', value: 2 }
        ]
      }
    }
  ]

  const handleSearch = (query: any) => {
    console.log('Search:', query)
  }

  const handleReset = () => {
    console.log('Reset')
  }

  const handleAdd = () => {
    dialogTitle.value = 'Thêm định mức hoa hồng'
    formData.value = {
      id: null,
      policyName: '',
      employeeGroupId: 1,
      categoryId: null,
      productId: null,
      commissionAmount: 0,
      isPercentage: false,
      description: ''
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    dialogTitle.value = 'Chỉnh sửa định mức'
    formData.value = { ...row }
    applyTo.value = row.productId ? 'product' : 'category'
    dialogVisible.value = true
  }

  const handleApplyToChange = () => {
    if (applyTo.value === 'category') {
      formData.value.productId = null
      formData.value.isPercentage = true // Mặc định cho danh mục (thường là phụ tùng) là %
    } else {
      formData.value.categoryId = null
      formData.value.isPercentage = false // Mặc định cho xe máy là số tiền cố định
    }
  }

  const handleSave = async () => {
    try {
      await hrStore.saveCommissionPolicy(formData.value.id, formData.value)
      ElMessage.success('Lưu chính sách thành công')
      dialogVisible.value = false
    } catch (err: any) {
      ElMessage.error(err.message || 'Lỗi khi lưu chính sách')
    }
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm('Bạn có chắc chắn muốn xóa chính sách này?', 'Cảnh báo', {
      type: 'warning'
    }).then(async () => {
      await hrStore.deleteCommissionPolicy(row.id)
      ElMessage.success('Đã xóa chính sách')
    })
  }

  const historyVisible = ref(false)
  const auditLogs = ref<any[]>([])
  const loadingLogs = ref(false)

  const showHistory = async (row: any) => {
    historyVisible.value = true
    loadingLogs.value = true
    try {
      auditLogs.value = await hrStore.fetchPolicyAuditLogs(row.id)
    } finally {
      loadingLogs.value = false
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const formatDateTime = (val: string) => {
    return new Date(val).toLocaleString('vi-VN')
  }

  onMounted(() => {
    hrStore.fetchCommissionPolicies()
  })
</script>

<style scoped>
  .workflow-card {
    background: linear-gradient(to right, #fff, #fafafa);
    border: none;
    border-radius: 16px;
  }

  .workflow-step {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px 16px;
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  }

  .step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 10px;
  }

  .step-info {
    display: flex;
    flex-direction: column;
    white-space: nowrap;
  }

  .step-label {
    font-size: 13px;
    font-weight: 700;
    color: #374151;
  }

  .step-desc {
    font-size: 11px;
    color: #9ca3af;
  }

  .art-table-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 3%);
  }

  :deep(.el-radio-button__inner) {
    margin: 0 4px;
    border: 1px solid #dcdfe6 !important;
    border-radius: 8px !important;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-left: 1px solid #dcdfe6 !important;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: var(--el-color-primary) !important;
    border-color: var(--el-color-primary) !important;
  }

  :deep(.custom-input-number .el-input__wrapper) {
    padding-right: 12px;
    padding-left: 12px;
    border-radius: 12px;
  }

  :deep(.custom-textarea .el-textarea__inner) {
    padding: 10px 12px;
    border-radius: 12px;
  }
</style>
