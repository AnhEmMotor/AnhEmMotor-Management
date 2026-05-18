import { useTable } from '@/hooks/core/useTable'
import { CategoryApi } from '@/api/product/category.api'
import { VehicleTypeApi } from '@/api/product/vehicleType.api'
import { ref, watch, computed, onMounted } from 'vue'
import type { ProductCategory } from '@/domain/product/category.types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { buildTree } from '@/utils'

export function useCategoryTable() {
  const activeTab = ref('product')
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const formData = ref<Partial<ProductCategory>>({})
  const submitting = ref(false)

  const stats = ref({
    totalCategories: 0,
    productCategoriesCount: 0,
    vehicleTypesCount: 0,
    newProductCategoryName: '',
    newVehicleTypeName: '',
    newProductCategoriesCount: 0,
    newVehicleTypesCount: 0
  })

  const fetchStats = async () => {
    try {
      const res = await CategoryApi.getStats()
      if (res) {
        stats.value = res
      }
    } catch (err) {
      console.error('Failed to fetch category stats:', err)
    }
  }

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
    resetColumns
  } = useTable({
    core: {
      apiFn: (params: any) => {
        if (activeTab.value === 'vehicle') {
          return VehicleTypeApi.getList(params)
        } else {
          return CategoryApi.getList({
            ...params,
            size: 1000 // Get all categories to build tree properly
          }) as unknown as Promise<Api.Common.PaginatedResponse<ProductCategory>>
        }
      },
      apiParams: {
        current: 1,
        size: 10
      },
      columnsFactory: () => {
        if (activeTab.value === 'vehicle') {
          return [
            { type: 'index', label: 'STT', width: 70, align: 'center' },
            { prop: 'imageUrl', label: 'Hình ảnh', width: 100, useSlot: true, align: 'center' },
            { prop: 'name', label: 'Tên dòng xe', minWidth: 200, useSlot: true },
            { prop: 'slug', label: 'Slug', width: 180 },
            { prop: 'productCount', label: 'Số sản phẩm', width: 120, align: 'center' },
            { prop: 'isActive', label: 'Trạng thái', width: 120, useSlot: true, align: 'center' },
            {
              prop: 'operation',
              label: 'Thao tác',
              width: 150,
              useSlot: true,
              align: 'center',
              fixed: 'right'
            }
          ]
        } else {
          return [
            { prop: 'imageUrl', label: 'Hình ảnh', width: 120, useSlot: true, align: 'left' },
            { prop: 'name', label: 'Tên thể loại', minWidth: 220, useSlot: true },
            { prop: 'slug', label: 'Slug', width: 180 },
            { prop: 'productCount', label: 'Số sản phẩm', width: 120, align: 'center' },
            { prop: 'isActive', label: 'Trạng thái', width: 120, useSlot: true, align: 'center' },
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
      }
    }
  })

  const tableData = computed<any[]>(() => {
    if (activeTab.value === 'vehicle') {
      return data.value
    }
    return buildTree(data.value as ProductCategory[])
  })

  const parentCategories = computed<ProductCategory[]>(() => {
    return (data.value as ProductCategory[]).filter(
      (c) => !c.parentId && c.id !== formData.value.id
    )
  })

  const handleAdd = () => {
    dialogTitle.value = activeTab.value === 'vehicle' ? 'Thêm loại xe mới' : 'Thêm danh mục mới'
    formData.value = {
      name: '',
      slug: '',
      imageUrl: '',
      description: '',
      isActive: true,
      sortOrder: 0,
      parentId: null
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: ProductCategory) => {
    dialogTitle.value = activeTab.value === 'vehicle' ? 'Cập nhật loại xe' : 'Cập nhật danh mục'
    formData.value = { ...row }
    dialogVisible.value = true
  }

  const handleDelete = (row: ProductCategory) => {
    ElMessageBox.confirm(`Bạn có chắc chắn muốn xóa "${row.name}" không?`, 'Xác nhận xóa', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning'
    }).then(async () => {
      try {
        if (activeTab.value === 'vehicle') {
          await VehicleTypeApi.delete(row.id)
        } else {
          await CategoryApi.delete(row.id)
        }
        ElMessage.success('Xóa thành công')
        await refreshData()
        await fetchStats()
      } catch (err: any) {
        ElMessage.error(err.message || 'Xóa thất bại')
      }
    })
  }

  const submitForm = async () => {
    submitting.value = true
    try {
      const api = activeTab.value === 'vehicle' ? VehicleTypeApi : CategoryApi
      if (formData.value.id) {
        await api.update(formData.value.id, formData.value)
        ElMessage.success('Cập nhật thành công')
      } else {
        await api.create(formData.value)
        ElMessage.success('Thêm mới thành công')
      }
      dialogVisible.value = false
      await refreshData()
      await fetchStats()
    } catch (err: any) {
      ElMessage.error(err.message || 'Thao tác thất bại')
    } finally {
      submitting.value = false
    }
  }

  watch(activeTab, () => {
    if (resetColumns) {
      resetColumns()
    }
    replaceSearchParams({})
    getData()
  })

  const handleSearch = (params: any) => {
    const filters: string[] = []
    if (params.name) filters.push(`Name@=${params.name}`)
    replaceSearchParams({
      Filters: filters.join(',')
    })
    getData()
  }

  const handleReset = () => {
    replaceSearchParams({})
    getData()
  }

  const handleRefresh = async () => {
    await refreshData()
    await fetchStats()
  }

  onMounted(() => {
    fetchStats()
  })

  return {
    activeTab,
    data,
    tableData,
    stats,
    parentCategories,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData: handleRefresh,

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
