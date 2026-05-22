<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng xe nhập tháng"
        :count="stats.totalVehicles"
        icon="ri:motorbike-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang xử lý"
        :count="stats.processingReceipts"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Giá trị nhập kho"
        :count="formatCurrency(stats.totalValue)"
        icon="ri:money-dollar-circle-line"
        iconStyle="bg-info"
      />
    </div>

    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="120"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd" v-auth="Permissions.InputsCreate">
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo phiếu nhập
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </template>

        <template #totalPayable="{ row }">
          <span class="font-medium text-gray-700">{{ formatCurrency(row.totalPayable) }}</span>
        </template>

        <template #productSummary="{ row }">
          <div class="text-xs text-gray-500 max-w-[300px] truncate">
            {{ getProductSummaryText(row.products) }}
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
              <ElButton
                circle
                size="small"
                type="primary"
                @click="handleEdit(row)"
                v-auth="Permissions.InputsEdit"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip v-if="isEditable(row.statusId)" content="Xóa" placement="top">
              <ElButton
                circle
                size="small"
                type="danger"
                @click="handleDelete(row)"
                v-auth="Permissions.InputsDelete"
              >
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Dialog Thêm/Sửa Phiếu Nhập -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm :model="formData" label-width="120px" class="mt-4" ref="formRef">
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Nhà cung cấp" required class="col-span-2">
            <div
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200"
              @click="openSupplierSelector"
            >
              <span v-if="formData.supplierId" class="text-gray-800 font-medium">
                {{ getSupplierNameById(formData.supplierId) }}
              </span>
              <span v-else class="text-gray-400">Chọn nhà cung cấp...</span>
              <ElIcon class="text-gray-400"><ArrowDown /></ElIcon>
            </div>
          </ElFormItem>
        </div>

        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            placeholder="Nhập ghi chú hoặc thông tin bổ sung cho phiếu nhập này..."
          />
        </ElFormItem>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700">Chi tiết sản phẩm nhập kho</span>
            <ElButton type="success" size="small" plain @click="handleAddProductRow">
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm dòng sản phẩm
            </ElButton>
          </div>

          <ElTable :data="formData.products" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm" required>
              <template #default="{ row, $index }">
                <div
                  class="w-full border border-gray-300 rounded px-2 py-1 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200 min-h-[32px]"
                  @click="openProductSelector($index)"
                >
                  <span v-if="row.productVarientId" class="text-gray-800 text-xs font-medium">
                    {{ getProductNameById(row.productVarientId) }}
                  </span>
                  <span v-else class="text-gray-400 text-xs">Chọn sản phẩm...</span>
                  <ElIcon class="text-gray-400 text-xs"><ArrowDown /></ElIcon>
                </div>
                <div v-if="isVinManagedProduct(row)" class="flex items-center gap-2 mt-1">
                  <ElTag size="small" type="warning">
                    VIN {{ getVehicleIdentityProgress(row) }}
                  </ElTag>
                  <ElButton link type="primary" size="small" @click="openVinDialog($index)">
                    Nhập VIN
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng" width="150" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.count"
                  :min="1"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                  @change="handleProductCountChange(row)"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Đơn giá nhập" width="180" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.inputPrice"
                  :min="0"
                  :step="100000"
                  class="w-full"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thành tiền" width="160" align="right">
              <template #default="{ row }">
                <span class="font-medium text-gray-700">
                  {{ formatCurrency((row.count || 0) * (row.inputPrice || 0)) }}
                </span>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="120" align="center">
              <template #default="{ row, $index }">
                <ElTooltip
                  v-if="isVinManagedProduct(row)"
                  content="Nhập số khung, số máy, biển số"
                  placement="top"
                >
                  <ElButton circle type="warning" size="small" plain @click="openVinDialog($index)">
                    VIN
                  </ElButton>
                </ElTooltip>
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

          <div class="flex justify-end items-center mt-4 gap-2 text-right">
            <span class="text-gray-500 text-sm">Tổng cộng tiền hàng:</span>
            <span class="text-lg font-bold text-primary">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
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
              Lưu phiếu
            </ElButton>
          </template>
        </div>
      </template>
    </ElDialog>

    <!-- Dialog Nhập Định Danh VIN -->
    <ElDialog
      v-model="vinDialogVisible"
      title="Nhập định danh xe"
      width="860px"
      append-to-body
      destroy-on-close
      class="vin-identification-dialog"
      top="2vh"
    >
      <div v-if="activeVinRow" class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 p-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-800 truncate">
              {{ getProductNameById(activeVinRow.productVarientId) }}
            </div>
            <div class="text-xs text-gray-500">
              Số lượng: {{ activeVinRow.count || 0 }} xe · Đã nhập:
              {{ getCompletedVehicleIdentityCount(activeVinRow) }}/{{ activeVinRow.count || 0 }}
            </div>
          </div>
          <ElTag type="warning">Quản lý theo VIN</ElTag>
        </div>

        <div class="vin-dialog-table">
          <ElTable :data="activeVinRow.vehicles" border size="small" class="w-full">
            <ElTableColumn label="#" type="index" width="56" align="center" />
            <ElTableColumn label="Số khung (VIN)" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput v-model="vehicle.vinNumber" placeholder="Nhập số khung" clearable />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Số máy" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput v-model="vehicle.engineNumber" placeholder="Nhập số máy" clearable />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Biển số" min-width="180">
              <template #default="{ row: vehicle }">
                <ElInput
                  v-model="vehicle.licensePlate"
                  placeholder="Chưa có thì để trống"
                  clearable
                />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="vinDialogVisible = false">Đóng</ElButton>
          <ElButton type="primary" @click="vinDialogVisible = false">Xong</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Dialog Chi Tiết Phiếu Nhập -->
    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết phiếu nhập kho"
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
            <span class="ml-2 text-gray-700">{{ formatDateTime(detailData.createdAt) }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-500">Nhà cung cấp:</span>
            <span class="ml-2 font-medium text-gray-800">{{
              detailData.supplierName || 'N/A'
            }}</span>
          </div>
          <div v-if="detailData.supplierPhone">
            <span class="text-gray-500">Điện thoại NCC:</span>
            <span class="ml-2 text-gray-700">{{ detailData.supplierPhone }}</span>
          </div>
          <div v-if="detailData.supplierEmail">
            <span class="text-gray-500">Email NCC:</span>
            <span class="ml-2 text-gray-700">{{ detailData.supplierEmail }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200 pt-2 mt-1">
            <span class="text-gray-500 font-medium">Ghi chú (Có thể chỉnh sửa):</span>
            <ElInput
              v-model="detailNotes"
              type="textarea"
              :rows="2"
              placeholder="Nhập ghi chú cho phiếu nhập..."
              class="mt-1"
            />
          </div>
        </div>

        <div class="mt-2">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Danh sách sản phẩm nhập</h4>
          <ElTable :data="detailData.products" border size="small" class="w-full">
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn prop="name" label="Tên sản phẩm" minWidth="200" />
            <ElTableColumn prop="quantity" label="Số lượng" width="100" align="center" />
            <ElTableColumn prop="importPrice" label="Đơn giá nhập" width="160" align="right">
              <template #default="{ row }">
                <span>{{ formatCurrency(row.importPrice) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="180" align="right">
              <template #default="{ row }">
                <span class="font-medium text-gray-800">
                  {{ formatCurrency((row.quantity || 0) * (row.importPrice || 0)) }}
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="flex justify-end items-center gap-2 text-right mt-2">
          <span class="text-gray-500 text-sm">Tổng cộng tiền thanh toán:</span>
          <span class="text-xl font-bold text-primary">{{
            formatCurrency(detailData.totalPayable)
          }}</span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="detailDialogVisible = false">Đóng</ElButton>

          <template v-if="detailData">
            <!-- If receipt is working, we can update notes and change status -->
            <template v-if="isEditable(detailData.statusId)">
              <ElButton
                type="warning"
                :loading="detailSubmitting"
                @click="handleUpdateDetailStatus('working')"
              >
                Lưu tạm
              </ElButton>
              <ElDropdown trigger="hover" @command="handleUpdateDetailStatus">
                <ElButton type="primary" :loading="detailSubmitting">
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

            <!-- If receipt is finished or cancelled, status changes are blocked, only save notes -->
            <template v-else>
              <ElButton type="primary" :loading="detailSubmitting" @click="handleUpdateDetailNotes">
                Cập nhật ghi chú
              </ElButton>
            </template>
          </template>
        </div>
      </template>
    </ElDialog>

    <!-- Supplier Selector Dialog -->
    <ElDialog
      v-model="supplierSelectorVisible"
      title="Chọn nhà cung cấp"
      width="750px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <!-- Search bar -->
        <ElInput
          placeholder="Tìm theo tên nhà cung cấp hoặc số điện thoại..."
          clearable
          prefix-icon="Search"
          @input="handleSupplierSelectorSearch"
        />

        <!-- Grid of Suppliers -->
        <div
          v-loading="supplierSelectorLoading"
          class="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px] max-h-[450px] overflow-y-auto pr-1"
        >
          <div
            v-for="sup in supplierSelectorItems"
            :key="sup.id"
            class="p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition duration-200 cursor-pointer flex flex-col justify-between"
            @click="selectSupplier(sup)"
          >
            <div class="font-semibold text-gray-800 text-sm mb-1">{{ sup.name }}</div>
            <div class="text-xs text-gray-500 space-y-0.5">
              <div v-if="sup.phone" class="flex items-center gap-1">
                <span class="font-medium text-gray-400">SĐT:</span> {{ sup.phone }}
              </div>
              <div v-if="sup.email" class="flex items-center gap-1">
                <span class="font-medium text-gray-400">Email:</span> {{ sup.email }}
              </div>
              <div v-if="sup.address" class="flex items-center gap-1 line-clamp-1">
                <span class="font-medium text-gray-400">Địa chỉ:</span> {{ sup.address }}
              </div>
            </div>
          </div>
          <div
            v-if="!supplierSelectorLoading && supplierSelectorItems.length === 0"
            class="col-span-full flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy nhà cung cấp nào</span>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="supplierSelectorPage"
            v-model:page-size="supplierSelectorPageSize"
            :total="supplierSelectorTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="fetchSelectorSuppliers"
          />
        </div>
      </div>
    </ElDialog>

    <!-- Product Selector Dialog -->
    <ElDialog
      v-model="productSelectorVisible"
      title="Chọn sản phẩm & biến thể"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <!-- Search bar -->
        <ElInput
          placeholder="Tìm sản phẩm theo tên..."
          clearable
          prefix-icon="Search"
          @input="handleProductSelectorSearch"
        />

        <!-- Variant List -->
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
                    Variant ID: #{{ variant.id }}
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
                    {{ formatCurrency(variant.price ?? undefined) }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end">
                <ElSelect
                  v-if="variant.colors?.length"
                  v-model="selectedVariantColors[getVariantColorKey(variant)]"
                  placeholder="Chọn màu"
                  size="small"
                  class="variant-color-select"
                  style="width: 150px"
                  @click.stop
                >
                  <template #prefix>
                    <span
                      v-if="getSelectedVariantColor(variant)"
                      class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                      :style="{
                        backgroundColor: getSelectedVariantColor(variant)?.colorCode || '#ffffff'
                      }"
                    ></span>
                  </template>
                  <ElOption
                    v-for="color in variant.colors"
                    :key="color.id"
                    :label="getVariantColorLabel(color)"
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
                  Chọn
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

        <!-- Pagination -->
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
    InfoFilled
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useDebounceFn } from '@vueuse/core'
  import { InventoryReceiptApi } from '@/api/inventory-receipt.api'
  import { SupplierApi } from '@/api/supplier.api'
  import { ProductApi } from '@/api/product/product.api'
  import { Permissions } from '@/domain/constants/permissions'
  import type { InventoryReceipt, InputInfo } from '@/domain/inventory/receipt.types'
  import type { Supplier } from '@/domain/supplier/supplier.types'
  import type { ProductVariantLiteForInput } from '@/domain/product/product.types'

  defineOptions({ name: 'InventoryInput' })

  type VehicleIdentification = {
    vinNumber: string
    engineNumber: string
    licensePlate: string
  }

  type ReceiptProductRow = {
    id?: number
    productVarientId: number | undefined
    productVarientColorId?: number
    count: number
    inputPrice: number
    managementType?: string
    vehicles?: VehicleIdentification[]
  }

  const VIN_MANAGEMENT_TYPE = 'vin_number'

  // States
  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo phiếu nhập mới')
  const submitting = ref(false)
  const isEdit = ref(false)
  const vinDialogVisible = ref(false)
  const vinDialogRowIndex = ref<number | null>(null)
  const activeVinRow = computed(() => {
    if (vinDialogRowIndex.value === null) return null
    return formData.value.products[vinDialogRowIndex.value] ?? null
  })

  // Details dialog states
  const detailDialogVisible = ref(false)
  const detailData = ref<InventoryReceipt | null>(null)
  const detailNotes = ref('')
  const detailSubmitting = ref(false)

  // Static/Calculated dashboard metrics
  const stats = ref({
    totalVehicles: 0,
    processingReceipts: 0,
    totalValue: 0
  })

  // Dropdown Lists (Deprecated/Empty)
  const statuses = ref<Record<string, string>>({})

  // Caches for display names
  const supplierCache = reactive(new Map<number, string>())
  const productCache = reactive(
    new Map<number, { displayName: string; price?: number; managementType?: string }>()
  )

  const getSupplierNameById = (id?: number) => {
    if (!id) return ''
    return supplierCache.get(Number(id)) || `Nhà cung cấp #${id}`
  }

  const getProductNameById = (id?: number) => {
    if (!id) return ''
    return productCache.get(Number(id))?.displayName || `Sản phẩm #${id}`
  }

  const isVinManagedVariant = (variant: ProductVariantLiteForInput) => {
    return variant.managementType?.toLowerCase() === VIN_MANAGEMENT_TYPE
  }

  const getVariantColorLabel = (
    color: NonNullable<ProductVariantLiteForInput['colors']>[number]
  ) => {
    return color.colorName || `Màu #${color.id}`
  }

  const getSelectedVariantColor = (variant: ProductVariantLiteForInput) => {
    const selectedColorId = selectedVariantColors[getVariantColorKey(variant)]
    return variant.colors?.find((color) => color.id === selectedColorId)
  }

  const getVariantDisplayNameWithColor = (variant: ProductVariantLiteForInput) => {
    const displayName = variant.displayName || `Sản phẩm #${variant.id}`
    const selectedColor = getSelectedVariantColor(variant)
    if (!selectedColor) return displayName
    return `${displayName} - ${getVariantColorLabel(selectedColor)}`
  }

  const isVinManagedProduct = (row: ReceiptProductRow) => {
    return row.managementType?.toLowerCase() === VIN_MANAGEMENT_TYPE
  }

  const createEmptyVehicle = (): VehicleIdentification => ({
    vinNumber: '',
    engineNumber: '',
    licensePlate: ''
  })

  const syncVehicleRows = (row: ReceiptProductRow) => {
    if (!isVinManagedProduct(row)) {
      row.vehicles = undefined
      return
    }

    const targetCount = Math.max(Number(row.count) || 0, 0)
    const vehicles = row.vehicles ?? []
    while (vehicles.length < targetCount) {
      vehicles.push(createEmptyVehicle())
    }
    if (vehicles.length > targetCount) {
      vehicles.splice(targetCount)
    }
    row.vehicles = vehicles
  }

  const handleProductCountChange = (row: ReceiptProductRow) => {
    syncVehicleRows(row)
  }

  const getCompletedVehicleIdentityCount = (row: ReceiptProductRow) => {
    return (row.vehicles ?? []).filter(
      (vehicle) => vehicle.vinNumber?.trim() && vehicle.engineNumber?.trim()
    ).length
  }

  const getVehicleIdentityProgress = (row: ReceiptProductRow) => {
    return `${getCompletedVehicleIdentityCount(row)}/${row.count || 0}`
  }

  const openVinDialog = (rowIndex: number) => {
    const row = formData.value.products[rowIndex]
    if (!row || !isVinManagedProduct(row)) return
    syncVehicleRows(row)
    vinDialogRowIndex.value = rowIndex
    vinDialogVisible.value = true
  }

  // Supplier Selector Dialog States
  const supplierSelectorVisible = ref(false)
  const supplierSelectorLoading = ref(false)
  const supplierSelectorQuery = ref('')
  const supplierSelectorPage = ref(1)
  const supplierSelectorPageSize = ref(12)
  const supplierSelectorTotal = ref(0)
  const supplierSelectorItems = ref<Supplier[]>([])

  const fetchSelectorSuppliers = async () => {
    supplierSelectorLoading.value = true
    try {
      const filters = []
      if (supplierSelectorQuery.value.trim()) {
        filters.push(`Name@=${supplierSelectorQuery.value.trim()}`)
      }
      const res = await SupplierApi.getList({
        current: supplierSelectorPage.value,
        size: supplierSelectorPageSize.value,
        Filters: filters.join(',')
      })
      supplierSelectorItems.value = res.items || []
      supplierSelectorTotal.value = res.totalCount || 0

      // Cache the loaded suppliers
      res.items?.forEach((sup) => {
        if (sup.id) supplierCache.set(sup.id, sup.name)
      })
    } catch (err) {
      console.error('Failed to fetch selector suppliers:', err)
    } finally {
      supplierSelectorLoading.value = false
    }
  }

  const openSupplierSelector = () => {
    supplierSelectorQuery.value = ''
    supplierSelectorPage.value = 1
    supplierSelectorVisible.value = true
    fetchSelectorSuppliers()
  }

  const selectSupplier = (sup: Supplier) => {
    if (sup.id) {
      formData.value.supplierId = sup.id
      supplierCache.set(sup.id, sup.name)
    }
    supplierSelectorVisible.value = false
  }

  const handleSupplierSelectorSearch = useDebounceFn(async (query: string) => {
    supplierSelectorQuery.value = query
    supplierSelectorPage.value = 1
    await fetchSelectorSuppliers()
  }, 300)

  // Product Selector Dialog States
  const productSelectorVisible = ref(false)
  const productSelectorLoading = ref(false)
  const productSelectorQuery = ref('')
  const productSelectorPage = ref(1)
  const productSelectorPageSize = ref(10) // 10 products per page as requested
  const productSelectorTotal = ref(0)
  const productSelectorItems = ref<ProductVariantLiteForInput[]>([])
  const selectedVariantColors = reactive<Record<string, number | undefined>>({})
  const productSelectorActiveRowIndex = ref<number | null>(null)

  const getVariantColorKey = (variant: ProductVariantLiteForInput) => String(variant.id)

  const initializeVariantColorSelection = (variants: ProductVariantLiteForInput[]) => {
    variants.forEach((variant) => {
      const key = getVariantColorKey(variant)
      if (selectedVariantColors[key] || !variant.colors?.length) return
      selectedVariantColors[key] = variant.colors[0].id
    })
  }

  const fetchSelectorProducts = async () => {
    productSelectorLoading.value = true
    try {
      const filters = []
      if (productSelectorQuery.value.trim()) {
        filters.push(`search@=${productSelectorQuery.value.trim()}`)
      }
      const res = await ProductApi.getVariantsForInput({
        current: productSelectorPage.value,
        size: productSelectorPageSize.value,
        Filters: filters.join(',')
      })
      productSelectorItems.value = res.items || []
      initializeVariantColorSelection(productSelectorItems.value)
      productSelectorTotal.value = res.totalCount || 0
    } catch (err) {
      console.error('Failed to fetch selector products:', err)
    } finally {
      productSelectorLoading.value = false
    }
  }

  const openProductSelector = (rowIndex?: number) => {
    productSelectorActiveRowIndex.value = rowIndex !== undefined ? rowIndex : null
    productSelectorQuery.value = ''
    productSelectorPage.value = 1
    productSelectorVisible.value = true
    fetchSelectorProducts()
  }

  const selectProductVariant = (variant: ProductVariantLiteForInput) => {
    if (!variant.id) return
    const productVarientColorId = selectedVariantColors[getVariantColorKey(variant)]
    if (variant.colors?.length && !productVarientColorId) {
      ElMessage.warning('Vui lòng chọn màu cho biến thể sản phẩm này')
      return
    }

    const displayName = getVariantDisplayNameWithColor(variant)
    productCache.set(variant.id, {
      displayName,
      price: variant.price || 0,
      managementType: variant.managementType
    })

    if (productSelectorActiveRowIndex.value !== null) {
      // Update existing row
      const idx = productSelectorActiveRowIndex.value
      if (formData.value.products[idx]) {
        const row = formData.value.products[idx]
        row.productVarientId = variant.id
        row.productVarientColorId = productVarientColorId
        row.inputPrice = variant.price || 0
        row.managementType = variant.managementType
        syncVehicleRows(row)
      }
    } else {
      // Add new row (check if last row is empty first to reuse it)
      const products = formData.value.products
      const lastRow = products[products.length - 1]
      if (lastRow && lastRow.productVarientId === undefined) {
        lastRow.productVarientId = variant.id
        lastRow.productVarientColorId = productVarientColorId
        lastRow.inputPrice = variant.price || 0
        lastRow.managementType = variant.managementType
        syncVehicleRows(lastRow)
      } else {
        const newRow: ReceiptProductRow = {
          productVarientId: variant.id,
          productVarientColorId,
          count: 1,
          inputPrice: variant.price || 0,
          managementType: variant.managementType
        }
        syncVehicleRows(newRow)
        products.push(newRow)
      }
    }
    productSelectorVisible.value = false
  }

  const handleProductSelectorSearch = useDebounceFn(async (query: string) => {
    productSelectorQuery.value = query
    productSelectorPage.value = 1
    await fetchSelectorProducts()
  }, 300)

  // Form Data
  const formData = ref<{
    id?: number
    supplierId: number | undefined
    notes: string
    statusId: string
    products: ReceiptProductRow[]
  }>({
    supplierId: undefined,
    notes: '',
    statusId: 'working',
    products: []
  })

  // Table Data & Paging
  const data = ref<InventoryReceipt[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // Search items definition (Removed Mã phiếu filter)
  const searchForm = ref({
    supplierName: '',
    statusId: [] as string[]
  })

  const searchItems = computed(() => [
    {
      key: 'supplierName',
      label: 'Nhà cung cấp',
      type: 'input',
      props: { placeholder: 'Tìm theo tên nhà cung cấp...' }
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
        options: Object.entries(statuses.value).map(([key, value]) => ({
          label: value,
          value: key
        }))
      }
    }
  ])

  // Columns definition (Removed Mã phiếu, added STT)
  const columns = ref([
    { label: 'STT', type: 'index' as const, width: 70, align: 'center' },
    { label: 'Thời gian tạo', prop: 'createdAt', useSlot: true, width: 170 },
    { label: 'Nhà cung cấp', prop: 'supplierName', minWidth: 180 },
    { label: 'Tóm tắt SP', prop: 'productSummary', useSlot: true, minWidth: 200 },
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

  // Computed total payable for form
  const totalAmount = computed(() => {
    return formData.value.products.reduce(
      (sum, row) => sum + (row.count || 0) * (row.inputPrice || 0),
      0
    )
  })

  // Editable rule
  const isEditable = (statusId?: string) => {
    return statusId === 'working'
  }

  // Formatting helpers
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 đ'
    return val.toLocaleString('vi-VN') + ' đ'
  }

  const getStatusLabel = (statusId?: string) => {
    if (!statusId) return '-'
    return statuses.value[statusId] || statusId
  }

  const getStatusTagType = (statusId?: string) => {
    if (!statusId) return 'info'
    switch (statusId.toLowerCase()) {
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

  const getProductSummaryText = (products?: InputInfo[]) => {
    if (!products || products.length === 0) return 'Không có sản phẩm'
    return products.map((p) => `${p.name} (SL: ${p.quantity})`).join(', ')
  }

  // Load backend configuration & list data
  const loadStatuses = async () => {
    try {
      statuses.value = await InventoryReceiptApi.getStatuses()
    } catch (error) {
      console.error('Failed to load statuses:', error)
      statuses.value = {
        working: 'Phiếu tạm',
        finished: 'Hoàn thành',
        cancelled: 'Đã hủy'
      }
    }
  }

  const loadStats = async () => {
    try {
      const res = await InventoryReceiptApi.getStats()
      stats.value = {
        totalVehicles: res.totalVehicles || 0,
        processingReceipts: res.processingReceipts || 0,
        totalValue: res.totalValue || 0
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadData = async () => {
    await loadDataWithFilters(searchForm.value)
  }

  const loadDataWithFilters = async (filters?: any) => {
    loading.value = true
    try {
      const sieveFilters = []
      if (filters?.supplierName) {
        sieveFilters.push(`SupplierName@=${filters.supplierName}`)
      }
      if (filters?.statusId && filters.statusId.length > 0) {
        if (Array.isArray(filters.statusId)) {
          sieveFilters.push(`StatusId==${filters.statusId.join('|')}`)
        } else {
          sieveFilters.push(`StatusId==${filters.statusId}`)
        }
      }

      const params = {
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined,
        Sorts: '-createdAt'
      }

      const res = await InventoryReceiptApi.getList(params)
      data.value = res.items || []
      pagination.total = res.totalCount || 0
      await loadStats()
    } catch (error) {
      console.error('Failed to load inventory receipts:', error)
      ElMessage.error('Không thể tải danh sách phiếu nhập kho')
    } finally {
      loading.value = false
    }
  }

  // Handlers
  const handleSearch = (filters: any) => {
    pagination.current = 1
    loadDataWithFilters(filters)
  }

  const handleReset = () => {
    pagination.current = 1
    loadDataWithFilters()
  }

  const refreshData = () => {
    loadData()
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadData()
  }

  const handleCurrentChange = (page: number) => {
    pagination.current = page
    loadData()
  }

  // Row actions
  const handleViewDetail = async (row: InventoryReceipt) => {
    try {
      loading.value = true
      const res = await InventoryReceiptApi.getById(row.id)
      detailData.value = res
      detailNotes.value = res.notes || ''
      detailDialogVisible.value = true
    } catch (error) {
      console.error('Failed to load receipt details:', error)
      ElMessage.error('Không thể tải chi tiết phiếu nhập')
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    isEdit.value = false
    dialogTitle.value = 'Tạo phiếu nhập mới'
    formData.value = {
      supplierId: undefined,
      notes: '',
      statusId: 'working',
      products: []
    }
    dialogVisible.value = true
  }

  const handleEdit = async (row: InventoryReceipt) => {
    try {
      loading.value = true
      const receipt = await InventoryReceiptApi.getById(row.id)
      isEdit.value = true
      dialogTitle.value = 'Cập nhật phiếu nhập'

      // Cache supplier name
      if (receipt.supplierId && receipt.supplierName) {
        supplierCache.set(receipt.supplierId, receipt.supplierName)
      }

      // Cache product names
      ;(receipt.products || []).forEach((p) => {
        productCache.set(p.productVarientId, {
          displayName: p.name || `Sản phẩm #${p.productVarientId}`,
          price: p.importPrice
        })
      })

      formData.value = {
        id: receipt.id,
        supplierId: receipt.supplierId,
        notes: receipt.notes || '',
        statusId: receipt.statusId,
        products: (receipt.products || []).map((p) => ({
          id: p.id,
          productVarientId: p.productVarientId,
          productVarientColorId: p.productVarientColorId,
          count: p.quantity || 1,
          inputPrice: p.importPrice || 0
        }))
      }
      dialogVisible.value = true
    } catch (error) {
      console.error('Failed to load receipt details for editing:', error)
      ElMessage.error('Không thể tải chi tiết phiếu nhập')
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (row: InventoryReceipt) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa phiếu nhập của nhà cung cấp "${row.supplierName}" tạo ngày ${formatDateTime(row.createdAt)}?`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await InventoryReceiptApi.delete(row.id)
      ElMessage.success('Xóa phiếu nhập thành công')
      loadData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete receipt:', error)
        ElMessage.error('Xóa phiếu nhập thất bại')
      }
    }
  }

  // Details dialog actions
  const handleUpdateDetailStatus = async (statusId: string) => {
    if (!detailData.value) return

    if (statusId === 'finished') {
      try {
        await ElMessageBox.confirm(
          'Bạn có chắc chắn muốn hoàn thành phiếu nhập này không? Sau khi hoàn thành, số lượng sản phẩm sẽ được cộng vào kho và không thể chỉnh sửa thông tin phiếu nhập nữa.',
          'Xác nhận hoàn thành',
          {
            confirmButtonText: 'Hoàn thành',
            cancelButtonText: 'Hủy',
            type: 'success'
          }
        )
      } catch {
        return
      }
    } else if (statusId === 'cancelled') {
      try {
        await ElMessageBox.confirm(
          'Bạn có chắc chắn muốn hủy phiếu nhập này không? Sau khi hủy, phiếu nhập sẽ ở trạng thái đã hủy và không thể khôi phục hoặc chỉnh sửa.',
          'Xác nhận hủy phiếu',
          {
            confirmButtonText: 'Hủy phiếu',
            cancelButtonText: 'Đóng',
            type: 'warning'
          }
        )
      } catch {
        return
      }
    }

    detailSubmitting.value = true
    try {
      // 1. Update notes
      await InventoryReceiptApi.updateNotes(detailData.value.id, detailNotes.value)
      // 2. Update status
      await InventoryReceiptApi.updateStatus(detailData.value.id, statusId)
      ElMessage.success('Cập nhật phiếu nhập thành công')
      detailDialogVisible.value = false
      loadData()
    } catch (error: any) {
      console.error('Failed to update details status:', error)
      ElMessage.error(error.message || 'Cập nhật thất bại')
    } finally {
      detailSubmitting.value = false
    }
  }

  const handleUpdateDetailNotes = async () => {
    if (!detailData.value) return
    detailSubmitting.value = true
    try {
      await InventoryReceiptApi.updateNotes(detailData.value.id, detailNotes.value)
      ElMessage.success('Cập nhật ghi chú thành công')
      detailDialogVisible.value = false
      loadData()
    } catch (error: any) {
      console.error('Failed to update notes:', error)
      ElMessage.error(error.message || 'Cập nhật thất bại')
    } finally {
      detailSubmitting.value = false
    }
  }

  // Row products table handlers
  const handleAddProductRow = () => {
    openProductSelector()
  }

  const handleRemoveProductRow = (index: number) => {
    if (formData.value.products.length <= 1) {
      ElMessage.warning('Phiếu nhập phải chứa ít nhất một sản phẩm')
      return
    }
    formData.value.products.splice(index, 1)
  }

  // Submit
  const submitForm = async (statusId: string) => {
    if (!formData.value.supplierId) {
      ElMessage.warning('Vui lòng chọn nhà cung cấp')
      return
    }

    const validProducts = formData.value.products.filter(
      (p) => p.productVarientId !== undefined && p.productVarientId !== null
    )

    if (validProducts.length === 0) {
      ElMessage.warning('Vui lòng thêm ít nhất một sản phẩm hợp lệ')
      return
    }

    for (const product of validProducts) {
      if (!isVinManagedProduct(product)) continue

      syncVehicleRows(product)
      const vehicles = product.vehicles ?? []
      if (vehicles.length !== product.count) {
        ElMessage.warning('Số dòng định danh xe phải đúng bằng số lượng nhập')
        return
      }

      const hasMissingRequiredCode = vehicles.some(
        (vehicle) => !vehicle.vinNumber?.trim() || !vehicle.engineNumber?.trim()
      )
      if (hasMissingRequiredCode) {
        ElMessage.warning('Vui lòng nhập đủ số khung (VIN) và số máy cho sản phẩm quản lý theo VIN')
        return
      }

      const normalizedVins = vehicles.map((vehicle) => vehicle.vinNumber.trim().toLowerCase())
      const normalizedEngines = vehicles.map((vehicle) => vehicle.engineNumber.trim().toLowerCase())
      if (new Set(normalizedVins).size !== normalizedVins.length) {
        ElMessage.warning('Số khung (VIN) bị trùng trong cùng dòng sản phẩm')
        return
      }
      if (new Set(normalizedEngines).size !== normalizedEngines.length) {
        ElMessage.warning('Số máy bị trùng trong cùng dòng sản phẩm')
        return
      }
    }

    if (statusId === 'finished') {
      try {
        await ElMessageBox.confirm(
          'Bạn có chắc chắn muốn hoàn thành phiếu nhập này không? Sau khi hoàn thành, số lượng sản phẩm sẽ được cộng vào kho và không thể chỉnh sửa thông tin phiếu nhập nữa.',
          'Xác nhận hoàn thành',
          {
            confirmButtonText: 'Hoàn thành',
            cancelButtonText: 'Hủy',
            type: 'success'
          }
        )
      } catch {
        return
      }
    } else if (statusId === 'cancelled') {
      try {
        await ElMessageBox.confirm(
          'Bạn có chắc chắn muốn hủy phiếu nhập này không? Sau khi hủy, phiếu nhập sẽ ở trạng thái đã hủy và không thể khôi phục hoặc chỉnh sửa.',
          'Xác nhận hủy phiếu',
          {
            confirmButtonText: 'Hủy phiếu',
            cancelButtonText: 'Đóng',
            type: 'warning'
          }
        )
      } catch {
        return
      }
    }

    submitting.value = true
    try {
      const payloadProducts = validProducts.map((p) => ({
        id: p.id,
        productVarientId: p.productVarientId!,
        productVarientColorId: p.productVarientColorId,
        count: p.count,
        inputPrice: p.inputPrice,
        vehicles: isVinManagedProduct(p)
          ? p.vehicles?.map((vehicle) => ({
              vinNumber: vehicle.vinNumber.trim(),
              engineNumber: vehicle.engineNumber.trim(),
              licensePlate: vehicle.licensePlate?.trim() || undefined
            }))
          : undefined
      }))

      if (isEdit.value && formData.value.id) {
        const payload = {
          notes: formData.value.notes,
          statusId: statusId,
          supplierId: formData.value.supplierId,
          products: payloadProducts
        }
        await InventoryReceiptApi.update(formData.value.id, payload)
        ElMessage.success('Cập nhật phiếu nhập thành công')
      } else {
        const payload = {
          notes: formData.value.notes,
          statusId: 'working', // Initial creation status is always working
          supplierId: formData.value.supplierId,
          products: payloadProducts.map(
            ({ productVarientId, productVarientColorId, count, inputPrice, vehicles }) => ({
              productVarientId,
              productVarientColorId,
              count,
              inputPrice,
              vehicles
            })
          )
        }
        await InventoryReceiptApi.create(payload)
        ElMessage.success('Tạo phiếu nhập thành công')
      }
      dialogVisible.value = false
      loadData()
    } catch (error: any) {
      console.error('Failed to save receipt:', error)
      ElMessage.error(error.message || 'Không thể lưu phiếu nhập')
    } finally {
      submitting.value = false
    }
  }

  // Lifecycle
  onMounted(async () => {
    loading.value = true
    await Promise.all([loadStatuses()])
    await loadData()
  })
</script>

<style scoped>
  :deep(.el-table) {
    --el-table-header-bg-color: var(--el-fill-color-light);
  }

  :deep(.vin-identification-dialog) {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 4vh);
    margin-bottom: 2vh;
    overflow: hidden;
  }

  :deep(.vin-identification-dialog .el-dialog__body) {
    flex: 1;
    min-height: 0;
    padding-top: 12px;
    padding-bottom: 12px;
    overflow: hidden;
  }

  :deep(.vin-identification-dialog .el-dialog__footer) {
    flex-shrink: 0;
  }

  .vin-dialog-table {
    max-height: calc(100vh - 250px);
    overflow: auto;
  }
</style>
