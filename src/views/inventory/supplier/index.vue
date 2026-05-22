<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng đối tác"
        :count="stats.totalSuppliers"
        icon="ri:team-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đối tác Tài chính"
        :count="stats.financialSuppliers"
        icon="ri:bank-card-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Đối tác Công nợ"
        :count="stats.creditSuppliers"
        icon="ri:error-warning-line"
        iconStyle="bg-danger"
      />
    </div>

    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="100"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon><Plus /></ElIcon> Thêm đối tác mới
          </ElButton>
          <ElButton v-ripple :loading="exporting" @click="handleExport">
            <ElIcon><Download /></ElIcon> Xuất báo cáo
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
        <template #partnerTypeId="{ row }">
          <ElTag :type="getPartnerTypeTag(row.partnerTypeId)" size="small">
            {{ getPartnerTypeName(row.partnerTypeId) }}
          </ElTag>
        </template>

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

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

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
  import { ref, reactive, onMounted } from 'vue'
  import { SupplierApi } from '@/api/supplier.api'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { Supplier, PartnerType, SupplierStatistics } from '@/domain/supplier/supplier.types'

  defineOptions({ name: 'InventorySupplier' })

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Thêm đối tác')
  const submitting = ref(false)
  const partnerTypes = ref<PartnerType[]>([])
  const stats = ref<SupplierStatistics>({
    totalSuppliers: 0,
    financialSuppliers: 0,
    creditSuppliers: 0
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const data = ref<Supplier[]>([])

  const formData = ref<Partial<Supplier>>({
    name: '',
    partnerTypeId: '',
    phone: '',
    email: '',
    taxIdentificationNumber: '',
    address: '',
    notes: '',
    status: true
  })

  const columns = ref([
    { label: 'Tên đối tác', prop: 'name', minWidth: 220 },
    { label: 'Phân loại', prop: 'partnerTypeId', useSlot: true, width: 200, align: 'center' },
    { label: 'Liên hệ', prop: 'contact', useSlot: true, width: 350 },
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

  const searchForm = ref({
    name: '',
    type: [] as string[]
  })

  const searchItems = ref([
    { key: 'name', label: 'Tên đối tác', type: 'input' },
    {
      key: 'type',
      label: 'Loại',
      type: 'select',
      props: {
        options: [] as { label: string; value: string }[],
        multiple: true,
        collapseTags: true,
        placeholder: 'Chọn loại đối tác...'
      }
    }
  ])

  const getPartnerTypeTag = (type: string) => {
    const partnerType = partnerTypes.value.find((pt) => pt.key === type)
    if (!partnerType) return 'info'
    return type === 'supplier' ? 'primary' : type === 'financial' ? 'success' : 'warning'
  }

  const getPartnerTypeName = (type: string) => {
    const partnerType = partnerTypes.value.find((pt) => pt.key === type)
    return partnerType?.name || type
  }

  const loadPartnerTypes = async () => {
    try {
      partnerTypes.value = await SupplierApi.getPartnerTypes()
      if (searchItems.value[1].props) {
        searchItems.value[1].props.options = partnerTypes.value.map((pt) => ({
          label: pt.name,
          value: pt.key
        }))
      }
    } catch (error) {
      console.error('Failed to load partner types:', error)
    }
  }

  const loadData = async () => {
    await loadDataWithFilters(searchForm.value)
  }

  const handleReset = () => {
    pagination.current = 1
    loadDataWithFilters()
  }

  const handleAdd = () => {
    dialogTitle.value = 'Thêm đối tác mới'
    formData.value = {
      name: '',
      partnerTypeId: '',
      phone: '',
      email: '',
      taxIdentificationNumber: '',
      address: '',
      notes: '',
      status: true
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: Supplier) => {
    dialogTitle.value = 'Cập nhật đối tác'
    formData.value = { ...row }
    dialogVisible.value = true
  }

  const handleDelete = async (row: Supplier) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa đối tác "${row.name}"?`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await SupplierApi.delete(row.id)
      ElMessage.success('Xóa thành công')
      loadData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete supplier:', error)
        ElMessage.error('Không thể xóa nhà cung cấp')
      }
    }
  }

  const submitForm = async () => {
    if (!formData.value.name || !formData.value.partnerTypeId) {
      ElMessage.warning('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    submitting.value = true
    try {
      if (formData.value.id) {
        await SupplierApi.update(formData.value.id, formData.value)
        ElMessage.success('Cập nhật thành công')
      } else {
        await SupplierApi.create(formData.value)
        ElMessage.success('Tạo mới thành công')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      console.error('Failed to save supplier:', error)
      ElMessage.error('Không thể lưu nhà cung cấp')
    } finally {
      submitting.value = false
    }
  }

  const handleSearch = (filters: any) => {
    pagination.current = 1
    loadDataWithFilters(filters)
  }

  const loadDataWithFilters = async (filters?: any) => {
    loading.value = true
    try {
      const sieveFilters = []
      if (filters?.name) {
        sieveFilters.push(`Name@=${filters.name}`)
      }
      if (filters?.type && filters.type.length > 0) {
        if (Array.isArray(filters.type)) {
          const typeFilters = `PartnerTypeId==${filters.type.join('|')}`
          sieveFilters.push(typeFilters)
        } else {
          sieveFilters.push(`PartnerTypeId==${filters.type}`)
        }
      }

      const params: any = {
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined
      }

      const res = await SupplierApi.getList(params)
      data.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('Failed to load suppliers:', error)
      ElMessage.error('Không thể tải danh sách nhà cung cấp')
    } finally {
      loading.value = false
    }
  }

  const refreshData = () => {
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

  onMounted(() => {
    loadPartnerTypes()
    loadData()
    loadStats()
  })

  const loadStats = async () => {
    try {
      stats.value = await SupplierApi.getStatistics()
    } catch (error) {
      console.error('Failed to load supplier statistics:', error)
    }
  }

  const exporting = ref(false)

  const handleExport = async () => {
    exporting.value = true
    try {
      const sieveFilters = []
      if (searchForm.value.name) {
        sieveFilters.push(`Name@=${searchForm.value.name}`)
      }
      if (searchForm.value.type && searchForm.value.type.length > 0) {
        if (Array.isArray(searchForm.value.type)) {
          const typeFilters = `PartnerTypeId==${searchForm.value.type.join('|')}`
          sieveFilters.push(typeFilters)
        } else {
          sieveFilters.push(`PartnerTypeId==${searchForm.value.type}`)
        }
      }

      const resBlob = await SupplierApi.exportExcel({
        Filters: sieveFilters.join(',') || undefined,
        Sorts: 'Id desc'
      })

      const url = window.URL.createObjectURL(new Blob([resBlob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Danh_sach_nha_cung_cap.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('Xuất file Excel thành công')
    } catch (err: any) {
      console.error(err)
      ElMessage.error(err.message || 'Xuất file Excel thất bại')
    } finally {
      exporting.value = false
    }
  }
</script>
