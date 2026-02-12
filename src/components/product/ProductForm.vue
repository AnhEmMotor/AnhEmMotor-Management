<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { useProductCategoriesStore } from '@/stores/useProductCategoriesStore'
import { useBrandsStore } from '@/stores/useBrandsStore'
import { useOptionsStore } from '@/stores/useOptionsStore'
import Input from '@/components/ui/input/BaseInput.vue'
import Textarea from '@/components/ui/input/BaseTextarea.vue'
import Dropdown from '@/components/ui/input/BaseDropdown.vue'
import Button from '@/components/ui/button/Button.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import Image from '@/components/ui/input/BaseImage.vue'
import GroupImage from '@/components/ui/input/GroupImage.vue'
import LoadingOverlay from '../ui/LoadingOverlay.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconCheck from '@/components/icons/IconCheck.vue'

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
const productCategoriesStore = useProductCategoriesStore()
const brandsStore = useBrandsStore()
const optionsStore = useOptionsStore()

const isFormLoading = ref(false)

const localProduct = ref({})
const initialDataJson = ref('')
const isUpdatingFromProp = ref(false)

const generalCoverImage = ref('')
const generalPhotoCollection = ref([])

const categoryOptions = computed(() => {
  return (productCategoriesStore.allCategories || []).map((c) => ({
    value: c.id,
    text: c.name,
  }))
})
const brandOptions = computed(() => {
  return (brandsStore.allBrands || []).map((b) => ({
    value: b.id,
    text: b.name,
  }))
})
const allAvailableOptions = computed(() => {
  return (optionsStore.allOptions || []).map((o) => ({
    value: o.name,
    text: o.name,
  }))
})

onMounted(async () => {
  isFormLoading.value = true
  try {
    await Promise.all([
      productCategoriesStore.fetchCategories(),
      brandsStore.fetchBrands(),
      optionsStore.fetchOptions(),
    ])
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu form:', error)
  } finally {
    isFormLoading.value = false
  }
})

const showLoadingOverlay = computed(() => {
  return isFormLoading.value || props.isSaving
})

const loadingMessage = computed(() => {
  if (isFormLoading.value) return 'Đang tải dữ liệu form...'
  if (props.isSaving) return 'Đang lưu sản phẩm...'
  return ''
})

const hasOptions = computed(() => {
  return localProduct.value.options && localProduct.value.options.length > 0
})

const getOptionValuesArray = (valuesString) => {
  if (!valuesString) return []
  return valuesString.split(',').map((v) => {
    const trimmedVal = v.trim()
    return { value: trimmedVal, text: trimmedVal }
  })
}

const getVariantErrors = (index) => {
  if (props.errors?.variants && props.errors.variants[index]) {
    return props.errors.variants[index]
  }
  return {}
}

const simpleProductErrors = computed(() => {
  if (!hasOptions.value && props.errors?.variants && props.errors.variants[0]) {
    return {
      price: props.errors.variants[0].price,
      url: props.errors.variants[0].url,
    }
  }
  return {}
})

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

    if (!copy.options) {
      copy.options = []
    }

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
        if (!v.url) v.url = generateVariantSlug(v)
      })
    }

    if (copy.variants.length > 0) {
      generalCoverImage.value = copy.variants[0].cover_image_url || ''
      generalPhotoCollection.value = copy.variants[0].photo_collection || []
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

watch(
  () => localProduct.value.options,
  (newOptions, oldOptions) => {
    if (isUpdatingFromProp.value || oldOptions === undefined) {
      return
    }

    if (!localProduct.value.variants) localProduct.value.variants = []

    if (newOptions.length > 0 && oldOptions.length === 0) {
      localProduct.value.variants = []
      addVariant()
    } else if (newOptions.length === 0 && oldOptions.length > 0) {
      const firstVariant = localProduct.value.variants[0]
        ? JSON.parse(JSON.stringify(localProduct.value.variants[0]))
        : {
            id: null,
            price: null,
            cover_image_url: generalCoverImage.value,
            photo_collection: [...generalPhotoCollection.value],
          }

      firstVariant.optionValues = {}
      firstVariant.url = slugify(localProduct.value.name)

      localProduct.value.variants = [firstVariant]
    } else {
      const currentOptionNames = newOptions.map((o) => o.name)
      localProduct.value.variants.forEach((variant) => {
        if (!variant.optionValues || typeof variant.optionValues !== 'object') {
          variant.optionValues = {}
        }

        const existingValueKeys = Object.keys(variant.optionValues)

        existingValueKeys.forEach((key) => {
          if (!currentOptionNames.includes(key)) {
            delete variant.optionValues[key]
          }
        })

        currentOptionNames.forEach((name) => {
          if (name && !Object.prototype.hasOwnProperty.call(variant.optionValues, name)) {
            variant.optionValues[name] = ''
          }
        })
      })
    }
  },
  { deep: true },
)

const addOption = () => {
  if (!localProduct.value.options) {
    localProduct.value.options = []
  }
  localProduct.value.options.push({
    name: '',
    values: '',
  })
}

const removeOption = (index) => {
  localProduct.value.options.splice(index, 1)
}

const addVariant = () => {
  const newVariant = {
    id: null,
    price: null,
    optionValues: {},
    cover_image_url: generalCoverImage.value || '',
    photo_collection: [...(generalPhotoCollection.value || [])],
    url: '',
  }

  localProduct.value.options.forEach((opt) => {
    if (opt.name) {
      newVariant.optionValues[opt.name] = ''
    }
  })

  newVariant.url = generateVariantSlug(newVariant)
  localProduct.value.variants.push(newVariant)
}

const removeVariant = (index) => {
  localProduct.value.variants.splice(index, 1)
}

const applyGeneralCoverImage = () => {
  if (!generalCoverImage.value) return
  localProduct.value.variants.forEach((v) => {
    v.cover_image_url = generalCoverImage.value
  })
}

const applyGeneralPhotoCollection = () => {
  if (generalPhotoCollection.value.length === 0) return
  localProduct.value.variants.forEach((v) => {
    v.photo_collection = [...generalPhotoCollection.value]
  })
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
              required
            />
            <div v-if="errors && errors.name" class="text-red-500 text-xs mt-1">
              {{ errors.name }}
            </div>
          </div>
          <div>
            <Dropdown
              label="Danh Mục *"
              v-model="localProduct.category_id"
              :options="categoryOptions"
              placeholder="Chọn Danh Mục"
              required
            />
            <div v-if="errors && errors.category_id" class="text-red-500 text-xs mt-1">
              {{ errors.category_id }}
            </div>
          </div>
          <div>
            <Dropdown
              label="Thương Hiệu"
              v-model="localProduct.brand_id"
              :options="brandOptions"
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
        <legend class="px-2 font-semibold text-gray-700">Hình ảnh chung (Để áp dụng nhanh)</legend>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Image
            label="Ảnh Bìa Chung"
            v-model="generalCoverImage"
            class="md:col-span-1"
            bucket="cover"
          />
          <GroupImage
            label="Bộ Sưu Tập Chung"
            v-model="generalPhotoCollection"
            class="md:col-span-2"
            bucket="photo-collection"
          />
        </div>
        <div class="flex space-x-2 mt-4">
          <Button
            text="Áp dụng Ảnh Bìa Chung"
            color="gray"
            @click="applyGeneralCoverImage"
            :icon="IconCheck"
          />
          <Button
            text="Áp dụng Bộ Sưu Tập Chung"
            color="gray"
            @click="applyGeneralPhotoCollection"
            :icon="IconCheck"
          />
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
        <legend class="px-2 font-semibold text-gray-700">Thuộc tính sản phẩm (Options)</legend>
        <div class="space-y-3">
          <div
            v-for="(option, index) in localProduct.options"
            :key="index"
            class="flex flex-col sm:flex-row gap-2 items-start"
          >
            <Dropdown
              label="Tên thuộc tính"
              v-model="option.name"
              :options="allAvailableOptions"
              placeholder="Chọn thuộc tính"
              class="flex-1"
            />
            <Input
              label="Các giá trị"
              v-model="option.values"
              placeholder="Cách nhau bằng dấu phẩy (ví dụ: Đỏ, Xanh)"
              class="flex-1"
            />
            <SmallNoBgButton
              color="red"
              @click="removeOption(index)"
              class="mt-6 sm:mt-7"
              :icon="IconTrash"
            >
              Xóa
            </SmallNoBgButton>
          </div>
        </div>
        <Button
          text="Thêm thuộc tính"
          color="gray"
          @click="addOption"
          class="mt-4"
          :icon="IconPlus"
        />
      </fieldset>

      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Các biến thể (Variants)</legend>

        <div v-if="!hasOptions">
          <p class="text-sm text-gray-500 mb-4">
            Sản phẩm này không có thuộc tính. Vui lòng nhập thông tin cho biến thể mặc định.
          </p>
          <div v-if="localProduct.variants[0]" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Giá Bán *"
                  type="number"
                  v-model.number="localProduct.variants[0].price"
                  placeholder="Nhập giá bán"
                  :min="0"
                />
                <div v-if="simpleProductErrors.price" class="text-red-500 text-xs mt-1">
                  {{ simpleProductErrors.price }}
                </div>
              </div>
              <div>
                <Input
                  label="URL Slug *"
                  v-model="localProduct.variants[0].url"
                  placeholder="ví dụ: ten-san-pham"
                />
                <div v-if="simpleProductErrors.url" class="text-red-500 text-xs mt-1">
                  {{ simpleProductErrors.url }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Image
                label="Ảnh Bìa Biến Thể"
                v-model="localProduct.variants[0].cover_image_url"
                class="md:col-span-1"
                bucket="cover"
              />
              <GroupImage
                label="Bộ Sưu Tập Biến Thể"
                v-model="localProduct.variants[0].photo_collection"
                class="md:col-span-2"
                bucket="photo-collection"
              />
            </div>
          </div>
        </div>

        <div v-else>
          <div class="space-y-6">
            <div
              v-for="(variant, index) in localProduct.variants"
              :key="index"
              class="border rounded-lg p-4 bg-gray-50 relative"
            >
              <SmallNoBgButton
                color="red"
                @click="removeVariant(index)"
                class="absolute top-3 right-3"
                :icon="IconTrash"
              >
                Xóa Biến Thể
              </SmallNoBgButton>

              <h4 class="font-semibold text-lg mb-3">Biến thể #{{ index + 1 }}</h4>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div v-for="option in localProduct.options" :key="option.name" class="flex-1">
                  <Dropdown
                    v-if="option.name"
                    :label="option.name || 'Chọn thuộc tính'"
                    v-model="variant.optionValues[option.name]"
                    :options="getOptionValuesArray(option.values)"
                    placeholder="Chọn"
                  />
                  <span v-else class="text-xs text-gray-500">...</span>
                </div>

                <div class="flex-1">
                  <Input
                    label="Giá Bán *"
                    type="number"
                    v-model.number="variant.price"
                    placeholder="Giá bán"
                  />
                </div>
              </div>

              <div class="mb-4">
                <Input
                  label="URL Slug *"
                  v-model="variant.url"
                  placeholder="ví dụ: ten-san-pham-thuoc-tinh"
                />
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

              <div class="mt-2 text-red-500 text-xs space-y-1">
                <div v-if="getVariantErrors(index).price">
                  Lỗi giá: {{ getVariantErrors(index).price }}
                </div>
                <div v-if="getVariantErrors(index).combination">
                  Lỗi thuộc tính: {{ getVariantErrors(index).combination }}
                </div>
                <div v-if="getVariantErrors(index).url">
                  Lỗi URL: {{ getVariantErrors(index).url }}
                </div>
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
          <div v-if="localProduct.variants.length === 0" class="text-center py-4 text-gray-500">
            Nhấn "Thêm biến thể" để tạo tổ hợp thuộc tính đầu tiên.
          </div>
        </div>
      </fieldset>
    </div>
  </form>
</template>
