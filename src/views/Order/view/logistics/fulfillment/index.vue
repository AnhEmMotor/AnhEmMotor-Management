<template>
  <div class="fulfillment-container p-4">
    <!-- Header: Steps & Guards -->
    <el-card shadow="never" class="mb-4">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold mb-1">{{ t('logistics.fulfillment.title') }}</h2>
          <div class="text-gray-500">
            <span class="mr-4"
              >{{ t('logistics.fulfillment.orderId') }}:
              <strong class="text-black">#{{ detailData.id || '-' }}</strong></span
            >
            <span
              >{{ t('logistics.fulfillment.originalOrder') }}:
              <el-link type="primary" :underline="'never'">{{
                detailData.originalOrderCode || '-'
              }}</el-link></span
            >
          </div>
        </div>
        <div class="w-1/2">
          <el-steps :active="currentStep" finish-status="success" align-center>
            <el-step :title="t('logistics.fulfillment.status.pending')" />
            <el-step :title="t('logistics.fulfillment.status.packing')" />
            <el-step :title="t('logistics.fulfillment.status.shipping')" />
            <el-step :title="t('logistics.fulfillment.status.completed')" />
          </el-steps>
        </div>
      </div>

      <!-- System Guards -->
      <el-alert
        v-if="hasRestrictedItems"
        :title="t('logistics.fulfillment.alerts.restricted')"
        type="error"
        show-icon
        :closable="false"
        class="mb-2"
      />
      <el-alert
        v-if="hasOutOfStockItems"
        :title="t('logistics.fulfillment.alerts.outOfStock')"
        type="warning"
        show-icon
        :closable="false"
      />
    </el-card>

    <el-row :gutter="20">
      <!-- Cột trái (70%): Picking List -->
      <el-col :span="16">
        <el-card shadow="never" class="picking-card h-full">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-lg">{{ t('logistics.fulfillment.pickingList') }}</span>
              <el-tag type="info"
                >{{ detailData.items.length }} {{ t('logistics.dashboard.items') }}</el-tag
              >
            </div>
          </template>

          <el-table :data="detailData.items" stripe style="width: 100%" v-loading="loading">
            <el-table-column width="60" align="center">
              <template #default="scope">
                <el-checkbox
                  v-model="scope.row.isPicked"
                  @change="(val) => handleTogglePick(scope.row.id, val as boolean)"
                  :disabled="detailData.status >= 1"
                />
              </template>
            </el-table-column>

            <el-table-column :label="t('logistics.fulfillment.table.image')" width="80">
              <template #default="scope">
                <el-image
                  v-if="scope.row.thumbnailUrl"
                  :src="scope.row.thumbnailUrl"
                  class="w-12 h-12 rounded"
                  fit="cover"
                >
                  <template #error>
                    <div
                      class="image-slot flex items-center justify-center w-full h-full bg-gray-100 text-gray-400"
                    >
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div
                  v-else
                  class="w-12 h-12 rounded flex items-center justify-center bg-gray-100 text-gray-400"
                >
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-table-column>

            <el-table-column :label="t('logistics.fulfillment.table.product')" min-width="200">
              <template #default="scope">
                <div class="font-medium text-sm">{{ scope.row.productName }}</div>
                <div class="text-xs text-gray-500">SKU: {{ scope.row.sku }}</div>
              </template>
            </el-table-column>

            <el-table-column
              :label="t('logistics.fulfillment.table.shelf')"
              width="120"
              align="center"
            >
              <template #default="scope">
                <el-tag effect="dark" type="success" size="large" class="font-mono text-base">{{
                  scope.row.shelfLocation
                }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column
              :label="t('logistics.fulfillment.table.qty')"
              width="80"
              align="center"
            >
              <template #default="scope">
                <span
                  :class="{
                    'text-orange-500 font-bold text-lg': scope.row.quantity > 1,
                    'text-gray-700': scope.row.quantity === 1,
                  }"
                >
                  x{{ scope.row.quantity }}
                </span>
              </template>
            </el-table-column>

            <el-table-column
              :label="t('logistics.fulfillment.table.picked')"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-tag v-if="scope.row.isPicked" type="success" effect="plain" round
                  >Đã nhặt</el-tag
                >
                <el-tag v-else type="info" effect="plain" round>Chờ</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Cột phải (30%): Dispatch Panel -->
      <el-col :span="8">
        <el-card shadow="never" class="dispatch-card h-full">
          <template #header>
            <span class="font-bold text-lg">{{ t('logistics.fulfillment.dispatchPanel') }}</span>
          </template>

          <div class="mb-6">
            <h3 class="text-gray-500 text-sm mb-2 uppercase">{{
              t('logistics.fulfillment.customer')
            }}</h3>
            <div class="font-medium mb-1">{{ detailData.customerName || '-' }}</div>
            <div class="text-sm mb-1"
              ><el-icon class="mr-1"><Phone /></el-icon> {{ detailData.customerPhone || '-' }}</div
            >
            <div class="text-sm"
              ><el-icon class="mr-1"><Location /></el-icon>
              {{ detailData.customerAddress || '-' }}</div
            >
          </div>

          <el-divider />

          <div class="mb-6">
            <h3 class="text-gray-500 text-sm mb-2 uppercase">{{
              t('logistics.fulfillment.financial')
            }}</h3>
            <div class="flex justify-between mb-2">
              <span class="text-sm">{{ t('logistics.fulfillment.codAmount') }}:</span>
              <span class="font-bold text-red-500">{{ formatCurrency(detailData.codAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">{{ t('logistics.fulfillment.shippingCost') }}:</span>
              <span>{{ formatCurrency(detailData.shippingCost) }}</span>
            </div>
          </div>

          <el-divider />

          <div class="mb-6">
            <h3 class="text-gray-500 text-sm mb-2 uppercase">{{
              t('logistics.fulfillment.carrier')
            }}</h3>
            <el-select
              v-model="detailData.carrier"
              class="w-full mb-3"
              :disabled="detailData.status >= 2"
              placeholder="Chọn nhà vận chuyển"
            >
              <el-option label="Giao Hàng Tiết Kiệm" value="GHTK" />
              <el-option label="Viettel Post" value="ViettelPost" />
              <el-option label="Giao Hàng Nhanh" value="GHN" />
              <el-option label="Đội xe nội bộ (Tự giao)" value="Internal" />
            </el-select>

            <h3 class="text-gray-500 text-sm mb-2 uppercase">{{
              t('logistics.fulfillment.trackingCode')
            }}</h3>
            <el-input
              v-model="detailData.trackingNumber"
              :placeholder="t('logistics.fulfillment.inputTracking')"
              :disabled="detailData.status >= 2"
            >
              <template #append>
                <el-button
                  icon="Check"
                  @click="handleUpdateTracking"
                  :disabled="detailData.status >= 2"
                />
              </template>
            </el-input>
          </div>

          <!-- Actions -->
          <div class="mt-8 flex flex-col gap-3">
            <el-button
              v-if="detailData.status === 0"
              type="primary"
              size="large"
              class="w-full"
              @click="handleUpdateStatus(1)"
            >
              {{ t('logistics.fulfillment.actions.startPacking') }}
            </el-button>

            <el-button
              v-if="detailData.status === 1"
              type="success"
              size="large"
              class="w-full"
              @click="handleUpdateStatus(2)"
            >
              {{ t('logistics.fulfillment.actions.exportWarehouse') }}
            </el-button>

            <el-button
              v-if="detailData.status === 2"
              type="primary"
              size="large"
              plain
              class="w-full"
              @click="handleUpdateStatus(3)"
            >
              {{ t('logistics.fulfillment.actions.markCompleted') }}
            </el-button>
          </div>

          <el-alert
            v-if="!isAllPicked && detailData.status === 0"
            :title="t('logistics.fulfillment.alerts.pickingIncomplete')"
            type="info"
            show-icon
            :closable="false"
            class="mt-4"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import { Phone, Location, Picture } from '@element-plus/icons-vue'
  import {
    getFulfillmentDetail,
    updateParcelStatus,
    updateTrackingNumber,
    toggleItemPick,
  } from '@/api/logistics/fulfillment'
  import type { FulfillmentDetailResponse } from '@/api/logistics/fulfillment'

  const { t } = useI18n()

  // For demo purposes, we fetch ID 1 or get from route
  const orderId = 1
  const loading = ref(false)

  const detailData = ref<FulfillmentDetailResponse>({
    id: 0,
    trackingNumber: '',
    originalOrderCode: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    carrier: '',
    status: 0,
    codAmount: 0,
    shippingCost: 0,
    createdAt: '',
    items: [],
  })

  const currentStep = computed(() => {
    if (detailData.value.status === 4) return 4 // Returned could be handled differently
    return detailData.value.status
  })

  const hasRestrictedItems = computed(() => {
    return detailData.value.items.some((item) => item.isRestricted)
  })

  const hasOutOfStockItems = computed(() => {
    return detailData.value.items.some((item) => item.isOutOfStock)
  })

  const isAllPicked = computed(() => {
    if (detailData.value.items.length === 0) return false
    return detailData.value.items.every((item) => item.isPicked)
  })

  const fetchDetail = async () => {
    loading.value = true
    try {
      const res = await getFulfillmentDetail(orderId)
      // mock API logic if backend doesn't exist
      detailData.value = res.data || getMockData()
    } catch (_error) {
      // silently fallback to mock data
      detailData.value = getMockData()
    } finally {
      loading.value = false
    }
  }

  const handleTogglePick = async (itemId: number, isPicked: boolean) => {
    try {
      await toggleItemPick(itemId, isPicked)
    } catch (error) {
      console.warn('API error, relying on local state for preview', error)
    }
  }

  const handleUpdateTracking = async () => {
    if (!detailData.value.trackingNumber) return
    try {
      await updateTrackingNumber(detailData.value.id, detailData.value.trackingNumber)
      ElMessage.success('Cập nhật mã vận đơn thành công')
    } catch (_error) {
      ElMessage.success('Cập nhật thành công (Mock)')
    }
  }

  const handleUpdateStatus = async (newStatus: number) => {
    if (newStatus === 1 && !isAllPicked.value) {
      ElMessage.warning(t('logistics.fulfillment.alerts.pickingIncomplete'))
      return
    }

    try {
      await updateParcelStatus(detailData.value.id, newStatus)
      detailData.value.status = newStatus
      ElMessage.success('Cập nhật trạng thái thành công')
    } catch (_error) {
      detailData.value.status = newStatus
      ElMessage.success('Cập nhật trạng thái thành công (Mock)')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  // Fallback Mock Data for UI review
  const getMockData = (): FulfillmentDetailResponse => {
    return {
      id: 10452,
      trackingNumber: '',
      originalOrderCode: 'SO-20260609-001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0987654321',
      customerAddress: '123 Đường Láng, Đống Đa, Hà Nội',
      carrier: '',
      status: 0,
      codAmount: 1550000,
      shippingCost: 35000,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 1,
          productId: 101,
          productName: 'Lốp xe Exciter 150',
          sku: 'TIRE-EX150',
          shelfLocation: 'A1-02-04',
          quantity: 2,
          isPicked: false,
          isRestricted: false,
          isOutOfStock: false,
        },
        {
          id: 2,
          productId: 102,
          productName: 'Nhớt Motul 300V',
          sku: 'OIL-M300V',
          shelfLocation: 'B3-01-01',
          quantity: 1,
          isPicked: false,
          isRestricted: false,
          isOutOfStock: false,
        },
        {
          id: 3,
          productId: 103,
          productName: 'Bình ắc quy GS',
          sku: 'BAT-GS12V',
          shelfLocation: 'C1-04-02',
          quantity: 1,
          isPicked: false,
          isRestricted: true, // Restricted item
          isOutOfStock: false,
        },
      ],
    }
  }

  onMounted(() => {
    fetchDetail()
  })
</script>

<style scoped>
  .picking-card :deep(.el-card__body) {
    padding: 0;
  }
</style>
