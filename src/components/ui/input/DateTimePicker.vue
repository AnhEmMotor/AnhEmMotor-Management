<template>
  <div class="w-full">
    <label v-if="label" :for="dateId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <div class="relative w-full">
      <input
        :id="dateId"
        ref="flatpickrInput"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="readonly"
        class="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:outline-none transition-all duration-300"
        :class="{ 'bg-gray-100 cursor-not-allowed': readonly }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'dd/mm/yyyy',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const flatpickrInput = ref(null)
let fpInstance = null

const dateId = computed(() => `base-datetime-${Math.random().toString(36).substring(2, 9)}`)

onMounted(() => {
  if (flatpickrInput.value && !props.readonly) {
    fpInstance = flatpickr(flatpickrInput.value, {
      locale: Vietnamese,
      altInput: true,
      altFormat: 'd/m/Y',
      dateFormat: 'Y-m-d',
      allowInput: true,
      monthSelectorType: 'dropdown',
      altInputClass:
        'w-full p-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 h-[42px] px-3 flex-1',
      defaultDate: props.modelValue,
      onReady: (selectedDates, dateStr, instance) => {
        instance.calendarContainer.classList.add('premium-red-theme')
      },
      onValueUpdate: (selectedDates, dateStr) => {
        emit('update:modelValue', dateStr)
      },
      onChange: (selectedDates, dateStr) => {
        emit('update:modelValue', dateStr)
      },
    })

    const altInput = fpInstance.altInput
    if (altInput) {
      altInput.addEventListener('blur', (e) => {
        const parsed = fpInstance.parseDate(e.target.value, 'd/m/Y')
        if (parsed) {
          fpInstance.setDate(parsed, true)
        }
      })
    }
  }
})

onBeforeUnmount(() => {
  if (fpInstance) {
    fpInstance.destroy()
  }
})
</script>

<style>
.premium-red-theme {
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
  border-radius: 0.75rem !important;
}

.premium-red-theme .flatpickr-day.selected,
.premium-red-theme .flatpickr-day.startRange,
.premium-red-theme .flatpickr-day.endRange,
.premium-red-theme .flatpickr-day.selected.inRange,
.premium-red-theme .flatpickr-day.startRange.inRange,
.premium-red-theme .flatpickr-day.endRange.inRange,
.premium-red-theme .flatpickr-day.selected:focus,
.premium-red-theme .flatpickr-day.startRange:focus,
.premium-red-theme .flatpickr-day.endRange:focus,
.premium-red-theme .flatpickr-day.selected:hover,
.premium-red-theme .flatpickr-day.startRange:hover,
.premium-red-theme .flatpickr-day.endRange:hover,
.premium-red-theme .flatpickr-day.selected.prevMonthDay,
.premium-red-theme .flatpickr-day.selected.nextMonthDay {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
  color: white !important;
}

.premium-red-theme .flatpickr-day.today {
  border-color: #dc2626 !important;
}

.premium-red-theme .flatpickr-day.today:hover {
  background: #dc2626 !important;
  color: white !important;
}

.premium-red-theme .flatpickr-months .flatpickr-prev-month:hover svg,
.premium-red-theme .flatpickr-months .flatpickr-next-month:hover svg {
  fill: #dc2626 !important;
}

.premium-red-theme .flatpickr-current-month {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  width: 100% !important;
  left: 0 !important;
  padding: 0 10px !important;
}

.premium-red-theme .flatpickr-current-month .flatpickr-monthDropdown-months {
  width: auto !important;
  flex: none !important;
  padding: 2px 8px !important;
  border-radius: 4px !important;
}

.premium-red-theme .flatpickr-current-month .flatpickr-monthDropdown-months:hover {
  background: rgba(220, 38, 38, 0.05) !important;
}

.premium-red-theme .numInputWrapper {
  width: 65px !important;
  flex: none !important;
}

.premium-red-theme .numInputWrapper input.cur-year {
  font-weight: 700 !important;
  color: #374151 !important;
}

.premium-red-theme .numInputWrapper span.arrowUp:after {
  border-bottom-color: #dc2626 !important;
}

.premium-red-theme .numInputWrapper span.arrowDown:after {
  border-top-color: #dc2626 !important;
}

.premium-red-theme .flatpickr-weekday {
  color: #6b7280 !important;
  font-weight: 600 !important;
}

.premium-red-theme .flatpickr-month {
  fill: #dc2626 !important;
  height: 34px !important;
}
.flatpickr-wrapper {
  width: 100% !important;
  display: block !important;
}

.premium-red-theme.flatpickr-calendar {
  width: 307.875px !important;
}
</style>


