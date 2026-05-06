<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { usePaginatedQuery } from '@composables/usePaginatedQuery'
import { useCategoryStore } from '@stores/category.store'
import { useBrandStore } from '@stores/brand.store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import productService from '@application/services/product.service'
import Input from '@components/ui/input/BaseInput.vue'
import Textarea from '@components/ui/input/BaseTextarea.vue'
import Dropdown from '@components/ui/input/BaseDropdown.vue'
import Button from '@components/ui/button/BaseButton.vue'
import SmallNoBgButton from '@components/ui/button/SmallNoBgButton.vue'
import BaseImage from '@components/ui/input/BaseImage.vue'
import GroupImage from '@components/ui/input/GroupImage.vue'
import LoadingOverlay from '../ui/LoadingOverlay.vue'
import DraggableModal from '../ui/DraggableModal.vue'
import IconTrash from '@/assets/icons/IconTrash.svg'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg'
import { Permissions } from '@constants/permissions'
import { usePermission } from '@composables/usePermission'
import { useToast } from 'vue-toastification'
import { generateVariantSlug, slugify } from '@/utils/slug'
import { debounce } from 'lodash-es'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isRefreshing: {
    type: Boolean,
    default: false,
  },
})

const { hasPermission } = usePermission()

const brandStore = useBrandStore()
const categoryStore = useCategoryStore()

const emit = defineEmits(['update:modelValue'])
const {
  data: categoriesData,
  isLoading: isCategoriesLoading,
  pagination: categoryPagination,
} = usePaginatedQuery({
  queryKey: ['productCategories'],
  queryFn: (query) => categoryStore.fetchCategories(query),
  useLocalPagination: true,
  itemsPerPage: 10,
  queryOptions: { staleTime: 5 * 60 * 1000 },
})

const {
  data: brandsData,
  isLoading: isBrandsLoading,
  pagination: brandPagination,
} = usePaginatedQuery({
  queryKey: ['brands'],
  queryFn: (query) => brandStore.fetchBrands(query),
  useLocalPagination: true,
  itemsPerPage: 10,
  queryOptions: { staleTime: 5 * 60 * 1000 },
})

const { data: allOptionsData, isLoading: isOptionsLoading } = useQuery({
  queryKey: ['productAllOptions'],
  queryFn: () => productService.getOptions(),
  staleTime: 5 * 60 * 1000,
})

const queryClient = useQueryClient()
const toast = useToast()

const { data: technologiesData, isLoading: isTechnologiesLoading } = useQuery({
  queryKey: ['technologies'],
  queryFn: () => productService.getTechnologies(),
  staleTime: 5 * 60 * 1000,
})

const { data: techCategoriesData } = useQuery({
  queryKey: ['techCategories'],
  queryFn: () => productService.getTechnologyCategories(),
  staleTime: 10 * 60 * 1000,
})

const groupedTechnologies = computed(() => {
  const techs = technologiesData.value || []
  const groups = {}
  
  const currentBrandId = localProduct.value.brand_id
  const brandNameMap = new Map(brandOptions.value.map(b => [b.value, b.text]))
  const currentBrandName = brandNameMap.get(currentBrandId) || 'Hãng'

  // Special group for brand-specific technologies
  const brandGroupName = `Công nghệ đặc trưng của ${currentBrandName}`
  
  techs.forEach(t => {
    let cat = t.categoryName || 'Khác'
    
    // If tech belongs to the current selected brand, put it in the priority group
    if (t.brandId && t.brandId === currentBrandId) {
      cat = brandGroupName
    } else if (t.brandId) {
      // If it belongs to ANOTHER brand, hide it from current view to avoid confusion
      return
    }

    if (!groups[cat]) groups[cat] = []
    groups[cat].push(t)
  })
  
  // Sort groups: Priority group first
  const sortedGroups = {}
  if (groups[brandGroupName]) {
    sortedGroups[brandGroupName] = groups[brandGroupName]
    delete groups[brandGroupName]
  }
  
  Object.keys(groups).sort().forEach(key => {
    sortedGroups[key] = groups[key]
  })

  return sortedGroups
})

// New Technology Modal State
const showAddTechModal = ref(false)
const isAddingCategory = ref(false)
const newTech = ref({
  name: '',
  categoryId: '',
  newCategoryName: '',
  defaultTitle: '',
  defaultDescription: '',
  defaultImageUrl: ''
})

const createTechMutation = useMutation({
  mutationFn: async (payload) => {
    let finalCategoryId = payload.categoryId
    if (isAddingCategory.value && payload.newCategoryName) {
      const cat = await productService.createTechnologyCategory({ name: payload.newCategoryName })
      finalCategoryId = cat.id
    }
    return productService.createTechnology({
      name: payload.name,
      categoryId: finalCategoryId,
      brandId: isVehicle.value ? localProduct.value.brand_id : null,
      defaultTitle: payload.defaultTitle || payload.name,
      defaultDescription: payload.defaultDescription,
      defaultImageUrl: payload.defaultImageUrl
    })
  },
  onMutate: async (newTechData) => {
    // 1. Cancel outgoing refetches (don't await to avoid blocking)
    queryClient.cancelQueries({ queryKey: ['technologies'] })
    
    // 2. Snapshot the previous value
    const previousTechs = queryClient.getQueryData(['technologies'])
    
    // 3. Optimistically update to the new value
    const tempId = Date.now()
    const optimisticTech = { 
      id: tempId, 
      name: newTechData.name, 
      category: { name: techCategoryOptions.value.find(c => c.value === newTechData.categoryId)?.text || 'Đang tạo...' },
      isOptimistic: true 
    }
    queryClient.setQueryData(['technologies'], (old) => [...(old || []), optimisticTech])
    
    return { previousTechs, tempId }
  },
  onSuccess: (data, variables, context) => {
    // Replace optimistic item with real data
    queryClient.setQueryData(['technologies'], (old) => 
      old.map(t => t.id === context.tempId ? data : t)
    )
    
    queryClient.invalidateQueries(['technologies'])
    queryClient.invalidateQueries(['techCategories'])
    toast.success('Đã thêm công nghệ mới thành công!')
    toggleTechnology(data)
    resetNewTech()
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousTechs) {
      queryClient.setQueryData(['technologies'], context.previousTechs)
    }
    toast.error('Lỗi khi thêm công nghệ: ' + (err.response?.data?.message || err.message))
    showAddTechModal.value = true // Re-open if failed
  }
})

const resetNewTech = () => {
  newTech.value = {
    name: '',
    categoryId: '',
    newCategoryName: '',
    defaultTitle: '',
    defaultDescription: '',
    defaultImageUrl: ''
  }
  isAddingCategory.value = false
}

const handleAddTech = () => {
  if (!newTech.value.name) {
    toast.warning('Vui lòng nhập tên công nghệ')
    return
  }
  if (!isAddingCategory.value && !newTech.value.categoryId) {
    toast.warning('Vui lòng chọn danh mục')
    return
  }
  if (isAddingCategory.value && !newTech.value.newCategoryName) {
    toast.warning('Vui lòng nhập tên danh mục mới')
    return
  }
  
  // SILENT & IMMEDIATE ACTION
  const payload = JSON.parse(JSON.stringify(newTech.value)) // Clone data
  showAddTechModal.value = false // Close modal IMMEDIATELY
  createTechMutation.mutate(payload) // Start mutation in background
  resetNewTech() // Reset form immediately
}

const { data: allVehiclesData, isLoading: isVehiclesLoading } = useQuery({
  queryKey: ['allVehicles'],
  queryFn: () => productService.fetchProducts({ pageSize: 1000, categoryId: 1 }), // Assuming ID 1 is Vehicle, or just fetch all and let user search
  staleTime: 5 * 60 * 1000,
})

// Load ALL product categories (not paginated) — used for type detection in form
const { data: allCategoriesData } = useQuery({
  queryKey: ['allProductCategories'],
  queryFn: () => categoryStore.getAllCategories(),
  staleTime: 10 * 60 * 1000,
})

const localProduct = ref({})
const initialDataJson = ref('')
const isUpdatingFromProp = ref(false)
const activeTab = ref('common')

const isVehicle = computed(() => {
  const catId = localProduct.value.category_id;
  if (!catId) return false;

  // Search in the full category list (unaffected by pagination)
  const allCats = allCategoriesData.value || []
  const paginatedCats = categoriesData.value || []
  const cat = allCats.find(c => c.id === catId) || paginatedCats.find(c => c.id === catId);

  const catName = (
    cat?.name ||
    localProduct.value.category || // fallback from API response when editing
    ''
  ).toLowerCase();

  if (!catName) return false;

  // Vehicle keywords (Vietnamese + English)
  const vehicleKeywords = ['xe máy', 'xe máy', 'xe', 'vehicle', 'motor', 'mô tô', 'scooter', 'tay ga', 'tay côn']
  return vehicleKeywords.some(kw => catName.includes(kw));
});

const isPart = computed(() => {
  const catId = localProduct.value.category_id;
  if (!catId) return false;
  return !isVehicle.value;
});

const isTypeSelected = computed(() => !!localProduct.value.category_id);

const tabs = computed(() => {
  const t = [
    { id: 'common', label: 'Thông tin chung', icon: 'fa-info-circle' },
  ]

  if (isVehicle.value) {
    t.push({ id: 'specs', label: 'Thông số kỹ thuật', icon: 'fa-cogs' })
    t.push({ id: 'variants', label: 'Phiên bản & Màu sắc', icon: 'fa-tags' })
    t.push({ id: 'tech', label: 'Công nghệ & Tiện ích', icon: 'fa-microchip' })
  } else if (isPart.value) {
    t.push({ id: 'specs', label: 'Đặc tính kỹ thuật', icon: 'fa-tools' })
    t.push({ id: 'compatibility', label: 'Tương thích', icon: 'fa-check-double' })
    t.push({ id: 'variants', label: 'Biến thể & Kho', icon: 'fa-tags' })
    t.push({ id: 'tech', label: 'Tiêu chuẩn chất lượng', icon: 'fa-certificate' })
  } else {
    // Neutral state: show basic variants tab at least
    t.push({ id: 'variants', label: 'Giá & Phân loại', icon: 'fa-tags' })
  }
  
  return t
})

watch([isVehicle, isPart], () => {
  const currentTabExists = tabs.value.some(t => t.id === activeTab.value)
  if (!currentTabExists) {
    activeTab.value = 'common'
  }
})

const optionLabelMap = {
  VehicleType: 'Loại xe',
  Displacement: 'Dung tích xi lanh',
  BrakeSystem: 'Hệ thống phanh',
  Style: 'Kiểu dáng',
  Condition: 'Tình trạng xe',
  ManufactureYear: 'Năm sản xuất',
  Engine: 'Loại động cơ',
  Transmission: 'Hộp số',
  FuelType: 'Loại nhiên liệu',
}

const allAvailableOptions = computed(() => {
  const options = allOptionsData.value?.data || allOptionsData.value || []
  if (!Array.isArray(options)) return []
  
  return options
    .filter(o => {
      const lowerName = o.name?.toLowerCase() || ''
      return lowerName !== 'color' && lowerName !== 'màu sắc' && 
             lowerName !== 'version' && lowerName !== 'phiên bản'
    })
    .map(o => ({
      value: o.name,
      text: optionLabelMap[o.name] || o.name,
      id: o.id,
      values: o.values || o.optionValues || []
    }))
})

const getPredefinedLabel = (key) => {
  return optionLabelMap[key] || key
}

const getOptionValues = (key) => {
  const option = allAvailableOptions.value.find(o => o.value === key)
  return (option?.values || []).map(v => ({
    value: v.name,
    text: v.name
  }))
}

const isDropdownOption = (key) => {
  const lowerKey = key?.toLowerCase() || ''
  return lowerKey === 'vehicletype' || lowerKey === 'loại xe' || 
         lowerKey.includes('loại') || lowerKey.includes('type')
}

const categoryOptions = computed(() => {
  return (categoriesData.value || []).map((c) => ({
    value: c.id,
    text: c.name,
  }))
})

const brandOptions = computed(() => {
  return (brandsData.value || []).map((b) => ({
    value: b.id,
    text: b.name,
  }))
})

const getAvailableOptionsForVariant = (variant, currentKey) => {
  const usedKeys = Object.keys(variant.optionValues || {})
  return allAvailableOptions.value.filter((opt) => {
    return opt.value === currentKey || !usedKeys.includes(opt.value)
  })
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (isUpdatingFromProp.value) return;

    // Fast check to avoid expensive stringify
    if (newVal?.id === localProduct.value?.id && 
        newVal?.updated_at === localProduct.value?.updated_at &&
        initialDataJson.value) {
      return
    }

    isUpdatingFromProp.value = true
    const copy = JSON.parse(JSON.stringify(newVal || {}))

    copy.category_id = copy.category_id || ''
    copy.brand_id = copy.brand_id || ''

    const parseNumeric = (val) => {
      if (val === null || val === undefined || val === '') return null
      if (typeof val === 'number') return val
      const sanitized = val.toString().replace(/[^\d.]/g, '')
      const num = parseFloat(sanitized)
      return isNaN(num) ? null : num
    }

    copy.weight = parseNumeric(copy.weight)
    copy.wheelbase = parseNumeric(copy.wheelbase)
    copy.seat_height = parseNumeric(copy.seat_height)
    copy.ground_clearance = parseNumeric(copy.ground_clearance)
    copy.fuel_capacity = parseNumeric(copy.fuel_capacity)
    copy.oil_capacity = parseNumeric(copy.oil_capacity)
    copy.displacement = parseNumeric(copy.displacement)
    copy.std_dot = !!copy.std_dot
    copy.std_ece = !!copy.std_ece
    copy.std_snell = !!copy.std_snell
    copy.std_jis = !!copy.std_jis
    copy.material = copy.material || ''
    copy.origin = copy.origin || ''
    copy.warranty_period = copy.warranty_period || ''
    copy.unit = copy.unit || ''
    copy.other_standards = copy.other_standards || ''

    // --- COMPATIBILITY ---
    if (!copy.compatible_vehicle_model_ids) {
      copy.compatible_vehicle_model_ids = []
    }
    // ---------------------

    if (!copy.variants || copy.variants.length === 0) {
      copy.variants = [
        {
          id: null,
          price: null,
          optionValues: {},
          cover_image_url: '',
          photo_collection: [],
          version_name: '',
          color_name: '',
          color_code: '#000000',
          colors: [{ name: '', code: '#000000', image: '' }],
          sku: '',
          url: '',
          // --- OVERRIDABLE SPECS ---
          weight: null,
          dimensions: '',
          wheelbase: null,
          seat_height: null,
          ground_clearance: null,
          fuel_capacity: null,
          tire_size: '',
          front_brake: '',
          rear_brake: '',
          front_suspension: '',
          rear_suspension: '',
          engine_type: '',
          stock_quantity: null,
          // -------------------------
        },
      ]
    } else {
      copy.variants.forEach((v) => {
        if (!v.photo_collection) v.photo_collection = []
        if (!v.cover_image_url) v.cover_image_url = ''
        if (!v.optionValues) v.optionValues = {}
        if (v.version_name === undefined) v.version_name = ''
        if (v.color_name === undefined) v.color_name = ''
        if (v.color_code === undefined) v.color_code = '#000000'
        if (!v.colors) {
          const names = v.color_name.split(',')
          const codes = v.color_code.split(',')
          const images = (v.cover_image_url || '').split(',')
          v.colors = names.map((name, i) => ({
            name: name.trim(),
            code: codes[i]?.trim() || '#000000',
            image: images[i]?.trim() || ''
          }))
        }
        if (v.sku === undefined) v.sku = ''
        v.is_sku_manual = !!v.sku // Mark as manual if SKU exists
        if (!v.url) v.url = generateVariantSlug(copy.name, v.optionValues, v.version_name, v.color_name, v.price)
        
        // --- OVERRIDABLE SPECS ---
        v.weight = parseNumeric(v.weight)
        v.wheelbase = parseNumeric(v.wheelbase)
        v.seat_height = parseNumeric(v.seat_height)
        v.ground_clearance = parseNumeric(v.ground_clearance)
        v.fuel_capacity = parseNumeric(v.fuel_capacity)
        v.tire_size = v.tire_size || ''
        v.dimensions = v.dimensions || ''
        v.front_brake = v.front_brake || ''
        v.rear_brake = v.rear_brake || ''
        v.front_suspension = v.front_suspension || ''
        v.rear_suspension = v.rear_suspension || ''
        v.engine_type = v.engine_type || ''
        v.stock_quantity = parseNumeric(v.stock_quantity)
        // -------------------------
      })
    }

    // Parse highlights
    try {
      if (copy.highlights && typeof copy.highlights === 'string') {
        copy.highlights_list = JSON.parse(copy.highlights)
      } else if (Array.isArray(copy.highlights_list)) {
        // Keep as is if already a list
      } else {
        copy.highlights_list = []
      }
    } catch (e) {
      console.error("Failed to parse highlights", e)
      copy.highlights_list = []
    }

    localProduct.value = copy
    initialDataJson.value = JSON.stringify(copy)
    nextTick(() => {
      isUpdatingFromProp.value = false
    })
  },
  { immediate: true, deep: true },
)

// Debounced emit to avoid freezing UI during fast typing
const debouncedEmit = debounce((newVal) => {
  emit('update:modelValue', newVal)
}, 300)

watch(
  localProduct,
  (newVal) => {
    if (isUpdatingFromProp.value) {
      return
    }
    debouncedEmit(newVal)
  },
  { deep: true },
)

const updateAllVariantSlugs = () => {
  if (localProduct.value.variants) {
    localProduct.value.variants.forEach((v) => {
      if (!props.isEditMode || !v.id || !v.url) {
        v.url = generateVariantSlug(localProduct.value.name, v.optionValues, v.version_name, v.color_name, v.price)
      }
    })
  }
}

watch(
  [
    () => localProduct.value.name,
    () => localProduct.value.variants.map((v) => v.optionValues),
    () => localProduct.value.variants.map((v) => v.version_name),
    () => localProduct.value.variants.map((v) => v.color_name),
    () => localProduct.value.variants.map((v) => v.price),
  ],
  updateAllVariantSlugs,
  {
    deep: true,
  }
)

const addVariantOption = (variant) => {
  if (!variant.optionValues) {
    variant.optionValues = {}
  }
  const usedKeys = Object.keys(variant.optionValues)
  const nextOption = allAvailableOptions.value.find((o) => !usedKeys.includes(o.value))
  if (nextOption) {
    variant.optionValues[nextOption.value] = ''
  }
}

const removeVariantOption = (variant, key) => {
  delete variant.optionValues[key]
}

const changeOptionKey = (variant, oldKey, newKey) => {
  if (oldKey === newKey) return
  const oldValue = variant.optionValues[oldKey] || ''
  delete variant.optionValues[oldKey]
  variant.optionValues[newKey] = oldValue
}

const generateSKU = (name, version, color) => {
  const sanitize = (str) => {
    if (!str) return ''
    return str
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-') // Replace non-alphanumeric with -
      .replace(/-+/g, '-') // Collapse multiple -
      .replace(/^-|-$/g, '') // Trim -
  }

  const parts = [sanitize(name), sanitize(version), sanitize(color)].filter(
    (p) => !!p
  )
  return parts.join('-')
}

// Watch for SKU auto-generation
watch(
  [
    () => localProduct.value.name,
    () => localProduct.value.variants?.map((v) => v.version_name),
    () => localProduct.value.variants?.map((v) => v.color_name),
  ],
  () => {
    if (!localProduct.value.variants) return
    localProduct.value.variants.forEach((variant) => {
      if (!variant.is_sku_manual) {
        const colorNames = variant.colors?.map(c => c.name).filter(n => !!n).join('-')
        const newSKU = generateSKU(
          localProduct.value.name,
          variant.version_name,
          colorNames
        )
        if (newSKU) {
          variant.sku = newSKU
        }
      }
    })
  },
  { deep: true }
)

const addVariant = () => {
  const newVariant = {
    id: null,
    price: null,
    optionValues: {},
    cover_image_url: '',
    photo_collection: [],
    version_name: '',
    color_name: '',
    color_code: '#000000',
    colors: [{ name: '', code: '#000000', image: '' }],
    sku: '',
    is_sku_manual: false,
    url: '',
  }

  newVariant.url = generateVariantSlug(localProduct.value.name, newVariant.optionValues, newVariant.version_name, newVariant.color_name, newVariant.price)
  localProduct.value.variants.push(newVariant)
}

const colorMap = {
  'đỏ': '#FF0000',
  'xanh': '#0000FF',
  'trắng': '#FFFFFF',
  'đen': '#000000',
  'bạc': '#C0C0C0',
  'xám': '#808080',
  'vàng': '#FFFF00',
  'cam': '#FFA500',
  'tím': '#800080',
  'hồng': '#FFC0CB',
  'nâu': '#A52A2A',
}

const autoUpdateColorCode = (variant, colorIndex) => {
  const color = variant.colors[colorIndex]
  if (!color.name) return
  const name = color.name.toLowerCase()
  for (const [key, code] of Object.entries(colorMap)) {
    if (name.includes(key)) {
      color.code = code
      break
    }
  }
}

watch(
  () => localProduct.value.variants?.map((v) => v.colors?.map(c => c.name)),
  (newVal, oldVal) => {
    if (!newVal) return
    newVal.forEach((variantColors, vIndex) => {
      variantColors?.forEach((name, cIndex) => {
        const oldName = oldVal?.[vIndex]?.[cIndex]
        if (name !== oldName) {
          autoUpdateColorCode(localProduct.value.variants[vIndex], cIndex)
        }
      })
    })
  },
  { deep: true },
)

const addColor = (variant) => {
  variant.colors.push({ name: '', code: '#000000', image: '' })
}

const removeColor = (variant, index) => {
  variant.colors.splice(index, 1)
  if (variant.colors.length === 0) {
    addColor(variant)
  }
}
const removeVariant = (index) => {
  localProduct.value.variants.splice(index, 1)
  if (localProduct.value.variants.length === 0) {
    addVariant()
  }
}

const getVariantErrors = (index) => {
  const vErrors = props.errors?.variants?.[index] || {}
  // Also check for collection-level errors mapped to this index if any
  const combinationError = props.errors?._backend?.['variants'] || ''
  return {
    ...vErrors,
    combination: index === 0 ? combinationError : '', // Show collection error only once
    version_name: vErrors.version_name || vErrors.versionname || '',
    color_name: vErrors.color_name || vErrors.colorname || '',
    sku: vErrors.sku || '',
    price: vErrors.price || '',
    url: vErrors.url || '',
  }
}

// Technologies logic
const toggleTechnology = (tech) => {
  if (!localProduct.value.highlights_list) localProduct.value.highlights_list = []
  
  const existingIndex = localProduct.value.highlights_list.findIndex(h => h.technologyId === tech.id)
  
  if (existingIndex >= 0) {
    localProduct.value.highlights_list.splice(existingIndex, 1)
  } else {
    localProduct.value.highlights_list.push({
      technologyId: tech.id,
      customTitle: tech.defaultTitle || tech.name,
      customDescription: tech.defaultDescription || '', // Auto-fill from image data
      customImageUrl: tech.defaultImageUrl || '',
      // Store default info for rendering purposes
      _defaultTitle: tech.defaultTitle,
      _defaultDescription: tech.defaultDescription,
      _defaultImageUrl: tech.defaultImageUrl,
      _categoryName: tech.categoryName
    })
  }
  
  // localProduct.value.highlights = JSON.stringify(localProduct.value.highlights_list) // Removed redundant call, handled by watch
}

const isTechnologySelected = (techId) => {
  if (!localProduct.value.highlights_list) return false
  return localProduct.value.highlights_list.some(h => h.technologyId === techId)
}

watch(
  () => localProduct.value.highlights_list,
  (newVal) => {
    if (newVal) {
      const jsonString = JSON.stringify(newVal)
      if (localProduct.value.highlights !== jsonString) {
        localProduct.value.highlights = jsonString
      }
    }
  },
  { deep: true }
)

const showLoadingOverlay = computed(() => props.isSaving || props.isRefreshing)
const loadingMessage = computed(() => (props.isSaving ? 'Đang lưu...' : 'Đang tải dữ liệu...'))

// Compatibility Logic
const vehicleSearch = ref('')
const filteredVehicles = computed(() => {
  if (!vehicleSearch.value) return []
  const list = allVehiclesData.value?.items || allVehiclesData.value || []
  return list.filter(v => v.name.toLowerCase().includes(vehicleSearch.value.toLowerCase())).slice(0, 10)
})

const getVehicleName = (id) => {
  const list = allVehiclesData.value?.items || allVehiclesData.value || []
  return list.find(v => v.id === id)?.name || `ID: ${id}`
}

const addCompatibleVehicle = (id) => {
  if (!localProduct.value.compatible_vehicle_model_ids) {
    localProduct.value.compatible_vehicle_model_ids = []
  }
  if (!localProduct.value.compatible_vehicle_model_ids.includes(id)) {
    localProduct.value.compatible_vehicle_model_ids.push(id)
  }
  vehicleSearch.value = ''
}

const removeCompatibleVehicle = (id) => {
  localProduct.value.compatible_vehicle_model_ids = localProduct.value.compatible_vehicle_model_ids.filter(vId => vId !== id)
}
</script>

<template>
  <LoadingOverlay :show="showLoadingOverlay" :message="loadingMessage" :isFullPage="false" />
  
  <!-- Tab Navigation -->
  <div class="flex border-b border-gray-200 sticky top-0 bg-white z-20 px-6 overflow-x-auto overflow-y-hidden no-scrollbar shadow-sm w-full">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      type="button"
      @click="activeTab = tab.id"
      class="px-5 py-4 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 -mb-[1px]"
      :class="activeTab === tab.id 
        ? 'border-primary-600 text-primary-600 bg-primary-50/30' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
    >
      <i :class="['fas', tab.icon]"></i>
      {{ tab.label }}
    </button>
  </div>

  <form @submit.prevent id="product-form">
    <div class="space-y-4 px-6 pt-6 pb-10">
      <!-- 1. TAB: THÔNG TIN CHUNG -->
      <div v-show="activeTab === 'common'">
        <legend class="px-2 font-semibold text-gray-700">Thông tin chung</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Dropdown
              label="Danh Mục *"
              v-model="localProduct.category_id"
              :selected-label="localProduct.category"
              :options="categoryOptions"
              :pagination="categoryPagination"
              :loading="isCategoriesLoading"
              :error="errors?.category_id"
              placeholder="Chọn Danh Mục"
              required
            />
          </div>
          <div>
            <Dropdown
              label="Thương Hiệu"
              v-model="localProduct.brand_id"
              :selected-label="localProduct.brand"
              :options="brandOptions"
              :pagination="brandPagination"
              :loading="isBrandsLoading"
              placeholder="Chọn Thương Hiệu"
            />
          </div>
          <div>
            <Input
              :label="!isTypeSelected ? 'Tên Sản Phẩm *' : (isVehicle ? 'Tên Xe / Dòng Xe *' : 'Tên Phụ Tùng / Phụ Kiện *')"
              v-model="localProduct.name"
              :placeholder="!isTypeSelected ? 'Nhập tên sản phẩm...' : (isVehicle ? 'Ví dụ: Honda Winner X' : 'Ví dụ: Nhông sên dĩa DID')"
              :error="errors?.name"
              required
            />
          </div>
          <div>
            <Input
              label="Tiêu đề SEO (Meta Title)"
              v-model="localProduct.meta_title"
              placeholder="Tối ưu cho công cụ tìm kiếm"
              :error="errors?.meta_title"
            />
          </div>
          <div class="md:col-span-2">
            <Textarea
              label="Mô tả SEO (Meta Description)"
              v-model="localProduct.meta_description"
              placeholder="Nhập mô tả SEO..."
              :rows="2"
              :error="errors?.meta_description"
            />
          </div>
          <div class="md:col-span-2">
            <Textarea
              label="Mô tả ngắn (Short Description)"
              v-model="localProduct.short_description"
              placeholder="Nhập mô tả ngắn hiển thị trên Store..."
              :rows="2"
              :error="errors?.short_description"
            />
          </div>
          <div class="md:col-span-2">
            <Textarea
              label="Mô Tả Sản Phẩm"
              v-model="localProduct.description"
              placeholder="Nhập mô tả chi tiết..."
              :rows="3"
            />
          </div>
        </div>
      </div>

      <!-- 2. TAB: TƯƠNG THÍCH (Chỉ cho Phụ tùng) -->
      <div v-if="isPart" v-show="activeTab === 'compatibility'">
        <fieldset class="border rounded-xl p-6 bg-blue-50/20 border-blue-100 shadow-sm">
          <legend class="px-3 font-bold text-blue-700 flex items-center gap-2">
            <i class="fas fa-check-double"></i>
            Ma trận Tương thích (Compatibility Matrix)
          </legend>
          <p class="text-sm text-gray-600 mb-6 italic">QUAN TRỌNG: Chọn các dòng xe mà món phụ tùng này có thể lắp vừa. Hệ thống sẽ dùng dữ liệu này để gợi ý sản phẩm liên quan.</p>
        
        <div class="space-y-4">
          <div class="relative">
            <Input 
              label="Tìm kiếm xe tương thích"
              v-model="vehicleSearch"
              placeholder="Nhập tên xe để tìm..."
              :loading="isVehiclesLoading"
            />
            
            <div v-if="vehicleSearch && filteredVehicles.length > 0" class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              <div 
                v-for="v in filteredVehicles" 
                :key="v.id"
                class="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                @click="addCompatibleVehicle(v.id)"
              >
                <span>{{ v.name }}</span>
                <span v-if="localProduct.compatible_vehicle_model_ids?.includes(v.id)" class="text-xs text-blue-600 font-medium">Đã chọn</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <div 
              v-for="id in localProduct.compatible_vehicle_model_ids" 
              :key="id"
              class="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-sm font-medium border border-blue-200"
            >
              <span>{{ getVehicleName(id) }}</span>
              <button 
                type="button" 
                @click="removeCompatibleVehicle(id)"
                class="hover:text-blue-600 text-blue-400"
              >
                &times;
              </button>
            </div>
            <div v-if="!localProduct.compatible_vehicle_model_ids?.length" class="text-gray-400 text-sm italic py-2">
              Chưa có xe nào được chọn.
            </div>
          </div>
        </div>
      </fieldset>
    </div>

    <!-- 3. TAB: THÔNG SỐ KỸ THUẬT -->
      <div v-show="activeTab === 'specs'">
        <!-- VEHICLE SPECS -->
        <div v-if="isVehicle" class="space-y-6">
          <fieldset class="border rounded-xl p-6 bg-white shadow-sm border-gray-200">
            <legend class="px-3 font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-motorcycle text-primary-500"></i>
              Thiết lập Thông số gốc (Root Specs)
            </legend>
            
            <div class="space-y-8 mt-2">
              <!-- 1. Kích thước & Trọng lượng -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  1. Kích thước & Trọng lượng
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="Kích thước (D x R x C) (mm)" v-model="localProduct.dimensions" placeholder="ví dụ: 1.925 x 705 x 1.120 mm" />
                  <Input label="Khoảng cách trục bánh xe (mm)" type="number" v-model.number="localProduct.wheelbase" placeholder="ví dụ: 1276" />
                  <Input label="Độ cao yên (mm)" type="number" v-model.number="localProduct.seat_height" placeholder="ví dụ: 790" />
                  <Input label="Khoảng sáng gầm xe (mm)" type="number" v-model.number="localProduct.ground_clearance" placeholder="ví dụ: 135" />
                  <Input label="Trọng lượng bản thân (kg)" type="number" v-model.number="localProduct.weight" placeholder="ví dụ: 112" />
                  <Input label="Dung tích bình xăng (lít)" type="number" step="0.1" v-model.number="localProduct.fuel_capacity" placeholder="ví dụ: 4.5" />
                </div>
              </div>

              <!-- 2. Động cơ & Truyền động -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  2. Động cơ & Truyền động
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="Loại động cơ" v-model="localProduct.engine_type" placeholder="ví dụ: 4 kỳ, 1 xi-lanh, SOHC" class="md:col-span-2" />
                  <Input label="Dung tích xy-lanh (cc)" type="number" step="0.1" v-model.number="localProduct.displacement" placeholder="ví dụ: 149.3" />
                  <Input label="Đường kính x Hành trình piston (mm)" v-model="localProduct.bore_stroke" placeholder="ví dụ: 57,3 x 57,9" />
                  <Input label="Tỷ số nén" v-model="localProduct.compression_ratio" placeholder="ví dụ: 10,6:1" />
                  <Input label="Công suất tối đa" v-model="localProduct.max_power" placeholder="ví dụ: 11,3 kW / 8.500 vòng/phút" />
                  <Input label="Moment xoắn cực đại" v-model="localProduct.max_torque" placeholder="ví dụ: 13,8 Nm / 7.000 vòng/phút" />
                  <Input label="Hệ thống cung cấp nhiên liệu" v-model="localProduct.fuel_system" placeholder="ví dụ: Phun xăng điện tử (FI)" />
                  <Input label="Loại truyền động (Hộp số)" v-model="localProduct.transmission_type" placeholder="ví dụ: Côn tay 6 số" />
                  <Input label="Hệ thống khởi động" v-model="localProduct.starter_system" placeholder="ví dụ: Điện / Đạp chân" />
                  <Input label="Mức tiêu thụ nhiên liệu" v-model="localProduct.fuel_consumption" placeholder="ví dụ: 2,1 lít / 100km" />
                  <Input label="Dung tích nhớt máy (lít)" type="number" step="0.1" v-model.number="localProduct.oil_capacity" placeholder="ví dụ: 0.8" />
                </div>
              </div>

              <!-- 3. Khung xe, Hệ thống treo & Phanh -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  3. Khung xe, Hệ thống treo & Phanh
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="Loại khung xe" v-model="localProduct.frame_type" placeholder="ví dụ: Khung ống thép" />
                  <Input label="Phuộc trước" v-model="localProduct.front_suspension" placeholder="ví dụ: Ống lồng" />
                  <Input label="Phuộc sau" v-model="localProduct.rear_suspension" placeholder="ví dụ: Lò xo trụ đôi" />
                  <Input label="Kích cỡ lốp trước" v-model="localProduct.front_tire_size" placeholder="ví dụ: 90/80-17" />
                  <Input label="Kích cỡ lốp sau" v-model="localProduct.rear_tire_size" placeholder="ví dụ: 120/70-17" />
                  <Input label="Phanh trước" v-model="localProduct.front_brake" placeholder="ví dụ: Phanh đĩa (ABS)" />
                  <Input label="Phanh sau" v-model="localProduct.rear_brake" placeholder="ví dụ: Phanh đĩa" />
                </div>
              </div>

              <!-- 4. Hệ thống điện -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  4. Hệ thống điện
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="Loại ắc quy" v-model="localProduct.battery_type" placeholder="ví dụ: 12V - 5Ah" />
                  <Input label="Hệ thống chiếu sáng" v-model="localProduct.lighting_system" placeholder="ví dụ: LED" />
                  <Input label="Đồng hồ hiển thị" v-model="localProduct.dashboard_type" placeholder="ví dụ: LCD" />
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <!-- SPARE PARTS SPECS -->
        <div v-else class="space-y-6">
          <fieldset class="border rounded-xl p-6 bg-white shadow-sm border-gray-200">
            <legend class="px-3 font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-tools text-primary-500"></i>
              Thông tin đặc tính (Simple Specs)
            </legend>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <Input label="Chất liệu" v-model="localProduct.material" placeholder="ví dụ: Nhôm, Thép, Nhựa ABS..." />
              <Input label="Xuất xứ" v-model="localProduct.origin" placeholder="ví dụ: Thái Lan, Nhật Bản, Việt Nam..." />
              <Input label="Thời gian bảo hành" v-model="localProduct.warranty_period" placeholder="ví dụ: 6 tháng, 12 tháng..." />
              <Dropdown 
                label="Đơn vị tính" 
                v-model="localProduct.unit" 
                :options="[{value: 'Cái', text: 'Cái'}, {value: 'Bộ', text: 'Bộ'}, {value: 'Cặp', text: 'Cặp'}, {value: 'Lít', text: 'Lít'}]"
                placeholder="Chọn đơn vị tính"
              />
            </div>
          </fieldset>
        </div>
      </div>

      <!-- 4. TAB: CÔNG NGHỆ / TIÊU CHUẨN -->
      <div v-show="activeTab === 'tech'">
        <fieldset class="border rounded-xl p-6 bg-white shadow-sm border-gray-200">
          <legend class="px-3 font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-microchip text-primary-500"></i>
            {{ isVehicle ? 'Công nghệ & Tiện ích' : 'Tiêu chuẩn & Chất lượng' }}
          </legend>
          
          <div v-if="isVehicle" class="space-y-6">
            <div v-if="isTechnologiesLoading" class="text-sm text-gray-500 flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              Đang tải danh sách công nghệ...
            </div>
            
            <div v-else-if="technologiesData && Array.isArray(technologiesData) && technologiesData.length > 0" class="space-y-8">
              <div v-for="(techs, catName) in groupedTechnologies" :key="catName" class="space-y-4">
                <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  {{ catName }}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div 
                    v-for="tech in techs" 
                    :key="tech.id"
                    class="border rounded-xl p-3.5 cursor-pointer transition-all duration-200 flex items-center justify-between group"
                    :class="isTechnologySelected(tech.id) 
                      ? 'border-primary-500 bg-primary-50/30 shadow-sm ring-1 ring-primary-500/20' 
                      : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'"
                    @click="toggleTechnology(tech)"
                  >
                    <div class="flex items-center gap-3">
                      <div 
                        class="w-5 h-5 rounded border flex items-center justify-center transition-colors"
                        :class="isTechnologySelected(tech.id) ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 group-hover:border-primary-400'"
                      >
                        <i v-if="isTechnologySelected(tech.id)" class="fas fa-check text-[10px] text-white"></i>
                      </div>
                      <span class="text-sm font-semibold" :class="isTechnologySelected(tech.id) ? 'text-primary-900' : 'text-gray-700'">{{ tech.name }}</span>
                    </div>
                    
                    <div v-if="isTechnologySelected(tech.id)" class="text-primary-600">
                      <i class="fas fa-circle-check text-sm"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action button for new tech -->
              <div class="pt-4 border-t border-dashed">
                <button 
                  type="button"
                  @click="showAddTechModal = true"
                  class="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2.5 rounded-xl transition-colors border border-primary-100"
                >
                  <i class="fas fa-plus-circle"></i>
                  Bổ sung công nghệ mới chưa có trong danh sách
                </button>
              </div>
            </div>

            <!-- Selected Technologies Override section -->
            <div v-if="localProduct.highlights_list && localProduct.highlights_list.length > 0" class="mt-8 space-y-6">
              <h4 class="font-medium text-gray-900 border-b pb-2 italic text-sm">Tùy chỉnh nội dung công nghệ cho xe này (Hiện trên Web)</h4>
              
              <div v-for="(hl, hlIdx) in localProduct.highlights_list" :key="hlIdx" class="p-4 border rounded-xl bg-gray-50/30 relative group">
                <div class="flex items-center gap-2 mb-4">
                  <span class="bg-primary-100 text-primary-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{{ hl._categoryName }}</span>
                  <span class="font-bold text-gray-800">{{ (Array.isArray(technologiesData) ? technologiesData : [])?.find(t => t.id === hl.technologyId)?.name || 'Unknown' }}</span>
                </div>

                <div class="flex flex-col lg:flex-row gap-4">
                  <div class="flex-1 space-y-3">
                    <Input
                      label="Tiêu đề tùy chỉnh"
                      v-model="hl.customTitle"
                      :placeholder="hl._defaultTitle"
                      size="sm"
                    />
                    <Textarea
                      label="Mô tả tùy chỉnh"
                      v-model="hl.customDescription"
                      :placeholder="hl._defaultDescription"
                      :rows="2"
                      size="sm"
                    />
                  </div>
                  <div class="w-full lg:w-48">
                    <BaseImage
                      label="Ảnh tùy chỉnh"
                      v-model="hl.customImageUrl"
                      bucket="highlights"
                      class="h-32"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-6">
            <p class="text-sm text-gray-500 italic">Thiết lập các tiêu chuẩn an toàn và chứng nhận chất lượng cho phụ tùng/phụ kiện.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_dot" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">Tiêu chuẩn DOT</div>
                    <div class="text-xs text-gray-500">Tiêu chuẩn an toàn của Bộ Giao thông vận tải Hoa Kỳ.</div>
                  </div>
                </div>
              </div>
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_ece" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">Tiêu chuẩn ECE</div>
                    <div class="text-xs text-gray-500">Tiêu chuẩn an toàn của Ủy ban Kinh tế Châu Âu.</div>
                  </div>
                </div>
              </div>
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_snell" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">Tiêu chuẩn SNELL</div>
                    <div class="text-xs text-gray-500">Tiêu chuẩn an toàn cao cấp dành cho nón bảo hiểm đua.</div>
                  </div>
                </div>
              </div>
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_jis" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">Tiêu chuẩn JIS</div>
                    <div class="text-xs text-gray-500">Tiêu chuẩn công nghiệp Nhật Bản.</div>
                  </div>
                </div>
              </div>
            </div>
            <Input label="Tiêu chuẩn khác" v-model="localProduct.other_standards" placeholder="ví dụ: TCVN, AS/NZS..." />
          </div>
        </fieldset>
      </div>

      <!-- 5. TAB: BIẾN THỂ & KHO -->
      <div v-show="activeTab === 'variants'">
        <fieldset class="border rounded-xl p-6 bg-white shadow-sm border-gray-200">
          <legend class="px-3 font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-tags text-primary-500"></i>
            Quản lý Biến thể & Kho hàng
          </legend>

          <div
            v-if="typeof props.errors?.variants === 'string'"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
          >
            <span class="block sm:inline whitespace-pre-line">{{ props.errors.variants }}</span>
          </div>
          
          <div class="space-y-6 mt-4">
            <div
              v-for="(variant, index) in localProduct.variants"
              :key="index"
              class="border rounded-2xl p-6 bg-gray-50/50 relative border-gray-200 hover:border-primary-200 transition-colors"
            >
              <SmallNoBgButton
                v-if="localProduct.variants.length > 1 && hasPermission(Permissions.ProductsEdit)"
                color="red"
                @click="removeVariant(index)"
                class="absolute top-4 right-4"
                :icon="IconTrash"
              >
                Xóa
              </SmallNoBgButton>

              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {{ index + 1 }}
                </div>
                <h4 class="font-bold text-xl text-gray-800">Biến thể #{{ index + 1 }}</h4>
              </div>

              <!-- General Variant Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Input
                  :label="isVehicle ? 'Tên phiên bản *' : 'Kích thước / Loại *'"
                  v-model="variant.version_name"
                  :placeholder="isVehicle ? 'ví dụ: Tiêu chuẩn, Đặc biệt...' : 'ví dụ: Size L, Bộ 3 món...'"
                  :error="getVariantErrors(index).version_name"
                  required
                />
                <Input
                  label="Mã SKU *"
                  v-model="variant.sku"
                  placeholder="Mã định danh duy nhất"
                  :error="getVariantErrors(index).sku"
                  required
                  @input="variant.is_sku_manual = true"
                />
                <Input
                  label="Giá Bán (VNĐ) *"
                  type="number"
                  v-model.number="variant.price"
                  placeholder="0"
                  :error="getVariantErrors(index).price"
                  required
                />
              </div>

              <!-- VEHICLE SPECIFIC: OVERRIDING LOGIC -->
              <div v-if="isVehicle" class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <i class="fas fa-edit text-blue-500 text-xs"></i>
                  <label class="text-sm font-bold text-gray-700">Ghi đè thông số kỹ thuật (Spec Overriding)</label>
                  <button 
                    type="button" 
                    @click="variant.showSpecs = !variant.showSpecs"
                    class="text-xs text-primary-600 hover:underline font-medium ml-2"
                  >
                    {{ variant.showSpecs ? 'Thu gọn' : 'Thiết lập ghi đè' }}
                  </button>
                </div>
                
                <div v-if="variant.showSpecs" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 border rounded-2xl bg-blue-50/10 border-blue-100 shadow-inner">
                  <Input label="Trọng lượng (kg)" type="number" v-model.number="variant.weight" placeholder="Dùng gốc" />
                  <Input label="Kích thước" v-model="variant.dimensions" placeholder="Dùng gốc" />
                  <Input label="Trục bánh xe (mm)" type="number" v-model.number="variant.wheelbase" />
                  <Input label="Độ cao yên (mm)" type="number" v-model.number="variant.seat_height" />
                  <Input label="Khoảng sáng gầm (mm)" type="number" v-model.number="variant.ground_clearance" />
                  <Input label="Dung tích xăng (lít)" type="number" step="0.1" v-model.number="variant.fuel_capacity" />
                  <Input label="Kích cỡ lốp" v-model="variant.tire_size" placeholder="Dùng gốc" />
                  <div class="md:col-span-3 text-[11px] text-blue-600 italic bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-2">
                    <i class="fas fa-info-circle"></i>
                    Các trường để trống hệ thống sẽ tự động lấy từ Thông số gốc (Root Specs).
                  </div>
                </div>
              </div>

              <!-- COLOR & GALLERY CONFIG -->
              <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <i class="fas fa-palette text-pink-500 text-xs"></i>
                  <label class="text-sm font-bold text-gray-700">{{ isVehicle ? 'Bộ sưu tập Hình ảnh theo Màu' : 'Màu sắc & Hình ảnh' }}</label>
                </div>
                
                <div class="space-y-6 p-6 border rounded-2xl bg-white shadow-sm border-gray-100">
                  <div v-for="(color, cIndex) in variant.colors" :key="cIndex" class="p-5 border border-gray-50 rounded-2xl bg-gray-50/30">
                    <div class="flex flex-col lg:flex-row gap-8">
                      <!-- Color Info -->
                      <div class="flex-1 space-y-4">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cấu hình màu #{{ cIndex + 1 }}</span>
                          <SmallNoBgButton
                            v-if="variant.colors.length > 1"
                            color="red"
                            @click="removeColor(variant, cIndex)"
                            :icon="IconTrash"
                            size="sm"
                          >
                            Xóa màu
                          </SmallNoBgButton>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Tên màu sắc *"
                            v-model="color.name"
                            placeholder="ví dụ: Đỏ nhám"
                            :error="cIndex === 0 ? getVariantErrors(index).color_name : ''"
                            required
                          />
                          <div class="flex flex-col">
                            <label class="text-sm font-medium text-gray-700 mb-1">Mã màu hiển thị</label>
                            <div class="flex gap-3 items-center h-11 px-3 border rounded-xl bg-white shadow-inner">
                              <input
                                type="color"
                                v-model="color.code"
                                class="h-8 w-12 border-none rounded-lg cursor-pointer p-0 bg-transparent shadow-sm"
                              />
                              <span class="text-xs font-mono text-gray-400 uppercase tracking-widest">{{ color.code }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Color Image -->
                      <div class="w-full lg:w-72">
                        <BaseImage
                          :label="isVehicle ? 'Ảnh đại diện màu này *' : 'Ảnh sản phẩm *'"
                          v-model="color.image"
                          bucket="cover"
                          class="h-40"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    text="Thêm tùy chọn màu sắc mới"
                    color="gray"
                    size="md"
                    @click="addColor(variant)"
                    :icon="IconPlus"
                    class="w-full border-dashed py-4 rounded-xl hover:bg-gray-50"
                  />
                </div>
              </div>

              <!-- OTHER DETAILS -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Input
                  label="URL Slug (SEO) *"
                  v-model="variant.url"
                  placeholder="ten-san-pham-bien-the"
                  :error="getVariantErrors(index).url"
                  @blur="variant.url = slugify(variant.url)"
                />
                <Input
                  v-if="!isVehicle"
                  label="Số lượng tồn kho (Khởi tạo)"
                  type="number"
                  v-model.number="variant.stock_quantity"
                  placeholder="Nhập số lượng hiện có"
                />
              </div>

              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <i class="fas fa-images text-purple-500 text-xs"></i>
                  <label class="text-sm font-bold text-gray-700">Bộ sưu tập ảnh chi tiết (Gallery)</label>
                </div>
                <GroupImage
                  v-model="variant.photo_collection"
                  class="w-full"
                  bucket="photo-collection"
                />
              </div>
            </div>
          </div>
          <Button
            v-if="hasPermission(Permissions.ProductsEdit)"
            text="Thêm biến thể / phiên bản mới"
            color="blue"
            @click="addVariant"
            class="mt-6 w-full py-4 rounded-2xl shadow-lg shadow-blue-100"
            :icon="IconPlus"
          />
        </fieldset>
      </div>
    </div>
  </form>

  <!-- MODAL: THÊM CÔNG NGHỆ MỚI -->
  <DraggableModal
    v-if="showAddTechModal"
    title="Bổ sung công nghệ mới vào hệ thống"
    width="600px"
    @close="showAddTechModal = false"
    :isLoading="createTechMutation.isPending"
  >
    <template #body>
      <div class="space-y-5">
        <p class="text-sm text-gray-500 italic">Lưu ý: Công nghệ bạn thêm ở đây sẽ được lưu vào danh mục chung của hệ thống để sử dụng cho các xe khác sau này.</p>
        
        <Input 
          label="Tên công nghệ (Ví dụ: Honda E-Clutch) *"
          v-model="newTech.name"
          placeholder="Nhập tên công nghệ..."
          required
        />

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-sm font-bold text-gray-700">Danh mục nhóm *</label>
            <button 
              type="button" 
              @click="isAddingCategory = !isAddingCategory"
              class="text-xs text-primary-600 font-bold hover:underline"
            >
              {{ isAddingCategory ? 'Chọn danh mục có sẵn' : '+ Tạo nhóm mới' }}
            </button>
          </div>

          <Dropdown 
            v-if="!isAddingCategory"
            v-model="newTech.categoryId"
            :options="(techCategoriesData || []).map(c => ({ value: c.id, text: c.name }))"
            placeholder="Chọn nhóm công nghệ (An toàn, Tiện ích...)"
          />
          <Input 
            v-else
            v-model="newTech.newCategoryName"
            placeholder="Nhập tên nhóm mới (Ví dụ: Kết nối thông minh)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <Input 
            label="Tiêu đề hiển thị (Mặc định)"
            v-model="newTech.defaultTitle"
            placeholder="Để trống sẽ dùng tên công nghệ"
          />
          <BaseImage 
            label="Ảnh minh họa (Mặc định)"
            v-model="newTech.defaultImageUrl"
            bucket="highlights"
          />
          <div class="md:col-span-2">
            <Textarea 
              label="Mô tả công nghệ (Mặc định)"
              v-model="newTech.defaultDescription"
              placeholder="Giải thích ngắn gọn về công nghệ này..."
              :rows="3"
            />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex gap-3">
        <Button text="Hủy" color="gray" @click="showAddTechModal = false" />
        <Button 
          text="Lưu & Áp dụng" 
          color="primary" 
          @click="handleAddTech"
          :loading="createTechMutation.isPending"
        />
      </div>
    </template>
  </DraggableModal>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>





