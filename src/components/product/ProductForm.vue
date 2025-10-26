<script setup>
import { ref, watch, computed } from 'vue'
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
  // isEditMode không còn dùng để khóa Mã SP,
  // mà có thể dùng để khóa việc thay đổi thuộc tính
  isEditMode: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'update:dirty'])

// localProduct giờ đây có cấu trúc phức tạp hơn
const localProduct = ref({})
const initialDataJson = ref('')

// === DỮ LIỆU MOCK (Giả định) ===
// Dữ liệu này nên được fetch từ CSDL trong thực tế
const categoryOptions = [
  { value: 'Xe Máy', text: 'Xe Máy' },
  { value: 'Phụ Kiện', text: 'Phụ Kiện' },
  { value: 'Phụ Tùng', text: 'Phụ Tùng' },
]
// Thêm brandOptions dựa trên schema
const brandOptions = [
  { value: 'uuid-honda', text: 'Honda' },
  { value: 'uuid-yamaha', text: 'Yamaha' },
  { value: 'uuid-royal', text: 'Royal' },
]
// Thêm allAvailableOptions (Bảng 'options' của bạn)
const allAvailableOptions = [
  { value: 'Màu sắc', text: 'Màu sắc' },
  { value: 'Dung tích động cơ', text: 'Dung tích động cơ' },
  { value: 'Kích cỡ', text: 'Kích cỡ' },
]
// === KẾT THÚC DỮ LIỆU MOCK ===

watch(
  () => props.modelValue,
  (newVal) => {
    const copy = JSON.parse(JSON.stringify(newVal || {}))
    // Đảm bảo cấu trúc data luôn đúng
    if (!copy.options) {
      copy.options = []
    }
    if (!copy.variants) {
      // Nếu không có biến thể, tạo 1 biến thể mặc định
      copy.variants = [
        {
          code: '',
          price: null,
          cost: null,
          quantity: null,
          optionValues: {},
        },
      ]
    }
    localProduct.value = copy
    initialDataJson.value = JSON.stringify(copy)
    emit('update:dirty', false)
  },
  { immediate: true, deep: true },
)

watch(
  localProduct,
  (newVal) => {
    emit('update:modelValue', newVal)
    const isNowDirty = JSON.stringify(newVal) !== initialDataJson.value
    emit('update:dirty', isNowDirty)
  },
  { deep: true },
)

// === LOGIC XỬ LÝ THUỘC TÍNH & BIẾN THỂ ===

// Thêm một dòng định nghĩa thuộc tính mới
const addOption = () => {
  if (!localProduct.value.options) {
    localProduct.value.options = []
  }
  // Thêm một thuộc tính rỗng
  localProduct.value.options.push({
    name: '', // Tên thuộc tính (ví dụ: 'Màu sắc')
    values: '', // Các giá trị, cách nhau bằng dấu phẩy (ví dụ: 'Đỏ, Xanh, Vàng')
  })
}

// Xóa một dòng định nghĩa thuộc tính
const removeOption = (index) => {
  localProduct.value.options.splice(index, 1)
  // Nếu xóa hết thuộc tính, reset về 1 biến thể
  if (localProduct.value.options.length === 0) {
    localProduct.value.variants = [
      localProduct.value.variants[0] || {
        code: '',
        price: null,
        cost: null,
        quantity: null,
        optionValues: {},
      },
    ]
    localProduct.value.variants.length = 1 // Giữ lại 1 cái
  }
}

// Hàm tính toán "Tích Đề-các" (Cartesian Product)
const cartesianProduct = (arrays) => {
  return arrays.reduce(
    (acc, curr) => {
      return acc
        .map((x) => {
          return curr.map((y) => {
            return x.concat([y])
          })
        })
        .flat()
    },
    [[]],
  )
}

// Hàm quan trọng: Tạo/Cập nhật danh sách biến thể
const generateVariants = () => {
  const options = localProduct.value.options
  if (!options || options.length === 0) {
    return // Không có thuộc tính, không tạo
  }

  // 1. Chuẩn bị mảng các giá trị
  // input: [{ name: 'Màu', values: 'Đỏ, Xanh' }, { name: 'Cỡ', values: 'M, L' }]
  // output: [ ['Đỏ', 'Xanh'], ['M', 'L'] ]
  const valueArrays = options.map((opt) => opt.values.split(',').map((v) => v.trim()))

  // 2. Tính toán các tổ hợp
  // output: [ ['Đỏ', 'M'], ['Đỏ', 'L'], ['Xanh', 'M'], ['Xanh', 'L'] ]
  const combinations = cartesianProduct(valueArrays)

  // 3. Tạo danh sách biến thể mới
  const newVariants = combinations.map((combo) => {
    // combo = ['Đỏ', 'M']
    const optionValues = {}
    options.forEach((opt, index) => {
      optionValues[opt.name] = combo[index]
    })
    // { 'Màu': 'Đỏ', 'Cỡ': 'M' }

    // Cố gắng giữ lại dữ liệu cũ nếu biến thể đã tồn tại
    const oldVariant = findOldVariant(optionValues)

    return {
      code: oldVariant?.code || '',
      price: oldVariant?.price || null,
      cost: oldVariant?.cost || null,
      quantity: oldVariant?.quantity || null,
      optionValues: optionValues,
    }
  })

  localProduct.value.variants = newVariants
}

// Tìm biến thể cũ để giữ lại data (price, code...)
const findOldVariant = (optionValues) => {
  const oldVariants = localProduct.value.variants
  if (!oldVariants) return null

  const keys = Object.keys(optionValues)
  return oldVariants.find((variant) => {
    return keys.every((key) => variant.optionValues[key] === optionValues[key])
  })
}

// === LỖI VALIDATION ===
// Computed để lấy lỗi cho từng biến thể
const getVariantErrors = (index) => {
  if (props.errors?.variants && props.errors.variants[index]) {
    return props.errors.variants[index]
  }
  return {}
}

// Computed cho lỗi của form sản phẩm đơn (khi không có options)
const simpleProductErrors = computed(() => {
  if (
    localProduct.value.options.length === 0 &&
    props.errors?.variants &&
    props.errors.variants[0]
  ) {
    // Map lỗi từ variants[0] sang tên dễ hiểu hơn
    return {
      code: props.errors.variants[0].code,
      price: props.errors.variants[0].price,
      // ... thêm các lỗi khác nếu có
    }
  }
  return {}
})
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

        <div v-if="localProduct.options.length === 0">
          <p class="text-sm text-gray-500 mb-4">
            Sản phẩm này không có thuộc tính. Vui lòng nhập thông tin cho biến thể mặc định.
          </p>
          <div v-if="localProduct.variants[0]" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <BaseInput
                label="Mã SP / SKU *"
                v-model="localProduct.variants[0].code"
                placeholder="Bắt buộc"
                :readonly="isEditMode"
              />
              <div v-if="simpleProductErrors.code" class="text-red-500 text-xs mt-1">
                {{ simpleProductErrors.code }}
              </div>
            </div>
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
            <div>
              <BaseInput
                label="Giá Vốn"
                type="number"
                v-model.number="localProduct.variants[0].cost"
                placeholder="Nhập giá vốn"
                :min="0"
              />
            </div>
            <div>
              <BaseInput
                label="Số Lượng"
                type="number"
                v-model.number="localProduct.variants[0].quantity"
                placeholder="Nhập số lượng"
                :min="0"
              />
            </div>
          </div>
        </div>

        <div v-else>
          <BaseButton
            text="Tạo / Cập nhật danh sách biến thể"
            color="blue"
            @click="generateVariants"
            class="mb-4"
          />
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th
                    v-for="option in localProduct.options"
                    :key="option.name"
                    class="py-2 px-3 text-left font-medium text-gray-600"
                  >
                    {{ option.name }}
                  </th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Mã SKU *</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Giá Bán *</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Giá Vốn</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Số Lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(variant, index) in localProduct.variants" :key="index" class="border-b">
                  <td v-for="option in localProduct.options" :key="option.name" class="py-2 px-3">
                    {{ variant.optionValues[option.name] }}
                  </td>
                  <td class="py-2 px-3">
                    <BaseInput v-model="variant.code" placeholder="Mã SKU" />
                    <div v-if="getVariantErrors(index).code" class="text-red-500 text-xs mt-1">
                      {{ getVariantErrors(index).code }}
                    </div>
                  </td>
                  <td class="py-2 px-3">
                    <BaseInput type="number" v-model.number="variant.price" placeholder="Giá bán" />
                    <div v-if="getVariantErrors(index).price" class="text-red-500 text-xs mt-1">
                      {{ getVariantErrors(index).price }}
                    </div>
                  </td>
                  <td class="py-2 px-3">
                    <BaseInput type="number" v-model.number="variant.cost" placeholder="Giá vốn" />
                  </td>
                  <td class="py-2 px-3">
                    <BaseInput
                      type="number"
                      v-model.number="variant.quantity"
                      placeholder="Số lượng"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="localProduct.variants.length === 0" class="text-center py-4 text-gray-500">
              Nhấn nút "Tạo biến thể" để bắt đầu.
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  </form>
</template>
