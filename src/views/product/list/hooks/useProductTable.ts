import { ref, watch } from 'vue'
import { ProductApi } from '@/api/product/product.api'
import { CategoryApi } from '@/api/product/category.api'
import { BrandApi } from '@/api/product/brand.api'
import { TechnologyApi } from '@/api/product/technology.api'
import { useTable } from '@/hooks/core/useTable'
import type { Product } from '@/domain/product/product.types'
import type { ProductCategory } from '@/domain/product/category.types'
import type { Brand } from '@/domain/product/brand.types'
import type { Technology } from '@/domain/product/technology.types'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useProductTable() {
  const activeCategory = ref<number | string>('all')
  const categories = ref<ProductCategory[]>([])
  const brands = ref<Brand[]>([])
  const availableTechnologies = ref<Technology[]>([])
  const selectedTechIds = ref<number[]>([])
  const loadingCategories = ref(false)
  const loadingBrands = ref(false)
  const loadingTechs = ref(false)

  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const formData = ref<Partial<Product>>({
    product_technologies: []
  })
  const submitting = ref(false)

  const fetchTechnologies = async () => {
    if (!formData.value.category_id && !formData.value.brand_id) {
      availableTechnologies.value = []
      return
    }

    loadingTechs.value = true
    try {
      const res = await TechnologyApi.getList({
        category_id: formData.value.category_id,
        brand_id: formData.value.brand_id
      })
      availableTechnologies.value = res || []
    } catch (_err) {
      console.error('Failed to fetch techs:', _err)
    } finally {
      loadingTechs.value = false
    }
  }

  watch(() => formData.value.category_id, fetchTechnologies)
  watch(() => formData.value.brand_id, fetchTechnologies)

  const fetchCategories = async () => {
    loadingCategories.value = true
    try {
      const res = await CategoryApi.getList({
        current: 1,
        size: 100,
        Filters: 'CategoryGroup==Product' // Chỉ lấy thể loại sản phẩm, loại bỏ xe
      })
      categories.value = res.items || []
    } catch (_err) {
      console.error('Failed to fetch categories:', _err)
      categories.value = []
    } finally {
      loadingCategories.value = false
    }
  }

  const fetchBrands = async () => {
    loadingBrands.value = true
    try {
      const res = await BrandApi.getList({
        current: 1,
        size: 100
      })
      brands.value = res.items || []
    } catch (_err) {
      console.error('Failed to fetch brands:', _err)
      brands.value = []
    } finally {
      loadingBrands.value = false
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
    replaceSearchParams
  } = useTable({
    core: {
      apiFn: ProductApi.getList,
      apiParams: {
        current: 1,
        size: 10,
        Filters: ''
      },
      immediate: true,
      columnsFactory: () => [
        { prop: 'name', label: 'Sản phẩm', minWidth: 250, useSlot: true },
        { prop: 'cover_image_url', label: 'Hình ảnh', width: 100, align: 'center', useSlot: true },
        { prop: 'brand', label: 'Thương hiệu', width: 150 },
        { prop: 'category', label: 'Thể loại', width: 150 },
        { prop: 'origin', label: 'Xuất xứ', width: 120 },
        { prop: 'stock', label: 'Tồn kho', width: 100, align: 'center' },
        {
          prop: 'inventory_status',
          label: 'Trạng thái',
          width: 120,
          align: 'center',
          useSlot: true
        },
        {
          prop: 'operation',
          label: 'Hành động',
          width: 150,
          align: 'center',
          fixed: 'right',
          useSlot: true
        }
      ]
    }
  })

  const handleAdd = () => {
    dialogTitle.value = 'Thêm sản phẩm mới'
    formData.value = {
      name: '',
      category_id: undefined,
      brand_id: undefined,
      description: '',
      origin: '',
      unit: 'Chiếc',
      cover_image_url: '',
      stock: 0,
      inventory_status: 'InStock',
      product_technologies: []
    }
    selectedTechIds.value = []
    dialogVisible.value = true
  }

  const handleEdit = async (row: Product) => {
    dialogTitle.value = 'Cập nhật sản phẩm'

    try {
      const fullProduct = await ProductApi.getById(row.id)
      formData.value = { ...fullProduct }

      selectedTechIds.value = (fullProduct.product_technologies || []).map(
        (pt: any) => pt.technology_id
      )

      dialogVisible.value = true
    } catch (_err: any) {
      ElMessage.error('Không thể lấy chi tiết sản phẩm')
    }
  }

  const handleDelete = (row: Product) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa sản phẩm "${row.name}" không?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await ProductApi.delete(row.id)
        ElMessage.success('Xóa sản phẩm thành công')
        refreshData()
      } catch (_err: any) {
        ElMessage.error(_err.message || 'Xóa thất bại')
      }
    })
  }

  const submitForm = async () => {
    submitting.value = true
    try {
      formData.value.product_technologies = selectedTechIds.value.map((id) => ({
        technology_id: id,
        display_order: 0
      }))

      if (formData.value.id) {
        await ProductApi.update(formData.value.id, formData.value)
        ElMessage.success('Cập nhật sản phẩm thành công')
      } else {
        await ProductApi.create(formData.value)
        ElMessage.success('Thêm sản phẩm thành công')
      }
      dialogVisible.value = false
      refreshData()
    } catch (_err: any) {
      ElMessage.error(_err.message || 'Thao tác thất bại')
    } finally {
      submitting.value = false
    }
  }

  watch(activeCategory, (val) => {
    const filter = val === 'all' ? '' : `category_id==${val}`
    replaceSearchParams({
      Filters: filter
    })
    getData()
  })

  const handleSearch = (params: any) => {
    const filters = []
    if (params.name) filters.push(`Name@=${params.name}`)
    if (params.brand) filters.push(`brand@=${params.brand}`)

    if (activeCategory.value !== 'all') {
      filters.push(`category_id==${activeCategory.value}`)
    }

    replaceSearchParams({
      Filters: filters.join(',')
    })
    getData()
  }

  const handleReset = () => {
    const defaultFilter =
      activeCategory.value === 'all' ? '' : `category_id==${activeCategory.value}`
    replaceSearchParams({
      Filters: defaultFilter
    })
    getData()
  }

  fetchCategories()
  fetchBrands()

  return {
    activeCategory,
    categories,
    brands,
    loadingCategories,
    availableTechnologies,
    selectedTechIds,
    loadingTechs,
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
