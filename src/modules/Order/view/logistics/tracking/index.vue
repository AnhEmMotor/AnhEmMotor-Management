<template>
  <div
    class="resp-page tracking-container relative w-full h-[calc(100vh-120px)] min-h-[600px] overflow-hidden bg-gray-100 dark:bg-gray-900 rounded-lg flex border border-gray-200 dark:border-gray-700"
  >
    <div
      class="w-[30%] min-w-[360px] max-w-[420px] h-full bg-white dark:bg-gray-800 shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 flex flex-col relative transition-all duration-300 border-r border-gray-200 dark:border-gray-700"
    >
      <transition name="el-fade-in-linear">
        <div
          v-show="!selectedOrder"
          class="absolute inset-0 flex flex-col h-full bg-white dark:bg-gray-800 z-10"
        >
          <div
            class="p-4 border-b dark:border-gray-700 flex flex-col gap-3 bg-white dark:bg-gray-800"
          >
            <h2 class="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center">
              <el-icon class="mr-2 text-blue-600"><MapLocation /></el-icon>
              {{ t('logistics.tracking.title', 'Tra cứu hành trình') }}
            </h2>
            <div class="flex gap-2">
              <el-input
                v-model="searchQuery"
                :placeholder="t('logistics.tracking.searchPlaceholder', 'Tìm SĐT, Vận đơn...')"
                class="flex-1"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <div
            class="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 custom-scrollbar"
            v-loading="loadingList"
          >
            <div
              v-if="filteredOrders.length === 0 && !loadingList"
              class="text-center text-gray-500 dark:text-gray-400 py-10 flex flex-col items-center"
            >
              <el-icon class="text-4xl text-gray-300 dark:text-gray-600 mb-2"><Box /></el-icon>
              Không có đơn hàng nào đang vận chuyển
            </div>

            <div
              v-for="order in filteredOrders"
              :key="order.trackingNumber"
              class="mb-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 group"
              @click="selectOrder(order)"
            >
              <div class="p-3.5">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <span
                      class="font-bold text-blue-700 dark:text-blue-400 text-[15px] group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors"
                      >{{ order.trackingNumber }}</span
                    >
                  </div>
                </div>

                <div class="text-sm mt-3 pt-2 border-t border-gray-50 dark:border-gray-700">
                  <div class="font-semibold text-gray-800 dark:text-gray-200">
                    {{ order.customerName }}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400 text-xs flex items-center mt-1">
                    <el-icon class="mr-1 text-gray-400 dark:text-gray-500 dark:text-gray-400"
                      ><Phone
                    /></el-icon>
                    {{ order.customerPhone }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <transition name="slide-left">
        <div
          v-if="selectedOrder"
          class="absolute inset-0 flex flex-col h-full bg-white dark:bg-gray-800 z-20 overflow-hidden shadow-xl"
        >
          <div
            class="p-3.5 border-b dark:border-gray-700 flex items-center bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="deselectOrder"
          >
            <el-icon class="text-gray-600 dark:text-gray-300 mr-2 text-xl"><ArrowLeft /></el-icon>
            <span class="font-semibold text-gray-700 dark:text-gray-200"
              >Trở lại danh sách đơn</span
            >
          </div>

          <div
            class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-gray-900"
            v-loading="loadingDetails"
          >
            <template v-if="trackingData">
              <div
                class="mb-5 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div
                  class="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-4"
                >
                  <div>
                    <div
                      class="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold mb-1"
                    >
                      Mã đơn hàng
                    </div>
                    <div class="font-bold text-gray-900 dark:text-gray-100 text-base">
                      {{ trackingData.trackingNumber }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold mb-1"
                    >
                      Thu hộ (COD)
                    </div>
                    <div
                      v-if="trackingData.codAmount === 0"
                      class="text-xs px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md font-bold border border-green-200 dark:border-green-800"
                    >
                      ĐÃ THANH TOÁN 0đ
                    </div>
                    <div v-else class="font-bold text-blue-700 dark:text-blue-400 text-lg">
                      {{ formatCurrency(trackingData.codAmount) }}
                    </div>
                  </div>
                </div>
                <div class="space-y-2.5">
                  <div
                    class="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2.5"
                  >
                    <div
                      class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300"
                    >
                      <el-icon><User /></el-icon>
                    </div>
                    {{ trackingData.customerName }}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2.5">
                    <div
                      class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300"
                    >
                      <el-icon><Phone /></el-icon>
                    </div>
                    {{ trackingData.customerPhone }}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2.5">
                    <div
                      class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 shrink-0"
                    >
                      <el-icon><Location /></el-icon>
                    </div>
                    <span class="leading-relaxed pt-1">{{
                      trackingData.customerAddress || 'Đang cập nhật địa chỉ giao hàng'
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h4
                  class="font-bold text-gray-800 dark:text-gray-200 mb-3 text-sm flex items-center gap-2"
                >
                  <el-icon class="text-blue-600 dark:text-blue-400 text-lg"><Box /></el-icon> Sản
                  phẩm bên trong
                  <span
                    class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md text-[11px] ml-auto border border-gray-200 dark:border-gray-600"
                    >{{ trackingData.items?.length || 0 }} món</span
                  >
                </h4>
                <div class="space-y-2.5">
                  <div
                    v-for="(item, idx) in trackingData.items"
                    :key="idx"
                    class="flex gap-3.5 items-center bg-white dark:bg-gray-800 p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      class="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-600 flex items-center justify-center"
                    >
                      <img
                        v-if="item.thumbnailUrl"
                        :src="formatImageUrl(item.thumbnailUrl)"
                        class="w-full h-full object-cover"
                      />
                      <el-icon v-else class="text-gray-300 dark:text-gray-500 text-2xl"
                        ><Picture
                      /></el-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div
                        class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate"
                        :title="item.productName"
                      >
                        {{ item.productName }}
                      </div>
                    </div>
                    <div
                      class="text-sm font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1.5 rounded-lg border border-orange-100 dark:border-orange-800 shadow-sm"
                    >
                      x{{ item.quantity }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h4
                  class="font-bold text-gray-800 dark:text-gray-200 mb-3 text-sm flex items-center gap-2"
                >
                  <el-icon class="text-blue-600 dark:text-blue-400 text-lg"><Timer /></el-icon>
                  Lịch sử hành trình
                </h4>
                <div
                  class="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                >
                  <el-timeline class="tracking-timeline mt-2">
                    <el-timeline-item
                      v-for="(milestone, idx) in sortedMilestones"
                      :key="idx"
                      :color="getMilestoneColor(milestone)"
                      :size="milestone.isCurrent ? 'large' : 'normal'"
                      :icon="milestone.isCurrent ? CircleCheckFilled : undefined"
                    >
                      <div class="flex flex-col gap-1">
                        <div
                          class="font-semibold text-sm"
                          :class="
                            milestone.isCurrent
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-200'
                          "
                        >
                          {{ milestone.description }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ formatDate(milestone.timestamp) }}
                        </div>
                        <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Tại: {{ milestone.location }}
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </template>
            <div
              v-else-if="!loadingDetails"
              class="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center"
            >
              <el-icon class="text-4xl text-gray-300 dark:text-gray-600 mb-2"
                ><WarningFilled
              /></el-icon>
              Không tải được dữ liệu chi tiết
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div class="flex-1 h-full relative z-0 bg-gray-100 dark:bg-gray-900">
      <div id="map" class="absolute inset-0 w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatImageUrl } from '@/common/utils/image';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getShipmentTracking,
  getActiveShipments,
  TrackingResponse,
  TrackingMilestone,
} from '@/api/logistics/tracking';
import type { ActiveShipmentItem } from '@/domain/logistics/active-shipment.types';
import {
  Search,
  MapLocation,
  Phone,
  WarningFilled,
  ArrowLeft,
  Timer,
  CircleCheckFilled,
  User,
  Location,
  Box,
  Picture,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const { t } = useI18n();

const map = ref<L.Map | null>(null);
const markersLayer = ref<L.LayerGroup | null>(null);
const polylineLayer = ref<L.LayerGroup | null>(null);

const searchQuery = ref('');
const loadingList = ref(false);
const loadingDetails = ref(false);

const inTransitOrders = ref<ActiveShipmentItem[]>([]);
const selectedOrder = ref<ActiveShipmentItem | null>(null);
const trackingData = ref<TrackingResponse | null>(null);

const filteredOrders = computed(() => {
  if (!searchQuery.value) return inTransitOrders.value;
  const q = searchQuery.value.toLowerCase();
  return inTransitOrders.value.filter(
    (o) =>
      o.trackingNumber.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.customerName.toLowerCase().includes(q)
  );
});

const sortedMilestones = computed(() => {
  if (!trackingData.value?.milestones) return [];
  return [...trackingData.value.milestones].sort(
    (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
  );
});

onMounted(() => {
  initMap();
  fetchActiveShipments();
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

function initMap() {
  map.value = L.map('map', {
    zoomControl: false,
  }).setView([10.9576, 106.8427], 9);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: 'abc',
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map.value as any);

  L.control.zoom({ position: 'bottomright' }).addTo(map.value as any);

  markersLayer.value = L.layerGroup().addTo(map.value as any);
  polylineLayer.value = L.layerGroup().addTo(map.value as any);
}

async function fetchActiveShipments() {
  loadingList.value = true;
  try {
    const res = await getActiveShipments();
    inTransitOrders.value = Array.isArray(res) ? res : (res as any).data || [];
  } catch (error) {
    console.error('Failed to fetch active shipments', error);
    ElMessage.error('Không thể tải danh sách đơn hàng đang vận chuyển.');
  } finally {
    loadingList.value = false;
  }
}

async function selectOrder(order: ActiveShipmentItem) {
  selectedOrder.value = order;
  loadingDetails.value = true;

  try {
    const res = await getShipmentTracking(order.trackingNumber);
    trackingData.value = (res as any).data || res;

    nextTick(() => {
      void drawTrackingData();
    });
  } catch (error) {
    console.error(error);
    ElMessage.error('Không tải được hành trình chi tiết của kiện hàng này.');
    trackingData.value = null;
    clearMap();
  } finally {
    loadingDetails.value = false;
  }
}

function deselectOrder() {
  selectedOrder.value = null;
  trackingData.value = null;
  clearMap();
  if (map.value) map.value.setView([10.9576, 106.8427], 9, { animate: true });
}

function clearMap() {
  if (markersLayer.value) markersLayer.value.clearLayers();
  if (polylineLayer.value) polylineLayer.value.clearLayers();
}

const MAX_SNAP_DISTANCE_METERS = 2000;

async function fetchRoadRoute(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.code !== 'Ok') return null;

    const badSnap = (data.waypoints as { distance: number }[] | undefined)?.some(
      (wp) => wp.distance > MAX_SNAP_DISTANCE_METERS
    );
    if (badSnap) return null;

    const coords = data?.routes?.[0]?.geometry?.coordinates as number[][] | undefined;
    if (!coords?.length) return null;
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch (error) {
    console.error('OSRM route fetch failed, falling back to straight line', error);
    return null;
  }
}

async function drawTrackingData() {
  clearMap();
  if (!trackingData.value || !map.value || !markersLayer.value || !polylineLayer.value) return;

  const startCoords: any = [
    trackingData.value.originLatitude || 10.9576,
    trackingData.value.originLongitude || 106.8427,
  ];

  const destCoords: any = [
    trackingData.value.destinationLatitude || startCoords[0] + 0.05,
    trackingData.value.destinationLongitude || startCoords[1] + 0.05,
  ];

  const requestedTrackingNumber = trackingData.value.trackingNumber;
  const fullPath = await fetchRoadRoute(startCoords, destCoords);

  if (
    !map.value ||
    !polylineLayer.value ||
    trackingData.value?.trackingNumber !== requestedTrackingNumber
  )
    return;

  L.polyline(fullPath || [startCoords, destCoords], {
    color: '#3b82f6',
    weight: 5,
    opacity: 0.9,
    lineJoin: 'round',
  }).addTo(polylineLayer.value as any);

  const startIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div class="w-8 h-8 bg-blue-800 text-white rounded-md flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  L.marker(startCoords, { icon: startIcon })
    .bindTooltip('Showroom Biên Hòa', { direction: 'top' })
    .addTo(markersLayer.value as any);

  const endIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  L.marker(destCoords, { icon: endIcon })
    .bindTooltip('Địa chỉ nhận hàng', { direction: 'top' })
    .addTo(markersLayer.value as any);

  const bounds = L.latLngBounds([startCoords, destCoords]);
  map.value.flyToBounds(bounds, { padding: [80, 80], duration: 1.2 });
}

function getMilestoneColor(milestone: TrackingMilestone) {
  if (milestone.isCurrent) {
    return '#3b82f6';
  }
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#374151' : '#e5e7eb';
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDate(dateStr: string) {
  return dayjs(dateStr).format('HH:mm - DD/MM/YYYY');
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(0 0 0 / 15%);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgb(0 0 0 / 30%);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-10%);
}

:deep(.tracking-timeline .el-timeline-item__node) {
  box-shadow: 0 0 0 4px white;
}

html.dark :deep(.tracking-timeline .el-timeline-item__node) {
  box-shadow: 0 0 0 4px #1f2937;
}

:deep(.tracking-timeline .el-timeline-item__tail) {
  border-left: 2px solid #e5e7eb;
}

html.dark :deep(.tracking-timeline .el-timeline-item__tail) {
  border-left: 2px solid #374151;
}
</style>
