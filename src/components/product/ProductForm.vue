<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useCategoryStore } from '@/stores/category.store'
import { useBrandStore } from '@/stores/brand.store'
import { useQuery } from '@tanstack/vue-query'
import productService from '@application/services/product.service'
import Input from '@/components/ui/input/BaseInput.vue'
import Textarea from '@/components/ui/input/BaseTextarea.vue'
import Dropdown from '@/components/ui/input/BaseDropdown.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import Image from '@/components/ui/input/BaseImage.vue'
import GroupImage from '@/components/ui/input/GroupImage.vue'
import LoadingOverlay from '../ui/LoadingOverlay.vue'
import IconTrash from '@/assets/icons/IconTrash.svg'
import IconPlus from '@/assets/icons/IconPlus.svg'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'
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

const localProduct = ref({})
const initialDataJson = ref('')
const isUpdatingFromProp = ref(false)

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
const loadingMessage = computed(() => (props.isSaving ? 'Đang lưu...' : 'Đang tải dữ liệu...'))
</script>

<template>
  <LoadingOverlay :show="showLoadingOverlay" :message="loadingMessage" />
  <form @submit.prevent id="product-form">
    <div class="space-y-4 px-1 pr-2">
      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Thông tin chung</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Tên Dòng Sản Phẩm *"
              v-model="localProduct.name"
              placeholder="Bắt buộc (ví dụ: 'Honda Air Blade')"
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
          <div class="md:col-span-2">
            <Textarea
              label="Mô Tả Sản Phẩm"
              v-model="localProduct.description"
              placeholder="Nhập mô tả..."
              :rows="3"
            />
          </div>
        </div>
      </fieldset>

      <fieldset class="border rounded-md p-4 bg-white shadow-sm">
        <legend class="px-2 font-bold text-gray-800 flex items-center gap-2">
          <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
          Thông số kỹ thuật
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
              <Input label="Loại động cơ" v-model="localProduct.engine_type" placeholder="ví dụ: 4 kỳ, 1 xi-lanh, SOHC, làm mát bằng dung dịch" class="md:col-span-2" />
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
              <Input label="Loại khung xe" v-model="localProduct.frame_type" placeholder="ví dụ: Khung ống thép, Underbone" />
              <Input label="Phuộc trước" v-model="localProduct.front_suspension" placeholder="ví dụ: Ống lồng, giảm chấn thủy lực" />
              <Input label="Phuộc sau" v-model="localProduct.rear_suspension" placeholder="ví dụ: Lò xo trụ đôi" />
              <Input label="Kích cỡ lốp trước" v-model="localProduct.front_tire_size" placeholder="ví dụ: 90/80-17M/C 46P" />
              <Input label="Kích cỡ lốp sau" v-model="localProduct.rear_tire_size" placeholder="ví dụ: 120/70-17M/C 58P" />
              <Input label="Phanh trước" v-model="localProduct.front_brake" placeholder="ví dụ: Phanh đĩa thủy lực (có ABS)" />
              <Input label="Phanh sau" v-model="localProduct.rear_brake" placeholder="ví dụ: Phanh đĩa" />
              <!-- Keep old tire_size for compatibility if needed, but hidden if new ones are used? 
                   Actually I'll just use the new ones as requested. -->
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
              <Input label="Đồng hồ hiển thị" v-model="localProduct.dashboard_type" placeholder="ví dụ: LCD toàn phần" />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Nổi bật & Công nghệ (Technologies)</legend>
        <div class="space-y-6">
          <div v-if="isTechnologiesLoading" class="text-sm text-gray-500 flex items-center gap-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            Đang tải danh sách công nghệ...
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
          <div v-else-if="!isTechnologiesLoading" class="text-sm text-gray-400 italic py-2">
            Không có dữ liệu công nghệ khả dụng.
          </div>

          <!-- Selected Technologies Override section -->
          <div v-if="localProduct.highlights_list && localProduct.highlights_list.length > 0" class="mt-8 space-y-6">
            <h4 class="font-medium text-gray-900 border-b pb-2">Tùy chỉnh nội dung công nghệ cho xe này</h4>
            
            <div v-for="(hl, hlIdx) in localProduct.highlights_list" :key="hlIdx" class="p-6 border rounded-2xl bg-gray-50/50 relative group">
              <div class="flex items-center gap-2 mb-4 pb-2 border-b">
                <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded font-medium">{{ hl._categoryName }}</span>
                <span class="font-semibold text-lg text-gray-800">Công nghệ: {{ (Array.isArray(technologiesData) ? technologiesData : [])?.find(t => t.id === hl.technologyId)?.name || 'Unknown' }}</span>
              </div>

              <div class="flex flex-col lg:flex-row gap-8">
                <div class="flex-1 space-y-4">
                  <Input
                    label="Tiêu đề tùy chỉnh (Bỏ trống sẽ dùng mặc định)"
                    v-model="hl.customTitle"
                    :placeholder="hl._defaultTitle"
                  />
                  <Textarea
                    label="Mô tả tùy chỉnh (Bỏ trống sẽ dùng mặc định)"
                    v-model="hl.customDescription"
                    :placeholder="hl._defaultDescription"
                    :rows="3"
                  />
                </div>
                <div class="w-full lg:w-72">
                  <Image
                    label="Ảnh tùy chỉnh (Bỏ trống sẽ dùng mặc định)"
                    v-model="hl.customImageUrl"
                    bucket="highlights"
                    class="h-full"
                  />
                  <img v-if="!hl.customImageUrl && hl._defaultImageUrl" :src="hl._defaultImageUrl" class="mt-2 h-20 object-contain rounded opacity-50" title="Ảnh mặc định" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Các biến thể (Variants)</legend>

        <div
          v-if="typeof props.errors?.variants === 'string'"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
        >
          <span class="block sm:inline whitespace-pre-line">{{ props.errors.variants }}</span>
        </div>
        <div
          v-if="typeof props.errors?._backend?.variants === 'string'"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
        >
          <span class="block sm:inline whitespace-pre-line">{{
            props.errors._backend.variants
          }}</span>
        </div>

        <div class="space-y-6">
          <div
            v-for="(variant, index) in localProduct.variants"
            :key="index"
            class="border rounded-lg p-4 bg-gray-50 relative"
          >
            <SmallNoBgButton
              v-if="localProduct.variants.length > 1 && hasPermission(Permissions.ProductsEdit)"
              color="red"
              @click="removeVariant(index)"
              class="absolute top-3 right-3"
              :icon="IconTrash"
            >
              Xóa Biến Thể
            </SmallNoBgButton>

            <h4 class="font-semibold text-lg mb-3">Biến thể #{{ index + 1 }}</h4>

            <div v-if="Object.keys(variant.optionValues || {}).length > 0" class="mb-4 space-y-2">
              <div
                v-for="(value, key) in Object.fromEntries(Object.entries(variant.optionValues).filter(([k]) => {
                  const label = getPredefinedLabel(k).toLowerCase();
                  const keyLower = k.toLowerCase();
                  return keyLower !== 'color' && label !== 'màu sắc' && keyLower !== 'version' && label !== 'phiên bản';
                }))"
                :key="key"
                class="flex flex-col sm:flex-row gap-2 items-start"
              >
                <Dropdown
                  :label="getPredefinedLabel(key)"
                  :model-value="key"
                  :options="getAvailableOptionsForVariant(variant, key)"
                  :loading="isOptionsLoading"
                  placeholder="Chọn thuộc tính"
                  class="flex-1"
                  @update:model-value="(newKey) => changeOptionKey(variant, key, newKey)"
                />
                
                <Dropdown
                  v-if="isDropdownOption(key)"
                  label="Giá trị"
                  :model-value="value"
                  :options="getOptionValues(key)"
                  placeholder="Chọn giá trị"
                  class="flex-1"
                  @update:model-value="(newVal) => (variant.optionValues[key] = newVal)"
                />
                <Input
                  v-else
                  label="Giá trị"
                  :model-value="value"
                  placeholder="ví dụ: 150cc, 2024..."
                  class="flex-1"
                  @update:model-value="(newVal) => (variant.optionValues[key] = newVal)"
                />
                <SmallNoBgButton
                  v-if="hasPermission(Permissions.ProductsEdit)"
                  color="red"
                  @click="removeVariantOption(variant, key)"
                  class="mt-6 sm:mt-7"
                  :icon="IconTrash"
                >
                  Xóa
                </SmallNoBgButton>
              </div>
            </div>

            <Button
              v-if="
                hasPermission(Permissions.ProductsEdit) &&
                Object.keys(variant.optionValues || {}).length < allAvailableOptions.length
              "
              text="Thêm thuộc tính"
              color="gray"
              @click="addVariantOption(variant)"
              class="mb-4"
              :icon="IconPlus"
              size="sm"
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Tên phiên bản *"
                v-model="variant.version_name"
                placeholder="ví dụ: Tiêu chuẩn, Cao cấp..."
                :error="getVariantErrors(index).version_name"
                required
              />
              <Input
                label="Mã SKU *"
                v-model="variant.sku"
                placeholder="ví dụ: VISION-2024-RED"
                :error="getVariantErrors(index).sku"
                required
                @input="variant.is_sku_manual = true"
              />
            </div>

            <div class="mb-6">
              <label class="text-sm font-medium text-gray-700 mb-3 block">Cấu hình màu sắc & hình ảnh tương ứng</label>
              <div class="space-y-6 p-4 border rounded-xl bg-white shadow-sm">
                <div v-for="(color, cIndex) in variant.colors" :key="cIndex" class="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                  <div class="flex flex-col lg:flex-row gap-6">
                    <!-- Color Info -->
                    <div class="flex-1 space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Màu #{{ cIndex + 1 }}</span>
                        <SmallNoBgButton
                          v-if="variant.colors.length > 1"
                          color="red"
                          @click="removeColor(variant, cIndex)"
                          :icon="IconTrash"
                          size="sm"
                        >
                          Xóa
                        </SmallNoBgButton>
                      </div>
                      
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Tên màu sắc *"
                          v-model="color.name"
                          placeholder="ví dụ: Đỏ, Đen..."
                          :error="cIndex === 0 ? getVariantErrors(index).color_name : ''"
                          required
                        />
                        <div class="flex flex-col">
                          <label class="text-sm font-medium text-gray-700 mb-1">Mã màu (Swatch)</label>
                          <div class="flex gap-2 items-center h-11 px-3 border rounded-lg bg-white">
                            <input
                              type="color"
                              v-model="color.code"
                              class="h-7 w-12 border-none rounded cursor-pointer p-0 bg-transparent"
                            />
                            <span class="text-xs font-mono text-gray-500 uppercase">{{ color.code }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Color Image -->
                    <div class="w-full lg:w-80">
                      <Image
                        label="Ảnh xe màu này *"
                        v-model="color.image"
                        bucket="cover"
                        class="h-full"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  text="Thêm màu phối & hình ảnh"
                  color="gray"
                  size="md"
                  @click="addColor(variant)"
                  :icon="IconPlus"
                  class="w-full border-dashed"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Giá Bán *"
                type="number"
                v-model.number="variant.price"
                placeholder="Giá bán"
                :error="getVariantErrors(index).price"
              />
              <Input
                label="URL Slug *"
                v-model="variant.url"
                placeholder="ví dụ: ten-san-pham-thuoc-tinh"
                :error="getVariantErrors(index).url"
                @blur="variant.url = slugify(variant.url)"
              />
            </div>

            <div v-if="getVariantErrors(index).combination" class="text-red-500 text-sm mb-4">
              {{ getVariantErrors(index).combination }}
            </div>

            <div class="grid grid-cols-1">
              <GroupImage
                label="Bộ Sưu Tập Biến Thể (Ảnh chi tiết khác)"
                v-model="variant.photo_collection"
                class="w-full"
                bucket="photo-collection"
              />
            </div>
          </div>
        </div>
        <Button
          v-if="hasPermission(Permissions.ProductsEdit)"
          text="Thêm biến thể"
          color="blue"
          @click="addVariant"
          class="mt-4"
          :icon="IconPlus"
        />
      </fieldset>
    </div>
  </form>
</template>




