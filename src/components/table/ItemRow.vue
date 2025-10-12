<template>
  <div
    :id="`item-row-${item.id}`"
    class="grid grid-cols-12 gap-3 px-4 py-3 border-b items-start text-xs"
  >
    <div class="col-span-1 pt-1">{{ item.id }}</div>
    <div class="col-span-2 pt-1">
      <a href="#" class="text-red-600 font-semibold hover:underline">{{ item.code }}</a>
    </div>
    <div class="col-span-2 pt-1">
      <p class="text-gray-800 font-medium">{{ item.name }}</p>
    </div>
    <div class="col-span-1">
      <input
        type="text"
        :value="item.unit"
        class="table-input"
        style="text-align: left;"
        @input="updateUnit"
      />
    </div>
    <div class="col-span-1">
      <input
        type="text"
        :value="formatNumber(item.quantity)"
        class="table-input"
        @input="updateQuantity"
      />
    </div>
    <div class="col-span-1">
      <input
        type="text"
        :value="formatNumber(item.price)"
        class="table-input"
        :class="{
          'text-red-600 border-red-500': isPriceInvalid
        }"
        @input="updatePrice"
      />
      <div class="text-red-600 text-[10px] mt-0.5 h-3">
        {{ isPriceInvalid ? 'Lớn hơn giá bán' : '' }}
      </div>
    </div>
    <div class="col-span-2 relative">
      <input
        type="text"
        :value="formatNumber(item.discountAmount)"
        readonly
        class="table-input cursor-pointer bg-white"
        @click="toggleDiscountPopup"
      />
      <div
        v-if="showDiscountPopup"
        class="discount-popup"
        @click.stop
      >
        <label class="block text-xs font-medium text-gray-700 mb-2">Giảm giá</label>
        <div class="flex gap-2 items-center">
          <input
            type="text"
            :value="formatNumber(item.discountValue)"
            class="table-input flex-1 text-base"
            @input="updateDiscountValue"
          />
          <DiscountToggle
            v-model="localDiscountType"
            @update:model-value="updateDiscountType"
          />
        </div>
      </div>
    </div>
    <div class="col-span-2">
      <input
        type="text"
        :value="formatNumber(item.total)"
        readonly
        class="table-input bg-gray-50 border-solid"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useItemStore } from '@/stores/itemStore';
import { formatNumber } from '@/utils/formatters';
import DiscountToggle from '@/components/common/DiscountToggle.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle-popup']);

const itemStore = useItemStore();
const showDiscountPopup = ref(false);
const localDiscountType = ref(props.item.discountType);

const isPriceInvalid = computed(() => {
  return props.item.sellingPrice > 0 && props.item.price > props.item.sellingPrice;
});

// ❌ XÓA FUNCTION NÀY (dòng 107-110)
// function parseFormattedNumber(value) {
//   if (typeof value !== 'string') value = String(value);
//   return parseInt(value.replace(/\./g, ''), 10) || 0;
// }

function updateQuantity(event) {
  const value = event.target.value.replace(/[^0-9]/g, '');
  const numValue = value ? parseInt(value, 10) : 0;
  event.target.value = formatNumber(numValue);
  itemStore.updateItem(props.item.id, { quantity: numValue });
}

function updatePrice(event) {
  const value = event.target.value.replace(/[^0-9]/g, '');
  const numValue = value ? parseInt(value, 10) : 0;
  event.target.value = formatNumber(numValue);
  itemStore.updateItem(props.item.id, { price: numValue });
}

function updateUnit(event) {
  itemStore.updateItem(props.item.id, { unit: event.target.value });
}

function updateDiscountValue(event) {
  const value = event.target.value.replace(/[^0-9]/g, '');
  const numValue = value ? parseInt(value, 10) : 0;
  event.target.value = formatNumber(numValue);
  itemStore.updateItem(props.item.id, { discountValue: numValue });
}

function updateDiscountType(type) {
  itemStore.updateItem(props.item.id, { discountType: type });
}

function toggleDiscountPopup() {
  showDiscountPopup.value = !showDiscountPopup.value;
  emit('toggle-popup', props.item.id);
}

watch(() => props.item.discountType, (newType) => {
  localDiscountType.value = newType;
});

defineExpose({
  closePopup: () => {
    showDiscountPopup.value = false;
  }
});
</script>