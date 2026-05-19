import { ref, watch, computed } from 'vue'
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
import { buildTree } from '@/utils'

export function useProductTable() {
  const categories = ref<ProductCategory[]>([])
  const categoryTree = computed(() => {
    return buildTree(categories.value)
  })
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

  const isVehicle = computed(() => {
    const catId = formData.value.category_id
    if (!catId) return false

    const findCategoryRecursive = (id: number): boolean => {
      const cat = categories.value.find((c) => c.id === id)
      if (!cat) return false

      const currentName = cat.name.toLowerCase()
      const vehicleKeywords = [
        'xe máy',
        'xe',
        'vehicle',
        'motor',
        'mô tô',
        'scooter',
        'tay ga',
        'tay côn'
      ]
      if (vehicleKeywords.some((kw) => currentName.includes(kw))) {
        return true
      }

      if (cat.parentId) {
        return findCategoryRecursive(cat.parentId)
      }

      return false
    }

    return findCategoryRecursive(Number(catId))
  })

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
        size: 1000,
        Filters: 'CategoryGroup==Product'
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
      meta_title: '',
      meta_description: '',
      short_description: '',
      description: '',
      material: '',
      origin: '',
      warranty_period: '',
      unit: 'Chiếc',
      std_dot: false,
      std_ece: false,
      std_snell: false,
      std_jis: false,
      other_standards: '',
      compatible_vehicle_model_ids: [],
      cover_image_url: '',
      stock: 0,
      inventory_status: 'InStock',
      product_technologies: [],
      engine_type: '',
      max_power: '',
      fuel_capacity: undefined,
      fuel_consumption: '',
      wheelbase: undefined,
      seat_height: undefined,
      ground_clearance: undefined,
      oil_capacity: undefined,
      transmission_type: '',
      starter_system: '',
      max_torque: '',
      displacement: undefined,
      bore_stroke: '',
      compression_ratio: '',
      fuel_system: '',
      frame_type: '',
      front_suspension: '',
      rear_suspension: '',
      front_tire_size: '',
      rear_tire_size: '',
      front_brake: '',
      rear_brake: '',
      battery_type: '',
      lighting_system: '',
      dashboard_type: '',
      highlights: '[]',
      highlights_list: [],
      variants: [
        {
          id: null,
          price: null,
          version_name: '',
          color_name: '',
          color_code: '#000000',
          colors: [{ name: '', code: '#000000', image: '' }],
          sku: '',
          photo_collection: [],
          url_slug: '',
          stock_quantity: 0,
          weight: null,
          dimensions: '',
          wheelbase: null,
          seat_height: null,
          ground_clearance: null,
          fuel_capacity: null,
          tire_size: '',
          showSpecs: false
        }
      ]
    }
    selectedTechIds.value = []
    dialogVisible.value = true
  }

  const handleEdit = async (row: Product) => {
    dialogTitle.value = 'Cập nhật sản phẩm'

    try {
      const fullProduct = await ProductApi.getById(row.id)

      // Ensure all fields are initialized to support reactivity
      fullProduct.meta_title = fullProduct.meta_title || ''
      fullProduct.meta_description = fullProduct.meta_description || ''
      fullProduct.short_description = fullProduct.short_description || ''
      fullProduct.description = fullProduct.description || ''
      fullProduct.material = fullProduct.material || ''
      fullProduct.origin = fullProduct.origin || ''
      fullProduct.warranty_period = fullProduct.warranty_period || ''
      fullProduct.unit = fullProduct.unit || 'Chiếc'
      fullProduct.std_dot = !!fullProduct.std_dot
      fullProduct.std_ece = !!fullProduct.std_ece
      fullProduct.std_snell = !!fullProduct.std_snell
      fullProduct.std_jis = !!fullProduct.std_jis
      fullProduct.other_standards = fullProduct.other_standards || ''
      fullProduct.compatible_vehicle_model_ids = fullProduct.compatible_vehicle_model_ids || []

      // Initialize all vehicle specific root specs
      fullProduct.engine_type = fullProduct.engine_type || ''
      fullProduct.max_power = fullProduct.max_power || ''
      fullProduct.fuel_capacity = fullProduct.fuel_capacity || undefined
      fullProduct.fuel_consumption = fullProduct.fuel_consumption || ''
      fullProduct.wheelbase = fullProduct.wheelbase || undefined
      fullProduct.seat_height = fullProduct.seat_height || undefined
      fullProduct.ground_clearance = fullProduct.ground_clearance || undefined
      fullProduct.oil_capacity = fullProduct.oil_capacity || undefined
      fullProduct.transmission_type = fullProduct.transmission_type || ''
      fullProduct.starter_system = fullProduct.starter_system || ''
      fullProduct.max_torque = fullProduct.max_torque || ''
      fullProduct.displacement = fullProduct.displacement || undefined
      fullProduct.bore_stroke = fullProduct.bore_stroke || ''
      fullProduct.compression_ratio = fullProduct.compression_ratio || ''
      fullProduct.fuel_system = fullProduct.fuel_system || ''
      fullProduct.frame_type = fullProduct.frame_type || ''
      fullProduct.front_suspension = fullProduct.front_suspension || ''
      fullProduct.rear_suspension = fullProduct.rear_suspension || ''
      fullProduct.front_tire_size = fullProduct.front_tire_size || ''
      fullProduct.rear_tire_size = fullProduct.rear_tire_size || ''
      fullProduct.front_brake = fullProduct.front_brake || ''
      fullProduct.rear_brake = fullProduct.rear_brake || ''
      fullProduct.battery_type = fullProduct.battery_type || ''
      fullProduct.lighting_system = fullProduct.lighting_system || ''
      fullProduct.dashboard_type = fullProduct.dashboard_type || ''

      // Parse custom highlights
      if (fullProduct.highlights && typeof fullProduct.highlights === 'string') {
        try {
          fullProduct.highlights_list = JSON.parse(fullProduct.highlights)
        } catch (_e) {
          console.error('Failed to parse highlights', _e)
          fullProduct.highlights_list = []
        }
      } else if (Array.isArray(fullProduct.highlights_list)) {
        // Already parsed
      } else {
        fullProduct.highlights_list = []
      }

      // Parse variants colors and overrides
      if (fullProduct.variants) {
        fullProduct.variants.forEach((v: any) => {
          if (!v.colors) {
            const names = (v.color_name || '').split(',')
            const codes = (v.color_code || '').split(',')
            const images = (v.cover_image_url || '').split(',')
            v.colors = names.map((name: string, i: number) => ({
              name: name.trim(),
              code: codes[i]?.trim() || '#000000',
              image: images[i]?.trim() || ''
            }))
          }
          if (!v.photo_collection) {
            v.photo_collection = []
          }
          v.url_slug = v.url_slug || ''
          v.stock_quantity = v.stock_quantity ?? 0

          // Variant specs overrides
          v.weight = v.weight || null
          v.dimensions = v.dimensions || ''
          v.wheelbase = v.wheelbase || null
          v.seat_height = v.seat_height || null
          v.ground_clearance = v.ground_clearance || null
          v.fuel_capacity = v.fuel_capacity || null
          v.tire_size = v.tire_size || ''
          v.showSpecs = !!v.showSpecs
        })
      } else {
        fullProduct.variants = [
          {
            id: null,
            price: null,
            version_name: '',
            color_name: '',
            color_code: '#000000',
            colors: [{ name: '', code: '#000000', image: '' }],
            sku: '',
            photo_collection: [],
            url_slug: '',
            stock_quantity: 0,
            weight: null,
            dimensions: '',
            wheelbase: null,
            seat_height: null,
            ground_clearance: null,
            fuel_capacity: null,
            tire_size: '',
            showSpecs: false
          }
        ]
      }

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

      // Serialize highlights list to JSON string
      if (formData.value.highlights_list) {
        formData.value.highlights = JSON.stringify(formData.value.highlights_list)
      } else {
        formData.value.highlights = '[]'
      }

      // Format variants colors into comma-separated strings for backend compatibility
      if (formData.value.variants) {
        formData.value.variants = formData.value.variants.map((v: any) => {
          const colors = v.colors || []
          const color_name = colors.map((c: any) => (c.name || '').trim()).join(',')
          const color_code = colors.map((c: any) => (c.code || '').trim()).join(',')
          const cover_image_url = colors.map((c: any) => (c.image || '').trim()).join(',')

          return {
            ...v,
            color_name,
            color_code,
            cover_image_url
          }
        })
      }

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

  const addVariant = () => {
    if (!formData.value.variants) {
      formData.value.variants = []
    }
    formData.value.variants.push({
      id: null,
      price: null,
      version_name: '',
      color_name: '',
      color_code: '#000000',
      colors: [{ name: '', code: '#000000', image: '' }],
      sku: '',
      photo_collection: [],
      url_slug: '',
      stock_quantity: 0,
      weight: null,
      dimensions: '',
      wheelbase: null,
      seat_height: null,
      ground_clearance: null,
      fuel_capacity: null,
      tire_size: '',
      showSpecs: false
    })
  }

  const removeVariant = (index: number) => {
    if (formData.value.variants) {
      formData.value.variants.splice(index, 1)
      if (formData.value.variants.length === 0) {
        addVariant()
      }
    }
  }

  const addColor = (variant: any) => {
    if (!variant.colors) {
      variant.colors = []
    }
    variant.colors.push({ name: '', code: '#000000', image: '' })
  }

  const removeColor = (variant: any, index: number) => {
    if (variant.colors) {
      variant.colors.splice(index, 1)
      if (variant.colors.length === 0) {
        addColor(variant)
      }
    }
  }

  const handleSearch = (params: any) => {
    const filters = []
    if (params.name) filters.push(`Name@=${params.name}`)
    if (params.brand) filters.push(`brand@=${params.brand}`)

    if (params.category_id) {
      if (Array.isArray(params.category_id) && params.category_id.length > 0) {
        const catFilters = params.category_id.map((id: number) => `category_id==${id}`).join('|')
        filters.push(catFilters)
      } else if (!Array.isArray(params.category_id)) {
        filters.push(`category_id==${params.category_id}`)
      }
    }

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

  // --- Compatible Vehicles Fetching & Search Logic ---
  const allVehicles = ref<any[]>([])
  const isVehiclesLoading = ref(false)

  const vehicleCategoryIds = computed(() => {
    return categories.value
      .filter((cat) => {
        const findCategoryRecursive = (cId: number): boolean => {
          const c = categories.value.find((x) => x.id === cId)
          if (!c) return false
          const currentName = c.name.toLowerCase()
          const vehicleKeywords = [
            'xe máy',
            'xe',
            'vehicle',
            'motor',
            'mô tô',
            'scooter',
            'tay ga',
            'tay côn'
          ]
          if (vehicleKeywords.some((kw) => currentName.includes(kw))) return true
          if (c.parentId) return findCategoryRecursive(c.parentId)
          return false
        }
        return findCategoryRecursive(cat.id)
      })
      .map((cat) => cat.id)
  })

  const fetchVehicles = async () => {
    isVehiclesLoading.value = true
    try {
      const res = await ProductApi.getList({
        current: 1,
        size: 1000
      })
      const ids = vehicleCategoryIds.value
      allVehicles.value = (res.items || []).filter((p: any) => ids.includes(p.category_id))
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
    } finally {
      isVehiclesLoading.value = false
    }
  }

  watch(categories, () => {
    if (categories.value.length > 0) {
      fetchVehicles()
    }
  })

  const vehicleSearch = ref('')
  const filteredVehicles = computed(() => {
    if (!vehicleSearch.value) return []
    return allVehicles.value
      .filter((v) => v.name.toLowerCase().includes(vehicleSearch.value.toLowerCase()))
      .slice(0, 10)
  })

  const getVehicleName = (id: number) => {
    return allVehicles.value.find((v) => v.id === id)?.name || `ID: ${id}`
  }

  const addCompatibleVehicle = (id: number) => {
    if (!formData.value.compatible_vehicle_model_ids) {
      formData.value.compatible_vehicle_model_ids = []
    }
    if (!formData.value.compatible_vehicle_model_ids.includes(id)) {
      formData.value.compatible_vehicle_model_ids.push(id)
    }
    vehicleSearch.value = ''
  }

  const removeCompatibleVehicle = (id: number) => {
    if (formData.value.compatible_vehicle_model_ids) {
      formData.value.compatible_vehicle_model_ids =
        formData.value.compatible_vehicle_model_ids.filter((vId: number) => vId !== id)
    }
  }

  const toggleTechnology = (tech: any) => {
    if (!formData.value.highlights_list) {
      formData.value.highlights_list = []
    }

    const techId = Number(tech.id)
    const existingIndex = formData.value.highlights_list.findIndex(
      (h: any) => Number(h.technologyId || h.technology_id) === techId
    )

    if (existingIndex >= 0) {
      formData.value.highlights_list.splice(existingIndex, 1)
      selectedTechIds.value = selectedTechIds.value.filter((id) => Number(id) !== techId)
    } else {
      formData.value.highlights_list.push({
        technologyId: tech.id,
        technology_id: tech.id,
        customTitle: tech.defaultTitle || tech.name,
        custom_title: tech.defaultTitle || tech.name,
        customDescription: tech.defaultDescription || '',
        custom_description: tech.defaultDescription || '',
        customImageUrl: tech.defaultImageUrl || '',
        custom_image_url: tech.defaultImageUrl || '',
        title: tech.defaultTitle || tech.name,
        description: tech.defaultDescription || '',
        image: tech.defaultImageUrl || '',
        _defaultTitle: tech.defaultTitle,
        _defaultDescription: tech.defaultDescription,
        _defaultImageUrl: tech.defaultImageUrl,
        _categoryName: tech.categoryName || 'TECHNOLOGY'
      })
      if (!selectedTechIds.value.includes(techId)) {
        selectedTechIds.value.push(techId)
      }
    }
  }

  const isTechnologySelected = (techId: number) => {
    if (!formData.value.highlights_list) return false
    return formData.value.highlights_list.some(
      (h: any) => Number(h.technologyId || h.technology_id) === Number(techId)
    )
  }

  fetchCategories()
  fetchBrands()

  return {
    categories,
    categoryTree,
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
    isVehicle,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
    addVariant,
    removeVariant,
    addColor,
    removeColor,

    vehicleSearch,
    filteredVehicles,
    isVehiclesLoading,
    getVehicleName,
    addCompatibleVehicle,
    removeCompatibleVehicle,
    toggleTechnology,
    isTechnologySelected
  }
}
