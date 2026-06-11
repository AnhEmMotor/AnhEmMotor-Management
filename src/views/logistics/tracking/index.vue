<template>
  <div
    class="tracking-container relative w-full h-[calc(100vh-120px)] min-h-[600px] overflow-hidden bg-gray-100 rounded-lg flex border border-gray-200"
  >
    <!-- LEFT SIDEBAR: 30% Width -->
    <div
      class="w-[30%] min-w-[360px] max-w-[420px] h-full bg-white shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 flex flex-col relative transition-all duration-300 border-r border-gray-200"
    >
      <!-- STATE 1: Overview List -->
      <transition name="el-fade-in-linear">
        <div v-show="!selectedOrder" class="absolute inset-0 flex flex-col h-full bg-white z-10">
          <div class="p-4 border-b flex flex-col gap-3 bg-white">
            <h2 class="font-bold text-lg text-gray-800 flex items-center">
              <el-icon class="mr-2 text-blue-600"><MapLocation /></el-icon>
              {{ t('logistics.tracking.title', 'Tra cứu hành trình') }}
            </h2>
            <div class="flex gap-2">
              <el-input
                v-model="searchQuery"
                :placeholder="
                  t('logistics.fulfillment.tracking.searchPlaceholder', 'Tìm SĐT, Vận đơn...')
                "
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
            class="flex-1 overflow-y-auto p-3 bg-gray-50 custom-scrollbar"
            v-loading="loadingList"
          >
            <div
              v-if="filteredOrders.length === 0 && !loadingList"
              class="text-center text-gray-500 py-10 flex flex-col items-center"
            >
              <el-icon class="text-4xl text-gray-300 mb-2"><Box /></el-icon>
              Không có đơn hàng nào đang vận chuyển
            </div>

            <div
              v-for="order in filteredOrders"
              :key="order.trackingNumber"
              class="mb-3 rounded-xl bg-white border border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 group"
              @click="selectOrder(order)"
            >
              <div class="p-3.5">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <span
                      class="font-bold text-blue-700 text-[15px] group-hover:text-blue-800 transition-colors"
                      >{{ order.trackingNumber }}</span
                    >
                    <div class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <el-icon><Van /></el-icon> {{ order.carrier }}
                    </div>
                  </div>
                  <div
                    class="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200"
                  >
                    {{ order.daysInTransit }} ngày
                  </div>
                </div>

                <div class="text-sm mt-3 pt-2 border-t border-gray-50">
                  <div class="font-semibold text-gray-800">{{ order.customerName }}</div>
                  <div class="text-gray-600 text-xs flex items-center mt-1">
                    <el-icon class="mr-1 text-gray-400"><Phone /></el-icon>
                    {{ order.customerPhone }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- STATE 2: Order Detail & ETA -->
      <transition name="slide-left">
        <div
          v-if="selectedOrder"
          class="absolute inset-0 flex flex-col h-full bg-white z-20 overflow-hidden shadow-xl"
        >
          <!-- Back Button Header -->
          <div
            class="p-3.5 border-b flex items-center bg-white sticky top-0 z-10 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            @click="deselectOrder"
          >
            <el-icon class="text-gray-600 mr-2 text-xl"><ArrowLeft /></el-icon>
            <span class="font-semibold text-gray-700">Trở lại danh sách đơn</span>
          </div>

          <div
            class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50"
            v-loading="loadingDetails"
          >
            <template v-if="trackingData">
              <!-- ETA Card (Hộp Tiêu Điểm) -->
              <div
                class="rounded-2xl p-5 mb-5 text-white shadow-lg relative overflow-hidden transition-colors duration-500"
                :class="isEtaRisk ? 'bg-red-600' : 'bg-blue-700'"
              >
                <!-- Decorative background elements -->
                <div
                  class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white opacity-10"
                ></div>
                <div
                  class="absolute right-12 -bottom-8 w-20 h-20 rounded-full bg-white opacity-10"
                ></div>

                <div class="flex items-center gap-2 mb-2 relative z-10">
                  <el-icon class="text-xl opacity-90"><Timer /></el-icon>
                  <span class="font-semibold text-xs uppercase tracking-wider opacity-90"
                    >Dự kiến giao</span
                  >
                </div>
                <div
                  class="text-[22px] font-black tracking-tight mb-3 flex items-center gap-2 relative z-10 drop-shadow-sm"
                >
                  {{ formatEtaDate(trackingData.estimatedDeliveryDate) }}
                </div>
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm relative z-10 backdrop-blur-sm"
                  :class="
                    isEtaRisk
                      ? 'bg-red-900/40 text-red-50 border border-red-500/50'
                      : 'bg-blue-900/40 text-blue-50 border border-blue-500/50'
                  "
                >
                  <el-icon v-if="isEtaRisk" class="text-sm"><WarningFilled /></el-icon>
                  <el-icon v-else class="text-sm"><CircleCheckFilled /></el-icon>
                  {{ etaStatusText }}
                </div>
              </div>

              <!-- Order Info (Khối Chi tiết đơn hàng) -->
              <div class="mb-5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div class="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                  <div>
                    <div
                      class="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1"
                      >Mã đơn hàng</div
                    >
                    <div class="font-bold text-gray-900 text-base">{{
                      trackingData.trackingNumber
                    }}</div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1"
                      >Thu hộ (COD)</div
                    >
                    <div
                      v-if="trackingData.codAmount === 0"
                      class="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-md font-bold border border-green-200"
                    >
                      ĐÃ THANH TOÁN 0đ
                    </div>
                    <div v-else class="font-bold text-blue-700 text-lg">
                      {{ formatCurrency(trackingData.codAmount) }}
                    </div>
                  </div>
                </div>
                <div class="space-y-2.5">
                  <div class="font-semibold text-gray-800 flex items-center gap-2.5">
                    <div
                      class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                      ><el-icon><User /></el-icon
                    ></div>
                    {{ trackingData.customerName }}
                  </div>
                  <div class="text-gray-600 text-sm flex items-center gap-2.5">
                    <div
                      class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                      ><el-icon><Phone /></el-icon
                    ></div>
                    {{ trackingData.customerPhone }}
                  </div>
                  <div class="text-gray-600 text-sm flex items-start gap-2.5">
                    <div
                      class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"
                      ><el-icon><Location /></el-icon
                    ></div>
                    <span class="leading-relaxed pt-1">{{
                      trackingData.customerAddress || 'Đang cập nhật địa chỉ giao hàng'
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Product Items List (Khối Danh sách mặt hàng) -->
              <div class="mb-6">
                <h4 class="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <el-icon class="text-blue-600 text-lg"><Box /></el-icon> Sản phẩm bên trong
                  <span
                    class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[11px] ml-auto border border-gray-200"
                    >{{ trackingData.items?.length || 0 }} món</span
                  >
                </h4>
                <div class="space-y-2.5">
                  <div
                    v-for="(item, idx) in trackingData.items"
                    :key="idx"
                    class="flex gap-3.5 items-center bg-white p-2.5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      class="w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center"
                    >
                      <img
                        v-if="item.thumbnailUrl"
                        :src="item.thumbnailUrl"
                        class="w-full h-full object-cover"
                      />
                      <el-icon v-else class="text-gray-300 text-2xl"><Picture /></el-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div
                        class="text-sm font-semibold text-gray-800 truncate"
                        :title="item.productName"
                        >{{ item.productName }}</div
                      >
                      <div
                        class="text-[11px] text-gray-500 mt-1 bg-gray-100 inline-block px-1.5 py-0.5 rounded"
                        >SKU: {{ item.sku || 'N/A' }}</div
                      >
                    </div>
                    <div
                      class="text-sm font-bold bg-orange-50 text-orange-600 px-2.5 py-1.5 rounded-lg border border-orange-100 shadow-sm"
                    >
                      x{{ item.quantity }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Milestone Logs (Trục thời gian hành trình) -->
              <div>
                <h4 class="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                  <el-icon class="text-blue-600 text-lg"><Calendar /></el-icon> Lịch sử vận chuyển
                </h4>
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <el-timeline class="tracking-timeline">
                    <el-timeline-item
                      v-for="(milestone, idx) in sortedMilestones"
                      :key="idx"
                      :timestamp="formatDate(milestone.timestamp)"
                      :color="getMilestoneColor(milestone)"
                      :size="milestone.isCurrent ? 'large' : 'normal'"
                      :icon="milestone.isCurrent ? Location : undefined"
                      class="transition-all"
                    >
                      <div
                        :class="{
                          'font-bold text-gray-900 text-sm': milestone.isCurrent,
                          'font-semibold text-gray-600 text-sm': !milestone.isCurrent,
                        }"
                      >
                        {{ milestone.location }}
                      </div>
                      <div
                        class="text-xs mt-1 leading-relaxed"
                        :class="{
                          'text-gray-800 font-medium': milestone.isCurrent,
                          'text-gray-500': !milestone.isCurrent,
                        }"
                      >
                        {{ milestone.description }}
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </template>
            <div
              v-else-if="!loadingDetails"
              class="text-center text-gray-500 py-12 flex flex-col items-center"
            >
              <el-icon class="text-4xl text-gray-300 mb-2"><WarningFilled /></el-icon>
              Không tải được dữ liệu chi tiết
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- RIGHT AREA: Map (70%) -->
    <div class="flex-1 h-full relative z-0 bg-gray-100">
      <div id="map" class="absolute inset-0 w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import {
    getShipmentTracking,
    getActiveShipments,
    TrackingResponse,
    TrackingMilestone,
  } from '@/api/logistics/tracking'
  import type { ActiveShipmentItem } from '@/domain/logistics/active-shipment.types'
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
    Calendar,
    Van,
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import dayjs from 'dayjs'

  // Fix Leaflet icons
  import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
  import markerIcon from 'leaflet/dist/images/marker-icon.png'
  import markerShadow from 'leaflet/dist/images/marker-shadow.png'

  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })

  const { t } = useI18n()

  const map = ref<L.Map | null>(null)
  const markersLayer = ref<L.LayerGroup | null>(null)
  const polylineLayer = ref<L.LayerGroup | null>(null)

  const searchQuery = ref('')
  const loadingList = ref(false)
  const loadingDetails = ref(false)

  const inTransitOrders = ref<ActiveShipmentItem[]>([])
  const selectedOrder = ref<ActiveShipmentItem | null>(null)
  const trackingData = ref<TrackingResponse | null>(null)

  // Coordinates fallback
  const SHOWROOM_COORDS: L.LatLngExpression = [10.9576, 106.8427] // Biên Hòa

  const filteredOrders = computed(() => {
    if (!searchQuery.value) return inTransitOrders.value
    const q = searchQuery.value.toLowerCase()
    return inTransitOrders.value.filter(
      (o) =>
        o.trackingNumber.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerName.toLowerCase().includes(q),
    )
  })

  const sortedMilestones = computed(() => {
    if (!trackingData.value?.milestones) return []
    return [...trackingData.value.milestones].sort(
      (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
    ) // Newest first for timeline
  })

  // UX Logic: ETA Risk Calculation
  const hoursRemaining = computed(() => {
    if (!trackingData.value?.estimatedDeliveryDate) return 48 // fallback
    const eta = dayjs(trackingData.value.estimatedDeliveryDate)
    return eta.diff(dayjs(), 'hour', true)
  })

  const isEtaRisk = computed(() => {
    // Danger if less than or equal to 5 hours remaining, or already stuck
    return hoursRemaining.value <= 5 || selectedOrder.value?.isStuck
  })

  const etaStatusText = computed(() => {
    if (isEtaRisk.value) {
      if (hoursRemaining.value < 0)
        return `Trễ hạn ${Math.abs(Math.round(hoursRemaining.value))} giờ`
      return `Còn lại: ${Math.round(hoursRemaining.value)} giờ - Nguy cơ trễ hẹn`
    }
    const days = Math.floor(hoursRemaining.value / 24)
    const hrs = Math.round(hoursRemaining.value % 24)
    if (days > 0) return `Còn lại: ${days} ngày ${hrs} giờ - Đúng tiến độ`
    return `Còn lại: ${hrs} giờ - Đúng tiến độ`
  })

  onMounted(() => {
    initMap()
    fetchActiveShipments()
  })

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
    }
  })

  function initMap() {
    map.value = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([10.9576, 106.8427], 9)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map.value)

    L.control.zoom({ position: 'bottomright' }).addTo(map.value)

    markersLayer.value = L.layerGroup().addTo(map.value)
    polylineLayer.value = L.layerGroup().addTo(map.value)
  }

  async function fetchActiveShipments() {
    loadingList.value = true
    try {
      const res = await getActiveShipments()
      inTransitOrders.value = Array.isArray(res) ? res : (res as any).data || []
    } catch (error) {
      console.error('Failed to fetch active shipments', error)
      ElMessage.error('Không thể tải danh sách đơn hàng đang vận chuyển.')
    } finally {
      loadingList.value = false
    }
  }

  async function selectOrder(order: ActiveShipmentItem) {
    selectedOrder.value = order
    loadingDetails.value = true

    try {
      const res = await getShipmentTracking(order.trackingNumber)
      trackingData.value = (res as any).data || res

      // Mock ETA if missing for demonstration
      if (!trackingData.value.estimatedDeliveryDate) {
        trackingData.value.estimatedDeliveryDate = dayjs()
          .add(order.isStuck ? 2 : 24, 'hour')
          .toISOString()
      }

      nextTick(() => {
        drawTrackingData()
      })
    } catch (error) {
      console.error(error)
      ElMessage.error('Không tải được hành trình chi tiết của kiện hàng này.')
      trackingData.value = null
      clearMap()
    } finally {
      loadingDetails.value = false
    }
  }

  function deselectOrder() {
    selectedOrder.value = null
    trackingData.value = null
    clearMap()
    if (map.value) map.value.setView([10.9576, 106.8427], 9, { animate: true })
  }

  function clearMap() {
    if (markersLayer.value) markersLayer.value.clearLayers()
    if (polylineLayer.value) polylineLayer.value.clearLayers()
  }

  function drawTrackingData() {
    clearMap()
    if (!trackingData.value || !map.value || !markersLayer.value || !polylineLayer.value) return

    const milestones = trackingData.value.milestones
    if (milestones.length === 0) return

    // Find coordinates
    const startCoords: L.LatLngExpression = [
      trackingData.value.originLatitude || SHOWROOM_COORDS[0],
      trackingData.value.originLongitude || SHOWROOM_COORDS[1],
    ]

    const currentMilestone =
      milestones.find((m) => m.isCurrent) || milestones[milestones.length - 1]
    const currentCoords: L.LatLngExpression = [
      currentMilestone.latitude,
      currentMilestone.longitude,
    ]

    // Mock Destination if missing (just slightly far from current for demo)
    const destCoords: L.LatLngExpression = [
      trackingData.value.destinationLatitude || currentMilestone.latitude + 0.05,
      trackingData.value.destinationLongitude || currentMilestone.longitude + 0.05,
    ]

    // DRAW POLYLINES
    // 1. Start -> Current (Solid line - Completed)
    L.polyline([startCoords, currentCoords], {
      color: '#3b82f6', // blue-500
      weight: 5,
      opacity: 0.9,
      lineJoin: 'round',
    }).addTo(polylineLayer.value)

    // 2. Current -> End (Dashed grey line - Expected)
    L.polyline([currentCoords, destCoords], {
      color: '#9ca3af', // gray-400
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8',
      lineJoin: 'round',
    }).addTo(polylineLayer.value)

    // DRAW MARKERS
    // 1. Start (Showroom)
    const startIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 bg-blue-800 text-white rounded-md flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })
    L.marker(startCoords, { icon: startIcon })
      .bindTooltip('Showroom Biên Hòa', { direction: 'top' })
      .addTo(markersLayer.value)

    // 2. Current (Bưu cục)
    const pulseColor = isEtaRisk.value ? '#ef4444' : '#3b82f6' // red or blue
    const pulseClass = isEtaRisk.value ? 'marker-risk-pulse' : 'marker-safe-pulse'

    const currentIcon = L.divIcon({
      className: `custom-marker ${pulseClass}`,
      html: `<div style="border-color: ${pulseColor};" class="relative w-9 h-9 rounded-full border-[3px] shadow-lg bg-white flex items-center justify-center z-50">
            <div style="background-color: ${pulseColor};" class="w-3.5 h-3.5 rounded-full"></div>
           </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })
    L.marker(currentCoords, { icon: currentIcon })
      .bindTooltip(`<b>Bưu cục hiện tại</b><br/>${currentMilestone.location}`, {
        direction: 'top',
        offset: [0, -18],
      })
      .addTo(markersLayer.value)

    // 3. Destination (Customer)
    const endIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
    L.marker(destCoords, { icon: endIcon })
      .bindTooltip('Địa chỉ nhận hàng', { direction: 'top' })
      .addTo(markersLayer.value)

    // Auto zoom to fit the route
    const bounds = L.latLngBounds([startCoords, currentCoords, destCoords])
    map.value.flyToBounds(bounds, { padding: [80, 80], duration: 1.2 })
  }

  function getMilestoneColor(milestone: TrackingMilestone) {
    if (milestone.isCurrent) {
      return isEtaRisk.value ? '#ef4444' : '#3b82f6'
    }
    return '#e5e7eb' // gray-200
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  function formatDate(dateStr: string) {
    return dayjs(dateStr).format('HH:mm - DD/MM/YYYY')
  }

  function formatEtaDate(dateStr?: string) {
    if (!dateStr) return 'Đang cập nhật...'
    return dayjs(dateStr).format('HH:mm - DD/MM/YYYY')
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

  /* Slide Transition for Detail Panel */
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

  /* Timeline Customization */
  :deep(.tracking-timeline .el-timeline-item__node) {
    box-shadow: 0 0 0 4px white;
  }

  :deep(.tracking-timeline .el-timeline-item__tail) {
    border-left: 2px solid #e5e7eb;
  }

  /* Radar Pulse Animations */
  :deep(.marker-safe-pulse::after) {
    position: absolute;
    inset: -8px;
    pointer-events: none;
    content: '';
    border: 2px solid #3b82f6;
    border-radius: 50%;
    animation: safe-ripple 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }

  :deep(.marker-risk-pulse::after) {
    position: absolute;
    inset: -8px;
    pointer-events: none;
    content: '';
    background: rgb(239 68 68 / 20%);
    border: 2px solid #ef4444;
    border-radius: 50%;
    animation: risk-ripple 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes safe-ripple {
    0% {
      opacity: 1;
      transform: scale(0.6);
    }

    100% {
      opacity: 0;
      transform: scale(2.2);
    }
  }

  @keyframes risk-ripple {
    0% {
      opacity: 1;
      transform: scale(0.8);
    }

    50% {
      opacity: 0.8;
    }

    100% {
      opacity: 0;
      transform: scale(2);
    }
  }
</style>
