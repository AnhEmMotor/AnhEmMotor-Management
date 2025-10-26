<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BaseTextarea from '@/components/ui/input/BaseTextarea.vue'
import BaseDropdown from '@/components/ui/input/BaseDropdown.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
// IMPORT COMPONENT MỚI
import BaseImage from '@/components/ui/input/BaseImage.vue'
import BaseGroupImage from '@/components/ui/input/BaseGroupImage.vue'

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

const emit = defineEmits(['update:modelValue', 'update:dirty']) // Thêm emit 'update:dirty'

const localProduct = ref({})
const initialDataJson = ref('')
const isUpdatingFromProp = ref(false)

const categoryOptions = [
  { value: 'Xe Máy', text: 'Xe Máy' },
  { value: 'Phụ Kiện', text: 'Phụ Kiện' },
  { value: 'Phụ Tùng', text: 'Phụ Tùng' },
]
const brandOptions = [
  { value: 'Honda', text: 'Honda' },
  { value: 'Yamaha', text: 'Yamaha' },
  { value: 'Royal', text: 'Royal' },
  { value: 'Castrol', text: 'Castrol' },
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

// === KHỞI TẠO VÀ ĐỒNG BỘ DATA ===
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) === JSON.stringify(localProduct.value)) {
      return
    }

    isUpdatingFromProp.value = true
    const copy = JSON.parse(JSON.stringify(newVal || {}))

    // Đảm bảo các trường luôn tồn tại
    if (!copy.options) {
      copy.options = []
    }
    // Quan trọng: Đảm bảo photo_collection là một array
    if (!copy.photo_collection || typeof copy.photo_collection === 'string') {
      // Nếu là string từ dữ liệu cũ (ví dụ: "url1\nurl2"),
      // thì chuyển nó thành array.
      if (typeof copy.photo_collection === 'string' && copy.photo_collection.trim() !== '') {
        copy.photo_collection = copy.photo_collection.split('\n').filter((url) => url.trim() !== '')
      } else {
        copy.photo_collection = []
      }
    }

    if (!copy.variants || copy.variants.length === 0) {
      copy.variants = [
        {
          id: null,
          price: null,
          optionValues: {},
        },
      ]
    }

    localProduct.value = copy
    initialDataJson.value = JSON.stringify(copy)
    emit('update:dirty', false) // Reset dirty state
    nextTick(() => {
      isUpdatingFromProp.value = false
    })
  },
  { immediate: true, deep: true },
)

// === WATCH SỰ THAY ĐỔI VÀ EMIT ===
watch(
  localProduct,
  (newVal) => {
    if (isUpdatingFromProp.value) {
      return
    }

    // Check if form is dirty
    const isDirty = JSON.stringify(newVal) !== initialDataJson.value
    emit('update:dirty', isDirty) // Emit trạng thái dirty

    emit('update:modelValue', newVal)
  },
  { deep: true },
)

// === LOGIC XỬ LÝ OPTIONS VÀ VARIANTS ===
watch(
  () => localProduct.value.options,
  (newOptions, oldOptions) => {
    if (isUpdatingFromProp.value || oldOptions === undefined) {
      return
    }

    if (!localProduct.value.variants) localProduct.value.variants = []

    // Từ không có options -> có options
    if (newOptions.length > 0 && oldOptions.length === 0) {
      // Xóa biến thể mặc định và reset
      localProduct.value.variants = []
      // Thêm 1 biến thể mới với các trường option
      addVariant()
    }
    // Từ có options -> về 0 options
    else if (newOptions.length === 0 && oldOptions.length > 0) {
      localProduct.value.variants = [
        {
          id: null,
          price: null,
          optionValues: {},
        },
      ]
    }
    // Chỉ là thay đổi options
    else {
      const currentOptionNames = newOptions.map((o) => o.name)
      localProduct.value.variants.forEach((variant) => {
        const existingValueKeys = Object.keys(variant.optionValues)

        // Xóa các optionValue không còn tồn tại trong options
        existingValueKeys.forEach((key) => {
          if (!currentOptionNames.includes(key)) {
            delete variant.optionValues[key]
          }
        })

        // Thêm các optionValue mới
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
    <!-- Thêm max-h-[75vh] và px-1 pr-2 để scrollbar đẹp hơn -->
    <div class="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
      <!-- === Thông Tin Chung === -->
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

      <!-- === Hình Ảnh (SỬ DỤNG COMPONENT MỚI) === -->
      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Hình ảnh</legend>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Ảnh Bìa -->
          <BaseImage
            label="Ảnh Bìa (Cover Image)"
            v-model="localProduct.cover_image"
            class="md:col-span-1"
          />
          <!-- Bộ Sưu Tập Ảnh -->
          <BaseGroupImage
            label="Bộ Sưu Tập Ảnh (Photo Collection)"
            v-model="localProduct.photo_collection"
            class="md:col-span-2"
          />
        </div>
      </fieldset>

      <!-- === Thông Số Kỹ Thuật (ĐÃ ĐỔI TÊN TIẾNG ANH) === -->
      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Thông số kỹ thuật</legend>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput
            label="Khối lượng bản thân (kg)"
            type="number"
            v-model.number="localProduct.weight"
            placeholder="ví dụ: 114"
          />
          <BaseInput
            label="Kích thước (D x R x C) (mm)"
            v-model="localProduct.dimensions"
            placeholder="ví dụ: 1.902 x 686 x 1.116"
          />
          <BaseInput
            label="Khoảng cách trục bánh xe (mm)"
            type="number"
            v-model.number="localProduct.wheelbase"
            placeholder="ví dụ: 1286"
          />
          <BaseInput
            label="Độ cao yên (mm)"
            type="number"
            v-model.number="localProduct.seat_height"
            placeholder="ví dụ: 775"
          />
          <BaseInput
            label="Khoảng sáng gầm xe (mm)"
            type="number"
            v-model.number="localProduct.ground_clearance"
            placeholder="ví dụ: 141"
          />
          <BaseInput
            label="Dung tích bình xăng (lít)"
            type="number"
            step="0.1"
            v-model.number="localProduct.fuel_capacity"
            placeholder="ví dụ: 4.4"
          />
          <BaseInput
            label="Kích cỡ lốp trước/sau"
            v-model="localProduct.tire_size"
            placeholder="ví dụ: 90/80-14 / 100/80-14"
          />
          <BaseInput
            label="Phuộc trước"
            v-model="localProduct.front_suspension"
            placeholder="ví dụ: Ống lồng"
          />
          <BaseInput
            label="Phuộc sau"
            v-model="localProduct.rear_suspension"
            placeholder="ví dụ: Lò xo trụ"
          />
          <BaseInput
            label="Loại động cơ"
            v-model="localProduct.engine_type"
            placeholder="ví dụ: 4 kỳ, 1 xi-lanh..."
          />
          <BaseInput
            label="Công suất tối đa"
            v-model="localProduct.max_power"
            placeholder="ví dụ: 11,7 mã lực @ 8.500 vòng/phút"
          />
          <BaseInput
            label="Dung tích nhớt máy (lít)"
            type="number"
            step="0.1"
            v-model.number="localProduct.oil_capacity"
            placeholder="ví dụ: 0.8"
          />
          <BaseInput
            label="Mức tiêu thụ nhiên liệu"
            v-model="localProduct.fuel_consumption"
            placeholder="ví dụ: 2,31 l/100km"
          />
          <BaseInput
            label="Loại truyền động"
            v-model="localProduct.transmission_type"
            placeholder="ví dụ: Tự động, vô cấp"
          />
          <BaseInput
            label="Hệ thống khởi động"
            v-model="localProduct.starter_system"
            placeholder="ví dụ: Điện"
          />
          <BaseInput
            label="Moment xoắn cực đại"
            v-model="localProduct.max_torque"
            placeholder="ví dụ: 14,6 Nm @ 6.500 vòng/phút"
          />
          <BaseInput
            label="Dung tích xy-lanh (cc)"
            type="number"
            step="0.1"
            v-model.number="localProduct.displacement"
            placeholder="ví dụ: 156.9"
          />
          <BaseInput
            label="Đường kính x Hành trình piston (mm)"
            v-model="localProduct.bore_stroke"
            placeholder="ví dụ: 60,0 x 55,5"
          />
          <BaseInput
            label="Tỷ số nén"
            v-model="localProduct.compression_ratio"
            placeholder="ví dụ: 12,0:1"
          />
        </div>
      </fieldset>

      <!-- === Thuộc Tính Sản Phẩm === -->
      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Thuộc tính sản phẩm (Options)</legend>
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

      <!-- === Các Biến Thể (Variants) === -->
      <fieldset class="border rounded-md p-4">
        <legend class="px-2 font-semibold text-gray-700">Các biến thể (Variants)</legend>

        <!-- TRƯỜNG HỢP 1: SẢN PHẨM ĐƠN (Không có options) -->
        <div v-if="!hasOptions">
          <p class="text-sm text-gray-500 mb-4">
            Sản phẩm này không có thuộc tính. Vui lòng nhập thông tin cho biến thể mặc định.
          </p>
          <div v-if="localProduct.variants[0]" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <!-- TRƯỜNG HỢP 2: SẢN PHẨM CÓ BIẾN THỂ (Có options) -->
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

                  <!-- Các cột cố định -->
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Giá Bán *</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-600">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <!-- Hàng nhập liệu cho từng biến thể -->
                <tr v-for="(variant, index) in localProduct.variants" :key="index" class="border-b">
                  <!-- Cột chọn giá trị thuộc tính (động) -->
                  <td v-for="option in localProduct.options" :key="option.name" class="py-2 px-3">
                    <BaseDropdown
                      v-if="option.name"
                      v-model="variant.optionValues[option.name]"
                      :options="getOptionValuesArray(option.values)"
                      placeholder="Chọn"
                      :show-label="false"
                      class="min-w-[100px]"
                    />
                    <span v-else class="text-xs text-gray-500">...</span>
                  </td>

                  <!-- Cột nhập liệu cố định -->
                  <td class="py-2 px-3">
                    <BaseInput
                      type="number"
                      v-model.number="variant.price"
                      placeholder="Giá bán"
                      :show-label="false"
                      class="min-w-[100px]"
                    />
                  </td>
                  <td class="py-2 px-3">
                    <BaseSmallNoBgButton color="red" @click="removeVariant(index)">
                      Xóa
                    </BaseSmallNoBgButton>
                  </td>
                </tr>

                <!-- Hàng hiển thị lỗi (nếu có) -->
                <tr
                  v-for="(variant, index) in localProduct.variants"
                  :key="'err-' + index"
                  class="!border-0"
                >
                  <td :colspan="localProduct.options.length + 4" class="py-0 px-3">
                    <div v-if="getVariantErrors(index).price" class="text-red-500 text-xs">
                      Lỗi giá: {{ getVariantErrors(index).price }}
                    </div>
                    <div v-if="getVariantErrors(index).combination" class="text-red-500 text-xs">
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
