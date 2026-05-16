import { ref } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { BrandApi } from '@/api/product/brand.api'
import type { Brand } from '@/domain/product/brand.types'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * Application Layer - Brand Table Logic
 */
export function useBrandTable() {
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const formData = ref<Partial<Brand>>({})
  const submitting = ref(false)

  const {
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    getData,
    refreshData,
    replaceSearchParams
  } = useTable({
    core: {
      apiFn: BrandApi.getList,
      apiParams: {
        current: 1,
        size: 10
      },
      columnsFactory: () => [
        { type: 'index', label: 'STT', width: 70, align: 'center' },
        { prop: 'logoUrl', label: 'Logo', width: 100, useSlot: true, align: 'center' },
        { prop: 'name', label: 'Thương hiệu', width: 220, useSlot: true },
        { prop: 'origin', label: 'Xuất xứ', width: 140, useSlot: true },
        { prop: 'description', label: 'Mô tả chi tiết', minWidth: 250, showOverflowTooltip: true },
        { prop: 'operation', label: 'Thao tác', width: 150, useSlot: true, align: 'center', fixed: 'right' }
      ]
    }
  })

  // CRUD Operations
  const handleAdd = () => {
    dialogTitle.value = 'Thêm thương hiệu mới'
    formData.value = {
      name: '',
      origin: '',
      logoUrl: '',
      description: ''
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: Brand) => {
    dialogTitle.value = 'Cập nhật thương hiệu'
    formData.value = { ...row }
    dialogVisible.value = true
  }

  const handleDelete = (row: Brand) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa thương hiệu "${row.name}" không?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
        buttonSize: 'default'
      }
    ).then(async () => {
      try {
        await BrandApi.delete(row.id)
        ElMessage.success('Xóa thương hiệu thành công')
        refreshData()
      } catch (err: any) {
        ElMessage.error(err.message || 'Xóa thất bại')
      }
    })
  }

  const submitForm = async () => {
    submitting.value = true
    try {
      if (formData.value.id) {
        await BrandApi.update(formData.value.id, formData.value)
        ElMessage.success('Cập nhật thương hiệu thành công')
      } else {
        await BrandApi.create(formData.value)
        ElMessage.success('Thêm thương hiệu thành công')
      }
      dialogVisible.value = false
      refreshData()
    } catch (err: any) {
      ElMessage.error(err.message || 'Thao tác thất bại')
    } finally {
      submitting.value = false
    }
  }

  const handleSearch = (params: any) => {
    const filters = []
    if (params.name) filters.push(`Name@=${params.name}`)
    if (params.origin) filters.push(`Origin@=${params.origin}`)
    
    replaceSearchParams({
      Filters: filters.join(',')
    })
    getData()
  }

  const handleReset = () => {
    replaceSearchParams({
      Filters: ''
    })
    getData()
  }

  return {
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData,
    // CRUD
    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm
  }
}
