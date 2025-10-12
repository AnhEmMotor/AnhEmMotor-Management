import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useItemStore = defineStore('item', () => {
  // State
  const items = ref([]);
  const itemCounter = ref(0);
  const overallDiscountValue = ref(0);
  const overallDiscountType = ref('VND');

  // Getters
  const totalGoods = computed(() => {
    return items.value.reduce((sum, item) => sum + item.total, 0);
  });

  const calculatedDiscount = computed(() => {
    if (overallDiscountType.value === 'VND') {
      return overallDiscountValue.value;
    } else {
      return (totalGoods.value * overallDiscountValue.value) / 100;
    }
  });

  const finalTotal = computed(() => {
    return Math.max(0, totalGoods.value - calculatedDiscount.value);
  });

  // Actions
  function addItem(itemData) {
    itemCounter.value++;
    const newItem = {
      id: itemCounter.value,
      code: `SP${String(itemCounter.value).padStart(6, '0')}`,
      name: itemData.name,
      unit: itemData.unit,
      quantity: itemData.quantity,
      price: 0,
      discountValue: 0,
      discountType: 'VND',
      discountAmount: 0,
      total: 0,
      sellingPrice: itemData.sellingPrice
    };
    items.value.push(newItem);
  }

  function updateItem(itemId, updates) {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      calculateItemTotal(itemId);
    }
  }

  function calculateItemTotal(itemId) {
    const item = items.value.find(i => i.id === itemId);
    if (!item) return;

    const subtotal = item.quantity * item.price;
    let discountAmount = 0;

    if (item.discountType === 'VND') {
      discountAmount = item.discountValue;
    } else {
      discountAmount = (subtotal * item.discountValue) / 100;
    }

    item.discountAmount = discountAmount;
    item.total = Math.max(0, subtotal - discountAmount);
  }

  function removeItem(itemId) {
    const index = items.value.findIndex(i => i.id === itemId);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  }

  function clearAllItems() {
    items.value = [];
    itemCounter.value = 0;
    overallDiscountValue.value = 0;
    overallDiscountType.value = 'VND';
  }

  function setOverallDiscount(value, type) {
    overallDiscountValue.value = value;
    if (type) overallDiscountType.value = type;
  }

  return {
    items,
    itemCounter,
    overallDiscountValue,
    overallDiscountType,
    totalGoods,
    calculatedDiscount,
    finalTotal,
    addItem,
    updateItem,
    removeItem,
    clearAllItems,
    setOverallDiscount,
    calculateItemTotal
  };
});