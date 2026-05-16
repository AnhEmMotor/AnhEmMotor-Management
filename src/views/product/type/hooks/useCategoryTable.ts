import { useTable } from '@/hooks/core/useTable'
import { CategoryApi } from '@/api/product/category.api'
import { VehicleTypeApi } from '@/api/product/vehicleType.api'
import { ref, watch } from 'vue'
import type { ProductCategory } from '@/domain/product/category.types'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useCategoryTable() {
  const activeTab = ref('product')
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const formData = ref<Partial<ProductCategory>>({})
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
      apiFn: (params: any) => {
        return (
          activeTab.value === 'vehicle'
            ? VehicleTypeApi.getList(params)
            : CategoryApi.getList(params)
        ) as Promise<Api.Common.PaginatedResponse<ProductCategory>>
      },
      apiParams: {
        current: 1,
        size: 10
      },
      columnsFactory: () => [
        { type: 'index', label: 'STT', width: 70, align: 'center' },
        { prop: 'imageUrl', label: 'Hình ảnh', width: 100, useSlot: true, align: 'center' },
        { prop: 'name', label: 'Tên thể loại', minWidth: 200, useSlot: true },
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
  })

  const handleAdd = () => {
    dialogTitle.value = activeTab.value === 'vehicle' ? 'Thêm loại xe mới' : 'Thêm danh mục mới'
    formData.value = {
      name: '',
      slug: '',
      imageUrl: '',
      description: '',
      isActive: true,
      sortOrder: 0
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
        refreshData()
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
      refreshData()
    } catch (err: any) {
      ElMessage.error(err.message || 'Thao tác thất bại')
    } finally {
      submitting.value = false
    }
  }

  watch(activeTab, () => {
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

  return {
    activeTab,
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
