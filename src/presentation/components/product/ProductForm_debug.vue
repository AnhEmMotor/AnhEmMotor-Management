<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { usePaginatedQuery } from '@composables/usePaginatedQuery'
import { useCategoryStore } from '@stores/category.store'
import { useBrandStore } from '@stores/brand.store'
import { useQuery } from '@tanstack/vue-query'
import productService from '@application/services/product.service'
import Input from '@components/ui/input/BaseInput.vue'
import Textarea from '@components/ui/input/BaseTextarea.vue'
import Dropdown from '@components/ui/input/BaseDropdown.vue'
import Button from '@components/ui/button/BaseButton.vue'
import SmallNoBgButton from '@components/ui/button/SmallNoBgButton.vue'
import BaseImage from '@components/ui/input/BaseImage.vue'
import GroupImage from '@components/ui/input/GroupImage.vue'
import LoadingOverlay from '../ui/LoadingOverlay.vue'
import IconTrash from '@/assets/icons/IconTrash.svg'
import IconPlus from '@/assets/icons/IconPlus.svg'
import { Permissions } from '@constants/permissions'
import { usePermission } from '@composables/usePermission'
import { generateVariantSlug, slugify } from '@/utils/slug'

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
  queryKey: ['categories'],
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

const { data: technologiesData, isLoading: isTechnologiesLoading } = useQuery({
  queryKey: ['technologies'],
  queryFn: () => productService.getTechnologies(),
  staleTime: 5 * 60 * 1000,
})

const { data: allVehiclesData, isLoading: isVehiclesLoading } = useQuery({
  queryKey: ['allVehicles'],
  queryFn: () => productService.fetchProducts({ pageSize: 1000, categoryId: 1 }), // Assuming ID 1 is Vehicle, or just fetch all and let user search
  staleTime: 5 * 60 * 1000,
})

const localProduct = ref({})
const initialDataJson = ref('')
const isUpdatingFromProp = ref(false)
const activeTab = ref('common')

const isVehicle = computed(() => {
  const catId = localProduct.value.category_id;
  const cat = categoryStore.categories?.find(c => c.id === catId);
  const catName = (cat?.name || localProduct.value.category || '').toLowerCase();
  // Simple heuristic for vehicle detection
  return catName.includes('xe') || catName.includes('vehicle') || catName.includes('motor');
});

const isPart = computed(() => !isVehicle.value);

const tabs = computed(() => {
  const t = [
    { id: 'common', label: 'ThÃ´ng tin chung', icon: 'fa-info-circle' },
    { id: 'specs', label: 'ThÃ´ng sá»‘ ká»¹ thuáº­t', icon: 'fa-cogs' },
    { id: 'variants', label: 'Biáº¿n thá»ƒ & GiÃ¡', icon: 'fa-tags' },
    { id: 'tech', label: isVehicle.value ? 'CÃ´ng nghá»‡' : 'TiÃªu chuáº©n', icon: 'fa-microchip' },
  ]
  
  if (isPart.value) {
    t.splice(2, 0, { id: 'compatibility', label: 'TÆ°Æ¡ng thÃ­ch', icon: 'fa-check-double' })
  }
  
  return t
})

const optionLabelMap = {
  VehicleType: 'Loáº¡i xe',
  Displacement: 'Dung tÃ­ch xi lanh',
  BrakeSystem: 'Há»‡ thá»‘ng phanh',
  Style: 'Kiá»ƒu dÃ¡ng',
  Condition: 'TÃ¬nh tráº¡ng xe',
  ManufactureYear: 'NÄƒm sáº£n xuáº¥t',
  Engine: 'Loáº¡i Ä‘á»™ng cÆ¡',
  Transmission: 'Há»™p sá»‘',
  FuelType: 'Loáº¡i nhiÃªn liá»‡u',
}

const allAvailableOptions = computed(() => {
  const options = allOptionsData.value?.data || allOptionsData.value || []
  if (!Array.isArray(options)) return []
  
  return options
    .filter(o => {
      const lowerName = o.name?.toLowerCase() || ''
      return lowerName !== 'color' && lowerName !== 'mÃ u sáº¯c' && 
             lowerName !== 'version' && lowerName !== 'phiÃªn báº£n'
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
  return lowerKey === 'vehicletype' || lowerKey === 'loáº¡i xe' || 
         lowerKey.includes('loáº¡i') || lowerKey.includes('type')
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
    if (JSON.stringify(newVal) === JSON.stringify(localProduct.value)) {
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
        if (!v.url) v.url = generateVariantSlug(localProduct.value.name, v.optionValues, v.version_name, v.color_name, v.price)
        
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

watch(
  localProduct,
  (newVal) => {
    if (isUpdatingFromProp.value) {
      return
    }
    emit('update:modelValue', newVal)
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
  'Ä‘á»': '#FF0000',
  'xanh': '#0000FF',
  'tráº¯ng': '#FFFFFF',
  'Ä‘en': '#000000',
  'báº¡c': '#C0C0C0',
  'xÃ¡m': '#808080',
  'vÃ ng': '#FFFF00',
  'cam': '#FFA500',
  'tÃ­m': '#800080',
  'há»“ng': '#FFC0CB',
  'nÃ¢u': '#A52A2A',
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
      customTitle: '',
      customDescription: '',
      customImageUrl: '',
      // Store default info for rendering purposes
      _defaultTitle: tech.defaultTitle,
      _defaultDescription: tech.defaultDescription,
      _defaultImageUrl: tech.defaultImageUrl,
      _categoryName: tech.categoryName
    })
  }
  
  localProduct.value.highlights = JSON.stringify(localProduct.value.highlights_list)
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
const loadingMessage = computed(() => (props.isSaving ? 'Äang lÆ°u...' : 'Äang táº£i dá»¯ liá»‡u...'))

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
  <LoadingOverlay :show="showLoadingOverlay" :message="loadingMessage" />
  
  <!-- Tab Navigation -->
  <div class="flex border-b border-gray-200 mb-6 sticky top-0 bg-white z-10 px-1 pt-1 overflow-x-auto no-scrollbar">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      type="button"
      @click="activeTab = tab.id"
      class="px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2"
      :class="activeTab === tab.id 
        ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
    >
      <i :class="['fas', tab.icon]"></i>
      {{ tab.label }}
    </button>
  </div>

  <form @submit.prevent id="product-form">
    <div class="space-y-4 px-1 pr-2 pb-10">
      <!-- 1. TAB: THÃ”NG TIN CHUNG -->
      <div v-show="activeTab === 'common'">
        <legend class="px-2 font-semibold text-gray-700">ThÃ´ng tin chung</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              :label="isVehicle ? 'TÃªn Xe / DÃ²ng Xe *' : 'TÃªn Phá»¥ TÃ¹ng / Phá»¥ Kiá»‡n *'"
              v-model="localProduct.name"
              :placeholder="isVehicle ? 'VÃ­ dá»¥: Honda Winner X' : 'VÃ­ dá»¥: NhÃ´ng sÃªn dÄ©a DID'"
              :error="errors?.name"
              required
            />
          </div>
          <div>
            <Input
              label="TiÃªu Ä‘á» SEO (Meta Title)"
              v-model="localProduct.meta_title"
              placeholder="Tá»‘i Æ°u cho cÃ´ng cá»¥ tÃ¬m kiáº¿m"
              :error="errors?.meta_title"
            />
          </div>
          <div class="md:col-span-2">
            <Textarea
              label="MÃ´ táº£ SEO (Meta Description)"
              v-model="localProduct.meta_description"
              placeholder="Nháº­p mÃ´ táº£ SEO..."
              :rows="2"
              :error="errors?.meta_description"
            />
          </div>
          <div class="md:col-span-2">
            <Textarea
              label="MÃ´ táº£ ngáº¯n (Short Description)"
              v-model="localProduct.short_description"
              placeholder="Nháº­p mÃ´ táº£ ngáº¯n hiá»ƒn thá»‹ trÃªn Store..."
              :rows="2"
              :error="errors?.short_description"
            />
          </div>
          <div>
            <Dropdown
              label="Danh Má»¥c *"
              v-model="localProduct.category_id"
              :selected-label="localProduct.category"
              :options="categoryOptions"
              :pagination="categoryPagination"
              :loading="isCategoriesLoading"
              :error="errors?.category_id"
              placeholder="Chá»n Danh Má»¥c"
              required
            />
          </div>
          <div>
            <Dropdown
              label="ThÆ°Æ¡ng Hiá»‡u"
              v-model="localProduct.brand_id"
              :selected-label="localProduct.brand"
              :options="brandOptions"
              :pagination="brandPagination"
              :loading="isBrandsLoading"
              placeholder="Chá»n ThÆ°Æ¡ng Hiá»‡u"
            />
          </div>
          <div class="md:col-span-2">
            <Textarea
              label="MÃ´ Táº£ Sáº£n Pháº©m"
              v-model="localProduct.description"
              placeholder="Nháº­p mÃ´ táº£ chi tiáº¿t..."
              :rows="3"
            />
          </div>
        </div>
      </div>

      <!-- 2. TAB: TÆ¯Æ NG THÃCH (Chá»‰ cho Phá»¥ tÃ¹ng) -->
      <div v-if="isPart" v-show="activeTab === 'compatibility'">
        <fieldset class="border rounded-xl p-6 bg-blue-50/20 border-blue-100 shadow-sm">
          <legend class="px-3 font-bold text-blue-700 flex items-center gap-2">
            <i class="fas fa-check-double"></i>
            Ma tráº­n TÆ°Æ¡ng thÃ­ch (Compatibility Matrix)
          </legend>
          <p class="text-sm text-gray-600 mb-6 italic">QUAN TRá»ŒNG: Chá»n cÃ¡c dÃ²ng xe mÃ  mÃ³n phá»¥ tÃ¹ng nÃ y cÃ³ thá»ƒ láº¯p vá»«a. Há»‡ thá»‘ng sáº½ dÃ¹ng dá»¯ liá»‡u nÃ y Ä‘á»ƒ gá»£i Ã½ sáº£n pháº©m liÃªn quan.</p>
        
        <div class="space-y-4">
          <div class="relative">
            <Input 
              label="TÃ¬m kiáº¿m xe tÆ°Æ¡ng thÃ­ch"
              v-model="vehicleSearch"
              placeholder="Nháº­p tÃªn xe Ä‘á»ƒ tÃ¬m..."
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
                <span v-if="localProduct.compatible_vehicle_model_ids?.includes(v.id)" class="text-xs text-blue-600 font-medium">ÄÃ£ chá»n</span>
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
              ChÆ°a cÃ³ xe nÃ o Ä‘Æ°á»£c chá»n.
            </div>
          </div>
        </div>
      </div>

      <!-- 3. TAB: THÃ”NG Sá» Ká»¸ THUáº¬T -->
      <div v-show="activeTab === 'specs'">
        <!-- VEHICLE SPECS -->
        <div v-if="isVehicle" class="space-y-6">
          <fieldset class="border rounded-xl p-6 bg-white shadow-sm border-gray-200">
            <legend class="px-3 font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-motorcycle text-primary-500"></i>
              Thiáº¿t láº­p ThÃ´ng sá»‘ gá»‘c (Root Specs)
            </legend>
            
            <div class="space-y-8 mt-2">
              <!-- 1. KÃ­ch thÆ°á»›c & Trá»ng lÆ°á»£ng -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  1. KÃ­ch thÆ°á»›c & Trá»ng lÆ°á»£ng
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="KÃ­ch thÆ°á»›c (D x R x C) (mm)" v-model="localProduct.dimensions" placeholder="vÃ­ dá»¥: 1.925 x 705 x 1.120 mm" />
                  <Input label="Khoáº£ng cÃ¡ch trá»¥c bÃ¡nh xe (mm)" type="number" v-model.number="localProduct.wheelbase" placeholder="vÃ­ dá»¥: 1276" />
                  <Input label="Äá»™ cao yÃªn (mm)" type="number" v-model.number="localProduct.seat_height" placeholder="vÃ­ dá»¥: 790" />
                  <Input label="Khoáº£ng sÃ¡ng gáº§m xe (mm)" type="number" v-model.number="localProduct.ground_clearance" placeholder="vÃ­ dá»¥: 135" />
                  <Input label="Trá»ng lÆ°á»£ng báº£n thÃ¢n (kg)" type="number" v-model.number="localProduct.weight" placeholder="vÃ­ dá»¥: 112" />
                  <Input label="Dung tÃ­ch bÃ¬nh xÄƒng (lÃ­t)" type="number" step="0.1" v-model.number="localProduct.fuel_capacity" placeholder="vÃ­ dá»¥: 4.5" />
                </div>
              </div>

              <!-- 2. Äá»™ng cÆ¡ & Truyá»n Ä‘á»™ng -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  2. Äá»™ng cÆ¡ & Truyá»n Ä‘á»™ng
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="Loáº¡i Ä‘á»™ng cÆ¡" v-model="localProduct.engine_type" placeholder="vÃ­ dá»¥: 4 ká»³, 1 xi-lanh, SOHC" class="md:col-span-2" />
                  <Input label="Dung tÃ­ch xy-lanh (cc)" type="number" step="0.1" v-model.number="localProduct.displacement" placeholder="vÃ­ dá»¥: 149.3" />
                  <Input label="ÄÆ°á»ng kÃ­nh x HÃ nh trÃ¬nh piston (mm)" v-model="localProduct.bore_stroke" placeholder="vÃ­ dá»¥: 57,3 x 57,9" />
                  <Input label="Tá»· sá»‘ nÃ©n" v-model="localProduct.compression_ratio" placeholder="vÃ­ dá»¥: 10,6:1" />
                  <Input label="CÃ´ng suáº¥t tá»‘i Ä‘a" v-model="localProduct.max_power" placeholder="vÃ­ dá»¥: 11,3 kW / 8.500 vÃ²ng/phÃºt" />
                  <Input label="Moment xoáº¯n cá»±c Ä‘áº¡i" v-model="localProduct.max_torque" placeholder="vÃ­ dá»¥: 13,8 Nm / 7.000 vÃ²ng/phÃºt" />
                  <Input label="Há»‡ thá»‘ng cung cáº¥p nhiÃªn liá»‡u" v-model="localProduct.fuel_system" placeholder="vÃ­ dá»¥: Phun xÄƒng Ä‘iá»‡n tá»­ (FI)" />
                  <Input label="Loáº¡i truyá»n Ä‘á»™ng (Há»™p sá»‘)" v-model="localProduct.transmission_type" placeholder="vÃ­ dá»¥: CÃ´n tay 6 sá»‘" />
                  <Input label="Há»‡ thá»‘ng khá»Ÿi Ä‘á»™ng" v-model="localProduct.starter_system" placeholder="vÃ­ dá»¥: Äiá»‡n / Äáº¡p chÃ¢n" />
                  <Input label="Má»©c tiÃªu thá»¥ nhiÃªn liá»‡u" v-model="localProduct.fuel_consumption" placeholder="vÃ­ dá»¥: 2,1 lÃ­t / 100km" />
                  <Input label="Dung tÃ­ch nhá»›t mÃ¡y (lÃ­t)" type="number" step="0.1" v-model.number="localProduct.oil_capacity" placeholder="vÃ­ dá»¥: 0.8" />
                </div>
              </div>

              <!-- 3. Khung xe, Há»‡ thá»‘ng treo & Phanh -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  3. Khung xe, Há»‡ thá»‘ng treo & Phanh
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="Loáº¡i khung xe" v-model="localProduct.frame_type" placeholder="vÃ­ dá»¥: Khung á»‘ng thÃ©p" />
                  <Input label="Phuá»™c trÆ°á»›c" v-model="localProduct.front_suspension" placeholder="vÃ­ dá»¥: á»ng lá»“ng" />
                  <Input label="Phuá»™c sau" v-model="localProduct.rear_suspension" placeholder="vÃ­ dá»¥: LÃ² xo trá»¥ Ä‘Ã´i" />
                  <Input label="KÃ­ch cá»¡ lá»‘p trÆ°á»›c" v-model="localProduct.front_tire_size" placeholder="vÃ­ dá»¥: 90/80-17" />
                  <Input label="KÃ­ch cá»¡ lá»‘p sau" v-model="localProduct.rear_tire_size" placeholder="vÃ­ dá»¥: 120/70-17" />
                  <Input label="Phanh trÆ°á»›c" v-model="localProduct.front_brake" placeholder="vÃ­ dá»¥: Phanh Ä‘Ä©a (ABS)" />
                  <Input label="Phanh sau" v-model="localProduct.rear_brake" placeholder="vÃ­ dá»¥: Phanh Ä‘Ä©a" />
                </div>
              </div>

              <!-- 4. Há»‡ thá»‘ng Ä‘iá»‡n -->
              <div class="space-y-4">
                <h4 class="text-[11px] font-black text-primary-600 uppercase tracking-widest border-l-4 border-primary-500 pl-3 py-1 bg-primary-50/30">
                  4. Há»‡ thá»‘ng Ä‘iá»‡n
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                  <Input label="Loáº¡i áº¯c quy" v-model="localProduct.battery_type" placeholder="vÃ­ dá»¥: 12V - 5Ah" />
                  <Input label="Há»‡ thá»‘ng chiáº¿u sÃ¡ng" v-model="localProduct.lighting_system" placeholder="vÃ­ dá»¥: LED" />
                  <Input label="Äá»“ng há»“ hiá»ƒn thá»‹" v-model="localProduct.dashboard_type" placeholder="vÃ­ dá»¥: LCD" />
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
              ThÃ´ng tin Ä‘áº·c tÃ­nh (Simple Specs)
            </legend>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <Input label="Cháº¥t liá»‡u" v-model="localProduct.material" placeholder="vÃ­ dá»¥: NhÃ´m, ThÃ©p, Nhá»±a ABS..." />
              <Input label="Xuáº¥t xá»©" v-model="localProduct.origin" placeholder="vÃ­ dá»¥: ThÃ¡i Lan, Nháº­t Báº£n, Viá»‡t Nam..." />
              <Input label="Thá»i gian báº£o hÃ nh" v-model="localProduct.warranty_period" placeholder="vÃ­ dá»¥: 6 thÃ¡ng, 12 thÃ¡ng..." />
              <Dropdown 
                label="ÄÆ¡n vá»‹ tÃ­nh" 
                v-model="localProduct.unit" 
                :options="[{value: 'CÃ¡i', text: 'CÃ¡i'}, {value: 'Bá»™', text: 'Bá»™'}, {value: 'Cáº·p', text: 'Cáº·p'}, {value: 'LÃ­t', text: 'LÃ­t'}]"
                placeholder="Chá»n Ä‘Æ¡n vá»‹ tÃ­nh"
              />
            </div>
          </fieldset>
        </div>
      </div>

      <!-- 4. TAB: CÃ”NG NGHá»† / TIÃŠU CHUáº¨N -->
      <div v-show="activeTab === 'tech'">
        <fieldset class="border rounded-xl p-6 bg-white shadow-sm border-gray-200">
          <legend class="px-3 font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-microchip text-primary-500"></i>
            {{ isVehicle ? 'CÃ´ng nghá»‡ & Tiá»‡n Ã­ch' : 'TiÃªu chuáº©n & Cháº¥t lÆ°á»£ng' }}
          </legend>
          
          <div v-if="isVehicle" class="space-y-6">
            <div v-if="isTechnologiesLoading" class="text-sm text-gray-500 flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              Äang táº£i danh sÃ¡ch cÃ´ng nghá»‡...
            </div>
            
            <div v-else-if="technologiesData && Array.isArray(technologiesData) && technologiesData.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="tech in technologiesData" 
                :key="tech.id"
                class="border rounded-lg p-4 cursor-pointer transition-colors"
                :class="isTechnologySelected(tech.id) ? 'border-primary-500 bg-primary-50/10' : 'border-gray-200 hover:border-primary-300'"
                @click="toggleTechnology(tech)"
              >
                <div class="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    :checked="isTechnologySelected(tech.id)"
                    class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    @click.stop="toggleTechnology(tech)"
                  />
                  <div>
                    <div class="font-medium text-gray-900">{{ tech.name }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ tech.categoryName }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Technologies Override section -->
            <div v-if="localProduct.highlights_list && localProduct.highlights_list.length > 0" class="mt-8 space-y-6">
              <h4 class="font-medium text-gray-900 border-b pb-2 italic text-sm">TÃ¹y chá»‰nh ná»™i dung cÃ´ng nghá»‡ cho xe nÃ y (Hiá»‡n trÃªn Web)</h4>
              
              <div v-for="(hl, hlIdx) in localProduct.highlights_list" :key="hlIdx" class="p-4 border rounded-xl bg-gray-50/30 relative group">
                <div class="flex items-center gap-2 mb-4">
                  <span class="bg-primary-100 text-primary-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{{ hl._categoryName }}</span>
                  <span class="font-bold text-gray-800">{{ (Array.isArray(technologiesData) ? technologiesData : [])?.find(t => t.id === hl.technologyId)?.name || 'Unknown' }}</span>
                </div>

                <div class="flex flex-col lg:flex-row gap-4">
                  <div class="flex-1 space-y-3">
                    <Input
                      label="TiÃªu Ä‘á» tÃ¹y chá»‰nh"
                      v-model="hl.customTitle"
                      :placeholder="hl._defaultTitle"
                      size="sm"
                    />
                    <Textarea
                      label="MÃ´ táº£ tÃ¹y chá»‰nh"
                      v-model="hl.customDescription"
                      :placeholder="hl._defaultDescription"
                      :rows="2"
                      size="sm"
                    />
                  </div>
                  <div class="w-full lg:w-48">
                    <BaseImage
                      label="áº¢nh tÃ¹y chá»‰nh"
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
            <p class="text-sm text-gray-500 italic">Thiáº¿t láº­p cÃ¡c tiÃªu chuáº©n an toÃ n vÃ  chá»©ng nháº­n cháº¥t lÆ°á»£ng cho phá»¥ tÃ¹ng/phá»¥ kiá»‡n.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_dot" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">TiÃªu chuáº©n DOT</div>
                    <div class="text-xs text-gray-500">TiÃªu chuáº©n an toÃ n cá»§a Bá»™ Giao thÃ´ng váº­n táº£i Hoa Ká»³.</div>
                  </div>
                </div>
              </div>
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_ece" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">TiÃªu chuáº©n ECE</div>
                    <div class="text-xs text-gray-500">TiÃªu chuáº©n an toÃ n cá»§a á»¦y ban Kinh táº¿ ChÃ¢u Ã‚u.</div>
                  </div>
                </div>
              </div>
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_snell" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">TiÃªu chuáº©n SNELL</div>
                    <div class="text-xs text-gray-500">TiÃªu chuáº©n an toÃ n cao cáº¥p dÃ nh cho nÃ³n báº£o hiá»ƒm Ä‘ua.</div>
                  </div>
                </div>
              </div>
              <div class="p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50/50">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="localProduct.std_jis" class="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <div class="font-bold">TiÃªu chuáº©n JIS</div>
                    <div class="text-xs text-gray-500">TiÃªu chuáº©n cÃ´ng nghiá»‡p Nháº­t Báº£n.</div>
                  </div>
                </div>
              </div>
            </div>
            <Input label="TiÃªu chuáº©n khÃ¡c" v-model="localProduct.other_standards" placeholder="vÃ­ dá»¥: TCVN, AS/NZS..." />
          </div>
        </fieldset>
      </div>

      <!-- 5. TAB: BIáº¾N THá»‚ & KHO -->
      <div v-show="activeTab === 'variants'">
        <fieldset class="border rounded-xl p-6 bg-white shadow-sm border-gray-200">
          <legend class="px-3 font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-tags text-primary-500"></i>
            Quáº£n lÃ½ Biáº¿n thá»ƒ & Kho hÃ ng
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
                XÃ³a
              </SmallNoBgButton>

              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {{ index + 1 }}
                </div>
                <h4 class="font-bold text-xl text-gray-800">Biáº¿n thá»ƒ #{{ index + 1 }}</h4>
              </div>

              <!-- General Variant Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Input
                  :label="isVehicle ? 'TÃªn phiÃªn báº£n *' : 'KÃ­ch thÆ°á»›c / Loáº¡i *'"
                  v-model="variant.version_name"
                  :placeholder="isVehicle ? 'vÃ­ dá»¥: TiÃªu chuáº©n, Äáº·c biá»‡t...' : 'vÃ­ dá»¥: Size L, Bá»™ 3 mÃ³n...'"
                  :error="getVariantErrors(index).version_name"
                  required
                />
                <Input
                  label="MÃ£ SKU *"
                  v-model="variant.sku"
                  placeholder="MÃ£ Ä‘á»‹nh danh duy nháº¥t"
                  :error="getVariantErrors(index).sku"
                  required
                  @input="variant.is_sku_manual = true"
                />
                <Input
                  label="GiÃ¡ BÃ¡n (VNÄ) *"
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
                  <label class="text-sm font-bold text-gray-700">Ghi Ä‘Ã¨ thÃ´ng sá»‘ ká»¹ thuáº­t (Spec Overriding)</label>
                  <button 
                    type="button" 
                    @click="variant.showSpecs = !variant.showSpecs"
                    class="text-xs text-primary-600 hover:underline font-medium ml-2"
                  >
                    {{ variant.showSpecs ? 'Thu gá»n' : 'Thiáº¿t láº­p ghi Ä‘Ã¨' }}
                  </button>
                </div>
                
                <div v-if="variant.showSpecs" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 border rounded-2xl bg-blue-50/10 border-blue-100 shadow-inner">
                  <Input label="Trá»ng lÆ°á»£ng (kg)" type="number" v-model.number="variant.weight" placeholder="DÃ¹ng gá»‘c" />
                  <Input label="KÃ­ch thÆ°á»›c" v-model="variant.dimensions" placeholder="DÃ¹ng gá»‘c" />
                  <Input label="Trá»¥c bÃ¡nh xe (mm)" type="number" v-model.number="variant.wheelbase" />
                  <Input label="Äá»™ cao yÃªn (mm)" type="number" v-model.number="variant.seat_height" />
                  <Input label="Khoáº£ng sÃ¡ng gáº§m (mm)" type="number" v-model.number="variant.ground_clearance" />
                  <Input label="Dung tÃ­ch xÄƒng (lÃ­t)" type="number" step="0.1" v-model.number="variant.fuel_capacity" />
                  <Input label="KÃ­ch cá»¡ lá»‘p" v-model="variant.tire_size" placeholder="DÃ¹ng gá»‘c" />
                  <div class="md:col-span-3 text-[11px] text-blue-600 italic bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-2">
                    <i class="fas fa-info-circle"></i>
                    CÃ¡c trÆ°á»ng Ä‘á»ƒ trá»‘ng há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng láº¥y tá»« ThÃ´ng sá»‘ gá»‘c (Root Specs).
                  </div>
                </div>
              </div>

              <!-- COLOR & GALLERY CONFIG -->
              <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <i class="fas fa-palette text-pink-500 text-xs"></i>
                  <label class="text-sm font-bold text-gray-700">{{ isVehicle ? 'Bá»™ sÆ°u táº­p HÃ¬nh áº£nh theo MÃ u' : 'MÃ u sáº¯c & HÃ¬nh áº£nh' }}</label>
                </div>
                
                <div class="space-y-6 p-6 border rounded-2xl bg-white shadow-sm border-gray-100">
                  <div v-for="(color, cIndex) in variant.colors" :key="cIndex" class="p-5 border border-gray-50 rounded-2xl bg-gray-50/30">
                    <div class="flex flex-col lg:flex-row gap-8">
                      <!-- Color Info -->
                      <div class="flex-1 space-y-4">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cáº¥u hÃ¬nh mÃ u #{{ cIndex + 1 }}</span>
                          <SmallNoBgButton
                            v-if="variant.colors.length > 1"
                            color="red"
                            @click="removeColor(variant, cIndex)"
                            :icon="IconTrash"
                            size="sm"
                          >
                            XÃ³a mÃ u
                          </SmallNoBgButton>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="TÃªn mÃ u sáº¯c *"
                            v-model="color.name"
                            placeholder="vÃ­ dá»¥: Äá» nhÃ¡m"
                            :error="cIndex === 0 ? getVariantErrors(index).color_name : ''"
                            required
                          />
                          <div class="flex flex-col">
                            <label class="text-sm font-medium text-gray-700 mb-1">MÃ£ mÃ u hiá»ƒn thá»‹</label>
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
                          :label="isVehicle ? 'áº¢nh Ä‘áº¡i diá»‡n mÃ u nÃ y *' : 'áº¢nh sáº£n pháº©m *'"
                          v-model="color.image"
                          bucket="cover"
                          class="h-40"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    text="ThÃªm tÃ¹y chá»n mÃ u sáº¯c má»›i"
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
                <div v-if="!isVehicle" class="flex flex-col">
                  <label class="text-sm font-bold text-gray-700 mb-1">Sá»‘ lÆ°á»£ng tá»“n kho (Khá»Ÿi táº¡o)</label>
                  <Input
                    type="number"
                    v-model.number="variant.stock_quantity"
                    placeholder="Nháº­p sá»‘ lÆ°á»£ng hiá»‡n cÃ³"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <i class="fas fa-images text-purple-500 text-xs"></i>
                  <label class="text-sm font-bold text-gray-700">Bá»™ sÆ°u táº­p áº£nh chi tiáº¿t (Gallery)</label>
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
            text="ThÃªm biáº¿n thá»ƒ / phiÃªn báº£n má»›i"
            color="blue"
            @click="addVariant"
            class="mt-6 w-full py-4 rounded-2xl shadow-lg shadow-blue-100"
            :icon="IconPlus"
          />
        </fieldset>
      </div>
    </div>
  </form>
</template>






