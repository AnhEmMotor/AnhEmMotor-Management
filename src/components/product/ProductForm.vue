<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BaseTextarea from '@/components/ui/input/BaseTextarea.vue'
import BaseDropdown from '@/components/ui/input/BaseDropdown.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'

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
})

const emit = defineEmits(['update:modelValue'])

const localProduct = ref({})
const initialDataJson = ref('')
const isUpdatingFromProp = ref(false)

const categoryOptions = [
  { value: 'Xe Máy', text: 'Xe Máy' },
  { value: 'Phụ Kiện', text: 'Phụ Kiện' },
  { value: 'Phụ Tùng', text: 'Phụ Tùng' },
]
const brandOptions = [
  { value: 'uuid-honda', text: 'Honda' },
  { value: 'uuid-yamaha', text: 'Yamaha' },
  { value: 'uuid-royal', text: 'Royal' },
]
const allAvailableOptions = [
  { value: 'Màu sắc', text: 'Màu sắc' },
  { value: 'Dung tích động cơ', text: 'Dung tích động cơ' },
  { value: 'Kích cỡ', text: 'Kích cỡ' },
]

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
    }
  }
  return {}
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) === JSON.stringify(localProduct.value)) {
      return
    }

    isUpdatingFromProp.value = true
    const copy = JSON.parse(JSON.stringify(newVal || {}))

    if (!copy.options) {
      copy.options = []
    }

    if (!copy.variants || copy.variants.length === 0) {
      copy.variants = [
        {
          id: null,
          price: null,
          cost: null,
          quantity: null,
          optionValues: {},
        },
      ]
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

watch(
  () => localProduct.value.options,
  (newOptions, oldOptions) => {
    if (oldOptions === undefined) {
      return
    }

    if (!localProduct.value.variants) localProduct.value.variants = []

    if (newOptions.length > 0 && oldOptions.length === 0) {
      localProduct.value.variants = []
    } else if (newOptions.length === 0 && oldOptions.length > 0) {
      localProduct.value.variants = [
        {
          id: null,
          price: null,
          cost: null,
          quantity: null,
          optionValues: {},
        },
      ]
    }

    const currentOptionNames = newOptions.map((o) => o.name)

    localProduct.value.variants.forEach((variant) => {
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
  }

  localProduct.value.options.forEach((opt) => {
    if (opt.name) {
      newVariant.optionValues[opt.name] = ''
    }
  })

  localProduct.value.variants.push(newVariant)
}

const removeVariant = (index) => {
  localProduct.value.variants.splice(index, 1)
}
</script>

<template>
  <form @submit.prevent id="product-form">
    <div class="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Thông tin chung</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <BaseInput
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
            <BaseDropdown
              label="Danh Mục *"
              v-model="localProduct.category"
              :options="categoryOptions"
              placeholder="Chọn Danh Mục"
              required
            />
            <div v-if="errors && errors.category" class="text-red-500 text-xs mt-1">
              {{ errors.category }}
            </div>
          </div>
          <div>
            <BaseDropdown
              label="Thương Hiệu"
              v-model="localProduct.brand"
              :options="brandOptions"
              placeholder="Chọn Thương Hiệu"
            />
          </div>
          <div class="md:col-span-2">
            <BaseTextarea
              label="Mô Tả Sản Phẩm"
              v-model="localProduct.description"
              placeholder="Nhập mô tả..."
              :rows="3"
            />
          </div>
        </div>
      </fieldset>

      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Thuộc tính sản phẩm</legend>
        <div class="space-y-3">
          <div
            v-for="(option, index) in localProduct.options"
            :key="index"
            class="flex flex-col sm:flex-row gap-2 items-start"
          >
            <BaseDropdown
              label="Tên thuộc tính"
              v-model="option.name"
              :options="allAvailableOptions"
              placeholder="Chọn thuộc tính"
              class="flex-1"
            />
            <BaseInput
              label="Các giá trị"
              v-model="option.values"
              placeholder="Cách nhau bằng dấu phẩy (ví dụ: Đỏ, Xanh)"
              class="flex-1"
            />
            <BaseSmallNoBgButton color="red" @click="removeOption(index)" class="mt-6 sm:mt-7">
              Xóa
            </BaseSmallNoBgButton>
          </div>
        </div>
        <BaseButton text="Thêm thuộc tính" color="gray" @click="addOption" class="mt-4" />
      </fieldset>

      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Các biến thể</legend>

        <div v-if="!hasOptions">
          <p class="text-sm text-gray-500 mb-4">
            Sản phẩm này không có thuộc tính. Vui lòng nhập thông tin cho biến thể mặc định.
          </p>
          <div v-if="localProduct.variants[0]" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <BaseInput
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
          </div>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th
                    v-for="option in localProduct.options"
                    :key="option.name"
                    class="py-2 px-3 text-left font-medium text-gray-600"
                  >
                    {{ option.name || 'Chọn thuộc tính' }} *
                  </th>

                  <th class="py-2 px-3 text-left font-medium text-gray-600">Giá Bán *</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(variant, index) in localProduct.variants" :key="index" class="border-b">
                  <td v-for="option in localProduct.options" :key="option.name" class="py-2 px-3">
                    <BaseDropdown
                      v-if="option.name"
                      v-model="variant.optionValues[option.name]"
                      :options="getOptionValuesArray(option.values)"
                      placeholder="Chọn"
                      :show-label="false"
                    />
                    <span v-else class="text-xs text-gray-500">...</span>
                  </td>

                  <td class="py-2 px-3">
                    <BaseInput type="number" v-model.number="variant.price" placeholder="Giá bán" />
                  </td>
                  <td class="py-2 px-3">
                    <BaseSmallNoBgButton color="red" @click="removeVariant(index)">
                      Xóa
                    </BaseSmallNoBgButton>
                  </td>
                </tr>

                <tr v-for="(variant, index) in localProduct.variants" :key="'err-' + index">
                  <td :colspan="localProduct.options.length + 4" class="py-0 px-3">
                    <div v-if="getVariantErrors(index).price" class="text-red-500 text-xs mt-1">
                      Lỗi giá: {{ getVariantErrors(index).price }}
                    </div>
                    <div
                      v-if="getVariantErrors(index).combination"
                      class="text-red-500 text-xs mt-1"
                    >
                      Lỗi thuộc tính: {{ getVariantErrors(index).combination }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <BaseButton text="Thêm biến thể" color="blue" @click="addVariant" class="mt-4" />
          <div v-if="localProduct.variants.length === 0" class="text-center py-4 text-gray-500">
            Nhấn "Thêm biến thể" để tạo tổ hợp thuộc tính đầu tiên.
          </div>
        </div>
      </fieldset>
    </div>
  </form>
</template>
