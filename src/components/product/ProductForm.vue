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

const localProduct = ref({})
const initialDataJson = ref('')

// === DỮ LIỆU MOCK (Giả định) ===
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
// === KẾT THÚC DỮ LIỆU MOCK ===

// Computed kiểm tra xem có thuộc tính nào không
const hasOptions = computed(() => {
  return localProduct.value.options && localProduct.value.options.length > 0
})

// Chuyển chuỗi "Val1, Val2" thành mảng cho dropdown
const getOptionValuesArray = (valuesString) => {
  if (!valuesString) return []
  return valuesString.split(',').map((v) => {
    const trimmedVal = v.trim()
    return { value: trimmedVal, text: trimmedVal }
  })
}

// Lấy lỗi cho từng biến thể
const getVariantErrors = (index) => {
  if (props.errors?.variants && props.errors.variants[index]) {
    return props.errors.variants[index]
  }
  return {}
}

// Lỗi cho sản phẩm đơn
const simpleProductErrors = computed(() => {
  if (!hasOptions.value && props.errors?.variants && props.errors.variants[0]) {
    return {
      price: props.errors.variants[0].price,
      // Thêm lỗi khác nếu có
    }
  }
  return {}
})

// === LOGIC WATCH ===

watch(
  () => props.modelValue,
  (newVal) => {
    const copy = JSON.parse(JSON.stringify(newVal || {}))
    // Đảm bảo cấu trúc data luôn đúng
    if (!copy.options) {
      copy.options = []
    }
    // Luôn đảm bảo có ít nhất 1 biến thể (cho trường hợp sản phẩm đơn)
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

// === FIX: WATCH SÂU CÁC THUỘC TÍNH ===
// Watch này thay thế watch cũ (chỉ theo dõi length)
// Nó đồng bộ các `optionValues` của variants khi thuộc tính (options) thay đổi.
watch(
  () => localProduct.value.options,
  (newOptions, oldOptions) => {
    // Bỏ qua lần khởi tạo đầu tiên nếu oldOptions là undefined
    if (oldOptions === undefined) {
      return
    }

    if (!localProduct.value.variants) localProduct.value.variants = []

    // 1. Xử lý chuyển đổi giữa sản phẩm đơn và có biến thể
    if (newOptions.length > 0 && oldOptions.length === 0) {
      // Chuyển từ sản phẩm đơn -> có biến thể
      // Xóa biến thể "mặc định" để bắt đầu thêm thủ công
      localProduct.value.variants = []
    } else if (newOptions.length === 0 && oldOptions.length > 0) {
      // Chuyển từ có biến thể -> sản phẩm đơn
      // Reset về 1 biến thể mặc định
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

    // 2. Đồng bộ các keys của variants với các tên thuộc tính mới
    const currentOptionNames = newOptions.map((o) => o.name)

    localProduct.value.variants.forEach((variant) => {
      const existingValueKeys = Object.keys(variant.optionValues)

      // Xóa các key trong variant.optionValues không còn tồn tại trong options
      existingValueKeys.forEach((key) => {
        if (!currentOptionNames.includes(key)) {
          delete variant.optionValues[key]
        }
      })

      // Thêm các key mới (với giá trị rỗng) vào variant.optionValues
      // Đây chính là phần sửa lỗi `undefined`
      currentOptionNames.forEach((name) => {
        if (name && !variant.optionValues.hasOwnProperty(name)) {
          variant.optionValues[name] = '' // Khởi tạo giá trị rỗng
        }
      })
    })
  },
  { deep: true }, // Quan trọng: `deep: true` để theo dõi thay đổi trong mảng
)

// === LOGIC THUỘC TÍNH & BIẾN THỂ ===

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
  // Logic xóa đã được xử lý bởi deep watch ở trên
  localProduct.value.options.splice(index, 1)
}

// Thêm một biến thể thủ công
const addVariant = () => {
  const newVariant = {
    id: null,
    price: null,
    cost: null,
    quantity: null,
    optionValues: {},
  }
  // Khởi tạo các giá trị thuộc tính dựa trên options hiện tại
  localProduct.value.options.forEach((opt) => {
    if (opt.name) {
      newVariant.optionValues[opt.name] = '' // Khởi tạo rỗng
    }
  })

  localProduct.value.variants.push(newVariant)
}

// Xóa một biến thể
const removeVariant = (index) => {
  localProduct.value.variants.splice(index, 1)
}
</script>

<template>
  <form @submit.prevent id="product-form">
    <div class="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <!-- === 1. THÔNG TIN CHUNG (PARENT PRODUCT) === -->
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

      <!-- === 2. THUỘC TÍNH (OPTIONS) === -->
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

      <!-- === 3. BIẾN THỂ (VARIANTS) === -->
      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Các biến thể</legend>

        <!-- Trường hợp 3a: SẢN PHẨM ĐƠN (Không có thuộc tính) -->
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

        <!-- Trường hợp 3b: SẢN PHẨM CÓ BIẾN THỂ -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <!-- Các cột thuộc tính động -->
                  <th
                    v-for="option in localProduct.options"
                    :key="option.name"
                    class="py-2 px-3 text-left font-medium text-gray-600"
                  >
                    {{ option.name || 'Chọn thuộc tính' }} *
                  </th>
                  <!-- Các cột thông tin biến thể -->
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Giá Bán *</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Giá Vốn</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Số Lượng</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(variant, index) in localProduct.variants" :key="index" class="border-b">
                  <!-- Dropdown chọn thuộc tính động -->
                  <td v-for="option in localProduct.options" :key="option.name" class="py-2 px-3">
                    <!-- Chỉ render dropdown nếu option.name đã được chọn -->
                    <BaseDropdown
                      v-if="option.name"
                      v-model="variant.optionValues[option.name]"
                      :options="getOptionValuesArray(option.values)"
                      placeholder="Chọn"
                      :show-label="false"
                    />
                    <span v-else class="text-xs text-gray-500">...</span>
                  </td>

                  <!-- Input thông tin biến thể -->
                  <td class="py-2 px-3">
                    <BaseInput type="number" v-model.number="variant.price" placeholder="Giá bán" />
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
                  <td classs="py-2 px-3">
                    <BaseSmallNoBgButton color="red" @click="removeVariant(index)">
                      Xóa
                    </BaseSmallNoBgButton>
                  </td>
                </tr>
                <!-- Hàng hiển thị lỗi chung của biến thể -->
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
