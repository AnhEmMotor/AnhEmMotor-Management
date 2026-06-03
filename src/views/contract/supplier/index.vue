<template>
  <div class="contract-supplier-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('menus.contract.supplier') }}</span>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <ArtStatsCard
          title="Tổng hợp đồng"
          :count="stats.totalContracts"
          icon="ri:file-list-3-line"
          iconStyle="bg-primary"
        />
        <ArtStatsCard
          title="Đang hiệu lực"
          :count="stats.activeContracts"
          icon="ri:checkbox-circle-line"
          iconStyle="bg-success"
        />
        <ArtStatsCard
          title="Chờ phê duyệt"
          :count="stats.pendingApproval"
          icon="ri:time-line"
          iconStyle="bg-warning"
        />
        <ArtStatsCard
          title="Sắp hết hạn"
          :count="stats.expiringContracts"
          icon="ri:alarm-warning-line"
          iconStyle="bg-warning"
        />
        <ArtStatsCard
          title="Đã hết hạn"
          :count="stats.expiredContracts"
          icon="ri:error-warning-line"
          iconStyle="bg-danger"
        />
      </div>

      <ArtSearchBar
        v-model="searchForm"
        :items="searchItems"
        :label-width="120"
        :span="8"
        @search="handleSearch"
        @reset="handleReset"
      />

      <ElCard class="flex-1 art-table-card mt-4">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadData">
          <template #left>
            <ElButton type="primary" v-ripple @click="handleAdd">
              <ElIcon><Plus /></ElIcon> Tạo hợp đồng mới
            </ElButton>
          </template>
        </ArtTableHeader>

        <ArtTable
          ref="tableRef"
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #supplierName="{ row }">
            <span>{{ row.supplierName || '-' }}</span>
          </template>
          <template #contractValue="{ row }">
            <span class="font-medium">{{ formatCurrency(row.contractValue) }}</span>
          </template>
          <template #creditLimit="{ row }">
            <span class="font-medium text-primary">{{
              formatCurrency((row as any).creditLimit || 0)
            }}</span>
          </template>
          <template #discountRate="{ row }">
            <span>{(row as any).discountRate ? (row as any).discountRate + '%' : '-'}</span>
          </template>
          <template #status="{ row }">
            <ElTag :type="getStatusType(row.status)" size="small">{{
              getStatusLabel(row.status)
            }}</ElTag>
          </template>
          <template #effectiveDate="{ row }">
            {{ formatDate(row.effectiveDate) }}
          </template>
          <template #expirationDate="{ row }">
            {{ row.expirationDate ? formatDate(row.expirationDate) : '-' }}
          </template>
          <template #operation="{ row }">
            <div class="flex gap-2 justify-center">
              <ArtButtonTable type="view" @click="handleView(row)" />
              <ElButton
                v-ripple
                size="small"
                type="primary"
                @click="handleEdit(row)"
                :disabled="row.status === 'Active'"
                >Sửa</ElButton
              >
              <ElButton
                v-ripple
                size="small"
                type="danger"
                @click="handleDelete(row)"
                :disabled="row.status === 'Active'"
                >Xóa</ElButton
              >
            </div>
          </template>
        </ArtTable>
      </ElCard>

      <!-- Create/Edit Dialog -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="900px"
        append-to-body
        destroy-on-close
      >
        <ElForm
          :model="formData"
          label-width="160px"
          class="mt-4"
          :rules="formRules"
          ref="formRef"
          :disabled="isFormLocked"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <ElFormItem label="Nhà cung cấp" prop="supplierId">
                <ElSelect
                  v-model="formData.supplierId"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="Chọn nhà cung cấp..."
                  :remote-method="searchSuppliers"
                  :loading="supplierLoading"
                  class="w-full"
                  clearable
                >
                  <ElOption
                    v-for="item in supplierOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="Số hợp đồng" prop="contractNumber">
                <ElInput v-model="formData.contractNumber" placeholder="VD: HD-2024-001" />
              </ElFormItem>
              <div class="grid grid-cols-2 gap-4">
                <ElFormItem label="Ngày hiệu lực" prop="effectiveDate">
                  <ElDatePicker
                    v-model="formData.effectiveDate"
                    type="date"
                    placeholder="Chọn ngày"
                    class="w-full"
                    value-format="YYYY-MM-DD"
                  />
                </ElFormItem>
                <ElFormItem label="Ngày hết hạn">
                  <ElDatePicker
                    v-model="formData.expirationDate"
                    type="date"
                    placeholder="Chọn ngày (tùy chọn)"
                    class="w-full"
                    value-format="YYYY-MM-DD"
                  />
                </ElFormItem>
              </div>
              <ElFormItem label="Giá trị hợp đồng" prop="contractValue">
                <ElInputNumber
                  v-model="formData.contractValue"
                  :min="0"
                  :step="1000000"
                  :precision="0"
                  class="w-full"
                />
              </ElFormItem>
              <ElFormItem label="Trạng thái" prop="status">
                <ElSelect v-model="formData.status" class="w-full">
                  <ElOption label="Nháp" value="Draft" />
                  <ElOption label="Chờ phê duyệt" value="PendingApproval" />
                  <ElOption label="Đang hiệu lực" value="Active" />
                  <ElOption label="Đã hết hạn" value="Expired" />
                  <ElOption label="Đã thanh lý" value="Terminated" />
                  <ElOption label="Đã hoàn thành" value="Completed" />
                </ElSelect>
              </ElFormItem>
            </el-col>

            <el-col :span="12">
              <div class="border-l pl-4">
                <div class="font-bold text-sm mb-3 text-gray-600"
                  >Hạn mức Tín dụng & Thanh toán</div
                >
                <ElFormItem label="Hạn mức công nợ tối đa">
                  <ElInputNumber
                    v-model="formData.creditLimit"
                    :min="0"
                    :step="100000000"
                    :precision="0"
                    class="w-full"
                    placeholder="VD: 2000000000"
                  />
                </ElFormItem>
                <ElFormItem label="Thời hạn thanh toán (ngày)">
                  <ElInputNumber
                    v-model="formData.paymentWindowDays"
                    :min="0"
                    :step="1"
                    class="w-full"
                    placeholder="VD: 30"
                  />
                </ElFormItem>
                <ElFormItem label="Ngân hàng">
                  <ElInput v-model="formData.bankName" placeholder="Tên ngân hàng" />
                </ElFormItem>
                <ElFormItem label="Số tài khoản">
                  <ElInput v-model="formData.bankAccountNumber" placeholder="Số tài khoản" />
                </ElFormItem>
              </div>
            </el-col>
          </el-row>

          <el-divider />

          <div class="font-bold text-sm mb-3 text-gray-600"
            >Chính sách Giá sỉ & Cam kết Sản lượng</div
          >
          <el-row :gutter="20" class="mb-4">
            <el-col :span="12">
              <ElFormItem label="Sản lượng tối thiểu/tháng">
                <ElInputNumber
                  v-model="formData.minimumVolumePerMonth"
                  :min="0"
                  :step="1"
                  class="w-full"
                  placeholder="Số lượng sản phẩm/tháng"
                />
              </ElFormItem>
            </el-col>
            <el-col :span="12">
              <ElFormItem label="Tỷ lệ chiết khấu (%)">
                <ElInputNumber
                  v-model="formData.discountRate"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  :precision="2"
                  class="w-full"
                  placeholder="VD: 5.5"
                />
              </ElFormItem>
            </el-col>
          </el-row>

          <!-- SKU Price List Table -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-sm">Bảng giá nhập sỉ (SKU)</span>
              <ElButton v-if="!isFormLocked" type="primary" size="small" @click="handleAddSkuItem">
                <ElIcon><Plus /></ElIcon> Thêm SKU
              </ElButton>
            </div>
            <ElTable
              :data="formData.contractItems"
              border
              stripe
              size="small"
              max-height="300"
              empty-text="Chưa có SKU nào"
            >
              <ElTableColumn type="index" label="#" width="50" align="center" />
              <ElTableColumn prop="productVariantId" label="Mã SKU" width="120" align="center">
                <template #default="{ row, $index }">
                  <ElInput
                    v-model="row.skuCode"
                    placeholder="SKU"
                    size="small"
                    :disabled="isFormLocked"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="Tên sản phẩm" min-width="180">
                <template #default="{ row }">
                  <span>{{ row.productName || '-' }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="Giá nhập sỉ" width="150" align="right">
                <template #default="{ row }">
                  <ElInputNumber
                    v-model="row.wholesalePrice"
                    :min="0"
                    :step="1000"
                    :precision="0"
                    size="small"
                    :disabled="isFormLocked"
                    class="w-full"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="MOQ" width="90" align="center">
                <template #default="{ row }">
                  <ElInputNumber
                    v-model="row.moq"
                    :min="1"
                    :step="1"
                    size="small"
                    :disabled="isFormLocked"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="Danh mục" width="150">
                <template #default="{ row }">
                  <span>{{ row.category || '-' }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="Thao tác" width="80" align="center" v-if="!isFormLocked">
                <template #default="{ $index }">
                  <ElButton type="danger" size="small" text @click="handleRemoveSkuItem($index)">
                    Xóa
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
            <div
              v-if="(formData.contractItems || []).length === 0"
              class="text-center text-gray-400 text-sm py-3"
            >
              Chưa có dữ liệu SKU. Nhấn "Thêm SKU" để thêm.
            </div>
          </div>

          <el-divider />

          <ElFormItem label="File hợp đồng">
            <ElUpload
              :http-request="customUploadRequest"
              :file-list="fileList"
              drag
              class="w-full"
              :disabled="isFormLocked"
            >
              <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
              <div class="el-upload__text">Kéo thả file hoặc <em>bấm vào đây</em> để tải lên</div>
              <template #tip>
                <div class="el-upload__tip">Hỗ trợ PDF, JPG, PNG (tối đa 10MB)</div>
              </template>
            </ElUpload>
          </ElFormItem>
          <ElFormItem label="Điều khoản chính">
            <ElInput
              v-model="formData.terms"
              type="textarea"
              :rows="3"
              placeholder="Nội dung điều khoản chính..."
              :disabled="isFormLocked"
            />
          </ElFormItem>
          <ElFormItem label="Ghi chú">
            <ElInput
              v-model="formData.note"
              type="textarea"
              :rows="2"
              placeholder="Ghi chú thêm..."
              :disabled="isFormLocked"
            />
          </ElFormItem>
        </ElForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <ElButton @click="dialogVisible = false">Hủy</ElButton>
            <ElButton v-if="isFormLocked" type="warning" @click="handleCreateAddendum">
              Tạo phụ lục (để chỉnh sửa)
            </ElButton>
            <ElButton v-else type="primary" :loading="submitting" @click="submitForm">
              {{ formData.id ? 'Cập nhật' : 'Tạo mới' }}
            </ElButton>
          </div>
        </template>
      </ElDialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { Plus, UploadFilled } from '@element-plus/icons-vue'
  import { ref, reactive, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import type {
    SupplierContractDto,
    SupplierContractStatus,
    SupplierContractSkuItem,
  } from '@/domain/supplier/contract.types'
  import { createSupplierContractUseCases } from '@/infrastructure/supplier/usecasesFactory'

  defineOptions({ name: 'ContractSupplier' })

  const usecases = createSupplierContractUseCases()

  const router = useRouter()

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo hợp đồng mới')
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const tableRef = ref()
  const supplierLoading = ref(false)
  const supplierOptions = ref<{ id: string; name: string }[]>([])

  const stats = reactive({
    totalContracts: 0,
    activeContracts: 0,
    pendingApproval: 0,
    expiredContracts: 0,
    expiringContracts: 0,
  })

  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const data = ref<SupplierContractDto[]>([])
  const fileList = ref<any[]>([])

  const formData = ref<Partial<SupplierContractDto>>({
    contractNumber: '',
    effectiveDate: '',
    expirationDate: '',
    contractValue: 0,
    status: 'Draft',
    terms: '',
    note: '',
    supplierId: undefined,
    creditLimit: undefined,
    paymentWindowDays: undefined,
    bankName: '',
    bankAccountNumber: '',
    minimumVolumePerMonth: undefined,
    discountRate: undefined,
    contractItems: [],
  })

  const searchForm = ref({ name: '', contractNumber: '', status: [] as string[] })

  const searchItems = ref([
    { key: 'name', label: 'Tên nhà cung cấp', type: 'input' },
    { key: 'contractNumber', label: 'Số hợp đồng', type: 'input' },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      props: {
        options: [
          { label: 'Nháp', value: 'Draft' },
          { label: 'Chờ phê duyệt', value: 'PendingApproval' },
          { label: 'Đang hiệu lực', value: 'Active' },
          { label: 'Đã hết hạn', value: 'Expired' },
          { label: 'Đã thanh lý', value: 'Terminated' },
          { label: 'Đã hoàn thành', value: 'Completed' },
        ],
        multiple: true,
        collapseTags: true,
        placeholder: 'Chọn trạng thái...',
      },
    },
  ])

  const columns = ref<ColumnOption[]>([
    { label: 'Nhà cung cấp', prop: 'supplierName', minWidth: 160 },
    { label: 'Số hợp đồng', prop: 'contractNumber', minWidth: 150 },
    { label: 'Giá trị', prop: 'contractValue', width: 130, align: 'right' },
    { label: 'Hạn mức nợ', prop: 'creditLimit', width: 130, align: 'right' },
    { label: 'Chiết khấu', prop: 'discountRate', width: 100, align: 'center' },
    { label: 'Trạng thái', prop: 'status', width: 130, align: 'center' },
    { label: 'Ngày hiệu lực', prop: 'effectiveDate', width: 120, align: 'center' },
    { label: 'Ngày hết hạn', prop: 'expirationDate', width: 120, align: 'center' },
    { label: 'Thao tác', prop: 'operation', width: 180, fixed: 'right' as const, align: 'center' },
  ])
  const columnChecks = columns

  const isFormLocked = computed(() => {
    return formData.value.status === 'Active'
  })

  const formRules = {
    contractNumber: [{ required: true, message: 'Vui lòng nhập số hợp đồng', trigger: 'blur' }],
    effectiveDate: [{ required: true, message: 'Vui lòng chọn ngày hiệu lực', trigger: 'change' }],
    contractValue: [{ required: true, message: 'Vui lòng nhập giá trị hợp đồng', trigger: 'blur' }],
    status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
  }

  const getStatusType = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'PendingApproval':
        return 'warning'
      case 'Expired':
        return 'danger'
      case 'Terminated':
        return 'info'
      case 'Completed':
        return 'success'
      default:
        return 'info'
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'Nháp',
      PendingApproval: 'Chờ phê duyệt',
      Active: 'Đang hiệu lực',
      Expired: 'Đã hết hạn',
      Terminated: 'Đã thanh lý',
      Completed: 'Đã hoàn thành',
    }
    return map[status] || status
  }

  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return '-'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const searchSuppliers = async (query: string) => {
    if (!query) {
      supplierOptions.value = []
      return
    }
    supplierLoading.value = true
    try {
      const res = await usecases.getSuppliersForSelect.execute()
      supplierOptions.value = res.filter((s: any) =>
        s.name.toLowerCase().includes(query.toLowerCase()),
      )
    } catch {
      supplierOptions.value = []
    } finally {
      supplierLoading.value = false
    }
  }

  const customUploadRequest = async (options: any) => {
    try {
      const url = URL.createObjectURL(options.file)
      fileList.value = [{ name: options.file.name, url, response: 'ok' }]
      formData.value.contractFilePath = url
      options.onSuccess?.({})
    } catch {
      ElMessage.error('Tải lên thất bại')
      options.onError?.({})
    }
  }

  const loadStats = async () => {
    try {
      const res = await usecases.getStatistics.execute()
      stats.totalContracts = res.totalContracts || 0
      stats.activeContracts = res.activeContracts || 0
      stats.pendingApproval = res.pendingApproval || 0
      stats.expiredContracts = res.expiredContracts || 0
      stats.expiringContracts = res.expiringContracts || 0
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadData = async () => {
    loading.value = true
    try {
      const filters: string[] = []
      if (searchForm.value.name) filters.push(`Supplier.Name@=${searchForm.value.name}`)
      if (searchForm.value.contractNumber)
        filters.push(`ContractNumber@=${searchForm.value.contractNumber}`)
      if (searchForm.value.status.length > 0)
        filters.push(`Status==${searchForm.value.status.join('|')}`)

      const params: any = {
        current: pagination.current,
        size: pagination.size,
        Filters: filters.join(',') || undefined,
        Sorts: 'EffectiveDate desc',
      }
      const res = await usecases.getContracts.execute(params)
      data.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('Failed to load contracts:', error)
      ElMessage.error('Không thể tải danh sách hợp đồng')
    } finally {
      loading.value = false
    }
  }

  const handleReset = () => {
    pagination.current = 1
    loadData()
  }

  const handleAdd = () => {
    dialogTitle.value = 'Tạo hợp đồng mới'
    formData.value = {
      contractNumber: '',
      effectiveDate: '',
      expirationDate: '',
      contractValue: 0,
      status: 'Draft',
      terms: '',
      note: '',
      supplierId: undefined,
      creditLimit: undefined,
      paymentWindowDays: undefined,
      bankName: '',
      bankAccountNumber: '',
      minimumVolumePerMonth: undefined,
      discountRate: undefined,
      contractItems: [],
    }
    fileList.value = []
    dialogVisible.value = true
  }

  const handleEdit = (row: SupplierContractDto) => {
    dialogTitle.value = 'Cập nhật hợp đồng'
    const skuItems: SupplierContractSkuItem[] =
      (row as any).skuPriceList?.map((item: any) => ({
        ...item,
      })) || []

    formData.value = {
      ...row,
      creditLimit: (row as any).creditLimit,
      paymentWindowDays: (row as any).paymentWindowDays,
      bankName: (row as any).bankName,
      bankAccountNumber: (row as any).bankAccountNumber,
      minimumVolumePerMonth: (row as any).minimumVolumePerMonth,
      discountRate: (row as any).discountRate,
      contractItems: skuItems,
    }
    if (row.contractFilePath) {
      fileList.value = [{ name: 'contract-file', url: row.contractFilePath, response: 'ok' }]
    } else {
      fileList.value = []
    }
    dialogVisible.value = true
  }

  const handleView = (row: SupplierContractDto) => {
    router.push({ name: 'SupplierContractPreview', params: { id: row.id } })
  }

  const handleDelete = async (row: SupplierContractDto) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa hợp đồng "${row.contractNumber}"?`,
        'Xác nhận xóa',
        { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' },
      )
      await usecases.delete.execute(row.id)
      ElMessage.success('Xóa thành công')
      loadData()
      loadStats()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete:', error)
        ElMessage.error('Không thể xóa hợp đồng')
      }
    }
  }

  const handleAddSkuItem = () => {
    const items = formData.value.contractItems || []
    items.push({
      productVariantId: 0,
      wholesalePrice: 0,
      skuCode: '',
      productName: '',
      category: '',
      moq: 1,
    } as any)
  }

  const handleRemoveSkuItem = (index: number) => {
    const items = formData.value.contractItems || []
    items.splice(index, 1)
  }

  const handleCreateAddendum = () => {
    ElMessage.info('Tính năng tạo phụ lục đang được phát triển.')
  }

  const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      try {
        const payload: any = { ...formData.value }
        delete payload.supplierName
        delete payload.supplierCode
        delete payload.skuPriceList
        delete payload.supplierContactName
        delete payload.supplierPhone
        delete payload.supplierEmail
        delete payload.supplierAddress
        delete payload.createdAt
        delete payload.updatedAt
        delete payload.deletedAt

        if (formData.value.id) {
          await usecases.update.execute(formData.value.id, payload)
          ElMessage.success('Cập nhật thành công')
        } else {
          await usecases.create.execute(payload)
          ElMessage.success('Tạo mới thành công')
        }
        dialogVisible.value = false
        loadData()
        loadStats()
      } catch (error) {
        console.error('Failed to save:', error)
        ElMessage.error('Không thể lưu hợp đồng')
      } finally {
        submitting.value = false
      }
    })
  }

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }
  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadData()
  }
  const handleCurrentChange = (page: number) => {
    pagination.current = page
    loadData()
  }
  const refreshData = () => {
    loadData()
  }

  onMounted(() => {
    loadStats()
    loadData()
  })
</script>

<style scoped lang="scss">
  .contract-supplier-container {
    padding: 16px;
  }

  .border-l {
    border-left: 1px solid #e4e7ed;
  }
</style>
