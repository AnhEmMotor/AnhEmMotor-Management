<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';

const props = defineProps({
    filters: Object
});
const emit = defineEmits(['update:filters']);

// Tạo bản sao của filters
const localFilters = ref({
    ...JSON.parse(JSON.stringify(props.filters)),
    'Thời gian': 'Tháng này'
});

const isTimePopupOpen = ref(false);
const selectedTimeLabel = ref('Tháng này');

const timeFilterButton = ref(null);
const timeFilterPopup = ref(null);

// Emit khi filters thay đổi
watch(localFilters, (newFilters) => {
    emit('update:filters', newFilters);
}, { deep: true });

// Toggle popup thời gian
function toggleTimePopup(event) {
    event.stopPropagation();
    isTimePopupOpen.value = !isTimePopupOpen.value;
}

// Chọn thời gian từ các nút nhanh (Hôm nay, Tuần này,...)
function selectTimeOption(event) {
    // Xóa class active từ tất cả
    timeFilterPopup.value.querySelectorAll('.time-option').forEach(opt => {
        opt.classList.remove('bg-red-600', 'text-white');
    });

    // Thêm class active vào nút được chọn
    event.target.classList.add('bg-red-600', 'text-white');

    const label = event.target.textContent.trim();
    selectedTimeLabel.value = label;

    localFilters.value['Thời gian'] = label;
    isTimePopupOpen.value = false;
}

// Đóng popup khi click ngoài
function closePopupOnClickOutside(event) {
    if (
        isTimePopupOpen.value &&
        timeFilterPopup.value &&
        !timeFilterPopup.value.contains(event.target) &&
        !timeFilterButton.value.contains(event.target)
    ) {
        isTimePopupOpen.value = false;
    }
}

// Mount: init flatpickr + add event
onMounted(() => {
    document.addEventListener('click', closePopupOnClickOutside);
    flatpickr("#custom-date-range", {
        mode: "range",
        dateFormat: "d/m/Y",
        locale: Vietnamese,
        onChange: function (selectedDates, dateStr) {
            if (selectedDates.length === 2) {
                selectedTimeLabel.value = dateStr;
                localFilters.value['Thời gian'] = {
                    from: selectedDates[0],
                    to: selectedDates[1]
                };
                isTimePopupOpen.value = false;
            }
        }
    });
});

onBeforeUnmount(() => {
    document.removeEventListener('click', closePopupOnClickOutside);
});
</script>

<template>
    <div class="w-60 bg-white border-r border-gray-200 p-3 flex-shrink-0 custom-scroll overflow-y-auto">
        <!-- Nhóm trạng thái -->
        <div class="mb-4">
            <h2 class="text-gray-500 font-semibold mb-2 text-xs uppercase">Trạng thái</h2>
            <ul class="space-y-1 text-xs text-gray-700">
                <li class="flex items-center space-x-2">
                    <input type="checkbox" id="status-draft" v-model="localFilters['Phiếu tạm']"
                        class="status-filter w-3 h-3 rounded text-red-600 focus:ring-red-500">
                    <label for="status-draft">Phiếu tạm</label>
                </li>
                <li class="flex items-center space-x-2">
                    <input type="checkbox" id="status-received" v-model="localFilters['Đã nhập hàng']"
                        class="status-filter w-3 h-3 rounded text-red-600 focus:ring-red-500">
                    <label for="status-received" class="font-medium">Đã nhập hàng</label>
                </li>
                <li class="flex items-center space-x-2">
                    <input type="checkbox" id="status-cancelled" v-model="localFilters['Đã hủy']"
                        class="status-filter w-3 h-3 rounded text-red-600 focus:ring-red-500">
                    <label for="status-cancelled">Đã hủy</label>
                </li>
            </ul>
        </div>

        <!-- Nhóm thời gian -->
         <!-- Nhóm thời gian -->
        <div class="mb-4">
            <h2 class="text-gray-500 font-semibold mb-2 text-xs uppercase">Thời gian</h2>
            <div class="relative text-xs text-gray-700">
                <!-- Nút mở popup -->
                <button ref="timeFilterButton" @click="toggleTimePopup"
                    class="w-full flex items-center justify-between cursor-pointer bg-red-50 text-red-700 py-1.5 px-2 rounded-md border border-red-200">
                    <div class="flex items-center space-x-2">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h.01M3 21h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="font-medium">{{ selectedTimeLabel }}</span>
                    </div>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <!-- Popup -->
                <div ref="timeFilterPopup" v-show="isTimePopupOpen"
                    class="time-filter-popup fixed z-50 w-[520px] bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-2">
                    <div class="grid grid-cols-5 gap-2 text-center">
                        <div class="font-semibold">Theo ngày</div>
                        <div class="font-semibold">Theo tuần</div>
                        <div class="font-semibold">Theo tháng</div>
                        <div class="font-semibold">Theo quý</div>
                        <div class="font-semibold">Theo năm</div>

                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Hôm nay</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Tuần này</button>
                        <button class="time-option p-1 rounded bg-red-600 text-white" @click="selectTimeOption">Tháng này</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Quý này</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Năm nay</button>

                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Hôm qua</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Tuần trước</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Tháng trước</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Quý trước</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">Năm trước</button>

                        <div></div>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">7 ngày qua</button>
                        <button class="time-option p-1 rounded hover:bg-gray-100" @click="selectTimeOption">30 ngày qua</button>
                        <div></div>
                        <div></div>
                    </div>

                    <div class="border-t mt-3 pt-2">
                        <label class="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-100">
                            <input type="radio" name="time-choice" class="form-radio h-3 w-3 text-red-600">
                            <span>Tùy chỉnh</span>
                        </label>
                        <div class="mt-2">
                            <input id="custom-date-range" type="text" placeholder="Chọn khoảng thời gian"
                                class="w-full p-1 border border-gray-300 rounded text-xs">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
