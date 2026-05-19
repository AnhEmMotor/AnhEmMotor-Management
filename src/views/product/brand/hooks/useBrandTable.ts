import { ref } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { BrandApi } from '@/api/product/brand.api'
import type { Brand } from '@/domain/product/brand.types'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useBrandTable() {
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const formData = ref<Partial<Brand>>({})
  const submitting = ref(false)

  const statistics = ref({
    totalBrands: 0,
    popularOrigin: '',
    popularOriginCount: 0,
    latestUpdatedBrandName: '',
    latestUpdatedAt: null as string | null
  })

  const fetchStatistics = async () => {
    try {
      const res = await BrandApi.getStatistics()
      statistics.value = {
        totalBrands: res.totalBrands ?? 0,
        popularOrigin: res.popularOrigin ?? '',
        popularOriginCount: res.popularOriginCount ?? 0,
        latestUpdatedBrandName: res.latestUpdatedBrandName ?? '',
        latestUpdatedAt: res.latestUpdatedAt ?? null
      }
    } catch (err) {
      console.error('Failed to fetch brand statistics:', err)
    }
  }

  fetchStatistics()

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
    replaceSearchParams,
    searchParams
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
        {
          prop: 'operation',
          label: 'Thao tác',
          width: 150,
          useSlot: true,
          align: 'center',
          fixed: 'right'
        }
      ]
    }
  })

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
        refreshAll()
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
      refreshAll()
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

  const refreshAll = () => {
    refreshData()
    fetchStatistics()
  }

  const exporting = ref(false)

  const handleExport = async () => {
    exporting.value = true
    try {
      const filters = (searchParams as any).Filters
      const resBlob = await BrandApi.export({ Filters: filters })

      const url = window.URL.createObjectURL(new Blob([resBlob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Danh_sach_thuong_hieu.xlsx')
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
    refreshData: refreshAll,
    statistics,
    fetchStatistics,

    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,

    exporting,
    handleExport
  }
}
