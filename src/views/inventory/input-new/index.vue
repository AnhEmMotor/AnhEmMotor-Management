<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng xe nhập (Mới)"
        :count="stats.totalVehicles"
        icon="ri:motorbike-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Phiếu đang xử lý"
        :count="stats.processingReceipts"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Tổng giá trị nhập kho"
        :count="formatCurrency(stats.totalValue)"
        icon="ri:money-dollar-circle-line"
        iconStyle="bg-info"
      />
    </div>

    <!-- Search/Filters -->
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="120"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Main Vouchers Table -->
    <ElCard class="flex-1 p-4 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo phiếu nhập mới
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="filteredData"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </template>

        <template #totalPayable="{ row }">
          <span class="font-semibold text-primary">{{ formatCurrency(row.totalPayable) }}</span>
        </template>

        <template #productSummary="{ row }">
          <div class="text-xs text-gray-600 max-w-[350px] space-y-1">
            <div v-for="(p, idx) in row.products" :key="idx" class="truncate">
              • <strong>{{ p.productName }}</strong>
              <span v-if="p.productColorName" class="text-gray-400">
                ({{ p.productColorName }})</span
              >: {{ p.count }} xe (NCC:
              <span class="text-indigo-600 font-medium">{{ p.supplierName }}</span
              >)
            </div>
          </div>
        </template>

        <template #statusId="{ row }">
          <ElTag :type="getStatusTagType(row.statusId)" size="small">
            {{ getStatusLabel(row.statusId) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Xem chi tiết" placement="top">
              <ElButton circle size="small" type="info" @click="handleViewDetail(row)">
                <ElIcon><View /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip v-if="isEditable(row.statusId)" content="Chỉnh sửa" placement="top">
              <ElButton circle size="small" type="primary" @click="handleEdit(row)">
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip v-if="isEditable(row.statusId)" content="Xóa" placement="top">
              <ElButton circle size="small" type="danger" @click="handleDelete(row)">
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Create/Edit Voucher Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1000px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm :model="formData" label-width="120px" class="mt-4" ref="formRef">
        <!-- Products List Area -->
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/50 mb-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-800">Chi tiết sản phẩm nhập kho</span>
            <ElButton type="success" size="small" plain @click="handleAddProductRow">
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm sản phẩm
            </ElButton>
          </div>

          <ElTable :data="formData.products" border size="small" class="w-full bg-white">
            <ElTableColumn label="Sản phẩm & Màu sắc" minWidth="220" required>
              <template #default="{ row, $index }">
                <div
                  class="w-full border border-gray-300 rounded px-2 py-1 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200 min-h-[32px]"
                  @click="openProductSelector($index)"
                >
                  <span v-if="row.productVariantId" class="text-gray-800 text-xs font-semibold">
                    {{ row.productName }}
                    <span v-if="row.productColorName" class="text-gray-500 font-normal">
                      ({{ row.productColorName }})
                    </span>
                  </span>
                  <span v-else class="text-gray-400 text-xs">Chọn sản phẩm...</span>
                  <ElIcon class="text-gray-400 text-xs"><ArrowDown /></ElIcon>
                </div>

                <div v-if="isVinManagedProduct(row)" class="flex items-center gap-2 mt-1.5">
                  <ElTag size="small" type="warning" effect="plain">
                    VIN {{ getVehicleIdentityProgress(row) }}
                  </ElTag>
                  <ElButton link type="primary" size="small" @click="openVinDialog($index)">
                    Nhập VIN
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Nhà cung cấp (Báo giá)" minWidth="240" required>
              <template #default="{ row }">
                <template v-if="row.productVariantId">
                  <div class="w-full">
                    <ElSelect
                      v-model="row.supplierId"
                      placeholder="Chọn nhà cung cấp..."
                      class="w-full"
                      size="small"
                      @change="(val) => handleSupplierChange(row, val)"
                    >
                      <ElOption
                        v-for="opt in getAvailableSuppliers(row)"
                        :key="opt.supplierId"
                        :label="opt.supplierName"
                        :value="opt.supplierId"
                      >
                        <div class="flex justify-between items-center w-full">
                          <span>{{ opt.supplierName }}</span>
                          <span class="text-xs text-primary font-bold ml-2">
                            {{ formatCurrency(opt.quotePrice) }}
                          </span>
                        </div>
                      </ElOption>
                    </ElSelect>
                  </div>

                  <div
                    v-if="getAvailableSuppliers(row).length === 0"
                    class="mt-1 flex items-center gap-1 text-[11px] text-warning-600 font-medium"
                  >
                    <ElIcon><Warning /></ElIcon>
                    <span>Chưa có báo giá cho sản phẩm & màu này!</span>
                  </div>
                </template>
                <template v-else>
                  <span class="text-gray-400 text-xs">Vui lòng chọn sản phẩm trước</span>
                </template>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng" width="100" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.count"
                  :min="1"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                  size="small"
                  style="width: 80px"
                  @change="handleProductCountChange(row)"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Đơn giá nhập" width="140" align="center">
              <template #default="{ row }">
                <span class="font-semibold text-gray-700 text-xs">
                  {{ formatCurrency(row.inputPrice || 0) }}
                </span>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thành tiền" width="130" align="right">
              <template #default="{ row }">
                <span class="font-semibold text-gray-700 text-xs">
                  {{ formatCurrency((row.count || 0) * (row.inputPrice || 0)) }}
                </span>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="70" align="center">
              <template #default="{ $index }">
                <ElButton
                  circle
                  type="danger"
                  size="small"
                  plain
                  @click="handleRemoveProductRow($index)"
                >
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <div
            class="flex justify-between items-center mt-3 bg-white p-3 border border-t-0 border-gray-200 rounded-b-md"
          >
            <span></span>
            <div class="flex items-center gap-2">
              <span class="text-gray-600 text-sm">Tổng cộng tiền hàng:</span>
              <span class="text-lg font-bold text-primary">{{ formatCurrency(totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Note below the form -->
        <ElFormItem label="Ghi chú phiếu">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="Nhập ghi chú hoặc thông tin bổ sung cho phiếu nhập này..."
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-100 pt-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <template v-if="isEdit">
            <ElButton type="warning" :loading="submitting" @click="submitForm('working')">
              Lưu nháp
            </ElButton>
            <ElDropdown trigger="hover" @command="submitForm">
              <ElButton type="primary" :loading="submitting">
                Xử lý phiếu <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="finished" class="!text-green-600 font-medium">
                    <ElIcon class="mr-1 text-green-600"><Check /></ElIcon> Hoàn thành
                  </ElDropdownItem>
                  <ElDropdownItem command="cancelled" class="!text-red-600 font-medium">
                    <ElIcon class="mr-1 text-red-600"><Close /></ElIcon> Hủy phiếu
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
          <template v-else>
            <ElButton type="primary" :loading="submitting" @click="submitForm('working')">
              Tạo phiếu (Lưu tạm)
            </ElButton>
            <ElButton type="success" :loading="submitting" @click="submitForm('finished')">
              Hoàn thành nhập kho
            </ElButton>
          </template>
        </div>
      </template>
    </ElDialog>

    <!-- Product & Variant Selector Dialog -->
    <ElDialog
      v-model="productSelectorVisible"
      title="Chọn sản phẩm & màu sắc"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          v-model="productSearchQuery"
          placeholder="Tìm sản phẩm theo tên..."
          clearable
          prefix-icon="Search"
          @input="handleProductSelectorSearch"
        />

        <div
          v-loading="productSelectorLoading"
          class="space-y-3 min-h-[350px] max-h-[500px] overflow-y-auto pr-1"
        >
          <div
            v-for="variant in productSelectorItems"
            :key="variant.id"
            class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <ElImage
                  :src="variant.coverImageUrl || ''"
                  class="w-12 h-12 rounded object-cover border border-gray-100 flex-shrink-0"
                  fit="cover"
                >
                  <template #error>
                    <div
                      class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"
                    >
                      <ElIcon><InfoFilled /></ElIcon>
                    </div>
                  </template>
                </ElImage>

                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-semibold text-gray-800 truncate">
                    {{ variant.displayName }}
                  </span>
                  <span class="text-[11px] text-gray-400 mt-0.5 font-mono">
                    ID Biến thể: #{{ variant.id }}
                  </span>
                  <ElTag
                    v-if="isVinManagedVariant(variant)"
                    size="small"
                    type="warning"
                    class="mt-1 w-fit"
                  >
                    Quản lý theo VIN
                  </ElTag>
                  <span class="text-xs text-primary font-bold mt-0.5">
                    Giá bán: {{ formatCurrency(variant.price ?? undefined) }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end">
                <!-- Color Selector inside Product Card -->
                <ElSelect
                  v-if="variant.colors?.length"
                  v-model="selectedVariantColors[variant.id]"
                  placeholder="Chọn màu"
                  size="small"
                  style="width: 150px"
                  @click.stop
                >
                  <template #prefix>
                    <span
                      v-if="getSelectedColorObj(variant)"
                      class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                      :style="{
                        backgroundColor: getSelectedColorObj(variant)?.colorCode || '#ffffff'
                      }"
                    ></span>
                  </template>
                  <ElOption
                    v-for="color in variant.colors"
                    :key="color.id"
                    :label="color.colorName || `Màu #${color.id}`"
                    :value="color.id"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                        :style="{ backgroundColor: color.colorCode || '#ffffff' }"
                      ></span>
                      <span>{{ color.colorName || `Màu #${color.id}` }}</span>
                    </div>
                  </ElOption>
                </ElSelect>

                <ElButton type="primary" size="small" plain @click="selectProductVariant(variant)">
                  Chọn sản phẩm
                </ElButton>
              </div>
            </div>
          </div>

          <div
            v-if="!productSelectorLoading && productSelectorItems.length === 0"
            class="flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy sản phẩm nào</span>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="productSelectorPage"
            v-model:page-size="productSelectorPageSize"
            :total="productSelectorTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="fetchSelectorProducts"
          />
        </div>
      </div>
    </ElDialog>

    <!-- VIN Code Identification Dialog -->
    <ElDialog
      v-model="vinDialogVisible"
      title="Nhập định danh xe (Số khung, Số máy)"
      width="800px"
      append-to-body
      destroy-on-close
      class="vin-identification-dialog"
    >
      <div v-if="activeVinRow" class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 p-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-800 truncate">
              {{ activeVinRow.productName }}
            </div>
            <div class="text-xs text-gray-500">
              Số lượng: {{ activeVinRow.count || 0 }} xe · Đã nhập:
              {{ getCompletedVehicleIdentityCount(activeVinRow) }}/{{ activeVinRow.count || 0 }}
            </div>
          </div>
          <ElTag type="warning">Quản lý theo VIN</ElTag>
        </div>

        <div class="vin-dialog-table max-h-[400px] overflow-y-auto">
          <ElTable :data="activeVinRow.vehicles" border size="small" class="w-full">
            <ElTableColumn label="STT" type="index" width="55" align="center" />
            <ElTableColumn label="Số khung (VIN)" min-width="200">
              <template #default="{ row: vehicle }">
                <ElInput v-model="vehicle.vinNumber" placeholder="Nhập số khung (VIN)" clearable />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Số máy" min-width="200">
              <template #default="{ row: vehicle }">
                <ElInput v-model="vehicle.engineNumber" placeholder="Nhập số máy" clearable />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 pt-3">
          <ElButton @click="vinDialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" @click="vinDialogVisible = false">Hoàn thành</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Detail Dialog -->
    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết phiếu nhập kho mới"
      width="800px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div v-if="detailData" class="flex flex-col gap-4">
        <div class="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <span class="text-gray-500">Trạng thái:</span>
            <span class="ml-2">
              <ElTag :type="getStatusTagType(detailData.statusId)" size="small">
                {{ getStatusLabel(detailData.statusId) }}
              </ElTag>
            </span>
          </div>
          <div>
            <span class="text-gray-500">Thời gian tạo:</span>
            <span class="ml-2 text-gray-700 font-medium">{{
              formatDateTime(detailData.createdAt)
            }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200 pt-2 mt-1">
            <span class="text-gray-500 font-medium">Ghi chú phiếu:</span>
            <div
              class="mt-1 text-gray-700 whitespace-pre-line bg-white p-3 border border-gray-100 rounded"
            >
              {{ detailData.notes || 'Không có ghi chú' }}
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Chi tiết sản phẩm & nhà cung cấp</h4>
          <ElTable :data="detailData.products" border size="small" class="w-full">
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Sản phẩm & Màu sắc" minWidth="200">
              <template #default="{ row }">
                <span class="font-medium text-gray-800">{{ row.productName }}</span>
                <div v-if="row.productColorName" class="mt-0.5">
                  <ElTag size="small" type="info">Màu: {{ row.productColorName }}</ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Nhà cung cấp" minWidth="180">
              <template #default="{ row }">
                <span class="text-indigo-600 font-semibold">{{ row.supplierName }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="count" label="Số lượng" width="80" align="center" />
            <ElTableColumn label="Số khung / Số máy" minWidth="200">
              <template #default="{ row }">
                <div
                  v-if="row.vehicles?.length"
                  class="flex flex-col gap-1 text-[11px] text-gray-600"
                >
                  <div
                    v-for="(vehicle, vIdx) in row.vehicles"
                    :key="vIdx"
                    class="rounded border border-gray-100 bg-gray-50/50 px-2 py-0.5"
                  >
                    <div><span class="text-gray-400">VIN:</span> {{ vehicle.vinNumber }}</div>
                    <div><span class="text-gray-400">Số máy:</span> {{ vehicle.engineNumber }}</div>
                  </div>
                </div>
                <span v-else class="text-gray-400">--</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá nhập" width="130" align="right">
              <template #default="{ row }">
                <span>{{ formatCurrency(row.inputPrice) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="140" align="right">
              <template #default="{ row }">
                <span class="font-bold text-gray-800">
                  {{ formatCurrency((row.count || 0) * (row.inputPrice || 0)) }}
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="flex justify-end items-center gap-2 text-right">
          <span class="text-gray-500 text-sm">Tổng thanh toán:</span>
          <span class="text-xl font-bold text-primary">{{
            formatCurrency(detailData.totalPayable)
          }}</span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t pt-3">
          <ElButton @click="detailDialogVisible = false">Đóng</ElButton>
          <template v-if="detailData && isEditable(detailData.statusId)">
            <ElButton type="primary" @click="handleEdit(detailData)">Chỉnh sửa</ElButton>
          </template>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import {
    Plus,
    Edit,
    Delete,
    View,
    ArrowDown,
    Check,
    Close,
    InfoFilled,
    Warning
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useDebounceFn } from '@vueuse/core'
  import { SupplierApi } from '@/api/supplier.api'
  import { ProductApi } from '@/api/product/product.api'
  import type { ProductVariantLiteForInput } from '@/domain/product/product.types'

  defineOptions({ name: 'InventoryInputNew' })

  interface VehicleIdentification {
    vinNumber: string
    engineNumber: string
  }

  interface NewReceiptProductRow {
    productVariantId?: number
    productName: string
    productColorId?: number
    productColorName?: string
    supplierId?: number
    supplierName: string
    count: number
    inputPrice: number
    managementType?: string
    vehicles?: VehicleIdentification[]
  }

  interface NewInventoryReceipt {
    id: string
    notes: string
    statusId: 'working' | 'finished' | 'cancelled'
    products: NewReceiptProductRow[]
    totalPayable: number
    createdAt: string
  }

  interface LocalQuotationProduct {
    productVariantId: number
    displayName: string
    colorId?: number
    colorName?: string
    quotePrice: number
  }

  interface LocalQuotation {
    id: string
    code: string
    supplierId: number
    supplierName: string
    status: string
    notes?: string
    products: LocalQuotationProduct[]
  }

  const VIN_MANAGEMENT_TYPE = 'vin_number'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo phiếu nhập mới')
  const submitting = ref(false)
  const isEdit = ref(false)

  // Main data stored in localstorage
  const data = ref<NewInventoryReceipt[]>([])

  // Quotation list from localstorage (readonly for lookup)
  const quotations = ref<LocalQuotation[]>([])

  const searchForm = ref({
    searchTerm: '',
    statusId: [] as string[]
  })

  const searchItems = computed(() => [
    {
      key: 'searchTerm',
      label: 'Tìm kiếm',
      type: 'input',
      props: { placeholder: 'Tên SP, nhà cung cấp...' }
    },
    {
      key: 'statusId',
      label: 'Trạng thái',
      type: 'select',
      props: {
        placeholder: 'Tất cả trạng thái',
        clearable: true,
        multiple: true,
        collapseTags: true,
        options: [
          { label: 'Phiếu tạm', value: 'working' },
          { label: 'Hoàn thành', value: 'finished' },
          { label: 'Đã hủy', value: 'cancelled' }
        ]
      }
    }
  ])

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const columns = ref([
    { label: 'Thời gian tạo', prop: 'createdAt', useSlot: true, width: 170 },
    {
      label: 'Chi tiết sản phẩm & Nhà cung cấp',
      prop: 'productSummary',
      useSlot: true,
      minWidth: 320
    },
    { label: 'Tổng tiền', prop: 'totalPayable', useSlot: true, width: 150, align: 'right' },
    { label: 'Trạng thái', prop: 'statusId', useSlot: true, width: 130, align: 'center' },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 140,
      fixed: 'right' as const,
      align: 'center'
    }
  ])

  const columnChecks = columns

  // Form State
  const formData = ref<{
    id?: string
    notes: string
    statusId: 'working' | 'finished' | 'cancelled'
    products: NewReceiptProductRow[]
  }>({
    notes: '',
    statusId: 'working',
    products: []
  })

  // Statistics
  const stats = computed(() => {
    const totalVal = data.value
      .filter((r) => r.statusId === 'finished')
      .reduce((sum, r) => sum + r.totalPayable, 0)

    const processing = data.value.filter((r) => r.statusId === 'working').length

    const vehicleCount = data.value
      .filter((r) => r.statusId === 'finished')
      .reduce((sum, r) => sum + r.products.reduce((s, p) => s + (p.count || 0), 0), 0)

    return {
      totalVehicles: vehicleCount,
      processingReceipts: processing,
      totalValue: totalVal
    }
  })

  // Filtering & Pagination
  const filteredData = computed(() => {
    let result = [...data.value]

    if (searchForm.value.searchTerm) {
      const query = searchForm.value.searchTerm.toLowerCase()
      result = result.filter((item) => {
        const matchProduct = item.products.some((product) => {
          const matchProductName = product.productName?.toLowerCase().includes(query)
          const matchSupplierName = product.supplierName?.toLowerCase().includes(query)
          return matchProductName || matchSupplierName
        })
        const matchNotes = item.notes?.toLowerCase().includes(query)
        return matchProduct || matchNotes
      })
    }

    if (searchForm.value.statusId && searchForm.value.statusId.length > 0) {
      result = result.filter((item) => searchForm.value.statusId.includes(item.statusId))
    }

    return result
  })

  watch(
    () => filteredData.value.length,
    (newTotal) => {
      pagination.total = newTotal
    },
    { immediate: true }
  )

  // Total amount inside form
  const totalAmount = computed(() => {
    return formData.value.products.reduce(
      (sum, row) => sum + (row.count || 0) * (row.inputPrice || 0),
      0
    )
  })

  const isEditable = (statusId?: string) => {
    return statusId === 'working'
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('vi-VN')
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 đ'
    return val.toLocaleString('vi-VN') + ' đ'
  }

  const getStatusLabel = (statusId?: string) => {
    switch (statusId) {
      case 'working':
        return 'Phiếu tạm'
      case 'finished':
        return 'Hoàn thành'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return statusId || '-'
    }
  }

  const getStatusTagType = (statusId?: string) => {
    switch (statusId) {
      case 'working':
        return 'warning'
      case 'finished':
        return 'success'
      case 'cancelled':
        return 'danger'
      default:
        return 'info'
    }
  }

  // Product Selector Dialog State
  const productSelectorVisible = ref(false)
  const productSelectorLoading = ref(false)
  const productSearchQuery = ref('')
  const productSelectorItems = ref<ProductVariantLiteForInput[]>([])
  const productSelectorPage = ref(1)
  const productSelectorPageSize = ref(8)
  const productSelectorTotal = ref(0)
  const activeProductRowIndex = ref<number | null>(null)
  const selectedVariantColors = reactive<Record<number, number>>({})

  // VIN dialog state
  const vinDialogVisible = ref(false)
  const vinDialogRowIndex = ref<number | null>(null)
  const activeVinRow = computed(() => {
    if (vinDialogRowIndex.value === null) return null
    return formData.value.products[vinDialogRowIndex.value] || null
  })

  // Detail dialog state
  const detailDialogVisible = ref(false)
  const detailData = ref<NewInventoryReceipt | null>(null)

  const demoSuppliers = ref<{ id: number; name: string }[]>([])

  const fetchDemoSuppliers = async () => {
    try {
      const res = await SupplierApi.getList({
        current: 1,
        size: 3
      })
      if (res.items && res.items.length > 0) {
        demoSuppliers.value = res.items.map((s) => ({ id: s.id!, name: s.name }))
      }
    } catch (e) {
      console.error('Failed to load demo suppliers:', e)
    }
    if (demoSuppliers.value.length === 0) {
      demoSuppliers.value = [
        { id: 1, name: 'Honda Việt Nam (Demo)' },
        { id: 2, name: 'Yamaha Motor Vietnam (Demo)' },
        { id: 3, name: 'Suzuki Việt Nam (Demo)' }
      ]
    }
  }

  // Lifecycle
  onMounted(async () => {
    loadLocalData()
    await fetchDemoSuppliers()
  })

  const loadLocalData = () => {
    // Load receipts
    const rawVouchers = localStorage.getItem('new_inventory_receipts')
    if (rawVouchers) {
      try {
        data.value = JSON.parse(rawVouchers)
      } catch {
        data.value = []
      }
    } else {
      data.value = []
    }

    // Load quotations
    const rawQuotes = localStorage.getItem('inventory_quotations')
    if (rawQuotes) {
      try {
        quotations.value = JSON.parse(rawQuotes)
      } catch {
        quotations.value = []
      }
    } else {
      quotations.value = []
    }
  }

  const saveLocalData = () => {
    localStorage.setItem('new_inventory_receipts', JSON.stringify(data.value))
  }

  // Refresh, search, resets
  const handleSearch = () => {
    pagination.current = 1
  }

  const handleReset = () => {
    searchForm.value = {
      searchTerm: '',
      statusId: []
    }
    pagination.current = 1
  }

  const refreshData = () => {
    loading.value = true
    setTimeout(() => {
      loadLocalData()
      loading.value = false
      ElMessage.success('Đã đồng bộ dữ liệu mới nhất')
    }, 300)
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (page: number) => {
    pagination.current = page
  }

  // Dialog Operations
  const handleAdd = () => {
    isEdit.value = false
    dialogTitle.value = 'Tạo phiếu nhập mới'
    formData.value = {
      notes: '',
      statusId: 'working',
      products: []
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: NewInventoryReceipt) => {
    isEdit.value = true
    dialogTitle.value = 'Chỉnh sửa phiếu nhập'
    formData.value = JSON.parse(JSON.stringify(row))
    dialogVisible.value = true
  }

  const handleViewDetail = (row: NewInventoryReceipt) => {
    detailData.value = row
    detailDialogVisible.value = true
  }

  const handleDelete = (row: NewInventoryReceipt) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa phiếu nhập kho tạo lúc ${formatDateTime(row.createdAt)}?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning'
      }
    )
      .then(() => {
        data.value = data.value.filter((r) => r.id !== row.id)
        saveLocalData()
        ElMessage.success('Xóa phiếu nhập thành công')
      })
      .catch(() => {})
  }

  // Product Selector Helpers
  const isVinManagedVariant = (variant: ProductVariantLiteForInput) => {
    return variant.managementType?.toLowerCase() === VIN_MANAGEMENT_TYPE
  }

  const getSelectedColorObj = (variant: ProductVariantLiteForInput) => {
    const colorId = selectedVariantColors[variant.id]
    return variant.colors?.find((c) => c.id === colorId) || null
  }

  const isVinManagedProduct = (row: NewReceiptProductRow) => {
    return row.managementType?.toLowerCase() === VIN_MANAGEMENT_TYPE
  }

  const getCompletedVehicleIdentityCount = (row: NewReceiptProductRow) => {
    return (row.vehicles ?? []).filter(
      (vehicle) => vehicle.vinNumber?.trim() && vehicle.engineNumber?.trim()
    ).length
  }

  const getVehicleIdentityProgress = (row: NewReceiptProductRow) => {
    return `${getCompletedVehicleIdentityCount(row)}/${row.count || 0}`
  }

  const createEmptyVehicle = (): VehicleIdentification => ({
    vinNumber: '',
    engineNumber: ''
  })

  const syncVehicleRows = (row: NewReceiptProductRow) => {
    if (!isVinManagedProduct(row)) {
      row.vehicles = undefined
      return
    }
    const targetCount = Math.max(row.count || 0, 0)
    const vehicles = row.vehicles ?? []
    while (vehicles.length < targetCount) {
      vehicles.push(createEmptyVehicle())
    }
    if (vehicles.length > targetCount) {
      vehicles.splice(targetCount)
    }
    row.vehicles = vehicles
  }

  const handleProductCountChange = (row: NewReceiptProductRow) => {
    syncVehicleRows(row)
  }

  const handleAddProductRow = () => {
    formData.value.products.push({
      productName: '',
      count: 1,
      inputPrice: 0,
      supplierName: ''
    })
  }

  const handleRemoveProductRow = (index: number) => {
    formData.value.products.splice(index, 1)
  }

  // Selector Logic
  const openProductSelector = (index: number) => {
    activeProductRowIndex.value = index
    productSearchQuery.value = ''
    productSelectorPage.value = 1
    productSelectorVisible.value = true
    fetchSelectorProducts()
  }

  const fetchSelectorProducts = async () => {
    productSelectorLoading.value = true
    try {
      const filters = []
      if (productSearchQuery.value) {
        filters.push(`DisplayName@=${productSearchQuery.value}`)
      }
      const params = {
        current: productSelectorPage.value,
        size: productSelectorPageSize.value,
        Filters: filters.join(',') || undefined
      }
      const res = await ProductApi.getVariantsForInput(params)
      productSelectorItems.value = res.items || []
      productSelectorTotal.value = res.totalCount || 0

      // Set default color selection
      res.items?.forEach((variant) => {
        if (variant.colors?.length && !selectedVariantColors[variant.id]) {
          selectedVariantColors[variant.id] = variant.colors[0].id
        }
      })
    } catch (err) {
      console.error(err)
      ElMessage.error('Không thể tải danh sách sản phẩm')
    } finally {
      productSelectorLoading.value = false
    }
  }

  const handleProductSelectorSearch = useDebounceFn(() => {
    productSelectorPage.value = 1
    fetchSelectorProducts()
  }, 300)

  const selectProductVariant = (variant: ProductVariantLiteForInput) => {
    if (activeProductRowIndex.value === null) return

    const row = formData.value.products[activeProductRowIndex.value]
    if (row) {
      const selectedColorId = selectedVariantColors[variant.id]
      const selectedColor = variant.colors?.find((c) => c.id === selectedColorId)

      row.productVariantId = variant.id
      row.productName = variant.displayName || `Sản phẩm #${variant.id}`
      row.managementType = variant.managementType
      row.count = 1
      row.inputPrice = variant.price || 0

      if (selectedColor) {
        row.productColorId = selectedColor.id
        row.productColorName = selectedColor.colorName
      } else {
        row.productColorId = undefined
        row.productColorName = undefined
      }

      // Auto-select the first available quotation supplier if any
      const availableQuotes = getAvailableSuppliers(row)
      if (availableQuotes.length > 0) {
        row.supplierId = availableQuotes[0].supplierId
        row.supplierName = availableQuotes[0].supplierName
        row.inputPrice = availableQuotes[0].quotePrice
      } else {
        row.supplierId = undefined
        row.supplierName = ''
      }

      syncVehicleRows(row)
    }

    productSelectorVisible.value = false
  }

  // Supplier matching from local quotations (Overridden for random demo suppliers)
  const getAvailableSuppliers = (row: NewReceiptProductRow) => {
    if (!row.productVariantId) return []

    const basePrice = row.inputPrice || 45000000
    return demoSuppliers.value.map((sup) => {
      const seed = (row.productVariantId || 0) * 1000 + sup.id
      const randomPercent = (seed % 15) - 7
      const price = Math.round((basePrice * (1 + randomPercent / 100)) / 100000) * 100000
      console.log(price)
      return {
        supplierId: sup.id,
        supplierName: sup.name,
        quotePrice: price
      }
    })
  }

  const handleSupplierChange = (row: NewReceiptProductRow, supplierId: number) => {
    const available = getAvailableSuppliers(row)
    const matched = available.find((a) => a.supplierId === supplierId)
    if (matched) {
      row.supplierName = matched.supplierName
      row.inputPrice = matched.quotePrice
    }
  }

  // VIN identification dialog opener
  const openVinDialog = (rowIndex: number) => {
    const row = formData.value.products[rowIndex]
    if (!row || !isVinManagedProduct(row)) return
    syncVehicleRows(row)
    vinDialogRowIndex.value = rowIndex
    vinDialogVisible.value = true
  }

  // Submit input voucher
  const submitForm = (statusId: 'working' | 'finished' | 'cancelled') => {
    const products = formData.value.products
    if (products.length === 0) {
      ElMessage.warning('Vui lòng thêm ít nhất một sản phẩm')
      return
    }

    // Validate all rows have product and supplier
    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      if (!p.productVariantId) {
        ElMessage.warning(`Dòng #${i + 1} chưa chọn sản phẩm`)
        return
      }
      if (!p.supplierId) {
        ElMessage.warning(`Dòng #${i + 1} (${p.productName}) chưa chọn nhà cung cấp có báo giá`)
        return
      }

      // VIN validation
      if (isVinManagedProduct(p)) {
        const vehicles = p.vehicles ?? []
        if (vehicles.length !== p.count) {
          ElMessage.warning(`Dòng #${i + 1} (${p.productName}) chưa đủ số khung, số máy`)
          return
        }
        const hasEmpty = vehicles.some((v) => !v.vinNumber?.trim() || !v.engineNumber?.trim())
        if (hasEmpty) {
          ElMessage.warning(
            `Dòng #${i + 1} (${p.productName}) vui lòng điền đầy đủ số khung & số máy`
          )
          return
        }
      }
    }

    submitting.value = true

    setTimeout(() => {
      if (isEdit.value && formData.value.id) {
        const idx = data.value.findIndex((r) => r.id === formData.value.id)
        if (idx !== -1) {
          data.value[idx] = {
            ...data.value[idx],
            notes: formData.value.notes,
            statusId,
            products: JSON.parse(JSON.stringify(products)),
            totalPayable: totalAmount.value
          }
        }
        ElMessage.success('Cập nhật phiếu nhập thành công')
      } else {
        const newVoucher: NewInventoryReceipt = {
          id: Date.now().toString(),
          notes: formData.value.notes,
          statusId,
          products: JSON.parse(JSON.stringify(products)),
          totalPayable: totalAmount.value,
          createdAt: new Date().toISOString()
        }
        data.value.unshift(newVoucher)
        ElMessage.success('Tạo phiếu nhập mới thành công')
      }

      saveLocalData()
      dialogVisible.value = false
      submitting.value = false
    }, 400)
  }
</script>

<style scoped>
  .art-table-card :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: var(--el-fill-color-light);
  }

  :deep(.vin-identification-dialog) {
    border-radius: 12px;
  }
</style>
