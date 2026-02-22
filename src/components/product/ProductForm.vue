<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { fetchCategories } from '@/api/productCategory'
import { fetchBrands } from '@/api/brand'
import { useQuery } from '@tanstack/vue-query'
import { getPredefinedOptions } from '@/api/options'
import Input from '@/components/ui/input/BaseInput.vue'
import Textarea from '@/components/ui/input/BaseTextarea.vue'
import Dropdown from '@/components/ui/input/BaseDropdown.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import Image from '@/components/ui/input/BaseImage.vue'
import GroupImage from '@/components/ui/input/GroupImage.vue'
import LoadingOverlay from '../ui/LoadingOverlay.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconPlus from '@/components/icons/IconPlus.vue'

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
})

const emit = defineEmits(['update:modelValue'])
const {
  data: categoriesData,
  isLoading: isCategoriesLoading,
  pagination: categoryPagination,
} = usePaginatedQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
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
  queryFn: fetchBrands,
  useLocalPagination: true,
  itemsPerPage: 10,
  queryOptions: { staleTime: 5 * 60 * 1000 },
})

const {
  data: predefinedOptionsData,
  isLoading: isOptionsLoading,
} = useQuery({
  queryKey: ['predefinedOptions'],
  queryFn: getPredefinedOptions,
  staleTime: 5 * 60 * 1000,
})

const localProduct = ref({})
const initialDataJson = ref('')
const isUpdatingFromProp = ref(false)
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
const allAvailableOptions = computed(() => {
  const dict = predefinedOptionsData.value || {}
  return Object.entries(dict).map(([key, label]) => ({
    value: key,
    text: label,
  }))
})

const showLoadingOverlay = computed(() => {
  return props.isSaving
})

const loadingMessage = computed(() => {
  if (props.isSaving) return 'Đang lưu sản phẩm...'
  return ''
})

const getVariantErrors = (index) => {
  if (props.errors?.variants && props.errors.variants[index]) {
    return props.errors.variants[index]
  }
  return {}
}

const getPredefinedLabel = (key) => {
  const dict = predefinedOptionsData.value || {}
  return dict[key] || key
}

const getAvailableOptionsForVariant = (variant, currentKey) => {
  const usedKeys = Object.keys(variant.optionValues || {})
  return allAvailableOptions.value.filter((opt) => {
    return opt.value === currentKey || !usedKeys.includes(opt.value)
  })
}

const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const generateVariantSlug = (variant) => {
  const productNameSlug = slugify(localProduct.value.name)
  if (!variant.optionValues) return productNameSlug

  const optionSlugs = Object.entries(variant.optionValues)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${slugify(key)}-${slugify(value)}`)
    .join('-')

  if (optionSlugs) {
    return `${productNameSlug}-${optionSlugs}`
  }
  return productNameSlug
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

    if (!copy.variants || copy.variants.length === 0) {
      copy.variants = [
        {
          id: null,
          price: null,
          optionValues: {},
          cover_image_url: '',
          photo_collection: [],
          url: '',
        },
      ]
    } else {
      copy.variants.forEach((v) => {
        if (!v.photo_collection) v.photo_collection = []
        if (!v.cover_image_url) v.cover_image_url = ''
        if (!v.optionValues) v.optionValues = {}
        if (!v.url) v.url = generateVariantSlug(v)
      })
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
      v.url = generateVariantSlug(v)
    })
  }
}

watch(() => localProduct.value.name, updateAllVariantSlugs)
watch(() => localProduct.value.variants.map((v) => v.optionValues), updateAllVariantSlugs, {
  deep: true,
})

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

const addVariant = () => {
  const newVariant = {
    id: null,
    price: null,
    optionValues: {},
    cover_image_url: '',
    photo_collection: [],
    url: '',
  }

  newVariant.url = generateVariantSlug(newVariant)
  localProduct.value.variants.push(newVariant)
}

const removeVariant = (index) => {
  localProduct.value.variants.splice(index, 1)
  if (localProduct.value.variants.length === 0) {
    addVariant()
  }
}
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
            <Dropdown
              label="Danh Mục *"
              v-model="localProduct.category_id"
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

      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Thông số kỹ thuật</legend>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Khối lượng bản thân (kg)"
            type="number"
            v-model.number="localProduct.weight"
            placeholder="ví dụ: 114"
          />
          <Input
            label="Kích thước (D x R x C) (mm)"
            v-model="localProduct.dimensions"
            placeholder="ví dụ: 1.902 x 686 x 1.116"
          />
          <Input
            label="Khoảng cách trục bánh xe (mm)"
            type="number"
            v-model.number="localProduct.wheelbase"
            placeholder="ví dụ: 1286"
          />
          <Input
            label="Độ cao yên (mm)"
            type="number"
            v-model.number="localProduct.seat_height"
            placeholder="ví dụ: 775"
          />
          <Input
            label="Khoảng sáng gầm xe (mm)"
            type="number"
            v-model.number="localProduct.ground_clearance"
            placeholder="ví dụ: 141"
          />
          <Input
            label="Dung tích bình xăng (lít)"
            type="number"
            step="0.1"
            v-model.number="localProduct.fuel_capacity"
            placeholder="ví dụ: 4.4"
          />
          <Input
            label="Kích cỡ lốp trước/sau"
            v-model="localProduct.tire_size"
            placeholder="ví dụ: 90/80-14 / 100/80-14"
          />
          <Input
            label="Phuộc trước"
            v-model="localProduct.front_suspension"
            placeholder="ví dụ: Ống lồng"
          />
          <Input
            label="Phuộc sau"
            v-model="localProduct.rear_suspension"
            placeholder="ví dụ: Lò xo trụ"
          />
          <Input
            label="Loại động cơ"
            v-model="localProduct.engine_type"
            placeholder="ví dụ: 4 kỳ, 1 xi-lanh..."
          />
          <Input
            label="Công suất tối đa"
            v-model="localProduct.max_power"
            placeholder="ví dụ: 11,7 mã lực @ 8.500 vòng/phút"
          />
          <Input
            label="Dung tích nhớt máy (lít)"
            type="number"
            step="0.1"
            v-model.number="localProduct.oil_capacity"
            placeholder="ví dụ: 0.8"
          />
          <Input
            label="Mức tiêu thụ nhiên liệu"
            v-model="localProduct.fuel_consumption"
            placeholder="ví dụ: 2,31 l/100km"
          />
          <Input
            label="Loại truyền động"
            v-model="localProduct.transmission_type"
            placeholder="ví dụ: Tự động, vô cấp"
          />
          <Input
            label="Hệ thống khởi động"
            v-model="localProduct.starter_system"
            placeholder="ví dụ: Điện"
          />
          <Input
            label="Moment xoắn cực đại"
            v-model="localProduct.max_torque"
            placeholder="ví dụ: 14,6 Nm @ 6.500 vòng/phút"
          />
          <Input
            label="Dung tích xy-lanh (cc)"
            type="number"
            step="0.1"
            v-model.number="localProduct.displacement"
            placeholder="ví dụ: 156.9"
          />
          <Input
            label="Đường kính x Hành trình piston (mm)"
            v-model="localProduct.bore_stroke"
            placeholder="ví dụ: 60,0 x 55,5"
          />
          <Input
            label="Tỷ số nén"
            v-model="localProduct.compression_ratio"
            placeholder="ví dụ: 12,0:1"
          />
        </div>
      </fieldset>

      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Các biến thể (Variants)</legend>

        <div v-if="typeof props.errors?.variants === 'string'" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <span class="block sm:inline whitespace-pre-line">{{ props.errors.variants }}</span>
        </div>
        <div v-if="typeof props.errors?._backend?.variants === 'string'" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <span class="block sm:inline whitespace-pre-line">{{ props.errors._backend.variants }}</span>
        </div>

        <div class="space-y-6">
          <div
            v-for="(variant, index) in localProduct.variants"
            :key="index"
            class="border rounded-lg p-4 bg-gray-50 relative"
          >
            <SmallNoBgButton
              v-if="localProduct.variants.length > 1"
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
                v-for="(value, key) in variant.optionValues"
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
                <Input
                  label="Giá trị"
                  :model-value="value"
                  placeholder="ví dụ: Đỏ, 150cc..."
                  class="flex-1"
                  @update:model-value="(newVal) => (variant.optionValues[key] = newVal)"
                />
                <SmallNoBgButton
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
              v-if="Object.keys(variant.optionValues || {}).length < allAvailableOptions.length"
              text="Thêm thuộc tính"
              color="gray"
              @click="addVariantOption(variant)"
              class="mb-4"
              :icon="IconPlus"
              size="sm"
            />

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
              />
            </div>

            <div v-if="getVariantErrors(index).combination" class="text-red-500 text-sm mb-4">
              {{ getVariantErrors(index).combination }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Image
                label="Ảnh Bìa Biến Thể"
                v-model="variant.cover_image_url"
                class="md:col-span-1"
                bucket="cover"
              />
              <GroupImage
                label="Bộ Sưu Tập Biến Thể"
                v-model="variant.photo_collection"
                class="md:col-span-2"
                bucket="photo-collection"
              />
            </div>
          </div>
        </div>
        <Button
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
